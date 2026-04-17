from fastapi import APIRouter, HTTPException, status, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import AIChatRecord
from pydantic import BaseModel
import json
import asyncio
import uuid
from datetime import datetime
from openai import OpenAI
from typing import List, Optional

router = APIRouter()

# 蓝心大模型配置
AppKey = "sk-xuanji-2026028320-Z3NVdGRFQ2NGbXdwT2pjVg=="
BASE_URL = "https://api-ai.vivo.com.cn/v1"
MODEL_NAME = "Doubao-Seed-2.0-mini"

# 请求和响应模型
class AIChatRequest(BaseModel):
    question: str
    question_type: str = "text"
    stream: bool = True
    session_id: Optional[str] = None

class AIChatResponse(BaseModel):
    code: int = 200
    msg: str = "响应成功"
    data: dict

class ChatRecordResponse(BaseModel):
    record_id: int
    user_id: int
    session_id: str
    question: str
    question_type: str
    answer: str
    response_time: datetime
    is_stream: bool

class ChatHistoryResponse(BaseModel):
    code: int = 200
    msg: str = "获取成功"
    data: List[ChatRecordResponse]
    total: int
    page: int
    page_size: int

# 创建OpenAI客户端
def create_client():
    request_id = str(uuid.uuid4())
    return OpenAI(
        api_key=AppKey,
        base_url=BASE_URL,
        default_headers={
            "Content-Type": "application/json; charset=utf-8"
        },
        default_query={"request_id": request_id}
    )

# AI对话接口
@router.post("/ai/chat")
async def chat_with_ai(
    chat_data: AIChatRequest,
    db: Session = Depends(get_db)
):
    # 检查问题是否为空
    if not chat_data.question:
        return AIChatResponse(
            code=400,
            msg="问题不能为空/蓝心大模型调用失败",
            data={}
        )
    
    # 处理流式响应
    if chat_data.stream:
        return await stream_chat_response(chat_data, db)
    else:
        return await normal_chat_response(chat_data, db)

# 获取会话的历史记录
async def get_session_history(db: Session, session_id: str):
    """获取指定会话的历史记录，用于构建上下文"""
    history = db.query(AIChatRecord).filter(
        AIChatRecord.session_id == session_id
    ).order_by(AIChatRecord.response_time.asc()).all()
    
    messages = []
    for record in history:
        messages.append({"role": "user", "content": record.question})
        messages.append({"role": "assistant", "content": record.answer})
    
    return messages

# 流式响应
async def stream_chat_response(chat_data: AIChatRequest, db: Session):
    try:
        client = create_client()
        request_id = str(uuid.uuid4())
        
        # 生成或使用现有的会话ID
        session_id = chat_data.session_id or str(uuid.uuid4())
        
        # 获取历史记录作为上下文
        history_messages = await get_session_history(db, session_id)
        
        # 构建完整的消息列表
        messages = history_messages + [{"role": "user", "content": chat_data.question}]
        
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
            stream=True,
            stream_options={"include_usage": True}
        )
        
        full_content = ""
        
        def generate():
            nonlocal full_content
            for chunk in response:
                if hasattr(chunk, 'usage') and chunk.usage:
                    continue
                if not chunk.choices:
                    continue
                delta = chunk.choices[0].delta.content
                if delta:
                    full_content += delta
                    yield f"data: {{\"content\": \"{delta}\", \"session_id\": \"{session_id}\"}}\n\n"
            
            # 结束标记
            yield f"data: {{\"content\": \"[END]\", \"session_id\": \"{session_id}\"}}\n\n"
            
            # 保存对话记录
            chat_record = AIChatRecord(
                user_id=1,  # 默认用户ID
                conversation_id=1,  # 默认会话ID
                session_id=session_id,
                question=chat_data.question,
                question_type=chat_data.question_type,
                answer=full_content,
                is_stream=True
            )
            db.add(chat_record)
            db.commit()
        
        return StreamingResponse(
            generate(),
            media_type="text/event-stream"
        )
        
    except Exception as e:
        return AIChatResponse(
            code=400,
            msg=f"蓝心大模型调用失败: {str(e)}",
            data={}
        )

