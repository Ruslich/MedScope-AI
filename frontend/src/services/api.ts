import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const DKG_URL = import.meta.env.VITE_DKG_URL || 'http://localhost:9200';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const dkgApi = axios.create({
  baseURL: DKG_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ClaimEvaluationRequest {
  claim: string;
  includeDetailedEvidence?: boolean;
}

export interface ClaimEvaluationResponse {
  claim: string;
  claimId: string;
  riskLevel: 'low' | 'medium' | 'high';
  metadata: {
    compound?: string;
    condition?: string;
    claimType?: string;
  };
  evidence: Array<{
    source: string;
    summary: string;
    relation: 'supports' | 'refutes' | 'inconclusive';
    confidence: number;
    url?: string;
  }>;
  explanation: {
    patientFriendly: string;
    clinicianSummary: string;
    truthAssessment: {
      true?: string[];
      false?: string[];
      inconclusive?: string[];
    };
    warnings?: string[];
    contraindications?: string[];
    alternatives?: string[];
    confidence: number;
    suggestedActions?: string[];
  };
  evaluatedAt: string;
}

export interface PublishExplanationRequest {
  claim: string;
  claimId: string;
  riskLevel: 'low' | 'medium' | 'high';
  evidence: Array<{
    source: string;
    summary: string;
    relation: 'supports' | 'refutes' | 'inconclusive';
    confidence: number;
  }>;
  explanation: {
    patientFriendly: string;
    clinicianSummary: string;
    truthAssessment: {
      true?: string[];
      false?: string[];
      inconclusive?: string[];
    };
    warnings?: string[];
    contraindications?: string[];
    alternatives?: string[];
    confidence: number;
    suggestedActions?: string[];
  };
  metadata?: {
    compound?: string;
    condition?: string;
    claimType?: string;
  };
}

export interface PublishExplanationResponse {
  success: boolean;
  ual?: string;
  claimId: string;
  message: string;
}

export interface PublishedExplanation {
  '@id': string;
  ual: string | null;
  claim: string;
  claimId: string;
  riskLevel: string;
  publishedAt: string;
}

export interface PublishedExplanationsResponse {
  found: number;
  total: number;
  explanations: PublishedExplanation[];
  error?: string;
}

export const evaluateClaim = async (
  request: ClaimEvaluationRequest
): Promise<ClaimEvaluationResponse> => {
  const response = await api.post<ClaimEvaluationResponse>(
    '/api/claims/evaluate',
    request
  );
  return response.data;
};

export const publishExplanation = async (
  request: PublishExplanationRequest
): Promise<PublishExplanationResponse> => {
  const response = await api.post<PublishExplanationResponse>(
    '/api/explanations/publish',
    request
  );
  return response.data;
};

export const getExplanation = async (claimId: string) => {
  const response = await api.get(`/api/explanations/${claimId}`);
  return response.data;
};

export const getPublishedExplanations = async (
  limit: number = 50,
  offset: number = 0,
  riskLevel?: string,
  keyword?: string
): Promise<PublishedExplanationsResponse> => {
  const params: any = { 
    limit: Number(limit), 
    offset: Number(offset) 
  };
  if (riskLevel) params.riskLevel = riskLevel;
  if (keyword) params.keyword = keyword;
  
  const response = await dkgApi.get<PublishedExplanationsResponse>(
    '/medscope/explanations',
    { params }
  );
  return response.data;
};

export default api;
