import { createContext, useContext, useState, useEffect } from 'react'

const NotificationContext = createContext()

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  // Load notification state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('notificationsEnabled')
    if (savedState !== null) {
      setNotificationsEnabled(JSON.parse(savedState))
    }
  }, [])

  // Save notification state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('notificationsEnabled', JSON.stringify(notificationsEnabled))
  }, [notificationsEnabled])

  const toggleNotifications = () => {
    setNotificationsEnabled(prev => !prev)
  }

  const value = {
    notificationsEnabled,
    toggleNotifications
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
