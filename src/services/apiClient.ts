export interface BackendRiskAssessment {
  risk_score: number;
  safety_status: 'HIGH' | 'MEDIUM' | 'LOW';
  status_icon: string;
  statutory_form: string;
}

export interface BackendDetectedHazard {
  category: string;
  matched_keyword: string;
  recommendation: string;
}

export interface DocumentMetadata {
  filename: string;
  file_format: string; // "PDF", "DOCX", "TXT"
  file_size_bytes: number;
  file_size_formatted: string;
  total_pages?: number | null;
  extracted_character_count: number;
  extracted_word_count: number;
  quality_status: string;
  tables_extracted?: number | null;
}

export interface BackendAnalysisResponse {
  status: string;
  request_id: string;
  source_type: string;
  report_name: string;
  cleaned_text_sample: string;
  risk_assessment: BackendRiskAssessment;
  hazard_count: number;
  detected_hazards: BackendDetectedHazard[];
  alerts: string[];
  recommendations: string[];
  summary: string;
  document_metadata?: DocumentMetadata | null;
}

export interface BackendHealthResponse {
  status: string;
  application: string;
  version: string;
  message: string;
}

const API_BASE = ''; // Uses Vite proxy to route /health and /api to Python backend on port 8001

export async function checkBackendHealth(): Promise<{ ok: boolean; data?: BackendHealthResponse; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}: ${res.statusText}` };
    }
    const data: BackendHealthResponse = await res.json();
    return { ok: true, data };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Cannot reach Python backend service' };
  }
}

import { getCurrentUserIdToken } from './firebase';

export async function analyzeIncidentText(
  incidentText: string,
  reportName: string = 'Manual_Report'
): Promise<BackendAnalysisResponse> {
  const token = await getCurrentUserIdToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/api/v1/analyze`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      incident_text: incidentText,
      report_name: reportName,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const msg = errorBody?.message || errorBody?.detail || `HTTP ${response.status} - Analysis Failed`;
    throw new Error(msg);
  }

  return await response.json();
}

export async function analyzeIncidentDocument(
  file: File
): Promise<BackendAnalysisResponse> {
  const token = await getCurrentUserIdToken();
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/api/v1/analyze-file`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const msg = errorBody?.message || errorBody?.detail || `HTTP ${response.status} - Document Upload Failed`;
    throw new Error(msg);
  }

  return await response.json();
}

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiChatResponse {
  status: string;
  reply: string;
  model: string;
  disclaimer: string;
}

export interface StructuredReportExplanation {
  incident_summary: string;
  explanation_of_event: string;
  hazard_explanations: Array<{
    hazard_name: string;
    explanation: string;
    report_evidence?: string;
  }>;
  why_hazards_matter: string;
  recommendations_breakdown: string[];
  important_observations: string[];
  information_gaps: string[];
  suggested_inspections: string[];
  safety_notice: string;
}

export interface AiReportExplanationResponse {
  status: string;
  explanation: StructuredReportExplanation;
  model: string;
}

export interface AiSummaryResponse {
  status: string;
  summary: string;
  model: string;
  disclaimer: string;
}

export interface AiHazardExplanationResponse {
  status: string;
  hazard_name: string;
  explanation: string;
  model: string;
  disclaimer: string;
}

export async function chatWithAi(
  message: string,
  contextReport?: any,
  conversationHistory?: AiChatMessage[]
): Promise<AiChatResponse> {
  const token = await getCurrentUserIdToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/api/v1/ai/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message,
      context_report: contextReport,
      conversation_history: conversationHistory,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const msg = errorBody?.message || errorBody?.detail || `HTTP ${response.status} - AI Chat Failed`;
    throw new Error(msg);
  }

  return await response.json();
}

export async function explainReportWithAi(reportData: any): Promise<AiReportExplanationResponse> {
  const token = await getCurrentUserIdToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/api/v1/ai/explain-report`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ report_data: reportData }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const msg = errorBody?.message || errorBody?.detail || `HTTP ${response.status} - AI Explanation Failed`;
    throw new Error(msg);
  }

  return await response.json();
}

export async function summarizeReportWithAi(reportData: any): Promise<AiSummaryResponse> {
  const token = await getCurrentUserIdToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/api/v1/ai/summarize-report`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ report_data: reportData }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const msg = errorBody?.message || errorBody?.detail || `HTTP ${response.status} - AI Summary Failed`;
    throw new Error(msg);
  }

  return await response.json();
}

export async function explainHazardWithAi(
  hazardName: string,
  contextDetails?: any
): Promise<AiHazardExplanationResponse> {
  const token = await getCurrentUserIdToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/api/v1/ai/explain-hazard`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      hazard_name: hazardName,
      context_details: contextDetails,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const msg = errorBody?.message || errorBody?.detail || `HTTP ${response.status} - AI Hazard Explanation Failed`;
    throw new Error(msg);
  }

  return await response.json();
}


