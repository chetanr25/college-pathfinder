"""
Email System Test Script
========================

Run this script to test your email configuration and templates
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.email.service import email_service
from app.email.templates_manager import template_manager
from datetime import datetime


def test_email_configuration():
    """Test email service configuration"""
    print("\n" + "="*60)
    print("📧 EMAIL CONFIGURATION TEST")
    print("="*60)
    
    print(f"\n✓ Email Service Enabled: {email_service.enabled}")
    print(f"✓ SMTP Host: {email_service.smtp_host}")
    print(f"✓ SMTP Port: {email_service.smtp_port}")
    print(f"✓ From Email: {email_service.from_email}")
    print(f"✓ From Name: {email_service.from_name}")
    
    if not email_service.enabled:
        print("\n⚠️  Email service is DISABLED. Set EMAIL_ENABLED=true in .env")
        return False
    
    if not email_service.username or not email_service.password:
        print("\n⚠️  Email credentials not configured. Check .env file")
        return False
    
    print("\n✅ Configuration looks good!")
    return True


def test_template_rendering():
    """Test all email templates"""
    print("\n" + "="*60)
    print("🎨 TEMPLATE RENDERING TEST")
    print("="*60)
    
    templates_tested = 0
    templates_passed = 0
    
    # Test data
    test_contexts = {
        'prediction_summary.html': {
            'student_name': 'Test User',
            'rank': 12345,
            'category': 'GM',
            'round_number': 1,
            'location': 'Bangalore',
            'analysis_date': datetime.now(),
            'total_colleges': 5,
            'colleges': [
                {
                    'college_name': 'Test College',
                    'branch': 'Computer Science',
                    'college_place': 'Bangalore',
                    'closing_rank': 15000,
                    'college_type': 'Private',
                    'admission_chance': 'High'
                }
            ],
            'website_url': 'https://test.com'
        },
        'welcome.html': {
            'student_name': 'Test User',
            'website_url': 'https://test.com'
        },
        'detailed_report.html': {
            'student_name': 'Test User',
            'rank': 12345,
            'category': 'GM',
            'total_matches': 10,
            'high_chance_count': 5,
            'branches_count': 3,
            'colleges': [],
            'branch_distribution': [],
            'generation_date': datetime.now()
        },
        'comparison_report.html': {
            'student_name': 'Test User',
            'comparisons': [],
            'recommendation_text': 'Test recommendation',
            'website_url': 'https://test.com'
        },
        'counseling_reminder.html': {
            'student_name': 'Test User',
            'round_number': 1,
            'counseling_date': datetime.now(),
            'days_remaining': 5,
            'option_entry_start': datetime.now(),
            'option_entry_end': datetime.now(),
            'seat_allotment_date': datetime.now(),
            'verification_date': datetime.now()
        },
        'shortlist_summary.html': {
            'student_name': 'Test User',
            'shortlisted_colleges': [],
            'website_url': 'https://test.com'
        },
        'branch_analysis.html': {
            'student_name': 'Test User',
            'rank': 12345,
            'branches': []
        },
        'admission_tips.html': {
            'student_name': 'Test User',
            'chatbot_url': 'https://test.com/chat'
        },
        'cutoff_trends.html': {
            'student_name': 'Test User',
            'rank': 12345,
            'category': 'GM'
        },
        'success_stories.html': {
            'student_name': 'Test User',
            'success_stories': [],
            'website_url': 'https://test.com'
        }
    }
    
    for template_name, context in test_contexts.items():
        templates_tested += 1
        try:
            html = template_manager.render_template(template_name, context)
            if len(html) > 100:  # Basic check that HTML was generated
                print(f"\n✅ {template_name}: OK ({len(html)} chars)")
                templates_passed += 1
            else:
                print(f"\n❌ {template_name}: Generated HTML too short")
        except Exception as e:
            print(f"\n❌ {template_name}: {str(e)}")
    
    print(f"\n{'='*60}")
    print(f"Templates Tested: {templates_tested}")
    print(f"Templates Passed: {templates_passed}")
    print(f"Success Rate: {(templates_passed/templates_tested)*100:.1f}%")
    
    return templates_passed == templates_tested


def send_test_email(recipient_email: str):
    """Send a test email"""
    print("\n" + "="*60)
    print("📤 SENDING TEST EMAIL")
    print("="*60)
    
    if not email_service.enabled:
        print("\n⚠️  Email service disabled. Cannot send test email.")
        return False
    
    print(f"\nRecipient: {recipient_email}")
    print("Generating welcome email template...")
    
    context = {
        'student_name': 'Test User',
        'website_url': 'https://collegepathfinder.com'
    }
    
    try:
        html_content = template_manager.render_welcome_email(context)
        print("✓ Template rendered successfully")
        
        print("Sending email...")
        success = email_service.send_email(
            to_email=recipient_email,
            subject="🧪 Test Email from KCET College Predictor",
            html_content=html_content
        )
        
        if success:
            print("\n✅ Test email sent successfully!")
            print(f"Check your inbox at {recipient_email}")
            return True
        else:
            print("\n❌ Failed to send email. Check logs above for errors.")
            return False
            
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return False


def main():
    """Main test runner"""
    print("\n" + "="*60)
    print("🚀 EMAIL SYSTEM TEST SUITE")
    print("="*60)
    
    # Test 1: Configuration
    config_ok = test_email_configuration()
    
    # Test 2: Template Rendering
    templates_ok = test_template_rendering()
    
    # Test 3: Send Email (optional)
    if config_ok:
        print("\n" + "="*60)
        send_test = input("\n📧 Do you want to send a test email? (y/n): ").lower().strip()
        
        if send_test == 'y':
            recipient = input("Enter recipient email address: ").strip()
            if recipient:
                send_test_email(recipient)
            else:
                print("❌ Invalid email address")
    
    # Final Summary
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    print(f"Configuration: {'✅ PASS' if config_ok else '❌ FAIL'}")
    print(f"Templates: {'✅ PASS' if templates_ok else '❌ FAIL'}")
    print("="*60 + "\n")
    
    if config_ok and templates_ok:
        print("🎉 All tests passed! Email system is ready to use.")
        print("\nNext steps:")
        print("1. Import email functions in your routes")
        print("2. Call send_*_email() functions when needed")
        print("3. Check app/email/examples.py for usage examples")
    else:
        print("⚠️  Some tests failed. Please fix the issues above.")
        print("\nTroubleshooting:")
        print("1. Check .env file has correct email settings")
        print("2. Verify Gmail App Password is correct")
        print("3. Ensure 2FA is enabled on Gmail account")
        print("4. Check app/email/README.md for setup guide")


if __name__ == "__main__":
    main()
