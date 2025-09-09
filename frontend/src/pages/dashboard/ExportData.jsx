import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Download, 
  FileText, 
  MessageSquare, 
  Calendar,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Video
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ExportData() {
  const { supabase } = useAuth()
  const [selectedExportType, setSelectedExportType] = useState('files')
  const [dateRange, setDateRange] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortColumn, setSortColumn] = useState('date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [loading, setLoading] = useState(false)
  const [filesData, setFilesData] = useState([])
  const [videoLinksData, setVideoLinksData] = useState([])
  const [videoLinksLoading, setVideoLinksLoading] = useState(false)
  const [chatHistoryData, setChatHistoryData] = useState([])
  const [chatHistoryLoading, setChatHistoryLoading] = useState(false)

  // Calculate date range for filtering
  const getDateRange = () => {
    const now = new Date()
    let startDate = new Date()

    switch (dateRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'all':
      default:
        return null // No date filter for 'all'
    }

    return {
      start: startDate.toISOString(),
      end: now.toISOString()
    }
  }

  // Fetch files data from Supabase
  const fetchFilesData = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('files')
        .select('id, original_name, file_type, file_size, public_url, created_at, status')
        .order('created_at', { ascending: false })

      // Apply date range filter if selected
      const dateFilter = getDateRange()
      if (dateFilter) {
        query = query
          .gte('created_at', dateFilter.start)
          .lte('created_at', dateFilter.end)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching files:', error)
        toast.error('Failed to load files data')
        return
      }

      setFilesData(data || [])
    } catch (error) {
      console.error('Error fetching files:', error)
      toast.error('Failed to load files data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch video links data from Supabase
  const fetchVideoLinksData = async () => {
    try {
      setVideoLinksLoading(true)
      let query = supabase
        .from('videolinks')
        .select('id, url, status, created_at')
        .order('created_at', { ascending: false })

      // Apply date range filter if selected
      const dateFilter = getDateRange()
      if (dateFilter) {
        query = query
          .gte('created_at', dateFilter.start)
          .lte('created_at', dateFilter.end)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching video links:', error)
        toast.error('Failed to load video links data')
        return
      }

      setVideoLinksData(data || [])
    } catch (error) {
      console.error('Error fetching video links:', error)
      toast.error('Failed to load video links data')
    } finally {
      setVideoLinksLoading(false)
    }
  }

  // Fetch chat history data from Supabase
  const fetchChatHistoryData = async () => {
    try {
      setChatHistoryLoading(true)
      let query = supabase
        .from('chat_history')
        .select('id, fullname, username, role, message, created_at')
        .order('created_at', { ascending: false })

      // Apply date range filter if selected
      const dateFilter = getDateRange()
      if (dateFilter) {
        query = query
          .gte('created_at', dateFilter.start)
          .lte('created_at', dateFilter.end)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching chat history:', error)
        toast.error('Failed to load chat history data')
        return
      }

      setChatHistoryData(data || [])
    } catch (error) {
      console.error('Error fetching chat history:', error)
      toast.error('Failed to load chat history data')
    } finally {
      setChatHistoryLoading(false)
    }
  }

  // Fake data for demonstration
  const uploadedData = [
    { id: 1, name: 'workout_routine.pdf', type: 'PDF', size: '2.4 MB', uploadedAt: '2024-01-15', downloads: 45, status: 'Active' },
    { id: 2, name: 'nutrition_guide.docx', type: 'DOCX', size: '1.8 MB', uploadedAt: '2024-01-14', downloads: 32, status: 'Active' },
    { id: 3, name: 'training_philosophy.txt', type: 'TXT', size: '45 KB', uploadedAt: '2024-01-13', downloads: 18, status: 'Active' },
    { id: 4, name: 'recovery_protocol.pdf', type: 'PDF', size: '3.1 MB', uploadedAt: '2024-01-12', downloads: 67, status: 'Active' },
    { id: 5, name: 'supplement_guide.pdf', type: 'PDF', size: '1.2 MB', uploadedAt: '2024-01-11', downloads: 89, status: 'Active' },
    { id: 6, name: 'injury_prevention.docx', type: 'DOCX', size: '2.7 MB', uploadedAt: '2024-01-10', downloads: 23, status: 'Active' },
  ]



  const exportTypes = [
    { value: 'files', label: 'Uploaded Files', icon: FileText },
    { value: 'videolinks', label: 'Video Links', icon: Video },
    { value: 'chats', label: 'Chat History', icon: MessageSquare },
  ]

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
    { value: 'quarter', label: 'Last Quarter' },
    { value: 'year', label: 'Last Year' },
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

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const filteredUploadedData = filesData.filter(item =>
    item.original_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.file_type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredVideoLinksData = videoLinksData.filter(item =>
    item.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.status.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredChatHistory = chatHistoryData.filter(item =>
    item.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.message.toLowerCase().includes(searchQuery.toLowerCase())
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processed':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      case 'processing':
        return <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      case 'pending':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
      case 'failed':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
    }
  }

  const getRoleBadge = (role) => {
    const roleConfig = {
      'user': 'bg-blue-100 text-blue-800',
      'assistant': 'bg-green-100 text-green-800',
      'system': 'bg-gray-100 text-gray-800'
    }
    return roleConfig[role] || 'bg-gray-100 text-gray-800'
  }

  // CSV Export Functions
  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) {
      toast.error('No data to export')
      return
    }

    // Get headers from the first object
    const headers = Object.keys(data[0])
    
    // Create CSV content
    const csvContent = [
      // Headers row
      headers.join(','),
      // Data rows
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Escape values that contain commas, quotes, or newlines
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value || ''
        }).join(',')
      )
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success(`Exported ${data.length} records to ${filename}`)
  }

  const exportFilesToCSV = () => {
    const exportData = filteredUploadedData.map(item => ({
      'File Name': item.original_name,
      'File Type': item.file_type,
      'File Size (bytes)': item.file_size,
      'File Size (formatted)': formatFileSize(item.file_size),
      'Status': item.status,
      'Upload Date': formatDate(item.created_at),
      'Public URL': item.public_url || ''
    }))
    
    const dateRangeText = dateRange === 'all' ? 'all-time' : dateRange
    downloadCSV(exportData, `files-export-${dateRangeText}-${new Date().toISOString().split('T')[0]}.csv`)
  }

  const exportVideoLinksToCSV = () => {
    const exportData = filteredVideoLinksData.map(item => ({
      'Video URL': item.url,
      'Status': item.status,
      'Added Date': formatDate(item.created_at)
    }))
    
    const dateRangeText = dateRange === 'all' ? 'all-time' : dateRange
    downloadCSV(exportData, `video-links-export-${dateRangeText}-${new Date().toISOString().split('T')[0]}.csv`)
  }

  const exportChatHistoryToCSV = () => {
    const exportData = filteredChatHistory.map(item => ({
      'Full Name': item.fullname,
      'Username': item.username,
      'Role': item.role,
      'Message': item.message,
      'Created Date': formatDate(item.created_at)
    }))
    
    const dateRangeText = dateRange === 'all' ? 'all-time' : dateRange
    downloadCSV(exportData, `chat-history-export-${dateRangeText}-${new Date().toISOString().split('T')[0]}.csv`)
  }

  const handleExportData = () => {
    switch (selectedExportType) {
      case 'files':
        exportFilesToCSV()
        break
      case 'videolinks':
        exportVideoLinksToCSV()
        break
      case 'chats':
        exportChatHistoryToCSV()
        break
      default:
        toast.error('Please select an export type')
    }
  }

  // Fetch data on component mount and when date range changes
  useEffect(() => {
    if (selectedExportType === 'files') {
      fetchFilesData()
    } else if (selectedExportType === 'videolinks') {
      fetchVideoLinksData()
    } else if (selectedExportType === 'chats') {
      fetchChatHistoryData()
    }
  }, [selectedExportType, dateRange])

  return (
    <div className="space-y-6">
      {/* Export Controls */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Data</h3>
        
        <div className="flex flex-col gap-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Export Type</label>
              <select
                value={selectedExportType}
                onChange={(e) => setSelectedExportType(e.target.value)}
                className="input-field w-full"
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
                className="input-field w-full"
              >
                {dateRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${selectedExportType}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button 
                onClick={handleExportData}
                className="btn-primary w-full sm:w-auto flex items-center justify-center px-6"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </button>
            </div>
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

      {/* Conditional Data Tables */}
      {selectedExportType === 'files' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Uploaded Files</h3>
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

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-2 text-gray-600">Loading files...</span>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('original_name')}
                    >
                      <div className="flex items-center">
                        File Name
                        {getSortIcon('original_name')}
                      </div>
                    </th>
                    <th 
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('file_type')}
                    >
                      <div className="flex items-center">
                        Type
                        {getSortIcon('file_type')}
                      </div>
                    </th>
                    <th 
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('file_size')}
                    >
                      <div className="flex items-center">
                        Size
                        {getSortIcon('file_size')}
                      </div>
                    </th>
                    <th 
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center">
                        Upload Date
                        {getSortIcon('created_at')}
                      </div>
                    </th>
                    <th 
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        Status
                        {getSortIcon('status')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUploadedData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p>No files found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUploadedData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.original_name}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.file_type}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatFileSize(item.file_size)}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.created_at)}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(item.status)}
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.public_url && (
                            <a
                              href={item.public_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-900"
                            >
                              View File
                            </a>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {selectedExportType === 'videolinks' && (
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

          {videoLinksLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-2 text-gray-600">Loading video links...</span>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('url')}
                    >
                      <div className="flex items-center">
                        Video URL
                        {getSortIcon('url')}
                      </div>
                    </th>
                    <th 
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        Status
                        {getSortIcon('status')}
                      </div>
                    </th>
                    <th 
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center">
                        Added Date
                        {getSortIcon('created_at')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVideoLinksData.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                        <Video className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p>No video links found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </td>
                    </tr>
                  ) : (
                    filteredVideoLinksData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Video className="w-4 h-4 text-red-500 mr-2" />
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600">
                                {item.url}
                              </a>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(item.status)}
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {selectedExportType === 'chats' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Chat History</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {chatHistoryLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-2 text-gray-600">Loading chat history...</span>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('fullname')}
                    >
                      <div className="flex items-center">
                        Full Name
                        {getSortIcon('fullname')}
                      </div>
                    </th>
                    <th 
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('username')}
                    >
                      <div className="flex items-center">
                        Username
                        {getSortIcon('username')}
                      </div>
                    </th>
                    <th 
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('role')}
                    >
                      <div className="flex items-center">
                        Role
                        {getSortIcon('role')}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th 
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center">
                        Created At
                        {getSortIcon('created_at')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredChatHistory.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p>No chat messages found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </td>
                    </tr>
                  ) : (
                    filteredChatHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.fullname}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">@{item.username}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(item.role)}`}>
                            {item.role}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={item.message}>
                            {item.message}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  )
}

