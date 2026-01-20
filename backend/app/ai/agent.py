"""
AI Agent with Gemini integration

Handles conversation with Gemini 2.0 Flash model using function calling
"""
import os
import json
import asyncio
from typing import List, Dict, Any, Optional, AsyncGenerator, Callable, Union
import google.generativeai as genai
from google.protobuf.json_format import MessageToDict

from app.ai.prompts import SYSTEM_PROMPT, TOOL_CALL_MESSAGES
from app.ai.tools import TOOL_FUNCTIONS, execute_tool
from app.ai.session_manager import Message, ChatSession


# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


def convert_proto_to_dict(obj):
    """
    Recursively convert Protobuf objects to Python primitives
    
    Args:
        obj: Any object (Protobuf, dict, list, or primitive)
        
    Returns:
        Python primitive (dict, list, str, int, float, bool, None)
    """
    if obj is None:
        return None
    
    # Handle Protobuf MapComposite and RepeatedComposite
    if hasattr(obj, '__class__') and 'proto.marshal' in str(type(obj)):
        # Convert to dict using dict() for MapComposite
        if hasattr(obj, 'items'):
            return {k: convert_proto_to_dict(v) for k, v in obj.items()}
        # Convert to list for RepeatedComposite
        elif hasattr(obj, '__iter__'):
            return [convert_proto_to_dict(item) for item in obj]
        else:
            return obj
    
    # Handle regular dict
    elif isinstance(obj, dict):
        return {k: convert_proto_to_dict(v) for k, v in obj.items()}
    
    # Handle regular list
    elif isinstance(obj, (list, tuple)):
        return [convert_proto_to_dict(item) for item in obj]
    
    # Handle primitives
    elif isinstance(obj, (str, int, float, bool)):
        return obj
    
    # Handle unknown types - try to convert to string
    else:
        try:
            return str(obj)
        except:
            return None


