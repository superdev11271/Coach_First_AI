import { useLocation } from 'react-router-dom'
import { Bell, BellOff, Search } from 'lucide-react'
import { useNotification } from '../contexts/NotificationContext'

export default function Header() {
  const location = useLocation()
  const { notificationsEnabled, toggleNotifications } = useNotification()
  
  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/dashboard') return 'Overview'
    if (path.includes('/upload')) return 'Upload Data'
    if (path.includes('/logs')) return 'View Logs'
    if (path.includes('/export')) return 'Export Data'
    if (path.includes('/settings')) return 'Settings'
    return 'Dashboard'
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your AI Coaching Assistant
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleNotifications}
            className={`relative p-2 transition-colors duration-200 ${
              notificationsEnabled 
                ? 'text-gray-600 hover:text-gray-800' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title={notificationsEnabled ? 'Notifications enabled - Click to disable' : 'Notifications disabled - Click to enable'}
          >
            {notificationsEnabled ? (
              <Bell className="h-5 w-5" />
            ) : (
              <BellOff className="h-5 w-5" />
            )}
            {notificationsEnabled && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-green-500 rounded-full"></span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

