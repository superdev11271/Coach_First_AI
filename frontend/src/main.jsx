import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { NotificationProvider } from './contexts/NotificationContext.jsx'
import ConditionalToaster from './components/ConditionalToaster.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}>
    <AuthProvider>
      <NotificationProvider>
        <App />
        <ConditionalToaster />
      </NotificationProvider>
    </AuthProvider>
  </BrowserRouter>
)

