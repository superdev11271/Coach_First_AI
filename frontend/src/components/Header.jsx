import { useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'

export default function Header() {
  const location = useLocation()
  
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
          
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  )
}

