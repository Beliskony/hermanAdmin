import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SideBar from './components/layout/SideBar'
import './App.css'
import PollPage from './pages/PollPage'
import Login from './pages/Login'

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        {/* Route publique sans sidebar */}
        <Route path='/' element={<Login />} />
        
        {/* Routes protégées avec sidebar */}
        <Route path='/*' element={
          <div className="flex">
            <SideBar 
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            
            <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
              <Routes>
                <Route path='/Polls' element={<PollPage />} />
              </Routes>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App