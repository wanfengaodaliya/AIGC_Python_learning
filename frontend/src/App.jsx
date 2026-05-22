import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Auth from './pages/Auth.jsx'
import ClassSelection from './pages/ClassSelection.jsx'
import Settings from './pages/Settings.jsx'
import AIchat from './pages/AIchat.jsx'
import Layout from './components/Layout.jsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/app" element={<Layout />}>
          <Route path="class-selection" element={<ClassSelection />} />
          <Route path="settings" element={<Settings />} />
          <Route path="ai-chat" element={<AIchat />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App