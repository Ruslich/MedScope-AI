"""
Medical Claim Understanding Engine

Extracts entities, classifies claim types, and identifies risk levels.
"""
import re
from typing import Dict, List, Optional, Tuple

from app.models import ClaimMetadata, ClaimType, RiskLevel


class ClaimUnderstandingEngine:
    """Engine for understanding and parsing medical claims"""

    # Common medical compounds/drugs
    DRUG_PATTERNS = [
        r"\b(?:ivermectin|ozempic|semaglutide|metformin|aspirin|ibuprofen|penicillin|insulin|warfarin|morphine)\b",
        r"\b(?:vitamin\s+[a-z]|vitamin\s+[a-z]\d+|vit\s+[a-z])\b",
        r"\b(?:herb|supplement|medication|drug|pharmaceutical)\b",
    ]

    # Medical conditions
    CONDITION_PATTERNS = [
        r"\b(?:covid|covid-19|coronavirus|diabetes|hypertension|pcos|polycystic\s+ovary|asthma|cancer|tumor)\b",
        r"\b(?:disease|syndrome|disorder|infection|inflammation)\b",
    ]

    # High-risk keywords
    HIGH_RISK_KEYWORDS = [
        "cancer",
        "chemotherapy",
        "pregnancy",
        "pregnant",
        "antiviral",
        "immunosuppressant",
        "blood thinner",
        "anticoagulant",
        "surgery",
        "transplant",
    ]

    # Medium-risk keywords
    MEDIUM_RISK_KEYWORDS = [
        "prescription",
        "pharmaceutical",
        "antibiotic",
        "antidepressant",
        "steroid",
        "hormone",
    ]

    # Low-risk keywords
    LOW_RISK_KEYWORDS = [
        "vitamin",
        "supplement",
        "herb",
        "home remedy",
        "diet",
        "exercise",
        "hydration",
    ]

    # Claim type patterns
    TREATMENT_PATTERNS = [
        r"\b(?:treats?|treatment|therapy|therapeutic|medication\s+for)\b",
        r"\b(?:used\s+to\s+treat|prescribed\s+for|effective\s+against)\b",
    ]

    PREVENTION_PATTERNS = [
        r"\b(?:prevents?|prevention|prevents?\s+from|protects?\s+against)\b",
        r"\b(?:reduces?\s+risk|lowers?\s+chance)\b",
    ]

    CURE_PATTERNS = [
        r"\b(?:cures?|cure\s+for|completely\s+heals?|eliminates?)\b",
        r"\b(?:100%\s+cure|guaranteed\s+cure|miracle\s+cure)\b",
    ]

    SAFETY_PATTERNS = [
        r"\b(?:safe|safety|side\s+effects?|adverse\s+reactions?|harmful|dangerous)\b",
        r"\b(?:causes?|leads?\s+to|results?\s+in)\b",
    ]

    INTERACTION_PATTERNS = [
        r"\b(?:interacts?\s+with|interaction|contraindicated|should\s+not\s+take\s+with)\b",
        r"\b(?:drug\s+interaction|medication\s+interaction)\b",
    ]

    EFFICACY_PATTERNS = [
        r"\b(?:effective|efficacy|works?\s+for|helps?\s+with|beneficial\s+for)\b",
        r"\b(?:proven\s+to|studies\s+show|research\s+indicates?)\b",
    ]

    def extract_compound(self, claim: str) -> Optional[str]:
        """Extract drug/compound name from claim"""
        claim_lower = claim.lower()

        # Check for specific drug names
        for pattern in self.DRUG_PATTERNS:
            match = re.search(pattern, claim_lower, re.IGNORECASE)
            if match:
                return match.group(0).strip()

        # Check for generic drug mentions
        drug_match = re.search(r"\b(drug|medication|pharmaceutical|compound)\s+([a-z]+)", claim_lower)
        if drug_match:
            return drug_match.group(2)

        return None

    def extract_condition(self, claim: str) -> Optional[str]:
        """Extract medical condition from claim"""
        claim_lower = claim.lower()

        for pattern in self.CONDITION_PATTERNS:
            match = re.search(pattern, claim_lower, re.IGNORECASE)
            if match:
                return match.group(0).strip()

        return None

    def classify_claim_type(self, claim: str) -> Optional[ClaimType]:
        """Classify the type of medical claim"""
        claim_lower = claim.lower()

        # Check patterns in order of specificity
        if any(re.search(pattern, claim_lower, re.IGNORECASE) for pattern in self.CURE_PATTERNS):
            return ClaimType.CURE
        if any(re.search(pattern, claim_lower, re.IGNORECASE) for pattern in self.TREATMENT_PATTERNS):
            return ClaimType.TREATMENT
        if any(re.search(pattern, claim_lower, re.IGNORECASE) for pattern in self.PREVENTION_PATTERNS):
            return ClaimType.PREVENTION
        if any(re.search(pattern, claim_lower, re.IGNORECASE) for pattern in self.SAFETY_PATTERNS):
            return ClaimType.SAFETY
        if any(re.search(pattern, claim_lower, re.IGNORECASE) for pattern in self.INTERACTION_PATTERNS):
            return ClaimType.INTERACTION
        if any(re.search(pattern, claim_lower, re.IGNORECASE) for pattern in self.EFFICACY_PATTERNS):
            return ClaimType.EFFICACY

        return None

    def assess_risk_level(self, claim: str, metadata: ClaimMetadata) -> RiskLevel:
        """Assess the risk level of the medical claim"""
        claim_lower = claim.lower()

        # Check for high-risk keywords
        if any(keyword in claim_lower for keyword in self.HIGH_RISK_KEYWORDS):
            return RiskLevel.HIGH

        # Check for medium-risk keywords
        if any(keyword in claim_lower for keyword in self.MEDIUM_RISK_KEYWORDS):
            return RiskLevel.MEDIUM

        # Check for low-risk keywords
        if any(keyword in claim_lower for keyword in self.LOW_RISK_KEYWORDS):
            return RiskLevel.LOW

        # Check metadata
        if metadata.compound:
            compound_lower = metadata.compound.lower()
            if any(keyword in compound_lower for keyword in self.HIGH_RISK_KEYWORDS):
                return RiskLevel.HIGH
            if any(keyword in compound_lower for keyword in self.MEDIUM_RISK_KEYWORDS):
                return RiskLevel.MEDIUM

        # Default to medium risk for unknown claims
        return RiskLevel.MEDIUM

    def understand_claim(self, claim: str) -> Tuple[ClaimMetadata, RiskLevel]:
        """Main method to understand a medical claim"""
        compound = self.extract_compound(claim)
        condition = self.extract_condition(claim)
        claim_type = self.classify_claim_type(claim)

        metadata = ClaimMetadata(
            compound=compound,
            condition=condition,
            claimType=claim_type,
        )

        risk_level = self.assess_risk_level(claim, metadata)

        return metadata, risk_level

