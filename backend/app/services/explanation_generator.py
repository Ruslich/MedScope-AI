"""
Medical Explanation Generator

Generates patient-friendly and clinician-style explanations from evidence.
"""
from typing import List

from app.models import (
    EvidenceRelation,
    EvidenceSource,
    MedicalExplanation,
    RiskLevel,
    TruthAssessment,
)


class ExplanationGenerator:
    """Generator for medical explanations"""

    def generate_explanation(
        self,
        claim: str,
        evidence: List[EvidenceSource],
        risk_level: RiskLevel,
    ) -> MedicalExplanation:
        """Generate structured medical explanation from evidence"""

        # Analyze evidence to determine truth assessment
        supporting = [e for e in evidence if e.relation == EvidenceRelation.SUPPORTS]
        refuting = [e for e in evidence if e.relation == EvidenceRelation.REFUTES]
        inconclusive = [e for e in evidence if e.relation == EvidenceRelation.INCONCLUSIVE]

        # Calculate overall confidence
        if evidence:
            avg_confidence = sum(e.confidence for e in evidence) / len(evidence)
        else:
            avg_confidence = 0.5

        # Generate truth assessment
        truth_assessment = TruthAssessment(
            true=[e.summary for e in supporting[:3]],  # Top 3 supporting points
            false=[e.summary for e in refuting[:3]],  # Top 3 refuting points
            inconclusive=[e.summary for e in inconclusive[:2]],  # Top 2 inconclusive points
        )

        # Generate patient-friendly explanation
        patient_friendly = self._generate_patient_friendly(
            claim, supporting, refuting, inconclusive, risk_level
        )

        # Generate clinician summary
        clinician_summary = self._generate_clinician_summary(
            claim, evidence, supporting, refuting, inconclusive
        )

        # Extract warnings and contraindications
        warnings = self._extract_warnings(claim, risk_level, refuting)
        contraindications = self._extract_contraindications(claim, risk_level, refuting)
        alternatives = self._suggest_alternatives(claim, supporting, refuting)

        # Suggested actions
        suggested_actions = self._suggest_actions(risk_level, refuting, inconclusive)

        return MedicalExplanation(
            patientFriendly=patient_friendly,
            clinicianSummary=clinician_summary,
            truthAssessment=truth_assessment,
            warnings=warnings,
            contraindications=contraindications,
            alternatives=alternatives,
            confidence=avg_confidence,
            suggestedActions=suggested_actions,
        )

    def _generate_patient_friendly(
        self,
        claim: str,
        supporting: List[EvidenceSource],
        refuting: List[EvidenceSource],
        inconclusive: List[EvidenceSource],
        risk_level: RiskLevel,
    ) -> str:
        """Generate patient-friendly explanation"""
        parts = [f"Regarding the claim: '{claim}'"]

        if refuting:
            parts.append(
                f"Medical evidence from authoritative sources ({', '.join(set(e.source for e in refuting[:3]))}) "
                f"indicates this claim is not supported by current research."
            )
        elif supporting:
            parts.append(
                f"Medical evidence from authoritative sources ({', '.join(set(e.source for e in supporting[:3]))}) "
                f"supports aspects of this claim."
            )
        else:
            parts.append("The evidence for this claim is currently inconclusive.")

        if risk_level == RiskLevel.HIGH:
            parts.append(
                "⚠️ This involves high-risk medical decisions. Please consult with a qualified healthcare "
                "professional before taking any action."
            )

        parts.append(
            "This information is for educational purposes only and does not constitute medical advice."
        )

        return " ".join(parts)

    def _generate_clinician_summary(
        self,
        claim: str,
        evidence: List[EvidenceSource],
        supporting: List[EvidenceSource],
        refuting: List[EvidenceSource],
        inconclusive: List[EvidenceSource],
    ) -> str:
        """Generate clinician-style summary"""
        parts = [f"Clinical Summary: {claim}"]

        if evidence:
            parts.append(f"\nEvidence Review ({len(evidence)} sources):")

            if supporting:
                parts.append(f"\nSupporting Evidence ({len(supporting)} sources):")
                for i, ev in enumerate(supporting[:3], 1):
                    parts.append(f"  {i}. [{ev.source}] {ev.summary} (confidence: {ev.confidence:.2f})")

            if refuting:
                parts.append(f"\nRefuting Evidence ({len(refuting)} sources):")
                for i, ev in enumerate(refuting[:3], 1):
                    parts.append(f"  {i}. [{ev.source}] {ev.summary} (confidence: {ev.confidence:.2f})")

            if inconclusive:
                parts.append(f"\nInconclusive Evidence ({len(inconclusive)} sources):")
                for i, ev in enumerate(inconclusive[:2], 1):
                    parts.append(f"  {i}. [{ev.source}] {ev.summary} (confidence: {ev.confidence:.2f})")

        parts.append("\nRecommendation: Evaluate patient-specific factors and consult current clinical guidelines.")

        return "\n".join(parts)

    def _extract_warnings(
        self, claim: str, risk_level: RiskLevel, refuting: List[EvidenceSource]
    ) -> List[str]:
        """Extract relevant warnings"""
        warnings = []

        if risk_level == RiskLevel.HIGH:
            warnings.append(
                "High-risk medical intervention. Requires careful evaluation by qualified healthcare professionals."
            )

        if refuting:
            warnings.append(
                "Current medical evidence does not support this claim. Proceeding without medical supervision may be dangerous."
            )

        if "covid" in claim.lower() or "coronavirus" in claim.lower():
            warnings.append(
                "COVID-19 treatments should only be used under medical supervision and according to approved guidelines."
            )

        return warnings

    def _extract_contraindications(
        self, claim: str, risk_level: RiskLevel, refuting: List[EvidenceSource]
    ) -> List[str]:
        """Extract contraindications"""
        contraindications = []

        if "pregnancy" in claim.lower() or "pregnant" in claim.lower():
            contraindications.append("May not be safe during pregnancy. Consult obstetrician.")

        if risk_level == RiskLevel.HIGH and refuting:
            contraindications.append(
                "Not recommended without medical supervision due to lack of supporting evidence."
            )

        return contraindications

    def _suggest_alternatives(
        self, claim: str, supporting: List[EvidenceSource], refuting: List[EvidenceSource]
    ) -> List[str]:
        """Suggest safer alternatives if relevant"""
        alternatives = []

        if refuting and not supporting:
            # If claim is refuted, suggest evidence-based alternatives
            if "ivermectin" in claim.lower() and "covid" in claim.lower():
                alternatives.append(
                    "Evidence-based COVID-19 treatments include approved vaccines, antiviral medications "
                    "(e.g., Paxlovid, Remdesivir) when prescribed by a healthcare provider."
                )

        return alternatives

    def _suggest_actions(
        self, risk_level: RiskLevel, refuting: List[EvidenceSource], inconclusive: List[EvidenceSource]
    ) -> List[str]:
        """Suggest next actions (non-medical advice)"""
        actions = []

        if risk_level == RiskLevel.HIGH:
            actions.append("Consult with a qualified healthcare professional immediately.")

        if refuting:
            actions.append("Review evidence from authoritative medical sources (WHO, CDC, FDA, etc.).")

        if inconclusive:
            actions.append("Seek additional information from trusted medical sources.")

        actions.append("Discuss with your healthcare provider before making any medical decisions.")

        return actions

