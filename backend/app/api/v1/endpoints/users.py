from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_active_user, get_current_active_superuser
from app.schemas.user import UserCreate, UserUpdate, User
from app.services.user_service import UserService
from app.models.user import User as UserModel

router = APIRouter()

@router.get("/", response_model=List[User])
def read_users(
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
    return users

@router.post("/", response_model=User)
def create_user(
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
    return user

@router.put("/me", response_model=User)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_in: UserUpdate,
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Update own user.
    """
    user_service = UserService(db)
    user = user_service.update(db_obj=current_user, obj_in=user_in)
    return user

@router.get("/me", response_model=User)
def read_user_me(
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Get current user.
    """
    return current_user

@router.get("/{user_id}", response_model=User)
def read_user_by_id(
    user_id: int,
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific user by id.
    """
    user_service = UserService(db)
    user = user_service.get_by_id(id=user_id)
    if user == current_user:
        return user
    if not user_service.is_superuser(current_user):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user doesn't have enough privileges"
        )
    return user 