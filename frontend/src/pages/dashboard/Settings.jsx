import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Save, 
  Bot, 
  MessageCircle,
  Shield,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function Settings() {
  const { user, updateProfile, updatePassword, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [profileData, setProfileData] = useState({
    first_name: user?.user_metadata?.first_name || '',
    last_name: user?.user_metadata?.last_name || '',
    email: user?.email || '',
    telegram_id: user?.user_metadata?.telegram_id || ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [botSettings, setBotSettings] = useState({
    mode: user?.user_metadata?.is_bot !== false, // true for bot mode, false for direct mode
    autoResponse: true
  })
  const [originalBotSettings, setOriginalBotSettings] = useState({
    mode: user?.user_metadata?.is_bot !== false
  })
  const [botSettingsChanged, setBotSettingsChanged] = useState(false)
  const [botSettingsLoading, setBotSettingsLoading] = useState(false)

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'bot', label: 'Bot Settings', icon: Bot }
  ]

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
  }

  const handleBotSettingChange = (setting, value) => {
    const newSettings = {
      ...botSettings,
      [setting]: value
    }
    setBotSettings(newSettings)
    
    // Check if settings have changed from original
    const hasChanged = newSettings.mode !== originalBotSettings.mode || 
                      newSettings.autoResponse !== originalBotSettings.autoResponse
    setBotSettingsChanged(hasChanged)
  }

  const handleProfileSave = async () => {
    setLoading(true)
    try {
      const { error } = await updateProfile(profileData)
      if (!error) {
        toast.success('Profile updated successfully!')
      }
    } catch (error) {
      toast.error('Error updating profile')
    } finally {
      setLoading(false)
    }
  }

  const handleBotSettingsSave = async () => {
    setBotSettingsLoading(true)
    try {
      const { error } = await updateProfile({
        is_bot: botSettings.mode
      })
      axios.post(import.meta.env.VITE_FLASK_BACKEND_URL + '/api/update-bot-settings', {
        is_bot: botSettings.mode
      })
      if (!error) {
        setOriginalBotSettings({ ...botSettings })
        setBotSettingsChanged(false)
        toast.success('Bot settings updated successfully!')
      }
    } catch (error) {
      toast.error('Error updating bot settings')
    } finally {
      setBotSettingsLoading(false)
    }
  }

  const handleBotSettingsCancel = () => {
    setBotSettings({ ...originalBotSettings })
    setBotSettingsChanged(false)
  }

  const handleTabChange = async (tabId) => {
    setActiveTab(tabId)
    
    // Fetch fresh profile data when Bot settings tab is clicked
    if (tabId === 'bot') {
      try {
        const refreshedUser = await refreshUser()
        if (refreshedUser) {
          // Update bot settings with fresh data
          const freshBotSettings = {
            mode: refreshedUser.user_metadata?.is_bot !== false,
            autoResponse: true
          }
          setBotSettings(freshBotSettings)
          setOriginalBotSettings({
            mode: refreshedUser.user_metadata?.is_bot !== false
          })
          setBotSettingsChanged(false)
        }
      } catch (error) {
        console.error('Error refreshing user data:', error)
        toast.error('Failed to refresh profile data')
      }
    }
  }

  const handlePasswordSave = async () => {
    // Validate current password is provided
    if (!passwordData.currentPassword.trim()) {
      toast.error('Please enter your current password')
      return
    }

    // Validate new passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    // Validate new password length
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    // Validate new password is different from current
    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('New password must be different from current password')
      return
    }

    setPasswordLoading(true)
    try {
      const { error } = await updatePassword(passwordData.currentPassword, passwordData.newPassword)
      if (!error) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        toast.success('Password updated successfully!')
      }
    } catch (error) {
      toast.error('Error updating password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="first_name"
                value={profileData.first_name}
                onChange={handleProfileChange}
                className="input-field pl-10"
                placeholder="Enter first name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="last_name"
                value={profileData.last_name}
                onChange={handleProfileChange}
                className="input-field pl-10"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={profileData.email}
                disabled={true}
                onChange={handleProfileChange}
                className="input-field pl-10"
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telegram ID
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="telegram_id"
                value={profileData.telegram_id}
                onChange={handleProfileChange}
                className="input-field pl-10"
                placeholder="e.g., @username or +1234567890"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleProfileSave}
            disabled={loading}
            className="btn-primary flex items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="input-field pl-10"
                placeholder="Enter current password"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="input-field pl-10"
                placeholder="Enter new password"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="input-field pl-10"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handlePasswordSave}
              disabled={passwordLoading}
              className="btn-primary flex items-center"
            >
              {passwordLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderBotTab = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Bot Configuration</h3>
        
        <div className="space-y-6">
          {/* Bot Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Bot Mode</label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="botMode"
                  value="bot"
                  checked={botSettings.mode}
                  onChange={() => handleBotSettingChange('mode', true)}
                  className="mr-3 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex items-center">
                  <Bot className="w-5 h-5 text-primary-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">Bot Mode (Default)</span>
                  <span className="ml-2 text-xs text-gray-500">AI responds automatically</span>
                </div>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="botMode"
                  value="direct"
                  checked={botSettings.mode === false}
                  onChange={() => handleBotSettingChange('mode', false)}
                  className="mr-3 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex items-center">
                  <MessageCircle className="w-5 h-5 text-telegram-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">Direct Mode</span>
                  <span className="ml-2 text-xs text-gray-500">You respond manually</span>
                </div>
              </label>
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          {botSettingsChanged && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                <button
                  onClick={handleBotSettingsCancel}
                  className="btn-secondary flex items-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleBotSettingsSave}
                  disabled={botSettingsLoading}
                  className="btn-primary flex items-center"
                >
                  {botSettingsLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )


  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab()
      case 'security':
        return renderSecurityTab()
      case 'bot':
        return renderBotTab()
      default:
        return renderProfileTab()
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
        <p className="text-gray-600">
          Manage your account settings, security preferences, and bot configuration.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <div className="card">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="mr-3 h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

