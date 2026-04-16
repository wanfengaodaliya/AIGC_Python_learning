from fastapi import APIRouter, HTTPException, status, Depends
from datetime import timedelta
from models import UserCreate, UserLogin, UserResponse, Token, PasswordResetRequest, PasswordReset
from database import db
from auth import verify_password, get_password_hash, create_access_token, create_refresh_token
from config import settings
from middleware import get_current_user

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate):
    # 检查用户名是否已存在
    db.connect()
    db.execute("SELECT * FROM users WHERE username = %s", (user.username,))
    if db.fetchone():
        db.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在"
        )
    
    # 检查手机号是否已存在
    db.execute("SELECT * FROM users WHERE phone = %s", (user.phone,))
    if db.fetchone():
        db.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="手机号已被注册"
        )
    
    # 密码哈希
    hashed_password = get_password_hash(user.password)
    
    # 插入用户数据
    db.execute(
        "INSERT INTO users (username, password, phone) VALUES (%s, %s, %s)",
        (user.username, hashed_password, user.phone)
    )
    db.commit()
    
    # 获取新创建的用户信息
    db.execute("SELECT * FROM users WHERE username = %s", (user.username,))
    new_user = db.fetchone()
    db.close()
    
    return new_user

@router.post("/login", response_model=Token)
def login(user: UserLogin):
    # 查找用户
    db.connect()
    db.execute("SELECT * FROM users WHERE username = %s", (user.username,))
    db_user = db.fetchone()
    
    if not db_user or not verify_password(user.password, db_user["password"]):
        db.close()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if db_user["status"] == "disabled":
        db.close()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="账户已被禁用"
        )
    
    # 更新最后登录时间
    db.execute(
        "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = %s",
        (db_user["id"],)
    )
    db.commit()
    db.close()
    
    # 创建访问令牌和刷新令牌
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user["username"]}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": db_user["username"]})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/reset-password-request")
def reset_password_request(request: PasswordResetRequest):
    # 检查手机号是否存在
    db.connect()
    db.execute("SELECT * FROM users WHERE phone = %s", (request.phone,))
    user = db.fetchone()
    db.close()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="手机号未注册"
        )
    
    # 这里可以添加发送验证码的逻辑
    # 为了简化，直接返回成功信息
    return {"message": "密码重置请求已接收，请检查手机验证码"}

@router.post("/reset-password")
def reset_password(reset: PasswordReset):
    # 检查手机号是否存在
    db.connect()
    db.execute("SELECT * FROM users WHERE phone = %s", (reset.phone,))
    user = db.fetchone()
    
    if not user:
        db.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="手机号未注册"
        )
    
    # 更新密码
    hashed_password = get_password_hash(reset.new_password)
    db.execute(
        "UPDATE users SET password = %s WHERE phone = %s",
        (hashed_password, reset.phone)
    )
    db.commit()
    db.close()
    
    return {"message": "密码重置成功"}

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return current_user
