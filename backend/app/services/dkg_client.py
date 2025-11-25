"""
DKG Client for publishing medical explanations
"""
import hashlib
from typing import Dict, Optional

import httpx

from app.models import PublishExplanationRequest, PublishExplanationResponse


class DKGClient:
    """Client for interacting with DKG Node"""

    def __init__(self, base_url: str = "http://localhost:9200"):
        self.base_url = base_url.rstrip("/")
        self.client = httpx.AsyncClient(timeout=30.0)

    async def publish_explanation(
        self, request: PublishExplanationRequest
    ) -> PublishExplanationResponse:
        """Publish medical explanation to DKG"""
        try:
            url = f"{self.base_url}/medscope/explanations"
            response = await self.client.post(url, json=request.model_dump())

            if response.status_code == 200:
                data = response.json()
                return PublishExplanationResponse(**data)
            else:
                return PublishExplanationResponse(
                    success=False,
                    claimId=request.claimId,
                    message=f"Failed to publish: {response.status_code} - {response.text}",
                )
        except Exception as e:
            return PublishExplanationResponse(
                success=False,
                claimId=request.claimId,
                message=f"Error publishing to DKG: {str(e)}",
            )

    async def get_explanation(self, claim_id: str) -> Optional[Dict]:
        """Get medical explanation from DKG"""
        try:
            url = f"{self.base_url}/medscope/explanations/{claim_id}"
            response = await self.client.get(url)

            if response.status_code == 200:
                data = response.json()
                return data if data.get("found") else None
            return None
        except Exception:
            return None

    async def search_evidence(
        self,
        keyword: Optional[str] = None,
        risk_level: Optional[str] = None,
        condition: Optional[str] = None,
        compound: Optional[str] = None,
        limit: int = 10,
    ) -> Dict:
        """Search medical evidence in DKG"""
        try:
            url = f"{self.base_url}/medscope/evidence"
            params = {}
            if keyword:
                params["keyword"] = keyword
            if risk_level:
                params["riskLevel"] = risk_level
            if condition:
                params["condition"] = condition
            if compound:
                params["compound"] = compound
            params["limit"] = limit

            response = await self.client.get(url, params=params)

            if response.status_code == 200:
                return response.json()
            return {"found": 0, "results": []}
        except Exception as e:
            return {"found": 0, "results": [], "error": str(e)}

    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

    def __del__(self):
        """Cleanup"""
        try:
            import asyncio
            loop = asyncio.get_event_loop()
            if loop.is_running():
                loop.create_task(self.client.aclose())
            else:
                loop.run_until_complete(self.client.aclose())
        except Exception:
            pass

