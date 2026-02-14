import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { useAuth } from '../context/AuthContext'
import { Brain, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import logo from '../assets/logo.png'
import './Auth.css'

export default function Login() {
    const { loginWithGoogle } = useAuth()
    const [error, setError] = useState('')
    const navigate = useNavigate()

    return (
        <div className="auth-page">
            <motion.div className="auth-card glass" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Link to="/" className="auth-brand">
                    <img src={logo} alt="Examora" className="brand-logo" style={{ height: 40, width: 'auto' }} />
                    <span className="brand-text">Examora</span>
                </Link>

                <h1>Welcome back</h1>
                <p className="auth-subtitle">Sign in with your Google account to continue</p>

                <div className="auth-buttons" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {error && (
                        <div style={{
                            padding: '10px 16px',
                            background: '#ffebee',
                            border: '1px solid #ffcdd2',
                            borderRadius: '8px',
                            color: '#c62828',
                            fontSize: '0.85rem',
                            textAlign: 'left'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Google Sign-In — uses @react-oauth/google with your real Client ID */}
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <GoogleLogin
                            onSuccess={credentialResponse => {
                                try {
                                    const decoded = jwtDecode(credentialResponse.credential)
                                    console.log('✅ Google Login Success:', decoded)
                                    loginWithGoogle(decoded)
                                    navigate('/teacher')
                                } catch (err) {
                                    console.error('Login Decode Error:', err)
                                    setError('Failed to process login. Please try again.')
                                }
                            }}
                            onError={() => {
                                console.log('Google Login Failed')
                                setError('Google sign-in failed. Please try again.')
                            }}
                            theme="outline"
                            shape="pill"
                            size="large"
                            width="320"
                            text="signin_with"
                        />
                    </div>

                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', margin: '8px 0' }}>
                        <span>OR</span>
                    </div>

                    {/* Student Entry */}
                    <Link to="/join" className="btn btn-primary btn-lg" style={{ width: '100%', textAlign: 'center' }}>
                        Student? Join Exam Here <ArrowRight size={18} />
                    </Link>
                </div>

                <p className="auth-footer">
                    Protected by Examora Security
                </p>
            </motion.div>
        </div>
    )
}
