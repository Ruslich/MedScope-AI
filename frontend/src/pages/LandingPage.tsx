import { useState } from 'react';
import {
  evaluateClaim,
  publishExplanation,
  ClaimEvaluationResponse,
  PublishExplanationRequest,
} from '../services/api';

interface EvaluationState {
  loading: boolean;
  result: ClaimEvaluationResponse | null;
  error: string | null;
  published: boolean;
  ual: string | null;
}

const LandingPage = () => {
  const [claim, setClaim] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationState>({
    loading: false,
    result: null,
    error: null,
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
        published: false,
        ual: null,
      });
    } catch (error: any) {
      setEvaluation({
        loading: false,
        result: null,
        error: error.response?.data?.detail || error.message || 'Failed to evaluate claim',
        published: false,
        ual: null,
      });
    }
  };

  const handlePublish = async () => {
    if (!evaluation.result) return;

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

      if (response.success) {
        setEvaluation({
          ...evaluation,
          published: true,
          ual: response.ual || null,
        });
      } else {
        setEvaluation({
          ...evaluation,
          error: response.message || 'Failed to publish explanation',
        });
      }
    } catch (error: any) {
      setEvaluation({
        ...evaluation,
        error: error.response?.data?.detail || error.message || 'Failed to publish explanation',
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-medical-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-medical-500 to-medical-700 rounded-xl flex items-center justify-center shadow-medical">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-gray-900">MedScope AI</h1>
                <p className="text-xs text-gray-500 font-medium">Medical Intelligence Platform</p>
              </div>
            </div>
            <div className="text-xs text-gray-500 bg-medical-50 px-3 py-1.5 rounded-lg border border-medical-200">
              Powered by OriginTrail DKG
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-display font-bold text-gray-900 mb-3">
            Medical Claim Intelligence
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Evaluate medical claims with evidence-based analysis. Get structured insights from trusted medical sources.
          </p>
        </div>

        {/* Input Card */}
        <div className="card-medical p-8 mb-8">
          <div className="mb-6">
            <label htmlFor="claim-input" className="block text-sm font-semibold text-gray-700 mb-3">
              Enter Medical Claim
            </label>
            <textarea
              id="claim-input"
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              placeholder="e.g., 'Ivermectin cures COVID-19' or 'Ozempic causes cancer'"
              className="w-full px-4 py-3 border-2 border-medical-200 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 resize-none transition-all"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleEvaluate();
                }
              }}
            />
            <p className="mt-2 text-xs text-gray-500">Press Ctrl+Enter to evaluate</p>
          </div>

          {/* Quick Examples */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Quick Examples</p>
            <div className="flex flex-wrap gap-2">
              {exampleClaims.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setClaim(example)}
                  className="text-xs px-3 py-1.5 bg-medical-50 hover:bg-medical-100 text-medical-700 rounded-md border border-medical-200 transition-colors font-medium"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleEvaluate}
            disabled={evaluation.loading || !claim.trim()}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {evaluation.loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </span>
            ) : (
              'Analyze Claim'
            )}
          </button>
        </div>

        {/* Error Display */}
        {evaluation.error && (
          <div className="card-medical p-6 mb-8 border-status-danger/20 bg-status-danger/5">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-status-danger mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-status-danger font-medium">{evaluation.error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {evaluation.result && (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="card-medical p-8">
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-medical-100">
                <div>
                  <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">Analysis Results</h3>
                  <p className="text-sm text-gray-500">Claim ID: <span className="font-mono text-medical-600">{evaluation.result.claimId}</span></p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Risk Level</p>
                    <span className={`inline-block px-4 py-2 rounded-lg font-semibold text-sm ${
                      evaluation.result.riskLevel === 'high' ? 'badge-risk-high' :
                      evaluation.result.riskLevel === 'medium' ? 'badge-risk-medium' :
                      'badge-risk-low'
                    }`}>
                      {evaluation.result.riskLevel.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Confidence</p>
                    <span className="text-2xl font-display font-bold text-medical-600">
                      {(evaluation.result.explanation.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Patient Explanation */}
              <div className="mb-6">
                <h4 className="text-lg font-display font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-medical-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Patient Summary
                </h4>
                <div className="bg-medical-50 border-l-4 border-medical-500 p-5 rounded-r-lg">
                  <p className="text-gray-700 leading-relaxed">{evaluation.result.explanation.patientFriendly}</p>
                </div>
              </div>

              {/* Metadata Grid */}
              {evaluation.result.metadata && (
                <div className="mb-6">
                  <h4 className="text-lg font-display font-semibold text-gray-900 mb-3">Extracted Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {evaluation.result.metadata.compound && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Compound</p>
                        <p className="font-semibold text-gray-900">{evaluation.result.metadata.compound}</p>
                      </div>
                    )}
                    {evaluation.result.metadata.condition && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Condition</p>
                        <p className="font-semibold text-gray-900">{evaluation.result.metadata.condition}</p>
                      </div>
                    )}
                    {evaluation.result.metadata.claimType && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Claim Type</p>
                        <p className="font-semibold text-gray-900">{evaluation.result.metadata.claimType}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Truth Assessment */}
              <div className="mb-6">
                <h4 className="text-lg font-display font-semibold text-gray-900 mb-4">Evidence Assessment</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {evaluation.result.explanation.truthAssessment.true && evaluation.result.explanation.truthAssessment.true.length > 0 && (
                    <div className="bg-status-safe/10 border-2 border-status-safe/20 p-5 rounded-lg">
                      <h5 className="font-semibold text-status-safe mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Supported
                      </h5>
                      <ul className="space-y-2">
                        {evaluation.result.explanation.truthAssessment.true.map((item, idx) => (
                          <li key={idx} className="text-sm text-status-safe/90 flex items-start gap-2">
                            <span className="mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {evaluation.result.explanation.truthAssessment.false && evaluation.result.explanation.truthAssessment.false.length > 0 && (
                    <div className="bg-status-danger/10 border-2 border-status-danger/20 p-5 rounded-lg">
                      <h5 className="font-semibold text-status-danger mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Refuted
                      </h5>
                      <ul className="space-y-2">
                        {evaluation.result.explanation.truthAssessment.false.map((item, idx) => (
                          <li key={idx} className="text-sm text-status-danger/90 flex items-start gap-2">
                            <span className="mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {evaluation.result.explanation.truthAssessment.inconclusive && evaluation.result.explanation.truthAssessment.inconclusive.length > 0 && (
                    <div className="bg-status-warning/10 border-2 border-status-warning/20 p-5 rounded-lg">
                      <h5 className="font-semibold text-status-warning mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Inconclusive
                      </h5>
                      <ul className="space-y-2">
                        {evaluation.result.explanation.truthAssessment.inconclusive.map((item, idx) => (
                          <li key={idx} className="text-sm text-status-warning/90 flex items-start gap-2">
                            <span className="mt-1">•</span>
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
                <div className="mb-6">
                  <h4 className="text-lg font-display font-semibold text-gray-900 mb-4">Evidence Sources</h4>
                  <div className="space-y-3">
                    {evaluation.result.evidence.map((evidence, idx) => (
                      <div key={idx} className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              evidence.relation === 'supports' ? 'bg-status-safe/10 text-status-safe border border-status-safe/20' :
                              evidence.relation === 'refutes' ? 'bg-status-danger/10 text-status-danger border border-status-danger/20' :
                              'bg-status-warning/10 text-status-warning border border-status-warning/20'
                            }`}>
                              {evidence.relation.toUpperCase()}
                            </span>
                            <span className="font-semibold text-gray-900">{evidence.source}</span>
                            <span className="text-xs text-gray-500">
                              ({(evidence.confidence * 100).toFixed(0)}%)
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mt-2">{evidence.summary}</p>
                        {evidence.url && (
                          <a href={evidence.url} target="_blank" rel="noopener noreferrer" className="text-medical-600 hover:text-medical-700 text-xs mt-2 inline-block font-medium">
                            View source →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {(evaluation.result.explanation.warnings?.length > 0 || evaluation.result.explanation.contraindications?.length > 0) && (
                <div className="mb-6">
                  <h4 className="text-lg font-display font-semibold text-gray-900 mb-3">Warnings & Contraindications</h4>
                  <div className="space-y-2">
                    {evaluation.result.explanation.warnings?.map((warning, idx) => (
                      <div key={idx} className="bg-status-warning/10 border-l-4 border-status-warning p-4 rounded-r">
                        <p className="text-status-warning/90 text-sm font-medium">{warning}</p>
                      </div>
                    ))}
                    {evaluation.result.explanation.contraindications?.map((contra, idx) => (
                      <div key={idx} className="bg-status-danger/10 border-l-4 border-status-danger p-4 rounded-r">
                        <p className="text-status-danger/90 text-sm font-medium">{contra}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Publish Section */}
              <div className="pt-6 border-t border-medical-100">
                {evaluation.published && evaluation.ual ? (
                  <div className="bg-status-safe/10 border-2 border-status-safe/20 rounded-lg p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-status-safe mb-1">Published to DKG</p>
                        <p className="text-xs text-status-safe/80 font-mono break-all">{evaluation.ual}</p>
                      </div>
                      <svg className="w-8 h-8 text-status-safe" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <button onClick={handlePublish} className="btn-primary w-full">
                    Publish to DKG Network
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Features Grid */}
        {!evaluation.result && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="card-medical p-6">
              <div className="w-12 h-12 bg-medical-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-medical-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-display font-semibold text-gray-900 mb-2">Risk Assessment</h3>
              <p className="text-sm text-gray-600">Automated risk level detection with evidence-based scrutiny adjustment.</p>
            </div>

            <div className="card-medical p-6">
              <div className="w-12 h-12 bg-medical-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-medical-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-display font-semibold text-gray-900 mb-2">Evidence Alignment</h3>
              <p className="text-sm text-gray-600">Cross-referenced with WHO, CDC, FDA, PubMed, and EMA sources.</p>
            </div>

            <div className="card-medical p-6">
              <div className="w-12 h-12 bg-medical-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-medical-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-display font-semibold text-gray-900 mb-2">DKG Publishing</h3>
              <p className="text-sm text-gray-600">Verifiable medical intelligence published on OriginTrail DKG.</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-medical-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-1 font-medium">MedScope AI - Medical Claim Intelligence Platform</p>
            <p className="text-xs">Scaling Trust in the Age of AI Global Hackathon 2025</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
