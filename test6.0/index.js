// 全局变量
        let currentSessionId = null;
        let currentPage = 1;
        const pageSize = 10;

        // DOM元素
        const chatBody = document.getElementById('chat-body');
        const chatForm = document.getElementById('chat-form');
        const questionInput = document.getElementById('question');
        const sessionsList = document.getElementById('sessions-list');
        const currentSessionIdElement = document.getElementById('current-session-id');
        const historyBody = document.getElementById('history-body');
        const pagination = document.getElementById('pagination');
        const historySessionFilter = document.getElementById('history-session-filter');

        // 初始化
        document.addEventListener('DOMContentLoaded', async () => {
            await loadSessions();
            await loadHistory();
        });

        // 加载会话列表
        async function loadSessions() {
            try {
                const response = await fetch('http://localhost:8000/api/v1/ai/sessions');
                if (!response.ok) {
                    throw new Error('获取会话列表失败');
                }
                const data = await response.json();
                if (data.code === 200) {
                    const sessions = data.data.sessions;
                    renderSessions(sessions);
                    populateSessionFilter(sessions);
                }
            } catch (error) {
                console.error('加载会话失败:', error);
            }
        }

        // 渲染会话列表
        function renderSessions(sessions) {
            sessionsList.innerHTML = '';
            sessions.forEach(session => {
                const sessionItem = document.createElement('div');
                sessionItem.className = 'session-item';
                if (session.session_id === currentSessionId) {
                    sessionItem.classList.add('active');
                }
                sessionItem.innerHTML = `
                    <div class="session-title">会话 ${session.session_id.substring(0, 8)}...</div>
                    <div class="session-time">${formatDateTime(session.last_message_time)}</div>
                `;
                sessionItem.addEventListener('click', () => {
                    selectSession(session.session_id);
                });
                sessionsList.appendChild(sessionItem);
            });
        }

        // 填充会话筛选下拉框
        function populateSessionFilter(sessions) {
            sessions.forEach(session => {
                const option = document.createElement('option');
                option.value = session.session_id;
                option.textContent = `会话 ${session.session_id.substring(0, 8)}...`;
                historySessionFilter.appendChild(option);
            });
        }

        // 选择会话
        function selectSession(sessionId) {
            currentSessionId = sessionId;
            currentSessionIdElement.textContent = `会话 ${sessionId.substring(0, 8)}...`;
            
            // 更新会话列表选中状态
            document.querySelectorAll('.session-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector(`.session-item[data-session-id="${sessionId}"]`)?.classList.add('active');
            
            // 清空聊天窗口并加载历史记录
            chatBody.innerHTML = '';
            loadSessionHistory(sessionId);
        }

        // 加载会话历史
        async function loadSessionHistory(sessionId) {
            try {
                const response = await fetch(`http://localhost:8000/api/v1/ai/history?session_id=${sessionId}&page=1&page_size=100`);
                if (!response.ok) {
                    throw new Error('获取会话历史失败');
                }
                const data = await response.json();
                if (data.code === 200) {
                    const records = data.data;
                    records.reverse().forEach(record => {
                        addMessage(record.question, true);
                        addMessage(record.answer, false);
                    });
                    if (records.length === 0) {
                        addMessage('你好！我是AI助手，有什么可以帮助你的吗？', false);
                    }
                }
            } catch (error) {
                console.error('加载会话历史失败:', error);
            }
        }

        // 创建新会话
        function createNewSession() {
            currentSessionId = null;
            currentSessionIdElement.textContent = '新会话';
            
            // 更新会话列表选中状态
            document.querySelectorAll('.session-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // 清空聊天窗口
            chatBody.innerHTML = '';
            addMessage('你好！我是AI助手，有什么可以帮助你的吗？', false);
        }

        // 加载历史记录
        async function loadHistory() {
            try {
                const sessionId = historySessionFilter.value;
                const url = `http://localhost:8000/api/v1/ai/history?page=${currentPage}&page_size=${pageSize}${sessionId ? `&session_id=${sessionId}` : ''}`;
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('获取历史记录失败');
                }
                const data = await response.json();
                if (data.code === 200) {
                    renderHistory(data.data, data.total);
                }
            } catch (error) {
                console.error('加载历史记录失败:', error);
            }
        }

        // 渲染历史记录
        function renderHistory(records, total) {
            historyBody.innerHTML = '';
            records.forEach(record => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.innerHTML = `
                    <div class="history-question">${record.question}</div>
                    <div class="history-answer">${record.answer}</div>
                    <div class="history-meta">
                        <span>${formatDateTime(record.response_time)}</span>
                        <button class="btn btn-danger btn-sm delete-btn" onclick="deleteHistoryRecord(${record.record_id})">删除</button>
                    </div>
                `;
                historyBody.appendChild(historyItem);
            });
            renderPagination(total);
        }

        // 渲染分页控件
        function renderPagination(total) {
            pagination.innerHTML = '';
            const totalPages = Math.ceil(total / pageSize);
            
            // 上一页按钮
            const prevBtn = document.createElement('button');
            prevBtn.className = 'btn btn-outline-secondary';
            prevBtn.textContent = '上一页';
            prevBtn.disabled = currentPage === 1;
            prevBtn.onclick = () => {
                if (currentPage > 1) {
                    currentPage--;
                    loadHistory();
                }
            };
            pagination.appendChild(prevBtn);
            
            // 页码按钮
            for (let i = 1; i <= totalPages; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.className = `btn ${i === currentPage ? 'btn-primary' : 'btn-outline-secondary'}`;
                pageBtn.textContent = i;
                pageBtn.onclick = () => {
                    currentPage = i;
                    loadHistory();
                };
                pagination.appendChild(pageBtn);
            }
            
            // 下一页按钮
            const nextBtn = document.createElement('button');
            nextBtn.className = 'btn btn-outline-secondary';
            nextBtn.textContent = '下一页';
            nextBtn.disabled = currentPage === totalPages;
            nextBtn.onclick = () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    loadHistory();
                }
            };
            pagination.appendChild(nextBtn);
        }

        // 删除历史记录
        async function deleteHistoryRecord(recordId) {
            if (!confirm('确定要删除这条记录吗？')) {
                return;
            }
            
            try {
                const response = await fetch(`http://localhost:8000/api/v1/ai/history/${recordId}`, {
                    method: 'DELETE'
                });
                if (!response.ok) {
                    throw new Error('删除记录失败');
                }
                const data = await response.json();
                if (data.code === 200) {
                    loadHistory();
                    loadSessions();
                }
            } catch (error) {
                console.error('删除历史记录失败:', error);
            }
        }

        // 添加消息到聊天窗口
        function addMessage(content, isUser = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = isUser ? 'message user-message' : 'message ai-message';
            messageDiv.innerHTML = `<p>${content}</p>`;
            chatBody.appendChild(messageDiv);
            chatBody.scrollTop = chatBody.scrollHeight;
        }

        // 添加打字指示器
        function addTypingIndicator() {
            const typingDiv = document.createElement('div');
            typingDiv.className = 'message ai-message';
            typingDiv.id = 'typing-indicator';
            typingDiv.innerHTML = `
                <div class="typing-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            `;
            chatBody.appendChild(typingDiv);
            chatBody.scrollTop = chatBody.scrollHeight;
        }

        // 移除打字指示器
        function removeTypingIndicator() {
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
        }

        // 处理表单提交
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const question = questionInput.value.trim();
            if (!question) return;

            // 添加用户消息
            addMessage(question, true);
            questionInput.value = '';

            // 添加打字指示器
            addTypingIndicator();

            try {
                // 调用AI接口（流式响应）
                const response = await fetch('http://localhost:8000/api/v1/ai/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        question: question,
                        stream: true,
                        session_id: currentSessionId
                    })
                });

                if (!response.ok) {
                    throw new Error('API请求失败');
                }

                // 处理流式响应
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let fullAnswer = '';
                let sessionIdFromResponse = currentSessionId;
                
                // 移除打字指示器
                removeTypingIndicator();
                
                // 创建AI消息容器
                const aiMessageDiv = document.createElement('div');
                aiMessageDiv.className = 'message ai-message';
                chatBody.appendChild(aiMessageDiv);
                
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.substring(6);
                            if (data) {
                                try {
                                    const json = JSON.parse(data);
                                    if (json.content) {
                                        if (json.content === '[END]') {
                                            // 结束标记
                                            chatBody.scrollTop = chatBody.scrollHeight;
                                            break;
                                        } else {
                                            fullAnswer += json.content;
                                            aiMessageDiv.innerHTML = `<p>${fullAnswer}</p>`;
                                            chatBody.scrollTop = chatBody.scrollHeight;
                                        }
                                    }
                                    if (json.session_id) {
                                        sessionIdFromResponse = json.session_id;
                                    }
                                } catch (e) {
                                    console.error('解析JSON失败:', e);
                                }
                            }
                        }
                    }
                }

                // 更新当前会话ID
                if (!currentSessionId && sessionIdFromResponse) {
                    currentSessionId = sessionIdFromResponse;
                    currentSessionIdElement.textContent = `会话 ${currentSessionId.substring(0, 8)}...`;
                    loadSessions(); // 重新加载会话列表
                }

            } catch (error) {
                console.error('错误:', error);
                removeTypingIndicator();
                addMessage('抱歉，AI服务暂时不可用，请稍后再试。');
            }
        });

        // 历史记录会话筛选变化
        historySessionFilter.addEventListener('change', () => {
            currentPage = 1;
            loadHistory();
        });

        // 格式化日期时间
        function formatDateTime(dateTimeString) {
            const date = new Date(dateTimeString);
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }