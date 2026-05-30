import React from 'react'
import { useNavigate } from 'react-router-dom'
import yunduo from './images/yunduo.png'
import xingxing from './images/xingxing.png'
import selecthaita from './images/selecthaita.png'

const levels = [
  { id: 1, name: '初识小海獭', icon: '🦦', color: '#27c93f', status: 'completed', x: 55, y: 100 },
  { id: 2, name: 'for循环', icon: '🔄', color: '#4A90E2', status: 'current', x: 200, y: 260 },
  { id: 3, name: '???', icon: '🔒', color: '#999', status: 'locked', x: 55, y: 420 },
  { id: 4, name: '???', icon: '🔒', color: '#999', status: 'locked', x: 200, y: 580 },
]

function generatePath(from, to, index) {
  const startX = from.x + 45
  const startY = from.y + 90
  const endX = to.x + 45
  const endY = to.y
  const midY = (startY + endY) / 2
  const bend = index % 2 === 0 ? 60 : -60
  return `M ${startX} ${startY} C ${startX + bend} ${midY}, ${endX + bend} ${midY}, ${endX} ${endY}`
}

function LevelSelection() {
  const navigate = useNavigate()

  const handleCircleClick = (level) => {
    if (level.status === 'locked') return
    navigate(`/app/levels/${level.id}`)
  }

  return (
    <div className="level-page">
      <img src={xingxing} alt="星星" className="level-decoration"
        style={{ top: '2%', left: '3%', width: '50px', opacity: 0.6 }} />
      <img src={yunduo} alt="云朵" className="level-decoration"
        style={{ top: '3%', right: '5%', width: '70px', opacity: 0.6 }} />

      {/* Right-side otter - full body, ~1/3 page height */}
      <div className="otter-side"
        onClick={() => navigate('/app/ai-chat')}>
        <div className="otter-bubble">有问题问我哦</div>
        <img src={selecthaita} alt="海獭" />
      </div>

      {/* Level circles container - centered */}
      <div className="level-path-container">
        <svg>
          {levels.slice(0, -1).map((level, i) => (
            <path
              key={i}
              d={generatePath(level, levels[i + 1], i)}
              fill="none"
              stroke={level.status === 'completed' ? '#27c93f' : level.status === 'current' ? '#4A90E2' : '#ccc'}
              strokeWidth="4"
              strokeDasharray={level.status === 'locked' ? '8,4' : 'none'}
              strokeLinecap="round"
              opacity="0.7"
            />
          ))}
        </svg>

        {levels.map((level) => (
          <div
            key={level.id}
            className={`level-circle ${level.status}`}
            style={{ left: `${level.x}px`, top: `${level.y}px` }}
            onClick={() => handleCircleClick(level)}
          >
            {/* 外圈效果：仅对已通关/当前关卡显示 */}
            {(level.status === 'completed' || level.status === 'current') && (
              <div className="level-ring" style={{ borderColor: level.color }} />
            )}
            
            {/* 按钮本体 */}
            <div className={`level-button ${level.status}`}>
              {level.status === 'completed' || level.status === 'current' ? (
                <span className="star-icon">★</span>
              ) : (
                <span className="lock-icon">🔒</span>
              )}
            </div>

            {/* 状态标记 */}
            {level.status === 'completed' && <div className="check-mark">✓</div>}
            {level.status === 'current' && <div className="current-arrow">▲</div>}
          </div>
        ))}
      </div>

      <div className="level-wave" />
    </div>
  )
}

export default LevelSelection
