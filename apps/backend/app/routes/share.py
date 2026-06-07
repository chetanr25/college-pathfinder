"""Share routes OG meta HTML + dynamic OG image (PNG) for rich link previews."""

import io
import os
from typing import List, Optional

from fastapi import APIRouter, Query, Request
from fastapi.responses import HTMLResponse, StreamingResponse

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
    count: int,
) -> bytes:
    """
    Generate the OG image entirely from URL params — no DB query, fast render.
    Uses horizontal line drawing (630 ops) instead of pixel-by-pixel (378k ops).
    """
    from PIL import Image, ImageDraw

    W, H = 1200, 630
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)

    # ── Background: fast top-to-bottom gradient (630 horizontal lines) ──────
    top = (49, 46, 129)   # #312E81 deep indigo
    bot = (88, 28, 135)   # #581C87 deep purple
    for y in range(H):
        draw.line([(0, y), (W, y)], fill=_lerp_color(top, bot, y / H))

    # Left accent bar
    for y in range(H):
        draw.line([(0, y), (7, y)], fill=_lerp_color((129, 140, 248), (167, 139, 250), y / H))

    PAD = 72

    f_brand  = _get_font(26)
    f_huge   = _get_font(88, bold=True)
    f_large  = _get_font(48, bold=True)
    f_pill   = _get_font(26)
    f_sub    = _get_font(32)
    f_footer = _get_font(22)

    # ── Brand line ──────────────────────────────────────────────────────────
    draw.text((PAD, 50), "College Path Finder", font=f_brand, fill=(199, 210, 254))
    dot_x = PAD + _text_width(f_brand, "College Path Finder") + 16
    draw.text((dot_x, 50), f"· KCET 2025", font=f_brand, fill=(148, 130, 220))

    # ── Rank headline ───────────────────────────────────────────────────────
    draw.text((PAD, 105), f"Rank {rank:,}", font=f_huge, fill=(255, 255, 255))

    # ── Eligible count ──────────────────────────────────────────────────────
    count_text = f"{count} College{'s' if count != 1 else ''} Eligible"
    draw.text((PAD, 220), count_text, font=f_large, fill=(196, 181, 253))

    # ── Round badge + branch pills ───────────────────────────────────────────
    pill_x = PAD
    pill_y = 295
    pill_x += _pill(draw, pill_x, pill_y, f"Round {round}", f_pill)
    shown = (branches or [])[:2]
    if not shown:
        _pill(draw, pill_x, pill_y, "All Branches", f_pill)
    else:
        for b in shown:
            pill_x += _pill(draw, pill_x, pill_y, b, f_pill)
        if branches and len(branches) > 2:
            _pill(draw, pill_x, pill_y, f"+{len(branches) - 2} more", f_pill)

    # ── Divider ─────────────────────────────────────────────────────────────
    draw.rectangle([PAD, 380, W - PAD, 382], fill=(100, 80, 180))

    # ── CTA text ────────────────────────────────────────────────────────────
    draw.text((PAD, 410), "Find colleges you're eligible for at", font=f_sub, fill=(167, 139, 250))
    draw.text((PAD, 460), "collegepathfinder.chetanr25.in", font=_get_font(36, bold=True), fill=(255, 255, 255))

    # ── Decorative large rank echo (right side, faded) ───────────────────────
    f_watermark = _get_font(180, bold=True)
    wm = f"#{rank:,}"
    ww = _text_width(f_watermark, wm)
    draw.text((W - PAD - ww, H // 2 - 90), wm, font=f_watermark, fill=(80, 60, 160))

    # ── Footer ───────────────────────────────────────────────────────────────
    footer = "Powered by College Path Finder · KCET 2025 Cutoff Data"
    fw = _text_width(f_footer, footer)
    draw.text((W // 2 - fw // 2, H - 46), footer, font=f_footer, fill=(110, 90, 180))

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90, optimize=True)
    return buf.getvalue()


# ── Routes ───────────────────────────────────────────────────────────────────

@router.get("/image")
async def share_predictor_image(
    rank: int = Query(..., gt=0),
    round: int = Query(1, ge=1, le=3),
    count: int = Query(0, ge=0),          # passed by frontend — exact result count
    branches: Optional[List[str]] = Query(None),
):
    """
    Returns a 1200×630 JPEG for use as the og:image in link previews.
    No DB query — renders entirely from URL params for maximum speed.
    """
    jpg = _generate_og_image(rank, round, branches, count)
    return StreamingResponse(
        io.BytesIO(jpg),
        media_type="image/jpeg",
        headers={"Cache-Control": "public, max-age=3600"},
    )


@router.get("", response_class=HTMLResponse, include_in_schema=False)
async def share_predictor_results(
    request: Request,
    rank: int = Query(..., gt=0),
    round: int = Query(1, ge=1, le=3),
    limit: int = Query(10, ge=1, le=500),
    count: int = Query(0, ge=0),          # passed by frontend — exact result count
    branches: Optional[List[str]] = Query(None),
):
    """
    Returns an HTML page with Open Graph + Twitter Card meta tags so messaging
    apps render a rich preview card. Immediately redirects humans to the
    frontend predictor with the same query params.
    """
    # Build frontend redirect URL (without count — it's only for OG metadata)
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

    # OG image URL — passes count so image renders instantly, no DB query
    img_params = [f"rank={rank}", f"round={round}", f"count={count}"]
    if branches:
        img_params += [f"branches={b}" for b in branches]
    image_url = f"{public_base}/share/image?" + "&".join(img_params)

    # OG title — use count from frontend, always accurate
    branch_str = ""
    if branches:
        shown = branches[:2]
        branch_str = " | " + ", ".join(shown)
        if len(branches) > 2:
            branch_str += f" +{len(branches) - 2}"
    og_title = f"KCET Rank {rank:,} - {count} Colleges Eligible (Round {round}{branch_str})"

    # OG description — no DB query, built from params
    branch_desc = ", ".join(branches[:2]) if branches else "all branches"
    if branches and len(branches) > 2:
        branch_desc += f" and {len(branches) - 2} more"
    og_desc = (
        f"Found {count} colleges eligible for KCET Rank {rank:,} in Round {round} "
        f"({branch_desc}). Check College Path Finder to see the full list and find your best options."
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
