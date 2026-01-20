from dataclasses import dataclass
from typing import Dict, List, Optional

from app.ai.intent_extractor import intent_extractor
from app.exceptions import CollegeNotFoundError, NoDataFoundError
from app.services import CollegeService


@dataclass
class RouterResult:
    handled: bool
    response: Optional[str] = None
    intent: Optional[str] = None
    params: Optional[Dict] = None
    error: Optional[str] = None
    needs_gemini: bool = False


class ResponseTemplates:
    @staticmethod
    def format_number(num: int) -> str:
        if num is None:
            return "-"
        return f"{num:,}"

    @staticmethod
    def get_chance_indicator(rank: int, cutoff: int) -> str:
        if rank is None or cutoff is None:
            return "-"
        margin = cutoff - rank
        if margin <= 2000:
            return "High"
        elif margin <= 5000:
            return "Good"
        elif margin <= 10000:
            return "Moderate"
        else:
            return "Low"

    @staticmethod
    def colleges_by_rank(
        colleges: List[Dict],
        rank: int,
        round_num: int,
        limit: int,
        branches: List[str] = None,
    ) -> str:
        if not colleges:
            branch_text = f" for {', '.join(branches)}" if branches else ""
            return f"No colleges found for rank {ResponseTemplates.format_number(rank)}{branch_text} in Round {round_num}."

        total = len(colleges)
        branch_text = ""
        if branches:
            if len(branches) == 1:
                branch_text = f" ({branches[0]})"
            else:
                branch_text = f" ({len(branches)} branches)"

        lines = [
            f"Found {total} college options for rank {ResponseTemplates.format_number(rank)}{branch_text} (Round {round_num}):",
            "",
            "| # | College | Branch | Cutoff | Chance |",
            "|---|---------|--------|--------|--------|",
        ]

        display_limit = min(limit, len(colleges))
        for i, college in enumerate(colleges[:display_limit], 1):
            name = college.get("college_name", "Unknown")
            if len(name) > 40:
                name = name[:37] + "..."
            branch = college.get("branch_name", "Unknown")
            if len(branch) > 25:
                branch = branch[:22] + "..."
            cutoff = college.get("cutoff_rank", 0)
            chance = ResponseTemplates.get_chance_indicator(rank, cutoff)
            lines.append(
                f"| {i} | {name} | {branch} | {ResponseTemplates.format_number(cutoff)} | {chance} |"
            )

        if total > display_limit:
            lines.append(f"\n*Showing {display_limit} of {total} options.*")

        return "\n".join(lines)

    @staticmethod
    def colleges_by_branch(
        colleges: List[Dict], branch: str, round_num: int, limit: int
    ) -> str:
        if not colleges:
            return f"No colleges found offering {branch} in Round {round_num}."

        total = len(colleges)
        lines = [
            f"Found {total} colleges offering {branch} (Round {round_num}):",
            "",
            "| # | College | Cutoff Rank |",
            "|---|---------|-------------|",
        ]

        display_limit = min(limit, len(colleges))
        for i, college in enumerate(colleges[:display_limit], 1):
            name = college.get("college_name", "Unknown")
            if len(name) > 45:
                name = name[:42] + "..."
            cutoff = college.get("cutoff_rank", 0)
            lines.append(
                f"| {i} | {name} | {ResponseTemplates.format_number(cutoff)} |"
            )

        if total > display_limit:
            lines.append(f"\n*Showing {display_limit} of {total} colleges.*")

        return "\n".join(lines)

    @staticmethod
    def all_branches(branches: List[str]) -> str:
        if not branches:
            return "No branches found in the database."

        lines = [
            f"Available Engineering Branches ({len(branches)} total):",
            "",
        ]

        for i, branch in enumerate(branches, 1):
            lines.append(f"{i}. {branch}")

        return "\n".join(lines)

    @staticmethod
    def college_info(info: Dict) -> str:
        college_name = info.get("college_name", "Unknown")
        branches = info.get("branches", [])

        if not branches:
            return f"No branch information found for {college_name}."

        lines = [
            f"**{college_name}**",
            f"Total Branches: {len(branches)}",
            "",
            "| Branch | Round 1 | Round 2 | Round 3 |",
            "|--------|---------|---------|---------|",
        ]

        for branch in branches:
            name = branch.get("branch_name", "Unknown")
            if len(name) > 35:
                name = name[:32] + "..."
            cutoffs = branch.get("cutoff_ranks", {})
            r1 = (
                ResponseTemplates.format_number(cutoffs.get("round1"))
                if cutoffs.get("round1")
                else "-"
            )
            r2 = (
                ResponseTemplates.format_number(cutoffs.get("round2"))
                if cutoffs.get("round2")
                else "-"
            )
            r3 = (
                ResponseTemplates.format_number(cutoffs.get("round3"))
                if cutoffs.get("round3")
                else "-"
            )
            lines.append(f"| {name} | {r1} | {r2} | {r3} |")

        return "\n".join(lines)

    @staticmethod
    def search_college(results: List[Dict], query: str) -> str:
        if not results:
            return f"No colleges found matching '{query}'."

        lines = [
            f"Colleges matching '{query}':",
            "",
            "| College | Code | Match |",
            "|---------|------|-------|",
        ]

        for result in results[:10]:
            name = result.get("college_name", "Unknown")
            if len(name) > 45:
                name = name[:42] + "..."
            code = result.get("college_code", "")
            score = result.get("match_score", 0)
            lines.append(f"| {name} | {code} | {int(score * 100)}% |")

        return "\n".join(lines)

    @staticmethod
    def compare_colleges(comparison: Dict) -> str:
        colleges = comparison.get("comparison", [])
        round_num = comparison.get("round", 1)

        if not colleges:
            return "No comparison data available."

        col_names = [c.get("college_name", "Unknown")[:25] for c in colleges]

        lines = [
            f"College Comparison (Round {round_num}):",
            "",
            "| Metric | " + " | ".join(col_names) + " |",
            "|--------|" + "|".join(["-------" for _ in colleges]) + "|",
        ]

        lines.append(
            "| Code | "
            + " | ".join([c.get("college_code", "-") for c in colleges])
            + " |"
        )
        lines.append(
            "| Branches | "
            + " | ".join([str(c.get("total_branches", 0)) for c in colleges])
            + " |"
        )
        lines.append(
            "| Best Cutoff | "
            + " | ".join(
                [
                    ResponseTemplates.format_number(c.get("best_cutoff", 0))
                    for c in colleges
                ]
            )
            + " |"
        )
        lines.append(
            "| Avg Cutoff | "
            + " | ".join(
                [
                    ResponseTemplates.format_number(c.get("avg_cutoff", 0))
                    for c in colleges
                ]
            )
            + " |"
        )
        lines.append(
            "| Worst Cutoff | "
            + " | ".join(
                [
                    ResponseTemplates.format_number(c.get("worst_cutoff", 0))
                    for c in colleges
                ]
            )
            + " |"
        )

        best_branches = []
        for c in colleges:
            bb = c.get("best_branch", "-")
            if bb and len(bb) > 20:
                bb = bb[:17] + "..."
            best_branches.append(bb or "-")
        lines.append("| Best Branch | " + " | ".join(best_branches) + " |")

        return "\n".join(lines)

    @staticmethod
    def analyze_rank(analysis: Dict) -> str:
        rank = analysis.get("rank", 0)
        round_num = analysis.get("round", 1)
        total = analysis.get("total_options", 0)
        percentile = analysis.get("percentile", "N/A")
        summary = analysis.get("summary", {})
        categories = analysis.get("categories", {})

        if total == 0:
            return f"No colleges found for rank {ResponseTemplates.format_number(rank)}. The rank may be too low for available options."

        lines = [
            f"**Rank Analysis: {ResponseTemplates.format_number(rank)}** (Round {round_num})",
            "",
            f"Percentile: {percentile}",
            f"Total Options: {total}",
            "",
            "**Category Breakdown:**",
            f"- Safe (Best): {summary.get('best_options', 0)} colleges",
            f"- Good: {summary.get('good_options', 0)} colleges",
            f"- Moderate: {summary.get('moderate_options', 0)} colleges",
            f"- Reach: {summary.get('reach_options', 0)} colleges",
            "",
        ]

        if categories.get("best"):
            lines.append("**Top Safe Options:**")
            lines.append("| College | Branch | Cutoff |")
            lines.append("|---------|--------|--------|")
            for c in categories["best"][:5]:
                name = c.get("college_name", "")
                if len(name) > 35:
                    name = name[:32] + "..."
                branch = c.get("branch", "")
                if len(branch) > 20:
                    branch = branch[:17] + "..."
                lines.append(
                    f"| {name} | {branch} | {ResponseTemplates.format_number(c.get('cutoff_rank', 0))} |"
                )
            lines.append("")

        if categories.get("good"):
            lines.append("**Good Options:**")
            lines.append("| College | Branch | Cutoff |")
            lines.append("|---------|--------|--------|")
            for c in categories["good"][:5]:
                name = c.get("college_name", "")
                if len(name) > 35:
                    name = name[:32] + "..."
                branch = c.get("branch", "")
                if len(branch) > 20:
                    branch = branch[:17] + "..."
                lines.append(
                    f"| {name} | {branch} | {ResponseTemplates.format_number(c.get('cutoff_rank', 0))} |"
                )

        return "\n".join(lines)

    @staticmethod
    def branch_popularity_all(data: Dict) -> str:
        branches = data.get("branches", [])
        round_num = data.get("round", 1)

        if not branches:
            return "No branch data available."

        lines = [
            f"**Branch Popularity** (Round {round_num})",
            "",
            "| Branch | Colleges | Best Cutoff | Avg Cutoff | Level |",
            "|--------|----------|-------------|------------|-------|",
        ]

        for b in branches[:25]:
            name = b.get("branch_name", "")
            if len(name) > 30:
                name = name[:27] + "..."
            count = b.get("college_count", 0)
            best = ResponseTemplates.format_number(b.get("best_cutoff", 0))
            avg = ResponseTemplates.format_number(b.get("avg_cutoff", 0))
            comp = b.get("competitiveness", "N/A")
            lines.append(f"| {name} | {count} | {best} | {avg} | {comp} |")

        return "\n".join(lines)

    @staticmethod
    def branch_popularity_specific(data: Dict) -> str:
        branch = data.get("branch_name", "Unknown")
        round_num = data.get("round", 1)
        total = data.get("total_colleges", 0)
        best = data.get("best_cutoff", 0)
        avg = data.get("avg_cutoff", 0)
        worst = data.get("worst_cutoff", 0)
        comp = data.get("competitiveness", "N/A")
        top_colleges = data.get("top_colleges", [])

        lines = [
            f"**{branch}** (Round {round_num})",
            "",
            f"- Total Colleges: {total}",
            f"- Best Cutoff: {ResponseTemplates.format_number(best)}",
            f"- Average Cutoff: {ResponseTemplates.format_number(avg)}",
            f"- Worst Cutoff: {ResponseTemplates.format_number(worst)}",
            f"- Competition Level: {comp}",
            "",
        ]

        if top_colleges:
            lines.append("**Top Colleges:**")
            lines.append("| College | Cutoff |")
            lines.append("|---------|--------|")
            for c in top_colleges[:10]:
                name = c.get("college_name", "")
                if len(name) > 40:
                    name = name[:37] + "..."
                lines.append(
                    f"| {name} | {ResponseTemplates.format_number(c.get('cutoff_rank', 0))} |"
                )

        return "\n".join(lines)

    @staticmethod
    def cutoff_trends(data: Dict) -> str:
        college = data.get("college_name", "Unknown")
        branch = data.get("branch_name", "Unknown")
        trends = data.get("cutoff_trends", {})

        lines = [
            f"**Cutoff Trends: {college}**",
            f"Branch: {branch}",
            "",
            "| Round | Cutoff Rank |",
            "|-------|-------------|",
            f"| Round 1 | {ResponseTemplates.format_number(trends.get('round1', 0))} |",
            f"| Round 2 | {ResponseTemplates.format_number(trends.get('round2', 0))} |",
            f"| Round 3 | {ResponseTemplates.format_number(trends.get('round3', 0))} |",
        ]

        return "\n".join(lines)


