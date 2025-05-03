from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.sql import select
from app.core.auth import create_access_token
from app.core.security import verify_password, get_password_hash
from app.core.deps import get_db, get_current_user
from app.models.user import User as UserModel
from app.schemas.user import User, UserCreate
from app.schemas.auth import Token
from app.core.config import settings
import uuid
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/register", response_model=User)
async def register(
    *,
    db: AsyncSession = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    """
    Register new user.
    """
    try:
        logger.info(f"Registering new user: {user_in.email}")
        
        # 检查邮箱是否已存在
        stmt = select(UserModel).where(UserModel.email == user_in.email)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        if user:
            logger.warning(f"Email already registered: {user_in.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
            
        # 检查用户名是否已存在
        stmt = select(UserModel).where(UserModel.username == user_in.username)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        if user:
            logger.warning(f"Username already registered: {user_in.username}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
            
        # 创建新用户
        try:
            user_data = user_in.model_dump()
            db_user = UserModel(**user_data)
            db.add(db_user)
            await db.commit()
            await db.refresh(db_user)
            
            logger.info(f"Successfully registered user: {user_in.email}")
            return db_user
        except ValueError as ve:
            logger.error(f"Password validation error: {str(ve)}")
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(ve)
            )
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}", exc_info=True)
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating user: {str(e)}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during registration: {str(e)}", exc_info=True)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login(
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    try:
        logger.info(f"Login attempt for email: {form_data.username}")
        
        stmt = select(UserModel).where(UserModel.email == form_data.username)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            logger.warning(f"User not found for email: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        logger.debug(f"User found: {user.email}, is_active: {user.is_active}")
        
        if not verify_password(form_data.password, user.hashed_password):
            logger.warning(f"Invalid password for user: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        if not user.is_active:
            logger.warning(f"Inactive user attempt: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        
        access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        logger.debug(f"Creating access token with expires_delta: {access_token_expires}")
        
        try:
            access_token = create_access_token(
                data={"sub": user.email}, expires_delta=access_token_expires
            )
            logger.info(f"Successfully created access token for user: {form_data.username}")
            
            return {"access_token": access_token, "token_type": "bearer"}
        except Exception as e:
            logger.error(f"Error creating access token: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating access token: {str(e)}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during login: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

@router.get("/me", response_model=User)
async def read_users_me(current_user: UserModel = Depends(get_current_user)) -> Any:
    """
    Get current user information.
    """
    return current_user 