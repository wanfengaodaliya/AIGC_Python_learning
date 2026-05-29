# Python沙箱校验系统

一个专门为休闲小游戏设计的Python代码运行和校验系统，提供安全的沙箱环境和友好的错误提示。

## 功能特性

### 安全沙箱
- 🔒 **危险拦截**：禁止文件读写、系统命令调用、网络请求等危险操作
- 📦 **模块白名单**：只允许导入游戏开发常用的Python模块
- ⚡ **超时限制**：自动终止死循环和无限递归，默认10秒超时

### 代码校验
- 📝 **语法检查**：实时检查代码语法错误
- 💡 **友好提示**：提供通俗易懂的错误说明和修改建议
- 🎯 **精准定位**：准确指出错误在第几行第几列

### 用户体验
- 🎨 **精美界面**：淡蓝色主题，专业友好
- 🎆 **礼花特效**：提交正确答案时触发庆祝动画
- 📱 **响应式设计**：适配不同屏幕尺寸

## 项目结构

```
m7/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── script.js           # 前端逻辑
├── server.py           # Python后端服务器
├── 启动服务器.bat       # Windows快速启动脚本
├── README.md           # 本文件
└── python_sandbox/     # 沙箱核心模块
    ├── __init__.py
    ├── security_check.py   # 安全检查
    ├── error_helper.py     # 错误提示
    └── sandbox.py          # 沙箱执行
```

## 快速开始

### 前置要求
- Python 3.7 或更高版本

### 方法1：使用启动脚本（Windows）
1. 双击运行 `启动服务器.bat`
2. 浏览器自动打开（或手动访问 `http://127.0.0.1:8000`）

### 方法2：命令行启动
```bash
# 进入项目目录
cd e:\Trae_Project\m7

# 启动服务器
python server.py

# 使用自定义端口
python server.py 8888
```

## 使用说明

### 运行代码
1. 在编辑区输入Python代码
2. 点击「运行」按钮
3. 查看输出区域的执行结果和错误信息

### 提交代码
1. 先点击「运行」验证代码
2. 确认无误后点击「提交」
3. 如果答案正确，会看到礼花庆祝特效！

### 测试示例
```python
# 正确示例
print('Hello, World!')

# 常见错误示例
# 变量未定义
# print(my_var)

# 语法错误
# print 'Hello'

# 类型错误
# print(10 + '岁')
```

## 允许的模块

游戏开发常用模块：
- `math` - 数学计算
- `random` - 随机数
- `time` - 时间相关
- `datetime` - 日期时间
- `collections` - 数据结构
- `itertools` - 迭代工具
- `functools` - 函数工具
- `turtle` - 绘图
- `pygame` - 游戏开发（需安装）

## 禁止的操作

以下操作会被沙箱拦截：
- ❌ 文件读写（`open()`）
- ❌ 系统命令（`os.system()`）
- ❌ 网络请求（`socket`、`requests`）
- ❌ 危险模块导入（`os`、`sys`）
- ❌ 动态代码执行（`eval()`、`exec()`）

## 错误提示说明

系统会提供以下信息：
- ⚠️ **错误类型**：如 NameError、SyntaxError
- 📍 **错误位置**：第几行第几列
- ❌ **错误说明**：用通俗易懂的语言解释
- 💡 **修改建议**：给出具体的修改建议

## 开发说明

### 修改超时时间
编辑 `python_sandbox/sandbox.py`：
```python
def __init__(self, timeout: int = 10):  # 修改这里的数字
```

### 修改端口
编辑 `server.py`：
```python
def run_server(host='127.0.0.1', port=8000):  # 修改端口号
```

### 添加新模块到白名单
编辑 `python_sandbox/security_check.py`：
```python
ALLOWED_MODULES = {
    'math', 'random',  # 添加你想要的模块
    'your_module',  # 新模块
}
```

## 技术架构

- **前端**：HTML + CSS + JavaScript
- **后端**：Python原生 HTTP 服务器
- **沙箱**：基于 AST 的代码检查 + 受限执行环境

## 注意事项

1. 请勿在生产环境直接使用，仅供学习和小游戏开发
2. 沙箱虽然提供了多层保护，但不能保证100%安全
3. 建议只在本地使用，不要在公网部署
4. 长时间运行请注意资源占用

## 许可证

MIT License - 仅供学习使用

## 联系方式

如有问题或建议，欢迎反馈！
