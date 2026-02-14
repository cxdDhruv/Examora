import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Brain, LogOut, Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar({ user: propUser }) {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const location = useLocation()
    const isLanding = location.pathname === '/'
    const { logout, user: authUser } = useAuth()

    // Read user info from Firebase auth context or localStorage fallback
    const user = propUser || authUser || {
        name: localStorage.getItem('user_name') || 'User',
        role: localStorage.getItem('user_role') || 'teacher',
        email: localStorage.getItem('user_email') || '',
        picture: localStorage.getItem('user_picture') || '',
    }

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const handleLogout = async () => {
        await logout()
        window.location.href = '/login'
    }

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${isLanding ? 'landing' : ''}`}>
            <div className="navbar-inner">
                <Link to="/" className="navbar-brand">
                    <img src="/logo.png" alt="Examora" className="brand-logo" style={{ height: 28, width: 'auto' }} />
                    <span className="brand-text">Examora</span>
                </Link>

                {isLanding ? (
                    <>
                        <div className={`nav-links ${mobileOpen ? 'open' : ''}`}>
                            <a href="#features" onClick={() => setMobileOpen(false)}>Features</a>
                            <a href="#modules" onClick={() => setMobileOpen(false)}>Modules</a>
                            <a href="#comparison" onClick={() => setMobileOpen(false)}>Compare</a>
                            <Link to="/login" className="btn btn-primary btn-sm" onClick={() => setMobileOpen(false)}>Sign In</Link>
                        </div>
                        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
                            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </>
                ) : (
                    <div className="navbar-actions">
                        <button className="btn-icon notification-btn">
                            <Bell size={18} />
                            <span className="notification-dot"></span>
                        </button>
                        <div className="user-menu">
                            {user.picture ? (
                                <img src={user.picture} alt={user.name} className="user-avatar-img" style={{
                                    width: 36, height: 36, borderRadius: '50%', objectFit: 'cover',
                                    border: '2px solid var(--primary-400)'
                                }} />
                            ) : (
                                <div className="user-avatar">{user.name.charAt(0)}</div>
                            )}
                            <div className="user-info">
                                <span className="user-name">{user.name}</span>
                                <span className="user-role">{user.role}</span>
                            </div>
                        </div>
                        <button className="btn-icon logout-btn" onClick={handleLogout}><LogOut size={18} /></button>
                    </div>
                )}
            </div>
        </nav>
    )
}
