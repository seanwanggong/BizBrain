from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os

def test_db_connection():
    try:
        # Get database connection parameters from environment variables or use defaults
        db_host = os.getenv("POSTGRES_SERVER", "localhost")
        db_port = os.getenv("POSTGRES_PORT", "5432")
        db_user = os.getenv("POSTGRES_USER", "postgres")
        db_pass = os.getenv("POSTGRES_PASSWORD", "postgres")
        db_name = os.getenv("POSTGRES_DB", "bizbrain")
        
        # Construct database URL
        database_url = f"postgresql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"
        
        # Create engine using the constructed DATABASE_URL
        engine = create_engine(database_url)
        
        # Try to connect and execute a simple query
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("Database connection successful!")
            print("Test query result:", result.scalar())
            
            # Get database version
            version = connection.execute(text("SELECT version()"))
            print("Database version:", version.scalar())
            
    except Exception as e:
        print("Error connecting to database:")
        print(e)

if __name__ == "__main__":
    test_db_connection() 