'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { apiService, User, AuthResult } from '@/lib/api-service'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (emailOrUsername: string, password: string, rememberMe?: boolean) => Promise<void>
  signup: (userData: {
    email: string
    username: string
    password: string
    firstName?: string
    lastName?: string
  }) => Promise<{ success: boolean; user?: User; error?: string; message?: string }>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  isAuthenticated: boolean
  hasRole: (role: string | string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

interface ApiResponse {
  data?: {
    user?: User
    token?: string;
  }
  user?: User
  error?: string
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const isMountedRef = useRef(true)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const clearAuthData = useCallback(() => {
    // Clear cookies (will be handled by server)
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    document.cookie = 'access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    document.cookie = 'refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    document.cookie = 'user-data=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    document.cookie = 'csrf-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('token')
      localStorage.removeItem('user_data')
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('_auth_timestamp')
    }
  }, [])

  const getCookie = useCallback((name: string): string | null => {
    if (typeof document === 'undefined') return null
    
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null
    }
    return null
  }, [])

  const checkAuth = useCallback(async () => {

    try {
      const meResult = await apiService.getMe()
      if (meResult.success && meResult.data?.user) {
        if (isMountedRef.current) {
          setUser(meResult.data.user)
        }
        return
      } else if (meResult.error === 'Unauthorized') {
        // Try refresh token
        if (process.env.NODE_ENV === 'development') {
          console.log('Received 401, attempting token refresh...')
        }
        
        try {
          const refreshResult = await apiService.refreshToken()
          if (refreshResult.success && refreshResult.data?.user) {
            if (isMountedRef.current) {
              setUser(refreshResult.data.user)
            }
            return
          }
        } catch (e) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Token refresh failed:', e)
          }
        }
      }
      
      // If we get here, auth failed
      clearAuthData()
      if (isMountedRef.current) {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // Network error: small backoff and retry once
      try {
        await new Promise(r => setTimeout(r, 250))
        const retryResult = await apiService.getMe()
        if (retryResult.success && retryResult.data?.user) {
          if (isMountedRef.current) {
            setUser(retryResult.data.user)
          }
        } else {
          clearAuthData()
          if (isMountedRef.current) {
            setUser(null)
          }
        }
      } catch (retryError) {
        console.error('Auth check retry failed:', retryError)
        clearAuthData()
        if (isMountedRef.current) {
          setUser(null)
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [clearAuthData])

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = useCallback(async (emailOrUsername: string, password: string, rememberMe = false) => {
    if (isMountedRef.current) {
      setLoading(true)
    }
    try {
      const result = await apiService.login(emailOrUsername, password, rememberMe)

      if (result.success && result.data?.user) {
        if (isMountedRef.current) {
          setUser(result.data.user)
        }
        router.push('/dashboard')
      } else {
        throw new Error(result.error || 'Login failed')
      }
    } catch (error) {
      throw error
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [router])

  const signup = useCallback(async (userData: {
    email: string
    username: string
    password: string
    firstName?: string
    lastName?: string
  }) => {
    if (isMountedRef.current) {
      setLoading(true)
    }
    try {
      const result = await apiService.register(userData)

      if (result.success && result.data?.user) {
        if (isMountedRef.current) {
          setUser(result.data.user)
        }
        return { success: true, user: result.data.user }
      } else {
        const errorMessage = result.error || result.message || 'Signup failed'
        return { success: false, error: errorMessage }
      }
    } catch (error) {
      const errorMessage = 'Network error occurred'
      console.error('Signup error:', error)
      return { success: false, error: errorMessage }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAuthData()
      if (isMountedRef.current) {
        setUser(null)
      }
      router.push('/auth/login')
    }
  }, [clearAuthData, router])

  const refreshAuth = useCallback(async () => {
    if (isMountedRef.current) {
      setLoading(true)
    }

    try {
      // Try to get current user
      const result = await apiService.getMe()
      
      if (result.success && result.data?.user) {
        if (isMountedRef.current) {
          setUser(result.data.user)
        }
        return
      }
      
      // If getMe failed, try to refresh token
      if (result.code === 'UNAUTHORIZED' || result.code === 'SESSION_EXPIRED') {
        if (process.env.NODE_ENV === 'development') {
          console.log('Access token expired, attempting refresh...')
        }
        
        const refreshResult = await apiService.refreshToken()
        
        if (refreshResult.success && refreshResult.data?.user) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Token refresh successful')
          }
          if (isMountedRef.current) {
            setUser(refreshResult.data.user)
          }
          return
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('Token refresh failed - user needs to login')
          }
        }
      }
      
      // Clear auth data on any failure
      clearAuthData()
      if (isMountedRef.current) {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      clearAuthData()
      if (isMountedRef.current) {
        setUser(null)
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [clearAuthData])

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prevUser => prevUser ? { ...prevUser, ...userData } : null)
  }, [])

  const hasRole = useCallback((roles: string | string[]): boolean => {
    if (!user) return false
    
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(user.role)
  }, [user])

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    refreshAuth,
    updateUser,
    isAuthenticated: !!user,
    hasRole,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles?: string[]
) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading, hasRole } = useAuth()
    const router = useRouter()
    const hasCheckedAuth = useRef(true)

    // useEffect(() => {
    //   if (!loading && !hasCheckedAuth.current) {
    //     hasCheckedAuth.current = true
        
    //     if (!user) {
    //       router.push('/auth/login')
    //       return
    //     }

    //     if (requiredRoles && !hasRole(requiredRoles)) {
    //       router.push('/unauthorized')
    //       return
    //     }
    //   }
    // }, [user, loading, hasRole, router])

    if (loading || (!user && !hasCheckedAuth.current)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600">Checking authentication...</div>
        </div>
      )
    }

    if (!user) {
      return null
    }

    return <Component {...props} />
  }
}