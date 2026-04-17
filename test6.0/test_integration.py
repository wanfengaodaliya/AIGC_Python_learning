import requests
import json

# 测试API接口
BASE_URL = "http://localhost:8000/api/v1"

def test_sessions_api():
    """测试会话列表API"""
    print("测试会话列表API...")
    response = requests.get(f"{BASE_URL}/ai/sessions")
    print(f"状态码: {response.status_code}")
    print(f"响应内容: {response.json()}")
    assert response.status_code == 200
    print("会话列表API测试通过！")

def test_history_api():
    """测试历史记录API"""
    print("\n测试历史记录API...")
    response = requests.get(f"{BASE_URL}/ai/history?page=1&page_size=10")
    print(f"状态码: {response.status_code}")
    print(f"响应内容: {response.json()}")
    assert response.status_code == 200
    print("历史记录API测试通过！")

def test_chat_api():
    """测试聊天API"""
    print("\n测试聊天API...")
    data = {
        "question": "你好，测试AI上下文记忆功能",
        "stream": False
    }
    response = requests.post(f"{BASE_URL}/ai/chat", json=data)
    print(f"状态码: {response.status_code}")
    print(f"响应内容: {response.json()}")
    assert response.status_code == 200
    print("聊天API测试通过！")

if __name__ == "__main__":
    print("开始集成测试...")
    try:
        test_sessions_api()
        test_history_api()
        test_chat_api()
        print("\n所有集成测试通过！")
    except Exception as e:
        print(f"\n集成测试失败: {e}")
