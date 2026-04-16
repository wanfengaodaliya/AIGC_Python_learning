from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
from typing import Optional

# 语言枚举
class Language(str, Enum):
    EN = "en"
    ZH = "zh"
    JA = "ja"
    KO = "ko"

# 通知类型枚举
class NotificationType(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"

# 基础用户设置模型
class UserSettingsBase(BaseModel):
    theme: str = Field(default="light", description="主题: light, dark, system")
    timezone: str = Field(default="UTC", description="时区")
    date_format: str = Field(default="YYYY-MM-DD", description="日期格式")
    time_format: str = Field(default="24h", description="时间格式")

# 创建用户设置请求模型
class UserSettingsCreate(UserSettingsBase):
    user_id: int = Field(..., description="用户ID")

# 更新用户设置请求模型
class UserSettingsUpdate(BaseModel):
    theme: Optional[str] = Field(None, description="主题: light, dark, system")
    timezone: Optional[str] = Field(None, description="时区")
    date_format: Optional[str] = Field(None, description="日期格式")
    time_format: Optional[str] = Field(None, description="时间格式")

# 用户设置响应模型
class UserSettingsResponse(UserSettingsBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# 基础通知偏好模型
class NotificationPreferencesBase(BaseModel):
    email_enabled: bool = Field(default=True, description="邮件通知")
    sms_enabled: bool = Field(default=False, description="短信通知")
    push_enabled: bool = Field(default=True, description="推送通知")
    marketing_enabled: bool = Field(default=False, description="营销通知")
    weekly_digest_enabled: bool = Field(default=True, description="每周摘要")

# 创建通知偏好请求模型
class NotificationPreferencesCreate(NotificationPreferencesBase):
    user_settings_id: int = Field(..., description="用户设置ID")

# 更新通知偏好请求模型
class NotificationPreferencesUpdate(BaseModel):
    email_enabled: Optional[bool] = Field(None, description="邮件通知")
    sms_enabled: Optional[bool] = Field(None, description="短信通知")
    push_enabled: Optional[bool] = Field(None, description="推送通知")
    marketing_enabled: Optional[bool] = Field(None, description="营销通知")
    weekly_digest_enabled: Optional[bool] = Field(None, description="每周摘要")

# 通知偏好响应模型
class NotificationPreferencesResponse(NotificationPreferencesBase):
    id: int
    user_settings_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# 基础语言设置模型
class LanguageSettingsBase(BaseModel):
    interface_language: Language = Field(default=Language.EN, description="界面语言")
    content_language: Language = Field(default=Language.EN, description="内容语言")

# 创建语言设置请求模型
class LanguageSettingsCreate(LanguageSettingsBase):
    user_settings_id: int = Field(..., description="用户设置ID")

# 更新语言设置请求模型
class LanguageSettingsUpdate(BaseModel):
    interface_language: Optional[Language] = Field(None, description="界面语言")
    content_language: Optional[Language] = Field(None, description="内容语言")

# 语言设置响应模型
class LanguageSettingsResponse(LanguageSettingsBase):
    id: int
    user_settings_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# 完整用户设置响应模型（包含关联数据）
class UserSettingsWithDetailsResponse(UserSettingsResponse):
    notification_preferences: Optional[NotificationPreferencesResponse] = None
    language_settings: Optional[LanguageSettingsResponse] = None
