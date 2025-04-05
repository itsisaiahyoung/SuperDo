import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import TabNav from './components/TabNav'
import Todo from './components/Todo'
import Inventory from './components/Inventory'
import Shop from './components/Shop'
import Settings from './components/Settings'
import { AppProvider } from './context/AppContext'

function App() {
  const [activeTab, setActiveTab] = useState('tasks')

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'tasks':
        return <Todo />
      case 'inventory':
        return <Inventory />
      case 'shop':
        return <Shop />
      case 'settings':
        return <Settings />
      default:
        return <Todo />
    }
  }

  return (
    <AppProvider>
      <div className="app">
        <Header />
        <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="app-content">
          {renderActiveTab()}
        </main>
      </div>
    </AppProvider>
  )
}

export default App
