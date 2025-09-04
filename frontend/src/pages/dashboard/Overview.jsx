import { Users, MessageSquare, FileText, TrendingUp, Clock, User, Upload, Download } from 'lucide-react'
import { getAvatarColorFromString } from '../../utils/avatarColors'

export default function Overview() {
  // Fake data for demonstration
  const stats = [
    { name: 'Total Users', value: '1,234', change: '+12%', changeType: 'positive', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { name: 'Active Chats', value: '89', change: '+5%', changeType: 'positive', icon: MessageSquare, color: 'from-purple-500 to-pink-500' },
    { name: 'Documents', value: '456', change: '+23%', changeType: 'positive', icon: FileText, color: 'from-green-500 to-emerald-500' },
    { name: 'Response Rate', value: '98.5%', change: '+2.1%', changeType: 'positive', icon: TrendingUp, color: 'from-orange-500 to-red-500' },
  ]

  const recentUsers = [
    { id: 1, name: 'John Doe', telegramId: '@johndoe', lastActive: '2 minutes ago', status: 'online' },
    { id: 2, name: 'Jane Smith', telegramId: '@janesmith', lastActive: '15 minutes ago', status: 'online' },
    { id: 3, name: 'Mike Johnson', telegramId: '@mikejohnson', lastActive: '1 hour ago', status: 'offline' },
    { id: 4, name: 'Sarah Wilson', telegramId: '@sarahwilson', lastActive: '2 hours ago', status: 'offline' },
  ]

  const recentChats = [
    { id: 1, user: 'John Doe', telegramId: '@johndoe', message: 'Can you help me with my workout routine?', time: '2 min ago', unread: true },
    { id: 2, user: 'Jane Smith', telegramId: '@janesmith', message: 'What should I eat before training?', time: '15 min ago', unread: false },
    { id: 3, user: 'Mike Johnson', telegramId: '@mikejohnson', message: 'How often should I rest between sets?', time: '1 hour ago', unread: false },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
                             <div className="flex-shrink-0">
                 <div className={`w-8 h-8 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                   <stat.icon className="w-5 h-5 text-white" />
                 </div>
               </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
              <div className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
            <button className="text-sm text-primary-600 hover:text-primary-500 font-medium">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="relative">
                  <div className={`w-8 h-8 bg-gradient-to-r ${getAvatarColorFromString(user.telegramId)} rounded-full flex items-center justify-center`}>
                    <span className="text-xs font-medium text-white">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                    user.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                  }`}></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.telegramId}</p>
                </div>
                <div className="text-xs text-gray-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {user.lastActive}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Chats */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Chats</h3>
            <button className="text-sm text-primary-600 hover:text-primary-500 font-medium">
              View all
            </button>
          </div>
          <div className="space-y-3">
                         {recentChats.map((chat) => (
               <div key={chat.id} className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
                 <div className="flex items-start space-x-3">
                   <div className="flex-shrink-0">
                     <div className={`w-8 h-8 bg-gradient-to-r ${getAvatarColorFromString(chat.telegramId)} rounded-full flex items-center justify-center`}>
                       <span className="text-xs font-medium text-white">
                         {chat.user.split(' ').map(n => n[0]).join('')}
                       </span>
                     </div>
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-medium text-gray-900">{chat.user}</p>
                     <p className="text-sm text-gray-600 truncate mt-1">{chat.message}</p>
                   </div>
                   <div className="flex items-center space-x-2 ml-3">
                     <span className="text-xs text-gray-400">{chat.time}</span>
                     {chat.unread && (
                       <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                     )}
                   </div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
            <Upload className="w-5 h-5 text-primary-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Upload Content</p>
              <p className="text-sm text-gray-500">Add new coaching materials</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
            <MessageSquare className="w-5 h-5 text-primary-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">View Logs</p>
              <p className="text-sm text-gray-500">Check conversation history</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
            <Download className="w-5 h-5 text-primary-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Export Data</p>
              <p className="text-sm text-gray-500">Download reports & analytics</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

