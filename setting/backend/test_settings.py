import pytest
from fastapi.testclient import TestClient
from main import app
from database import Base, engine, get_db
from sqlalchemy.orm import sessionmaker

# 创建测试数据库会话
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 依赖注入函数
@pytest.fixture
def db():
    # 使用原始SQL语句删除所有表，确保环境干净
    from sqlalchemy import text
    with engine.connect() as conn:
        # 先删除所有可能存在的表，包括旧的表名
        conn.execute(text("DROP TABLE IF EXISTS notification_preferences CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS notification_settings CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS language_settings CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS user_settings CASCADE"))
        conn.commit()
    
    # 创建所有表
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# 测试客户端
@pytest.fixture
def client():
    # 使用原始SQL语句删除所有表，确保环境干净
    from sqlalchemy import text
    with engine.connect() as conn:
        # 先删除所有可能存在的表，包括旧的表名
        conn.execute(text("DROP TABLE IF EXISTS notification_preferences CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS notification_settings CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS language_settings CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS user_settings CASCADE"))
        conn.commit()
    
    # 创建所有表
    Base.metadata.create_all(bind=engine)
    return TestClient(app)

# 测试用户ID
TEST_USER_ID = 1

# 测试健康检查
def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

# 测试创建用户设置
def test_create_user_settings(client):
    response = client.post("/api/settings", json={
        "user_id": TEST_USER_ID,
        "theme": "light",
        "timezone": "UTC",
        "date_format": "YYYY-MM-DD",
        "time_format": "24h"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["user_id"] == TEST_USER_ID
    assert data["theme"] == "light"

# 测试获取用户设置
def test_get_user_settings(client):
    # 先创建设置
    client.post("/api/settings", json={
        "user_id": TEST_USER_ID,
        "theme": "light"
    })
    # 获取设置
    response = client.get(f"/api/settings/{TEST_USER_ID}")
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == TEST_USER_ID

# 测试更新用户设置
def test_update_user_settings(client):
    # 先创建设置
    client.post("/api/settings", json={
        "user_id": TEST_USER_ID,
        "theme": "light"
    })
    # 更新设置
    response = client.put(f"/api/settings/{TEST_USER_ID}", json={
        "theme": "dark"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["theme"] == "dark"
