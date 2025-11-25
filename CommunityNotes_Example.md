Example 1:
https://dkg-testnet.origintrail.io/explore?ual=did%3Adkg%3Aotp%3A20430%2F0xcdb28e93ed340ec10a71bba00a31dbfcf1bd5d37%2F403543
```json
[
  {
    "@id": "https://medscope.ai/schema/explanation:0db03ab088423337",
    "https://schema.org/publisher": [
      {
        "@value": "MedScope AI"
      }
    ],
    "https://schema.org/claim": [
      {
        "@value": "PCOS treatment options"
      }
    ],
    "https://schema.org/claimId": [
      {
        "@value": "0db03ab088423337"
      }
    ],
    "https://schema.org/evidence": [
      {
        "@id": "uuid:c7e8baf5-ab24-4bcf-88f7-0097a7530692"
      }
    ],
    "https://schema.org/explanation": [
      {
        "@id": "uuid:3e7e33fd-a7d1-4212-836e-2140c6824ae7"
      }
    ],
    "https://schema.org/metadata": [
      {
        "@id": "uuid:6d9036ff-76c0-487a-8087-ed02122e53c2"
      }
    ],
    "https://schema.org/publishedAt": [
      {
        "@value": "2025-11-25T14:47:16.076Z"
      }
    ],
    "https://schema.org/riskLevel": [
      {
        "@value": "medium"
      }
    ],
    "@type": [
      "https://schema.org/MedicalExplanation"
    ]
  },
  {
    "@id": "uuid:3e7e33fd-a7d1-4212-836e-2140c6824ae7",
    "https://schema.org/clinicianSummary": [
      {
        "@value": "Clinical Summary: PCOS treatment options\n\nEvidence Review (1 sources):\n\nSupporting Evidence (1 sources):\n  1. [NIH] PCOS treatment typically includes lifestyle modifications (diet, exercise), metformin for insulin resistance, and hormonal contraceptives for menstrual regulation. (confidence: 0.90)\n\nRecommendation: Evaluate patient-specific factors and consult current clinical guidelines."
      }
    ],
    "https://schema.org/confidence": [
      {
        "@value": "0.9",
        "@type": "http://www.w3.org/2001/XMLSchema#double"
      }
    ],
    "https://schema.org/patientFriendly": [
      {
        "@value": "Regarding the claim: 'PCOS treatment options' Medical evidence from authoritative sources (NIH) supports aspects of this claim. This information is for educational purposes only and does not constitute medical advice."
      }
    ],
    "https://schema.org/truthAssessment": [
      {
        "@id": "uuid:9e0429de-cf24-4f30-90ba-e26e18090164"
      }
    ]
  },
  {
    "@id": "uuid:6d9036ff-76c0-487a-8087-ed02122e53c2",
    "https://schema.org/claimType": [
      {
        "@value": "treatment"
      }
    ],
    "https://schema.org/condition": [
      {
        "@value": "pcos"
      }
    ]
  },
  {
    "@id": "uuid:9e0429de-cf24-4f30-90ba-e26e18090164",
    "https://schema.org/true": [
      {
        "@value": "PCOS treatment typically includes lifestyle modifications (diet, exercise), metformin for insulin resistance, and hormonal contraceptives for menstrual regulation."
      }
    ]
  },
  {
    "@id": "uuid:c7e8baf5-ab24-4bcf-88f7-0097a7530692",
    "https://schema.org/source": [
      {
        "@value": "NIH"
      }
    ],
    "https://schema.org/summary": [
      {
        "@value": "PCOS treatment typically includes lifestyle modifications (diet, exercise), metformin for insulin resistance, and hormonal contraceptives for menstrual regulation."
      }
    ],
    "https://schema.org/confidence": [
      {
        "@value": "0.9",
        "@type": "http://www.w3.org/2001/XMLSchema#double"
      }
    ],
    "https://schema.org/relation": [
      {
        "@value": "supports"
      }
    ]
  }
]```