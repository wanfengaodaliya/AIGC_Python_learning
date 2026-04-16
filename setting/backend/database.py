from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 使用pymysql驱动
import pymysql
pymysql.install_as_MySQLdb()

DATABASE_URL = "mysql://myapp_admin:Shop%402026!@localhost:3306/myapp_db?charset=utf8mb4"

engine = create_engine(
    DATABASE_URL,
    pool_size=10,           # 连接池大小
    max_overflow=20,        # 最大溢出连接数（默认20）
    pool_recycle=3600,      # 连接回收时间（秒）
    pool_pre_ping=True,     # 使用前检查连接是否有效
    echo=True               # 打印SQL日志（开发环境）
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 声明基类，用于定义ORM模型
Base = declarative_base()

# 获取数据库会话的依赖注入函数（用于FastAPI等框架）
def get_db():
    """获取数据库会话"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()