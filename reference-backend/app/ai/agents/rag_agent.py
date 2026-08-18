"""
Agent #5: RAG Course Knowledge Agent Implementation (rag_agent.py)
===================================================================
Implements Retrieval-Augmented Generation for course documents (textbook PDFs, lecture slides, notes)
persisted inside the SQLite database, with automatic database initialization, robust chunking,
graceful fallbacks, and resilient JSON/markdown parsing.
"""

import json
import logging
import re
import uuid
from typing import Any

from langchain_core.messages import HumanMessage

from app.ai.services.llm_service import get_llm
from app.ai.utils import clean_llm_json
from app.db.session import SessionLocal
from app.models.models import CourseDocument

logger = logging.getLogger(__name__)

# Seed documents list for database initialization
SEED_DOCUMENTS = [
    {
        "material_id": "slide_lec5",
        "course_id": "biol_101",
        "material_title": "Lecture 5: Cell Energy & Photosynthesis.pptx",
        "chapter": "Lecture 5, Slide 13: Thylakoid Electron Transport",
        "page_number": 13,
        "content": (
            "According to Lecture 5, Slide 13: Light-dependent reactions convert solar energy to chemical energy. Chlorophyll pigments "
            "embedded within the thylakoid membrane absorb photons, exciting electrons in Photosystem II (P680) and Photosystem I (P700). "
            "This initiates an electron transport chain across the thylakoid membrane, establishing a proton gradient that drives ATP Synthase "
            "to phosphorylate ADP into ATP, while NADP+ reductase generates NADPH."
        ),
    },
    {
        "material_id": "slide_lec5",
        "course_id": "biol_101",
        "material_title": "Lecture 5: Cell Energy & Photosynthesis.pptx",
        "chapter": "Lecture 5, Slide 18: Calvin Cycle Stroma",
        "page_number": 18,
        "content": (
            "According to Lecture 5, Slide 18: The Calvin Cycle takes place in the stroma of chloroplasts and uses ATP and NADPH produced during "
            "the light reactions to reduce carbon dioxide into 3-phosphoglycerate and G3P sugars. The enzyme RuBisCO catalyzes the initial carbon fixation."
        ),
    },
    {
        "material_id": "mat1",
        "course_id": "biol_101",
        "material_title": "Campbell Biology - Chapter 10: Photosynthesis",
        "chapter": "Chapter 10.2: The Light Reactions",
        "page_number": 112,
        "content": (
            "Light-dependent reactions convert solar energy to chemical energy. Chlorophyll pigments "
            "embedded within the thylakoid membrane of chloroplasts absorb photons, exciting electrons in "
            "Photosystem II (P680) and Photosystem I (P700). This initiates an electron transport chain across the thylakoid "
            "membrane, establishing a proton gradient that drives ATP Synthase to phosphorylate ADP into ATP, "
            "while NADP+ reductase generates NADPH."
        ),
    },
    {
        "material_id": "mat1",
        "course_id": "biol_101",
        "material_title": "Campbell Biology - Chapter 10: Photosynthesis",
        "chapter": "Chapter 10.3: The Calvin Cycle",
        "page_number": 118,
        "content": (
            "The Calvin Cycle takes place in the stroma of chloroplasts and uses ATP and NADPH produced during "
            "the light reactions to reduce carbon dioxide into 3-phosphoglycerate and G3P sugars. The enzyme "
            "RuBisCO (ribulose-1,5-bisphosphate carboxylase-oxygenase) catalyzes the initial carbon fixation step."
        ),
    },
    {
        "material_id": "mat1_dna",
        "course_id": "biol_101",
        "material_title": "Campbell Biology - Chapter 16: Molecular Basis of Inheritance",
        "chapter": "Chapter 16.2: DNA Replication Mechanism",
        "page_number": 315,
        "content": (
            "DNA replication occurs semi-conservatively. DNA Helicase unwinds the double helix at the origin of replication, "
            "forming a replication fork. Topoisomerase relieves strain, while Single-Strand Binding Proteins stabilize unzipped strands. "
            "DNA Polymerase III synthesizes the leading strand continuously 5' to 3', while the lagging strand is synthesized discontinuously "
            "in short Okazaki fragments bound by DNA Ligase."
        ),
    },
    {
        "material_id": "mat2",
        "course_id": "math_201",
        "material_title": "Stewart Calculus - Chapter 4: Fundamental Theorem of Calculus",
        "chapter": "Chapter 4.1: Fundamental Theorem",
        "page_number": 204,
        "content": (
            "The Fundamental Theorem of Calculus establishes the connection between differentiation and integration. "
            "Part 1 states that if f is continuous on [a, b], then the function g defined by g(x) = integral from a to x of f(t) dt "
            "is continuous and differentiable, with g'(x) = f(x)."
        ),
    },
    {
        "material_id": "mat2_multi",
        "course_id": "math_201",
        "material_title": "Stewart Multivariable Calculus - Chapter 14: Partial Derivatives",
        "chapter": "Chapter 14.6: Directional Derivatives & Gradient Vectors",
        "page_number": 940,
        "content": (
            "The gradient vector of a scalar function f(x, y, z), denoted grad f or nabla f, is defined as "
            "nabla f = <df/dx, df/dy, df/dz>. The directional derivative D_u f in the direction of unit vector u is the dot product "
            "D_u f = nabla f dot u. The gradient vector points in the direction of maximum rate of increase of f(x,y,z)."
        ),
    },
    {
        "material_id": "mat3_phys",
        "course_id": "phys_102",
        "material_title": "University Physics - Chapter 5: Newton's Laws of Motion",
        "chapter": "Chapter 5.2: Second Law & Friction Dynamics",
        "page_number": 145,
        "content": (
            "Newton's Second Law states that the net force acting on an object is equal to the mass multiplied by its acceleration "
            "(F_net = m * a). On an inclined plane, kinetic friction f_k = mu_k * N opposes motion, where normal force N = m * g * cos(theta)."
        ),
    },
    {
        "material_id": "mat3_em",
        "course_id": "phys_102",
        "material_title": "University Physics - Chapter 29: Maxwell's Equations",
        "chapter": "Chapter 29.4: Electromagnetic Waves",
        "page_number": 978,
        "content": (
            "Maxwell's equations unify electricity and magnetism into four fundamental laws: Gauss's Law for Electricity, "
            "Gauss's Law for Magnetism, Faraday's Law of Induction (a changing magnetic field produces an electric field), "
            "and Ampere-Maxwell Law (changing electric flux generates a magnetic field)."
        ),
    },
    {
        "material_id": "mat4_cs",
        "course_id": "cs_101",
        "material_title": "Introduction to Algorithms (CLRS) - Chapter 3: Asymptotic Notation",
        "chapter": "Chapter 3.1: Big-O, Omega, and Theta Notations",
        "page_number": 45,
        "content": (
            "Big-O notation describes the upper bound of an algorithm's execution time or space complexity in the worst-case scenario. "
            "For example, Binary Search operates in O(log n) time complexity, whereas Merge Sort operates in O(n log n) time."
        ),
    },
    {
        "material_id": "mat5_chem",
        "course_id": "chem_101",
        "material_title": "Organic Chemistry (Wade) - Chapter 6: Nucleophilic Substitution",
        "chapter": "Chapter 6.3: SN1 vs SN2 Mechanisms",
        "page_number": 230,
        "content": (
            "The SN2 mechanism is a concerted one-step nucleophilic substitution reaction causing inversion of stereochemistry (Walden inversion). "
            "The SN1 mechanism proceeds via a two-step process with a carbocation intermediate, leading to racemization of chiral centers."
        ),
    },
]


