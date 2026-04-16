from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db, Base, engine
from crud import (
    get_user_settings_by_user_id, create_user_settings, update_user_settings,
    get_notification_preferences, update_notification_preferences,
    get_language_settings, update_language_settings
)
from schemas import (
    UserSettingsCreate, UserSettingsUpdate, UserSettingsResponse, UserSettingsWithDetailsResponse,
    NotificationPreferencesUpdate, NotificationPreferencesResponse,
    LanguageSettingsUpdate, LanguageSettingsResponse
)

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="用户设置 API",
    description="用户设置、通知偏好和语言设置的管理接口",
    version="1.0.0"
)

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 健康检查
@app.get("/health")
def health_check():
    return {"status": "healthy"}

# 用户设置相关接口
@app.get("/api/settings/{user_id}", response_model=UserSettingsWithDetailsResponse)
def get_user_settings(user_id: int, db: Session = Depends(get_db)):
    """获取用户设置（包含通知偏好和语言设置）"""
    settings = get_user_settings_by_user_id(db, user_id)
    if not settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User settings not found for user_id: {user_id}"
        )
    return settings

@app.post("/api/settings", response_model=UserSettingsResponse, status_code=status.HTTP_201_CREATED)
def create_settings(settings: UserSettingsCreate, db: Session = Depends(get_db)):
    """创建用户设置"""
    db_settings = create_user_settings(db, settings)
    return db_settings

@app.put("/api/settings/{user_id}", response_model=UserSettingsResponse)
def update_settings(user_id: int, settings: UserSettingsUpdate, db: Session = Depends(get_db)):
    """更新用户设置"""
    db_settings = get_user_settings_by_user_id(db, user_id)
    if not db_settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User settings not found for user_id: {user_id}"
        )
    updated_settings = update_user_settings(db, db_settings.id, settings)
    return updated_settings

# 通知偏好相关接口
@app.get("/api/settings/{user_id}/notifications", response_model=NotificationPreferencesResponse)
def get_notifications(user_id: int, db: Session = Depends(get_db)):
    """获取用户通知偏好"""
    settings = get_user_settings_by_user_id(db, user_id)
    if not settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User settings not found for user_id: {user_id}"
        )
    preferences = get_notification_preferences(db, settings.id)
    if not preferences:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification preferences not found"
        )
    return preferences

@app.put("/api/settings/{user_id}/notifications", response_model=NotificationPreferencesResponse)
def update_notifications(user_id: int, preferences: NotificationPreferencesUpdate, db: Session = Depends(get_db)):
    """更新用户通知偏好"""
    settings = get_user_settings_by_user_id(db, user_id)
    if not settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User settings not found for user_id: {user_id}"
        )
    updated_preferences = update_notification_preferences(db, settings.id, preferences)
    if not updated_preferences:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification preferences not found"
        )
    return updated_preferences

# 语言设置相关接口
@app.get("/api/settings/{user_id}/language", response_model=LanguageSettingsResponse)
def get_language(user_id: int, db: Session = Depends(get_db)):
    """获取用户语言设置"""
    settings = get_user_settings_by_user_id(db, user_id)
    if not settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User settings not found for user_id: {user_id}"
        )
    language_settings = get_language_settings(db, settings.id)
    if not language_settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Language settings not found"
        )
    return language_settings

@app.put("/api/settings/{user_id}/language", response_model=LanguageSettingsResponse)
def update_language(user_id: int, language: LanguageSettingsUpdate, db: Session = Depends(get_db)):
    """更新用户语言设置"""
    settings = get_user_settings_by_user_id(db, user_id)
    if not settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User settings not found for user_id: {user_id}"
        )
    updated_language = update_language_settings(db, settings.id, language)
    if not updated_language:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Language settings not found"
        )
    return updated_language

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
