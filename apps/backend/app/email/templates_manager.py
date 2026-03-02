from datetime import datetime
from pathlib import Path
from typing import Any, Dict

from jinja2 import Environment, FileSystemLoader, select_autoescape


class EmailTemplateManager:
    """Manager for email templates using Jinja2"""

    def __init__(self):
        template_dir = Path(__file__).parent / "templates"
        self.env = Environment(
            loader=FileSystemLoader(str(template_dir)),
            autoescape=select_autoescape(["html", "xml"]),
        )

        # Add custom filters
        self.env.filters["format_date"] = self._format_date
        self.env.filters["format_number"] = self._format_number
        self.env.filters["capitalize_words"] = self._capitalize_words

    @staticmethod
    def _format_date(value, format="%B %d, %Y"):
        """Format date string"""
        if isinstance(value, str):
            return value
        return value.strftime(format) if value else ""

    @staticmethod
    def _format_number(value):
        """Format number with commas"""
        return f"{value:,}" if isinstance(value, (int, float)) else value

    @staticmethod
    def _capitalize_words(value):
        """Capitalize each word"""
        return value.title() if isinstance(value, str) else value

    def render_template(self, template_name: str, context: Dict[str, Any]) -> str:
        """
        Render a template with given context

        Args:
            template_name: Name of the template file
            context: Dictionary of variables to pass to template

        Returns:
            str: Rendered HTML content
        """
        template = self.env.get_template(template_name)

        # Add common context variables
        context.setdefault("current_year", datetime.now().year)
        context.setdefault("app_name", "KCET College Predictor")

        return template.render(**context)

    # Template-specific methods
    def render_prediction_summary(self, data: Dict[str, Any]) -> str:
        """Render college prediction summary email"""
        return self.render_template("prediction_summary.html", data)

    def render_welcome_email(self, data: Dict[str, Any]) -> str:
        """Render welcome email"""
        return self.render_template("welcome.html", data)

    def render_detailed_report(self, data: Dict[str, Any]) -> str:
        """Render detailed college report"""
        return self.render_template("detailed_report.html", data)

    def render_comparison_report(self, data: Dict[str, Any]) -> str:
        """Render college comparison report"""
        return self.render_template("comparison_report.html", data)

    def render_counseling_reminder(self, data: Dict[str, Any]) -> str:
        """Render counseling reminder"""
        return self.render_template("counseling_reminder.html", data)

    def render_shortlist_summary(self, data: Dict[str, Any]) -> str:
        """Render shortlisted colleges summary"""
        return self.render_template("shortlist_summary.html", data)

    def render_branch_analysis(self, data: Dict[str, Any]) -> str:
        """Render branch-wise analysis"""
        return self.render_template("branch_analysis.html", data)

    def render_admission_tips(self, data: Dict[str, Any]) -> str:
        """Render admission tips and guidance"""
        return self.render_template("admission_tips.html", data)

    def render_cutoff_trends(self, data: Dict[str, Any]) -> str:
        """Render cutoff trends analysis"""
        return self.render_template("cutoff_trends.html", data)

    def render_success_stories(self, data: Dict[str, Any]) -> str:
        """Render success stories and testimonials"""
        return self.render_template("success_stories.html", data)


# Singleton instance
template_manager = EmailTemplateManager()
