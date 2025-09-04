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
  Bell,
  Globe
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Settings() {
  const { userProfile, updateProfile, updatePassword } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [profileData, setProfileData] = useState({
    first_name: userProfile?.first_name || '',
    last_name: userProfile?.last_name || '',
    email: userProfile?.email || '',
    telegram_id: userProfile?.telegram_id || ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [botSettings, setBotSettings] = useState({
    mode: 'bot', // 'bot' or 'direct'
    autoResponse: true,
    responseDelay: 2,
    language: 'en',
    notifications: true
  })

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'bot', label: 'Bot Settings', icon: Bot },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'general', label: 'General', icon: Globe }
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
    setBotSettings({
      ...botSettings,
      [setting]: value
    })
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

  const handlePasswordSave = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setPasswordLoading(true)
    try {
      const { error } = await updatePassword(passwordData.newPassword)
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
              Current Password
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
              New Password
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
              Confirm New Password
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
                  checked={botSettings.mode === 'bot'}
                  onChange={() => handleBotSettingChange('mode', 'bot')}
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
                  checked={botSettings.mode === 'direct'}
                  onChange={() => handleBotSettingChange('mode', 'direct')}
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

          {/* Auto Response */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={botSettings.autoResponse}
                onChange={(e) => handleBotSettingChange('autoResponse', e.target.checked)}
                className="mr-3 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-900">Enable Auto Response</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Bot will automatically respond to common questions
            </p>
          </div>

          {/* Response Delay */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Response Delay (seconds)
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={botSettings.responseDelay}
              onChange={(e) => handleBotSettingChange('responseDelay', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Instant</span>
              <span>{botSettings.responseDelay}s</span>
              <span>10s</span>
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bot Language
            </label>
            <select
              value={botSettings.language}
              onChange={(e) => handleBotSettingChange('language', e.target.value)}
              className="input-field"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={botSettings.notifications}
              onChange={(e) => handleBotSettingChange('notifications', e.target.checked)}
              className="mr-3 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-900">Enable Notifications</span>
          </label>
          
          <div className="ml-6 space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                className="mr-3 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">New user messages</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                className="mr-3 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">File upload notifications</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                className="mr-3 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">System updates</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Zone
            </label>
            <select className="input-field">
              <option value="utc">UTC</option>
              <option value="est">Eastern Time</option>
              <option value="pst">Pacific Time</option>
              <option value="gmt">GMT</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Format
            </label>
            <select className="input-field">
              <option value="mm/dd/yyyy">MM/DD/YYYY</option>
              <option value="dd/mm/yyyy">DD/MM/YYYY</option>
              <option value="yyyy-mm-dd">YYYY-MM-DD</option>
            </select>
          </div>
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
      case 'notifications':
        return renderNotificationsTab()
      case 'general':
        return renderGeneralTab()
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
                  onClick={() => setActiveTab(tab.id)}
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

