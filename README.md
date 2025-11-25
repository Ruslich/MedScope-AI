# MedScope AI

**Decentralized Medical Claim Verification Platform**

MedScope AI is a specialized medical intelligence system designed to combat health misinformation by providing evidence-based evaluation of medical claims. The platform combines AI-powered analysis, authoritative medical source integration, and blockchain-based knowledge storage to create a trustworthy, verifiable repository of medical explanations.

## What MedScope AI Does

MedScope AI addresses the critical problem of medical misinformation by:

- **Evaluating Medical Claims**: Analyzes user-submitted medical claims (e.g., "Ivermectin cures COVID-19", "Ozempic causes cancer") through a multi-stage verification pipeline
- **Risk Assessment**: Automatically detects the severity and potential harm of medical claims, adjusting analysis depth accordingly
- **Evidence Aggregation**: Gathers evidence from multiple authoritative sources including WHO, CDC, FDA, PubMed, and EMA
- **Intelligent Explanation Generation**: Creates both patient-friendly and clinician-grade explanations with structured truth assessments
- **Blockchain Publishing**: Publishes verified medical explanations to OriginTrail DKG as immutable Knowledge Assets
- **AI Agent Integration**: Provides MCP (Model Context Protocol) tools for AI agents to query medical evidence and explanations

## Core Workflow

The platform processes medical claims through a structured four-stage pipeline:

1. **CLAIM INPUT** → User submits a medical claim for evaluation
2. **RISK DETECTION** → System analyzes claim to determine risk level (low/medium/high) and adjusts scrutiny
3. **EVIDENCE COLLECTION** → Aggregates evidence from medical databases, research papers, and regulatory bodies
4. **EXPLANATION GENERATION** → Produces structured explanations with truth assessments, warnings, and recommendations

All evaluated claims can be published to the OriginTrail Decentralized Knowledge Graph (DKG), creating a permanent, verifiable archive accessible to AI agents and healthcare systems.

## ⚠️ Required: DKG Plugin Installation

**IMPORTANT**: MedScope AI requires a custom DKG plugin to enable DKG publishing and MCP tool functionality. The plugin is **not included** in this repository and must be installed separately.

### Plugin Repository

