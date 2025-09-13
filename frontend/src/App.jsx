import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route path="/signin" element={user ? <Navigate to="/dashboard" /> : <SignIn />} />
        {/* <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignUp />} /> */}
        <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" /> : <ForgotPassword />} />
        
        {/* Protected routes */}
        <Route path="/dashboard/*" element={user ? <Dashboard /> : <Navigate to="/signin" />} />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/signin"} />} />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/signin"} />} />
      </Routes>
    </div>
  )
}

export default App

