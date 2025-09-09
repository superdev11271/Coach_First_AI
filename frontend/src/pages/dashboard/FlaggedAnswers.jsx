import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Flag, 
  Search, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function FlaggedAnswers() {
  const { supabase } = useAuth()
  const navigate = useNavigate()
  const [flaggedAnswers, setFlaggedAnswers] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Fetch flagged answers from database
  const fetchFlaggedAnswers = useCallback(async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('flagged_answers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching flagged answers:', error)
        toast.error('Failed to load flagged answers')
        return
      }

      setFlaggedAnswers(data || [])
    } catch (error) {
      console.error('Error fetching flagged answers:', error)
      toast.error('Failed to load flagged answers')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Update flagged answer status
  const updateFlaggedAnswerStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('flagged_answers')
        .update({ status: status })
        .eq('id', id)

      if (error) {
        console.error('Error updating flagged answer:', error)
        toast.error('Failed to update flagged answer')
        return
      }

      toast.success(`Flagged answer marked as ${status}`)
      fetchFlaggedAnswers() // Refresh the list
    } catch (error) {
      console.error('Error updating flagged answer:', error)
      toast.error('Failed to update flagged answer')
    }
  }

  // Filter flagged answers based on status and search
  const getFilteredAnswers = () => {
    let filtered = flaggedAnswers

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(answer => answer.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(answer => 
        answer.question.toLowerCase().includes(query) ||
        answer.answer.toLowerCase().includes(query)
      )
    }

    return filtered
  }

  // Get paginated data
  const getPaginatedData = () => {
    const filtered = getFilteredAnswers()
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filtered.slice(startIndex, endIndex)
  }

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusConfig = {
      'not_processed': 'bg-yellow-100 text-yellow-800',
      'processed': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    }
    return statusConfig[status] || 'bg-gray-100 text-gray-800'
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'processed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // Get total pages
  const getTotalPages = () => {
    return Math.ceil(getFilteredAnswers().length / itemsPerPage)
  }

  useEffect(() => {
    fetchFlaggedAnswers()
  }, [fetchFlaggedAnswers])

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, searchQuery])

  const filteredAnswers = getFilteredAnswers()
  const paginatedAnswers = getPaginatedData()
  const totalPages = getTotalPages()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Flagged Answers</h2>
            <p className="text-gray-600">
              Review and process flagged answers that need attention.
            </p>
          </div>
          <button
            onClick={fetchFlaggedAnswers}
            disabled={loading}
            className="btn-primary flex items-center w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions or answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="not_processed">Not Processed</option>
              <option value="processed">Processed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Flagged Answers Table */}
      <div className="card">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Answer
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading flagged answers...</p>
                  </td>
                </tr>
              ) : paginatedAnswers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <Flag className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500">No flagged answers found</p>
                    <p className="text-sm text-gray-400">Try adjusting your search or filter criteria</p>
                  </td>
                </tr>
              ) : (
                paginatedAnswers.map((answer) => (
                  <tr key={answer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {answer.question}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {answer.answer}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(answer.status)}
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(answer.status)}`}>
                          {answer.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(answer.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/dashboard/flagged/${answer.id}`)}
                          className="text-primary-600 hover:text-primary-900 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {answer.status === 'not processed' && (
                          <>
                            <button
                              onClick={() => updateFlaggedAnswerStatus(answer.id, 'processed')}
                              className="text-green-600 hover:text-green-900 transition-colors"
                              title="Mark as Processed"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateFlaggedAnswerStatus(answer.id, 'rejected')}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Mark as Rejected"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAnswers.length)} of {filteredAnswers.length} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
