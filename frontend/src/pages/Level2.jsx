import React from 'react'
import { useNavigate } from 'react-router-dom'
import CodeEditor from '../components/CodeEditor.jsx'

function Level2() {
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

      {/* 新增滚动容器，替代之前的白色容器 */}
      <div style={{
        flex: 1,
        overflow: 'auto', // 恢复上下滚动
        borderRadius: '16px'
      }}>
        <CodeEditor
          initialCode={`sum = 0
for i in range(1, 101):
    sum += i
print(sum)`}
          expectedOutput="5050"
          onSuccess={handleSuccess}
          title="for循环练习"
        >
          <p style={{ fontWeight: 600, marginBottom: 8, fontSize: '15px', color: '#333' }}>步骤:</p>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.6 }}>
            1. 使用 <code style={{ background: '#e8f4ff', padding: '2px 6px', borderRadius: '4px', color: '#4A90E2' }}>for</code> 循环计算1到100的和
          </p>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.6 }}>
            2. 使用 <code style={{ background: '#e8f4ff', padding: '2px 6px', borderRadius: '4px', color: '#4A90E2' }}>print()</code> 函数输出计算结果
          </p>
          <div className="error-hint" style={{
            margin: '10px 0',
            padding: '8px 12px',
            background: '#fff2f2',
            borderRadius: '8px',
            color: '#e53e3e',
            fontSize: '13px'
          }}>
            ⚠️ 错误提示：当前代码有两处错误：① range后缺少冒号 ② sum+=中缺少加号
          </div>
          <div className="expected-output" style={{
            padding: '8px 12px',
            background: '#f0fdf4',
            borderRadius: '8px',
            color: '#22c55e',
            fontSize: '13px'
          }}>
            ✓ 预期输出：<code style={{ background: '#e8f4ff', padding: '2px 4px', borderRadius: '4px', color: '#4A90E2' }}>5050</code>
          </div>
        </CodeEditor>
      </div>
    </div>
  )
}

export default Level2
