"""
Python沙箱后端服务器
提供HTTP接口供前端调用
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse
from python_sandbox.sandbox import run_code


class CORSRequestHandler(BaseHTTPRequestHandler):
    """支持CORS的请求处理器"""
    
    def _send_cors_headers(self):
        """发送CORS头部"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    
    def do_OPTIONS(self):
        """处理OPTIONS预检请求"""
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()
    
    def do_POST(self):
        """处理POST请求"""
        if self.path == '/run':
            self._handle_run()
        elif self.path == '/check':
            self._handle_check()
        else:
            self.send_response(404)
            self.end_headers()
    
    def _handle_run(self):
        """处理代码执行请求"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            code = data.get('code', '')
            timeout = data.get('timeout', 10)
            
            # 在沙箱中执行代码
            result = run_code(code, timeout=timeout)
            
            # 发送响应
            self.send_response(200)
            self._send_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            self.wfile.write(json.dumps(result, ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            error_response = {
                'success': False,
                'output': '',
                'errors': [{
                    'type': '服务器错误',
                    'line': None,
                    'column': None,
                    'message': str(e),
                    'suggestion': '请稍后重试或联系管理员'
                }],
                'execution_time': 0
            }
            
            self.send_response(500)
            self._send_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(error_response, ensure_ascii=False).encode('utf-8'))
    
    def _handle_check(self):
        """处理代码检查请求（仅检查不执行）"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            code = data.get('code', '')
            
            from python_sandbox.security_check import SecurityChecker
            checker = SecurityChecker()
            is_safe, errors = checker.check_code(code)
            
            result = {
                'success': is_safe,
                'errors': errors
            }
            
            self.send_response(200)
            self._send_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            self.wfile.write(json.dumps(result, ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self._send_cors_headers()
            self.end_headers()
    
    def do_GET(self):
        """处理GET请求"""
        if self.path == '/':
            self._send_static_file('index.html')
        elif self.path == '/styles.css':
            self._send_static_file('styles.css')
        elif self.path == '/script.js':
            self._send_static_file('script.js')
        elif self.path == '/level2.html':
            self._send_static_file('level2.html')
        elif self.path == '/level2.js':
            self._send_static_file('level2.js')
        elif self.path.endswith('.png') or self.path.endswith('.jpg') or self.path.endswith('.jpeg') or self.path.endswith('.gif'):
            filename = self.path[1:]
            self._send_image_file(filename)
        elif self.path == '/health':
            self.send_response(200)
            self._send_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'ok'}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()
    
    def _send_static_file(self, filename):
        """发送静态文件"""
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                content = f.read()
            
            content_type = 'text/html'
            if filename.endswith('.css'):
                content_type = 'text/css'
            elif filename.endswith('.js'):
                content_type = 'application/javascript'
            
            self.send_response(200)
            self._send_cors_headers()
            self.send_header('Content-Type', content_type)
            self.end_headers()
            self.wfile.write(content.encode('utf-8'))
            
        except FileNotFoundError:
            self.send_response(404)
            self.end_headers()
    
    def _send_image_file(self, filename):
        """发送图片文件"""
        try:
            with open(filename, 'rb') as f:
                content = f.read()
            
            self.send_response(200)
            self._send_cors_headers()
            self.send_header('Content-Type', 'image/png')
            self.end_headers()
            self.wfile.write(content)
            
        except FileNotFoundError:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        """重写日志方法，减少输出"""
        print(f"[{self.log_date_time_string()}] {format % args}")


def run_server(host='127.0.0.1', port=8000):
    """启动服务器"""
    server_address = (host, port)
    httpd = HTTPServer(server_address, CORSRequestHandler)
    
    print(f"========================================")
    print(f"   Python沙箱服务器已启动")
    print(f"   访问地址: http://{host}:{port}")
    print(f"   按 Ctrl+C 停止服务器")
    print(f"========================================")
    print()
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print()
        print("服务器已停止")
        httpd.shutdown()


if __name__ == '__main__':
    import sys
    
    host = '127.0.0.1'
    port = 8000
    
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    
    run_server(host, port)
