from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./portfolio.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class PortfolioBoost(Base):
    __tablename__ = "boosts"
    
    id = Column(Integer, primary_key=True, index=True)
    channel_name = Column(String, index=True)
    project_id = Column(String)  # Unique identifier for the post
    count = Column(Integer, default=0)

Base.metadata.create_all(bind=engine)