class SmartRouter:
    def __init__(self):
        self.templates = ResponseTemplates()

    async def route(self, message: str, session=None) -> RouterResult:
        try:
            context = ""
            if session and hasattr(session, "messages"):
                recent = (
                    session.messages[-3:]
                    if len(session.messages) > 3
                    else session.messages
                )
                context = " | ".join([f"{m.role}: {m.content[:100]}" for m in recent])

            extracted = await intent_extractor.extract(message, context)
            intent = extracted.get("intent", "conversational")

            if extracted.get("needs_gemini_response", True):
                return RouterResult(
                    handled=False, intent=intent, needs_gemini=True, params=extracted
                )

            response = await self._execute_intent(extracted)
            if response:
                return RouterResult(
                    handled=True, response=response, intent=intent, params=extracted
                )

            return RouterResult(
                handled=False, intent=intent, needs_gemini=True, params=extracted
            )

        except Exception as e:
            print(f"Router error: {e}")
            return RouterResult(handled=False, error=str(e), needs_gemini=True)

    async def _execute_intent(self, params: Dict) -> Optional[str]:
        intent = params.get("intent")
        rank = params.get("rank")
        round_num = params.get("round", 1)
        limit = params.get("limit", 20)
        branch_terms = params.get("branches")
        college_names = params.get("college_names")

        try:
            if intent == "colleges_by_rank":
                if not rank:
                    return None
                colleges = CollegeService.get_colleges_by_rank(
                    rank=rank, round=round_num, limit=limit
                )
                return self.templates.colleges_by_rank(colleges, rank, round_num, limit)

            elif intent == "colleges_by_branch":
                if not branch_terms:
                    return None
                resolved = intent_extractor.resolve_branches(branch_terms)
                if not resolved:
                    return None
                colleges = CollegeService.get_colleges_by_branch(
                    branch=resolved[0], round=round_num, limit=limit
                )
                return self.templates.colleges_by_branch(
                    colleges, resolved[0], round_num, limit
                )

            elif intent == "colleges_by_rank_and_branch":
                if not rank:
                    return None
                resolved = (
                    intent_extractor.resolve_branches(branch_terms)
                    if branch_terms
                    else None
                )
                if resolved:
                    colleges = CollegeService.search_colleges(
                        min_rank=rank, branches=resolved, round=round_num, limit=limit
                    )
                    return self.templates.colleges_by_rank(
                        colleges, rank, round_num, limit, resolved
                    )
                else:
                    colleges = CollegeService.get_colleges_by_rank(
                        rank=rank, round=round_num, limit=limit
                    )
                    return self.templates.colleges_by_rank(
                        colleges, rank, round_num, limit
                    )

            elif intent == "list_branches":
                branches = CollegeService.get_all_branches()
                return self.templates.all_branches(branches)

            elif intent == "college_info":
                if not college_names:
                    return None
                codes = intent_extractor.resolve_college_codes(college_names)
                if not codes:
                    results = CollegeService.search_college_by_name(
                        college_names[0], limit=5
                    )
                    return self.templates.search_college(results, college_names[0])
                info = CollegeService.get_college_branches(codes[0])
                return self.templates.college_info(info)

            elif intent == "compare_colleges":
                if not college_names or len(college_names) < 2:
                    return None
                codes = intent_extractor.resolve_college_codes(college_names)
                if len(codes) < 2:
                    return None
                comparison = CollegeService.compare_colleges(codes[:4], round=round_num)
                return self.templates.compare_colleges(comparison)

            elif intent == "analyze_rank":
                if not rank:
                    return None
                analysis = CollegeService.analyze_rank_prospects(rank, round=round_num)
                return self.templates.analyze_rank(analysis)

            elif intent == "branch_popularity":
                if branch_terms:
                    resolved = intent_extractor.resolve_branches(branch_terms)
                    if resolved:
                        data = CollegeService.get_branch_popularity(
                            branch_name=resolved[0], round=round_num
                        )
                        return self.templates.branch_popularity_specific(data)
                data = CollegeService.get_branch_popularity(
                    branch_name=None, round=round_num
                )
                return self.templates.branch_popularity_all(data)

            elif intent == "cutoff_trends":
                if not college_names or not branch_terms:
                    return None
                codes = intent_extractor.resolve_college_codes(college_names)
                resolved = intent_extractor.resolve_branches(branch_terms)
                if not codes or not resolved:
                    return None
                data = CollegeService.get_cutoff_trends(codes[0], resolved[0])
                return self.templates.cutoff_trends(data)

            return None

        except NoDataFoundError as e:
            return str(e)
        except CollegeNotFoundError as e:
            return str(e)
        except Exception as e:
            print(f"Execute intent error: {e}")
            return None


smart_router = SmartRouter()
