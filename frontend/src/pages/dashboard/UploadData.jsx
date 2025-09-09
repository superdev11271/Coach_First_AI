import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import {
  Upload,
  FileText,
  File,
  Video,
  Link as LinkIcon,
  Trash2,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

// Environment variable required:
// VITE_FLASK_BACKEND_URL=http://localhost:5000 (or your Flask backend URL)

export default function UploadData() {
  const { supabase, user } = useAuth()
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [videoLinks, setVideoLinks] = useState([])
  const [newVideoLink, setNewVideoLink] = useState('')
  const [isValidUrl, setIsValidUrl] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [existingFiles, setExistingFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingFiles, setProcessingFiles] = useState(new Set())
  const [processingVideoLinks, setProcessingVideoLinks] = useState(new Set())

  // Fetch existing files from database
  const fetchFiles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching files:', error)
        toast.error('Failed to load existing files')
      } else {
        const formattedFiles = data.map(file => ({
          id: file.id,
          name: file.original_name || file.name,
          type: file.file_type,
          size: formatFileSize(file.file_size),
          uploadedAt: new Date(file.created_at).toISOString().split('T')[0],
          status: file.status,
          publicUrl: file.public_url,
          storage_path: file.storage_path
        }))
        setExistingFiles(formattedFiles)
      }
    } catch (error) {
      console.error('Error fetching files:', error)
      toast.error('Failed to load existing files')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Fetch existing video links from database
  const fetchVideoLinks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('videolinks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching video links:', error)
        // If table doesn't exist, create it
        if (error.code === '42P01') {
          await createVideoLinksTable()
          return
        }
        toast.error('Failed to load existing video links')
      } else {
        const formattedVideoLinks = data.map(link => ({
          id: link.id,
          url: link.url,
          status: link.status,
          addedAt: new Date(link.created_at).toISOString().split('T')[0]
        }))
        setVideoLinks(formattedVideoLinks)
      }
    } catch (error) {
      console.error('Error fetching video links:', error)
      toast.error('Failed to load existing video links')
    }
  }, [supabase])

  // Create videolinks table if it doesn't exist
  const createVideoLinksTable = async () => {
    try {
      const { error } = await supabase.rpc('create_videolinks_table')
      if (error) {
        console.error('Error creating videolinks table:', error)
        // Fallback: try to create table manually
        await createVideoLinksTableManually()
      }
    } catch (error) {
      console.error('Error creating videolinks table:', error)
      await createVideoLinksTableManually()
    }
  }

  // Manual table creation fallback
  const createVideoLinksTableManually = async () => {
    try {
      // This is a fallback - in production, you should create the table via migrations
      console.log('Creating videolinks table manually...')
      // The table should be created with the following structure:
      // CREATE TABLE videolinks (
      //   id SERIAL PRIMARY KEY,
      //   url TEXT NOT NULL,
      //   status TEXT DEFAULT 'pending',
      //   created_at TIMESTAMP DEFAULT NOW()
      // );
    } catch (error) {
      console.error('Failed to create videolinks table:', error)
    }
  }

  // Call Flask backend for RAG processing
  const processFileForRAG = async (fileData) => {
    try {
      const response = await axios.post(import.meta.env.VITE_FLASK_BACKEND_URL + '/process-file', {
        file_path: fileData.publicUrl,
        file_name: fileData.name,
        file_type: fileData.type,
        file_storage_path: fileData.storage_path,
        user_id: user?.id,
        file_id: fileData.id
      })
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = response.data
      if (result.status) {
        // toast.success(`${fileData.name} sent for RAG processing successfully!`)
        // Update file status to processing
        setProcessingFiles(prev => new Set(prev).add(fileData.id))
      } else {
        toast.error(`RAG processing failed for ${fileData.name}: ${result.error || 'Unknown error'}`)
        // Update status back to failed
        await updateFileStatus(fileData.id, 'failed')
      }
    } catch (error) {
      console.error('Error calling Flask backend:', error)
      toast.error(`Failed to send ${fileData.name} for RAG processing`)
      // Update status back to failed
      await updateFileStatus(fileData.id, 'failed')
    }
  }

  const processVideoLinkForRAG = async (videoLinkData) => {
    try {
      const response = await axios.post(import.meta.env.VITE_FLASK_BACKEND_URL + '/process-video-link', {
        video_url: videoLinkData.url,
        user_id: user?.id,
        video_link_id: videoLinkData.id
      })

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = response.data
      if (result.status) {
        // toast.success(`Video link sent for RAG processing successfully!`)
        // Update video link status to processing
        setProcessingVideoLinks(prev => new Set(prev).add(videoLinkData.id))
        await updateVideoLinkStatus(videoLinkData.id, 'processing')
      } else {
        toast.error(`RAG processing failed for video link: ${result.error || 'Unknown error'}`)
        // Update status back to failed
        await updateVideoLinkStatus(videoLinkData.id, 'failed')
      }
    } catch (error) {
      console.error('Error calling Flask backend for video link:', error)
      toast.error(`Failed to send video link for RAG processing`)
      // Update status back to failed
      await updateVideoLinkStatus(videoLinkData.id, 'failed')
    }
  }

  // Update file status in database
  const updateFileStatus = async (fileId, status) => {
    try {
      const { error } = await supabase
        .from('files')
        .update({ status: status })
        .eq('id', fileId)

      if (error) {
        console.error('Error updating file status:', error)
      }
    } catch (error) {
      console.error('Error updating file status:', error)
    }
  }

  // Update video link status in database
  const updateVideoLinkStatus = async (videoLinkId, status) => {
    try {
      const { error } = await supabase
        .from('videolinks')
        .update({ status: status })
        .eq('id', videoLinkId)

      if (error) {
        console.error('Error updating video link status:', error)
      }
    } catch (error) {
      console.error('Error updating video link status:', error)
    }
  }
  // Function to handle video link RAG processing complete
  const handleVideoLinkRAGProcessingComplete = async (videoLinkId, success = true) => {
    const status = success ? 'processed' : 'failed'
    await updateVideoLinkStatus(videoLinkId, status)

    if (success) {
      toast.success('Video link RAG processing completed successfully!')
    } else {
      toast.error('Video link RAG processing failed')
    }

    // Refresh video links list to show updated status
    fetchVideoLinks()
  }

  useEffect(() => {
    fetchFiles()
    fetchVideoLinks()
  }, [fetchFiles, fetchVideoLinks])

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true)

    try {
      for (const file of acceptedFiles) {
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum size is 10MB.`)
          continue
        }

        // Create a unique file name
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('coaching-files')
          .upload(fileName, file)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          toast.error(`Failed to upload ${file.name}: ${uploadError.message}`)
          continue
        }

        // Get public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('coaching-files')
          .getPublicUrl(fileName)
        console.log(publicUrl)
        // Save file metadata to database
        const { data: dbData, error: dbError } = await supabase
          .from('files')
          .insert({
            name: file.name,
            original_name: file.name,
            storage_path: fileName,
            file_type: fileExt,
            file_size: file.size,
            public_url: publicUrl,
            status: 'processing' // Changed to processing for RAG
          })
          .select()
          .single()

        if (dbError) {
          console.error('Database error:', dbError)
          toast.error(`Failed to save metadata for ${file.name}`)
          continue
        }

        // Add to local state
        const newFile = {
          id: dbData.id,
          name: file.name,
          type: fileExt,
          size: formatFileSize(file.size),
          uploadedAt: new Date().toISOString().split('T')[0],
          status: 'processing', // Changed to processing for RAG
          publicUrl: publicUrl,
          storage_path: fileName
        }

        toast.success(`${file.name} uploaded successfully!`)

        // Send to Flask backend for RAG processing
        await processFileForRAG(newFile)
      }

      // toast.success(`${acceptedFiles.length} file(s) uploaded and sent for RAG processing!`)

      // Refresh the file list
      fetchFiles()
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Error uploading files')
    } finally {
      setUploading(false)
    }
  }, [supabase, fetchFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    }
  })

  const addVideoLink = async () => {
    if (newVideoLink.trim()) {
      try {
        // Save video link to database
        const { data: dbData, error: dbError } = await supabase
          .from('videolinks')
          .insert({
            url: newVideoLink,
            status: 'pending'
          })
          .select()
          .single()

        if (dbError) {
          console.error('Database error:', dbError)
          toast.error('Failed to save video link')
          return
        }

        const newLink = {
          id: dbData.id,
          url: newVideoLink,
          status: 'pending',
          addedAt: new Date().toISOString().split('T')[0]
        }

        setVideoLinks(prev => [...prev, newLink])
        setNewVideoLink('')
        toast.success('Video link added successfully!')

        // Process the video link for RAG
        await processVideoLinkForRAG(newLink)
      } catch (error) {
        console.error('Error adding video link:', error)
        toast.error('Failed to add video link')
      }
    }
  }

  const removeVideoLink = async (id) => {
    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('videolinks')
        .delete()
        .eq('id', id)

      if (dbError) {
        console.error('Database deletion error:', dbError)
        toast.error('Failed to delete video link')
        return
      }

      // Remove from local state
      setVideoLinks(prev => prev.filter(link => link.id !== id))
      toast.success('Video link removed')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Error deleting video link')
    }
  }

  const deleteFile = async (id) => {
    try {
      // Find the file to get its storage path
      const fileToDelete = allFiles.find(file => file.id === id)

      if (!fileToDelete) {
        toast.error('File not found')
        return
      }

      // Delete from Supabase Storage
      if (fileToDelete.storage_path) {
        const { error: storageError } = await supabase.storage
          .from('coaching-files')
          .remove([fileToDelete.storage_path])

        if (storageError) {
          console.error('Storage deletion error:', storageError)
          toast.error('Failed to delete file from storage')
          return
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', id)

      if (dbError) {
        console.error('Database deletion error:', dbError)
        toast.error('Failed to delete file metadata')
        return
      }

      // Remove from local state
      setExistingFiles(prev => prev.filter(file => file.id !== id))
      toast.success('File deleted successfully')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Error deleting file')
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />
      case 'doc':
      case 'docx': return <File className="w-5 h-5 text-blue-500" />
      case 'txt': return <FileText className="w-5 h-5 text-gray-500" />
      default: return <File className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'processing': return <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return <AlertCircle className="w-4 h-4 text-yellow-500" />
    }
  }

  const allFiles = [...existingFiles, ...uploadedFiles]

  // Validate URL in real-time
  const validateVideoUrl = (url) => {
    if (!url.trim()) {
      return false;
    }

    try {
      const urlObj = new URL(url.trim());

      // Check if it's a valid video platform URL
      const validDomains = [
        'youtube.com', 'www.youtube.com', 'youtu.be',
        'vimeo.com', 'www.vimeo.com',
        'dailymotion.com', 'www.dailymotion.com',
        'twitch.tv', 'www.twitch.tv'
      ];

      const hostname = urlObj.hostname.toLowerCase();
      const isValidVideoPlatform = validDomains.some(domain =>
        hostname === domain || hostname.endsWith('.' + domain)
      );

      return isValidVideoPlatform;
    } catch (error) {
      return false;
    }
  };

  const handleVideoLinkChange = (e) => {
    const url = e.target.value;
    setNewVideoLink(url);
    setIsValidUrl(validateVideoUrl(url));
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Files</h3>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragActive
            ? 'border-primary-400 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
            }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-gray-500 mb-4">
            or click to select files
          </p>
          <p className="text-sm text-gray-400">
            Supports PDF, Word documents, and text files (max 10MB each)
          </p>
        </div>

        {uploading && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-800">Uploading files...</span>
            </div>
          </div>
        )}
      </div>

      {/* Video Links Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Add Video Links</h3>
          <button
            onClick={fetchVideoLinks}
            className="text-sm text-primary-600 hover:text-primary-500 font-medium"
          >
            Refresh
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <input
              type="url"
              value={newVideoLink}
              onChange={handleVideoLinkChange}
              placeholder="Enter YouTube, Vimeo, or other video URL"
              className="input-field w-full"
            />
          </div>
          <button
            onClick={addVideoLink}
            disabled={!newVideoLink.trim() || !isValidUrl}
            className="btn-primary px-6 w-full sm:w-auto"
          >
            Add Link
          </button>
        </div>

        {videoLinks.length > 0 && (
          <div className="space-y-2">
            {videoLinks.map((link) => (
              <div key={link.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-3">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Video className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{link.url}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mt-1">
                      <span className="text-xs text-gray-500">Added: {link.addedAt}</span>
                      <div className="flex items-center">
                        {getStatusIcon(link.status)}
                        <span className="ml-1 text-xs text-gray-700 capitalize">{link.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">

                  <button
                    onClick={() => removeVideoLink(link.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {videoLinks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Video className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>No video links added yet</p>
            <p className="text-sm">Add your first video link to get started</p>
          </div>
        )}
      </div>

      {/* Files Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Uploaded Files</h3>
          <button
            onClick={fetchFiles}
            disabled={loading}
            className="text-sm text-primary-600 hover:text-primary-500 font-medium disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allFiles.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getFileIcon(file.type)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{file.name}</div>
                        <div className="text-sm text-gray-500">{file.type.toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {file.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {file.uploadedAt}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(file.status)}
                      <span className="ml-2 text-sm text-gray-900 capitalize">{file.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {file.publicUrl && (
                        <a
                          href={file.publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-900 transition-colors"
                          title="View/Download file"
                        >
                          <FileText className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p>Loading files...</p>
          </div>
        ) : allFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>No files uploaded yet</p>
            <p className="text-sm">Upload your first coaching material to get started</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

