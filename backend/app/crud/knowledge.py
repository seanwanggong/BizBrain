from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.knowledge import KnowledgeBase, Document
from app.schemas.knowledge import KnowledgeBaseCreate, KnowledgeBaseUpdate, DocumentCreate, DocumentUpdate

def get_knowledge_base(db: Session, knowledge_base_id: int) -> Optional[KnowledgeBase]:
    return db.query(KnowledgeBase).filter(KnowledgeBase.id == knowledge_base_id).first()

def get_knowledge_bases(
    db: Session,
    user_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
) -> List[KnowledgeBase]:
    query = db.query(KnowledgeBase)
    if user_id:
        query = query.filter(KnowledgeBase.user_id == user_id)
    return query.offset(skip).limit(limit).all()

def create_knowledge_base(
    db: Session,
    knowledge_base: KnowledgeBaseCreate,
    user_id: int
) -> KnowledgeBase:
    db_knowledge_base = KnowledgeBase(
        **knowledge_base.model_dump(),
        user_id=user_id
    )
    db.add(db_knowledge_base)
    db.commit()
    db.refresh(db_knowledge_base)
    return db_knowledge_base

def update_knowledge_base(
    db: Session,
    db_knowledge_base: KnowledgeBase,
    knowledge_base: KnowledgeBaseUpdate
) -> KnowledgeBase:
    update_data = knowledge_base.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_knowledge_base, field, value)
    db.commit()
    db.refresh(db_knowledge_base)
    return db_knowledge_base

def delete_knowledge_base(db: Session, knowledge_base_id: int) -> bool:
    knowledge_base = db.query(KnowledgeBase).filter(KnowledgeBase.id == knowledge_base_id).first()
    if knowledge_base:
        db.delete(knowledge_base)
        db.commit()
        return True
    return False

# Document CRUD operations
def get_document(db: Session, document_id: int) -> Optional[Document]:
    return db.query(Document).filter(Document.id == document_id).first()

def get_documents(
    db: Session,
    knowledge_base_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[Document]:
    return db.query(Document).filter(
        Document.knowledge_base_id == knowledge_base_id
    ).offset(skip).limit(limit).all()

def create_document(
    db: Session,
    document: DocumentCreate,
    knowledge_base_id: int,
    user_id: int
) -> Document:
    db_document = Document(
        **document.model_dump(),
        knowledge_base_id=knowledge_base_id,
        user_id=user_id
    )
    db.add(db_document)
    
    # Update documents count
    knowledge_base = db.query(KnowledgeBase).filter(
        KnowledgeBase.id == knowledge_base_id
    ).first()
    if knowledge_base:
        knowledge_base.documents_count += 1
    
    db.commit()
    db.refresh(db_document)
    return db_document

def update_document(
    db: Session,
    db_document: Document,
    document: DocumentUpdate
) -> Document:
    update_data = document.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_document, field, value)
    db.commit()
    db.refresh(db_document)
    return db_document

def delete_document(db: Session, document_id: int) -> bool:
    document = db.query(Document).filter(Document.id == document_id).first()
    if document:
        # Update documents count
        knowledge_base = db.query(KnowledgeBase).filter(
            KnowledgeBase.id == document.knowledge_base_id
        ).first()
        if knowledge_base:
            knowledge_base.documents_count -= 1
        
        db.delete(document)
        db.commit()
        return True
    return False 