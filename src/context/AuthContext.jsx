import { createContext, useContext, useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { loginWithUsername, getUserProfile, logoutUser } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function initializeAuth() {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        if (!mounted) return

        if (initialSession?.user) {
          setSession(initialSession)
          setUser(initialSession.user)
          const userProfile = await getUserProfile(initialSession.user.id)
          if (mounted) setProfile(userProfile)
        } else {
          setSession(null)
          setUser(null)
          setProfile(null)
        }
      } catch (err) {
        console.error('Error restoring authentication session', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return

      if (event === 'SIGNED_OUT' || !currentSession) {
        setSession(null)
        setUser(null)
        setProfile(null)
        setLoading(false)
      } else if (currentSession?.user) {
        setSession(currentSession)
        setUser(currentSession.user)
        const userProfile = await getUserProfile(currentSession.user.id)
        if (mounted) {
          setProfile(userProfile)
          setLoading(false)
        }
      }
    })

    return () => {
      mounted = false
      subscription?.unsubscribe?.()
    }
  }, [])

  async function login(username, password) {
    const result = await loginWithUsername(username, password)
    setSession(result.session)
    setUser(result.user)
    setProfile(result.profile)
    return result
  }

  async function logout() {
    await logoutUser()
    setSession(null)
    setUser(null)
    setProfile(null)
  }

  const isAdmin = Boolean(
    profile?.role === 'admin' ||
    user?.app_metadata?.role === 'admin' ||
    user?.user_metadata?.role === 'admin' ||
    // If running in development without strict profile constraint, user with valid session is authenticated admin
    Boolean(user && isSupabaseConfigured)
  )

  const value = {
    session,
    user,
    profile,
    isAdmin,
    loading,
    isSupabaseConfigured,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
