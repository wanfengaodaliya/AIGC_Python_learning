from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

# 语言枚举
class LanguageEnum(str, enum.Enum):
    EN = "en"
    ZH = "zh"
    JA = "ja"
    KO = "ko"

# 通知类型枚举
class NotificationType(str, enum.Enum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"

# 用户设置模型
class UserSettings(Base):
    __tablename__ = "user_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, nullable=False, index=True)
    theme = Column(String(20), default="light")  # light, dark, system
    timezone = Column(String(50), default="UTC")
    date_format = Column(String(20), default="YYYY-MM-DD")
    time_format = Column(String(20), default="24h")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    # 关系
    notification_preferences = relationship("NotificationPreferences", back_populates="user_settings", uselist=False, cascade="all, delete-orphan")
    language_settings = relationship("LanguageSettings", back_populates="user_settings", uselist=False, cascade="all, delete-orphan")

# 通知偏好模型
class NotificationPreferences(Base):
    __tablename__ = "notification_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_settings_id = Column(Integer, ForeignKey("user_settings.id"), nullable=False, unique=True)
    email_enabled = Column(Boolean, default=True)
    sms_enabled = Column(Boolean, default=False)
    push_enabled = Column(Boolean, default=True)
    marketing_enabled = Column(Boolean, default=False)
    weekly_digest_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    # 关系
    user_settings = relationship("UserSettings", back_populates="notification_preferences")

# 语言设置模型
class LanguageSettings(Base):
    __tablename__ = "language_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_settings_id = Column(Integer, ForeignKey("user_settings.id"), nullable=False, unique=True)
    interface_language = Column(SQLEnum(LanguageEnum), default=LanguageEnum.EN)
    content_language = Column(SQLEnum(LanguageEnum), default=LanguageEnum.EN)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    # 关系
    user_settings = relationship("UserSettings", back_populates="language_settings")
