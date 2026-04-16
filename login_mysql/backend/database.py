import mysql.connector
from config import settings

class Database:
    def __init__(self):
        self.conn = None
        self.cursor = None
    
    def connect(self):
        try:
            self.conn = mysql.connector.connect(
                host=settings.DB_HOST,
                port=settings.DB_PORT,
                user=settings.DB_USER,
                password=settings.DB_PASSWORD,
                database=settings.DB_NAME
            )
            self.cursor = self.conn.cursor(dictionary=True)
            return True
        except Exception as e:
            print(f"数据库连接失败: {e}")
            return False
    
    def execute(self, query, params=None):
        try:
            if not self.conn or not self.conn.is_connected():
                self.connect()
            self.cursor.execute(query, params)
            return True
        except Exception as e:
            print(f"执行SQL失败: {e}")
            return False
    
    def fetchall(self):
        return self.cursor.fetchall()
    
    def fetchone(self):
        return self.cursor.fetchone()
    
    def commit(self):
        if self.conn:
            self.conn.commit()
    
    def rollback(self):
        if self.conn:
            self.conn.rollback()
    
    def close(self):
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()

db = Database()
