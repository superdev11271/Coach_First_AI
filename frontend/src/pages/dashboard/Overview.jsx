import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Users, MessageSquare, FileText, Video, Flag, Clock, User, Upload, Download } from 'lucide-react'
import { getAvatarColorFromString } from '../../utils/avatarColors'
import toast from 'react-hot-toast'

export default function Overview() {
  const { supabase } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState([
    { name: 'Total Users', value: '0', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { name: 'Documents', value: '0', icon: FileText, color: 'from-green-500 to-emerald-500' },
    { name: 'Videos', value: '0', icon: Video, color: 'from-purple-500 to-pink-500' },
    { name: 'Flagged Answers', value: '0', icon: Flag, color: 'from-orange-500 to-red-500' },
  ])
  const [loading, setLoading] = useState(true)
  const [recentUsers, setRecentUsers] = useState([])
  const [recentChats, setRecentChats] = useState([])

  // Fetch real data from Supabase using RPC function
  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Call the RPC function to get all counts in one query
      const { data, error } = await supabase
        .rpc('get_dashboard_counts')

      if (error) {
        console.error('Error fetching dashboard counts:', error)
        toast.error('Failed to load dashboard statistics')
        return
      }

      if (data && data.length > 0) {
        const counts = data[0]
        
        // Update stats with real data from RPC
        setStats([
          { 
            name: 'Total Users', 
            value: counts.unique_users_count.toString(), 
            icon: Users, 
            color: 'from-blue-500 to-cyan-500' 
          },
          { 
            name: 'Documents', 
            value: counts.documents_count.toString(), 
            icon: FileText, 
            color: 'from-green-500 to-emerald-500' 
          },
          { 
            name: 'Videos', 
            value: counts.video_links_count.toString(), 
            icon: Video, 
            color: 'from-purple-500 to-pink-500' 
          },
          { 
            name: 'Flagged Answers', 
            value: counts.flagged_answers_count.toString(), 
            icon: Flag, 
            color: 'from-orange-500 to-red-500' 
          },
        ])
      }

    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  // Fetch recent users from chat_history
  const fetchRecentUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('user_id, username, fullname, created_at')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching recent users:', error)
        return
      }

      if (data && data.length > 0) {
        // Group by user_id and get unique users with their latest activity
        const userMap = new Map()
        
        data.forEach(message => {
          if (!userMap.has(message.user_id) || 
              new Date(message.created_at) > new Date(userMap.get(message.user_id).lastActiveRaw)) {
            userMap.set(message.user_id, {
              id: message.user_id,
              name: message.fullname,
              telegramId: message.username,
              lastActive: formatTimeAgo(message.created_at),
              lastActiveRaw: message.created_at,
              status: 'online' // You can implement real status logic here
            })
          }
        })

        // Sort by latest activity and get top 5 recent users
        const uniqueUsers = Array.from(userMap.values())
          .sort((a, b) => new Date(b.lastActiveRaw) - new Date(a.lastActiveRaw))
          .slice(0, 5)
        
        setRecentUsers(uniqueUsers)
      }
    } catch (error) {
      console.error('Error fetching recent users:', error)
    }
  }

  // Fetch recent chats from chat_history
  const fetchRecentChats = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('id, user_id, username, fullname, message, created_at')
        .eq('role', 'user') // Only user messages for recent chats
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        console.error('Error fetching recent chats:', error)
        return
      }

      if (data && data.length > 0) {
        const recentChatsData = data.map(chat => ({
          id: chat.id,
          user: chat.fullname,
          telegramId: chat.username,
          message: chat.message.length > 50 ? chat.message.substring(0, 50) + '...' : chat.message,
          time: formatTimeAgo(chat.created_at),
          unread: false // You can implement real unread logic here
        }))
        setRecentChats(recentChatsData)
      }
    } catch (error) {
      console.error('Error fetching recent chats:', error)
    }
  }

  // Format time ago helper function
  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const messageTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60))

    if (diffInMinutes < 1) {
      return 'Just now'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days} day${days > 1 ? 's' : ''} ago`
    }
  }

  useEffect(() => {
    fetchStats()
    fetchRecentUsers()
    fetchRecentChats()
  }, [])

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-shrink-0">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Recent Users */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              ))
            ) : recentUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No recent users found</p>
              </div>
            ) : (
              recentUsers.map((user) => (
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
              ))
            )}
          </div>
        </div>

        {/* Recent Chats */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h3 className="text-lg font-medium text-gray-900">Recent Chats</h3>
            <MessageSquare className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="p-3 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                  </div>
                </div>
              ))
            ) : recentChats.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No recent chats found</p>
              </div>
            ) : (
              recentChats.map((chat) => (
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
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card flex-shrink-0">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/dashboard/upload')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <Upload className="w-5 h-5 text-primary-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Upload Content</p>
              <p className="text-sm text-gray-500">Add new coaching materials</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/dashboard/logs')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-primary-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">View Logs</p>
              <p className="text-sm text-gray-500">Check conversation history</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/dashboard/flagged')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <Flag className="w-5 h-5 text-primary-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Flagged Answers</p>
              <p className="text-sm text-gray-500">Review flagged responses</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/dashboard/export')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
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

