from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import knowledge as knowledge_crud
from app.models.user import User
from app.schemas.knowledge import (
    KnowledgeBase,
    KnowledgeBaseCreate,
    KnowledgeBaseUpdate,
    KnowledgeBaseDetail,
    Document,
    DocumentCreate,
    DocumentUpdate
)

router = APIRouter()

@router.get("/knowledge-bases", response_model=List[KnowledgeBase])
def get_knowledge_bases(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
):
    """获取知识库列表"""
    knowledge_bases = knowledge_crud.get_knowledge_bases(
        db,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    return knowledge_bases

@router.post("/knowledge-bases", response_model=KnowledgeBase)
def create_knowledge_base(
    knowledge_base: KnowledgeBaseCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """创建知识库"""
    return knowledge_crud.create_knowledge_base(db, knowledge_base, current_user.id)

@router.get("/knowledge-bases/{knowledge_base_id}", response_model=KnowledgeBaseDetail)
def get_knowledge_base(
    knowledge_base_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """获取知识库详情"""
    knowledge_base = knowledge_crud.get_knowledge_base(db, knowledge_base_id)
    if not knowledge_base:
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    if knowledge_base.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return knowledge_base

@router.put("/knowledge-bases/{knowledge_base_id}", response_model=KnowledgeBase)
def update_knowledge_base(
    knowledge_base_id: int,
    knowledge_base: KnowledgeBaseUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """更新知识库"""
    db_knowledge_base = knowledge_crud.get_knowledge_base(db, knowledge_base_id)
    if not db_knowledge_base:
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    if db_knowledge_base.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return knowledge_crud.update_knowledge_base(db, db_knowledge_base, knowledge_base)

@router.delete("/knowledge-bases/{knowledge_base_id}")
def delete_knowledge_base(
    knowledge_base_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """删除知识库"""
    knowledge_base = knowledge_crud.get_knowledge_base(db, knowledge_base_id)
    if not knowledge_base:
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    if knowledge_base.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    knowledge_crud.delete_knowledge_base(db, knowledge_base_id)
    return {"message": "Knowledge base deleted successfully"}

# Document endpoints
@router.get("/knowledge-bases/{knowledge_base_id}/documents", response_model=List[Document])
def get_documents(
    knowledge_base_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
):
    """获取文档列表"""
    knowledge_base = knowledge_crud.get_knowledge_base(db, knowledge_base_id)
    if not knowledge_base:
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    if knowledge_base.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return knowledge_crud.get_documents(db, knowledge_base_id, skip=skip, limit=limit)

@router.post("/knowledge-bases/{knowledge_base_id}/documents", response_model=Document)
def create_document(
    knowledge_base_id: int,
    document: DocumentCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """创建文档"""
    knowledge_base = knowledge_crud.get_knowledge_base(db, knowledge_base_id)
    if not knowledge_base:
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    if knowledge_base.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return knowledge_crud.create_document(db, document, knowledge_base_id, current_user.id)

@router.put("/knowledge-bases/{knowledge_base_id}/documents/{document_id}", response_model=Document)
def update_document(
    knowledge_base_id: int,
    document_id: int,
    document: DocumentUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """更新文档"""
    db_document = knowledge_crud.get_document(db, document_id)
    if not db_document:
        raise HTTPException(status_code=404, detail="Document not found")
    if db_document.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    if db_document.knowledge_base_id != knowledge_base_id:
        raise HTTPException(status_code=400, detail="Document does not belong to this knowledge base")
    return knowledge_crud.update_document(db, db_document, document)

@router.delete("/knowledge-bases/{knowledge_base_id}/documents/{document_id}")
def delete_document(
    knowledge_base_id: int,
    document_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """删除文档"""
    document = knowledge_crud.get_document(db, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    if document.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    if document.knowledge_base_id != knowledge_base_id:
        raise HTTPException(status_code=400, detail="Document does not belong to this knowledge base")
    knowledge_crud.delete_document(db, document_id)
    return {"message": "Document deleted successfully"} 