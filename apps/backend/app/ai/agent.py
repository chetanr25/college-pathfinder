"""
AI Agent with Gemini integration

Handles conversation with Gemini 2.0 Flash model using function calling
"""

import os
from typing import Any, AsyncGenerator, Callable, Dict, List, Optional

from google import genai
from google.genai import types

from app.ai.prompts import SYSTEM_PROMPT, TOOL_CALL_MESSAGES
from app.ai.session_manager import ChatSession
from app.ai.tools import TOOL_FUNCTIONS, execute_tool

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")


class AIAgent:
    """AI Agent using Gemini with function calling"""

    def __init__(self, model_id: str = "gemini-3.1-flash-lite-preview"):
        """
        Initialize AI Agent

        Args:
            model_id: Gemini model to use (default: gemini-3.1-flash-lite-preview)
        """
        self.model_id = model_id
        self.client = genai.Client(api_key=GEMINI_API_KEY)
        self.config = types.GenerateContentConfig(
            tools=TOOL_FUNCTIONS, system_instruction=SYSTEM_PROMPT
        )

    def _truncate_tool_response(self, data: Any, tool_name: str) -> Any:
        """
        Truncate large tool responses to prevent Gemini MALFORMED_FUNCTION_CALL errors.

        Args:
            data: Tool response data
            tool_name: Name of the tool that was called

        Returns:
            Truncated data suitable for Gemini
        """
        if tool_name == "compare_colleges" and isinstance(data, dict):
            if "comparison" in data:
                for college in data["comparison"]:
                    if "branches" in college:
                        branches = college["branches"]
                        college["branches"] = [
                            {"branch_name": b.get("branch_name", "Unknown")}
                            for b in branches[:10]
                        ]
                        college["branches_truncated"] = len(branches) > 10
            return data

        if isinstance(data, list) and len(data) > 80:
            truncated = []
            for item in data[:80]:
                if isinstance(item, dict):
                    truncated.append(
                        {
                            k: v
                            for k, v in item.items()
                            if k
                            in [
                                "college_name",
                                "college_code",
                                "branch_name",
                                "cutoff_rank",
                                "round",
                                "admission_chance",
                                "best_cutoff",
                                "avg_cutoff",
                                "worst_cutoff",
                                "total_branches",
                                "best_branch",
                                "worst_branch",
                            ]
                        }
                    )
                else:
                    truncated.append(item)
            return truncated

        if isinstance(data, dict):
            return self._truncate_dict(data)

        return data

    def _truncate_dict(
        self, d: dict, max_depth: int = 3, current_depth: int = 0
    ) -> dict:
        """Recursively truncate dictionary to prevent overly large responses"""
        if current_depth >= max_depth:
            return {"_truncated": True}

        result = {}
        for k, v in d.items():
            if isinstance(v, dict):
                result[k] = self._truncate_dict(v, max_depth, current_depth + 1)
            elif isinstance(v, list):
                if len(v) > 10:
                    result[k] = v[:10]
                    result[f"{k}_count"] = len(v)
                else:
                    result[k] = v
            elif isinstance(v, str) and len(v) > 500:
                result[k] = v[:500] + "..."
            else:
                result[k] = v
        return result

    def _build_conversation_history(
        self, session: ChatSession, limit: int = 5
    ) -> List[types.Content]:
        """
        Build conversation history for Gemini

        Args:
            session: Chat session
            limit: Number of recent messages to include

        Returns:
            List of Content objects for Gemini
        """
        recent_messages = session.get_recent_messages(limit)
        history = []

        for msg in recent_messages:
            if msg.role == "thinking":
                continue

            role = "user" if msg.role == "user" else "model"
            history.append(
                types.Content(role=role, parts=[types.Part(text=msg.content)])
            )

        return history

    def _build_config(self, session: ChatSession) -> types.GenerateContentConfig:
        """Build per-request config, injecting authenticated user email if available."""
        import re as _re

        user_email = getattr(session, "user_email", None)
        if not user_email:
            return self.config

        name_raw = user_email.split("@")[0]
        user_name = (
            " ".join(
                w.capitalize() for w in _re.split(r"[._\-0-9]+", name_raw) if w
            )
            or "Student"
        )
        email_hint = (
            f"\n\n🔐 AUTHENTICATED USER: email={user_email} | name={user_name}\n"
            f"When user says 'email me', 'mail me', 'send to my email', or similar → "
            f"IMMEDIATELY call send_comprehensive_report_email(email='{user_email}') — "
            f"do NOT ask for email, do NOT ask for confirmation."
        )
        return types.GenerateContentConfig(
            tools=TOOL_FUNCTIONS,
            system_instruction=self.config.system_instruction + email_hint,
        )

    async def process_message(
        self,
        user_message: str,
        session: ChatSession,
        emit_thinking: Optional[Callable] = None,
        emit_tool_call: Optional[Callable] = None,
    ) -> AsyncGenerator[str, None]:
        """
        Process user message and generate response with streaming

        Args:
            user_message: User's message
            session: Chat session
            emit_thinking: Optional callback to emit thinking steps
            emit_tool_call: Optional callback to emit tool call status

        Yields:
            Response chunks from Gemini
        """
        history = self._build_conversation_history(session)
        config = self._build_config(session)

        if emit_thinking:
            await emit_thinking("💭 Understanding your question...")

        current_history = history + [
            types.Content(role="user", parts=[types.Part(text=user_message)])
        ]

        max_iterations = 10
        iteration = 0

        while iteration < max_iterations:
            iteration += 1

            try:
                response = await self.client.aio.models.generate_content(
                    model=self.model_id, contents=current_history, config=config
                )
            except Exception as e:
                print(f"Error getting response from Gemini: {e}")
                yield "I encountered an error. Please try again."
                return

            tool_calls = []
            if response.candidates and response.candidates[0].content.parts:
                for part in response.candidates[0].content.parts:
                    if part.function_call:
                        tool_calls.append(part.function_call)

            if not tool_calls:
                final_text = response.text or ""
                if not final_text:
                    final_text = "I apologize, but I couldn't generate a response."

                chunk_size = 50
                for i in range(0, len(final_text), chunk_size):
                    yield final_text[i : i + chunk_size]
                return

            current_history.append(response.candidates[0].content)

            tool_responses = []
            for tool_call in tool_calls:
                tool_name = tool_call.name
                parameters = tool_call.args or {}

                print(f"Agent: executing tool {tool_name} with params {parameters}")

                if emit_thinking:
                    thinking_msg = TOOL_CALL_MESSAGES.get(
                        tool_name, f"🔧 Using {tool_name}..."
                    )
                    try:
                        thinking_msg = thinking_msg.format(**parameters)
                    except Exception:
                        pass
                    await emit_thinking(thinking_msg)

                if emit_tool_call:
                    await emit_tool_call(tool_name, parameters, "started")

                result = execute_tool(
                    tool_name, parameters, session.session_id, session
                )

                if emit_tool_call:
                    status = "completed" if result["success"] else "failed"
                    await emit_tool_call(tool_name, parameters, status)

                if emit_thinking:
                    await emit_thinking(f"✅ {result['summary']}")

                if result.get("success"):
                    data = result.get("data", [])
                    truncated_data = self._truncate_tool_response(data, tool_name)
                    tool_response_data = {"result": truncated_data}
                else:
                    tool_response_data = {"error": result.get("error", "Unknown error")}

                tool_responses.append(
                    types.Part(
                        function_response=types.FunctionResponse(
                            name=tool_name, response=tool_response_data
                        )
                    )
                )

            current_history.append(types.Content(role="model", parts=tool_responses))

        yield "I've reached the maximum number of attempts to answer your question. Please try rephrasing."

    def _synthesize_from_tool(self, tool_name: str, result: Dict[str, Any]) -> str:
        """Create a readable summary string from a tool result as a fallback when Gemini returns no text.

        This attempts to handle the common tools (lists of colleges, branches, trends) and produce
        a compact user-facing summary.
        """
        data = result.get("data")

        if tool_name.startswith("send_") and tool_name.endswith("_email"):
            if isinstance(data, dict):
                if data.get("success"):
                    return data.get("message", "Email sent successfully!")
                else:
                    return data.get(
                        "message", "Failed to send email. Please try again."
                    )
            return result.get("summary", "Email operation completed.")

        if tool_name == "compare_colleges" and isinstance(data, dict):
            comparison = data.get("comparison", [])
            if comparison:
                lines = ["Here's the comparison:\n"]
                for college in comparison:
                    name = college.get("college_name", "Unknown")
                    code = college.get("college_code", "")
                    best = college.get("best_cutoff", "N/A")
                    avg = college.get("avg_cutoff", "N/A")
                    branches = college.get("total_branches", 0)
                    lines.append(f"**{name}** ({code})")
                    lines.append(f"  - Best Cutoff: {best}")
                    lines.append(f"  - Avg Cutoff: {avg}")
                    lines.append(f"  - Total Branches: {branches}\n")
                return "\n".join(lines)

        if data is None:
            return result.get("summary", "No results available.")

        if isinstance(data, list):
            lines = []
            limit = min(8, len(data))
            for i in range(limit):
                item = data[i]
                name = (
                    item.get("college_name") or item.get("college") or item.get("name")
                )
                code = item.get("college_code") or item.get("code") or item.get("id")
                branch = (
                    item.get("branch") or item.get("course") or item.get("branch_name")
                )
                cutoff = (
                    item.get("cutoff_rank")
                    or item.get("closing_rank")
                    or item.get("rank")
                )
                parts = []
                if name:
                    parts.append(f"{name}")
                if code:
                    parts.append(f"({code})")
                if branch:
                    parts.append(f"- {branch}")
                if cutoff:
                    parts.append(f"Cutoff: {cutoff}")
                lines.append(" ".join(parts))
            header = f"Here are the top {limit} results:\n\n"
            return header + "\n".join(lines)

        if isinstance(data, dict):
            summary_parts = []
            for key, value in list(data.items())[:5]:
                if isinstance(value, (str, int, float)):
                    summary_parts.append(f"{key}: {value}")
            if summary_parts:
                return "Results:\n" + "\n".join(summary_parts)
            return result.get("summary", "Data retrieved successfully.")

        return str(data)[:500]

agent = AIAgent()