**GitHub Repository**: [https://github.com/Ruslich/plugin-dkg-medscope.git](https://github.com/Ruslich/plugin-dkg-medscope.git)

### Why the Plugin is Required

The MedScope DKG plugin provides essential functionality:
- **REST API Endpoints**: Enables backend to publish explanations to DKG
- **MCP Tools**: Allows AI agents to query medical evidence and explanations
- **Knowledge Asset Management**: Handles storage and retrieval of medical explanations on blockchain

### Quick Plugin Setup

1. Clone the plugin repository into your DKG node's packages directory
2. Build the plugin: `npm install && npm run build`
3. Register the plugin in your DKG node server configuration
4. Restart the DKG node

**Detailed plugin setup instructions are provided in the [Installation & Setup Guide](#-installation--setup-guide) section below.**

## Technical Architecture

MedScope AI is built on a three-layer architecture optimized for medical claim verification:

### Layer 1: Intelligence Processing (Backend)
- **FastAPI Backend**: Python-based REST API handling claim evaluation logic
- **Claim Understanding Engine**: Extracts medical entities (drugs, conditions) and classifies claim types
- **Evidence Engine**: Multi-source evidence aggregation from medical databases and APIs
- **Explanation Generator**: Creates structured, dual-audience explanations (patient/clinician)
- **LLM Integration**: OpenAI GPT-4o for enhanced medical analysis and explanation refinement

### Layer 2: Knowledge Storage (DKG)
- **OriginTrail DKG Node**: Decentralized blockchain-based knowledge storage
- **MedScope Plugin**: Custom DKG plugin providing MCP tools and REST endpoints
- **JSON-LD Knowledge Assets**: Structured medical explanations published as verifiable assets
- **Unique Asset Locators (UALs)**: Cryptographic identifiers for each published explanation

### Layer 3: User Interface (Frontend)
- **React + TypeScript**: Modern web interface for claim submission and result visualization
- **Real-time Evaluation**: Interactive claim analysis with evidence display
- **DKG Publishing**: One-click publishing of verified explanations to blockchain

## DKG Plugin Integration

**Critical Component**: MedScope AI requires a custom DKG plugin to function properly. The plugin is available as a separate repository:

**Plugin Repository**: [https://github.com/Ruslich/plugin-dkg-medscope.git](https://github.com/Ruslich/plugin-dkg-medscope.git)

### Plugin Features

The MedScope DKG plugin provides:

- **MCP Tools** for AI agents:
  - `medscope-evaluate-claim`: Evaluate medical claims programmatically
  - `medscope-get-explanation`: Retrieve published medical explanations
  - `medscope-search-evidence`: Search medical evidence in the DKG

- **REST API Endpoints**:
  - `POST /medscope/explanations`: Publish medical explanations to DKG
  - `GET /medscope/explanations/:claimId`: Retrieve explanations by claim ID
  - `GET /medscope/evidence`: Search evidence with filters (keyword, risk level, condition, compound)

### Plugin Installation Requirements

The plugin must be:
1. **Cloned and built** from the repository
2. **Registered** in the DKG Node's plugin system
3. **Running** before the backend attempts to publish explanations

See [Plugin Setup Instructions](#plugin-setup-instructions) below for detailed steps.

## 🚀 Installation & Setup Guide

### Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** >= 22.x
- **Python** 3.10 or higher
- **npm** (comes with Node.js)
- **Git** (for cloning the plugin repository)
- **OpenAI API Key** (optional but recommended for enhanced AI analysis)

### Step 1: Clone MedScope Plugin Repository

The MedScope DKG plugin is a separate repository that must be installed:

```bash
# Navigate to your DKG node directory
cd /path/to/your/dkg-node

# Clone the MedScope plugin
git clone https://github.com/Ruslich/plugin-dkg-medscope.git packages/plugin-dkg-medscope

# Navigate to plugin directory
cd packages/plugin-dkg-medscope

# Install dependencies
npm install

# Build the plugin
npm run build
```

**Note**: The plugin must be in the `packages/plugin-dkg-medscope` directory of your DKG node installation.

### Step 2: Register Plugin in DKG Node

The plugin must be registered in your DKG Node's server configuration:

1. Open `dkg-node/apps/agent/src/server/index.ts` (or equivalent server file)

2. Add the import at the top:
```typescript
import medscopePlugin from "@dkg/plugin-dkg-medscope";
```

3. Register the plugin in the plugin array:
```typescript
// In createPluginServer function or plugin configuration
plugins: [
  medscopePlugin,
  // ... other plugins
]
```

4. Ensure the plugin package is linked in your DKG node's `package.json` or workspace configuration.

### Step 3: Configure and Start DKG Node

```bash
# Navigate to DKG node root
cd /path/to/your/dkg-node

# Install DKG node dependencies (if not already done)
npm install

# Configure DKG node (if needed)
cd apps/agent
npm run script:setup

# Start DKG node
cd ../..
dkg-cli run-dev
```

**Verify DKG Node is Running**:
- API/MCP Server should be available at: `http://localhost:9200`
- Test with: `curl http://localhost:9200/api/health`
- Plugin endpoints should be accessible at: `http://localhost:9200/medscope/*`

**Keep this terminal running!** The DKG node must remain active for the backend to publish explanations.

### Step 4: Set Up Backend Service

Open a **new terminal window**:

```bash
# Navigate to MedScope-AI backend directory
cd /path/to/MedScope-AI/backend

# Create Python virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

### Step 5: Configure Backend Environment

Create a `.env` file in the `backend/` directory:

```bash
# Create .env file
touch .env  # or use your text editor

# Add the following configuration:
DKG_BASE_URL=http://localhost:9200
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Environment Variables Explained**:
- `DKG_BASE_URL`: The base URL of your DKG node server (default: `http://localhost:9200`)
- `OPENAI_API_KEY`: Your OpenAI API key for enhanced LLM analysis (optional but recommended)

**Note**: If `OPENAI_API_KEY` is not provided, the system will still function but with reduced AI-powered analysis capabilities.

### Step 6: Start Backend Server

```bash
# Ensure virtual environment is activated
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Start FastAPI server with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend Status**:
- API available at: `http://localhost:8000`
- Interactive API docs: `http://localhost:8000/docs` (Swagger UI)
- Alternative docs: `http://localhost:8000/redoc` (ReDoc)

**Keep this terminal running!** The backend must remain active to process claim evaluations.

### Step 7: Set Up Frontend Application

Open a **new terminal window**:

```bash
# Navigate to MedScope-AI frontend directory
cd /path/to/MedScope-AI/frontend

# Install Node.js dependencies
npm install

# Create environment configuration file
echo "VITE_API_URL=http://localhost:8000" > .env

# Start development server
npm run dev
```

**Frontend Status**:
- Application available at: `http://localhost:5173`
- Hot module replacement enabled for development

**Keep this terminal running!** The frontend development server must remain active.

### Step 8: Access and Use MedScope AI

1. **Open the Application**: Navigate to `http://localhost:5173` in your web browser

2. **Submit a Medical Claim**: Enter a medical claim in the input field, for example:
   - "Ivermectin cures COVID-19"
   - "Ozempic causes cancer"
   - "Metformin treats PCOS"

3. **Evaluate the Claim**: Click the "Evaluate Claim" button to initiate analysis

4. **Review Results**: The system will display:
   - **Risk Level**: Low, Medium, or High
   - **Extracted Metadata**: Drug/compound names, medical conditions, claim type
   - **Evidence Sources**: List of authoritative sources with summaries
   - **Patient-Friendly Explanation**: Easy-to-understand explanation
   - **Clinician Summary**: Detailed clinical analysis
   - **Truth Assessment**: Breakdown of true/false/inconclusive aspects
   - **Warnings & Contraindications**: Safety information
   - **Confidence Score**: Overall confidence in the evaluation (0-1 scale)

5. **Publish to DKG** (Optional): Click "Publish to DKG as Knowledge Asset" to store the explanation on the OriginTrail blockchain. This creates a permanent, verifiable record accessible to AI agents via MCP tools.

## 📋 Complete Setup Verification Checklist

Use this checklist to ensure all components are properly configured:

### Prerequisites
- [ ] Node.js >= 22.x installed and verified (`node --version`)
- [ ] Python 3.10+ installed and verified (`python3 --version`)
- [ ] npm package manager available (`npm --version`)
- [ ] Git installed for cloning plugin repository (`git --version`)

### DKG Plugin Setup
- [ ] MedScope plugin repository cloned from [https://github.com/Ruslich/plugin-dkg-medscope.git](https://github.com/Ruslich/plugin-dkg-medscope.git)
- [ ] Plugin dependencies installed (`cd packages/plugin-dkg-medscope && npm install`)
- [ ] Plugin built successfully (`npm run build`)
- [ ] Plugin registered in DKG node server configuration file
- [ ] Plugin import statement added to server index file

### DKG Node Configuration
- [ ] DKG Node dependencies installed (`cd dkg-node && npm install`)
- [ ] DKG Node configured (`cd dkg-node/apps/agent && npm run script:setup`)
- [ ] DKG Node running and accessible at `http://localhost:9200`
- [ ] Plugin endpoints responding (`curl http://localhost:9200/medscope/evidence`)

### Backend Service
- [ ] Python virtual environment created (`python3 -m venv venv`)
- [ ] Virtual environment activated
- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] `.env` file created with `DKG_BASE_URL` and optional `OPENAI_API_KEY`
- [ ] Backend server running (`uvicorn app.main:app --reload`)
- [ ] Backend API accessible at `http://localhost:8000`
- [ ] API documentation accessible at `http://localhost:8000/docs`

### Frontend Application
- [ ] Frontend dependencies installed (`npm install`)
- [ ] `.env` file created with `VITE_API_URL=http://localhost:8000`
- [ ] Frontend development server running (`npm run dev`)
- [ ] Frontend accessible at `http://localhost:5173`

### Integration Testing
- [ ] Health check endpoints responding (DKG: `/api/health`, Backend: `/api/health`)
- [ ] Frontend can communicate with backend API
- [ ] Backend can communicate with DKG node plugin
- [ ] Claim evaluation workflow functioning end-to-end
- [ ] DKG publishing functionality working (if blockchain configured)

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

## 🔬 How MedScope AI Works: Technical Deep Dive

### Stage 1: Claim Understanding & Entity Extraction

The **ClaimUnderstandingEngine** processes raw medical claims through multiple analysis layers:

**Entity Extraction**:
- **Compound Detection**: Identifies drugs, medications, supplements, and biochemical compounds using pattern matching and medical terminology databases
- **Condition Identification**: Extracts medical conditions, diseases, syndromes, and health states from natural language
- **Claim Type Classification**: Categorizes claims into six types:
  - `TREATMENT`: Claims about therapeutic use
  - `PREVENTION`: Claims about disease prevention
  - `CURE`: Claims about complete healing
  - `SAFETY`: Claims about safety or harm
  - `INTERACTION`: Claims about drug interactions
  - `EFFICACY`: Claims about effectiveness

**Pattern Recognition**: Uses regex patterns and keyword matching to identify medical entities even when expressed in various phrasings.

### Stage 2: Risk Assessment & Scrutiny Adjustment

The system implements **adaptive risk-based evaluation** - a unique feature that adjusts analysis depth based on potential harm:

**Risk Level Detection**:
- **HIGH RISK**: Cancer treatments, chemotherapy, pregnancy interventions, antivirals, immunosuppressants, blood thinners, surgery-related claims
  - Triggers: Deep evidence search, multiple source verification, enhanced LLM analysis, comprehensive warning generation
- **MEDIUM RISK**: Prescription medications, antibiotics, antidepressants, steroids, hormones
  - Triggers: Standard evidence search, moderate source verification, standard LLM analysis
- **LOW RISK**: Vitamins, supplements, herbs, home remedies, diet, exercise, hydration
  - Triggers: Basic evidence search, minimal verification

**Why This Matters**: High-risk misinformation can cause immediate harm, so the system allocates more computational resources and stricter verification for these claims.

### Stage 3: Multi-Source Evidence Aggregation

The **EvidenceEngine** employs a three-pronged evidence gathering strategy:

**Strategy 1: AI-Powered Analysis** (if OpenAI API key configured)
- Uses GPT-4o to analyze claims comprehensively
- Generates evidence-based assessments with confidence scores
- Suggests relevant medical literature and authoritative sources
- Provides structured analysis including risk factors and key considerations

**Strategy 2: Real API Integration**
- **PubMed E-utilities API**: Searches medical literature, retrieves research abstracts
- **WHO Sources**: Pattern matching for official health guidance
- **FDA Database**: Drug approval information, safety warnings
- **CDC Sources**: Disease prevention and treatment guidelines
- **EMA**: European drug regulatory information

**Strategy 3: Pattern-Based Evidence** (Fallback)
- Pre-configured evidence patterns for well-known medical claims
- Examples: Ivermectin/COVID-19 refutation, Ozempic safety data, PCOS treatment guidelines

**Evidence Processing**:
- Deduplication based on source and summary similarity
- Confidence scoring (0.0-1.0) based on source authority and evidence quality
- Relation classification: `SUPPORTS`, `REFUTES`, or `INCONCLUSIVE`
- Sorting by confidence score (highest first)

### Stage 4: Explanation Generation

The **ExplanationGenerator** creates dual-audience explanations:

**Patient-Friendly Explanation**:
- Plain language, non-technical terminology
- Clear risk warnings for high-risk claims
- Educational disclaimers
- Actionable guidance (non-medical advice)

**Clinician Summary**:
- Detailed evidence review with source citations
- Confidence scores for each evidence source
- Structured breakdown of supporting/refuting/inconclusive evidence
- Professional recommendations

**Truth Assessment**:
- **True Aspects**: Evidence-supported elements of the claim
- **False Aspects**: Evidence-refuted elements
- **Inconclusive Aspects**: Areas requiring more research

**Additional Components**:
- **Warnings**: Safety alerts based on risk level and refuting evidence
- **Contraindications**: Conditions where the claim may not apply
- **Alternatives**: Evidence-based alternatives when claims are refuted
- **Suggested Actions**: Next steps for users (consult healthcare professionals, review sources, etc.)

### Stage 5: DKG Publishing & Knowledge Asset Creation

When a user chooses to publish an explanation:

1. **Backend Processing**: The explanation is formatted as a JSON-LD Knowledge Asset
2. **DKG Client Communication**: Backend sends the asset to the DKG node plugin via REST API
3. **Plugin Processing**: The MedScope plugin receives the explanation and prepares it for blockchain storage
4. **Blockchain Publishing**: The explanation is published to OriginTrail DKG as an immutable Knowledge Asset
5. **UAL Generation**: A Unique Asset Locator (UAL) is generated for retrieval
6. **MCP Tool Access**: AI agents can now query this explanation using MCP tools

**Knowledge Asset Structure**:
- JSON-LD format with medical schema vocabulary
- Cryptographically signed and timestamped
- Verifiable provenance
- Accessible via MCP protocol for AI agents

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

## 🔧 Troubleshooting Common Issues

### Issue: DKG Node Not Starting

**Symptoms**: Cannot access `http://localhost:9200`, connection refused errors

**Solutions**:
1. Verify all dependencies installed: `cd dkg-node && npm install`
2. Check plugin is built: `cd packages/plugin-dkg-medscope && npm run build`
3. Verify plugin registration in server configuration file
4. Check environment variables in `apps/agent/.env`
5. Ensure port 9200 is not in use: `lsof -i :9200` (macOS/Linux) or `netstat -ano | findstr :9200` (Windows)
6. Review DKG node logs for specific error messages

### Issue: Backend Cannot Connect to DKG Node

**Symptoms**: Backend logs show "Connection refused" or "Cannot connect to DKG node server"

**Solutions**:
1. Verify DKG Node is running: `curl http://localhost:9200/api/health`
2. Check `DKG_BASE_URL` in `backend/.env` matches actual DKG node URL
3. Test plugin endpoints: `curl http://localhost:9200/medscope/evidence`
4. Check backend logs for detailed error messages
5. Verify firewall settings allow localhost connections

### Issue: Plugin Endpoints Not Found (404)

**Symptoms**: Requests to `/medscope/*` return 404 Not Found

**Solutions**:
1. Verify plugin is properly registered in DKG node server configuration
2. Check plugin import statement is correct: `import medscopePlugin from "@dkg/plugin-dkg-medscope"`
3. Ensure plugin is in the plugins array: `plugins: [medscopePlugin, ...]`
4. Rebuild plugin: `cd packages/plugin-dkg-medscope && npm run build`
5. Restart DKG node after plugin changes

### Issue: Publishing to DKG Fails

**Symptoms**: Publishing returns error or timeout

**Solutions**:
1. **Blockchain Configuration**: Verify DKG node is connected to OriginTrail network
2. **Wallet Setup**: Ensure wallet has testnet tokens (NEURO) for gas fees
3. **Network Access**: Check `DKG_OTNODE_URL` is accessible from DKG node
4. **Wallet Key**: Verify `DKG_PUBLISH_WALLET` contains valid private key in DKG node configuration
5. **Timeout Handling**: DKG operations can take 30+ minutes; check logs for progress
6. **Error Messages**: Review DKG node logs for specific blockchain errors

### Issue: Frontend Cannot Connect to Backend

**Symptoms**: Frontend shows connection errors, API calls fail

**Solutions**:
1. Verify backend is running: `curl http://localhost:8000/api/health`
2. Check browser console for CORS or network errors
3. Verify `VITE_API_URL` in `frontend/.env` matches backend URL exactly
4. Check backend CORS settings allow frontend origin
5. Test backend API directly: `curl http://localhost:8000/api/health`

### Issue: OpenAI API Errors

**Symptoms**: LLM analysis fails, reduced functionality

**Solutions**:
1. Verify `OPENAI_API_KEY` is set correctly in `backend/.env`
2. Check API key is valid and has sufficient credits
3. Review OpenAI API rate limits
4. Check backend logs for specific OpenAI error messages
5. **Note**: System works without OpenAI, but with reduced AI capabilities

### Issue: Claim Evaluation Returns No Evidence

**Symptoms**: Evaluation completes but shows minimal or no evidence sources

**Solutions**:
1. Check internet connection (required for PubMed, WHO, CDC APIs)
2. Verify OpenAI API is working (if configured) for enhanced evidence
3. Review backend logs for API errors
4. Test with well-known claims (e.g., "Ivermectin cures COVID-19") which have pattern-based evidence
5. Check evidence engine logs for specific source failures

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

## 🎯 Project Alignment & Impact

### Hackathon Challenge: Wild Card

MedScope AI addresses the hackathon's core themes through:

1. **Decentralized Knowledge Storage**: Uses OriginTrail DKG Edge Node for immutable medical knowledge
2. **Three-Layer Architecture Implementation**:
   - **Agent Layer**: MCP (Model Context Protocol) tools enabling AI agents to query medical evidence
   - **Knowledge Layer**: OriginTrail DKG stores medical explanations as verifiable Knowledge Assets
   - **Trust Layer**: Risk-aware evaluation with confidence scoring and evidence-based verification
3. **Knowledge Asset Creation**: Medical explanations published as structured JSON-LD assets
4. **Functional Integration**: Complete workflow from claim evaluation → evidence gathering → explanation generation → blockchain publishing

### Judging Criteria Alignment

**Excellence & Innovation (20%)**:
- Unique risk-aware medical reasoning system
- Adaptive scrutiny based on claim severity
- Multi-source evidence aggregation with AI enhancement
- Original design addressing medical misinformation

**Technical Implementation (40%)**:
- Full-stack implementation (React frontend, FastAPI backend, DKG integration)
- Custom DKG plugin with MCP tools
- Real API integrations (PubMed, WHO, CDC, FDA, EMA)
- OpenAI GPT-4o integration for enhanced analysis
- Comprehensive error handling and logging

**Impact & Relevance (20%)**:
- Directly combats medical misinformation
- Creates verifiable, blockchain-stored medical knowledge
- Accessible to both patients and healthcare professionals
- Enables AI agents to access trustworthy medical information

**Ethics & Sustainability (10%)**:
- Transparent evidence-based evaluation
- Clear disclaimers (not medical advice)
- Emphasis on consulting healthcare professionals
- Open-source, extensible architecture

**Communication & Presentation (10%)**:
- Comprehensive documentation (this README, backend README)
- Clear architecture diagrams and explanations
- Detailed setup instructions
- Troubleshooting guides

## 📄 License

MIT License - see LICENSE file

## 📚 Additional Resources

### Documentation
- **Backend Documentation**: See `backend/README.md` for detailed backend API and service documentation
- **Plugin Repository**: [https://github.com/Ruslich/plugin-dkg-medscope.git](https://github.com/Ruslich/plugin-dkg-medscope.git)
- **OriginTrail DKG Documentation**: [https://docs.origintrail.io/](https://docs.origintrail.io/)

### API Documentation
- **Backend API**: Interactive Swagger UI at `http://localhost:8000/docs`
- **DKG Plugin API**: Swagger UI at `http://localhost:9200/api-docs` (when DKG node is running)

### Medical Evidence Sources
- **WHO (World Health Organization)**: [https://www.who.int](https://www.who.int)
- **CDC (Centers for Disease Control)**: [https://www.cdc.gov](https://www.cdc.gov)
- **FDA (Food and Drug Administration)**: [https://www.fda.gov](https://www.fda.gov)
- **PubMed**: [https://pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov)
- **EMA (European Medicines Agency)**: [https://www.ema.europa.eu](https://www.ema.europa.eu)

## ⚠️ Important Disclaimers

**Medical Information Disclaimer**: MedScope AI provides educational information only. It does not provide medical advice, diagnosis, or treatment recommendations. Always consult qualified healthcare professionals for medical decisions.

**Evidence-Based Approach**: All evaluations are based on publicly available medical evidence and authoritative sources. The system does not replace professional medical judgment.

**Blockchain Publishing**: Publishing explanations to DKG creates permanent, immutable records. Ensure accuracy before publishing.

## 🙏 Acknowledgments

- **OriginTrail DKG**: For providing decentralized knowledge graph infrastructure
- **Medical Evidence Sources**: WHO, CDC, FDA, EMA, PubMed for authoritative medical information
- **OpenAI**: For GPT-4o API enabling enhanced medical analysis
- **Scaling Trust in the Age of AI Global Hackathon 2025**: For the platform and opportunity

## 📄 License

MIT License - see LICENSE file for details

---

**MedScope AI** - Fighting medical misinformation through evidence-based verification and decentralized knowledge storage.
