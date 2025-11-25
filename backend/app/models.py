"""
Pydantic models for MedScope AI API
"""
from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    """Risk level classification"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class ClaimType(str, Enum):
    """Type of medical claim"""
    TREATMENT = "treatment"
    PREVENTION = "prevention"
    CURE = "cure"
    SAFETY = "safety"
    INTERACTION = "interaction"
    EFFICACY = "efficacy"


class EvidenceRelation(str, Enum):
    """How evidence relates to the claim"""
    SUPPORTS = "supports"
    REFUTES = "refutes"
    INCONCLUSIVE = "inconclusive"


class EvidenceSource(BaseModel):
    """Evidence source from medical databases"""
    source: str = Field(..., description="Source name (WHO, CDC, PubMed, FDA, EMA, etc.)")
    summary: str = Field(..., description="Summary of the evidence")
    relation: EvidenceRelation = Field(..., description="How this evidence relates to the claim")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score (0-1)")
    url: Optional[str] = Field(None, description="URL to the source document")
    publishedDate: Optional[str] = Field(None, description="Publication date")


class TruthAssessment(BaseModel):
    """Truth assessment breakdown"""
    true: Optional[List[str]] = Field(default_factory=list, description="True aspects of the claim")
    false: Optional[List[str]] = Field(default_factory=list, description="False aspects of the claim")
    inconclusive: Optional[List[str]] = Field(
        default_factory=list, description="Inconclusive aspects of the claim"
    )


class MedicalExplanation(BaseModel):
    """Structured medical explanation"""
    patientFriendly: str = Field(..., description="Patient-friendly explanation")
    clinicianSummary: str = Field(..., description="Clinician-style summary")
    truthAssessment: TruthAssessment = Field(..., description="Truth assessment breakdown")
    warnings: Optional[List[str]] = Field(default_factory=list, description="Relevant warnings")
    contraindications: Optional[List[str]] = Field(
        default_factory=list, description="Contraindications"
    )
    alternatives: Optional[List[str]] = Field(
        default_factory=list, description="Safer alternatives if relevant"
    )
    confidence: float = Field(..., ge=0.0, le=1.0, description="Overall confidence score")
    suggestedActions: Optional[List[str]] = Field(
        default_factory=list, description="Suggested next actions (non-medical advice)"
    )


class ClaimMetadata(BaseModel):
    """Metadata extracted from the claim"""
    compound: Optional[str] = Field(None, description="Drug/compound name")
    condition: Optional[str] = Field(None, description="Medical condition")
    claimType: Optional[ClaimType] = Field(None, description="Type of claim")


class ClaimEvaluationRequest(BaseModel):
    """Request to evaluate a medical claim"""
    claim: str = Field(..., description="Medical claim to evaluate")
    includeDetailedEvidence: bool = Field(
        default=True, description="Whether to include detailed evidence sources"
    )


class ClaimEvaluationResponse(BaseModel):
    """Response from claim evaluation"""
    claim: str
    claimId: str = Field(..., description="Unique identifier for this claim")
    riskLevel: RiskLevel = Field(..., description="Assessed risk level")
    metadata: ClaimMetadata = Field(..., description="Extracted metadata")
    evidence: List[EvidenceSource] = Field(..., description="Evidence sources")
    explanation: MedicalExplanation = Field(..., description="Structured explanation")
    evaluatedAt: datetime = Field(default_factory=datetime.utcnow)


class PublishExplanationRequest(BaseModel):
    """Request to publish explanation to DKG"""
    claim: str
    claimId: str
    riskLevel: RiskLevel
    evidence: List[EvidenceSource]
    explanation: MedicalExplanation
    metadata: Optional[ClaimMetadata] = None


class PublishExplanationResponse(BaseModel):
    """Response from publishing explanation"""
    success: bool
    ual: Optional[str] = Field(None, description="Unique Asset Locator from DKG")
    claimId: str
    message: str


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

