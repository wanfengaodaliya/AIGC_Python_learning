import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Auth() {
  const [activeTab, setActiveTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')
  const navigate = useNavigate()

  const API_BASE_URL = 'http://localhost:8000/api/v1'

  const showMessage = (msg, type = 'info') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => {
      setMessage('')
    }, 3000)
  }

  const validateForm = (form) => {
    let isValid = true
    const inputs = form.querySelectorAll('input[required]')
    
    inputs.forEach(input => {
      if (!input.value.trim()) {
        input.classList.add('is-invalid')
        isValid = false
      } else if (input.hasAttribute('minlength') && input.value.length < parseInt(input.getAttribute('minlength'))) {
        input.classList.add('is-invalid')
        isValid = false
      } else if (input.hasAttribute('maxlength') && input.value.length > parseInt(input.getAttribute('maxlength'))) {
        input.classList.add('is-invalid')
        isValid = false
      } else {
        input.classList.remove('is-invalid')
        input.classList.add('is-valid')
      }
    })
    
    return isValid
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!validateForm(e.target)) {
      return
    }
    
    setLoading(true)
    
    const formData = new FormData(e.target)
    const data = {
      username: formData.get('username'),
      password: formData.get('password')
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (result.code === 200) {
        // 保存令牌到本地存储
        localStorage.setItem('access_token', result.data.access_token)
        localStorage.setItem('refresh_token', result.data.refresh_token)
        showMessage('登录成功', 'success')
        // 跳转到主应用
        setTimeout(() => {
          navigate('/app/class-selection')
        }, 1000)
      } else if (result.code === 401) {
        showMessage(result.msg || '用户名或密码错误', 'danger')
      } else if (result.code === 403) {
        showMessage(result.msg || '账户已被禁用', 'danger')
      } else if (result.code >= 500) {
        showMessage('服务器错误，请稍后重试', 'danger')
      } else {
        showMessage(result.msg || '登录失败', 'danger')
      }
    } catch (error) {
      showMessage('网络错误，请稍后重试', 'danger')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    
    if (!validateForm(e.target)) {
      return
    }
    
    setLoading(true)
    
    const formData = new FormData(e.target)
    const data = {
      username: formData.get('username'),
      password: formData.get('password'),
      phone: formData.get('phone')
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (result.code === 200) {
        showMessage('注册成功，请登录', 'success')
        // 切换到登录标签页
        setActiveTab('login')
      } else if (result.code === 400) {
        showMessage(result.msg || '注册失败', 'danger')
      } else if (result.code >= 500) {
        showMessage('服务器错误，请稍后重试', 'danger')
      } else {
        showMessage(result.msg || '注册失败', 'danger')
      }
    } catch (error) {
      showMessage('网络错误，请稍后重试', 'danger')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    
    if (!validateForm(e.target)) {
      return
    }
    
    setLoading(true)
    
    const formData = new FormData(e.target)
    const data = {
      phone: formData.get('phone'),
      new_password: formData.get('new_password')
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (result.code === 200) {
        showMessage('密码重置成功，请登录', 'success')
        // 切换到登录标签页
        setActiveTab('login')
      } else if (result.code === 404) {
        showMessage(result.msg || '手机号未注册', 'danger')
      } else if (result.code >= 500) {
        showMessage('服务器错误，请稍后重试', 'danger')
      } else {
        showMessage(result.msg || '密码重置失败', 'danger')
      }
    } catch (error) {
      showMessage('网络错误，请稍后重试', 'danger')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      {/* 加载状态 */}
      <div className="loading-overlay" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        display: loading ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">加载中...</span>
        </div>
      </div>

      <div className="auth-container bg-white rounded-3 shadow-lg p-5 w-100 max-w-md">
        <h2 className="text-center mb-5">用户认证系统</h2>
        
        {/* 标签页导航 */}
        <ul className="nav nav-tabs mb-4" id="authTabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'login' ? 'active' : ''}`} 
              onClick={() => setActiveTab('login')}
            >
              登录
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'register' ? 'active' : ''}`} 
              onClick={() => setActiveTab('register')}
            >
              注册
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'reset' ? 'active' : ''}`} 
              onClick={() => setActiveTab('reset')}
            >
              重置密码
            </button>
          </li>
        </ul>

        {/* 消息提示 */}
        {message && (
          <div className={`alert alert-${messageType} mb-3`}>
            {message}
          </div>
        )}

        {/* 登录表单 */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="loginUsername" className="form-label">用户名</label>
              <input type="text" className="form-control" id="loginUsername" name="username" required />
              <div className="invalid-feedback">请输入用户名</div>
            </div>
            <div className="mb-3">
              <label htmlFor="loginPassword" className="form-label">密码</label>
              <input type="password" className="form-control" id="loginPassword" name="password" required />
              <div className="invalid-feedback">请输入密码</div>
            </div>
            <button type="submit" className="btn btn-primary w-100">登录</button>
          </form>
        )}

        {/* 注册表单 */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label htmlFor="registerUsername" className="form-label">用户名</label>
              <input type="text" className="form-control" id="registerUsername" name="username" minLength="3" maxLength="50" required />
              <div className="invalid-feedback">用户名长度应在3-50个字符之间</div>
            </div>
            <div className="mb-3">
              <label htmlFor="registerPassword" className="form-label">密码</label>
              <input type="password" className="form-control" id="registerPassword" name="password" minLength="6" required />
              <div className="invalid-feedback">密码长度至少6个字符</div>
            </div>
            <div className="mb-3">
              <label htmlFor="registerPhone" className="form-label">手机号</label>
              <input type="tel" className="form-control" id="registerPhone" name="phone" minLength="10" maxLength="20" required />
              <div className="invalid-feedback">请输入有效的手机号</div>
            </div>
            <button type="submit" className="btn btn-primary w-100">注册</button>
          </form>
        )}

        {/* 密码重置表单 */}
        {activeTab === 'reset' && (
          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <label htmlFor="resetPhone" className="form-label">手机号</label>
              <input type="tel" className="form-control" id="resetPhone" name="phone" minLength="10" maxLength="20" required />
              <div className="invalid-feedback">请输入有效的手机号</div>
            </div>
            <div className="mb-3">
              <label htmlFor="resetNewPassword" className="form-label">新密码</label>
              <input type="password" className="form-control" id="resetNewPassword" name="new_password" minLength="6" required />
              <div className="invalid-feedback">密码长度至少6个字符</div>
            </div>
            <button type="submit" className="btn btn-primary w-100">重置密码</button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Auth