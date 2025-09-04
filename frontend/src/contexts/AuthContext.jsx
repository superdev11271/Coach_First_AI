import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import toast from 'react-hot-toast'

// Create Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create Auth Context
const AuthContext = createContext({})

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error getting session:', error)
        toast.error('Failed to restore session')
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Sign up function
  const signUp = async (email, password, profileData = {}) => {
    try {
      setLoading(true)

      // Check if email already exists using custom RPC function
      const { data: emailAlreadyUsed, error: emailCheckErr } = await supabase
        .rpc('email_exists', { _email: email })

      if (emailCheckErr) {
        toast.error('Could not verify email. Please try again.')
        return { user: null, error: new Error('Could not verify email. Please try again.') }
      }
      
      if (emailAlreadyUsed) {
        toast.error('This email is already registered.')
        return { user: null, error: new Error('This email is already registered.') }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: profileData
        }
      })
      
      if (error) {
        toast.error(error.message)
        return { error: error.message }
      }

      if (data.user) {
        toast.success('Account created successfully! Please check your email for verification.')
        return { user: data.user, error: null }
      }

      return { user: null, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      toast.error('An unexpected error occurred during sign up')
      return { error: 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  // Sign in function
  const signIn = async (email, password) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        toast.error(error.message)
        return { error: error.message }
      }

      if (data.user) {
        toast.success('Signed in successfully!')
        return { user: data.user, error: null }
      }

      return { user: null, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('An unexpected error occurred during sign in')
      return { error: 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        toast.error(error.message)
        return { error: error.message }
      }

      toast.success('Signed out successfully')
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('An unexpected error occurred during sign out')
      return { error: 'An unexpected error occurred' }
    }
  }

  // Reset password function
  const resetPassword = async (email) => {
    try {
      setLoading(true)
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        toast.error(error.message)
        return { error: error.message }
      }

      toast.success('Password reset email sent! Please check your inbox.')
      return { error: null }
    } catch (error) {
      console.error('Reset password error:', error)
      toast.error('An unexpected error occurred while sending reset email')
      return { error: 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  // Update password function
  const updatePassword = async (newPassword) => {
    try {
      setLoading(true)
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        toast.error(error.message)
        return { error: error.message }
      }

      toast.success('Password updated successfully!')
      return { error: null }
    } catch (error) {
      console.error('Update password error:', error)
      toast.error('An unexpected error occurred while updating password')
      return { error: 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  // Update profile function
  const updateProfile = async (updates) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      })

      if (error) {
        toast.error(error.message)
        return { error: error.message }
      }

      if (data.user) {
        setUser(data.user)
        toast.success('Profile updated successfully!')
        return { user: data.user, error: null }
      }

      return { user: null, error: null }
    } catch (error) {
      console.error('Update profile error:', error)
      toast.error('An unexpected error occurred while updating profile')
      return { error: 'An unexpected error occurred' }
    } finally {
      setLoading(false)
    }
  }

  // Get user profile data
  const getUserProfile = async () => {
    try {
      if (!user) return null
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Get profile error:', error)
      return null
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    getUserProfile,
    supabase
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
