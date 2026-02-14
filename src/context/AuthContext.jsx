import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Load user from localStorage on mount
    useEffect(() => {
        const savedName = localStorage.getItem('user_name')
        const savedEmail = localStorage.getItem('user_email')
        if (savedName && savedEmail) {
            setUser({
                name: savedName,
                email: savedEmail,
                picture: localStorage.getItem('user_picture') || '',
                role: localStorage.getItem('user_role') || 'teacher',
            })
        }
        setLoading(false)
    }, [])

    // Login with Google credential (from @react-oauth/google)
    const loginWithGoogle = useCallback((decoded) => {
        const userData = {
            name: decoded.name,
            email: decoded.email,
            picture: decoded.picture || '',
            role: 'teacher',
        }
        setUser(userData)

        // Persist to localStorage
        localStorage.setItem('user_name', userData.name)
        localStorage.setItem('user_email', userData.email)
        localStorage.setItem('user_picture', userData.picture)
        localStorage.setItem('user_role', userData.role)
    }, [])

    // Logout
    const logout = useCallback(() => {
        setUser(null)
        localStorage.removeItem('user_name')
        localStorage.removeItem('user_email')
        localStorage.removeItem('user_picture')
        localStorage.removeItem('user_role')
    }, [])

    const value = {
        user,
        loading,
        loginWithGoogle,
        logout,
        isAuthenticated: !!user,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
