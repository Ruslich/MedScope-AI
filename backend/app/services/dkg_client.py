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
        # Increased timeout for DKG operations (blockchain operations can take 60-1800 seconds)
        # Set explicit timeouts: connect, read, write, pool
        timeout_config = httpx.Timeout(
            connect=30.0,  # 30 seconds to establish connection
            read=1800.0,   # 30 minutes to read response (blockchain ops can be very slow)
            write=30.0,     # 30 seconds to write request
            pool=30.0       # 30 seconds to get connection from pool
        )
        self.client = httpx.AsyncClient(timeout=timeout_config)

    async def publish_explanation(
        self, request: PublishExplanationRequest
    ) -> PublishExplanationResponse:
        """Publish medical explanation to DKG"""
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            url = f"{self.base_url}/medscope/explanations"
            logger.info(f"=== DKG CLIENT: Publishing to {url} ===")
            
            # Convert to dict and handle enum serialization
            data = request.model_dump(mode='json')  # Use mode='json' to serialize enums properly
            logger.info(f"Original data keys: {list(data.keys())}")
            
            if data.get('metadata'):
                original_metadata = data['metadata'].copy()
                # Filter out None values and ensure enums are strings
                filtered_metadata = {}
                for k, v in data['metadata'].items():
                    if v is not None:
                        # Convert enum to string if needed
                        if hasattr(v, 'value'):
                            filtered_metadata[k] = v.value
                        else:
                            filtered_metadata[k] = v
                data['metadata'] = filtered_metadata
                logger.info(f"Metadata before filter: {original_metadata}")
                logger.info(f"Metadata after filter: {data['metadata']}")
            
            # Also handle enum serialization for riskLevel and evidence relations
            if 'riskLevel' in data and hasattr(data['riskLevel'], 'value'):
                data['riskLevel'] = data['riskLevel'].value
            
            if 'evidence' in data:
                for ev in data['evidence']:
                    if 'relation' in ev and hasattr(ev['relation'], 'value'):
                        ev['relation'] = ev['relation'].value
            
            logger.info(f"Sending request to DKG plugin...")
            logger.info(f"Request payload size: {len(str(data))} chars")
            logger.info(f"Request payload preview: {str(data)[:500]}...")
            
            response = await self.client.post(url, json=data)
            
            logger.info(f"DKG plugin response status: {response.status_code}")
            logger.info(f"DKG plugin response headers: {dict(response.headers)}")
            
            response_text = response.text
            logger.info(f"DKG plugin response body: {response_text[:1000]}...")
            
            if response.status_code == 200:
                response_data = response.json()
                logger.info(f"Parsed response data: {response_data}")
                # Handle both 'message' and 'error' fields for compatibility
                if 'error' in response_data and 'message' not in response_data:
                    response_data['message'] = response_data.pop('error')
                return PublishExplanationResponse(**response_data)
            else:
                error_msg = f"Failed to publish: {response.status_code} - {response_text}"
                logger.error(error_msg)
                return PublishExplanationResponse(
                    success=False,
                    claimId=request.claimId,
                    message=error_msg,
                )
        except httpx.ConnectError as e:
            logger.error(f"Connection error: Cannot connect to DKG node server at {self.base_url}")
            logger.error(f"Error: {e}")
            return PublishExplanationResponse(
                success=False,
                claimId=request.claimId,
                message=f"Cannot connect to DKG node server at {self.base_url}. Make sure the DKG node server is running.",
            )
        except httpx.ReadTimeout as e:
            logger.error(f"ReadTimeout: The DKG node server took too long to respond (30 minute timeout exceeded).")
            logger.error(f"This usually means the OT-Node connection is slow or the blockchain operation is taking longer than expected.")
            logger.error(f"Error details: {e}")
            return PublishExplanationResponse(
                success=False,
                claimId=request.claimId,
                message=f"DKG operation timed out after 30 minutes. The blockchain operation may be taking longer than expected. Check DKG node logs for details.",
            )
        except httpx.TimeoutException as e:
            logger.error(f"TimeoutException: Request timed out.")
            logger.error(f"Error details: {e}")
            return PublishExplanationResponse(
                success=False,
                claimId=request.claimId,
                message=f"Request timed out: {str(e)}",
            )
        except Exception as e:
            import traceback
            logger.error(f"Exception in DKG client: {type(e).__name__}: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
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

