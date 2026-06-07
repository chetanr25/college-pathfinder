"""Share routes OG meta HTML + dynamic OG image (PNG) for rich link previews."""

import io
import os
from typing import List, Optional

from fastapi import APIRouter, Query, Request
from fastapi.responses import HTMLResponse, StreamingResponse

from app.services import CollegeService

router = APIRouter(prefix="/share", tags=["share"])

FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173")

# ── Helpers ──────────────────────────────────────────────────────────────────

def _esc(s: str) -> str:
    return (
        s.replace("&", "&amp;")
        .replace('"', "&quot;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def _fetch_data(rank: int, round: int, branches: Optional[List[str]]):
    """Return (preview_colleges[:5], total_count)."""
    if branches:
        preview = CollegeService.search_colleges(
            min_rank=rank, max_rank=None, branches=branches,
            round=round, limit=5, sort_order="asc",
        )
        total = CollegeService.search_colleges(
            min_rank=rank, max_rank=None, branches=branches,
            round=round, limit=500, sort_order="asc",
        )
    else:
        preview = CollegeService.get_colleges_by_rank(rank, round, 5, "asc")
        total = CollegeService.get_colleges_by_rank(rank, round, 500, "asc")
    return preview, len(total)


def _get_font(size: int, bold: bool = False):
    """Return a PIL ImageFont, trying real TTF fonts before the built-in fallback."""
    from PIL import ImageFont

    candidates = []
    if bold:
        candidates = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/usr/share/fonts/truetype/ubuntu/Ubuntu-B.ttf",
            "/Library/Fonts/Arial Bold.ttf",
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        ]
    else:
        candidates = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
            "/usr/share/fonts/truetype/ubuntu/Ubuntu-R.ttf",
            "/Library/Fonts/Arial.ttf",
            "/System/Library/Fonts/Supplemental/Arial.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
        ]

    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue

    # Built-in bitmap fallback (Pillow 10.1+ supports size=)
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()


