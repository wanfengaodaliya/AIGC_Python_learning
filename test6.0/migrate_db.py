from app.core.database import engine, Base
from app.models.user import AIChatRecord

# 创建所有表（如果不存在）
Base.metadata.create_all(bind=engine)
print("数据库迁移完成，已添加session_id字段")
