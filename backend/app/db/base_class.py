from typing import Any
from sqlalchemy.ext.declarative import as_declarative, declared_attr
from sqlalchemy import MetaData
from sqlalchemy.dialects import postgresql

# PostgreSQL-specific naming convention for constraints
convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}

metadata = MetaData(naming_convention=convention)

@as_declarative(metadata=metadata)
class Base:
    id: Any
    __name__: str

    # Generate __tablename__ automatically
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()

    # Add PostgreSQL-specific configuration
    __table_args__ = {
        'postgresql_using': 'btree',
        'postgresql_with_oids': False,
        'postgresql_identity': True
    } 