import mysql.connector
from config import settings

def init_database():
    # 首先连接到MySQL服务器
    try:
        conn = mysql.connector.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD
        )
        cursor = conn.cursor()
        
        # 创建数据库
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {settings.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print(f"数据库 {settings.DB_NAME} 创建成功")
        
        # 切换到创建的数据库
        cursor.execute(f"USE {settings.DB_NAME}")
        
        # 创建用户表
        create_user_table = """
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP NULL,
            status ENUM('enabled', 'disabled') DEFAULT 'enabled',
            INDEX idx_username (username),
            INDEX idx_phone (phone),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        cursor.execute(create_user_table)
        print("用户表创建成功")
        
        conn.commit()
        cursor.close()
        conn.close()
        print("数据库初始化完成")
        
    except Exception as e:
        print(f"数据库初始化失败: {e}")

if __name__ == "__main__":
    init_database()
