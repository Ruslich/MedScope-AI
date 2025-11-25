# MedScope AI

**Medical Intelligence Platform for Evidence-Based Claim Evaluation**

MedScope AI provides a comprehensive medical claim evaluation system that leverages decentralized knowledge graphs to deliver evidence-based medical intelligence. The platform analyzes medical claims through a structured pipeline that assesses risk, aligns evidence from authoritative sources, and generates verifiable medical explanations.

## Overview

MedScope AI implements a systematic approach to medical claim evaluation through four core stages:

1. **CLAIM** - User enters a medical claim (e.g., "Ivermectin cures COVID-19", "Ozempic causes cancer")
2. **RISK** - System detects risk level (low/medium/high) and adjusts scrutiny accordingly
3. **EVIDENCE** - Fetches evidence from trusted medical sources (WHO, CDC, FDA, PubMed, EMA)
4. **GUIDANCE** - Generates patient-friendly and clinician-style explanations with truth assessment

The system publishes structured medical intelligence as Knowledge Assets on OriginTrail DKG, creating a verifiable, tamper-proof archive of medical explanations that AI agents can query via MCP.

## System Architecture

The platform is built on a three-tier architecture that aligns with the hackathon requirements:

### 1. Agent Layer
- **MCP Tools**: AI agents can query medical evidence and explanations via Model Context Protocol
- **Autonomous Reasoning**: Agents evaluate claims, assess risk, and generate structured explanations
- **DKG Integration**: Agents publish and query Knowledge Assets on the decentralized knowledge graph

### 2. Knowledge Layer
- **OriginTrail DKG**: Medical explanations published as JSON-LD Knowledge Assets
- **Structured Medical Intelligence**: Evidence graphs, fact triples, linked references
- **Verifiable Provenance**: Cryptographically signed and timestamped medical claims

### 3. Trust Layer
- **Risk-Aware Evaluation**: Higher risk claims trigger stricter evidence matching
- **Confidence Scoring**: Evidence-based confidence metrics (0-1 scale)
- **Tokenomics Ready**: Architecture supports token staking for claim verification (future enhancement)

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 22
- **Python** 3.10+
- **npm** package manager
- **Turbo** CLI: `npm i -g turbo`
- **OpenAI API key** (optional, for enhanced LLM analysis)

### Step 1: Clone the Repository

```bash
cd /path/to/Parallelpedia
# MedScope-AI is already in the MedScope-AI directory
cd MedScope-AI
```

### Step 2: Set Up DKG Node with MedScope Plugin

The MedScope plugin is located at `dkg-node/packages/plugin-dkg-medscope/`. Ensure it's built:

```bash
cd ../dkg-node/packages/plugin-dkg-medscope
npm install
npm run build
```

**Important**: The plugin must be registered in `dkg-node/apps/agent/src/server/index.ts`. Add:

```typescript
import medscopePlugin from "@dkg/plugin-dkg-medscope";

// In createPluginServer function
plugins: [medscopePlugin, ...otherPlugins];
```

### Step 3: Start DKG Node

```bash
cd ../../dkg-node
dkg-cli run-dev
```

The DKG node will be available at:
- **API/MCP Server**: `http://localhost:9200`
- **Frontend UI**: `http://localhost:8081` (optional)

**Keep this terminal running!**

### Step 4: Set Up Backend

Open a **new terminal**:

```bash
cd MedScope-AI/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings:
# - DKG_BASE_URL=http://localhost:9200
# - OPENAI_API_KEY=your-key-here (optional but recommended)
```

### Step 5: Start Backend

```bash
# Make sure virtual environment is activated
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Start the server
uvicorn app.main:app --reload --port 8000
```

Backend API will be available at `http://localhost:8000`

**📚 API Documentation**: Visit `http://localhost:8000/docs` for interactive Swagger UI documentation.

**Keep this terminal running!**

### Step 6: Set Up Frontend

Open a **new terminal**:

```bash
cd MedScope-AI/frontend

# Install dependencies
npm install

# (Optional) Configure API URL if backend is on different port
echo "VITE_API_URL=http://localhost:8000" > .env

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Step 7: Use the Application

1. Open `http://localhost:5173` in your browser
2. Enter a medical claim (e.g., "Ivermectin cures COVID-19", "Ozempic causes cancer")
3. Click "Evaluate Claim" to analyze
4. Review the risk level, evidence sources, and explanations
5. Click "Publish to DKG as Knowledge Asset" to publish to OriginTrail DKG

## 📋 Complete Setup Checklist

