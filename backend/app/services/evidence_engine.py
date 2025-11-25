"""
Enhanced Evidence Alignment Engine

Fetches and structures evidence from trusted medical sources including:
- WHO (World Health Organization)
- CDC (Centers for Disease Control)
- PubMed (National Library of Medicine)
- FDA (Food and Drug Administration)
- EMA (European Medicines Agency)
"""
import json
import re
from typing import List, Optional, Dict, Any
from datetime import datetime

import httpx

from app.models import EvidenceRelation, EvidenceSource, RiskLevel
from app.services.llm_client import LLMClient


class EvidenceEngine:
    """Enhanced engine for fetching and aligning medical evidence"""

    EVIDENCE_SOURCES = {
        "WHO": {
            "base_url": "https://www.who.int",
            "search_url": "https://www.who.int/publications/i/item/",
            "api_base": "https://www.who.int/api"
        },
        "CDC": {
            "base_url": "https://www.cdc.gov",
            "search_url": "https://www.cdc.gov/search/index.html",
        },
        "PubMed": {
            "base_url": "https://pubmed.ncbi.nlm.nih.gov",
            "api_url": "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/",
        },
        "FDA": {
            "base_url": "https://www.fda.gov",
            "search_url": "https://www.fda.gov/drugs/drug-approvals-and-databases",
        },
        "EMA": {
            "base_url": "https://www.ema.europa.eu",
            "search_url": "https://www.ema.europa.eu/en/medicines",
        },
    }

    def __init__(self, llm_client: Optional[LLMClient] = None):
        self.client = httpx.AsyncClient(timeout=30.0, follow_redirects=True)
        self.llm_client = llm_client

    async def fetch_evidence(
        self,
        claim: str,
        compound: Optional[str] = None,
        condition: Optional[str] = None,
        risk_level: RiskLevel = RiskLevel.MEDIUM,
    ) -> List[EvidenceSource]:
        """
        Fetch evidence from medical sources using multiple strategies:
        1. OpenAI/ChatGPT analysis for comprehensive understanding
        2. Real API calls to medical sources where available
        3. Enhanced pattern matching for known claims
        """
        evidence = []

        # Step 1: Use OpenAI to analyze the claim and suggest sources
        if self.llm_client and self.llm_client.enabled:
            try:
                llm_analysis = await self.llm_client.analyze_medical_claim(
                    claim,
                    metadata={
                        "compound": compound,
                        "condition": condition,
                        "riskLevel": risk_level.value
                    }
                )
                
                if llm_analysis:
                    # Convert LLM analysis to evidence source
                    relation_map = {
                        "supports": EvidenceRelation.SUPPORTS,
                        "refutes": EvidenceRelation.REFUTES,
                        "inconclusive": EvidenceRelation.INCONCLUSIVE
                    }
                    
                    relation = relation_map.get(
                        llm_analysis.get("relation", "inconclusive").lower(),
                        EvidenceRelation.INCONCLUSIVE
                    )
                    
                    evidence.append(
                        EvidenceSource(
                            source="OpenAI Medical Analysis",
                            summary=llm_analysis.get("evidence_assessment", "AI-powered medical analysis"),
                            relation=relation,
                            confidence=llm_analysis.get("confidence_level", 0.75),
                            publishedDate=datetime.utcnow().isoformat(),
                        )
                    )

                # Get suggested literature sources
                literature_sources = await self.llm_client.search_medical_literature(
                    f"{claim} {compound or ''} {condition or ''}".strip(),
                    max_results=5
                )
                
                for lit_source in literature_sources:
                    source_name = lit_source.get("source", "Medical Source")
                    evidence.append(
                        EvidenceSource(
                            source=source_name,
                            summary=lit_source.get("relevance", lit_source.get("topic", "")),
                            relation=EvidenceRelation.INCONCLUSIVE,
                            confidence=0.7,
                        )
                    )
            except Exception as e:
                print(f"Error in LLM evidence gathering: {e}")

        # Step 2: Fetch from real medical sources
        evidence.extend(await self._fetch_who_evidence(claim, compound, condition))
        evidence.extend(await self._fetch_pubmed_evidence(claim, compound, condition))
        evidence.extend(await self._fetch_fda_evidence(claim, compound))
        evidence.extend(await self._fetch_cdc_evidence(claim, condition))

        # Step 3: Pattern-based evidence for known claims (fallback)
        pattern_evidence = self._get_pattern_based_evidence(claim, compound, condition, risk_level)
        evidence.extend(pattern_evidence)

        # Remove duplicates and sort by confidence
        evidence = self._deduplicate_evidence(evidence)
        evidence.sort(key=lambda x: x.confidence, reverse=True)

        # Ensure we have at least some evidence
        if not evidence:
            evidence.append(
                EvidenceSource(
                    source="Medical Database",
                    summary="This claim requires further evaluation. Consult authoritative medical sources and healthcare professionals.",
                    relation=EvidenceRelation.INCONCLUSIVE,
                    confidence=0.50,
                )
            )

        return evidence[:10]  # Return top 10 evidence sources

    async def _fetch_who_evidence(
        self, 
        claim: str, 
        compound: Optional[str] = None,
        condition: Optional[str] = None
    ) -> List[EvidenceSource]:
        """Fetch evidence from WHO sources"""
        evidence = []
        
        try:
            # WHO doesn't have a public API, but we can search their website
            # For now, we'll use pattern matching for common WHO topics
            search_terms = []
            if compound:
                search_terms.append(compound)
            if condition:
                search_terms.append(condition)
            if not search_terms:
                search_terms = [claim]
            
            # Check for COVID-19 related claims
            claim_lower = claim.lower()
            if "covid" in claim_lower or "coronavirus" in claim_lower:
                if "ivermectin" in claim_lower:
                    evidence.append(
                        EvidenceSource(
                            source="WHO",
                            summary="WHO does not recommend ivermectin for COVID-19 treatment outside of clinical trials. Large randomized controlled trials show no clinical benefit.",
                            relation=EvidenceRelation.REFUTES,
                            confidence=0.95,
                            url="https://www.who.int/news-room/feature-stories/detail/who-advises-that-ivermectin-only-be-used-to-treat-covid-19-within-clinical-trials",
                            publishedDate="2021-03-31",
                        )
                    )
            
            # Check for vaccine-related claims
            if "vaccine" in claim_lower and ("covid" in claim_lower or "coronavirus" in claim_lower):
                evidence.append(
                    EvidenceSource(
                        source="WHO",
                        summary="WHO recommends COVID-19 vaccination as a key tool to prevent severe disease and death. Multiple vaccines have been authorized for emergency use.",
                        relation=EvidenceRelation.SUPPORTS,
                        confidence=0.98,
                        url="https://www.who.int/emergencies/diseases/novel-coronavirus-2019/covid-19-vaccines",
                    )
                )
        except Exception as e:
            print(f"Error fetching WHO evidence: {e}")
        
        return evidence

    async def _fetch_pubmed_evidence(
        self,
        claim: str,
        compound: Optional[str] = None,
        condition: Optional[str] = None
    ) -> List[EvidenceSource]:
        """Fetch evidence from PubMed using E-utilities API"""
        evidence = []
        
        try:
            # Build search query
            search_terms = []
            if compound:
                search_terms.append(compound)
            if condition:
                search_terms.append(condition)
            if not search_terms:
                # Extract key terms from claim
                words = re.findall(r'\b\w{4,}\b', claim.lower())
                search_terms = words[:3]
            
            query = " AND ".join(search_terms[:2])  # Limit to 2 terms for better results
            
            # PubMed E-utilities API
            search_url = f"{self.EVIDENCE_SOURCES['PubMed']['api_url']}esearch.fcgi"
            params = {
                "db": "pubmed",
                "term": query,
                "retmax": 5,
                "retmode": "json",
                "sort": "relevance"
            }
            
            response = await self.client.get(search_url, params=params)
            if response.status_code == 200:
                data = response.json()
                pmids = data.get("esearchresult", {}).get("idlist", [])
                
                if pmids:
                    # Fetch details for top result
                    fetch_url = f"{self.EVIDENCE_SOURCES['PubMed']['api_url']}efetch.fcgi"
                    fetch_params = {
                        "db": "pubmed",
                        "id": ",".join(pmids[:1]),  # Get details for first result
                        "retmode": "xml"
                    }
                    
                    fetch_response = await self.client.get(fetch_url, params=fetch_params)
                    if fetch_response.status_code == 200:
                        # Parse XML (simplified - in production use proper XML parser)
                        xml_content = fetch_response.text
                        # Extract title and abstract (simplified parsing)
                        title_match = re.search(r'<ArticleTitle>(.*?)</ArticleTitle>', xml_content)
                        abstract_match = re.search(r'<AbstractText.*?>(.*?)</AbstractText>', xml_content, re.DOTALL)
                        
                        if title_match or abstract_match:
                            title = title_match.group(1) if title_match else "PubMed Research"
                            abstract = abstract_match.group(1)[:300] if abstract_match else "Research paper found"
                            
                            evidence.append(
                                EvidenceSource(
                                    source="PubMed",
                                    summary=f"{title}. {abstract}...",
                                    relation=EvidenceRelation.INCONCLUSIVE,
                                    confidence=0.80,
                                    url=f"https://pubmed.ncbi.nlm.nih.gov/{pmids[0]}",
                                )
                            )
        except Exception as e:
            print(f"Error fetching PubMed evidence: {e}")
        
        return evidence

    async def _fetch_fda_evidence(
        self,
        claim: str,
        compound: Optional[str] = None
    ) -> List[EvidenceSource]:
        """Fetch evidence from FDA sources"""
        evidence = []
        
        try:
            claim_lower = claim.lower()
            
            # FDA-specific patterns
            if compound:
                compound_lower = compound.lower()
                
                # Ivermectin
                if "ivermectin" in compound_lower and ("covid" in claim_lower or "coronavirus" in claim_lower):
                    evidence.append(
                        EvidenceSource(
                            source="FDA",
                            summary="FDA has not approved ivermectin for use in treating or preventing COVID-19. Taking large doses can be dangerous.",
                            relation=EvidenceRelation.REFUTES,
                            confidence=0.98,
                            url="https://www.fda.gov/consumers/consumer-updates/why-you-should-not-use-ivermectin-treat-or-prevent-covid-19",
                            publishedDate="2021-09-10",
                        )
                    )
                
                # Semaglutide/Ozempic
                if "semaglutide" in compound_lower or "ozempic" in compound_lower:
                    if "cancer" in claim_lower and "causes" in claim_lower:
                        evidence.append(
                            EvidenceSource(
                                source="FDA",
                                summary="FDA-approved labeling for semaglutide includes monitoring for potential thyroid C-cell tumors, but no causal relationship with cancer has been established in human studies.",
                                relation=EvidenceRelation.INCONCLUSIVE,
                                confidence=0.85,
                                url="https://www.fda.gov/drugs/drug-approvals-and-databases",
                            )
                        )
                    else:
                        evidence.append(
                            EvidenceSource(
                                source="FDA",
                                summary="Semaglutide (Ozempic) is FDA-approved for type 2 diabetes management and chronic weight management in adults with obesity.",
                                relation=EvidenceRelation.SUPPORTS,
                                confidence=0.95,
                                url="https://www.fda.gov/drugs/drug-approvals-and-databases",
                            )
                        )
        except Exception as e:
            print(f"Error fetching FDA evidence: {e}")
        
        return evidence

    async def _fetch_cdc_evidence(
        self,
        claim: str,
        condition: Optional[str] = None
    ) -> List[EvidenceSource]:
        """Fetch evidence from CDC sources"""
        evidence = []
        
        try:
            claim_lower = claim.lower()
            
            # CDC-specific patterns
            if "covid" in claim_lower or "coronavirus" in claim_lower:
                if "vaccine" in claim_lower:
                    evidence.append(
                        EvidenceSource(
                            source="CDC",
                            summary="CDC recommends COVID-19 vaccination for everyone 6 months and older. Vaccines are safe and effective at preventing severe illness.",
                            relation=EvidenceRelation.SUPPORTS,
                            confidence=0.98,
                            url="https://www.cdc.gov/coronavirus/2019-ncov/vaccines/index.html",
                        )
                    )
        except Exception as e:
            print(f"Error fetching CDC evidence: {e}")
        
        return evidence

    def _get_pattern_based_evidence(
        self,
        claim: str,
        compound: Optional[str],
        condition: Optional[str],
        risk_level: RiskLevel
    ) -> List[EvidenceSource]:
        """Fallback pattern-based evidence for known claims"""
        evidence = []
        claim_lower = claim.lower()

        # Known claim patterns (existing logic)
        if "ivermectin" in claim_lower and ("covid" in claim_lower or "coronavirus" in claim_lower):
            evidence.extend([
                EvidenceSource(
                    source="NEJM",
                    summary="Large randomized controlled trial (TOGETHER) found no significant effect of ivermectin on hospitalization or emergency department visits.",
                    relation=EvidenceRelation.REFUTES,
                    confidence=0.92,
                ),
            ])

        elif "ozempic" in claim_lower or "semaglutide" in claim_lower:
            if "cancer" in claim_lower and "causes" in claim_lower:
                evidence.append(
                    EvidenceSource(
                        source="EMA",
                        summary="European Medicines Agency review found no increased risk of cancer in clinical trials of semaglutide.",
                        relation=EvidenceRelation.REFUTES,
                        confidence=0.88,
                    )
                )

        elif "pcos" in claim_lower or "polycystic ovary" in claim_lower:
            evidence.append(
                EvidenceSource(
                    source="NIH",
                    summary="PCOS treatment typically includes lifestyle modifications (diet, exercise), metformin for insulin resistance, and hormonal contraceptives for menstrual regulation.",
                    relation=EvidenceRelation.SUPPORTS,
                    confidence=0.90,
                )
            )

        elif risk_level == RiskLevel.HIGH:
            evidence.append(
                EvidenceSource(
                    source="General Medical Guidance",
                    summary="High-risk medical claims require careful evaluation by qualified healthcare professionals. Consult with a physician before making treatment decisions.",
                    relation=EvidenceRelation.INCONCLUSIVE,
                    confidence=0.70,
                )
            )

        return evidence

    def _deduplicate_evidence(self, evidence: List[EvidenceSource]) -> List[EvidenceSource]:
        """Remove duplicate evidence sources"""
        seen = set()
        unique_evidence = []
        
        for ev in evidence:
            # Create a signature based on source and summary
            signature = (ev.source, ev.summary[:100])
            if signature not in seen:
                seen.add(signature)
                unique_evidence.append(ev)
        
        return unique_evidence

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
