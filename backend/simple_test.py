"""
简化的API测试脚本
"""
import requests
import json

BASE_URL = "http://localhost:8001"

def main():
    print("测试API端点...")

    # 测试根路径
    print("\n1. 测试根路径 /")
    resp = requests.get(f"{BASE_URL}/")
    print(f"   状态码: {resp.status_code}")
    print(f"   响应: {resp.json()}")

    # 测试健康检查
    print("\n2. 测试健康检查 /health")
    resp = requests.get(f"{BASE_URL}/health")
    print(f"   状态码: {resp.status_code}")
    print(f"   响应: {resp.json()}")

    # 获取OpenAPI信息
    print("\n3. 获取OpenAPI信息 /openapi.json")
    resp = requests.get(f"{BASE_URL}/openapi.json")
    print(f"   状态码: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        print(f"   标题: {data.get('info', {}).get('title', 'N/A')}")
        print(f"   路由数量: {len(data.get('paths', {}))}")
        print("   路由列表:")
        for path in sorted(data.get('paths', {}).keys()):
            print(f"     - {path}")

    # 测试 /api/v1/auth/register
    print("\n4. 测试 POST /api/v1/auth/register")
    resp = requests.post(
        f"{BASE_URL}/api/v1/auth/register",
        json={"username": "test99", "password": "Test123", "phone": "13899998888"}
    )
    print(f"   状态码: {resp.status_code}")
    print(f"   响应: {resp.json()}")

    # 测试 /api/v1/auth/login
    print("\n5. 测试 POST /api/v1/auth/login")
    resp = requests.post(
        f"{BASE_URL}/api/v1/auth/login",
        json={"username": "test99", "password": "Test123"}
    )
    print(f"   状态码: {resp.status_code}")
    print(f"   响应: {resp.json()}")

    # 测试 /api/v1/class/select
    print("\n6. 测试 POST /api/v1/class/select")
    resp = requests.post(
        f"{BASE_URL}/api/v1/class/select",
        json={"class_name": "变量巫师"}
    )
    print(f"   状态码: {resp.status_code}")
    print(f"   响应: {resp.json()}")

    # 测试 /api/v1/class/records
    print("\n7. 测试 GET /api/v1/class/records")
    resp = requests.get(f"{BASE_URL}/api/v1/class/records")
    print(f"   状态码: {resp.status_code}")
    print(f"   响应: {resp.json()}")

    # 测试 /api/v1/settings
    print("\n8. 测试 POST /api/v1/settings")
    resp = requests.post(
        f"{BASE_URL}/api/v1/settings",
        json={"user_id": 8888, "eye_protection": True, "volume": 80}
    )
    print(f"   状态码: {resp.status_code}")
    print(f"   响应: {resp.json()}")

    # 测试 /api/v1/settings/{user_id}
    print("\n9. 测试 GET /api/v1/settings/8888")
    resp = requests.get(f"{BASE_URL}/api/v1/settings/8888")
    print(f"   状态码: {resp.status_code}")
    print(f"   响应: {resp.json()}")

    # 测试 /api/v1/ai/chat
    print("\n10. 测试 POST /api/v1/ai/chat")
    resp = requests.post(
        f"{BASE_URL}/api/v1/ai/chat",
        json={"question": "你好", "stream": False}
    )
    print(f"   状态码: {resp.status_code}")
    print(f"   响应: {resp.json()}")

    # 测试 /api/v1/ai/history
    print("\n11. 测试 GET /api/v1/ai/history")
    resp = requests.get(f"{BASE_URL}/api/v1/ai/history")
    print(f"   状态码: {resp.status_code}")
    print(f"   响应: {resp.json()}")

if __name__ == "__main__":
    main()
