"""
Evidence Alignment Engine

Fetches and structures evidence from trusted medical sources.
"""
import hashlib
import json
from typing import List, Optional

import httpx

from app.models import EvidenceRelation, EvidenceSource, RiskLevel


class EvidenceEngine:
    """Engine for fetching and aligning medical evidence"""

    # Mock evidence database - in production, this would query real APIs
    EVIDENCE_SOURCES = {
        "WHO": "https://www.who.int/health-topics/",
        "CDC": "https://www.cdc.gov/",
        "PubMed": "https://pubmed.ncbi.nlm.nih.gov/",
        "FDA": "https://www.fda.gov/drugs/",
        "EMA": "https://www.ema.europa.eu/",
    }

    def __init__(self):
        self.client = httpx.AsyncClient(timeout=10.0)

    async def fetch_evidence(
        self,
        claim: str,
        compound: Optional[str] = None,
        condition: Optional[str] = None,
        risk_level: RiskLevel = RiskLevel.MEDIUM,
    ) -> List[EvidenceSource]:
        """
        Fetch evidence from medical sources.
        
        In a real implementation, this would:
        1. Query PubMed API for research papers
        2. Query FDA/EMA databases for drug information
        3. Query WHO/CDC for public health guidance
        4. Parse and structure the results
        """
        evidence = []

        # For now, generate structured mock evidence based on claim analysis
        # In production, this would make real API calls

        claim_lower = claim.lower()

        # Example: Ivermectin and COVID-19
        if "ivermectin" in claim_lower and ("covid" in claim_lower or "coronavirus" in claim_lower):
            evidence.extend([
                EvidenceSource(
                    source="WHO",
                    summary="WHO does not recommend ivermectin for COVID-19 treatment outside of clinical trials. Large randomized controlled trials show no clinical benefit.",
                    relation=EvidenceRelation.REFUTES,
                    confidence=0.95,
                    url="https://www.who.int/news-room/feature-stories/detail/who-advises-that-ivermectin-only-be-used-to-treat-covid-19-within-clinical-trials",
                ),
                EvidenceSource(
                    source="FDA",
                    summary="FDA has not approved ivermectin for use in treating or preventing COVID-19. Taking large doses can be dangerous.",
                    relation=EvidenceRelation.REFUTES,
                    confidence=0.98,
                    url="https://www.fda.gov/consumers/consumer-updates/why-you-should-not-use-ivermectin-treat-or-prevent-covid-19",
                ),
                EvidenceSource(
                    source="NEJM",
                    summary="Large randomized controlled trial (TOGETHER) found no significant effect of ivermectin on hospitalization or emergency department visits.",
                    relation=EvidenceRelation.REFUTES,
                    confidence=0.92,
                ),
            ])

        # Example: Ozempic and cancer
        elif "ozempic" in claim_lower or "semaglutide" in claim_lower:
            if "cancer" in claim_lower and "causes" in claim_lower:
                evidence.extend([
                    EvidenceSource(
                        source="FDA",
                        summary="FDA-approved labeling for semaglutide (Ozempic) includes monitoring for potential thyroid C-cell tumors, but no causal relationship with cancer has been established in human studies.",
                        relation=EvidenceRelation.INCONCLUSIVE,
                        confidence=0.85,
                    ),
                    EvidenceSource(
                        source="EMA",
                        summary="European Medicines Agency review found no increased risk of cancer in clinical trials of semaglutide.",
                        relation=EvidenceRelation.REFUTES,
                        confidence=0.88,
                    ),
                ])
            else:
                evidence.extend([
                    EvidenceSource(
                        source="FDA",
                        summary="Semaglutide (Ozempic) is FDA-approved for type 2 diabetes management and chronic weight management in adults with obesity.",
                        relation=EvidenceRelation.SUPPORTS,
                        confidence=0.95,
                    ),
                ])

        # Example: PCOS treatment
        elif "pcos" in claim_lower or "polycystic ovary" in claim_lower:
            evidence.extend([
                EvidenceSource(
                    source="NIH",
                    summary="PCOS treatment typically includes lifestyle modifications (diet, exercise), metformin for insulin resistance, and hormonal contraceptives for menstrual regulation.",
                    relation=EvidenceRelation.SUPPORTS,
                    confidence=0.90,
                ),
            ])

        # Generic high-risk claim handling
        elif risk_level == RiskLevel.HIGH:
            evidence.append(
                EvidenceSource(
                    source="General Medical Guidance",
                    summary="High-risk medical claims require careful evaluation by qualified healthcare professionals. Consult with a physician before making treatment decisions.",
                    relation=EvidenceRelation.INCONCLUSIVE,
                    confidence=0.70,
                )
            )

        # Default evidence for unknown claims
        if not evidence:
            evidence.append(
                EvidenceSource(
                    source="Medical Database",
                    summary="This claim requires further evaluation. Consult authoritative medical sources and healthcare professionals.",
                    relation=EvidenceRelation.INCONCLUSIVE,
                    confidence=0.50,
                )
            )

        return evidence

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

