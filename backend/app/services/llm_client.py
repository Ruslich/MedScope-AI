"""
Enhanced LLM Client for medical claim analysis using OpenAI
"""
import os
import json
from typing import Optional, List, Dict, Any

try:
    from openai import AsyncOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    AsyncOpenAI = None


class LLMClient:
    """Enhanced client for LLM-based medical analysis using OpenAI"""

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

    async def analyze_medical_claim(
        self, 
        claim: str, 
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Use ChatGPT/OpenAI to analyze a medical claim comprehensively.
        
        Returns structured analysis including:
        - Evidence-based assessment
        - Risk factors
        - Key medical considerations
        - Relevant medical sources
        """
        if not self.enabled:
            return None

        try:
            system_prompt = """You are a medical information specialist with access to current medical literature and guidelines. 
Your role is to provide evidence-based analysis of medical claims. Always:
1. Base responses on established medical evidence
2. Reference authoritative sources (WHO, CDC, FDA, EMA, peer-reviewed journals)
3. Distinguish between supported, refuted, and inconclusive claims
4. Identify risk factors and safety concerns
5. Provide balanced, factual information
6. Emphasize consulting healthcare professionals for medical decisions

Format your response as JSON with the following structure:
{
    "evidence_assessment": "brief summary of what evidence says",
    "risk_factors": ["list of identified risk factors"],
    "key_considerations": ["important medical considerations"],
    "suggested_sources": ["WHO", "CDC", "FDA", etc.],
    "confidence_level": 0.0-1.0,
    "relation": "supports" | "refutes" | "inconclusive"
}"""

            user_prompt = f"""Analyze this medical claim: "{claim}"

"""
            if metadata:
                user_prompt += f"Additional context:\n"
                if metadata.get('compound'):
                    user_prompt += f"- Compound/Drug: {metadata['compound']}\n"
                if metadata.get('condition'):
                    user_prompt += f"- Condition: {metadata['condition']}\n"
                if metadata.get('claimType'):
                    user_prompt += f"- Claim Type: {metadata['claimType']}\n"
            
            user_prompt += """
Provide a comprehensive, evidence-based analysis. Focus on:
1. What does current medical evidence say about this claim?
2. What are the key risk factors or safety concerns?
3. What authoritative sources should be consulted?
4. What is the overall assessment (supports/refutes/inconclusive)?

Respond ONLY with valid JSON, no additional text."""

            response = await self.client.chat.completions.create(
                model="gpt-4o",  # Using GPT-4o for better medical analysis
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.2,  # Lower temperature for more factual responses
                max_tokens=1000,
                response_format={"type": "json_object"}
            )

            content = response.choices[0].message.content
            if content:
                return json.loads(content)
            return None
        except json.JSONDecodeError:
            # If JSON parsing fails, try to extract structured info
            try:
                content = response.choices[0].message.content
                # Fallback: return as text analysis
                return {
                    "evidence_assessment": content,
                    "risk_factors": [],
                    "key_considerations": [],
                    "suggested_sources": [],
                    "confidence_level": 0.7,
                    "relation": "inconclusive"
                }
            except:
                return None
        except Exception as e:
            print(f"OpenAI API error: {e}")
            return None

    async def search_medical_literature(
        self, 
        query: str, 
        max_results: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Use OpenAI to suggest relevant medical literature and sources.
        """
        if not self.enabled:
            return []

        try:
            prompt = f"""Given this medical query: "{query}"

Suggest specific medical sources, research papers, or guidelines that would be relevant. 
Format as JSON array:
[
    {{
        "source": "source name (e.g., WHO, CDC, PubMed, FDA)",
        "topic": "specific topic or paper title",
        "relevance": "why this source is relevant"
    }}
]

Limit to {max_results} most relevant sources. Respond ONLY with valid JSON array."""

            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a medical research assistant. Provide structured, factual information about medical sources."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=800,
                response_format={"type": "json_object"}
            )

            content = response.choices[0].message.content
            if content:
                data = json.loads(content)
                # Handle both array and object with array property
                if isinstance(data, list):
                    return data
                elif isinstance(data, dict) and "sources" in data:
                    return data["sources"]
                elif isinstance(data, dict) and len(data) == 1:
                    # Get first array value
                    for value in data.values():
                        if isinstance(value, list):
                            return value
            return []
        except Exception as e:
            print(f"Error searching medical literature: {e}")
            return []

    async def enhance_explanation(
        self, 
        claim: str, 
        evidence_summary: str,
        risk_level: str
    ) -> Optional[Dict[str, Any]]:
        """
        Use OpenAI to enhance and refine medical explanations.
        """
        if not self.enabled:
            return None

        try:
            prompt = f"""Enhance this medical explanation to be more comprehensive and accurate.

Claim: "{claim}"
Risk Level: {risk_level}
Current Evidence Summary: {evidence_summary}

Provide an enhanced explanation that:
1. Is more detailed and comprehensive
2. Better explains the medical context
3. Provides clearer guidance for patients
4. Maintains scientific accuracy

Format as JSON:
{{
    "enhanced_patient_explanation": "enhanced patient-friendly explanation",
    "enhanced_clinician_summary": "enhanced clinician summary",
    "additional_context": "any additional important context"
}}

Respond ONLY with valid JSON."""

            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a medical communication specialist. Enhance medical explanations to be clearer, more comprehensive, and more accurate while maintaining scientific rigor."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1200,
                response_format={"type": "json_object"}
            )

            content = response.choices[0].message.content
            if content:
                return json.loads(content)
            return None
        except Exception as e:
            print(f"Error enhancing explanation: {e}")
            return None
