from sqlalchemy.orm import Session
from models import UserSettings, NotificationPreferences, LanguageSettings
from schemas import (
    UserSettingsCreate, UserSettingsUpdate,
    NotificationPreferencesCreate, NotificationPreferencesUpdate,
    LanguageSettingsCreate, LanguageSettingsUpdate
)

# 用户设置相关操作
def get_user_settings_by_user_id(db: Session, user_id: int):
    """根据用户ID获取用户设置"""
    return db.query(UserSettings).filter(UserSettings.user_id == user_id).first()

def get_user_settings(db: Session, settings_id: int):
    """根据设置ID获取用户设置"""
    return db.query(UserSettings).filter(UserSettings.id == settings_id).first()

def create_user_settings(db: Session, settings: UserSettingsCreate):
    """创建用户设置"""
    # 检查是否已存在
    existing = get_user_settings_by_user_id(db, settings.user_id)
    if existing:
        return existing
    
    # 创建新设置
    db_settings = UserSettings(**settings.model_dump())
    db.add(db_settings)
    db.commit()
    db.refresh(db_settings)
    
    # 创建默认的通知偏好
    default_notification = NotificationPreferences(
        user_settings_id=db_settings.id
    )
    db.add(default_notification)
    
    # 创建默认的语言设置
    default_language = LanguageSettings(
        user_settings_id=db_settings.id
    )
    db.add(default_language)
    
    db.commit()
    db.refresh(db_settings)
    return db_settings

def update_user_settings(db: Session, settings_id: int, settings: UserSettingsUpdate):
    """更新用户设置"""
    db_settings = get_user_settings(db, settings_id)
    if not db_settings:
        return None
    
    # 更新非空字段
    update_data = settings.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_settings, field, value)
    
    db.commit()
    db.refresh(db_settings)
    return db_settings

def delete_user_settings(db: Session, settings_id: int):
    """删除用户设置"""
    db_settings = get_user_settings(db, settings_id)
    if not db_settings:
        return None
    
    db.delete(db_settings)
    db.commit()
    return db_settings

# 通知偏好相关操作
def get_notification_preferences(db: Session, user_settings_id: int):
    """根据用户设置ID获取通知偏好"""
    return db.query(NotificationPreferences).filter(
        NotificationPreferences.user_settings_id == user_settings_id
    ).first()

def create_notification_preferences(db: Session, preferences: NotificationPreferencesCreate):
    """创建通知偏好"""
    db_preferences = NotificationPreferences(**preferences.model_dump())
    db.add(db_preferences)
    db.commit()
    db.refresh(db_preferences)
    return db_preferences

def update_notification_preferences(db: Session, user_settings_id: int, preferences: NotificationPreferencesUpdate):
    """更新通知偏好"""
    db_preferences = get_notification_preferences(db, user_settings_id)
    if not db_preferences:
        return None
    
    # 更新非空字段
    update_data = preferences.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_preferences, field, value)
    
    db.commit()
    db.refresh(db_preferences)
    return db_preferences

# 语言设置相关操作
def get_language_settings(db: Session, user_settings_id: int):
    """根据用户设置ID获取语言设置"""
    return db.query(LanguageSettings).filter(
        LanguageSettings.user_settings_id == user_settings_id
    ).first()

def create_language_settings(db: Session, settings: LanguageSettingsCreate):
    """创建语言设置"""
    db_settings = LanguageSettings(**settings.model_dump())
    db.add(db_settings)
    db.commit()
    db.refresh(db_settings)
    return db_settings

def update_language_settings(db: Session, user_settings_id: int, settings: LanguageSettingsUpdate):
    """更新语言设置"""
    db_settings = get_language_settings(db, user_settings_id)
    if not db_settings:
        return None
    
    # 更新非空字段
    update_data = settings.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_settings, field, value)
    
    db.commit()
    db.refresh(db_settings)
    return db_settings
