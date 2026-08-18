/**
 * Course Details & Knowledge Base API Client
 * ===========================================
 * Handles fetching course syllabus, course materials (PDFs/slides), and course RAG knowledge queries.
 */

export interface CourseMaterial {
  id: string;
  title: string;
  type: "pdf" | "slides" | "notes" | "syllabus";
  file_size: string;
  chapters_covered: string;
  pages_count: number;
  uploaded_at: string;
}

export interface CourseModule {
  id: string;
  module_number: number;
  title: string;
  description: string;
  topics: string[];
  duration_hours: number;
}

export interface CourseDetail {
  id: string;
  title: string;
  code: string;
  department: string;
  instructor_name: string;
  description: string;
  enrolled_count: number;
  progress_percentage: number;
  modules: CourseModule[];
  materials: CourseMaterial[];
}

export interface CourseKnowledgeQueryResult {
  answer: string;
  cited_sources: {
    material_title: string;
    chapter: string;
    page_number: number;
    snippet: string;
  }[];
  confidence_score: number;
}

export interface CourseListItem {
  id: string;
  code: string;
  title: string;
  department: string;
  instructor_name: string;
  description: string;
  enrolled_count: number;
  progress_percentage: number;
  materials_count: number;
  modules_count: number;
}

import { apiFetch, API_BASE_URL } from "./client";

/**
 * Fetches list of all enrolled courses for the student.
 */
export async function getAllCourses(token?: string): Promise<CourseListItem[]> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await apiFetch(`${API_BASE_URL}/courses`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Status ${response.status}`);
  }

  return await response.json();
}

/**
 * Fetches course details, syllabus modules, and materials for a given course ID.
 */
export async function getCourseDetail(courseId: string, token?: string): Promise<CourseDetail> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await apiFetch(`${API_BASE_URL}/courses/${encodeURIComponent(courseId)}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Status ${response.status}`);
  }

  return await response.json();
}

/**
 * Queries the RAG Course Knowledge Agent (Agent #5) for a course-specific document query with citations.
 */
export async function queryCourseKnowledge(
  courseId: string,
  query: string,
  token?: string
): Promise<CourseKnowledgeQueryResult> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await apiFetch(`${API_BASE_URL}/ai/rag/query`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      course_id: courseId,
      query: query,
    }),
  });

  if (!response.ok) {
    throw new Error(`Status ${response.status}`);
  }

  return await response.json();
}
