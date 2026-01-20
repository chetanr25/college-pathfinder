import json
import os
from typing import Dict, Any, Optional, List
import google.generativeai as genai
from app.services import CollegeService

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

EXTRACTION_PROMPT = """You are an intent extraction system for a KCET college counseling chatbot. 
Extract structured information from the user's message. Return ONLY valid JSON, no other text.

INTENTS:
- colleges_by_rank: User wants colleges for their rank
- colleges_by_branch: User wants colleges offering specific branches
- colleges_by_rank_and_branch: User wants colleges for rank AND specific branches
- college_info: User wants info about a specific college
- compare_colleges: User wants to compare colleges
- analyze_rank: User wants rank analysis/prospects
- branch_popularity: User wants to know about branch competitiveness
- list_branches: User wants to see all available branches
- cutoff_trends: User wants cutoff trends for a college+branch
- email_report: User wants to send report to email
- conversational: General questions, greetings, advice, opinions, help

BRANCH EXPANSION RULES:
When user says "CS related" or "computer science and related", expand to:
["computer science", "information science", "artificial intelligence", "data science", "machine learning", "software engineering"]

When user says "core branches", expand to:
["computer science", "electronics", "electrical", "mechanical", "civil"]

When user says "IT related", expand to:
["computer science", "information science", "information technology"]

EXTRACTION RULES:
- "3k" or "3K" means 3000
- "32k" means 32000
- Round defaults to 1 if not specified
- Limit defaults to 20 if not specified
- Extract college names as user wrote them (we'll fuzzy match later)

OUTPUT FORMAT (return ONLY this JSON, nothing else):
{
  "intent": "one of the intents above",
  "rank": number or null,
  "round": 1 or 2 or 3,
  "limit": number,
  "branches": ["list", "of", "branch", "terms"] or null,
  "college_names": ["college", "names"] or null,
  "email": "email@example.com" or null,
  "query": "original search term if relevant" or null,
  "needs_gemini_response": true/false (true for conversational, advice, opinions)
}

Examples:
User: "top 30 CS colleges for rank 3k"
{"intent": "colleges_by_rank_and_branch", "rank": 3000, "round": 1, "limit": 30, "branches": ["computer science"], "college_names": null, "email": null, "query": null, "needs_gemini_response": false}

User: "computer science and related branches for rank 5000"
{"intent": "colleges_by_rank_and_branch", "rank": 5000, "round": 1, "limit": 20, "branches": ["computer science", "information science", "artificial intelligence", "data science", "machine learning"], "college_names": null, "email": null, "query": null, "needs_gemini_response": false}

User: "compare RV and PES college"
{"intent": "compare_colleges", "rank": null, "round": 1, "limit": 20, "branches": null, "college_names": ["RV", "PES"], "email": null, "query": null, "needs_gemini_response": false}

User: "what should I choose between CS and ECE?"
{"intent": "conversational", "rank": null, "round": 1, "limit": 20, "branches": ["computer science", "electronics"], "college_names": null, "email": null, "query": null, "needs_gemini_response": true}

User: "hello"
{"intent": "conversational", "rank": null, "round": 1, "limit": 20, "branches": null, "college_names": null, "email": null, "query": null, "needs_gemini_response": true}

User: "show me top 50 colleges for rank 10000"
{"intent": "colleges_by_rank", "rank": 10000, "round": 1, "limit": 50, "branches": null, "college_names": null, "email": null, "query": null, "needs_gemini_response": false}
"""


class IntentExtractor:
    def __init__(self):
        self.model = genai.GenerativeModel(
            model_name="gemini-2.0-flash-lite",
            generation_config={
                "temperature": 0.1,
                "max_output_tokens": 500,
            }
        )
    
    async def extract(self, message: str, context: str = "") -> Dict[str, Any]:
        prompt = f"{EXTRACTION_PROMPT}\n\nUser message: {message}"
        if context:
            prompt += f"\n\nConversation context: {context}"
        
        try:
            response = await self.model.generate_content_async(prompt)
            text = response.text.strip()
            
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            
            result = json.loads(text)
            return self._validate_and_enhance(result)
        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}, text was: {text[:200]}")
            return self._default_result(needs_gemini=True)
        except Exception as e:
            print(f"Intent extraction error: {e}")
            return self._default_result(needs_gemini=True)
    
    def _validate_and_enhance(self, result: Dict) -> Dict:
        defaults = {
            "intent": "conversational",
            "rank": None,
            "round": 1,
            "limit": 20,
            "branches": None,
            "college_names": None,
            "email": None,
            "query": None,
            "needs_gemini_response": True
        }
        
        for key, default in defaults.items():
            if key not in result:
                result[key] = default
        
        if result.get("rank") is not None:
            try:
                result["rank"] = int(result["rank"])
            except:
                result["rank"] = None
        
        if result.get("limit") is not None:
            try:
                result["limit"] = min(max(int(result["limit"]), 1), 200)
            except:
                result["limit"] = 20
        
        if result.get("round") not in [1, 2, 3]:
            result["round"] = 1
        
        return result
    
    def _default_result(self, needs_gemini: bool = True) -> Dict:
        return {
            "intent": "conversational",
            "rank": None,
            "round": 1,
            "limit": 20,
            "branches": None,
            "college_names": None,
            "email": None,
            "query": None,
            "needs_gemini_response": needs_gemini
        }
    
    def resolve_branches(self, branch_terms: List[str]) -> List[str]:
        if not branch_terms:
            return []
        
        resolved = []
        seen = set()
        
        for term in branch_terms:
            if not term or not isinstance(term, str):
                continue
            try:
                matches = CollegeService.match_branch_names(term.strip(), 3)
                for match in matches:
                    if match.get("match_score", 0) > 0.5:
                        branch_name = match.get("branch_name")
                        if branch_name and branch_name not in seen:
                            resolved.append(branch_name)
                            seen.add(branch_name)
            except Exception as e:
                print(f"Branch resolution error for '{term}': {e}")
                continue
        
        return resolved
    
    def resolve_college_codes(self, college_names: List[str]) -> List[str]:
        if not college_names:
            return []
        
        codes = []
        for name in college_names:
            if not name or not isinstance(name, str):
                continue
            try:
                results = CollegeService.search_college_by_name(name.strip(), 1)
                if results and results[0].get("match_score", 0) > 0.5:
                    code = results[0].get("college_code")
                    if code:
                        codes.append(code)
            except Exception as e:
                print(f"College resolution error for '{name}': {e}")
                continue
        
        return codes


intent_extractor = IntentExtractor()
