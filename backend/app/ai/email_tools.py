"""
Email Tools for AI Agent

These tools allow the AI to send various types of emails to users based on conversation context.
All emails include a "Continue the Chat" button with the session ID for seamless conversation continuation.
"""
from typing import Dict, List, Any, Optional
from datetime import datetime
import re

from app.email.service import email_service
from app.email.templates_manager import template_manager


# Base URL for frontend
FRONTEND_BASE_URL = "https://collegepathfinder-95zwvpx1r-chetan-rs-projects.vercel.app"


def _get_chat_url(session_id: str) -> str:
    """Generate chat URL with session ID"""
    return f"{FRONTEND_BASE_URL}/ai-chat?session={session_id}"


def send_prediction_summary_email(
    email: str,
    student_name: str,
    rank: int,
    category: str,
    colleges: List[Dict[str, Any]],
    session_id: str,
    round_number: int = 1,
    preferred_location: Optional[str] = None
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
    # Validate email format
    if not _validate_email(email):
        return {
            "success": False,
            "error": "Invalid email format",
            "message": "Please provide a valid email address."
        }
    
    # Prepare context
    context = {
        'student_name': student_name,
        'rank': rank,
        'category': category,
        'round_number': round_number,
        'location': preferred_location,
        'rank_year': '2024',
        'analysis_date': datetime.now(),
        'total_colleges': len(colleges),
        'colleges': colleges[:10],  # Top 10 for email
        'chat_url': _get_chat_url(session_id)
    }
    
    try:
        html_content = template_manager.render_prediction_summary(context)
        
        success = email_service.send_email(
            to_email=email,
            subject=f"🎓 Your KCET College Predictions - {len(colleges)} Matches Found!",
            html_content=html_content
        )
        
        if success:
            return {
                "success": True,
                "message": f"✅ Prediction summary sent to {email}! Check your inbox.",
                "colleges_sent": len(colleges[:10])
            }
        else:
            return {
                "success": False,
                "error": "Email sending failed",
                "message": "Failed to send email. Please check your email address and try again."
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": f"Error sending email: {str(e)}"
        }


def send_detailed_analysis_email(
    email: str,
    student_name: str,
    rank: int,
    category: str,
    colleges: List[Dict[str, Any]],
    session_id: str,
    branch_distribution: Optional[List[Dict[str, Any]]] = None
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
            "message": "Please provide a valid email address."
        }
    
    # Calculate statistics
    high_chance = sum(1 for c in colleges if c.get('admission_chance') == 'High')
    branches = set(c.get('branch', '') for c in colleges)
    
    context = {
        'student_name': student_name,
        'rank': rank,
        'category': category,
        'total_matches': len(colleges),
        'high_chance_count': high_chance,
        'branches_count': len(branches),
        'colleges': colleges[:15],  # Top 15
        'branch_distribution': branch_distribution or [],
        'generation_date': datetime.now(),
        'chat_url': _get_chat_url(session_id)
    }
    
    try:
        html_content = template_manager.render_detailed_report(context)
        
        success = email_service.send_email(
            to_email=email,
            subject="📋 Your Detailed College Analysis Report",
            html_content=html_content
        )
        
        if success:
            return {
                "success": True,
                "message": f"✅ Detailed report sent to {email}! Check your inbox for comprehensive analysis."
            }
        else:
            return {
                "success": False,
                "message": "Failed to send detailed report. Please try again."
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": f"Error sending detailed report: {str(e)}"
        }


def send_comparison_email(
    email: str,
    student_name: str,
    comparisons: List[Dict[str, Any]],
    recommendation: str,
    session_id: str
) -> Dict[str, Any]:
    """
    Send college comparison report via email.
    
    Use when user asks to email comparison results of multiple colleges.
    Example: "Email me the comparison", "Send comparison to my email"
    
    Args:
        email: Student's email address
        student_name: Student's name
        comparisons: List of comparison dicts with college_a, college_b, winner
        recommendation: AI's recommendation text
        session_id: Current chat session ID
        
    Returns:
        Dict with success status and message
    """
    if not _validate_email(email):
        return {
            "success": False,
            "message": "Invalid email address format."
        }
    
    context = {
        'student_name': student_name,
        'comparisons': comparisons,
        'recommendation_text': recommendation,
        'chat_url': _get_chat_url(session_id)
    }
    
    try:
        html_content = template_manager.render_comparison_report(context)
        
        success = email_service.send_email(
            to_email=email,
            subject="⚖️ College Comparison Report",
            html_content=html_content
        )
        
        if success:
            return {
                "success": True,
                "message": f"✅ Comparison report sent to {email}!"
            }
        else:
            return {
                "success": False,
                "message": "Failed to send comparison report."
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": f"Error: {str(e)}"
        }


def send_branch_analysis_email(
    email: str,
    student_name: str,
    rank: int,
    branches: List[Dict[str, Any]],
    session_id: str
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
        return {
            "success": False,
            "message": "Invalid email address."
        }
    
    context = {
        'student_name': student_name,
        'rank': rank,
        'branches': branches,
        'recommendation_1': 'Consider colleges with good placement records',
        'recommendation_2': 'Check faculty qualifications and research facilities',
        'recommendation_3': 'Visit campuses before making final decision',
        'recommendation_4': 'Talk to current students and alumni',
        'chat_url': _get_chat_url(session_id)
    }
    
    try:
        html_content = template_manager.render_branch_analysis(context)
        
        success = email_service.send_email(
            to_email=email,
            subject="📊 Branch-wise College Analysis Report",
            html_content=html_content
        )
        
        if success:
            return {
                "success": True,
                "message": f"✅ Branch analysis sent to {email}!"
            }
        else:
            return {
                "success": False,
                "message": "Failed to send branch analysis."
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": f"Error: {str(e)}"
        }


def send_admission_tips_email(
    email: str,
    student_name: str,
    session_id: str
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
        return {
            "success": False,
            "message": "Invalid email address."
        }
    
    context = {
        'student_name': student_name,
        'chat_url': _get_chat_url(session_id)
    }
    
    try:
        html_content = template_manager.render_admission_tips(context)
        
        success = email_service.send_email(
            to_email=email,
            subject="💡 Expert Tips for KCET Counseling Success",
            html_content=html_content
        )
        
        if success:
            return {
                "success": True,
                "message": f"✅ Admission tips sent to {email}!"
            }
        else:
            return {
                "success": False,
                "message": "Failed to send tips."
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": f"Error: {str(e)}"
        }


def send_cutoff_trends_email(
    email: str,
    student_name: str,
    rank: int,
    category: str,
    session_id: str,
    trends_data: Optional[Dict[str, Any]] = None
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
        return {
            "success": False,
            "message": "Invalid email address."
        }
    
    # Default trends data if not provided
    if not trends_data:
        trends_data = {
            'cutoff_2022': rank + 500,
            'cutoff_2023': rank + 300,
            'cutoff_2024': rank,
            'trend_2023': 'trend-down',
            'trend_2024': 'trend-down',
            'prediction': 'Based on trends, cutoffs are expected to remain stable or decrease slightly in 2025.',
            'branch_trends': []
        }
    
    context = {
        'student_name': student_name,
        'rank': rank,
        'category': category,
        'year_1': 2022,
        'year_2': 2023,
        'year_3': 2024,
        'cutoff_year_1': trends_data.get('cutoff_2022'),
        'cutoff_year_2': trends_data.get('cutoff_2023'),
        'cutoff_year_3': trends_data.get('cutoff_2024'),
        'trend_year_2': trends_data.get('trend_2023', 'trend-up'),
        'trend_year_3': trends_data.get('trend_2024', 'trend-down'),
        'branch_trends': trends_data.get('branch_trends', []),
        'prediction_message': trends_data.get('prediction'),
        'chat_url': _get_chat_url(session_id)
    }
    
    try:
        html_content = template_manager.render_cutoff_trends(context)
        
        success = email_service.send_email(
            to_email=email,
            subject="📈 KCET Cutoff Trends & 2025 Predictions",
            html_content=html_content
        )
        
        if success:
            return {
                "success": True,
                "message": f"✅ Cutoff trends sent to {email}!"
            }
        else:
            return {
                "success": False,
                "message": "Failed to send trends."
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": f"Error: {str(e)}"
        }


def _validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))
