"""
MedScope AI Backend - FastAPI Application
"""
import hashlib
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.models import (
    ClaimEvaluationRequest,
    ClaimEvaluationResponse,
    HealthResponse,
    PublishExplanationRequest,
    PublishExplanationResponse,
)
from app.services.claim_understanding import ClaimUnderstandingEngine
from app.services.dkg_client import DKGClient
from app.services.evidence_engine import EvidenceEngine
from app.services.explanation_generator import ExplanationGenerator
from app.services.llm_client import LLMClient

# Initialize services
claim_engine = ClaimUnderstandingEngine()
evidence_engine = EvidenceEngine()
explanation_generator = ExplanationGenerator()
llm_client = LLMClient()

# DKG client will be initialized with environment variable
dkg_client: DKGClient = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown"""
    global dkg_client
    import os

    dkg_base_url = os.getenv("DKG_BASE_URL", "http://localhost:9200")
    dkg_client = DKGClient(base_url=dkg_base_url)

    yield

    # Cleanup
    await evidence_engine.close()
    await dkg_client.close()


app = FastAPI(
    title="MedScope AI API",
    description="Medical claim evaluation and evidence alignment system",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(status="healthy")


@app.post("/api/claims/evaluate", response_model=ClaimEvaluationResponse)
async def evaluate_claim(request: ClaimEvaluationRequest):
    """
    Evaluate a medical claim and return structured analysis.
    
    This endpoint:
    1. Understands the claim (extracts entities, classifies type, assesses risk)
    2. Fetches evidence from medical sources
    3. Generates patient-friendly and clinician explanations
    """
    try:
        # Step 1: Understand the claim
        metadata, risk_level = claim_engine.understand_claim(request.claim)

        # Step 2: Fetch evidence
        evidence = await evidence_engine.fetch_evidence(
            request.claim,
            compound=metadata.compound,
            condition=metadata.condition,
            risk_level=risk_level,
        )

        # Step 3: Generate explanation
        explanation = explanation_generator.generate_explanation(
            request.claim, evidence, risk_level
        )

        # Generate unique claim ID
        claim_id = hashlib.sha256(request.claim.encode()).hexdigest()[:16]

        return ClaimEvaluationResponse(
            claim=request.claim,
            claimId=claim_id,
            riskLevel=risk_level,
            metadata=metadata,
            evidence=evidence if request.includeDetailedEvidence else [],
            explanation=explanation,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error evaluating claim: {str(e)}")


@app.post("/api/explanations/publish", response_model=PublishExplanationResponse)
async def publish_explanation(request: PublishExplanationRequest):
    """
    Publish a medical explanation to the DKG.
    
    This endpoint publishes the explanation as a Knowledge Asset on OriginTrail DKG.
    """
    if not dkg_client:
        raise HTTPException(status_code=500, detail="DKG client not initialized")

    try:
        response = await dkg_client.publish_explanation(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error publishing explanation: {str(e)}")


@app.get("/api/explanations/{claim_id}")
async def get_explanation(claim_id: str):
    """Get a published medical explanation from DKG"""
    if not dkg_client:
        raise HTTPException(status_code=500, detail="DKG client not initialized")

    try:
        explanation = await dkg_client.get_explanation(claim_id)
        if not explanation:
            raise HTTPException(status_code=404, detail="Explanation not found")
        return explanation
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching explanation: {str(e)}")


@app.get("/api/evidence/search")
async def search_evidence(
    keyword: str = None,
    risk_level: str = None,
    condition: str = None,
    compound: str = None,
    limit: int = 10,
):
    """Search medical evidence in DKG"""
    if not dkg_client:
        raise HTTPException(status_code=500, detail="DKG client not initialized")

    try:
        results = await dkg_client.search_evidence(
            keyword=keyword,
            risk_level=risk_level,
            condition=condition,
            compound=compound,
            limit=limit,
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching evidence: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