- [ ] Node.js >= 22 installed
- [ ] Python 3.10+ installed
- [ ] Turbo CLI installed (`npm i -g turbo`)
- [ ] DKG Node dependencies installed (`cd dkg-node && npm install`)
- [ ] MedScope plugin built (`cd dkg-node/packages/plugin-dkg-medscope && npm install && npm run build`)
- [ ] MedScope plugin registered in `dkg-node/apps/agent/src/server/index.ts`
- [ ] DKG Node configured (`cd dkg-node/apps/agent && npm run script:setup`)
- [ ] DKG Node running (`cd dkg-node && dkg-cli run-dev`)
- [ ] Backend dependencies installed (`cd MedScope-AI/backend && pip install -r requirements.txt`)
- [ ] Backend configured (`.env` file created)
- [ ] Backend running (`cd MedScope-AI/backend && uvicorn app.main:app --reload`)
- [ ] Frontend dependencies installed (`cd MedScope-AI/frontend && npm install`)
- [ ] Frontend running (`cd MedScope-AI/frontend && npm run dev`)

## 🔌 API Endpoints

### Backend API (`http://localhost:8000`)

**📚 Interactive API Documentation**: `http://localhost:8000/docs` (Swagger UI)

Available endpoints:
- `POST /api/claims/evaluate` - Evaluate a medical claim
- `POST /api/explanations/publish` - Publish medical explanation to DKG
- `GET /api/explanations/{claim_id}` - Get published explanation
- `GET /api/evidence/search` - Search medical evidence
- `GET /api/health` - Health check

### DKG Plugin API (`http://localhost:9200`)

- `POST /medscope/explanations` - Publish Medical Explanation
- `GET /medscope/explanations/:claimId` - Get Medical Explanation
- `GET /medscope/evidence` - Search Medical Evidence
- **Swagger UI**: `http://localhost:9200/api-docs`

### MCP Tools (for AI Agents)

- `medscope-evaluate-claim` - Evaluate a medical claim
- `medscope-get-explanation` - Get published medical explanation
- `medscope-search-evidence` - Search medical evidence in DKG

## 🧬 How It Works

### 1. Medical Claim Understanding Engine

Extracts:
- **Biochemical entities** (drugs, compounds, foods, herbs)
- **Medical conditions** (diseases, syndromes, disorders)
- **Claim types** (treatment, prevention, cure, safety, interaction, efficacy)

### 2. Risk-Aware Claim Evaluator

Unique feature: The system detects "danger level" of misinformation and adjusts scrutiny:

- **Low-risk** (e.g., vitamins, mild home remedies) → Standard evidence matching
- **Medium-risk** (common pharmaceuticals) → Enhanced evidence search
- **High-risk** (cancer treatments, antivirals, pregnancy interventions) → Deep evidence search, stricter reasoning, richer JSON-LD structure

### 3. Evidence Alignment Engine

Transforms public medical documents into:
- Evidence graphs
- JSON-LD fact triples
- Linked references
- Treatment suitability profiles

Sources include:
- WHO health fact sheets
- CDC guidance pages
- PubMed abstracts
- FDA safety summaries
- EMA drug information

### 4. Autonomous Medical Explainer Agent (MCP)

The agent:
- Reads DKG medical evidence
- Compares claim → evidence
- Generates structured Medical Explanation Asset
- Publishes it to DKG

This contributes to a global reusable archive of medical explainers.

### 5. Trust & Token Layer

Architecture supports:
- Token staking for claim verification (future enhancement)
- Confidence scoring based on evidence quality
- Risk-aware trust metrics

## 📁 Project Structure

```
MedScope-AI/
├── backend/                              # FastAPI backend
│   ├── app/
│   │   ├── models.py                     # Pydantic models
│   │   ├── main.py                       # FastAPI app
│   │   └── services/                     # Business logic
│   │       ├── claim_understanding.py    # Claim parsing & risk assessment
│   │       ├── evidence_engine.py        # Evidence fetching & alignment
│   │       ├── explanation_generator.py  # Explanation generation
│   │       ├── dkg_client.py             # DKG integration client
│   │       └── llm_client.py             # LLM abstraction (OpenAI)
│   ├── requirements.txt
│   └── .env.example
├── frontend/                             # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   └── LandingPage.tsx           # Main UI
│   │   ├── services/
│   │   │   └── api.ts                    # Backend API client
│   │   └── App.tsx
│   └── package.json
├── dkg-node/                             # OriginTrail DKG Node
│   ├── packages/
│   │   └── plugin-dkg-medscope/          # MedScope DKG plugin
│   │       ├── src/
│   │       │   └── index.ts              # Plugin implementation
│   │       └── README.md
│   └── apps/
│       └── agent/                        # DKG Node agent server
└── README.md                             # This file
```

## 🎨 Key Features

- ✅ **Risk-Aware Analysis**: Automatically detects risk levels and adjusts evidence scrutiny
- ✅ **Evidence Alignment**: Aligns claims with WHO, CDC, FDA, PubMed, EMA sources
- ✅ **Structured Explanations**: Patient-friendly and clinician-style summaries
- ✅ **Truth Assessment**: Breaks down true/false/inconclusive aspects
- ✅ **DKG Publishing**: One-click publishing to OriginTrail DKG blockchain
- ✅ **MCP Tools**: AI agents can query medical evidence and explanations
- ✅ **JSON-LD Format**: Structured data using medical schema vocabulary
- ✅ **Interactive UI**: Modern, responsive web interface

