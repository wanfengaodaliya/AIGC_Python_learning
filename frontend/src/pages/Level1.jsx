import React from 'react'
import { useNavigate } from 'react-router-dom'
import CodeEditor from '../components/CodeEditor.jsx'

function Level1() {
  const navigate = useNavigate()

  const handleSuccess = () => {
    navigate('/app/levels')
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      background: 'linear-gradient(180deg, #cceeff 0%, #80c8ff 100%)',
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      <button
        onClick={() => navigate('/app/levels')}
        style={{
          alignSelf: 'flex-start',
          background: '#fff',
          border: 'none',
          borderRadius: '20px',
          padding: '6px 16px',
          cursor: 'pointer',
          fontSize: '14px',
          color: '#4A90E2',
          marginBottom: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        ← 返回关卡选择
      </button>

      <div style={{
        flex: 1,
        overflow: 'auto',
        borderRadius: '16px'
      }}>
        <CodeEditor
          initialCode={"print('Hello, World!')"}
          expectedOutput="Hello, World!"
          onSuccess={handleSuccess}
          title="初识小海獭"
        >
          <p style={{ fontWeight: 600, marginBottom: 8 }}>步骤:</p>
          <p>1. 使用 <code>print()</code> 函数输出 "Hello, World!"</p>
          <p style={{ fontSize: 13, opacity: 0.8, marginTop: 8 }}>
            💡 提示：<code>print()</code> 是 Python 中最常用的输出函数
          </p>
        </CodeEditor>
      </div>
    </div>
  )
}

export default Level1
