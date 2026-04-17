from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import uvicorn
from app.api import ai
from app.core.database import engine, Base
# 导入模型类，确保SQLAlchemy知道需要创建哪些表
from app.models.user import AIChatRecord

# # 创建数据库表
# Base.metadata.create_all(bind=engine)
# print("="*50)
# print("🔥 代码真实连接的数据库信息：")
# print(f"URL: {engine.url}")
# print(f"主机: {engine.url.host}")
# print(f"端口: {engine.url.port}")  # 看这里！！！
# print(f"数据库: {engine.url.database}")
# print("="*50)

try:
    Base.metadata.create_all(bind=engine)
    print("建表成功")
except Exception as e:
    print(f"建表失败: {e}")


# 创建FastAPI应用
app = FastAPI(
    title="AI对话系统",
    description="基于蓝心大模型的AI对话系统",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(ai.router, prefix="/api/v1", tags=["AI对话"])

# 根路径
@app.get("/")
async def root():
    with open("index.html", "r", encoding="utf-8") as f:
        content = f.read()
    return HTMLResponse(content=content, media_type="text/html")

# 健康检查
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# 配置静态文件服务
app.mount("/static", StaticFiles(directory="."), name="static")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