## 🔍 Example Use Cases

### Example 1: Ivermectin and COVID-19

**Claim**: "Ivermectin cures COVID-19"

**Result**:
- **Risk Level**: HIGH
- **Evidence**: WHO, FDA, NEJM sources refute the claim
- **Explanation**: Large randomized trials show no clinical benefit
- **Warnings**: Not approved for COVID-19 treatment, can be dangerous in large doses

### Example 2: Ozempic and Cancer

**Claim**: "Ozempic causes cancer"

**Result**:
- **Risk Level**: MEDIUM
- **Evidence**: FDA and EMA sources show no causal relationship established
- **Explanation**: Clinical trials found no increased cancer risk
- **Truth Assessment**: Inconclusive (monitoring recommended, but no causal link)

### Example 3: PCOS Treatment

**Claim**: "PCOS treatment options"

**Result**:
- **Risk Level**: MEDIUM
- **Evidence**: NIH sources support evidence-based treatments
- **Explanation**: Lifestyle modifications, metformin, hormonal contraceptives
- **Alternatives**: Evidence-based treatment options provided

## 🧪 Testing

### Verify Everything Works

1. **Check DKG Node**:
   ```bash
   curl http://localhost:9200/api/health
   ```

2. **Check Backend**:
   ```bash
   curl http://localhost:8000/api/health
   ```

3. **Test Plugin Endpoint**:
   ```bash
   curl http://localhost:9200/medscope/explanations/test-claim-id
   ```

4. **Open Frontend**: `http://localhost:5173`

## 🔧 Troubleshooting

### DKG Node Not Starting

- Check that all dependencies are installed: `cd dkg-node && npm install`
- Verify plugin is built: `cd packages/plugin-dkg-medscope && npm run build`
- Check environment variables in `apps/agent/.env`
- Ensure port 9200 is not in use

### Backend Connection Errors

- Verify DKG Node is running: `curl http://localhost:9200/api/health`
- Check `DKG_BASE_URL` in `backend/.env` (should be `http://localhost:9200`)
- Check backend logs for detailed error messages

### Publishing Fails

- Verify wallet has testnet tokens (NEURO) for gas fees
- Check `DKG_OTNODE_URL` is accessible
- Verify `DKG_PUBLISH_WALLET` contains valid private key
- Check DKG Node logs for detailed error messages

### Frontend Not Loading

- Verify backend is running: `curl http://localhost:8000/api/health`
- Check browser console for errors
- Verify `VITE_API_URL` in `frontend/.env` matches backend URL

## 📝 JSON-LD Structure

Medical explanations are published as JSON-LD Knowledge Assets with the following structure:

```json
{
  "@context": {
    "@vocab": "https://schema.org/",
    "medscope": "https://medscope.ai/schema/"
  },
  "@type": "MedicalExplanation",
  "@id": "medscope:explanation:{claimId}",
  "claim": "Ivermectin cures COVID-19",
  "claimId": "abc123...",
  "riskLevel": "high",
  "evidence": [...],
  "explanation": {
    "patientFriendly": "...",
    "clinicianSummary": "...",
    "truthAssessment": {...},
    "warnings": [...],
    "confidence": 0.95
  },
  "metadata": {...},
  "publishedAt": "2025-01-XX...",
  "publisher": "MedScope AI"
}
```

## 🎯 Hackathon Alignment

### Challenge 4: Wild Card

MedScope AI is a complete, original project that:

1. ✅ **Uses DKG Edge Node** (hard requirement)
2. ✅ **Leverages Three-Layer Architecture**:
   - **Agent Layer**: MCP tools for AI agents
   - **Knowledge Layer**: OriginTrail DKG for medical intelligence
   - **Trust Layer**: Risk-aware evaluation, confidence scoring
3. ✅ **Utilizes Knowledge Assets**: Medical explanations as structured JSON-LD
4. ✅ **Demonstrates Functional Synergy**: Agents query DKG, generate explanations, publish assets

### Judging Criteria Alignment

- **Excellence & Innovation (20%)**: Risk-aware medical reasoning, original design
- **Technical Implementation (40%)**: Full-stack implementation, DKG integration, MCP tools
- **Impact & Relevance (20%)**: Fights medical misinformation, creates verifiable knowledge
- **Ethics & Sustainability (10%)**: Transparent, evidence-based, non-medical advice disclaimers
- **Communication & Presentation (10%)**: Clear architecture, comprehensive documentation

## 📄 License

MIT License - see LICENSE file

## 🙏 Acknowledgments

- OriginTrail DKG for decentralized knowledge storage
- WHO, CDC, FDA, EMA, PubMed for medical evidence sources
- Scaling Trust in the Age of AI Global Hackathon 2025
