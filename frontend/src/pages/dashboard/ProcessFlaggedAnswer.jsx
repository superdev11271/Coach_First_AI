import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import {
    ArrowLeft,
    Flag,
    CheckCircle,
    XCircle,
    Edit3,
    Trash2,
    Plus,
    Save,
    X,
    FileText,
    Clock
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProcessFlaggedAnswer() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { supabase, user } = useAuth()
    const [flaggedAnswer, setFlaggedAnswer] = useState(null)
    const [documents, setDocuments] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingDocument, setEditingDocument] = useState(null)
    const [newDocumentContent, setNewDocumentContent] = useState('')
    const [showAddDocument, setShowAddDocument] = useState(false)

    // Fetch flagged answer with documents
    const fetchFlaggedAnswer = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .rpc('get_flagged_answer', { flagged_id: id })

            if (error) {
                console.error('Error fetching flagged answer:', error)
                toast.error('Failed to load flagged answer')
                return
            }
            if (data) {
                const result = data
                setFlaggedAnswer(result)
                setDocuments(result.documents || [])
            } else {
                toast.error('Flagged answer not found')
                navigate('/dashboard/flagged')
            }
        } catch (error) {
            console.error('Error fetching flagged answer:', error)
            toast.error('Failed to load flagged answer')
        } finally {
            setLoading(false)
        }
    }
    const updateFlaggedEmbedding = async (documentId) => {
        try {
            const response = await axios.post(import.meta.env.VITE_FLASK_BACKEND_URL + '/update-embedding', {
                document_id: documentId
            })

            if (response.status !== 200) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
        } catch (error) {
            console.error('Error updating flagged answer:', error)
            toast.error(`Failed to Document content updated`)
        }
    }
    // Update flagged answer status
    const updateFlaggedAnswerStatus = async (status) => {
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

            toast.success(`Flagged answer marked as ${status.replace('_', ' ')}`)
            setFlaggedAnswer(prev => ({ ...prev, status }))
        } catch (error) {
            console.error('Error updating flagged answer:', error)
            toast.error('Failed to update flagged answer')
        }
    }



    // Add new document
    const addDocument = async () => {
        if (!newDocumentContent.trim()) {
            toast.error('Please enter document content')
            return
        }

        try {
            // Insert new document
            const { data: newDoc, error: docError } = await supabase
                .from('documents')
                .insert({ content: newDocumentContent.trim(), file_type: "flagged", user_id: user.id, chunk_index: documents.length })
                .select()
                .single()

            if (docError) {
                console.error('Error creating document:', docError)
                toast.error('Failed to create document')
                return
            }

            // Update flagged answer with new document ID
            const currentDocIds = flaggedAnswer.document_ids || []
            const updatedDocIds = [...currentDocIds, newDoc.id]

            const { error: updateError } = await supabase
                .from('flagged_answers')
                .update({ document_ids: updatedDocIds })
                .eq('id', id)
            updateFlaggedEmbedding(newDoc.id)
            if (updateError) {
                console.error('Error updating flagged answer:', updateError)
                toast.error('Failed to link document to flagged answer')
                return
            }

            // Update local state
            setDocuments(prev => [...prev, newDoc])
            setFlaggedAnswer(prev => ({ ...prev, document_ids: updatedDocIds }))
            setNewDocumentContent('')
            setShowAddDocument(false)
            toast.success('Document added successfully')
        } catch (error) {
            console.error('Error adding document:', error)
            toast.error('Failed to add document')
        }
    }

    // Update document content
    const updateDocument = async (docId, newContent) => {
        if (!newContent.trim()) {
            toast.error('Please enter document content')
            return
        }

        try {
            const { error } = await supabase
                .from('documents')
                .update({ content: newContent.trim() })
                .eq('id', docId)

            if (error) {
                console.error('Error updating document:', error)
                toast.error('Failed to update document')
                return
            }
            updateFlaggedEmbedding(docId)

            // Update local state
            setDocuments(prev =>
                prev.map(doc =>
                    doc.id === docId ? { ...doc, content: newContent.trim() } : doc
                )
            )
            setEditingDocument(null)
            toast.success('Document updated successfully')
        } catch (error) {
            console.error('Error updating document:', error)
            toast.error('Failed to update document')
        }
    }

    // Remove document
    const removeDocument = async (docId) => {
        if (!confirm('Are you sure you want to remove this document?')) {
            return
        }

        try {
            // Remove document from flagged answer's document_ids array
            const currentDocIds = flaggedAnswer.document_ids || []
            const updatedDocIds = currentDocIds.filter(id => id !== docId)

            const { error: updateError } = await supabase
                .from('flagged_answers')
                .update({ document_ids: updatedDocIds })
                .eq('id', id)

            if (updateError) {
                console.error('Error updating flagged answer:', updateError)
                toast.error('Failed to remove document from flagged answer')
                return
            }

            // Delete the document
            const { error: deleteError } = await supabase
                .from('documents')
                .delete()
                .eq('id', docId)

            if (deleteError) {
                console.error('Error deleting document:', deleteError)
                toast.error('Failed to delete document')
                return
            }

            // Update local state
            setDocuments(prev => prev.filter(doc => doc.id !== docId))
            setFlaggedAnswer(prev => ({ ...prev, document_ids: updatedDocIds }))
            toast.success('Document removed successfully')
        } catch (error) {
            console.error('Error removing document:', error)
            toast.error('Failed to remove document')
        }
    }

    // Get status badge styling
    const getStatusBadge = (status) => {
        const statusConfig = {
            'not processed': 'bg-yellow-100 text-yellow-800',
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

    useEffect(() => {
        if (id) {
            fetchFlaggedAnswer()
        }
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    if (!flaggedAnswer) {
        return (
            <div className="text-center py-12">
                <Flag className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">Flagged answer not found</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="card">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/dashboard/flagged')}
                            className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Process Flagged Answer</h2>
                            <p className="text-gray-600">Review and manage flagged answer content</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {getStatusIcon(flaggedAnswer.status)}
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(flaggedAnswer.status)}`}>
                            {flaggedAnswer.status.replace('_', ' ')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Question and Answer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Question</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-900 whitespace-pre-line">{flaggedAnswer.question}</p>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Answer</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-900 whitespace-pre-line">{flaggedAnswer.answer}</p>
                    </div>
                </div>
            </div>

            {/* Documents Section */}
            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Related Documents</h3>
                    {flaggedAnswer.status === 'not processed' && (
                        <button
                            onClick={() => setShowAddDocument(true)}
                            className="btn-primary flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Document
                        </button>
                    )}
                </div>

                {/* Add Document Form */}
                {showAddDocument && (
                    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Document</h4>
                        <textarea
                            value={newDocumentContent}
                            onChange={(e) => setNewDocumentContent(e.target.value)}
                            placeholder="Enter document content..."
                            rows={4}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-3"
                        />
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={addDocument}
                                className="btn-primary flex items-center"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save Document
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddDocument(false)
                                    setNewDocumentContent('')
                                }}
                                className="btn-secondary flex items-center"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Documents List */}
                {documents.length === 0 ? (
                    <div className="text-center py-8">
                        <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-gray-500">No documents found</p>
                        <p className="text-sm text-gray-400">Add documents to provide additional context</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {documents.map((document) => {
                            if (document.id == null) {
                                return ""
                            }
                            return (
                                <div key={document.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <FileText className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700">Document #{document.id}</span>
                                        </div>
                                        {flaggedAnswer.status === 'not processed' && (
                                            <div className="flex items-center space-x-2">
                                                {editingDocument === document.id ? (
                                                    <>
                                                        <button
                                                            onClick={() => updateDocument(document.id, document.content)}
                                                            className="text-green-600 hover:text-green-900 transition-colors"
                                                            title="Save Changes"
                                                        >
                                                            <Save className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingDocument(null)}
                                                            className="text-gray-600 hover:text-gray-900 transition-colors"
                                                            title="Cancel"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => setEditingDocument(document.id)}
                                                            className="text-blue-600 hover:text-blue-900 transition-colors"
                                                            title="Edit Document"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => removeDocument(document.id)}
                                                            className="text-red-600 hover:text-red-900 transition-colors"
                                                            title="Remove Document"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {editingDocument === document.id ? (
                                        <textarea
                                            defaultValue={document.content}
                                            onChange={(e) => {
                                                // Update the document content in local state for preview
                                                setDocuments(prev =>
                                                    prev.map(doc =>
                                                        doc.id === document.id ? { ...doc, content: e.target.value } : doc
                                                    )
                                                )
                                            }}
                                            rows={6}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            autoFocus
                                        />
                                    ) : (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-900 whitespace-pre-line">{document.content}</p>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            {flaggedAnswer.status === 'not processed' && (
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Process Flagged Answer</h3>
                            <p className="text-gray-600">Mark this flagged answer as processed or rejected</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => updateFlaggedAnswerStatus('rejected')}
                                className="btn-secondary flex items-center"
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Mark as Rejected
                            </button>
                            <button
                                onClick={() => updateFlaggedAnswerStatus('processed')}
                                className="btn-primary flex items-center"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark as Processed
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Metadata */}
            <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Metadata</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Flagged Answer ID</label>
                        <p className="text-sm text-gray-900">#{flaggedAnswer.id}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                        <p className="text-sm text-gray-900">{formatDate(flaggedAnswer.created_at)}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <div className="flex items-center">
                            {getStatusIcon(flaggedAnswer.status)}
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(flaggedAnswer.status)}`}>
                                {flaggedAnswer.status.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Documents Count</label>
                        <p className="text-sm text-gray-900">{documents.length} document(s)</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
