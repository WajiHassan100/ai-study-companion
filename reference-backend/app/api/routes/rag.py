import io

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.ai.agents.rag_agent import rag_agent
from app.schemas.schemas import (
    RAGQueryRequest,
    RAGQueryResponse,
    RAGUploadRequest,
    RAGUploadResponse,
)

router = APIRouter(prefix="/ai/rag", tags=["Agent #5: RAG Course Knowledge Agent"])


@router.post("/query", response_model=RAGQueryResponse, status_code=status.HTTP_200_OK)
def query_course_knowledge(req: RAGQueryRequest) -> RAGQueryResponse:
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


@router.post("/upload", response_model=RAGUploadResponse, status_code=status.HTTP_201_CREATED)
def upload_course_material(req: RAGUploadRequest) -> RAGUploadResponse:
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
) -> RAGUploadResponse:
    """
    Parses and indexes binary document files (.pdf, .docx, .txt, .md) using python-docx and pypdf.
    """
    filename = file.filename or "uploaded_document"
    file_bytes = await file.read()
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
