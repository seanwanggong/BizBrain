from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.knowledge import KnowledgeBase, Document
from app.schemas.knowledge import (
    KnowledgeBaseCreate,
    KnowledgeBaseUpdate,
    KnowledgeBaseResponse,
    DocumentCreate,
    DocumentUpdate,
    DocumentResponse
)

router = APIRouter()

@router.post("/", response_model=KnowledgeBaseResponse, status_code=status.HTTP_201_CREATED)
def create_knowledge_base(
    knowledge_base: KnowledgeBaseCreate,
    db: Session = Depends(get_db)
):
    """Create a new knowledge base."""
    db_knowledge_base = KnowledgeBase(**knowledge_base.dict())
    db.add(db_knowledge_base)
    db.commit()
    db.refresh(db_knowledge_base)
    return db_knowledge_base

@router.get("/", response_model=List[KnowledgeBaseResponse])
def list_knowledge_bases(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all knowledge bases."""
    knowledge_bases = db.query(KnowledgeBase).offset(skip).limit(limit).all()
    return knowledge_bases

@router.get("/{knowledge_base_id}", response_model=KnowledgeBaseResponse)
def get_knowledge_base(
    knowledge_base_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific knowledge base by ID."""
    knowledge_base = db.query(KnowledgeBase).filter(KnowledgeBase.id == knowledge_base_id).first()
    if not knowledge_base:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Knowledge base with ID {knowledge_base_id} not found"
        )
    return knowledge_base

@router.put("/{knowledge_base_id}", response_model=KnowledgeBaseResponse)
def update_knowledge_base(
    knowledge_base_id: int,
    knowledge_base_update: KnowledgeBaseUpdate,
    db: Session = Depends(get_db)
):
    """Update a knowledge base."""
    db_knowledge_base = db.query(KnowledgeBase).filter(KnowledgeBase.id == knowledge_base_id).first()
    if not db_knowledge_base:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Knowledge base with ID {knowledge_base_id} not found"
        )
    
    for field, value in knowledge_base_update.dict(exclude_unset=True).items():
        setattr(db_knowledge_base, field, value)
    
    db.commit()
    db.refresh(db_knowledge_base)
    return db_knowledge_base

@router.delete("/{knowledge_base_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_knowledge_base(
    knowledge_base_id: int,
    db: Session = Depends(get_db)
):
    """Delete a knowledge base."""
    db_knowledge_base = db.query(KnowledgeBase).filter(KnowledgeBase.id == knowledge_base_id).first()
    if not db_knowledge_base:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Knowledge base with ID {knowledge_base_id} not found"
        )
    
    db.delete(db_knowledge_base)
    db.commit()
    return None

@router.post("/{knowledge_base_id}/documents", response_model=DocumentResponse)
def create_document(
    knowledge_base_id: int,
    document: DocumentCreate,
    db: Session = Depends(get_db)
):
    """Create a new document in a knowledge base."""
    db_knowledge_base = db.query(KnowledgeBase).filter(KnowledgeBase.id == knowledge_base_id).first()
    if not db_knowledge_base:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Knowledge base with ID {knowledge_base_id} not found"
        )
    
    db_document = Document(**document.dict(), knowledge_base_id=knowledge_base_id)
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

@router.get("/{knowledge_base_id}/documents", response_model=List[DocumentResponse])
def list_documents(
    knowledge_base_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all documents in a knowledge base."""
    documents = db.query(Document).filter(Document.knowledge_base_id == knowledge_base_id).offset(skip).limit(limit).all()
    return documents

@router.get("/{knowledge_base_id}/documents/{document_id}", response_model=DocumentResponse)
def get_document(
    knowledge_base_id: int,
    document_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific document by ID."""
    document = db.query(Document).filter(
        Document.knowledge_base_id == knowledge_base_id,
        Document.id == document_id
    ).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found in knowledge base {knowledge_base_id}"
        )
    return document

@router.put("/{knowledge_base_id}/documents/{document_id}", response_model=DocumentResponse)
def update_document(
    knowledge_base_id: int,
    document_id: int,
    document_update: DocumentUpdate,
    db: Session = Depends(get_db)
):
    """Update a document."""
    db_document = db.query(Document).filter(
        Document.knowledge_base_id == knowledge_base_id,
        Document.id == document_id
    ).first()
    if not db_document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found in knowledge base {knowledge_base_id}"
        )
    
    for field, value in document_update.dict(exclude_unset=True).items():
        setattr(db_document, field, value)
    
    db.commit()
    db.refresh(db_document)
    return db_document

@router.delete("/{knowledge_base_id}/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    knowledge_base_id: int,
    document_id: int,
    db: Session = Depends(get_db)
):
    """Delete a document."""
    db_document = db.query(Document).filter(
        Document.knowledge_base_id == knowledge_base_id,
        Document.id == document_id
    ).first()
    if not db_document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found in knowledge base {knowledge_base_id}"
        )
    
    db.delete(db_document)
    db.commit()
    return None 