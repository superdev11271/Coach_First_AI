import { useState } from 'react'
import { 
  Download, 
  FileText, 
  MessageSquare, 
  Users, 
  Calendar,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Video
} from 'lucide-react'

export default function ExportData() {
  const [selectedExportType, setSelectedExportType] = useState('all')
  const [dateRange, setDateRange] = useState('month')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortColumn, setSortColumn] = useState('date')
  const [sortDirection, setSortDirection] = useState('desc')

  // Fake data for demonstration
  const uploadedData = [
    { id: 1, name: 'workout_routine.pdf', type: 'PDF', size: '2.4 MB', uploadedAt: '2024-01-15', downloads: 45, status: 'Active' },
    { id: 2, name: 'nutrition_guide.docx', type: 'DOCX', size: '1.8 MB', uploadedAt: '2024-01-14', downloads: 32, status: 'Active' },
    { id: 3, name: 'training_philosophy.txt', type: 'TXT', size: '45 KB', uploadedAt: '2024-01-13', downloads: 18, status: 'Active' },
    { id: 4, name: 'recovery_protocol.pdf', type: 'PDF', size: '3.1 MB', uploadedAt: '2024-01-12', downloads: 67, status: 'Active' },
    { id: 5, name: 'supplement_guide.pdf', type: 'PDF', size: '1.2 MB', uploadedAt: '2024-01-11', downloads: 89, status: 'Active' },
    { id: 6, name: 'injury_prevention.docx', type: 'DOCX', size: '2.7 MB', uploadedAt: '2024-01-10', downloads: 23, status: 'Active' },
  ]

  const videoLinksData = [
    { id: 1, url: 'https://youtube.com/watch?v=abc123', status: 'processed', addedAt: '2024-01-15' },
    { id: 2, url: 'https://vimeo.com/123456789', status: 'processing', addedAt: '2024-01-14' },
    { id: 3, url: 'https://youtube.com/watch?v=def456', status: 'pending', addedAt: '2024-01-13' },
    { id: 4, url: 'https://youtube.com/watch?v=ghi789', status: 'failed', addedAt: '2024-01-12' },
    { id: 5, url: 'https://vimeo.com/987654321', status: 'processed', addedAt: '2024-01-11' },
  ]

  const chatHistory = [
    { id: 1, user: 'John Doe', telegramId: '@johndoe', messageCount: 156, lastActivity: '2024-01-15', totalTime: '2h 34m', status: 'Active' },
    { id: 2, user: 'Jane Smith', telegramId: '@janesmith', messageCount: 89, lastActivity: '2024-01-14', totalTime: '1h 45m', status: 'Active' },
    { id: 3, user: 'Mike Johnson', telegramId: '@mikejohnson', messageCount: 234, lastActivity: '2024-01-13', totalTime: '4h 12m', status: 'Inactive' },
    { id: 4, user: 'Sarah Wilson', telegramId: '@sarahwilson', messageCount: 67, lastActivity: '2024-01-12', totalTime: '1h 23m', status: 'Active' },
    { id: 5, user: 'Alex Brown', telegramId: '@alexbrown', messageCount: 198, lastActivity: '2024-01-11', totalTime: '3h 56m', status: 'Active' },
    { id: 6, user: 'Emily Davis', telegramId: '@emilydavis', messageCount: 45, lastActivity: '2024-01-10', totalTime: '45m', status: 'Inactive' },
  ]

  const exportTypes = [
    { value: 'all', label: 'All Data', icon: Download },
    { value: 'files', label: 'Uploaded Files', icon: FileText },
    { value: 'videolinks', label: 'Video Links', icon: Video },
    { value: 'chats', label: 'Chat History', icon: MessageSquare },
    { value: 'users', label: 'User Analytics', icon: Users },
  ]

  const dateRanges = [
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
    { value: 'quarter', label: 'Last Quarter' },
    { value: 'year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' },
  ]

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (column) => {
    if (sortColumn !== column) return null
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  const filteredUploadedData = uploadedData.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredVideoLinksData = videoLinksData.filter(item =>
    item.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.status.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredChatHistory = chatHistory.filter(item =>
    item.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.telegramId.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status) => {
    const statusConfig = {
      'processed': 'bg-green-100 text-green-800',
      'processing': 'bg-blue-100 text-blue-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'failed': 'bg-red-100 text-red-800',
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-gray-100 text-gray-800'
    }
    
    return statusConfig[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Export Controls */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Data</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Type</label>
            <select
              value={selectedExportType}
              onChange={(e) => setSelectedExportType(e.target.value)}
              className="input-field"
            >
              {exportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="input-field"
            >
              {dateRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button className="btn-primary w-full flex items-center justify-center">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Download className="w-5 h-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">Export Options</h4>
              <p className="text-sm text-blue-700 mt-1">
                Choose your export format: CSV, Excel, or JSON. Data will be processed and downloaded automatically.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded Data Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Uploaded Content</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    File Name
                    {getSortIcon('name')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center">
                    Type
                    {getSortIcon('type')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('size')}
                >
                  <div className="flex items-center">
                    Size
                    {getSortIcon('size')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Upload Date
                    {getSortIcon('date')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('downloads')}
                >
                  <div className="flex items-center">
                    Downloads
                    {getSortIcon('downloads')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUploadedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.size}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.uploadedAt}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.downloads}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Video Links Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Video Links</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search video links..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('url')}
                >
                  <div className="flex items-center">
                    Video URL
                    {getSortIcon('url')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {getSortIcon('status')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Added Date
                    {getSortIcon('date')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVideoLinksData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Video className="w-4 h-4 text-red-500 mr-2" />
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600">
                          {item.url}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.addedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredVideoLinksData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Video className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>No video links found</p>
            <p className="text-sm">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* Chat History Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Chat History Summary</h3>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">Showing all conversations</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telegram ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Messages
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredChatHistory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.user}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.telegramId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.messageCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.lastActivity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.totalTime}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Summary */}
      <div className="card bg-gradient-to-r from-telegram-50 to-primary-50">
        <div className="text-center">
          <Download className="mx-auto h-12 w-12 text-primary-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Export?</h3>
          <p className="text-gray-600 mb-4">
            Export your coaching data for analysis, reporting, or backup purposes.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button className="btn-primary">
              <Download className="w-4 h-4 mr-2" />
              Export All Data
            </button>
            <button className="btn-secondary">
              <FileText className="w-4 h-4 mr-2" />
              Export Files Only
            </button>
            <button className="btn-secondary">
              <Video className="w-4 h-4 mr-2" />
              Export Video Links Only
            </button>
            <button className="btn-secondary">
              <MessageSquare className="w-4 h-4 mr-2" />
              Export Chats Only
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

