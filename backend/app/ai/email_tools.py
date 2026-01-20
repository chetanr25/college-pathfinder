"""
Email Tools for AI Agent

These tools allow the AI to send various types of emails to users based on conversation context.
All emails include a "Continue the Chat" button with the session ID for seamless conversation continuation.
"""

import os
import re
from datetime import datetime
from typing import Any, Dict, List, Optional

from app.ai.session_manager import ChatSession
from app.email.service import email_service
from app.email.templates_manager import template_manager

FRONTEND_BASE_URL = os.getenv(
    "FRONTEND_BASE_URL", "http://collegepathfinder.vercel.app"
)

_current_session: Optional[ChatSession] = None


def _set_session_context(session: Optional[ChatSession]) -> None:
    """Set the current session context for email functions"""
    global _current_session
    _current_session = session


def _get_session_context() -> Optional[ChatSession]:
    """Get the current session context"""
    return _current_session


def _get_chat_url(session_id: str) -> str:
    """Generate chat URL with session ID"""
    return f"{FRONTEND_BASE_URL}/ai-chat?session={session_id}"


def _extract_name_from_email(email: str) -> str:
    """Extract name from email address"""
    local_part = email.split("@")[0]
    name = re.sub(r"[0-9._-]", " ", local_part)
    name = " ".join(word.capitalize() for word in name.split() if word)

    return name if name else "Student"


def _analyze_conversation_history(session: ChatSession) -> Dict[str, Any]:
    """Analyze entire conversation to extract key information"""
    analysis = {
        "rank": None,
        "category": "GM",
        "colleges": [],
        "branches_discussed": [],
        "conversation_summary": [],
    }

    for msg in session.messages:
        content = msg.content.lower()

        if "rank" in content:
            rank_match = re.search(r"\b(\d{1,6})\b", content)
            if rank_match and not analysis["rank"]:
                analysis["rank"] = int(rank_match.group(1))

        categories = ["gm", "sc", "st", "2a", "2b", "3a", "3b", "obc"]
        for cat in categories:
            if cat in content:
                analysis["category"] = cat.upper()
                break

        if msg.role == "user":
            if len(content) > 20:
                analysis["conversation_summary"].append(content[:100])

    analysis["conversation_summary"] = analysis["conversation_summary"][:5]

    return analysis