class AIAgent:
    """AI Agent using Gemini with function calling"""
    
    def __init__(self, model_name: str = "gemini-2.5-flash"):
        """
        Initialize AI Agent
        
        Args:
            model_name: Gemini model to use (default: gemini-2.5-flash)
        """
        self.model_name = model_name
        self.model = genai.GenerativeModel(
            model_name=model_name,
            tools=TOOL_FUNCTIONS,
            system_instruction=SYSTEM_PROMPT
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
        # For compare_colleges, remove the full branches list (too large)
        if tool_name == "compare_colleges" and isinstance(data, dict):
            if "comparison" in data:
                for college in data["comparison"]:
                    if "branches" in college:
                        # Keep only branch count and names (not full cutoff data)
                        branches = college["branches"]
                        college["branches"] = [
                            {"branch_name": b.get("branch_name", "Unknown")} 
                            for b in branches[:10]  # Limit to 10 branches
                        ]
                        college["branches_truncated"] = len(branches) > 10
            return data
        
        # For large lists of colleges, truncate to top 80 for Gemini
        if isinstance(data, list) and len(data) > 80:
            truncated = []
            for item in data[:80]:
                if isinstance(item, dict):
                    truncated.append({
                        k: v for k, v in item.items() 
                        if k in ["college_name", "college_code", "branch_name", "cutoff_rank", 
                                 "round", "admission_chance", "best_cutoff", "avg_cutoff", 
                                 "worst_cutoff", "total_branches", "best_branch", "worst_branch"]
                    })
                else:
                    truncated.append(item)
            return truncated
        
        # For other dict responses, limit string lengths
        if isinstance(data, dict):
            return self._truncate_dict(data)
        
        return data
    
    def _truncate_dict(self, d: dict, max_depth: int = 3, current_depth: int = 0) -> dict:
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

    def _build_conversation_history(self, session: ChatSession, limit: int = 5) -> List[Dict]:
        """
        Build conversation history for Gemini
        
        Args:
            session: Chat session
            limit: Number of recent messages to include
            
        Returns:
            List of message dictionaries for Gemini
        """
        recent_messages = session.get_recent_messages(limit)
        history = []
        
        for msg in recent_messages:
            # Skip thinking messages (internal only)
            if msg.role == "thinking":
                continue
            
            # Map roles
            role = "user" if msg.role == "user" else "model"
            history.append({
                "role": role,
                "parts": [{"text": msg.content}]
            })
        
        return history
    
    async def process_message(
        self,
        user_message: str,
        session: ChatSession,
        emit_thinking: Optional[Callable] = None,
        emit_tool_call: Optional[Callable] = None
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
        # Build conversation history
        history = self._build_conversation_history(session)
        
        # Create chat session
        chat = self.model.start_chat(history=history)
        
        # Send message to Gemini
        if emit_thinking:
            await emit_thinking("💭 Understanding your question...")
        
        last_tool_result = None
        last_tool_name = None
        response = await chat.send_message_async(user_message)
        
        # Handle function calls
        max_iterations = 10  # Prevent infinite loops
        iteration = 0
        
        while iteration < max_iterations:
            # Check if there's a function call in the response
            has_function_call = False
            function_call = None
            
            try:
                if (response.candidates and 
                    len(response.candidates) > 0 and 
                    response.candidates[0].content.parts and
                    len(response.candidates[0].content.parts) > 0):
                    
                    first_part = response.candidates[0].content.parts[0]
                    if hasattr(first_part, 'function_call') and first_part.function_call:
                        has_function_call = True
                        function_call = first_part.function_call
            except Exception as e:
                # If we can't check for function calls, break the loop
                print(f"Error checking for function call: {e}")
                break
            
            if not has_function_call:
                break
            
            iteration += 1
            
            tool_name = function_call.name
            # Convert Protobuf objects to Python primitives
            raw_parameters = dict(function_call.args)
            parameters = convert_proto_to_dict(raw_parameters)
            print(f"Agent: executing tool {tool_name} with params {parameters}")
            
            print(f"\n🔧 TOOL CALL: {tool_name}")
            print(f"📥 Parameters: {parameters}")
            
            # Emit tool call start
            if emit_thinking:
                # Get custom message for this tool
                thinking_msg = TOOL_CALL_MESSAGES.get(tool_name, f"🔧 Using {tool_name}...")
                # Format with parameters if present
                try:
                    thinking_msg = thinking_msg.format(**parameters)
                except:
                    pass
                await emit_thinking(thinking_msg)
            
            if emit_tool_call:
                await emit_tool_call(tool_name, parameters, "started")

            result = execute_tool(tool_name, parameters, session.session_id, session)
            last_tool_result = result
            last_tool_name = tool_name

            print(f"📤 Result: success={result.get('success')}, data_length={len(str(result.get('data', [])))}")
            
            # Emit tool call completion
            if emit_tool_call:
                status = "completed" if result["success"] else "failed"
                await emit_tool_call(tool_name, parameters, status)
            
            if emit_thinking:
                await emit_thinking(f"✅ {result['summary']}")
            
            # Send tool result back to Gemini
            # IMPORTANT: FunctionResponse.response must be a dict, not a list
            # Wrap the result properly and TRUNCATE large responses to prevent Gemini issues
            if result.get("success"):
                data = result.get("data", [])
                
                # Truncate large responses to prevent MALFORMED_FUNCTION_CALL errors
                truncated_data = self._truncate_tool_response(data, tool_name)
                tool_response_data = {"result": truncated_data}
            else:
                # Send error in a dict
                tool_response_data = {"error": result.get("error", "Unknown error")}
            
            print(f"📨 Sending to Gemini: {type(tool_response_data)}, keys={list(tool_response_data.keys())}")
            
            function_response = genai.protos.Part(
                function_response=genai.protos.FunctionResponse(
                    name=tool_name,
                    response=tool_response_data
                )
            )
            
            print("⏳ Waiting for Gemini response after tool call...")
            try:
                # Add timeout to prevent hanging
                response = await asyncio.wait_for(
                    chat.send_message_async(function_response),
                    timeout=60.0  # 60 second timeout
                )
                print("✅ Received response from Gemini")
                
                # Check for MALFORMED_FUNCTION_CALL or other errors
                if response.candidates and len(response.candidates) > 0:
                    candidate = response.candidates[0]
                    if hasattr(candidate, 'finish_reason'):
                        finish_reason = str(candidate.finish_reason)
                        if 'MALFORMED' in finish_reason or 'ERROR' in finish_reason:
                            print(f"⚠️ Gemini returned error finish_reason: {finish_reason}")
                            # Use synthesized response instead
                            final_text = self._synthesize_from_tool(tool_name, result)
                            yield final_text
                            return
                            
            except asyncio.TimeoutError:
                print("❌ Timeout waiting for Gemini response")
                # Use synthesized response from the tool result
                if result.get("success"):
                    final_text = self._synthesize_from_tool(tool_name, result)
                else:
                    final_text = "I found the data but encountered a timeout. Please try asking again."
                yield final_text
                return
            except Exception as e:
                print(f"❌ Error getting response from Gemini: {e}")
                # Try to synthesize a response from the last tool result
                if result.get("success"):
                    final_text = self._synthesize_from_tool(tool_name, result)
                else:
                    final_text = "I encountered an error after fetching the data. Please try asking again."
                yield final_text
                return
        
        # Emit final thinking
        if emit_thinking:
            await emit_thinking("✨ Preparing response...")
        
        # Stream the final response
        try:
            final_text = response.text
        except ValueError as e:
            # If response.text fails (e.g., function call parts), extract text from parts
            final_text = ""
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'text') and part.text:
                    final_text += part.text
            
            # If still no text, provide a default message
            if not final_text:
                final_text = "I apologize, but I encountered an issue processing your request. Please try rephrasing your question."
        
        # Yield response in chunks (simulate streaming)
        chunk_size = 50
        for i in range(0, len(final_text), chunk_size):
            chunk = final_text[i:i + chunk_size]
            yield chunk

    def _synthesize_from_tool(self, tool_name: str, result: Dict[str, Any]) -> str:
        """Create a readable summary string from a tool result as a fallback when Gemini returns no text.

        This attempts to handle the common tools (lists of colleges, branches, trends) and produce
        a compact user-facing summary.
        """
        data = result.get("data")
        
        # Handle email tools - they return success/message directly
        if tool_name.startswith("send_") and tool_name.endswith("_email"):
            if isinstance(data, dict):
                if data.get("success"):
                    return data.get("message", "Email sent successfully!")
                else:
                    return data.get("message", "Failed to send email. Please try again.")
            return result.get("summary", "Email operation completed.")
        
        # Handle compare_colleges
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

        # If data is a list of colleges, summarize top entries
        if isinstance(data, list):
            lines = []
            limit = min(8, len(data))
            for i in range(limit):
                item = data[i]
                # Try common keys
                name = item.get("college_name") or item.get("college") or item.get("name")
                code = item.get("college_code") or item.get("code") or item.get("id")
                branch = item.get("branch") or item.get("course") or item.get("branch_name")
                cutoff = item.get("cutoff_rank") or item.get("closing_rank") or item.get("rank")
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

        # If data is a dict with branches or trends
        if isinstance(data, dict):
            # Don't dump large JSON, create a summary
            summary_parts = []
            for key, value in list(data.items())[:5]:
                if isinstance(value, (str, int, float)):
                    summary_parts.append(f"{key}: {value}")
            if summary_parts:
                return "Results:\n" + "\n".join(summary_parts)
            return result.get("summary", "Data retrieved successfully.")

        return str(data)[:500]
    
    def process_message_sync(
        self,
        user_message: str,
        session: ChatSession
    ) -> tuple[str, List[Dict]]:
        """
        Synchronous version of process_message (for testing)
        
        Args:
            user_message: User's message
            session: Chat session
            
        Returns:
            Tuple of (response_text, tool_calls_metadata)
        """
        # Build conversation history
        history = self._build_conversation_history(session)
        
        # Create chat session
        chat = self.model.start_chat(history=history)
        
        # Send message
        response = chat.send_message(user_message)
        
        # Track tool calls
        tool_calls = []
        last_tool_result = None
        last_tool_name = None

        # Handle function calls
        while True:
            try:
                part = response.candidates[0].content.parts[0]
            except Exception:
                break
            if not getattr(part, "function_call", None):
                break

            function_call = part.function_call
            tool_name = function_call.name
            parameters = dict(function_call.args)

            # Execute tool
            result = execute_tool(tool_name, parameters, session.session_id, session)
            last_tool_result = result
            last_tool_name = tool_name

            tool_calls.append({
                "tool": tool_name,
                "parameters": parameters,
                "result_summary": result.get("summary")
            })

            # Send tool result back
            function_response = genai.protos.Part(
                function_response=genai.protos.FunctionResponse(
                    name=tool_name,
                    response={"result": result}
                )
            )

            response = chat.send_message(function_response)

        # Get final text; if empty synthesize from last tool
        final_text = response.text if getattr(response, 'text', None) else ""
        if not final_text and last_tool_result and last_tool_result.get("success"):
            try:
                final_text = self._synthesize_from_tool(last_tool_name or "tool", last_tool_result)
            except Exception:
                final_text = final_text or ""

        return final_text, tool_calls


# Global agent instance
agent = AIAgent()
