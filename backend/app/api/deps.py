from typing import Optional
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User


def get_current_user() -> Optional[User]:
    """获取当前用户（临时实现，总是返回 None）"""
    return None
