import io

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.ai.agents.rag_agent import rag_agent
from app.api.deps import get_current_user
from app.models.models import User
from app.schemas.schemas import (
    RAGQueryRequest,
    RAGQueryResponse,
    RAGUploadRequest,
    RAGUploadResponse,
    RAGLearningActionRequest,
)

router = APIRouter(prefix="/ai/rag", tags=["Agent #5: RAG Course Knowledge Agent"])


@router.post("/query", response_model=RAGQueryResponse, status_code=status.HTTP_200_OK)
def query_course_knowledge(
    req: RAGQueryRequest,
    _: User = Depends(get_current_user),
) -> RAGQueryResponse:
    """
    Queries Agent #5 (RAG Course Knowledge Agent) for a course-grounded answer with page citations.
    """
    try:
        res = rag_agent.query_course_knowledge(
            course_id=req.course_id,
            query=req.query,
            top_k=req.top_k,
        )
        return RAGQueryResponse(**res)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process RAG course knowledge query: {str(e)}",
        )


@router.post("/learning-action", response_model=RAGQueryResponse, status_code=status.HTTP_200_OK)
def execute_rag_learning_action(
    req: RAGLearningActionRequest,
    _: User = Depends(get_current_user),
) -> RAGQueryResponse:
    """
    Executes a 1-Click RAG Learning Action (mcqs, summary, explain_simply) grounded in course materials.
    """
    try:
        res = rag_agent.execute_learning_action(
            course_id=req.course_id,
            material_title=req.material_title,
            action=req.action,
        )
        return RAGQueryResponse(**res)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute RAG learning action: {str(e)}",
        )


@router.post("/upload", response_model=RAGUploadResponse, status_code=status.HTTP_201_CREATED)
def upload_course_material(
    req: RAGUploadRequest,
    _: User = Depends(get_current_user),
) -> RAGUploadResponse:
    """
    Uploads and indexes a new course document/text passage into the course knowledge base.
    """
    try:
        res = rag_agent.index_new_material(
            course_id=req.course_id,
            material_title=req.material_title,
            content=req.content,
            material_type=req.type,
            chapters_covered=req.chapters_covered,
            pages_count=req.pages_count,
        )
        return RAGUploadResponse(**res)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to index course material: {str(e)}",
        )


@router.post("/upload-file", response_model=RAGUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_course_file(
    file: UploadFile = File(...),
    course_id: str = Form("general_study"),
    _: User = Depends(get_current_user),
) -> RAGUploadResponse:
    """
    Parses and indexes binary document files (.pdf, .docx, .txt, .md) using python-docx and pypdf.
    """
    filename = file.filename or "uploaded_document"
    # Read in bounded chunks to avoid unbounded memory use on large files.
    file_bytes = b""
    max_bytes = 20 * 1024 * 1024  # 20 MB cap
    while True:
        chunk = await file.read(1024 * 1024)
        if not chunk:
            break
        file_bytes += chunk
        if len(file_bytes) > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File too large (max 20 MB).",
            )
    extracted_text = ""
    pages_count = 1

    try:
        if filename.lower().endswith(".pdf"):
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            pages_count = len(reader.pages)
            page_texts = [p.extract_text() for p in reader.pages if p.extract_text()]
            extracted_text = "\n\n".join(page_texts)

        elif filename.lower().endswith(".docx"):
            import docx
            doc = docx.Document(io.BytesIO(file_bytes))
            paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
            extracted_text = "\n\n".join(paragraphs)
            pages_count = max(1, len(paragraphs) // 5)

        else:
            extracted_text = file_bytes.decode("utf-8", errors="ignore")
            pages_count = max(1, len(extracted_text) // 1000)

        if not extracted_text.strip():
            extracted_text = f"Document '{filename}' uploaded successfully."

        res = rag_agent.index_new_material(
            course_id=course_id,
            material_title=filename,
            content=extracted_text,
            material_type=filename.split(".")[-1],
            chapters_covered="Uploaded Document",
            pages_count=pages_count,
        )
        return RAGUploadResponse(**res)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse and index file '{filename}': {str(e)}",
        )
