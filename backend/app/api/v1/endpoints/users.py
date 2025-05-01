from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user, get_current_active_user, get_current_active_superuser
from app.schemas.user import UserCreate, UserUpdate, User
from app.schemas.auth import UserResponse
from app.services.user_service import UserService
from app.models.user import User as UserModel
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=List[User])
async def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: UserModel = Depends(get_current_active_superuser)
):
    """
    Retrieve users.
    """
    user_service = UserService(db)
    users = user_service.get_multi(skip=skip, limit=limit)
    return [user.to_dict() for user in users]

@router.post("/", response_model=User)
async def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
    current_user: UserModel = Depends(get_current_active_superuser)
):
    """
    Create new user.
    """
    user_service = UserService(db)
    user = user_service.get_by_email(email=user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system.",
        )
    user = user_service.create(obj_in=user_in)
    return user.to_dict()

@router.put("/me", response_model=User)
async def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_in: UserUpdate,
    current_user: UserModel = Depends(get_current_user)
):
    """
    Update own user.
    """
    user_service = UserService(db)
    user = user_service.update(db_obj=current_user, obj_in=user_in)
    return user.to_dict()

@router.get("/me", response_model=User)
async def read_user_me(
    request: Request,
    current_user: UserModel = Depends(get_current_user)
):
    """
    Get current user.
    """
    try:
        logger.debug(f"Headers: {dict(request.headers)}")
        logger.info(f"Accessing /me endpoint for user: {current_user.email if current_user else 'None'}")
        logger.debug(f"Current user object: {current_user}")
        logger.debug(f"Created at type: {type(current_user.created_at)}")
        logger.debug(f"Updated at type: {type(current_user.updated_at)}")
        user_dict = current_user.to_dict()
        logger.debug(f"Serialized user dict: {user_dict}")
        return user_dict
    except Exception as e:
        logger.error(f"Error in read_user_me: {str(e)}", exc_info=True)
        raise

@router.get("/{user_id}", response_model=User)
async def read_user_by_id(
    user_id: str,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific user by id.
    """
    user_service = UserService(db)
    user = user_service.get_by_id(id=user_id)
    if user == current_user:
        return user.to_dict()
    if not user_service.is_superuser(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return user.to_dict() 