import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/auth.service'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ttm_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('ttm_token'))
  const [loading, setLoading] = useState(true)

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const res = await authService.getMe()
        setUser(res.data.data.user)
        localStorage.setItem('ttm_user', JSON.stringify(res.data.data.user))
      } catch {
        logout()
      } finally {
        setLoading(false)
      }
    }
    verifyToken()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback((userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('ttm_user', JSON.stringify(userData))
    localStorage.setItem('ttm_token', authToken)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('ttm_user')
    localStorage.removeItem('ttm_token')
  }, [])

  const isAdmin = user?.role === 'admin'
  const isMember = user?.role === 'member'

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin, isMember }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
