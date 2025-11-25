"""
LLM Client for enhanced claim analysis
"""
import os
from typing import Optional

try:
    import openai
    from openai import AsyncOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    AsyncOpenAI = None


class LLMClient:
    """Client for LLM-based analysis (optional enhancement)"""

    def __init__(self, api_key: Optional[str] = None):
        if not OPENAI_AVAILABLE:
            self.client = None
            self.enabled = False
            return
            
        api_key = api_key or os.getenv("OPENAI_API_KEY")
        if api_key:
            self.client = AsyncOpenAI(api_key=api_key)
            self.enabled = True
        else:
            self.client = None
            self.enabled = False

    async def enhance_analysis(self, claim: str, context: str) -> Optional[str]:
        """Use LLM to enhance medical claim analysis (optional)"""
        if not self.enabled:
            return None

        try:
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a medical information assistant. Provide factual, evidence-based analysis. "
                        "Always emphasize consulting healthcare professionals for medical decisions.",
                    },
                    {
                        "role": "user",
                        "content": f"Medical claim: {claim}\n\nContext: {context}\n\n"
                        "Provide a brief, evidence-based analysis of this claim.",
                    },
                ],
                temperature=0.3,
                max_tokens=300,
            )

            return response.choices[0].message.content
        except Exception:
            return None

