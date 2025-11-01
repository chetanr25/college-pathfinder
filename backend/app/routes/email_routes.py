"""
Email Routes for FastAPI
========================

API endpoints for sending emails
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.email.service import email_service
from app.email.templates_manager import template_manager


router = APIRouter(prefix="/api/email", tags=["Email"])


# Request Models
class EmailRequest(BaseModel):
    email: EmailStr
    name: Optional[str] = "Student"


class PredictionEmailRequest(EmailRequest):
    rank: int
    category: str
    round_number: int = 1
    preferred_location: Optional[str] = None
    colleges: List[Dict[str, Any]]


class ComparisonEmailRequest(EmailRequest):
    comparisons: List[Dict[str, Any]]
    recommendation: str


class ReminderEmailRequest(EmailRequest):
    round_number: int
    counseling_date: str
    counseling_time: str = "9:00 AM onwards"
    days_remaining: int
    option_entry_start: str
    option_entry_end: str
    seat_allotment_date: str
    verification_date: str


class ShortlistEmailRequest(EmailRequest):
    colleges: List[Dict[str, Any]]


class BulkEmailRequest(BaseModel):
    recipients: List[EmailStr]
    template_type: str  # 'welcome', 'tips', 'stories'


# Routes
@router.post("/send-prediction-summary")
async def send_prediction_summary(
    request: PredictionEmailRequest,
    background_tasks: BackgroundTasks
):
    """Send college prediction summary email"""
    
    context = {
        'student_name': request.name,
        'rank': request.rank,
        'category': request.category,
        'round_number': request.round_number,
        'location': request.preferred_location,
        'rank_year': '2024',
        'analysis_date': datetime.now(),
        'total_colleges': len(request.colleges),
        'colleges': request.colleges,
        'website_url': 'https://collegepathfinder.com'
    }
    
    html_content = template_manager.render_prediction_summary(context)
    subject = f"🎓 Your KCET College Predictions - {len(request.colleges)} Matches Found!"
    
    # Send email in background
    background_tasks.add_task(
        email_service.send_email,
        to_email=request.email,
        subject=subject,
        html_content=html_content
    )
    
    return {
        "success": True,
        "message": f"Prediction summary email queued for {request.email}"
    }


@router.post("/send-welcome")
async def send_welcome(
    request: EmailRequest,
    background_tasks: BackgroundTasks
):
    """Send welcome email to new user"""
    
    context = {
        'student_name': request.name,
        'website_url': 'https://collegepathfinder.com'
    }
    
    html_content = template_manager.render_welcome_email(context)
    
    background_tasks.add_task(
        email_service.send_email,
        to_email=request.email,
        subject="🎉 Welcome to KCET College Predictor!",
        html_content=html_content
    )
    
    return {
        "success": True,
        "message": f"Welcome email queued for {request.email}"
    }


@router.post("/send-comparison")
async def send_comparison(
    request: ComparisonEmailRequest,
    background_tasks: BackgroundTasks
):
    """Send college comparison report"""
    
    context = {
        'student_name': request.name,
        'comparisons': request.comparisons,
        'recommendation_text': request.recommendation,
        'website_url': 'https://collegepathfinder.com'
    }
    
    html_content = template_manager.render_comparison_report(context)
    
    background_tasks.add_task(
        email_service.send_email,
        to_email=request.email,
        subject="⚖️ College Comparison Report",
        html_content=html_content
    )
    
    return {
        "success": True,
        "message": f"Comparison report queued for {request.email}"
    }


@router.post("/send-counseling-reminder")
async def send_counseling_reminder(
    request: ReminderEmailRequest,
    background_tasks: BackgroundTasks
):
    """Send counseling reminder"""
    
    context = {
        'student_name': request.name,
        'round_number': request.round_number,
        'counseling_date': request.counseling_date,
        'counseling_time': request.counseling_time,
        'days_remaining': request.days_remaining,
        'option_entry_start': request.option_entry_start,
        'option_entry_end': request.option_entry_end,
        'seat_allotment_date': request.seat_allotment_date,
        'verification_date': request.verification_date,
        'college_list_url': 'https://collegepathfinder.com/my-colleges'
    }
    
    html_content = template_manager.render_counseling_reminder(context)
    
    background_tasks.add_task(
        email_service.send_email,
        to_email=request.email,
        subject=f"⏰ URGENT: KCET Round {request.round_number} Counseling Reminder",
        html_content=html_content
    )
    
    return {
        "success": True,
        "message": f"Counseling reminder queued for {request.email}"
    }


@router.post("/send-shortlist")
async def send_shortlist(
    request: ShortlistEmailRequest,
    background_tasks: BackgroundTasks
):
    """Send shortlist summary"""
    
    context = {
        'student_name': request.name,
        'year': '2024',
        'shortlisted_colleges': request.colleges,
        'pdf_download_url': 'https://collegepathfinder.com/download/shortlist.pdf',
        'excel_download_url': 'https://collegepathfinder.com/download/shortlist.xlsx',
        'website_url': 'https://collegepathfinder.com'
    }
    
    html_content = template_manager.render_shortlist_summary(context)
    
    background_tasks.add_task(
        email_service.send_email,
        to_email=request.email,
        subject=f"⭐ Your College Shortlist - {len(request.colleges)} Colleges",
        html_content=html_content
    )
    
    return {
        "success": True,
        "message": f"Shortlist summary queued for {request.email}"
    }


@router.post("/send-admission-tips")
async def send_admission_tips(
    request: EmailRequest,
    background_tasks: BackgroundTasks
):
    """Send admission tips"""
    
    context = {
        'student_name': request.name,
        'chatbot_url': 'https://collegepathfinder.com/chat'
    }
    
    html_content = template_manager.render_admission_tips(context)
    
    background_tasks.add_task(
        email_service.send_email,
        to_email=request.email,
        subject="💡 Expert Tips for KCET Counseling Success",
        html_content=html_content
    )
    
    return {
        "success": True,
        "message": f"Admission tips queued for {request.email}"
    }


@router.post("/send-success-stories")
async def send_success_stories(
    request: EmailRequest,
    background_tasks: BackgroundTasks
):
    """Send success stories"""
    
    # Sample data - replace with actual data from your database
    context = {
        'student_name': request.name,
        'total_students_helped': '10,000+',
        'success_rate': '94%',
        'colleges_covered': '1000+',
        'predictions_made': '50K+',
        'ai_queries': '100K+',
        'success_stories': [
            {
                'name': 'Rajesh Kumar',
                'initials': 'RK',
                'college': 'RV College of Engineering',
                'branch': 'Computer Science',
                'rank': 5234,
                'round': 1,
                'year': 2024,
                'testimonial': 'The AI predictor was spot on! I got my dream college in the first round itself.',
                'tags': ['First Round', 'Dream College', 'CS Branch']
            }
        ],
        'website_url': 'https://collegepathfinder.com',
        'share_story_url': 'https://collegepathfinder.com/share-story'
    }
    
    html_content = template_manager.render_success_stories(context)
    
    background_tasks.add_task(
        email_service.send_email,
        to_email=request.email,
        subject="🏆 Success Stories That Will Inspire You!",
        html_content=html_content
    )
    
    return {
        "success": True,
        "message": f"Success stories queued for {request.email}"
    }


@router.post("/send-bulk")
async def send_bulk_emails(
    request: BulkEmailRequest,
    background_tasks: BackgroundTasks
):
    """Send bulk emails"""
    
    if request.template_type == 'welcome':
        context = {
            'student_name': 'Student',
            'website_url': 'https://collegepathfinder.com'
        }
        html_content = template_manager.render_welcome_email(context)
        subject = "🎉 Welcome to KCET College Predictor!"
    elif request.template_type == 'tips':
        context = {
            'student_name': 'Student',
            'chatbot_url': 'https://collegepathfinder.com/chat'
        }
        html_content = template_manager.render_admission_tips(context)
        subject = "💡 Expert Tips for KCET Counseling Success"
    else:
        raise HTTPException(status_code=400, detail="Invalid template type")
    
    background_tasks.add_task(
        email_service.send_bulk_emails,
        recipients=request.recipients,
        subject=subject,
        html_content=html_content
    )
    
    return {
        "success": True,
        "message": f"Bulk emails queued for {len(request.recipients)} recipients"
    }


@router.get("/status")
async def email_status():
    """Check if email service is enabled"""
    return {
        "enabled": email_service.enabled,
        "smtp_host": email_service.smtp_host,
        "smtp_port": email_service.smtp_port,
        "from_email": email_service.from_email
    }
