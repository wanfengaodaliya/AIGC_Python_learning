from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.core.database import Base

class AIChatRecord(Base):
    __tablename__ = "ai_chat_record"

    record_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False)
    conversation_id = Column(Integer, nullable=False, default=1)
    session_id = Column(String(36), nullable=False, index=True)
    question = Column(Text, nullable=False)
    question_type = Column(String(10), nullable=False)
    answer = Column(Text, nullable=False)
    response_time = Column(DateTime, server_default=func.now())
    is_stream = Column(Boolean, default=False)