class RAGAgent:
    """Agent #5: RAG Course Knowledge Agent with SQLite Document Persistence."""

    def __init__(self):
        self._llm = None

    @property
    def llm(self):
        if self._llm is None:
            self._llm = get_llm()
        return self._llm

    def _seed_documents(self):
        """Seeds the course_documents table with initial data if empty."""
        db = SessionLocal()
        try:
            count = db.query(CourseDocument).count()
            if count == 0:
                logger.info("Initializing course documents seed database...")
                for doc_data in SEED_DOCUMENTS:
                    doc = CourseDocument(
                        material_id=doc_data["material_id"],
                        course_id=doc_data["course_id"],
                        material_title=doc_data["material_title"],
                        chapter=doc_data["chapter"],
                        page_number=doc_data["page_number"],
                        content=doc_data["content"],
                    )
                    db.add(doc)
                db.commit()
                logger.info("Seeded %d course documents successfully.", len(SEED_DOCUMENTS))
        except Exception as e:
            db.rollback()
            logger.error("Failed to seed course documents database: %s", str(e))
        finally:
            db.close()

    def retrieve_relevant_chunks(
        self,
        course_id: str,
        query: str,
        top_k: int = 4,
        material_title: str | None = None,
        material_id: str | None = None,
    ) -> list[dict[str, Any]]:
        """Retrieves top-k document chunks from database using keyword matching and relevance boosting."""
        self._seed_documents()
        query_clean = re.sub(r"[^\w\s]", " ", query.lower())
        query_words = set(w for w in query_clean.split() if len(w) > 2)
        results = []

        db = SessionLocal()
        try:
            q = db.query(CourseDocument)
            
            # If specific material is requested, prioritize it
            if material_title:
                matched = q.filter(CourseDocument.material_title.ilike(f"%{material_title}%")).all()
                if matched:
                    docs = matched
                else:
                    docs = q.all()
            elif material_id:
                matched = q.filter(CourseDocument.material_id == material_id).all()
                if matched:
                    docs = matched
                else:
                    docs = q.all()
            elif course_id and course_id != "general_study":
                docs = q.filter(
                    (CourseDocument.course_id == course_id) | 
                    (CourseDocument.course_id == "general_study")
                ).all()
            else:
                docs = q.all()

            scored_chunks = []
            for doc in docs:
                chunk_text = (doc.content + " " + (doc.chapter or "") + " " + (doc.material_title or "")).lower()
                
                # Keyword overlap score
                if query_words:
                    match_count = sum(1 for word in query_words if word in chunk_text)
                    bm25_score = match_count / len(query_words)
                else:
                    bm25_score = 0.5
                
                # Boost user-uploaded documents
                if doc.material_id.startswith("mat_"):
                    bm25_score += 0.8
                
                # Boost if material title matches
                if material_title and material_title.lower() in (doc.material_title or "").lower():
                    bm25_score += 1.5

                scored_chunks.append((bm25_score, doc))

            # Sort descending
            scored_chunks.sort(key=lambda x: x[0], reverse=True)
            results_docs = [doc for score, doc in scored_chunks[:top_k]]

            # Fallback: if empty, take any available docs
            if not results_docs and docs:
                results_docs = docs[:top_k]

            for doc in results_docs:
                results.append({
                    "material_id": doc.material_id,
                    "course_id": doc.course_id,
                    "material_title": doc.material_title,
                    "chapter": doc.chapter or "General",
                    "page_number": doc.page_number or 1,
                    "content": doc.content,
                })
        except Exception as e:
            logger.error("Failed to query course documents from DB: %s", str(e), exc_info=True)
        finally:
            db.close()

        return results

    def query_course_knowledge(
        self,
        course_id: str,
        query: str,
        top_k: int = 4,
        material_title: str | None = None,
        material_id: str | None = None,
    ) -> dict[str, Any]:
        """Queries the RAG Knowledge Agent for grounded answer with citations and resilient parsing."""
        retrieved_chunks = self.retrieve_relevant_chunks(
            course_id=course_id,
            query=query,
            top_k=top_k,
            material_title=material_title,
            material_id=material_id,
        )

        citations_list = []
        for c in retrieved_chunks:
            snippet_text = c["content"][:200] + "..." if len(c["content"]) > 200 else c["content"]
            citations_list.append({
                "material_title": c["material_title"],
                "chapter": c["chapter"],
                "page_number": c["page_number"],
                "snippet": snippet_text.replace("\n", " ").strip(),
            })

        # If no documents exist in knowledge base
        if not retrieved_chunks:
            # Fallback direct LLM explanation
            prompt = (
                f"You are an expert Socratic AI Tutor. Answer the student's question clearly, thoroughly, and step-by-step:\n\n"
                f"QUESTION: {query}\n\n"
                f"Provide a helpful, structured educational explanation with clear headings and bullet points."
            )
            try:
                response = self.llm.invoke([HumanMessage(content=prompt)])
                ans = response.content.strip()
                return {
                    "answer": f"*(Note: Answering with general subject knowledge as no specific document was attached)*\n\n{ans}",
                    "cited_sources": [],
                    "confidence_score": 0.90,
                    "topic": "General Concept Tutoring",
                }
            except Exception as e:
                logger.error("Direct LLM call failed: %s", e)
                return {
                    "answer": f"I can help you understand this concept. Let's break down '{query}' step-by-step.",
                    "cited_sources": [],
                    "confidence_score": 0.85,
                    "topic": "Concept Guidance",
                }

        # Build context string
        context_lines = []
        for i, c in enumerate(retrieved_chunks, 1):
            context_lines.append(
                f"--- [Document Passage {i}] ---\n"
                f"Source: {c['material_title']} (Section: {c['chapter']}, Page/Slide: {c['page_number']})\n"
                f"Excerpt: {c['content']}\n"
            )

        context_str = "\n\n".join(context_lines)
        doc_name = material_title or retrieved_chunks[0]["material_title"]

        prompt = (
            f"You are Scholar AI's Socratic Tutor. The student has uploaded/attached the document '{doc_name}' and asked the following question:\n\n"
            f"STUDENT QUESTION: {query}\n\n"
            f"DOCUMENT PASSAGES (GROUND TRUTH):\n"
            f"{context_str}\n\n"
            f"INSTRUCTIONS:\n"
            f"1. Thoroughly answer, summarize, explain, or solve the student's question grounded in the document passages above.\n"
            f"2. Use clear formatting, headings, bullet points, and step-by-step logic.\n"
            f"3. Quote or reference specific sections and pages from '{doc_name}'.\n\n"
            f"Respond in JSON format matching this schema:\n"
            f"{{\n"
            f'  "answer": "Your detailed, complete, step-by-step explanation or summary grounded in the document",\n'
            f'  "topic": "Specific Topic or Concept Name",\n'
            f'  "confidence_score": 0.98\n'
            f"}}\n"
        )

        try:
            response = self.llm.invoke([HumanMessage(content=prompt)])
            raw_text = response.content.strip()
            
            # 1. Try direct JSON parsing
            cleaned_text = clean_llm_json(raw_text)
            try:
                data = json.loads(cleaned_text)
                if isinstance(data, dict) and data.get("answer"):
                    return {
                        "answer": str(data["answer"]),
                        "cited_sources": citations_list,
                        "confidence_score": float(data.get("confidence_score", 0.96)),
                        "topic": str(data.get("topic", doc_name)),
                    }
            except Exception:
                pass

            # 2. Try regex extraction of JSON fields if LLM included unescaped math/LaTeX quotes
            answer_match = re.search(r'"answer"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"topic"|"\s*,\s*"confidence_score"|"\s*\}\s*$)', raw_text)
            if answer_match:
                extracted_ans = answer_match.group(1).replace('\\"', '"').replace("\\n", "\n").strip()
                if extracted_ans:
                    return {
                        "answer": extracted_ans,
                        "cited_sources": citations_list,
                        "confidence_score": 0.95,
                        "topic": doc_name,
                    }

            # 3. Resilient Fallback: The LLM returned natural markdown prose
            # Use the entire raw text as the answer!
            clean_prose = raw_text
            if clean_prose.startswith("```json"):
                clean_prose = clean_prose[7:]
            if clean_prose.startswith("```"):
                clean_prose = clean_prose[3:]
            if clean_prose.endswith("```"):
                clean_prose = clean_prose[:-3]
            clean_prose = clean_prose.strip()

            return {
                "answer": clean_prose,
                "cited_sources": citations_list,
                "confidence_score": 0.95,
                "topic": doc_name,
            }

        except Exception as e:
            logger.error("RAGAgent LLM call exception: %s", e, exc_info=True)
            # Graceful fallback providing the top snippet context so user never sees a hard 500 error
            fallback_answer = (
                f"Here is what the document **{doc_name}** covers regarding your question:\n\n"
                f"> \"{retrieved_chunks[0]['content']}\"\n\n"
                f"*(Source: {retrieved_chunks[0]['material_title']}, {retrieved_chunks[0]['chapter']}, Page {retrieved_chunks[0]['page_number']})*"
            )
            return {
                "answer": fallback_answer,
                "cited_sources": citations_list,
                "confidence_score": 0.88,
                "topic": doc_name,
            }

    def index_new_material(
        self,
        course_id: str,
        material_title: str,
        content: str,
        material_type: str = "pdf",
        chapters_covered: str = "Uploaded Document",
        pages_count: int = 1,
    ) -> dict[str, Any]:
        """Indexes a new document or text passage into the course knowledge base with smart paragraph chunking."""
        self._seed_documents()
        material_id = f"mat_{uuid.uuid4().hex[:6]}"
        
        # Smart paragraph chunking: split by paragraphs, or sliding window of ~800 chars
        raw_paragraphs = [p.strip() for p in content.split("\n\n") if p.strip()]
        chunks = []
        
        for p in raw_paragraphs:
            if len(p) <= 1200:
                chunks.append(p)
            else:
                # Split large paragraphs into smaller chunks
                words = p.split()
                current_chunk = []
                current_len = 0
                for w in words:
                    current_chunk.append(w)
                    current_len += len(w) + 1
                    if current_len >= 800:
                        chunks.append(" ".join(current_chunk))
                        current_chunk = []
                        current_len = 0
                if current_chunk:
                    chunks.append(" ".join(current_chunk))

        if not chunks:
            chunks = [content[:2000]]

        indexed_count = 0
        db = SessionLocal()
        try:
            for idx, chunk_text in enumerate(chunks, 1):
                # Calculate approximate page number
                approx_page = max(1, min(pages_count, int((idx / len(chunks)) * pages_count) or 1))
                doc = CourseDocument(
                    material_id=material_id,
                    course_id=course_id,
                    material_title=material_title,
                    chapter=f"Section {idx}",
                    page_number=approx_page,
                    content=chunk_text,
                )
                db.add(doc)
            db.commit()
            indexed_count = len(chunks)
            logger.info("Indexed %d chunks for material '%s' (ID: %s)", indexed_count, material_title, material_id)
        except Exception as e:
            db.rollback()
            logger.error("Failed to index new document into database: %s", str(e), exc_info=True)
            raise
        finally:
            db.close()

        return {
            "material_id": material_id,
            "course_id": course_id,
            "status": "indexed",
            "chunks_indexed": indexed_count,
            "message": f"Successfully indexed '{material_title}' ({indexed_count} passages).",
        }

    def execute_learning_action(
        self,
        course_id: str,
        material_title: str | None = None,
        action: str = "mcqs",
    ) -> dict[str, Any]:
        """
        Executes a targeted 1-Click RAG Learning Action on uploaded course material:
        - "mcqs": Generates 5 grounded multiple choice questions with answer keys.
        - "summary": Generates a structured executive summary with key definitions.
        - "explain_simply": Provides an ELI5 simple breakdown with analogies.
        """
        query_map = {
            "mcqs": f"Create 5 practice multiple choice questions with answers and explanations based on {material_title or 'this document'}",
            "summary": f"Provide an executive summary and key takeaways of {material_title or 'this document'}",
            "explain_simply": f"Explain the core topics of {material_title or 'this document'} simply with clear analogies",
        }
        target_query = query_map.get(action, f"Explain {material_title or 'this document'}")
        return self.query_course_knowledge(
            course_id=course_id,
            query=target_query,
            top_k=4,
            material_title=material_title,
        )


# Singleton instance
rag_agent = RAGAgent()
