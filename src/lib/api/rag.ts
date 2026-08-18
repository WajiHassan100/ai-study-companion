/**
 * RAG Document Upload & Query Client (Agent #5 Integrator)
 * =========================================================
 * Provides helper functions for uploading student/teacher document files (PDFs, TXT, MD, DOCX)
 * and querying Agent #5 RAG Knowledge Agent with grounded citations.
 */

export interface SourceCitation {
  material_title: string;
  chapter: string;
  page_number: number;
  snippet: string;
}

export interface RAGQueryResponse {
  answer: string;
  cited_sources: SourceCitation[];
  confidence_score: number;
  topic: string;
}

export interface RAGUploadResponse {
  material_id: string;
  course_id: string;
  status: string;
  chunks_indexed: number;
  message: string;
}

import { apiFetch, API_BASE_URL } from "./client";

/**
 * Uploads document text content to Agent #5 RAG Backend for semantic indexing.
 */
export async function uploadDocumentToRAG(
  courseId: string,
  fileName: string,
  textContent: string,
  fileType: string = "pdf"
): Promise<RAGUploadResponse> {
  const response = await apiFetch(`${API_BASE_URL}/ai/rag/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      course_id: courseId,
      material_title: fileName,
      type: fileType,
      chapters_covered: "Uploaded Student Document",
      pages_count: Math.max(1, Math.ceil(textContent.length / 1000)),
      content: textContent,
    }),
  });

  if (!response.ok) {
    let detail = `Upload failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.detail) detail = errJson.detail;
    } catch {}
    throw new Error(detail);
  }

  return await response.json();
}

/**
 * Uploads a raw binary File object (PDF, DOCX, TXT) to FastAPI backend for Python text parsing & indexing.
 */
export async function uploadFileObjectToRAG(
  courseId: string,
  file: File
): Promise<RAGUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("course_id", courseId);

  const response = await apiFetch(`${API_BASE_URL}/ai/rag/upload-file`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let detail = `File upload failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.detail) detail = errJson.detail;
    } catch {}
    throw new Error(detail);
  }

  return await response.json();
}

/**
 * Queries Agent #5 RAG Knowledge Agent for a document-grounded answer with citations.
 */
export async function queryRAGDocument(
  courseId: string,
  query: string,
  materialTitle?: string,
  materialId?: string
): Promise<RAGQueryResponse> {
  const response = await apiFetch(`${API_BASE_URL}/ai/rag/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      course_id: courseId,
      query: query,
      top_k: 4,
      material_title: materialTitle || null,
      material_id: materialId || null,
    }),
  });

  if (!response.ok) {
    let detail = `RAG query failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.detail) detail = errJson.detail;
    } catch {}
    throw new Error(detail);
  }

  return await response.json();
}

/**
 * Executes 1-Click RAG Learning Actions (MCQs, Summary, Explain Simply) grounded in course materials.
 */
export async function executeRAGLearningAction(
  courseId: string,
  materialTitle?: string,
  action: "mcqs" | "summary" | "explain_simply" = "mcqs"
): Promise<RAGQueryResponse> {
  const response = await apiFetch(`${API_BASE_URL}/ai/rag/learning-action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      course_id: courseId,
      material_title: materialTitle || null,
      action: action,
    }),
  });

  if (!response.ok) {
    let detail = `RAG Learning Action failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.detail) detail = errJson.detail;
    } catch {}
    throw new Error(detail);
  }

  return await response.json();
}
