"""
Email Service Usage Examples
============================

This file demonstrates how to use the email service with various templates.
"""

from app.email.service import email_service
from app.email.templates_manager import template_manager
from datetime import datetime


# Example 1: Send Prediction Summary Email
def send_prediction_summary_email(user_email: str, user_data: dict):
    """Send college prediction summary to user"""
    
    context = {
        'student_name': user_data.get('name', 'Student'),
        'rank': user_data.get('rank'),
        'category': user_data.get('category'),
        'round_number': user_data.get('round', 1),
        'location': user_data.get('preferred_location'),
        'rank_year': '2024',
        'analysis_date': datetime.now(),
        'total_colleges': len(user_data.get('colleges', [])),
        'colleges': user_data.get('colleges', []),
        'website_url': 'https://collegepathfinder.com'
    }
    
    html_content = template_manager.render_prediction_summary(context)
    
    return email_service.send_email(
        to_email=user_email,
        subject=f"🎓 Your KCET College Predictions - {len(context['colleges'])} Matches Found!",
        html_content=html_content
    )


# Example 2: Send Welcome Email
def send_welcome_email(user_email: str, user_name: str):
    """Send welcome email to new users"""
    
    context = {
        'student_name': user_name,
        'website_url': 'https://collegepathfinder.com'
    }
    
    html_content = template_manager.render_welcome_email(context)
    
    return email_service.send_email(
        to_email=user_email,
        subject="🎉 Welcome to KCET College Predictor!",
        html_content=html_content
    )


# Example 3: Send Detailed Report
def send_detailed_report(user_email: str, report_data: dict):
    """Send detailed college analysis report"""
    
    context = {
        'student_name': report_data.get('name'),
        'rank': report_data.get('rank'),
        'category': report_data.get('category'),
        'total_matches': len(report_data.get('colleges', [])),
        'high_chance_count': sum(1 for c in report_data.get('colleges', []) if c.get('admission_chance') == 'High'),
        'branches_count': len(set(c.get('branch') for c in report_data.get('colleges', []))),
        'colleges': report_data.get('colleges', [])[:10],  # Top 10
        'branch_distribution': report_data.get('branch_distribution', []),
        'generation_date': datetime.now(),
        'download_url': 'https://collegepathfinder.com/download-report'
    }
    
    html_content = template_manager.render_detailed_report(context)
    
    return email_service.send_email(
        to_email=user_email,
        subject="📋 Your Detailed College Analysis Report",
        html_content=html_content
    )


# Example 4: Send Comparison Report
def send_comparison_report(user_email: str, comparison_data: dict):
    """Send college comparison email"""
    
    context = {
        'student_name': comparison_data.get('name'),
        'comparisons': comparison_data.get('comparisons', []),
        'recommendation_text': comparison_data.get('recommendation'),
        'website_url': 'https://collegepathfinder.com'
    }
    
    html_content = template_manager.render_comparison_report(context)
    
    return email_service.send_email(
        to_email=user_email,
        subject="⚖️ College Comparison Report",
        html_content=html_content
    )


# Example 5: Send Counseling Reminder
def send_counseling_reminder(user_email: str, reminder_data: dict):
    """Send counseling reminder email"""
    
    context = {
        'student_name': reminder_data.get('name'),
        'round_number': reminder_data.get('round'),
        'counseling_date': reminder_data.get('counseling_date'),
        'counseling_time': reminder_data.get('counseling_time'),
        'days_remaining': reminder_data.get('days_remaining'),
        'option_entry_start': reminder_data.get('option_entry_start'),
        'option_entry_end': reminder_data.get('option_entry_end'),
        'seat_allotment_date': reminder_data.get('seat_allotment_date'),
        'verification_date': reminder_data.get('verification_date'),
        'college_list_url': 'https://collegepathfinder.com/my-colleges'
    }
    
    html_content = template_manager.render_counseling_reminder(context)
    
    return email_service.send_email(
        to_email=user_email,
        subject=f"⏰ URGENT: KCET Round {context['round_number']} Counseling Reminder",
        html_content=html_content
    )


