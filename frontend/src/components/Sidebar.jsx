import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Home, 
  Upload, 
  MessageSquare, 
  Download, 
  Settings, 
  MessageCircle,
  LogOut,
  Flag
} from 'lucide-react'

export default function Sidebar() {
  const { user, signOut } = useAuth()

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: Home },
    { name: 'Upload Data', href: '/dashboard/upload', icon: Upload },
    { name: 'View Logs', href: '/dashboard/logs', icon: MessageSquare },
    { name: 'Flagged Answers', href: '/dashboard/flagged', icon: Flag },
    { name: 'Export Data', href: '/dashboard/export', icon: Download },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-6 mb-8">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gradient-to-r from-telegram-500 to-primary-500 rounded-lg flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-900">Coaching AI</h1>
              <p className="text-sm text-gray-500">Assistant Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/dashboard'}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          <div className="flex items-center mb-3">
            <div className="h-8 w-8 bg-gradient-to-r from-telegram-500 to-primary-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.user_metadata?.first_name?.[0] || user?.email?.[0] || 'U'}
              </span>
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.user_metadata?.first_name && user?.user_metadata?.last_name 
                  ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                  : user?.email || 'User'
                }
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.user_metadata?.telegram_id || 'No Telegram ID'}
              </p>
            </div>
          </div>
          
          <button
            onClick={signOut}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

