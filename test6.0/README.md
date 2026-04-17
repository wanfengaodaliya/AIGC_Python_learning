# 少儿编程RPG App 后端系统

## 项目结构

```
test6.0/
├── app/
│   ├── api/            # API接口
│   │   ├── ai.py       # AI对话接口
│   │   ├── auth.py     # 认证接口
│   │   ├── levels.py   # 关卡系统接口
│   │   ├── sandbox.py  # 代码沙箱接口
│   │   └── users.py    # 用户接口
│   ├── core/           # 核心功能
│   │   ├── database.py # 数据库配置
│   │   └── security.py # 安全配置
│   └── models/         # 数据模型
│       ├── level.py    # 关卡模型
│       └── user.py     # 用户模型
├── tests/              # 测试文件
│   ├── test_ai.py      # AI接口测试
│   ├── test_auth.py    # 认证接口测试
│   └── test_levels.py  # 关卡接口测试
├── .env                # 环境变量配置
├── main.py             # 主应用文件
├── requirements.txt    # 依赖项
└── README.md           # 配置说明文档
```

## 技术栈

- FastAPI：高性能Web框架
- SQLAlchemy：ORM框架
- MySQL：数据库
- JWT：用户认证
- Passlib：密码加密
- Pydantic：数据验证

## 环境配置

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 配置环境变量

创建 `.env` 文件，配置以下内容：

```
# 数据库配置
DATABASE_URL=mysql+pymysql://root:123456@localhost:3306/ai_coding_platform

# JWT配置
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7天
```

### 3. 数据库初始化

1. 创建MySQL数据库：

```sql
CREATE DATABASE ai_coding_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 启动应用时，会自动创建表结构

## 运行说明

### 开发环境

```bash
python main.py
```

应用将运行在 `http://0.0.0.0:8000`

### API文档

访问 `http://localhost:8000/docs` 查看API文档并测试接口

## 接口说明

### 用户系统

- `POST /api/v1/user/register` - 用户注册
- `POST /api/v1/user/login` - 用户登录
- `GET /api/v1/user/progress` - 获取用户进度

### 关卡系统

- `GET /api/v1/level/current` - 获取当前关卡题目
- `POST /api/v1/level/submit` - 提交代码验证

### AI对话

- `POST /api/v1/ai/chat` - AI对话（支持流式响应）

### 代码沙箱

- `POST /api/v1/sandbox/execute` - 执行代码

## 安全说明

- 密码使用BCrypt加密存储
- JWT token有效期为7天
- 代码执行使用沙箱环境，限制危险操作
- 所有接口（除注册、登录）需要携带Authorization头

## 测试

运行单元测试：

```bash
pytest tests/
```
