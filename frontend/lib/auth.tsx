'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { login as mcpLogin, setJwt, clearSession, type StudentInfo } from './mcp'

interface AuthState {
  token: string | null
  student: StudentInfo | null
  loading: boolean
}

interface AuthContextType extends AuthState {
  login: (studentId: string) => Promise<void>
  logout: () => void
  studentId: string | null
}

const AuthContext = createContext<AuthContextType>({
  token: null, student: null, loading: true,
  login: async () => {}, logout: () => {},
  studentId: null,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ token: null, student: null, loading: true })

  useEffect(() => {
    const token = localStorage.getItem('campusmind_token')
    const studentJson = localStorage.getItem('campusmind_student')
    if (token && studentJson) {
      try {
        const student = JSON.parse(studentJson)
        setJwt(token)
        setState({ token, student, loading: false })
      } catch {
        setState({ token: null, student: null, loading: false })
      }
    } else {
      setState({ token: null, student: null, loading: false })
    }
  }, [])

  const login = useCallback(async (studentId: string) => {
    const result = await mcpLogin(studentId)
    if (result.ok) {
      localStorage.setItem('campusmind_student', JSON.stringify(result.student))
      setState({ token: result.token, student: result.student, loading: false })
    } else {
      throw new Error(result.message || 'Login failed')
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('campusmind_token')
    localStorage.removeItem('campusmind_student')
    clearSession()
    setState({ token: null, student: null, loading: false })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout, studentId: state.student?.id ?? null }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !token) {
      router.replace('/login')
    }
  }, [loading, token, router])

  if (loading) return null
  if (!token) return null

  return <>{children}</>
}

const PUBLIC_PATHS = ['/', '/login', '/login/']

export function AuthGuard({ children }: { children: ReactNode }) {
  const { loading } = useAuth()
  const pathname = usePathname()

  if (PUBLIC_PATHS.includes(pathname)) return <>{children}</>
  if (loading) return null

  return <ProtectedRoute>{children}</ProtectedRoute>
}
