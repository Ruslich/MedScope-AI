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

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRelationBadgeColor = (relation: string) => {
    switch (relation) {
      case 'supports':
        return 'bg-green-100 text-green-800';
      case 'refutes':
        return 'bg-red-100 text-red-800';
      case 'inconclusive':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MedScope AI</h1>
                <p className="text-sm text-gray-600">Decentralized Medical Claim Intelligence</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Powered by OriginTrail DKG
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Evaluate Medical Claims with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {' '}AI-Powered Intelligence
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            MedScope AI analyzes medical claims, aligns them with evidence from trusted sources,
            and publishes verifiable medical intelligence on the decentralized knowledge graph.
          </p>
        </div>

        {/* Claim Input Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
          <div className="mb-6">
            <label htmlFor="claim" className="block text-sm font-medium text-gray-700 mb-2">
              Enter a Medical Claim
            </label>
            <textarea
              id="claim"
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              placeholder="e.g., 'Ivermectin cures COVID-19', 'Ozempic causes cancer', or just 'Semaglutide'"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleEvaluate();
                }
              }}
            />
            <p className="mt-2 text-sm text-gray-500">
              Press Ctrl+Enter to evaluate
            </p>
          </div>

          {/* Example Claims */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Example Claims:</p>
            <div className="flex flex-wrap gap-2">
              {exampleClaims.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setClaim(example)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleEvaluate}
            disabled={evaluation.loading || !claim.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            {evaluation.loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Evaluating...
              </span>
            ) : (
              'Evaluate Claim'
            )}
          </button>
        </div>

        {/* Error Message */}
        {evaluation.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-800">{evaluation.error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {evaluation.result && (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Evaluation Results</h3>
                  <p className="text-gray-600">Claim ID: {evaluation.result.claimId}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Risk Level</p>
                    <span
                      className={`inline-block px-4 py-2 rounded-lg border font-semibold ${getRiskBadgeColor(
                        evaluation.result.riskLevel
                      )}`}
                    >
                      {evaluation.result.riskLevel.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Confidence</p>
                    <span className="text-2xl font-bold text-gray-900">
                      {(evaluation.result.explanation.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Patient-Friendly Explanation */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Patient-Friendly Explanation
                </h4>
                <p className="text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-lg">
                  {evaluation.result.explanation.patientFriendly}
                </p>
              </div>

              {/* Metadata */}
              {evaluation.result.metadata && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Extracted Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {evaluation.result.metadata.compound && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Compound</p>
                        <p className="font-medium text-gray-900">{evaluation.result.metadata.compound}</p>
                      </div>
                    )}
                    {evaluation.result.metadata.condition && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Condition</p>
                        <p className="font-medium text-gray-900">{evaluation.result.metadata.condition}</p>
                      </div>
                    )}
                    {evaluation.result.metadata.claimType && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Claim Type</p>
                        <p className="font-medium text-gray-900">{evaluation.result.metadata.claimType}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Truth Assessment */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Truth Assessment</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {evaluation.result.explanation.truthAssessment.true &&
                    evaluation.result.explanation.truthAssessment.true.length > 0 && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h5 className="font-semibold text-green-900 mb-2 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          True Aspects
                        </h5>
                        <ul className="space-y-1">
                          {evaluation.result.explanation.truthAssessment.true.map((item, idx) => (
                            <li key={idx} className="text-sm text-green-800">
                              • {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  {evaluation.result.explanation.truthAssessment.false &&
                    evaluation.result.explanation.truthAssessment.false.length > 0 && (
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h5 className="font-semibold text-red-900 mb-2 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          False Aspects
                        </h5>
                        <ul className="space-y-1">
                          {evaluation.result.explanation.truthAssessment.false.map((item, idx) => (
                            <li key={idx} className="text-sm text-red-800">
                              • {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  {evaluation.result.explanation.truthAssessment.inconclusive &&
                    evaluation.result.explanation.truthAssessment.inconclusive.length > 0 && (
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h5 className="font-semibold text-yellow-900 mb-2 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Inconclusive
                        </h5>
                        <ul className="space-y-1">
                          {evaluation.result.explanation.truthAssessment.inconclusive.map((item, idx) => (
                            <li key={idx} className="text-sm text-yellow-800">
                              • {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </div>

              {/* Warnings & Contraindications */}
              {(evaluation.result.explanation.warnings?.length > 0 ||
                evaluation.result.explanation.contraindications?.length > 0) && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Warnings & Contraindications</h4>
                  <div className="space-y-3">
                    {evaluation.result.explanation.warnings?.map((warning, idx) => (
                      <div key={idx} className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <p className="text-yellow-800">{warning}</p>
                      </div>
                    ))}
                    {evaluation.result.explanation.contraindications?.map((contra, idx) => (
                      <div key={idx} className="bg-red-50 border-l-4 border-red-400 p-4">
                        <p className="text-red-800">{contra}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence Sources */}
              {evaluation.result.evidence && evaluation.result.evidence.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Evidence Sources</h4>
                  <div className="space-y-3">
                    {evaluation.result.evidence.map((evidence, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getRelationBadgeColor(
                                evidence.relation
                              )}`}
                            >
                              {evidence.relation.toUpperCase()}
                            </span>
                            <span className="font-semibold text-gray-900">{evidence.source}</span>
                            <span className="text-sm text-gray-500">
                              ({(evidence.confidence * 100).toFixed(0)}% confidence)
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm mt-2">{evidence.summary}</p>
                        {evidence.url && (
                          <a
                            href={evidence.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                          >
                            View source →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Actions */}
              {evaluation.result.explanation.suggestedActions &&
                evaluation.result.explanation.suggestedActions.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Suggested Actions</h4>
                    <ul className="space-y-2">
                      {evaluation.result.explanation.suggestedActions.map((action, idx) => (
                        <li key={idx} className="flex items-start text-gray-700">
                          <svg
                            className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Publish Button */}
              <div className="pt-6 border-t border-gray-200">
                {evaluation.published && evaluation.ual ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-green-900 mb-1">Published to DKG!</p>
                        <p className="text-sm text-green-700">UAL: {evaluation.ual}</p>
                      </div>
                      <svg
                        className="w-8 h-8 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handlePublish}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    Publish to DKG as Knowledge Asset
                  </button>
                )}
              </div>
            </div>

            {/* Clinician Summary (Collapsible) */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <details className="cursor-pointer">
                <summary className="text-lg font-semibold text-gray-900 mb-4 list-none">
                  <div className="flex items-center justify-between">
                    <span>Clinician Summary</span>
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </summary>
                <div className="mt-4">
                  <pre className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap font-mono">
                    {evaluation.result.explanation.clinicianSummary}
                  </pre>
                </div>
              </details>
            </div>
          </div>
        )}

        {/* Features Section */}
        {!evaluation.result && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Risk-Aware Analysis</h3>
              <p className="text-gray-600">
                Automatically detects risk levels and adjusts evidence scrutiny accordingly.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Evidence Alignment</h3>
              <p className="text-gray-600">
                Aligns claims with evidence from WHO, CDC, FDA, PubMed, and other trusted sources.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">DKG Publishing</h3>
              <p className="text-gray-600">
                Publishes verifiable medical intelligence as Knowledge Assets on OriginTrail DKG.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              MedScope AI - Decentralized Medical Claim Intelligence Layer
            </p>
            <p className="text-sm">
              Built for the Scaling Trust in the Age of AI Global Hackathon 2025
            </p>
            <p className="text-sm mt-2">
              Powered by OriginTrail DKG • MCP Integration • Three-Layer Architecture
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