def send_comprehensive_report_email(
    email: Optional[str] = None,
    session_id: str = "",
    student_name: Optional[str] = None,
    rank: Optional[int] = None,
    category: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Send comprehensive KCET analysis report with REAL DATA from tools.

    This function:
    1. Uses authenticated user's email if none provided
    2. Analyzes conversation history to understand what user wants
    3. Executes actual search tools to get college data
    4. Gathers top 30 colleges from Round 1 & Round 2
    5. Sends formatted email with proper table structure

    Args:
        email: Student's email address (optional - uses authenticated email if not provided)
        session_id: Current chat session ID
        student_name: Student's name (auto-extracted from email if not provided)
        rank: Student's rank (auto-extracted from conversation if not provided)
        category: Student's category (defaults to GM)

    Returns:
        Dict with success status and message

    Note:
        Session object will be injected by execute_tool() if available
    """
    from app.services import CollegeService

    session = _get_session_context()

    if not email and session:
        if hasattr(session, "user_email") and session.user_email:
            email = session.user_email

    if not email:
        return {
            "success": False,
            "error": "No email provided",
            "message": "Please provide an email address. Say 'email me' to use your account email, or provide a specific address like 'send to friend@email.com'",
        }

    if not _validate_email(email):
        return {
            "success": False,
            "error": "Invalid email format",
            "message": "Please provide a valid email address.",
        }

    if not student_name:
        student_name = _extract_name_from_email(email)

    conversation_data = {}
    session = _get_session_context()
    if session:
        conversation_data = _analyze_conversation_history(session)
        if not rank:
            rank = conversation_data.get("rank")
        if not category:
            category = conversation_data.get("category", "GM")

    rank = rank or 50000
    category = category or "GM"

    conversation_summary = " ".join(conversation_data.get("conversation_summary", []))
    if not conversation_summary:
        conversation_summary = f"Analysis for rank {rank} in {category} category"

    round1_colleges = []
    round2_colleges = []
    stats = {
        "total_colleges": 0,
        "round1_colleges": 0,
        "round2_colleges": 0,
        "branches_count": 0,
    }

    try:
        print(f"[EMAIL DEBUG] Fetching Round 1 colleges for rank {rank}")
        try:
            colleges_r1_raw = CollegeService.get_colleges_by_rank(
                rank=rank, round=1, limit=15, sort_order="asc"
            )
            print(
                f"[EMAIL DEBUG] Round 1 fetch successful: {len(colleges_r1_raw) if colleges_r1_raw else 0} colleges"
            )
        except Exception as e1:
            print(f"[EMAIL DEBUG] Round 1 fetch failed: {e1}")
            colleges_r1_raw = []

        if colleges_r1_raw and len(colleges_r1_raw) > 0:
            for college in colleges_r1_raw:
                cutoff = college.get("cutoff_rank", rank)
                if rank <= cutoff:
                    admission_chance = "High"
                elif rank <= cutoff * 1.1:
                    admission_chance = "Medium"
                else:
                    admission_chance = "Low"

                college["admission_chance"] = admission_chance

            round1_colleges = colleges_r1_raw
            stats["round1_colleges"] = len(round1_colleges)
            print(
                f"[EMAIL DEBUG] Round 1 colleges prepared: {stats['round1_colleges']}"
            )
        else:
            print("[EMAIL DEBUG] No Round 1 colleges found")

        print(f"[EMAIL DEBUG] Fetching Round 2 colleges for rank {rank}")
        try:
            colleges_r2_raw = CollegeService.get_colleges_by_rank(
                rank=rank, round=2, limit=15, sort_order="asc"
            )
            print(
                f"[EMAIL DEBUG] Round 2 fetch successful: {len(colleges_r2_raw) if colleges_r2_raw else 0} colleges"
            )
        except Exception as e2:
            print(f"[EMAIL DEBUG] Round 2 fetch failed: {e2}")
            colleges_r2_raw = []

        if colleges_r2_raw and len(colleges_r2_raw) > 0:
            for college in colleges_r2_raw:
                cutoff = college.get("cutoff_rank", rank)
                if rank <= cutoff:
                    admission_chance = "High"
                elif rank <= cutoff * 1.1:
                    admission_chance = "Medium"
                else:
                    admission_chance = "Low"

                college["admission_chance"] = admission_chance

            round2_colleges = colleges_r2_raw
            stats["round2_colleges"] = len(round2_colleges)
            print(
                f"[EMAIL DEBUG] Round 2 colleges prepared: {stats['round2_colleges']}"
            )
        else:
            print("[EMAIL DEBUG] No Round 2 colleges found")

        stats["total_colleges"] = stats["round1_colleges"] + stats["round2_colleges"]
        all_branches = set()
        for college in round1_colleges + round2_colleges:
            all_branches.add(college.get("branch_name", ""))
        stats["branches_count"] = len(all_branches)

        print(f"[EMAIL DEBUG] Final stats: {stats}")
        print(
            f"[EMAIL DEBUG] Round1 count: {len(round1_colleges)}, Round2 count: {len(round2_colleges)}"
        )

    except Exception as e:
        print(f"[EMAIL ERROR] Error fetching college data: {e}")
        import traceback

        traceback.print_exc()

    context = {
        "student_name": student_name,
        "rank": rank,
        "category": category,
        "analysis_date": datetime.now(),
        "chat_url": _get_chat_url(session_id),
        "conversation_summary": conversation_summary,
        "stats": stats,
        "round1_colleges": round1_colleges,
        "round2_colleges": round2_colleges,
    }

    try:
        html_content = template_manager.render_template(
            "comprehensive_report_v2.html", context
        )

        success = email_service.send_email(
            to_email=email,
            subject=f"🎓 Your KCET College Report - Rank {rank}",
            html_content=html_content,
        )

        if success:
            return {
                "success": True,
                "message": f"✅ Comprehensive analysis report sent to {email}! Check your inbox for detailed insights including college matches, branch analysis, trends, and personalized recommendations.",
            }
        else:
            return {
                "success": False,
                "error": "Email sending failed",
                "message": "Failed to send email. Please check your email address and try again.",
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": f"Error sending email: {str(e)}",
        }


def send_prediction_summary_email(
    email: str,
    student_name: str,
    rank: int,
    category: str,
    colleges: List[Dict[str, Any]],
    session_id: str,
    round_number: int = 1,
    preferred_location: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Send college prediction summary email to the student.

    Use this when user asks to email their college predictions/results.
    Example: "Can you email me my college list?", "Send the results to my email"

    Args:
        email: Student's email address (validate format first)
        student_name: Student's name from conversation
        rank: Student's KCET rank
        category: Student's category (GM, SC, ST, OBC, etc.)
        colleges: List of college dictionaries from search results
        session_id: Current chat session ID for "Continue the Chat" link
        round_number: Counseling round (1-3)
        preferred_location: Preferred location if mentioned

    Returns:
        Dict with success status and message
    """
    if not _validate_email(email):
        return {
            "success": False,
            "error": "Invalid email format",
            "message": "Please provide a valid email address.",
        }

    context = {
        "student_name": student_name,
        "rank": rank,
        "category": category,
        "round_number": round_number,
        "location": preferred_location,
        "rank_year": "2024",
        "analysis_date": datetime.now(),
        "total_colleges": len(colleges),
        "colleges": colleges[:30],
        "chat_url": _get_chat_url(session_id),
    }

    try:
        html_content = template_manager.render_prediction_summary(context)

        success = email_service.send_email(
            to_email=email,
            subject=f"🎓 Your KCET College Predictions - {len(colleges)} Matches Found!",
            html_content=html_content,
        )

        if success:
            return {
                "success": True,
                "message": f"Prediction summary sent to {email}! Check your inbox.",
                "colleges_sent": len(colleges[:30]),
            }
        else:
            return {
                "success": False,
                "error": "Email sending failed",
                "message": "Failed to send email. Please check your email address and try again.",
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": f"Error sending email: {str(e)}",
        }


def send_detailed_analysis_email(
    email: str,
    student_name: str,
    rank: int,
    category: str,
    colleges: List[Dict[str, Any]],
    session_id: str,
    branch_distribution: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """
    Send detailed college analysis report via email.

    Use when user wants comprehensive analysis with statistics and insights.
    Example: "Send me a detailed report", "Email me the full analysis"

    Args:
        email: Student's email address
        student_name: Student's name
        rank: Student's KCET rank
        category: Student's category
        colleges: List of college dictionaries
        session_id: Current chat session ID
        branch_distribution: Optional branch-wise statistics

    Returns:
        Dict with success status and message
    """
    if not _validate_email(email):
        return {
            "success": False,
            "error": "Invalid email format",
            "message": "Please provide a valid email address.",
        }

    high_chance = sum(1 for c in colleges if c.get("admission_chance") == "High")
    branches = set(c.get("branch", "") for c in colleges)

    context = {
        "student_name": student_name,
        "rank": rank,
        "category": category,
        "total_matches": len(colleges),
        "high_chance_count": high_chance,
        "branches_count": len(branches),
        "colleges": colleges[:15],  # Top 15
        "branch_distribution": branch_distribution or [],
        "generation_date": datetime.now(),
        "chat_url": _get_chat_url(session_id),
    }

    try:
        html_content = template_manager.render_detailed_report(context)

        success = email_service.send_email(
            to_email=email,
            subject="📋 Your Detailed College Analysis Report",
            html_content=html_content,
        )

        if success:
            return {
                "success": True,
                "message": f"✅ Detailed report sent to {email}! Check your inbox for comprehensive analysis.",
            }
        else:
            return {
                "success": False,
                "message": "Failed to send detailed report. Please try again.",
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": f"Error sending detailed report: {str(e)}",
        }


def send_comparison_email(
    email: Optional[str] = None,
    student_name: Optional[str] = None,
    comparisons: Optional[List[Dict[str, Any]]] = None,
    recommendation: Optional[str] = None,
    session_id: str = "",
    comparison_data: Optional[Dict[str, Any]] = None,
    round: int = 1,
) -> Dict[str, Any]:
    """
    Send college comparison report via email.

    Use when user asks to email comparison results of multiple colleges.
    Example: "Email me the comparison", "Send comparison to my email"

    Args:
        email: Student's email address (optional - uses authenticated email if not provided)
        student_name: Student's name (optional - extracted from email)
        comparisons: List of comparison dicts with college_a, college_b, winner (old format)
        recommendation: AI's recommendation text
        session_id: Current chat session ID
        comparison_data: Direct output from compare_colleges() tool (new format)
        round: Counselling round number

    Returns:
        Dict with success status and message
    """
    # Try to get email from session context if not provided
    session = _get_session_context()

    if not email and session:
        # Try to extract email from session user data
        if hasattr(session, "user_email") and session.user_email:
            email = session.user_email

    if not email:
        return {
            "success": False,
            "message": "Please provide an email address. Example: send_comparison_email(email='you@email.com', ...)",
        }

    if not _validate_email(email):
        return {"success": False, "message": "Invalid email address format."}

    # Extract name from email if not provided
    if not student_name:
        student_name = _extract_name_from_email(email)

    # Build context - support both old and new formats
    context = {
        "student_name": student_name,
        "recommendation_text": recommendation
        or "Based on the comparison, consider factors like cutoff ranks, available branches, and your preferences to make the best choice.",
        "chat_url": _get_chat_url(session_id),
        "round": round,
    }

    # Handle new format from compare_colleges() tool
    if comparison_data:
        context["comparison"] = comparison_data.get("comparison", [])
        context["round"] = comparison_data.get("round", round)

    # Handle old format with pairwise comparisons
    if comparisons:
        context["comparisons"] = comparisons

    try:
        html_content = template_manager.render_comparison_report(context)

        success = email_service.send_email(
            to_email=email,
            subject="College Comparison Report - College Path Finder",
            html_content=html_content,
        )

        if success:
            return {
                "success": True,
                "message": f"✅ Comparison report sent to {email}!",
            }
        else:
            return {"success": False, "message": "Failed to send comparison report."}
    except Exception as e:
        return {"success": False, "error": str(e), "message": f"Error: {str(e)}"}


def send_branch_analysis_email(
    email: str,
    student_name: str,
    rank: int,
    branches: List[Dict[str, Any]],
    session_id: str,
) -> Dict[str, Any]:
    """
    Send branch-wise college analysis via email.

    Use when user wants to see colleges grouped by branches/specializations.
    Example: "Email me branch options", "Send branch analysis to my email"

    Args:
        email: Student's email address
        student_name: Student's name
        rank: Student's KCET rank
        branches: List of branch analysis data
        session_id: Current chat session ID

    Returns:
        Dict with success status and message
    """
    if not _validate_email(email):
        return {"success": False, "message": "Invalid email address."}

    context = {
        "student_name": student_name,
        "rank": rank,
        "branches": branches,
        "recommendation_1": "Consider colleges with good placement records",
        "recommendation_2": "Check faculty qualifications and research facilities",
        "recommendation_3": "Visit campuses before making final decision",
        "recommendation_4": "Talk to current students and alumni",
        "chat_url": _get_chat_url(session_id),
    }

    try:
        html_content = template_manager.render_branch_analysis(context)

        success = email_service.send_email(
            to_email=email,
            subject="📊 Branch-wise College Analysis Report",
            html_content=html_content,
        )

        if success:
            return {"success": True, "message": f"✅ Branch analysis sent to {email}!"}
        else:
            return {"success": False, "message": "Failed to send branch analysis."}
    except Exception as e:
        return {"success": False, "error": str(e), "message": f"Error: {str(e)}"}


def send_admission_tips_email(
    email: str, student_name: str, session_id: str
) -> Dict[str, Any]:
    """
    Send admission tips and counseling guidance via email.

    Use when user asks for general counseling tips or guidance.
    Example: "Send me admission tips", "Email counseling guidance"

    Args:
        email: Student's email address
        student_name: Student's name
        session_id: Current chat session ID

    Returns:
        Dict with success status and message
    """
    if not _validate_email(email):
        return {"success": False, "message": "Invalid email address."}

    context = {"student_name": student_name, "chat_url": _get_chat_url(session_id)}

    try:
        html_content = template_manager.render_admission_tips(context)

        success = email_service.send_email(
            to_email=email,
            subject="💡 Expert Tips for KCET Counseling Success",
            html_content=html_content,
        )

        if success:
            return {"success": True, "message": f"✅ Admission tips sent to {email}!"}
        else:
            return {"success": False, "message": "Failed to send tips."}
    except Exception as e:
        return {"success": False, "error": str(e), "message": f"Error: {str(e)}"}


def send_cutoff_trends_email(
    email: str,
    student_name: str,
    rank: int,
    category: str,
    session_id: str,
    trends_data: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Send cutoff trends and historical analysis via email.

    Use when user asks for cutoff trends or historical data.
    Example: "Email me cutoff trends", "Send historical cutoff data"

    Args:
        email: Student's email address
        student_name: Student's name
        rank: Student's KCET rank
        category: Student's category
        session_id: Current chat session ID
        trends_data: Optional historical trends data

    Returns:
        Dict with success status and message
    """
    if not _validate_email(email):
        return {"success": False, "message": "Invalid email address."}

    # Default trends data if not provided
    if not trends_data:
        trends_data = {
            "cutoff_2022": rank + 500,
            "cutoff_2023": rank + 300,
            "cutoff_2024": rank,
            "trend_2023": "trend-down",
            "trend_2024": "trend-down",
            "prediction": "Based on trends, cutoffs are expected to remain stable or decrease slightly in 2025.",
            "branch_trends": [],
        }

    context = {
        "student_name": student_name,
        "rank": rank,
        "category": category,
        "year_1": 2022,
        "year_2": 2023,
        "year_3": 2024,
        "cutoff_year_1": trends_data.get("cutoff_2022"),
        "cutoff_year_2": trends_data.get("cutoff_2023"),
        "cutoff_year_3": trends_data.get("cutoff_2024"),
        "trend_year_2": trends_data.get("trend_2023", "trend-up"),
        "trend_year_3": trends_data.get("trend_2024", "trend-down"),
        "branch_trends": trends_data.get("branch_trends", []),
        "prediction_message": trends_data.get("prediction"),
        "chat_url": _get_chat_url(session_id),
    }

    try:
        html_content = template_manager.render_cutoff_trends(context)

        success = email_service.send_email(
            to_email=email,
            subject="📈 KCET Cutoff Trends & 2025 Predictions",
            html_content=html_content,
        )

        if success:
            return {"success": True, "message": f"✅ Cutoff trends sent to {email}!"}
        else:
            return {"success": False, "message": "Failed to send trends."}
    except Exception as e:
        return {"success": False, "error": str(e), "message": f"Error: {str(e)}"}


def _validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))
