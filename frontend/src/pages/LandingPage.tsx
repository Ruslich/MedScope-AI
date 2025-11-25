import { useState } from 'react';
import {
  evaluateClaim,
  publishExplanation,
  ClaimEvaluationResponse,
  PublishExplanationRequest,
} from '../services/api';
import { ExternalLink, CheckCircle2, Loader2, AlertCircle, Shield, Activity, Database, Sparkles } from 'lucide-react';

interface EvaluationState {
  loading: boolean;
  result: ClaimEvaluationResponse | null;
  error: string | null;
  publishing: boolean;
  published: boolean;
  ual: string | null;
}

const LandingPage = () => {
  const [claim, setClaim] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationState>({
    loading: false,
    result: null,
    error: null,
    publishing: false,
    published: false,
    ual: null,
  });

  const exampleClaims = [
    "Ivermectin cures COVID-19",
    "Ozempic causes cancer",
    "Semaglutide",
    "PCOS treatment options",
    "Vitamin D prevents colds",
  ];

  const handleEvaluate = async () => {
    if (!claim.trim()) {
      setEvaluation({
        ...evaluation,
        error: 'Please enter a medical claim to evaluate',
      });
      return;
    }

    setEvaluation({
      loading: true,
      result: null,
      error: null,
      publishing: false,
      published: false,
      ual: null,
    });

    try {
      const result = await evaluateClaim({
        claim: claim.trim(),
        includeDetailedEvidence: true,
      });

      setEvaluation({
        loading: false,
        result,
        error: null,
        publishing: false,
        published: false,
        ual: null,
      });
    } catch (error: any) {
      setEvaluation({
        loading: false,
        result: null,
        error: error.response?.data?.detail || error.message || 'Failed to evaluate claim',
        publishing: false,
        published: false,
        ual: null,
      });
    }
  };

  const handlePublish = async () => {
    if (!evaluation.result) return;

    setEvaluation({
      ...evaluation,
      publishing: true,
      error: null,
    });

    try {
      const publishRequest: PublishExplanationRequest = {
        claim: evaluation.result.claim,
        claimId: evaluation.result.claimId,
        riskLevel: evaluation.result.riskLevel,
        evidence: evaluation.result.evidence,
        explanation: evaluation.result.explanation,
        metadata: evaluation.result.metadata,
      };

      const response = await publishExplanation(publishRequest);

      if (response.success && response.ual) {
        setEvaluation({
          ...evaluation,
          publishing: false,
          published: true,
          ual: response.ual,
        });
      } else {
        setEvaluation({
          ...evaluation,
          publishing: false,
          error: response.message || 'Failed to publish explanation',
        });
      }
    } catch (error: any) {
      setEvaluation({
        ...evaluation,
        publishing: false,
        error: error.response?.data?.detail || error.message || 'Failed to publish explanation',
      });
    }
  };

  const getDKGExplorerUrl = (ual: string) => {
    const encodedUal = encodeURIComponent(ual);
    return `https://dkg-testnet.origintrail.io/explore?ual=${encodedUal}`;
  };

  return (
    <div className="min-h-screen">
      {/* Top Navigation Bar */}
      <nav className="border-b border-cyan-500/20 bg-[#0f172a]/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center glow-cyan">
                  <Shield className="w-8 h-8 text-[#0a0e1a]" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0a0e1a] animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  MEDSCOPE AI
                </h1>
                <p className="text-xs text-gray-400 font-mono">NEURAL MEDICAL INTELLIGENCE</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <Database className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono text-cyan-300">ORIGINTRAIL DKG</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-mono text-cyan-300">AI-POWERED MEDICAL ANALYSIS</span>
          </div>
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
            MEDICAL CLAIM INTELLIGENCE
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Advanced evidence-based analysis engine. Cross-reference medical claims with trusted sources and publish verifiable intelligence to the decentralized knowledge graph.
          </p>
        </div>

        {/* Input Card */}
        <div className="card-cyber p-8 mb-8">
          <div className="mb-6">
            <label htmlFor="claim-input" className="block text-sm font-semibold text-cyan-400 mb-3 uppercase tracking-wider">
              <Activity className="w-4 h-4 inline mr-2" />
              Enter Medical Claim
            </label>
            <textarea
              id="claim-input"
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              placeholder="e.g., 'Ivermectin cures COVID-19' or 'Ozempic causes cancer'"
              className="input-cyber resize-none"
              rows={4}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleEvaluate();
                }
              }}
            />
            <p className="mt-3 text-xs text-gray-500 font-mono">Press Ctrl+Enter to analyze</p>
          </div>

          {/* Quick Examples */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider font-mono">Quick Examples</p>
            <div className="flex flex-wrap gap-2">
              {exampleClaims.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setClaim(example)}
                  className="text-xs px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 rounded-md border border-cyan-500/30 transition-all font-mono hover:border-cyan-500/50"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleEvaluate}
            disabled={evaluation.loading || !claim.trim()}
            className="btn-cyber w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {evaluation.loading ? (
              <span className="flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>ANALYZING CLAIM...</span>
              </span>
            ) : (
              'ANALYZE CLAIM'
            )}
          </button>
        </div>

        {/* Error Display */}
        {evaluation.error && (
          <div className="card-cyber p-6 mb-8 border-red-500/30 bg-red-500/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-400 font-semibold mb-1">ERROR</p>
                <p className="text-gray-300 text-sm">{evaluation.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {evaluation.result && (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="card-cyber p-8">
              <div className="flex items-start justify-between mb-8 pb-6 border-b border-cyan-500/20">
                <div>
                  <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                    ANALYSIS RESULTS
                  </h3>
                  <p className="text-sm text-gray-400 font-mono">
                    Claim ID: <span className="text-cyan-400">{evaluation.result.claimId}</span>
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-mono">Risk Level</p>
                    <span className={`inline-block px-4 py-2 rounded-lg font-semibold text-sm ${
                      evaluation.result.riskLevel === 'high' ? 'badge-risk-high' :
                      evaluation.result.riskLevel === 'medium' ? 'badge-risk-medium' :
                      'badge-risk-low'
                    }`}>
                      {evaluation.result.riskLevel.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-mono">Confidence</p>
                    <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                      {(evaluation.result.explanation.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Patient Explanation */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                  <Shield className="w-5 h-5" />
                  Patient Summary
                </h4>
                <div className="bg-cyan-500/10 border-l-4 border-cyan-500 p-6 rounded-r-lg">
                  <p className="text-gray-300 leading-relaxed">{evaluation.result.explanation.patientFriendly}</p>
                </div>
              </div>

              {/* Metadata Grid */}
              {evaluation.result.metadata && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-4 uppercase tracking-wider">Extracted Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {evaluation.result.metadata.compound && (
                      <div className="bg-[#1a1f2e] p-4 rounded-lg border border-cyan-500/20">
                        <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide font-mono">Compound</p>
                        <p className="font-semibold text-cyan-300">{evaluation.result.metadata.compound}</p>
                      </div>
                    )}
                    {evaluation.result.metadata.condition && (
                      <div className="bg-[#1a1f2e] p-4 rounded-lg border border-cyan-500/20">
                        <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide font-mono">Condition</p>
                        <p className="font-semibold text-cyan-300">{evaluation.result.metadata.condition}</p>
                      </div>
                    )}
                    {evaluation.result.metadata.claimType && (
                      <div className="bg-[#1a1f2e] p-4 rounded-lg border border-cyan-500/20">
                        <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide font-mono">Claim Type</p>
                        <p className="font-semibold text-cyan-300">{evaluation.result.metadata.claimType}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Truth Assessment */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-cyan-400 mb-6 uppercase tracking-wider">Evidence Assessment</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {evaluation.result.explanation.truthAssessment.true && evaluation.result.explanation.truthAssessment.true.length > 0 && (
                    <div className="bg-green-500/10 border-2 border-green-500/30 p-6 rounded-lg">
                      <h5 className="font-semibold text-green-400 mb-4 flex items-center gap-2 uppercase tracking-wider text-sm">
                        <CheckCircle2 className="w-5 h-5" />
                        Supported
                      </h5>
                      <ul className="space-y-2">
                        {evaluation.result.explanation.truthAssessment.true.map((item, idx) => (
                          <li key={idx} className="text-sm text-green-300/90 flex items-start gap-2">
                            <span className="mt-1 text-green-400">▸</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {evaluation.result.explanation.truthAssessment.false && evaluation.result.explanation.truthAssessment.false.length > 0 && (
                    <div className="bg-red-500/10 border-2 border-red-500/30 p-6 rounded-lg">
                      <h5 className="font-semibold text-red-400 mb-4 flex items-center gap-2 uppercase tracking-wider text-sm">
                        <AlertCircle className="w-5 h-5" />
                        Refuted
                      </h5>
                      <ul className="space-y-2">
                        {evaluation.result.explanation.truthAssessment.false.map((item, idx) => (
                          <li key={idx} className="text-sm text-red-300/90 flex items-start gap-2">
                            <span className="mt-1 text-red-400">▸</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {evaluation.result.explanation.truthAssessment.inconclusive && evaluation.result.explanation.truthAssessment.inconclusive.length > 0 && (
                    <div className="bg-yellow-500/10 border-2 border-yellow-500/30 p-6 rounded-lg">
                      <h5 className="font-semibold text-yellow-400 mb-4 flex items-center gap-2 uppercase tracking-wider text-sm">
                        <Activity className="w-5 h-5" />
                        Inconclusive
                      </h5>
                      <ul className="space-y-2">
                        {evaluation.result.explanation.truthAssessment.inconclusive.map((item, idx) => (
                          <li key={idx} className="text-sm text-yellow-300/90 flex items-start gap-2">
                            <span className="mt-1 text-yellow-400">▸</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Evidence Sources */}
              {evaluation.result.evidence && evaluation.result.evidence.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-6 uppercase tracking-wider">Evidence Sources</h4>
                  <div className="space-y-4">
                    {evaluation.result.evidence.map((evidence, idx) => (
                      <div key={idx} className="bg-[#1a1f2e] p-5 rounded-lg border border-cyan-500/20">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-md text-xs font-semibold font-mono ${
                              evidence.relation === 'supports' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                              evidence.relation === 'refutes' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                              'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            }`}>
                              {evidence.relation.toUpperCase()}
                            </span>
                            <span className="font-semibold text-cyan-300">{evidence.source}</span>
                            <span className="text-xs text-gray-500 font-mono">
                              ({(evidence.confidence * 100).toFixed(0)}%)
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-300 mt-2 leading-relaxed">{evidence.summary}</p>
                        {evidence.url && (
                          <a 
                            href={evidence.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-cyan-400 hover:text-cyan-300 text-xs mt-3 inline-flex items-center gap-1 font-medium transition-colors"
                          >
                            View source <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {(evaluation.result.explanation.warnings?.length > 0 || evaluation.result.explanation.contraindications?.length > 0) && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-4 uppercase tracking-wider">Warnings & Contraindications</h4>
                  <div className="space-y-3">
                    {evaluation.result.explanation.warnings?.map((warning, idx) => (
                      <div key={idx} className="bg-yellow-500/10 border-l-4 border-yellow-500 p-4 rounded-r">
                        <p className="text-yellow-300 text-sm font-medium">{warning}</p>
                      </div>
                    ))}
                    {evaluation.result.explanation.contraindications?.map((contra, idx) => (
                      <div key={idx} className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r">
                        <p className="text-red-300 text-sm font-medium">{contra}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Publish Section */}
              <div className="pt-8 border-t border-cyan-500/20">
                {evaluation.publishing ? (
                  <div className="card-cyber p-8 border-cyan-500/40 loading-pulse">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                      <div className="text-center">
                        <p className="text-xl font-semibold text-cyan-400 mb-2 uppercase tracking-wider">
                          Publishing to DKG Network
                        </p>
                        <p className="text-sm text-gray-400 font-mono">
                          This may take up to 30 seconds...
                        </p>
                        <div className="mt-4 flex items-center justify-center gap-2">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : evaluation.published && evaluation.ual ? (
                  <div className="card-cyber p-8 border-green-500/40 bg-green-500/5 success-glow">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-green-500/20 rounded-lg flex items-center justify-center border-2 border-green-500/50 glow-green">
                          <CheckCircle2 className="w-10 h-10 text-green-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-green-400 mb-2 uppercase tracking-wider">
                          Successfully Published to DKG
                        </h3>
                        <p className="text-sm text-gray-400 mb-4 font-mono break-all">
                          UAL: <span className="text-cyan-400">{evaluation.ual}</span>
                        </p>
                        <a
                          href={getDKGExplorerUrl(evaluation.ual)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-300 font-semibold transition-all hover:border-cyan-500 hover:glow-cyan"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View on DKG Explorer
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button onClick={handlePublish} className="btn-cyber w-full">
                    <Database className="w-5 h-5 inline mr-2" />
                    PUBLISH TO DKG NETWORK
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Features Grid */}
        {!evaluation.result && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="card-cyber p-6">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4 border border-cyan-500/30">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-cyan-300 mb-2 uppercase tracking-wider">Risk Assessment</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Automated risk level detection with evidence-based scrutiny adjustment.</p>
            </div>

            <div className="card-cyber p-6">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4 border border-cyan-500/30">
                <Activity className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-cyan-300 mb-2 uppercase tracking-wider">Evidence Alignment</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Cross-referenced with WHO, CDC, FDA, PubMed, and EMA sources.</p>
            </div>

            <div className="card-cyber p-6">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4 border border-cyan-500/30">
                <Database className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-cyan-300 mb-2 uppercase tracking-wider">DKG Publishing</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Verifiable medical intelligence published on OriginTrail DKG.</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-cyan-500/20 mt-20 bg-[#0f172a]/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <p className="mb-2 font-semibold text-cyan-300 uppercase tracking-wider">MedScope AI</p>
            <p className="text-xs text-gray-500 font-mono">Medical Intelligence Platform</p>
            <p className="text-xs text-gray-600 mt-2 font-mono">Scaling Trust in the Age of AI Global Hackathon 2025</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
