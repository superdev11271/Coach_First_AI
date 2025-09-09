import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Users, 
  Calendar, 
  Search, 
  MoreVertical,
  Phone,
  Clock,
  MessageSquare,
  User,
  Bot,
  RefreshCw
} from 'lucide-react'
import { getAvatarColorFromString } from '../../utils/avatarColors'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'

export default function ViewLogs() {
  const { supabase } = useAuth()
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState([])
  const [chatMessages, setChatMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)

  const periods = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
  ]

  // Fetch all unique users from chat history
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      
      // Get unique users with their latest message info
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching chat history:', error)
        toast.error('Failed to load chat history')
        return
      }

      if (data && data.length > 0) {
        // Group by user_id and get unique users
        const userMap = new Map()
        
        data.forEach(message => {
          if (!userMap.has(message.user_id)) {
            userMap.set(message.user_id, {
              user_id: message.user_id,
              chat_id: message.chat_id,
              username: message.username,
              fullname: message.fullname,
              lastMessage: message.message,
              lastMessageTime: message.created_at,
              messageCount: 1
            })
          } else {
            const user = userMap.get(message.user_id)
            user.messageCount += 1
            // Update last message if this one is more recent
            if (new Date(message.created_at) > new Date(user.lastMessageTime)) {
              user.lastMessage = message.message
              user.lastMessageTime = message.created_at
            }
          }
        })

        const uniqueUsers = Array.from(userMap.values())
        setUsers(uniqueUsers)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Fetch chat messages for a specific user
  const fetchUserMessages = useCallback(async (userId) => {
    if (!userId) return

    try {
      setLoadingMessages(true)
      
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching messages:', error)
        toast.error('Failed to load messages')
        return
      }

      setChatMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoadingMessages(false)
    }
  }, [supabase])

  // Filter users based on search query
  const filteredUsers = users.filter(user =>
    user.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Filter users based on selected period
  const getFilteredUsersByPeriod = () => {
    if (selectedPeriod === 'all') return filteredUsers

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    return filteredUsers.filter(user => {
      const lastMessageDate = new Date(user.lastMessageTime)
      
      switch (selectedPeriod) {
        case 'today':
          return lastMessageDate >= today
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          return lastMessageDate >= weekAgo
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          return lastMessageDate >= monthAgo
        default:
          return true
      }
    })
  }

  // Filter chat messages based on selected time period using useMemo for performance
  const filteredChatMessages = useMemo(() => {
    if (selectedPeriod === 'all') return chatMessages

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    return chatMessages.filter(message => {
      const messageDate = new Date(message.created_at)
      
      switch (selectedPeriod) {
        case 'today':
          return messageDate >= today
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          return messageDate >= weekAgo
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          return messageDate >= monthAgo
        case 'quarter':
          const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
          return messageDate >= quarterAgo
        case 'year':
          const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000)
          return messageDate >= yearAgo
        default:
          return true
      }
    })
  }, [chatMessages, selectedPeriod])

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))
      return `${diffInMinutes} min ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) > 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user)
    fetchUserMessages(user.user_id)
  }

  // Refresh data
  const handleRefresh = () => {
    fetchUsers()
    if (selectedUser) {
      fetchUserMessages(selectedUser.user_id)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col lg:flex-row bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Users Sidebar */}
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col h-1/2 lg:h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">Chat History</h3>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {/* Period Filter */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full input-field text-sm"
            >
              {periods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading users...</p>
            </div>
          ) : getFilteredUsersByPeriod().length === 0 ? (
            <div className="p-4 text-center">
              <Users className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No users found</p>
            </div>
          ) : (
            getFilteredUsersByPeriod().map((user) => (
              <div
                key={user.user_id}
                onClick={() => handleUserSelect(user)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedUser?.user_id === user.user_id ? 'bg-primary-50 border-primary-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className={`w-10 h-10 bg-gradient-to-r ${getAvatarColorFromString(user.username)} rounded-full flex items-center justify-center text-white font-medium`}>
                      {user.fullname.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.fullname}</p>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-500 truncate">{user.username}</p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimestamp(user.lastMessageTime)}
                      </p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {user.messageCount} msg
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-1/2 lg:h-full">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${getAvatarColorFromString(selectedUser.username)} rounded-full flex items-center justify-center text-white font-medium`}>
                    {selectedUser.fullname.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{selectedUser.fullname}</h4>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-500">{selectedUser.username}</p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {filteredChatMessages.length} of {selectedUser.messageCount} messages
                      </span>
                    </div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4 bg-gray-50">
              {loadingMessages ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading messages...</p>
                </div>
              ) : filteredChatMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">
                    {chatMessages.length === 0 ? 'No messages found' : 'No messages found for selected time period'}
                  </p>
                </div>
              ) : (
                filteredChatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                     <div className={`flex items-start space-x-2 ${
                       message.role === 'bot' ? 'max-w-full sm:max-w-2xl lg:max-w-3xl' : 'max-w-full sm:max-w-xs lg:max-w-md'
                     }`}>
                       {message.role === 'bot' && (
                         <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                           <Bot className="w-3 h-3 text-white" />
                         </div>
                       )}
                       
                       <div
                         className={`px-4 py-2 rounded-lg w-full ${
                           message.role === 'user'
                             ? 'bg-primary-600 text-white'
                             : 'bg-white text-gray-900 border border-gray-200'
                         }`}
                       >
                         {message.role === 'bot' ? (
                           <div className="text-sm prose prose-sm max-w-none w-full">
                             <ReactMarkdown
                               components={{
                                 // Custom styling for markdown elements
                                 p: ({ children }) => <p className="mb-2 last:mb-0 w-full">{children}</p>,
                                 h1: ({ children }) => <h1 className="text-lg font-bold mb-2 w-full">{children}</h1>,
                                 h2: ({ children }) => <h2 className="text-base font-bold mb-2 w-full">{children}</h2>,
                                 h3: ({ children }) => <h3 className="text-sm font-bold mb-1 w-full">{children}</h3>,
                                 ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 w-full">{children}</ul>,
                                 ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 w-full">{children}</ol>,
                                 li: ({ children }) => <li className="text-sm w-full">{children}</li>,
                                 code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono w-full break-all">{children}</code>,
                                 pre: ({ children }) => <pre className="bg-gray-100 p-2 rounded text-xs font-mono overflow-x-auto mb-2 w-full">{children}</pre>,
                                 blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-3 italic mb-2 w-full">{children}</blockquote>,
                                 strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                 em: ({ children }) => <em className="italic">{children}</em>,
                                 a: ({ children, href }) => <a href={href} className="text-blue-600 hover:underline break-all" target="_blank" rel="noopener noreferrer">{children}</a>
                               }}
                             >
                               {message.message}
                             </ReactMarkdown>
                           </div>
                         ) : (
                           <p className="text-sm whitespace-pre-line w-full">{message.message}</p>
                         )}
                         <p className={`text-xs mt-1 w-full ${
                           message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                         }`}>
                           {new Date(message.created_at).toLocaleString()}
                         </p>
                       </div>

                      {message.role === 'user' && (
                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a user</h3>
              <p className="text-gray-500">Choose a user from the list to view their chat history</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

