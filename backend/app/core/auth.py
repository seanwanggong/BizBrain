from app.core.deps import get_db
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from app.core.config import settings
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.schemas.token import TokenData
from app.core.security import verify_password, get_password_hash
from app.core.database import AsyncSessionLocal
import logging
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger(__name__)

# 配置 OAuth2 密码请求表单
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    scheme_name="JWT",
    auto_error=True,
    scopes=None,
    description="OAuth2 password flow with JWT tokens"
)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """创建访问令牌"""
    try:
        logger.debug(f"Creating access token with data: {data}")
        logger.debug(f"Using SECRET_KEY: {settings.SECRET_KEY[:10]}...")
        logger.debug(f"Using ALGORITHM: {settings.JWT_ALGORITHM}")
        
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
            
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "iss": settings.JWT_ISSUER,
            "aud": settings.JWT_AUDIENCE
        })
        
        logger.debug(f"Token payload: {to_encode}")
        encoded_jwt = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM
        )
        logger.debug("Access token created successfully")
        return encoded_jwt
    except Exception as e:
        logger.error(f"Error creating access token: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating access token: {str(e)}"
        )

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """获取当前用户"""
    try:
        logger.debug("Getting current user from token")
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM],
                audience=settings.JWT_AUDIENCE,
                issuer=settings.JWT_ISSUER
            )
            email: str = payload.get("sub")
            if email is None:
                logger.warning("No email in token payload")
                raise credentials_exception
            token_data = TokenData(email=email)
        except JWTError as e:
            logger.error(f"JWT error: {str(e)}", exc_info=True)
            raise credentials_exception
            
        try:
            stmt = select(User).where(User.email == token_data.email)
            result = await db.execute(stmt)
            user = result.scalar_one_or_none()
            
            if user is None:
                logger.warning(f"User not found for email: {token_data.email}")
                raise credentials_exception
                
            logger.debug(f"Found user: {user.email}")
            return user
        except SQLAlchemyError as e:
            logger.error(f"Database error: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting current user: {str(e)}"
        )

async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """获取当前活跃用户"""
    try:
        logger.debug(f"Checking if user is active: {current_user.email}")
        if not current_user.is_active:
            logger.warning(f"Inactive user: {current_user.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        logger.debug(f"User is active: {current_user.email}")
        return current_user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking user active status: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking user active status: {str(e)}"
        )

async def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    """获取当前活跃超级用户"""
    try:
        logger.debug(f"Checking if user is superuser: {current_user.email}")
        if not current_user.is_superuser:
            logger.warning(f"Not a superuser: {current_user.email}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="The user doesn't have enough privileges"
            )
        logger.debug(f"User is superuser: {current_user.email}")
        return current_user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking superuser status: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking superuser status: {str(e)}"
        ) 