import mysql.connector

# 数据库连接配置
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
    'database': 'ai_coding_platform'
}

# 连接数据库
try:
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    
    # 查看表结构
    cursor.execute("DESCRIBE ai_chat_record")
    print("表结构:")
    for column in cursor.fetchall():
        print(column)
    
    # 查看索引
    cursor.execute("SHOW INDEX FROM ai_chat_record")
    print("\n索引:")
    for index in cursor.fetchall():
        print(index)
    
    # 关闭连接
    cursor.close()
    conn.close()
    print("\n数据库连接成功，表结构验证完成！")
except Exception as e:
    print(f"数据库连接失败: {e}")