def _lerp_color(c1: tuple, c2: tuple, t: float) -> tuple:
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def _text_width(font, text: str) -> int:
    if hasattr(font, "getlength"):
        return int(font.getlength(text))
    # fallback for bitmap fonts
    return len(text) * (getattr(font, "size", 14) // 2 + 2)


def _pill(draw, x: int, y: int, text: str, font, pad_x: int = 16, pad_v: int = 8):
    """Draw a rounded pill with semi-transparent-looking background."""
    fsize = getattr(font, "size", 24)
    tw = _text_width(font, text)
    rw = tw + pad_x * 2
    rh = fsize + pad_v * 2
    r = rh // 2
    draw.rounded_rectangle(
        [x, y, x + rw, y + rh], radius=r,
        fill=(110, 86, 207),       # solid purple that looks "glassy" on gradient bg
        outline=(167, 139, 250), width=1,
    )
    draw.text((x + pad_x, y + pad_v), text, font=font, fill=(230, 220, 255))
    return rw + 10


def _generate_og_image(
    rank: int,
    round: int,
    branches: Optional[List[str]],
    colleges: list,
    total_count: int,
) -> bytes:
    from PIL import Image, ImageDraw

    W, H = 1200, 630
    # Use plain RGB no alpha compositing headaches
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)

    # ── Gradient background (diagonal: top-left indigo → bottom-right purple) ──
    top_l = (49, 46, 129)   # #312E81
    bot_r = (109, 40, 217)  # #6D28D9
    for y in range(H):
        for x in range(0, W, 2):  # step=2 for speed; fill with line below
            t = (x / W * 0.4 + y / H * 0.6)
            draw.point((x, y), fill=_lerp_color(top_l, bot_r, t))
            if x + 1 < W:
                draw.point((x + 1, y), fill=_lerp_color(top_l, bot_r, t))

    # Left accent stripe
    for x in range(8):
        for y in range(H):
            t = y / H
            draw.point((x, y), fill=_lerp_color((129, 140, 248), (167, 139, 250), t))

    PAD = 72

    f_brand   = _get_font(26)
    f_huge    = _get_font(80, bold=True)
    f_large   = _get_font(44, bold=True)
    f_pill    = _get_font(24)
    f_college = _get_font(28, bold=True)
    f_meta    = _get_font(24)
    f_num     = _get_font(20, bold=True)
    f_footer  = _get_font(22)

    # ── Brand line ──────────────────────────────────────────────
    draw.text((PAD, 52), "College Path Finder", font=f_brand, fill=(199, 210, 254))
    dot_x = PAD + _text_width(f_brand, "College Path Finder") + 14
    draw.text((dot_x, 52), f"· KCET 2025  ·  Round {round}", font=f_brand, fill=(148, 130, 220))

    # ── Rank headline ───────────────────────────────────────────
    draw.text((PAD, 110), f"Rank {rank:,}", font=f_huge, fill=(255, 255, 255))

    # ── Eligible count ──────────────────────────────────────────
    draw.text((PAD, 215), f"{total_count} Colleges Eligible", font=f_large, fill=(196, 181, 253))

    # ── Branch pills ────────────────────────────────────────────
    pill_x = PAD
    pill_y = 283
    shown_branches = (branches or [])[:3]
    if not shown_branches:
        _pill(draw, pill_x, pill_y, "All Branches", f_pill)
    else:
        for b in shown_branches:
            pill_x += _pill(draw, pill_x, pill_y, b, f_pill)
        if branches and len(branches) > 3:
            _pill(draw, pill_x, pill_y, f"+{len(branches) - 3} more", f_pill)

    # ── Divider ─────────────────────────────────────────────────
    draw.rectangle([PAD, 360, W - PAD, 362], fill=(130, 110, 200))

    # ── Top colleges ────────────────────────────────────────────
    row_y = 378
    row_gap = 72
    num_bg = [(180, 140, 20), (140, 140, 150), (160, 120, 10)]  # gold, silver, bronze-ish

    for i, c in enumerate(colleges[:3]):
        ny = row_y + i * row_gap

        # Number circle
        circ_r = 18
        cx, cy = PAD + circ_r, ny + circ_r + 2
        draw.ellipse(
            [cx - circ_r, cy - circ_r, cx + circ_r, cy + circ_r],
            fill=num_bg[i],
        )
        num_str = str(i + 1)
        nw = _text_width(f_num, num_str)
        draw.text((cx - nw // 2, cy - getattr(f_num, "size", 20) // 2), num_str,
                  font=f_num, fill=(255, 255, 255))

        # College name
        name = c.get("college_name", "")
        if len(name) > 46:
            name = name[:43] + "..."
        draw.text((PAD + 50, ny), name, font=f_college, fill=(255, 255, 255))

        # Branch + cutoff
        branch = c.get("branch_name", "")
        cutoff = c.get("cutoff_rank")
        meta = f"{branch}  ·  Cutoff: {cutoff:,}" if cutoff else branch
        draw.text((PAD + 50, ny + 34), meta, font=f_meta, fill=(196, 181, 253))

    # ── Footer URL ───────────────────────────────────────────────
    footer_text = "collegepathfinder.app/predictor"
    fw = _text_width(f_footer, footer_text)
    draw.text((W - PAD - fw, H - 52), footer_text, font=f_footer, fill=(130, 110, 200))

    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


# ── Routes ───────────────────────────────────────────────────────────────────

@router.get("/image")
async def share_predictor_image(
    rank: int = Query(..., gt=0),
    round: int = Query(1, ge=1, le=3),
    branches: Optional[List[str]] = Query(None),
):
    """Returns a 1200×630 PNG for use as the og:image in link previews."""
    colleges, total_count = _fetch_data(rank, round, branches)
    png = _generate_og_image(rank, round, branches, colleges, total_count)
    return StreamingResponse(
        io.BytesIO(png),
        media_type="image/png",
        headers={"Cache-Control": "public, max-age=300"},
    )


@router.get("", response_class=HTMLResponse, include_in_schema=False)
async def share_predictor_results(
    request: Request,
    rank: int = Query(..., gt=0),
    round: int = Query(1, ge=1, le=3),
    limit: int = Query(10, ge=1, le=500),
    branches: Optional[List[str]] = Query(None),
):
    """
    Returns an HTML page with Open Graph + Twitter Card meta tags so messaging
    apps render a rich preview card. Immediately redirects humans to the
    frontend predictor with the same query params.
    """
    colleges, total_count = _fetch_data(rank, round, branches)

    # Build frontend redirect URL
    params = [f"rank={rank}", f"round={round}", f"limit={limit}"]
    if branches:
        params += [f"branches={b}" for b in branches]
    frontend_url = f"{FRONTEND_BASE_URL}/predictor?{'&'.join(params)}"

    # Reconstruct the public base URL, respecting reverse-proxy / tunnel headers
    proto = (
        request.headers.get("x-forwarded-proto")
        or request.headers.get("x-scheme")
        or request.url.scheme
    )
    host = (
        request.headers.get("x-forwarded-host")
        or request.headers.get("host")
        or request.url.netloc
    )
    public_base = f"{proto}://{host}"

    # OG image URL (absolute, must be reachable by WhatsApp / Telegram servers)
    img_params = [f"rank={rank}", f"round={round}"]
    if branches:
        img_params += [f"branches={b}" for b in branches]
    image_url = f"{public_base}/share/image?" + "&".join(img_params)

    # OG title
    branch_str = ""
    if branches:
        shown = branches[:2]
        branch_str = " | " + ", ".join(shown)
        if len(branches) > 2:
            branch_str += f" +{len(branches) - 2}"
    og_title = f"KCET Rank {rank:,} - {total_count} Colleges Eligible (Round {round}{branch_str})"

    # OG description
    medals = ["🥇", "🥈", "🥉"]
    lines = []
    for i, c in enumerate(colleges[:3]):
        name = c.get("college_name", "")[:45]
        branch = c.get("branch_name", "")
        cutoff = c.get("cutoff_rank")
        cutoff_str = f"{cutoff:,}" if cutoff else "N/A"
        lines.append(f"{medals[i]} {name} - {branch} (Cutoff: {cutoff_str})")
    og_desc = (
        f"For KCET Rank {rank:,} in Round {round}: {total_count} eligible colleges! "
        + " | ".join(lines)
        + " · Check College Path Finder for your full list."
    )

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{_esc(og_title)}</title>
  <meta name="description" content="{_esc(og_desc)}">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="{_esc(frontend_url)}">
  <meta property="og:title" content="{_esc(og_title)}">
  <meta property="og:description" content="{_esc(og_desc)}">
  <meta property="og:image" content="{_esc(image_url)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="College Path Finder">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{_esc(og_title)}">
  <meta name="twitter:description" content="{_esc(og_desc)}">
  <meta name="twitter:image" content="{_esc(image_url)}">

  <!-- Redirect humans immediately -->
  <meta http-equiv="refresh" content="0;url={_esc(frontend_url)}">

  <style>
    *{{box-sizing:border-box;margin:0;padding:0}}
    body{{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#3730A3;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}}
    .card{{background:rgba(255,255,255,0.1);backdrop-filter:blur(10px);border-radius:20px;padding:32px;max-width:480px;width:100%;text-align:center;border:1px solid rgba(255,255,255,0.2)}}
    .icon{{font-size:2.5rem;margin-bottom:12px}}
    h1{{font-size:1.25rem;font-weight:700;color:#fff;margin-bottom:8px}}
    p{{color:rgba(255,255,255,0.7);font-size:0.9rem;margin-bottom:16px}}
    a{{color:#A5B4FC;font-weight:600;text-decoration:none}}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🎓</div>
    <h1>College Path Finder</h1>
    <p>Redirecting to your college results…</p>
    <p><a href="{_esc(frontend_url)}">Click here if not redirected</a></p>
  </div>
</body>
</html>"""

    return HTMLResponse(content=html)
