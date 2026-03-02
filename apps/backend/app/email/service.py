import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List, Optional

from dotenv import load_dotenv

load_dotenv()


class EmailService:
    """Email service for sending automated emails using Gmail SMTP"""

    def __init__(self):
        self.enabled = os.getenv("EMAIL_ENABLED", "false").lower() == "true"
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.username = os.getenv("SMTP_USERNAME", "")
        self.password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("SMTP_FROM_EMAIL", self.username)
        self.from_name = os.getenv("SMTP_FROM_NAME", "KCET College Predictor")

    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None,
    ) -> bool:
        """
        Send an email with HTML content

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML content of the email
            cc: List of CC email addresses
            bcc: List of BCC email addresses

        Returns:
            bool: True if email sent successfully, False otherwise
        """
        if not self.enabled:
            print("Email service is disabled")
            return False

        if not self.username or not self.password:
            print("Email credentials not configured")
            return False

        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{self.from_name} <{self.from_email}>"
            message["To"] = to_email

            if cc:
                message["Cc"] = ", ".join(cc)
            if bcc:
                message["Bcc"] = ", ".join(bcc)

            # Attach HTML content
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)

            # Connect to SMTP server
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.username, self.password)

                # Send email
                recipients = [to_email]
                if cc:
                    recipients.extend(cc)
                if bcc:
                    recipients.extend(bcc)

                server.sendmail(self.from_email, recipients, message.as_string())

            print(f"Email sent successfully to {to_email}")
            return True

        except Exception as e:
            print(f"Failed to send email: {str(e)}")
            return False

    def send_bulk_emails(
        self, recipients: List[str], subject: str, html_content: str
    ) -> dict:
        """
        Send the same email to multiple recipients

        Args:
            recipients: List of recipient email addresses
            subject: Email subject
            html_content: HTML content of the email

        Returns:
            dict: Summary of sent/failed emails
        """
        results = {"sent": [], "failed": []}

        for recipient in recipients:
            if self.send_email(recipient, subject, html_content):
                results["sent"].append(recipient)
            else:
                results["failed"].append(recipient)

        return results


# Singleton instance
email_service = EmailService()