# 非流式响应
async def normal_chat_response(chat_data: AIChatRequest, db: Session):
    try:
        client = create_client()
        request_id = str(uuid.uuid4())
        
        # 生成或使用现有的会话ID
        session_id = chat_data.session_id or str(uuid.uuid4())
        
        # 获取历史记录作为上下文
        history_messages = await get_session_history(db, session_id)
        
        # 构建完整的消息列表
        messages = history_messages + [{"role": "user", "content": chat_data.question}]
        
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
            stream=False
        )
        
        full_answer = response.choices[0].message.content
        
        # 记录对话历史
        chat_record = AIChatRecord(
            user_id=1,  # 默认用户ID
            conversation_id=1,  # 默认会话ID
            session_id=session_id,
            question=chat_data.question,
            question_type=chat_data.question_type,
            answer=full_answer,
            is_stream=False
        )
        db.add(chat_record)
        db.commit()
        
        return AIChatResponse(
            code=200,
            msg="响应成功",
            data={
                "question": chat_data.question,
                "answer": full_answer,
                "response_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "session_id": session_id
            }
        )
        
    except Exception as e:
        return AIChatResponse(
            code=400,
            msg=f"蓝心大模型调用失败: {str(e)}",
            data={}
        )

# 获取历史记录（分页）
@router.get("/ai/history", response_model=ChatHistoryResponse)
async def get_chat_history(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=100, description="每页数量"),
    session_id: Optional[str] = Query(None, description="会话ID"),
    db: Session = Depends(get_db)
):
    """获取聊天历史记录，支持分页和会话ID筛选"""
    query = db.query(AIChatRecord).filter(AIChatRecord.user_id == 1)  # 默认用户ID
    
    if session_id:
        query = query.filter(AIChatRecord.session_id == session_id)
    
    # 计算总数
    total = query.count()
    
    # 分页查询
    records = query.order_by(AIChatRecord.response_time.desc()).offset(
        (page - 1) * page_size
    ).limit(page_size).all()
    
    # 转换为响应模型
    record_responses = [
        ChatRecordResponse(
            record_id=record.record_id,
            user_id=record.user_id,
            session_id=record.session_id,
            question=record.question,
            question_type=record.question_type,
            answer=record.answer,
            response_time=record.response_time,
            is_stream=record.is_stream
        )
        for record in records
    ]
    
    return ChatHistoryResponse(
        data=record_responses,
        total=total,
        page=page,
        page_size=page_size
    )

# 删除历史记录
@router.delete("/ai/history/{record_id}")
async def delete_chat_history(
    record_id: int,
    db: Session = Depends(get_db)
):
    """删除指定的聊天历史记录"""
    record = db.query(AIChatRecord).filter(
        AIChatRecord.record_id == record_id,
        AIChatRecord.user_id == 1  # 默认用户ID
    ).first()
    
    if not record:
        return AIChatResponse(
            code=404,
            msg="记录不存在",
            data={}
        )
    
    db.delete(record)
    db.commit()
    
    return AIChatResponse(
        code=200,
        msg="删除成功",
        data={}
    )

# 获取会话列表
@router.get("/ai/sessions")
async def get_sessions(db: Session = Depends(get_db)):
    """获取用户的所有会话列表"""
    from sqlalchemy import func
    
    sessions = db.query(
        AIChatRecord.session_id,
        func.max(AIChatRecord.response_time).label('last_message_time')
    ).filter(
        AIChatRecord.user_id == 1  # 默认用户ID
    ).group_by(
        AIChatRecord.session_id
    ).order_by(
        func.max(AIChatRecord.response_time).desc()
    ).all()
    
    session_list = [
        {
            "session_id": session.session_id,
            "last_message_time": session.last_message_time
        }
        for session in sessions
    ]
    
    return AIChatResponse(
        code=200,
        msg="获取成功",
        data={"sessions": session_list}
    )