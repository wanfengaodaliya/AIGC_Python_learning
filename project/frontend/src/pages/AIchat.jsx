import React, { useState, useEffect, useRef } from 'react'

function AIchat() {
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [sessions, setSessions] = useState([])
  const [messages, setMessages] = useState([{ content: '你好！我是AI助手，有什么可以帮助你的吗？', isUser: false }])
  const [history, setHistory] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [typing, setTyping] = useState(false)
  const [question, setQuestion] = useState('')
  const [activeTab, setActiveTab] = useState('chat')
  const [selectedSessionFilter, setSelectedSessionFilter] = useState('')
  const chatBodyRef = useRef(null)

  const pageSize = 10

  // 初始化
  useEffect(() => {
    loadSessions()
    loadHistory()
  }, [])

  // 加载会话列表
  const loadSessions = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/ai/sessions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      if (!response.ok) {
        throw new Error('获取会话列表失败')
      }
      const data = await response.json()
      if (data.code === 200) {
        setSessions(data.data.sessions)
      }
    } catch (error) {
      console.error('加载会话失败:', error)
    }
  }

  // 加载历史记录
  const loadHistory = async () => {
    try {
      const sessionId = selectedSessionFilter
      const url = `http://localhost:8000/api/v1/ai/history?page=${currentPage}&page_size=${pageSize}${sessionId ? `&session_id=${sessionId}` : ''}`
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      if (!response.ok) {
        throw new Error('获取历史记录失败')
      }
      const data = await response.json()
      if (data.code === 200) {
        setHistory(data.data)
        setTotalPages(Math.ceil(data.total / pageSize))
      }
    } catch (error) {
      console.error('加载历史记录失败:', error)
    }
  }

  // 加载会话历史
  const loadSessionHistory = async (sessionId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/ai/history?session_id=${sessionId}&page=1&page_size=100`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      if (!response.ok) {
        throw new Error('获取会话历史失败')
      }
      const data = await response.json()
      if (data.code === 200) {
        const records = data.data
        const newMessages = []
        records.reverse().forEach(record => {
          newMessages.push({ content: record.question, isUser: true })
          newMessages.push({ content: record.answer, isUser: false })
        })
        if (records.length === 0) {
          newMessages.push({ content: '你好！我是AI助手，有什么可以帮助你的吗？', isUser: false })
        }
        setMessages(newMessages)
      }
    } catch (error) {
      console.error('加载会话历史失败:', error)
    }
  }

  // 选择会话
  const selectSession = (sessionId) => {
    setCurrentSessionId(sessionId)
    loadSessionHistory(sessionId)
  }

  // 创建新会话
  const createNewSession = () => {
    setCurrentSessionId(null)
    setMessages([{ content: '你好！我是AI助手，有什么可以帮助你的吗？', isUser: false }])
  }

  // 发送消息
  const sendMessage = async (e) => {
    e.preventDefault()
    if (!question.trim()) return

    // 添加用户消息
    const newMessages = [...messages, { content: question, isUser: true }]
    setMessages(newMessages)
    setQuestion('')
    setTyping(true)

    try {
      // 调用AI接口（流式响应）
      const response = await fetch('http://localhost:8000/api/v1/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          question: question,
          stream: true,
          session_id: currentSessionId
        })
      })

      if (!response.ok) {
        throw new Error('API请求失败')
      }

      // 处理流式响应
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullAnswer = ''
      let sessionIdFromResponse = currentSessionId

      setTyping(false)

      // 读取响应流
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6)
            if (data) {
              try {
                const json = JSON.parse(data)
                if (json.content) {
                  if (json.content === '[END]') {
                    // 结束标记
                    break
                  } else {
                    fullAnswer += json.content
                    setMessages(prev => [...prev.slice(0, -1), { content: fullAnswer, isUser: false }])
                  }
                }
                if (json.session_id) {
                  sessionIdFromResponse = json.session_id
                }
              } catch (e) {
                console.error('解析JSON失败:', e)
              }
            }
          }
        }
      }

      // 更新当前会话ID
      if (!currentSessionId && sessionIdFromResponse) {
        setCurrentSessionId(sessionIdFromResponse)
        loadSessions() // 重新加载会话列表
      }

    } catch (error) {
      console.error('错误:', error)
      setTyping(false)
      setMessages(prev => [...prev, { content: '抱歉，AI服务暂时不可用，请稍后再试。', isUser: false }])
    }
  }

  // 删除历史记录
  const deleteHistoryRecord = async (recordId) => {
    if (!window.confirm('确定要删除这条记录吗？')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:8000/api/v1/ai/history/${recordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      if (!response.ok) {
        throw new Error('删除记录失败')
      }
      const data = await response.json()
      if (data.code === 200) {
        loadHistory()
        loadSessions()
      }
    } catch (error) {
      console.error('删除历史记录失败:', error)
    }
  }

  // 格式化日期时间
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 滚动到聊天底部
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }
  }, [messages, typing])

  return (
    <div className="app-container d-flex h-100">
      {/* 侧边栏 - 会话列表 */}
      <div className="sidebar bg-white border-right" style={{ width: '320px' }}>
        <div className="sidebar-header bg-primary text-white p-4">
          <h3>会话列表</h3>
        </div>
        <div className="sessions-list p-4" style={{ height: 'calc(100vh - 160px)', overflowY: 'auto' }}>
          {sessions.map(session => (
            <div 
              key={session.session_id}
              className={`session-item p-4 rounded-lg mb-2 cursor-pointer ${currentSessionId === session.session_id ? 'bg-primary bg-opacity-10 border border-primary' : ''}`}
              onClick={() => selectSession(session.session_id)}
            >
              <div className="session-title font-medium">会话 {session.session_id.substring(0, 8)}...</div>
              <div className="session-time text-sm text-muted mt-2">{formatDateTime(session.last_message_time)}</div>
            </div>
          ))}
        </div>
        <button 
          className="btn btn-primary new-chat-btn w-100 m-4"
          onClick={createNewSession}
        >
          新建对话
        </button>
      </div>

      {/* 主内容区 */}
      <div className="main-content flex-grow-1">
        {/* 标签页导航 */}
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <a 
              className={`nav-link ${activeTab === 'chat' ? 'active' : ''}`} 
              href="#" 
              onClick={(e) => {
                e.preventDefault()
                setActiveTab('chat')
              }}
            >
              对话
            </a>
          </li>
          <li className="nav-item">
            <a 
              className={`nav-link ${activeTab === 'history' ? 'active' : ''}`} 
              href="#" 
              onClick={(e) => {
                e.preventDefault()
                setActiveTab('history')
              }}
            >
              历史记录
            </a>
          </li>
        </ul>

        {/* 标签页内容 */}
        <div className="tab-content">
          {/* 对话标签页 */}
          {activeTab === 'chat' && (
            <div className="tab-pane active">
              <div className="chat-container h-100">
                <div className="chat-header bg-primary text-white p-4">
                  <h2>AI对话系统</h2>
                  <div className="header-actions">
                    <span id="current-session-id" className="bg-white bg-opacity-20 px-3 py-1 rounded">
                      {currentSessionId ? `会话 ${currentSessionId.substring(0, 8)}...` : '新会话'}
                    </span>
                  </div>
                </div>
                <div 
                  className="chat-body p-4" 
                  style={{ height: 'calc(100vh - 200px)', overflowY: 'auto', backgroundColor: '#f8fafc' }}
                  ref={chatBodyRef}
                >
                  {messages.map((message, index) => (
                    <div 
                      key={index} 
                      className={`message ${message.isUser ? 'user-message' : 'ai-message'} p-4 rounded-lg mb-3 ${message.isUser ? 'ml-auto' : 'mr-auto'} max-w-3/4`}
                      style={{
                        backgroundColor: message.isUser ? '#3b82f6' : '#ffffff',
                        color: message.isUser ? '#ffffff' : '#1f2937',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      <p>{message.content}</p>
                    </div>
                  ))}
                  {typing && (
                    <div className="message ai-message p-4 rounded-lg mb-3 mr-auto max-w-3/4" style={{ backgroundColor: '#ffffff', color: '#1f2937', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                      <div className="typing-indicator">
                        <div className="dot" style={{ width: '10px', height: '10px', backgroundColor: '#3b82f6', borderRadius: '50%', display: 'inline-block', margin: '0 2px', animation: 'typing 1.4s infinite ease-in-out' }}></div>
                        <div className="dot" style={{ width: '10px', height: '10px', backgroundColor: '#3b82f6', borderRadius: '50%', display: 'inline-block', margin: '0 2px', animation: 'typing 1.4s infinite ease-in-out 0.16s' }}></div>
                        <div className="dot" style={{ width: '10px', height: '10px', backgroundColor: '#3b82f6', borderRadius: '50%', display: 'inline-block', margin: '0 2px', animation: 'typing 1.4s infinite ease-in-out 0.32s' }}></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="chat-footer p-4 border-top">
                  <form onSubmit={sendMessage} className="d-flex gap-2">
                    <input 
                      type="text" 
                      className="form-control flex-grow-1 rounded-full p-3" 
                      placeholder="请输入你的问题..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn btn-primary rounded-full px-6">发送</button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* 历史记录标签页 */}
          {activeTab === 'history' && (
            <div className="tab-pane active">
              <div className="history-container h-100">
                <div className="history-header p-4 border-bottom bg-light">
                  <h3>历史记录</h3>
                  <div className="header-actions">
                    <select 
                      className="form-select form-select-sm" 
                      value={selectedSessionFilter}
                      onChange={(e) => {
                        setSelectedSessionFilter(e.target.value)
                        setCurrentPage(1)
                        loadHistory()
                      }}
                    >
                      <option value="">所有会话</option>
                      {sessions.map(session => (
                        <option key={session.session_id} value={session.session_id}>
                          会话 {session.session_id.substring(0, 8)}...
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div 
                  className="history-body p-4" 
                  style={{ height: 'calc(100vh - 200px)', overflowY: 'auto', backgroundColor: '#f8fafc' }}
                >
                  {history.map(record => (
                    <div key={record.record_id} className="history-item p-4 rounded-lg mb-3 bg-white border shadow-sm">
                      <div className="history-question font-semibold mb-3">{record.question}</div>
                      <div className="history-answer text-muted mb-3">{record.answer}</div>
                      <div className="history-meta text-sm text-muted pt-3 border-top d-flex justify-content-between">
                        <span>{formatDateTime(record.response_time)}</span>
                        <button 
                          className="btn btn-danger btn-sm" 
                          onClick={() => deleteHistoryRecord(record.record_id)}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pagination p-4 border-top d-flex justify-content-center gap-2">
                  <button 
                    className="btn btn-outline-secondary" 
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage(prev => prev - 1)
                      loadHistory()
                    }}
                  >
                    上一页
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button 
                      key={page}
                      className={`btn ${page === currentPage ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => {
                        setCurrentPage(page)
                        loadHistory()
                      }}
                    >
                      {page}
                    </button>
                  ))}
                  <button 
                    className="btn btn-outline-secondary" 
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage(prev => prev + 1)
                      loadHistory()
                    }}
                  >
                    下一页
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AIchat