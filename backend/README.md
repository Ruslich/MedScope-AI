# MedScope AI Backend

A FastAPI-based backend service for evaluating medical claims through evidence-based analysis, AI-powered insights, and integration with decentralized knowledge graphs (DKG).

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Core Services](#core-services)
- [Data Models](#data-models)
- [Claim Evaluation Flow](#claim-evaluation-flow)
- [Dependencies](#dependencies)

## Overview

MedScope AI Backend provides a comprehensive system for:
- **Claim Understanding**: Extracting medical entities, classifying claim types, and assessing risk levels
- **Evidence Gathering**: Fetching evidence from authoritative medical sources (WHO, CDC, PubMed, FDA, EMA) and AI-powered analysis
- **Explanation Generation**: Creating patient-friendly and clinician-style explanations
- **DKG Integration**: Publishing and retrieving medical explanations on OriginTrail DKG

## Architecture

The backend follows a modular service-oriented architecture:

```
backend/
├── app/
│   ├── main.py                 # FastAPI application and route handlers
│   ├── models.py               # Pydantic data models
│   └── services/
│       ├── claim_understanding.py    # Claim parsing and classification
│       ├── evidence_engine.py        # Evidence gathering from medical sources
│       ├── explanation_generator.py  # Explanation generation
│       ├── llm_client.py             # OpenAI integration for AI analysis
│       └── dkg_client.py             # DKG node communication
└── requirements.txt
```

## Installation

1. **Create a virtual environment** (recommended):
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Set up environment variables** (create a `.env` file):
```bash
OPENAI_API_KEY=your_openai_api_key_here
DKG_BASE_URL=http://localhost:9200
```

4. **Run the server**:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000` with interactive docs at `http://localhost:8000/docs`.

## Configuration

### Environment Variables

- `OPENAI_API_KEY` (optional): OpenAI API key for enhanced AI-powered analysis. If not provided, the system will work without AI enhancements.
- `DKG_BASE_URL` (optional): Base URL for the DKG node server. Defaults to `http://localhost:9200`.

## API Endpoints

### Health Check

**GET** `/api/health`

Returns the health status of the API.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00"
}
```

### Evaluate Claim

**POST** `/api/claims/evaluate`

Evaluates a medical claim and returns structured analysis including evidence and explanations.

**Request Body:**
```json
{
  "claim": "Ivermectin cures COVID-19",
  "includeDetailedEvidence": true
}
```

**Response:**
```json
{
  "claim": "Ivermectin cures COVID-19",
  "claimId": "abc123def456",
  "riskLevel": "high",
  "metadata": {
    "compound": "ivermectin",
    "condition": "covid",
    "claimType": "cure"
  },
  "evidence": [...],
  "explanation": {
    "patientFriendly": "...",
    "clinicianSummary": "...",
    "truthAssessment": {...},
    "warnings": [...],
    "confidence": 0.85
  },
  "evaluatedAt": "2024-01-01T12:00:00"
}
```

### Publish Explanation

**POST** `/api/explanations/publish`

Publishes a medical explanation to the DKG (Decentralized Knowledge Graph).

**Request Body:**
```json
{
  "claim": "Ivermectin cures COVID-19",
  "claimId": "abc123def456",
  "riskLevel": "high",
  "evidence": [...],
  "explanation": {...},
  "metadata": {...}
}
```

**Response:**
```json
{
  "success": true,
  "ual": "0x1234...",
  "claimId": "abc123def456",
  "message": "Explanation published successfully"
}
```

### Get Explanation

**GET** `/api/explanations/{claim_id}`

Retrieves a published explanation from the DKG by claim ID.

**Response:**
```json
{
  "found": true,
  "explanation": {...}
}
```

### Search Evidence

**GET** `/api/evidence/search`

Searches for medical evidence in the DKG.

**Query Parameters:**
- `keyword` (optional): Search keyword
- `risk_level` (optional): Filter by risk level (low/medium/high)
- `condition` (optional): Filter by medical condition
- `compound` (optional): Filter by drug/compound
- `limit` (optional, default: 10): Maximum number of results

**Response:**
```json
{
  "found": 5,
  "results": [...]
}
```

## Core Services

### ClaimUnderstandingEngine

Located in `app/services/claim_understanding.py`

**Purpose**: Extracts entities, classifies claim types, and assesses risk levels from medical claims.

**Key Methods:**

- `extract_compound(claim: str) -> Optional[str]`
  - Extracts drug/compound names from claims using pattern matching
  - Recognizes common drugs (ivermectin, ozempic, metformin, etc.) and generic patterns

- `extract_condition(claim: str) -> Optional[str]`
  - Extracts medical conditions from claims
  - Recognizes conditions like COVID-19, diabetes, PCOS, etc.

- `classify_claim_type(claim: str) -> Optional[ClaimType]`
  - Classifies claims into types: TREATMENT, PREVENTION, CURE, SAFETY, INTERACTION, EFFICACY
  - Uses regex patterns to identify claim characteristics

- `assess_risk_level(claim: str, metadata: ClaimMetadata) -> RiskLevel`
  - Assesses risk level (LOW, MEDIUM, HIGH) based on keywords and metadata
  - High-risk keywords: cancer, chemotherapy, pregnancy, surgery, etc.
  - Medium-risk keywords: prescription, pharmaceutical, antibiotic, etc.
  - Low-risk keywords: vitamin, supplement, herb, diet, etc.

- `understand_claim(claim: str) -> Tuple[ClaimMetadata, RiskLevel]`
  - Main method that orchestrates claim understanding
  - Returns metadata (compound, condition, claimType) and risk level

### EvidenceEngine

Located in `app/services/evidence_engine.py`

**Purpose**: Fetches and structures evidence from trusted medical sources.

**Key Methods:**

- `fetch_evidence(claim: str, compound: Optional[str], condition: Optional[str], risk_level: RiskLevel) -> List[EvidenceSource]`
  - Main method for gathering evidence
  - Uses multiple strategies:
    1. OpenAI/ChatGPT analysis for comprehensive understanding
    2. Real API calls to medical sources (PubMed, WHO, CDC, FDA, EMA)
    3. Pattern-based evidence for known claims
  - Returns top 10 evidence sources sorted by confidence

- `_fetch_who_evidence(claim: str, compound: Optional[str], condition: Optional[str]) -> List[EvidenceSource]`
  - Fetches evidence from WHO sources
  - Pattern matching for COVID-19, vaccine-related claims

- `_fetch_pubmed_evidence(claim: str, compound: Optional[str], condition: Optional[str]) -> List[EvidenceSource]`
  - Uses PubMed E-utilities API to search medical literature
  - Retrieves research papers and abstracts

- `_fetch_fda_evidence(claim: str, compound: Optional[str]) -> List[EvidenceSource]`
  - Fetches FDA-specific evidence
  - Pattern matching for drug approvals, safety warnings

- `_fetch_cdc_evidence(claim: str, condition: Optional[str]) -> List[EvidenceSource]`
  - Fetches CDC-specific evidence
  - Pattern matching for disease-related claims

- `_get_pattern_based_evidence(claim: str, compound: Optional[str], condition: Optional[str], risk_level: RiskLevel) -> List[EvidenceSource]`
  - Fallback pattern-based evidence for known claims
  - Includes evidence for ivermectin/COVID-19, semaglutide, PCOS, etc.

- `_deduplicate_evidence(evidence: List[EvidenceSource]) -> List[EvidenceSource]`
  - Removes duplicate evidence sources based on source and summary

### ExplanationGenerator

Located in `app/services/explanation_generator.py`

**Purpose**: Generates patient-friendly and clinician-style explanations from evidence.

**Key Methods:**

- `generate_explanation(claim: str, evidence: List[EvidenceSource], risk_level: RiskLevel) -> MedicalExplanation`
  - Main method that generates structured explanations
  - Analyzes evidence to determine truth assessment
  - Calculates overall confidence score
  - Generates patient-friendly and clinician summaries

- `_generate_patient_friendly(claim: str, supporting: List[EvidenceSource], refuting: List[EvidenceSource], inconclusive: List[EvidenceSource], risk_level: RiskLevel) -> str`
  - Creates easy-to-understand explanations for patients
  - Includes risk warnings for high-risk claims

- `_generate_clinician_summary(claim: str, evidence: List[EvidenceSource], supporting: List[EvidenceSource], refuting: List[EvidenceSource], inconclusive: List[EvidenceSource]) -> str`
  - Creates detailed clinical summaries for healthcare professionals
  - Lists evidence sources with confidence scores

- `_extract_warnings(claim: str, risk_level: RiskLevel, refuting: List[EvidenceSource]) -> List[str]`
  - Extracts relevant warnings based on risk level and refuting evidence

- `_extract_contraindications(claim: str, risk_level: RiskLevel, refuting: List[EvidenceSource]) -> List[str]`
  - Identifies contraindications, especially for pregnancy-related claims

- `_suggest_alternatives(claim: str, supporting: List[EvidenceSource], refuting: List[EvidenceSource]) -> List[str]`
  - Suggests evidence-based alternatives when claims are refuted

- `_suggest_actions(risk_level: RiskLevel, refuting: List[EvidenceSource], inconclusive: List[EvidenceSource]) -> List[str]`
  - Provides suggested next actions (non-medical advice)

### LLMClient

Located in `app/services/llm_client.py`

**Purpose**: Provides AI-powered medical analysis using OpenAI's GPT-4o model.

**Key Methods:**

- `analyze_medical_claim(claim: str, metadata: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]`
  - Uses ChatGPT/OpenAI to analyze medical claims comprehensively
  - Returns structured analysis including:
    - Evidence-based assessment
    - Risk factors
    - Key medical considerations
    - Suggested sources
    - Confidence level
    - Relation (supports/refutes/inconclusive)

- `search_medical_literature(query: str, max_results: int = 5) -> List[Dict[str, Any]]`
  - Uses OpenAI to suggest relevant medical literature and sources
  - Returns structured list of sources with relevance information

- `enhance_explanation(claim: str, evidence_summary: str, risk_level: str) -> Optional[Dict[str, Any]]`
  - Enhances and refines medical explanations using AI
  - Provides more detailed and comprehensive explanations
  - Maintains scientific accuracy

**Note**: LLMClient is optional. If `OPENAI_API_KEY` is not set, the system works without AI enhancements.

### DKGClient

Located in `app/services/dkg_client.py`

**Purpose**: Handles communication with the DKG (Decentralized Knowledge Graph) node.

**Key Methods:**

- `publish_explanation(request: PublishExplanationRequest) -> PublishExplanationResponse`
  - Publishes medical explanations to the DKG
  - Converts request to JSON format with proper enum serialization
  - Handles timeouts (30-minute read timeout for blockchain operations)
  - Returns UAL (Unique Asset Locator) on success

- `get_explanation(claim_id: str) -> Optional[Dict]`
  - Retrieves a published explanation from DKG by claim ID
  - Returns explanation data if found

- `search_evidence(keyword: Optional[str], risk_level: Optional[str], condition: Optional[str], compound: Optional[str], limit: int = 10) -> Dict`
  - Searches medical evidence in the DKG
  - Supports filtering by keyword, risk level, condition, and compound

- `close()`
  - Closes the HTTP client connection

**Timeout Configuration:**
- Connect timeout: 30 seconds
- Read timeout: 1800 seconds (30 minutes) - for blockchain operations
- Write timeout: 30 seconds
- Pool timeout: 30 seconds

## Data Models

All models are defined in `app/models.py` using Pydantic.

### Enums

- **RiskLevel**: `LOW`, `MEDIUM`, `HIGH`
- **ClaimType**: `TREATMENT`, `PREVENTION`, `CURE`, `SAFETY`, `INTERACTION`, `EFFICACY`
- **EvidenceRelation**: `SUPPORTS`, `REFUTES`, `INCONCLUSIVE`

### Core Models

- **EvidenceSource**: Represents evidence from medical databases
  - `source`: Source name (WHO, CDC, PubMed, FDA, EMA, etc.)
  - `summary`: Summary of the evidence
  - `relation`: How evidence relates to claim (supports/refutes/inconclusive)
  - `confidence`: Confidence score (0.0-1.0)
  - `url`: Optional URL to source document
  - `publishedDate`: Optional publication date

- **ClaimMetadata**: Extracted metadata from claims
  - `compound`: Drug/compound name
  - `condition`: Medical condition
  - `claimType`: Type of claim

- **TruthAssessment**: Truth assessment breakdown
  - `true`: List of true aspects
  - `false`: List of false aspects
  - `inconclusive`: List of inconclusive aspects

- **MedicalExplanation**: Structured medical explanation
  - `patientFriendly`: Patient-friendly explanation
  - `clinicianSummary`: Clinician-style summary
  - `truthAssessment`: Truth assessment breakdown
  - `warnings`: Relevant warnings
  - `contraindications`: Contraindications
  - `alternatives`: Safer alternatives if relevant
  - `confidence`: Overall confidence score (0.0-1.0)
  - `suggestedActions`: Suggested next actions

- **ClaimEvaluationRequest**: Request to evaluate a claim
  - `claim`: Medical claim to evaluate
  - `includeDetailedEvidence`: Whether to include detailed evidence sources

- **ClaimEvaluationResponse**: Response from claim evaluation
  - `claim`: Original claim
  - `claimId`: Unique identifier (SHA256 hash)
  - `riskLevel`: Assessed risk level
  - `metadata`: Extracted metadata
  - `evidence`: List of evidence sources
  - `explanation`: Structured explanation
  - `evaluatedAt`: Timestamp

- **PublishExplanationRequest**: Request to publish explanation to DKG
  - `claim`: Original claim
  - `claimId`: Claim identifier
  - `riskLevel`: Risk level
  - `evidence`: List of evidence sources
  - `explanation`: Medical explanation
  - `metadata`: Optional metadata

- **PublishExplanationResponse**: Response from publishing
  - `success`: Whether publishing succeeded
  - `ual`: Unique Asset Locator from DKG
  - `claimId`: Claim identifier
  - `message`: Status message

## Claim Evaluation Flow

The complete claim evaluation process follows these steps:

1. **Claim Understanding** (`ClaimUnderstandingEngine`)
   - Extract compound/drug name from claim
   - Extract medical condition from claim
   - Classify claim type (treatment, prevention, cure, etc.)
   - Assess risk level (low, medium, high)

2. **Evidence Gathering** (`EvidenceEngine`)
   - **AI Analysis** (if OpenAI is enabled):
     - Use GPT-4o to analyze the claim comprehensively
     - Get suggested medical literature sources
   - **Real API Calls**:
     - Search PubMed for research papers
     - Check WHO, CDC, FDA, EMA for official guidance
   - **Pattern Matching**:
     - Apply known evidence patterns for common claims
   - Deduplicate and sort evidence by confidence

3. **Explanation Generation** (`ExplanationGenerator`)
   - Analyze evidence to determine truth assessment
   - Generate patient-friendly explanation
   - Generate clinician summary
   - Extract warnings and contraindications
   - Suggest alternatives and actions

4. **AI Enhancement** (optional, if OpenAI is enabled)
   - Enhance explanations using GPT-4o
   - Improve clarity and comprehensiveness
   - Maintain scientific accuracy

5. **Response Assembly**
   - Generate unique claim ID (SHA256 hash)
   - Assemble response with all components
   - Return structured `ClaimEvaluationResponse`

### Example Flow

```
Input: "Ivermectin cures COVID-19"

1. Understanding:
   - Compound: "ivermectin"
   - Condition: "covid"
   - Claim Type: "cure"
   - Risk Level: "high"

2. Evidence Gathering:
   - OpenAI analysis: Refutes claim
   - WHO: Does not recommend ivermectin for COVID-19
   - FDA: Not approved for COVID-19 treatment
   - PubMed: Large RCTs show no significant effect
   - Pattern-based: Known refuting evidence

3. Explanation Generation:
   - Patient-friendly: Clear explanation that evidence refutes claim
   - Clinician summary: Detailed evidence review
   - Warnings: High-risk, not supported by evidence
   - Alternatives: Evidence-based COVID-19 treatments

4. Response:
   - Returns complete evaluation with all evidence and explanations
```

## Dependencies

The backend uses the following key dependencies:

- **fastapi** (0.115.0): Modern web framework for building APIs
- **uvicorn** (0.32.0): ASGI server for running FastAPI
- **httpx** (0.27.2): Async HTTP client for API calls
- **pydantic** (2.9.2): Data validation using Python type annotations
- **python-dotenv** (1.0.1): Environment variable management
- **openai** (1.51.0): OpenAI API client for GPT-4o integration

All dependencies are listed in `requirements.txt`.

## Error Handling

The backend includes comprehensive error handling:

- **Connection Errors**: Handles DKG node connection failures gracefully
- **Timeout Errors**: 30-minute timeout for blockchain operations with clear error messages
- **API Errors**: Graceful degradation when external APIs fail
- **Validation Errors**: Pydantic validates all request/response data
- **LLM Errors**: System continues to work even if OpenAI API fails

## Logging

The backend uses Python's logging module with INFO level by default. All services log important operations, errors, and DKG interactions for debugging and monitoring.

## Development

To run in development mode with auto-reload:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

To run in production:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Testing

The API includes interactive documentation at `/docs` (Swagger UI) and `/redoc` (ReDoc) when running the server.

## Notes

- The system is designed to work with or without OpenAI API key
- DKG integration requires a running DKG node server
- All medical information is for educational purposes only
- The system emphasizes consulting healthcare professionals for medical decisions

