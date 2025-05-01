from app.core.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text('SELECT typname FROM pg_type WHERE typtype = \'e\''))
    print('\n'.join([row[0] for row in result])) 