from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models import User, Workflow, WorkflowExecution, WorkflowTask, TaskLog, ExecutionLog

def test_db_connection():
    """Test database connection and basic queries"""
    try:
        # Create engine
        engine = create_engine(settings.DATABASE_URL)
        
        # Create session
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # Try to query users
        users = db.query(User).all()
        print(f"Successfully connected to database. Found {len(users)} users.")
        
        # Print each user
        for user in users:
            print(f"User: {user.email} (ID: {user.id})")
        
        db.close()
    except Exception as e:
        print(f"Error connecting to database: {str(e)}")
        raise

if __name__ == "__main__":
    test_db_connection() 