# Example 6: Send Shortlist Summary
def send_shortlist_summary(user_email: str, shortlist_data: dict):
    """Send shortlisted colleges summary"""
    
    context = {
        'student_name': shortlist_data.get('name'),
        'year': '2024',
        'shortlisted_colleges': shortlist_data.get('colleges', []),
        'pdf_download_url': 'https://collegepathfinder.com/download/shortlist.pdf',
        'excel_download_url': 'https://collegepathfinder.com/download/shortlist.xlsx',
        'website_url': 'https://collegepathfinder.com'
    }
    
    html_content = template_manager.render_shortlist_summary(context)
    
    return email_service.send_email(
        to_email=user_email,
        subject=f"⭐ Your College Shortlist - {len(context['shortlisted_colleges'])} Colleges",
        html_content=html_content
    )


# Example 7: Send Branch Analysis
def send_branch_analysis(user_email: str, analysis_data: dict):
    """Send branch-wise analysis"""
    
    context = {
        'student_name': analysis_data.get('name'),
        'rank': analysis_data.get('rank'),
        'branches': analysis_data.get('branches', []),
        'recommendation_1': analysis_data.get('recommendation_1'),
        'recommendation_2': analysis_data.get('recommendation_2'),
        'recommendation_3': analysis_data.get('recommendation_3'),
        'recommendation_4': analysis_data.get('recommendation_4'),
        'detailed_report_url': 'https://collegepathfinder.com/report'
    }
    
    html_content = template_manager.render_branch_analysis(context)
    
    return email_service.send_email(
        to_email=user_email,
        subject="📊 Branch-wise College Analysis Report",
        html_content=html_content
    )


# Example 8: Send Admission Tips
def send_admission_tips(user_email: str, user_name: str):
    """Send admission tips and guidance"""
    
    context = {
        'student_name': user_name,
        'chatbot_url': 'https://collegepathfinder.com/chat'
    }
    
    html_content = template_manager.render_admission_tips(context)
    
    return email_service.send_email(
        to_email=user_email,
        subject="💡 Expert Tips for KCET Counseling Success",
        html_content=html_content
    )


# Example 9: Send Cutoff Trends
def send_cutoff_trends(user_email: str, trends_data: dict):
    """Send cutoff trends analysis"""
    
    context = {
        'student_name': trends_data.get('name'),
        'rank': trends_data.get('rank'),
        'category': trends_data.get('category'),
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
        'detailed_analysis_url': 'https://collegepathfinder.com/trends'
    }
    
    html_content = template_manager.render_cutoff_trends(context)
    
    return email_service.send_email(
        to_email=user_email,
        subject="📈 KCET Cutoff Trends & 2025 Predictions",
        html_content=html_content
    )


# Example 10: Send Success Stories
def send_success_stories(user_email: str, user_name: str):
    """Send success stories and testimonials"""
    
    context = {
        'student_name': user_name,
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
                'testimonial': 'The AI predictor was spot on! I got my dream college in the first round itself. The chatbot helped me clear all my doubts instantly. Highly recommend to all KCET aspirants!',
                'tags': ['First Round', 'Dream College', 'CS Branch']
            },
            {
                'name': 'Priya Sharma',
                'initials': 'PS',
                'college': 'BMS College of Engineering',
                'branch': 'Information Science',
                'rank': 8567,
                'round': 2,
                'year': 2024,
                'testimonial': 'I was confused about which colleges to apply for. This platform gave me a clear roadmap. The detailed analysis and comparison features were game-changers!',
                'tags': ['Smart Choice', 'Top College', 'Happy Student']
            }
        ],
        'website_url': 'https://collegepathfinder.com',
        'share_story_url': 'https://collegepathfinder.com/share-story'
    }
    
    html_content = template_manager.render_success_stories(context)
    
    return email_service.send_email(
        to_email=user_email,
        subject="🏆 Success Stories That Will Inspire You!",
        html_content=html_content
    )


# Example: Bulk Email Sending
def send_bulk_welcome_emails(email_list: list):
    """Send welcome email to multiple users"""
    
    context = {
        'student_name': 'Student',  # Generic for bulk
        'website_url': 'https://collegepathfinder.com'
    }
    
    html_content = template_manager.render_welcome_email(context)
    
    return email_service.send_bulk_emails(
        recipients=email_list,
        subject="🎉 Welcome to KCET College Predictor!",
        html_content=html_content
    )
