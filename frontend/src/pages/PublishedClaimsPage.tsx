import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Database, ExternalLink, Search, Filter, 
  AlertCircle, Activity, CheckCircle2, Loader2,
  ArrowLeft, Calendar, Hash
} from 'lucide-react';
import { getPublishedExplanations, PublishedExplanation } from '../services/api';

const PublishedClaimsPage = () => {
  const navigate = useNavigate();
  const [explanations, setExplanations] = useState<PublishedExplanation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadExplanations();
  }, [riskFilter]);

  const loadExplanations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPublishedExplanations(
        100, // limit
        0,   // offset
        riskFilter !== 'all' ? riskFilter : undefined,
        searchTerm || undefined
      );
      setExplanations(response.explanations || []);
      setTotal(response.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to load published claims');
      setExplanations([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadExplanations();
  };

  const getDKGExplorerUrl = (ual: string | null, claimId?: string) => {
    // If we have a valid UAL, use it
    if (ual && ual.startsWith('did:dkg:')) {
      const encodedUal = encodeURIComponent(ual);
      return `https://dkg-testnet.origintrail.io/explore?ual=${encodedUal}`;
    }
    // Fallback: use claimId as search parameter or just link to explorer homepage
    if (claimId) {
      // Try searching by claimId (this might not work, but it's a placeholder)
      const encodedClaimId = encodeURIComponent(claimId);
      return `https://dkg-testnet.origintrail.io/explore?search=${encodedClaimId}`;
    }
    // Final fallback: just link to the explorer homepage
    return `https://dkg-testnet.origintrail.io/explore`;
  };

  const getRiskBadgeClass = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high':
        return 'badge-risk-high';
      case 'medium':
        return 'badge-risk-medium';
      case 'low':
        return 'badge-risk-low';
      default:
        return 'badge-risk-medium';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="border-b border-cyan-500/20 bg-[#0f172a]/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-cyan-500/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-cyan-400" />
              </button>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center glow-cyan">
                  <Database className="w-8 h-8 text-[#0a0e1a]" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0a0e1a] animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  PUBLISHED CLAIMS
                </h1>
                <p className="text-xs text-gray-400 font-mono">DKG KNOWLEDGE ASSETS</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <Database className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono text-cyan-300">{total} ASSETS</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Search and Filter Section */}
        <div className="card-cyber p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-cyan-400 mb-2 uppercase tracking-wider">
                <Search className="w-4 h-4 inline mr-2" />
                Search Claims
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by claim text or claim ID..."
                  className="input-cyber flex-1"
                />
                <button
                  onClick={handleSearch}
                  className="btn-cyber px-6"
                >
                  SEARCH
                </button>
              </div>
            </div>
            <div className="md:w-64">
              <label className="block text-sm font-semibold text-cyan-400 mb-2 uppercase tracking-wider">
                <Filter className="w-4 h-4 inline mr-2" />
                Risk Level
              </label>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="input-cyber w-full"
              >
                <option value="all">All Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="card-cyber p-6 mb-8 border-red-500/30 bg-red-500/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-400 font-semibold mb-1">ERROR</p>
                <p className="text-gray-300 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="card-cyber p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
              <p className="text-cyan-400 font-semibold uppercase tracking-wider">
                Loading Published Claims...
              </p>
            </div>
          </div>
        )}

        {/* Claims Grid */}
        {!loading && !error && (
          <>
            {explanations.length === 0 ? (
              <div className="card-cyber p-12 text-center">
                <Database className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                  No Published Claims Found
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  {searchTerm || riskFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No medical explanations have been published to the DKG yet.'}
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="btn-cyber"
                >
                  PUBLISH FIRST CLAIM
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-cyan-400 uppercase tracking-wider">
                    Published Medical Explanations
                  </h2>
                  <span className="text-sm text-gray-400 font-mono">
                    {explanations.length} of {total}
                  </span>
                </div>

                {explanations.map((explanation, index) => {
                  const explorerUrl = getDKGExplorerUrl(explanation.ual || null, explanation.claimId);
                  const hasValidUal = explanation.ual && explanation.ual.startsWith('did:dkg:');
                  
                  return (
                    <div
                      key={`${explanation.claimId}-${index}`}
                      className="card-cyber p-6 hover:border-cyan-500/40 transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center border border-cyan-500/30">
                                <Shield className="w-6 h-6 text-cyan-400" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-cyan-300 mb-2 leading-relaxed">
                                {explanation.claim}
                              </h3>
                              <div className="flex flex-wrap items-center gap-3 mb-3">
                                <span className={`${getRiskBadgeClass(explanation.riskLevel)}`}>
                                  {explanation.riskLevel?.toUpperCase() || 'UNKNOWN'}
                                </span>
                                <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                                  <Hash className="w-3 h-3" />
                                  <span>{explanation.claimId}</span>
                                </div>
                                {explanation.publishedAt && (
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(explanation.publishedAt)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 md:items-end">
                          {/* Always show the button, even if UAL is not available */}
                          <a
                            href={explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg font-semibold text-sm transition-all ${
                              hasValidUal
                                ? 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/50 text-cyan-300 hover:border-cyan-500 hover:glow-cyan'
                                : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/50 text-amber-300 hover:border-amber-500'
                            }`}
                            title={hasValidUal ? 'View on DKG Explorer' : 'UAL not available - Opening DKG Explorer homepage'}
                          >
                            <ExternalLink className="w-4 h-4" />
                            View on DKG Explorer
                          </a>
                          {explanation.ual && hasValidUal && (
                            <div className="text-xs text-gray-500 font-mono break-all max-w-xs text-right">
                              {explanation.ual}
                            </div>
                          )}
                          {!hasValidUal && (
                            <div className="text-xs text-amber-500/70 font-mono text-right">
                              
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
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

export default PublishedClaimsPage;

