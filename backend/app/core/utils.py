from datetime import datetime
from typing import Optional

def format_datetime(dt: Optional[datetime]) -> Optional[str]:
    """Format datetime to ISO format string"""
    return dt.isoformat() if dt else None

def serialize_model(model: object) -> dict:
    """Serialize SQLAlchemy model to dictionary with proper datetime formatting"""
    data = {}
    for column in model.__table__.columns:
        value = getattr(model, column.name)
        if isinstance(value, datetime):
            data[column.name] = format_datetime(value)
        else:
            data[column.name] = value
    return data 