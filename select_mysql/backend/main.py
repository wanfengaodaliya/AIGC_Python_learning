from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# 定义请求模型
class ClassSelection(BaseModel):
    class_name: str

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据库连接
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="123456",
        database="game_db"
    )

# 初始化数据库
@app.on_event("startup")
def startup_event():
    # 先连接到MySQL服务器
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="123456"
    )
    cursor = conn.cursor()
    # 创建数据库
    cursor.execute("CREATE DATABASE IF NOT EXISTS game_db")
    conn.commit()
    cursor.close()
    conn.close()
    
    # 再连接到game_db数据库
    conn = get_db_connection()
    cursor = conn.cursor()
    # 创建用户表
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
       职业 VARCHAR(50) NOT NULL,
        创建时间 TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    conn.commit()
    cursor.close()
    conn.close()

# 职业选择API
@app.post("/api/select-class")
def select_class(class_data: ClassSelection):
    职业 = class_data.class_name
    
    valid_classes = ["变量巫师", "逻辑骑士", "循环射手"]
    if 职业 not in valid_classes:
        raise HTTPException(status_code=400, detail="无效的职业选择")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO users (职业) VALUES (%s)", (职业,))
    conn.commit()
    user_id = cursor.lastrowid
    cursor.close()
    conn.close()
    
    return {"user_id": user_id, "职业": 职业, "message": "职业选择成功"}

# 获取职业选择记录
@app.get("/api/class-records")
def get_class_records():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users ORDER BY 创建时间 DESC")
    records = cursor.fetchall()
    cursor.close()
    conn.close()
    return records