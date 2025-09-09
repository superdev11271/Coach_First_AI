import { Toaster } from 'react-hot-toast'
import { useNotification } from '../contexts/NotificationContext'

export default function ConditionalToaster() {
  const { notificationsEnabled } = useNotification()

  if (!notificationsEnabled) {
    return null
  }

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
        },
      }}
    />
  )
}
