import pytest
import sys
import os
# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi.testclient import TestClient
from main import app

# 创建测试客户端
client = TestClient(app)

# 测试AI对话接口（非流式）
def test_ai_chat_non_stream():
    # 测试非流式响应
    response = client.post("/api/v1/ai/chat", json={
        "question": "attack函数怎么用？",
        "question_type": "text",
        "stream": False
    })
    assert response.status_code == 200
    assert response.json()["code"] == 200
    assert response.json()["msg"] == "响应成功"
    assert "answer" in response.json()["data"]
    assert "session_id" in response.json()["data"]

# 测试AI对话接口（流式）
def test_ai_chat_stream():
    # 测试流式响应
    response = client.post("/api/v1/ai/chat", json={
        "question": "attack函数怎么用？",
        "question_type": "text",
        "stream": True
    })
    assert response.status_code == 200
    assert "text/event-stream" in response.headers["Content-Type"]
    # 检查响应内容
    content = response.text
    assert "data: {" in content
    assert "[END]" in content
    assert "session_id" in content

# 测试获取历史记录
def test_get_chat_history():
    # 先发送一条消息
    client.post("/api/v1/ai/chat", json={
        "question": "测试历史记录",
        "question_type": "text",
        "stream": False
    })
    # 获取历史记录
    response = client.get("/api/v1/ai/history")
    assert response.status_code == 200
    assert response.json()["code"] == 200
    assert "data" in response.json()
    assert "total" in response.json()

# 测试获取会话列表
def test_get_sessions():
    response = client.get("/api/v1/ai/sessions")
    assert response.status_code == 200
    assert response.json()["code"] == 200
    assert "sessions" in response.json()["data"]

# 测试删除历史记录
def test_delete_chat_history():
    # 先发送一条消息
    response = client.post("/api/v1/ai/chat", json={
        "question": "测试删除历史记录",
        "question_type": "text",
        "stream": False
    })
    session_id = response.json()["data"]["session_id"]
    
    # 获取历史记录
    history_response = client.get(f"/api/v1/ai/history?session_id={session_id}")
    records = history_response.json()["data"]
    
    if records:
        # 删除第一条记录
        record_id = records[0]["record_id"]
        delete_response = client.delete(f"/api/v1/ai/history/{record_id}")
        assert delete_response.status_code == 200
        assert delete_response.json()["code"] == 200
        assert delete_response.json()["msg"] == "删除成功"

# 测试空问题
def test_empty_question():
    response = client.post("/api/v1/ai/chat", json={
        "question": "",
        "question_type": "text",
        "stream": False
    })
    assert response.status_code == 200
    assert response.json()["code"] == 400
    assert response.json()["msg"] == "问题不能为空/蓝心大模型调用失败"

# 测试会话历史
def test_session_history():
    # 生成一个新的会话ID
    import uuid
    session_id = str(uuid.uuid4())
    
    # 发送第一条消息
    client.post("/api/v1/ai/chat", json={
        "question": "你好，我是测试用户",
        "question_type": "text",
        "stream": False,
        "session_id": session_id
    })
    
    # 发送第二条消息，应该能够获取到上下文
    response = client.post("/api/v1/ai/chat", json={
        "question": "我的名字是什么？",
        "question_type": "text",
        "stream": False,
        "session_id": session_id
    })
    assert response.status_code == 200
    assert response.json()["code"] == 200
    assert "answer" in response.json()["data"]
