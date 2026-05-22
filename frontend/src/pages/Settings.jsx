import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Settings() {
  const [activePage, setActivePage] = useState('main')
  const [eyeProtectionEnabled, setEyeProtectionEnabled] = useState(false)
  const [volume, setVolume] = useState(50)
  const [nickname, setNickname] = useState('游客')
  const [role, setRole] = useState('法师')
  const [language, setLanguage] = useState('zh')
  const navigate = useNavigate()

  const API_BASE_URL = 'http://localhost:8000/api/v1'
  const USER_ID = 1

  // 语言资源
  const i18n = {
    zh: {
      nav: {
        main: '主设置',
        profile: '个人资料',
        accountSecurity: '账号安全',
        eyeProtection: '护眼模式',
        notifications: '通知设置',
        clearCache: '清除缓存',
        language: '语言选择',
        about: '关于我们'
      },
      main: {
        title: '主设置',
        profile: '个人资料',
        accountSecurity: '账号安全',
        volume: '音量',
        eyeProtection: '护眼模式',
        notifications: '通知设置',
        clearCache: '清除缓存',
        language: '语言选择',
        about: '关于我们',
        logout: '退出登录',
        switchAccount: '切换账号'
      },
      profile: {
        title: '个人资料',
        changeAvatar: '点击更换头像',
        nickname: '昵称',
        phone: '手机号',
        progress: '闯关进度',
        role: '职位',
        roles: {
          mage: '法师',
          warrior: '勇者'
        },
        save: '保存更改'
      },
      accountSecurity: {
        title: '账号安全',
        bindingType: '绑定类型',
        notBound: '未绑定',
        changePassword: '修改密码',
        recentDevices: '最近登录设备'
      },
      eyeProtection: {
        title: '护眼模式',
        enable: '启用护眼模式'
      },
      notifications: {
        title: '通知设置',
        pushEnabled: '推送总开关',
        systemNotifications: '系统消息',
        activityNotifications: '活动消息',
        aiNotifications: 'AI 回复'
      },
      clearCache: {
        title: '清除缓存',
        imageCache: '图片缓存',
        voiceCache: '语音缓存',
        tempFiles: '临时文件',
        totalCache: '合计缓存',
        clearAll: '一键清理',
        rescan: '重新扫描',
        cleared: '已释放'
      },
      language: {
        title: '语言选择',
        zh: '简体中文',
        en: 'English',
        current: '当前'
      },
      about: {
        title: '关于我们',
        checkUpdate: '检查更新',
        userAgreement: '用户协议',
        privacyPolicy: '隐私政策',
        version: '版本号'
      },
      alerts: {
        nicknameLength: '昵称长度必须在2-12个字符之间',
        logoutSuccess: '已退出登录',
        switchAccount: '切换账号',
        cacheCleared: '已释放',
        cacheRescanned: '扫描完成',
        languageSwitched: '语言已切换',
        updateFailed: '更新设置失败',
        saveSuccess: '保存成功',
        saveFailed: '保存失败'
      }
    },
    en: {
      nav: {
        main: 'Main Settings',
        profile: 'Profile',
        accountSecurity: 'Account Security',
        eyeProtection: 'Eye Protection',
        notifications: 'Notification Settings',
        clearCache: 'Clear Cache',
        language: 'Language',
        about: 'About Us'
      },
      main: {
        title: 'Main Settings',
        profile: 'Profile',
        accountSecurity: 'Account Security',
        volume: 'Volume',
        eyeProtection: 'Eye Protection',
        notifications: 'Notification Settings',
        clearCache: 'Clear Cache',
        language: 'Language',
        about: 'About Us',
        logout: 'Logout',
        switchAccount: 'Switch Account'
      },
      profile: {
        title: 'Profile',
        changeAvatar: 'Click to change avatar',
        nickname: 'Nickname',
        phone: 'Phone',
        progress: 'Progress',
        role: 'Role',
        roles: {
          mage: 'Mage',
          warrior: 'Warrior'
        },
        save: 'Save Changes'
      },
      accountSecurity: {
        title: 'Account Security',
        bindingType: 'Binding Type',
        notBound: 'Not Bound',
        changePassword: 'Change Password',
        recentDevices: 'Recent Devices'
      },
      eyeProtection: {
        title: 'Eye Protection',
        enable: 'Enable Eye Protection'
      },
      notifications: {
        title: 'Notification Settings',
        pushEnabled: 'Push Notifications',
        systemNotifications: 'System Messages',
        activityNotifications: 'Activity Messages',
        aiNotifications: 'AI Replies'
      },
      clearCache: {
        title: 'Clear Cache',
        imageCache: 'Image Cache',
        voiceCache: 'Voice Cache',
        tempFiles: 'Temporary Files',
        totalCache: 'Total Cache',
        clearAll: 'Clear All',
        rescan: 'Rescan',
        cleared: 'Released'
      },
      language: {
        title: 'Language',
        zh: '简体中文',
        en: 'English',
        current: 'Current'
      },
      about: {
        title: 'About Us',
        checkUpdate: 'Check for Updates',
        userAgreement: 'User Agreement',
        privacyPolicy: 'Privacy Policy',
        version: 'Version'
      },
      alerts: {
        nicknameLength: 'Nickname length must be between 2-12 characters',
        logoutSuccess: 'Logged out',
        switchAccount: 'Switch account',
        cacheCleared: 'Released',
        cacheRescanned: 'Rescan completed',
        languageSwitched: 'Language switched',
        updateFailed: 'Failed to update settings',
        saveSuccess: 'Saved successfully',
        saveFailed: 'Save failed'
      }
    }
  }

  // 获取当前语言的文本
  const t = (key) => {
    const keys = key.split('.')
    let value = i18n[language]
    
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k]
      } else {
        return key
      }
    }
    
    return value
  }

  // 加载本地设置
  useEffect(() => {
    const loadLocalSettings = () => {
      const eyeProtection = localStorage.getItem('eyeProtectionEnabled') === 'true'
      const savedVolume = localStorage.getItem('volume') || 50
      const savedLanguage = localStorage.getItem('language') || 'zh'
      
      setEyeProtectionEnabled(eyeProtection)
      setVolume(parseInt(savedVolume))
      setLanguage(savedLanguage)
      
      if (eyeProtection) {
        document.body.classList.add('eye-protection')
      }
    }
    
    loadLocalSettings()
    loadSettingsFromBackend()
  }, [])

  // 从后端加载设置
  const loadSettingsFromBackend = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/${USER_ID}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to load settings')
      }
      const data = await response.json()
      
      // 更新本地设置
      if (data.data && data.data.settings) {
        if (data.data.settings.eye_protection) {
          setEyeProtectionEnabled(true)
          document.body.classList.add('eye-protection')
        }
        if (data.data.settings.volume) {
          setVolume(data.data.settings.volume)
        }
      }
      
      // 更新个人资料
      if (data.data && data.data.profile) {
        setNickname(data.data.profile.nickname || '游客')
        setRole(data.data.profile.role || '法师')
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  // 更新用户设置
  const updateUserSettings = async (settings) => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/${USER_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(settings)
      })
      if (!response.ok) {
        throw new Error('Failed to update settings')
      }
      const data = await response.json()
      console.log('Settings updated:', data)
    } catch (error) {
      console.error('Error updating settings:', error)
      alert(t('alerts.updateFailed'))
    }
  }

  // 保存个人资料
  const saveProfile = async (e) => {
    e.preventDefault()
    
    if (nickname.length < 2 || nickname.length > 12) {
      alert(t('alerts.nicknameLength'))
      return
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          user_id: USER_ID,
          eye_protection: eyeProtectionEnabled,
          volume: volume
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save profile')
      }
      
      const data = await response.json()
      if (data.code === 200 || data.code === 201) {
        console.log('Profile saved:', data)
        alert(t('alerts.saveSuccess'))
      } else {
        throw new Error(data.msg || 'Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert(t('alerts.saveFailed'))
    }
  }

  // 退出登录
  const logout = () => {
    localStorage.clear()
    navigate('/auth')
  }

  // 切换账号
  const switchAccount = () => {
    localStorage.clear()
    navigate('/auth')
  }

  // 清除缓存
  const clearCache = () => {
    if (window.confirm('确定要清除所有缓存吗？')) {
      console.log('Clearing cache...')
      alert(`${t('alerts.cacheCleared')} 18.1 MB`)
    }
  }

  // 重新扫描缓存
  const rescanCache = () => {
    console.log('Rescanning cache...')
    alert(t('alerts.cacheRescanned'))
  }

  // 切换语言
  const switchLanguage = (lang) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
    alert(t('alerts.languageSwitched'))
  }

  return (
    <div className="container-fluid">
      <div className="row">
        {/* 侧边栏 */}
        <div className="sidebar bg-light border-right" style={{ width: '250px', height: '100vh', position: 'fixed' }}>
          <div className="p-4">
            <h3 className="text-center">{t('nav.main')}</h3>
            <hr />
            <ul className="nav flex-column">
              <li className="nav-item">
                <a 
                  className={`nav-link ${activePage === 'main' ? 'active' : ''}`} 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault()
                    setActivePage('main')
                  }}
                >
                  {t('nav.main')}
                </a>
              </li>
              <li className="nav-item">
                <a 
                  className={`nav-link ${activePage === 'profile' ? 'active' : ''}`} 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault()
                    setActivePage('profile')
                  }}
                >
                  {t('nav.profile')}
                </a>
              </li>
              <li className="nav-item">
                <a 
                  className={`nav-link ${activePage === 'account-security' ? 'active' : ''}`} 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault()
                    setActivePage('account-security')
                  }}
                >
                  {t('nav.accountSecurity')}
                </a>
              </li>
              <li className="nav-item">
                <a 
                  className={`nav-link ${activePage === 'eye-protection' ? 'active' : ''}`} 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault()
                    setActivePage('eye-protection')
                  }}
                >
                  {t('nav.eyeProtection')}
                </a>
              </li>
              <li className="nav-item">
                <a 
                  className={`nav-link ${activePage === 'notifications' ? 'active' : ''}`} 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault()
                    setActivePage('notifications')
                  }}
                >
                  {t('nav.notifications')}
                </a>
              </li>
              <li className="nav-item">
                <a 
                  className={`nav-link ${activePage === 'clear-cache' ? 'active' : ''}`} 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault()
                    setActivePage('clear-cache')
                  }}
                >
                  {t('nav.clearCache')}
                </a>
              </li>
              <li className="nav-item">
                <a 
                  className={`nav-link ${activePage === 'language' ? 'active' : ''}`} 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault()
                    setActivePage('language')
                  }}
                >
                  {t('nav.language')}
                </a>
              </li>
              <li className="nav-item">
                <a 
                  className={`nav-link ${activePage === 'about' ? 'active' : ''}`} 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault()
                    setActivePage('about')
                  }}
                >
                  {t('nav.about')}
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* 主内容区 */}
        <div className="main-content" style={{ marginLeft: '250px', minHeight: '100vh' }}>
          <div className="container py-4">
            {/* 主设置页 */}
            {activePage === 'main' && (
              <div>
                <h2>{t('main.title')}</h2>
                <div className="card mt-4">
                  <div className="card-body p-0">
                    <div className="setting-item p-3 border-bottom">
                      <span>{t('main.profile')}</span>
                      <button 
                        className="btn btn-link" 
                        onClick={() => setActivePage('profile')}
                      >
                        查看
                      </button>
                    </div>
                    <div className="setting-item p-3 border-bottom">
                      <span>{t('main.accountSecurity')}</span>
                      <button 
                        className="btn btn-link" 
                        onClick={() => setActivePage('account-security')}
                      >
                        查看
                      </button>
                    </div>
                    <div className="setting-item p-3 border-bottom">
                      <span>{t('main.volume')}</span>
                      <input 
                        type="range" 
                        className="form-range" 
                        min="0" 
                        max="100" 
                        value={volume}
                        onChange={(e) => setVolume(e.target.value)}
                      />
                    </div>
                    <div className="setting-item p-3 border-bottom">
                      <span>{t('main.eyeProtection')}</span>
                      <button 
                        className="btn btn-link" 
                        onClick={() => setActivePage('eye-protection')}
                      >
                        查看
                      </button>
                    </div>
                    <div className="setting-item p-3 border-bottom">
                      <span>{t('main.notifications')}</span>
                      <button 
                        className="btn btn-link" 
                        onClick={() => setActivePage('notifications')}
                      >
                        查看
                      </button>
                    </div>
                    <div className="setting-item p-3 border-bottom">
                      <span>{t('main.clearCache')}</span>
                      <button 
                        className="btn btn-link" 
                        onClick={() => setActivePage('clear-cache')}
                      >
                        查看
                      </button>
                    </div>
                    <div className="setting-item p-3 border-bottom">
                      <span>{t('main.language')}</span>
                      <button 
                        className="btn btn-link" 
                        onClick={() => setActivePage('language')}
                      >
                        查看
                      </button>
                    </div>
                    <div className="setting-item p-3 border-bottom">
                      <span>{t('main.about')}</span>
                      <button 
                        className="btn btn-link" 
                        onClick={() => setActivePage('about')}
                      >
                        查看
                      </button>
                    </div>
                    <div className="setting-item p-3 border-bottom">
                      <span>{t('main.logout')}</span>
                      <button 
                        className="btn btn-link text-danger" 
                        onClick={logout}
                      >
                        退出
                      </button>
                    </div>
                    <div className="setting-item p-3">
                      <span>{t('main.switchAccount')}</span>
                      <button 
                        className="btn btn-link" 
                        onClick={switchAccount}
                      >
                        切换
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 个人资料页 */}
            {activePage === 'profile' && (
              <div>
                <h2>{t('profile.title')}</h2>
                <div className="card mt-4">
                  <div className="card-body">
                    <div className="text-center mb-4">
                      <div className="avatar-placeholder mx-auto" style={{
                        width: '100px',
                        height: '100px',
                        backgroundColor: '#e9ecef',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        color: '#6c757d'
                      }}>
                        <span>U</span>
                      </div>
                      <p className="mt-2">{t('profile.changeAvatar')}</p>
                    </div>
                    <form onSubmit={saveProfile}>
                      <div className="mb-3">
                        <label htmlFor="nickname" className="form-label">{t('profile.nickname')}</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="nickname" 
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          minLength="2" 
                          maxLength="12"
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="phone" className="form-label">{t('profile.phone')}</label>
                        <input 
                          type="tel" 
                          className="form-control" 
                          id="phone" 
                          value="138****8888" 
                          disabled
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">{t('profile.progress')}</label>
                        <div className="progress">
                          <div 
                            className="progress-bar" 
                            role="progressbar" 
                            style={{ width: '0%' }} 
                            aria-valuenow="0" 
                            aria-valuemin="0" 
                            aria-valuemax="100"
                          >
                            0%
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">{t('profile.role')}</label>
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="radio" 
                            name="role" 
                            id="role-mage" 
                            value="法师" 
                            checked={role === '法师'}
                            onChange={() => setRole('法师')}
                          />
                          <label className="form-check-label" htmlFor="role-mage">{t('profile.roles.mage')}</label>
                        </div>
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="radio" 
                            name="role" 
                            id="role-warrior" 
                            value="勇者"
                            checked={role === '勇者'}
                            onChange={() => setRole('勇者')}
                          />
                          <label className="form-check-label" htmlFor="role-warrior">{t('profile.roles.warrior')}</label>
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary">{t('profile.save')}</button>
                    </form>
                  </div>
                </div>
              </div>
            )}
            
            {/* 账号安全页 */}
            {activePage === 'account-security' && (
              <div>
                <h2>{t('accountSecurity.title')}</h2>
                <div className="card mt-4">
                  <div className="card-body">
                    <div className="setting-item p-3 border-bottom">
                      <span>{t('accountSecurity.bindingType')}</span>
                      <button className="btn btn-link" disabled>{t('accountSecurity.notBound')}</button>
                    </div>
                    <div className="setting-item p-3 border-bottom">
                      <span>{t('accountSecurity.changePassword')}</span>
                      <button className="btn btn-link" disabled>修改</button>
                    </div>
                    <div className="setting-item p-3">
                      <span>{t('accountSecurity.recentDevices')}</span>
                      <button className="btn btn-link" disabled>查看</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 护眼模式页 */}
            {activePage === 'eye-protection' && (
              <div>
                <h2>{t('eyeProtection.title')}</h2>
                <div className="card mt-4">
                  <div className="card-body">
                    <div className="form-check form-switch mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="eye-protection-toggle"
                        checked={eyeProtectionEnabled}
                        onChange={(e) => {
                          setEyeProtectionEnabled(e.target.checked)
                          if (e.target.checked) {
                            document.body.classList.add('eye-protection')
                            localStorage.setItem('eyeProtectionEnabled', 'true')
                          } else {
                            document.body.classList.remove('eye-protection')
                            localStorage.setItem('eyeProtectionEnabled', 'false')
                          }
                          updateUserSettings({ theme: e.target.checked ? 'eye-protection' : 'light' })
                        }}
                      />
                      <label className="form-check-label" htmlFor="eye-protection-toggle">{t('eyeProtection.enable')}</label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 通知设置页 */}
            {activePage === 'notifications' && (
              <div>
                <h2>{t('notifications.title')}</h2>
                <div className="card mt-4">
                  <div className="card-body">
                    <div className="form-check form-switch mb-3">
                      <input className="form-check-input" type="checkbox" id="notifications-enabled" checked />
                      <label className="form-check-label" htmlFor="notifications-enabled">{t('notifications.pushEnabled')}</label>
                    </div>
                    <div className="form-check form-switch mb-3">
                      <input className="form-check-input" type="checkbox" id="system-notifications" checked />
                      <label className="form-check-label" htmlFor="system-notifications">{t('notifications.systemNotifications')}</label>
                    </div>
                    <div className="form-check form-switch mb-3">
                      <input className="form-check-input" type="checkbox" id="activity-notifications" checked />
                      <label className="form-check-label" htmlFor="activity-notifications">{t('notifications.activityNotifications')}</label>
                    </div>
                    <div className="form-check form-switch mb-3">
                      <input className="form-check-input" type="checkbox" id="ai-notifications" checked />
                      <label className="form-check-label" htmlFor="ai-notifications">{t('notifications.aiNotifications')}</label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 清除缓存页 */}
            {activePage === 'clear-cache' && (
              <div>
                <h2>{t('clearCache.title')}</h2>
                <div className="card mt-4">
                  <div className="card-body">
                    <div className="setting-item p-3 border-bottom">
                      <span>{t('clearCache.imageCache')}</span>
                      <span>10.2 MB</span>
                    </div>
                    <div className="setting-item p-3 border-bottom">
                      <span>{t('clearCache.voiceCache')}</span>
                      <span>5.8 MB</span>
                    </div>
                    <div className="setting-item p-3 border-bottom">
                      <span>{t('clearCache.tempFiles')}</span>
                      <span>2.1 MB</span>
                    </div>
                    <div className="setting-item p-3 border-bottom font-weight-bold">
                      <span>{t('clearCache.totalCache')}</span>
                      <span>18.1 MB</span>
                    </div>
                    <div className="mt-4">
                      <button 
                        className="btn btn-danger w-100" 
                        onClick={clearCache}
                      >
                        {t('clearCache.clearAll')}
                      </button>
                    </div>
                    <div className="mt-2">
                      <button 
                        className="btn btn-outline-secondary w-100" 
                        onClick={rescanCache}
                      >
                        {t('clearCache.rescan')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 语言选择页 */}
            {activePage === 'language' && (
              <div>
                <h2>{t('language.title')}</h2>
                <div className="card mt-4">
                  <div className="card-body">
                    <div className="list-group">
                      <a 
                        href="#" 
                        className={`list-group-item list-group-item-action ${language === 'zh' ? 'active' : ''}`}
                        onClick={(e) => {
                          e.preventDefault()
                          switchLanguage('zh')
                        }}
                      >
                        <div className="d-flex w-100 justify-content-between">
                          <h6 className="mb-1">{t('language.zh')}</h6>
                          {language === 'zh' && <span className="badge bg-primary">{t('language.current')}</span>}
                        </div>
                      </a>
                      <a 
                        href="#" 
                        className={`list-group-item list-group-item-action ${language === 'en' ? 'active' : ''}`}
                        onClick={(e) => {
                          e.preventDefault()
                          switchLanguage('en')
                        }}
                      >
                        <div className="d-flex w-100 justify-content-between">
                          <h6 className="mb-1">{t('language.en')}</h6>
                          {language === 'en' && <span className="badge bg-primary">{t('language.current')}</span>}
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 关于我们页 */}
            {activePage === 'about' && (
              <div>
                <h2>{t('about.title')}</h2>
                <div className="card mt-4">
                  <div className="card-body">
                    <div className="setting-item p-3 border-bottom">
                      <span>{t('about.checkUpdate')}</span>
                      <button className="btn btn-link" disabled>检查</button>
                    </div>
                    <div className="setting-item p-3 border-bottom">
                      <span>{t('about.userAgreement')}</span>
                      <button className="btn btn-link" disabled>查看</button>
                    </div>
                    <div className="setting-item p-3 border-bottom">
                      <span>{t('about.privacyPolicy')}</span>
                      <button className="btn btn-link" disabled>查看</button>
                    </div>
                    <div className="setting-item p-3">
                      <span>{t('about.version')}</span>
                      <span>1.0.0</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings