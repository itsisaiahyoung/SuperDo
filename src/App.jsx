import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import TabNav from './components/TabNav'
import Todo from './components/Todo'
import Inventory from './components/Inventory'
import Shop from './components/Shop'
import Settings from './components/Settings'
import { AppProvider } from './context/AppContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthPage from './components/Auth/AuthPage'

// Inner App Component that has access to Auth Context
function AppContent() {
  const [activeTab, setActiveTab] = useState('tasks')
  const { currentUser } = useAuth()

  // If no user is logged in, show the auth page
  if (!currentUser) {
    return <AuthPage />
  }

  return (
    <div className="app-container">
      <Header />
      
      <main className="main-content">
        {activeTab === 'tasks' && <Todo />}
        {activeTab === 'inventory' && <Inventory />}
        {activeTab === 'shop' && <Shop />}
        {activeTab === 'settings' && <Settings />}
      </main>
      
      <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}

// Main App Component that provides contexts
function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  )
}

export default App
