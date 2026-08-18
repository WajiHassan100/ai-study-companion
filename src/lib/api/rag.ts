/**
 * RAG Document Upload & Query Client (Agent #5 Integrator)
 * =========================================================
 * Provides helper functions for uploading student/teacher document files (PDFs, TXT, MD)
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
    throw new Error(`Upload failed with status ${response.status}`);
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
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("course_id", courseId);

    const response = await apiFetch(`${API_BASE_URL}/ai/rag/upload-file`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`File upload failed with status ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    // Binary parsing is backend-only; if it is unavailable, fall back to a raw-text upload.
    console.warn("Binary file upload failed, falling back to text upload:", err);
    const text = await file.text();
    return uploadDocumentToRAG(courseId, file.name, text, file.name.split(".").pop() || "pdf");
  }
}

/**
 * Queries Agent #5 RAG Knowledge Agent for a document-grounded answer with citations.
 */
export async function queryRAGDocument(courseId: string, query: string): Promise<RAGQueryResponse> {
  const response = await apiFetch(`${API_BASE_URL}/ai/rag/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      course_id: courseId,
      query: query,
      top_k: 3,
    }),
  });

  if (!response.ok) {
    throw new Error(`RAG query failed with status ${response.status}`);
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
    throw new Error(`RAG Learning Action failed with status ${response.status}`);
  }

  return await response.json();
}
