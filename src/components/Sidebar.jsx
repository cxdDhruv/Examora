import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    LayoutDashboard, FileUp, ClipboardList, BarChart3,
    Settings, ChevronLeft, Book, Users, Shield, PanelLeftClose, PanelLeft
} from 'lucide-react'
import './Sidebar.css'

const teacherLinks = [
    { to: '/teacher', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/teacher/upload', icon: FileUp, label: 'Upload & Generate' },
    { to: '/teacher/exam-builder', icon: ClipboardList, label: 'Exam Builder' },
    { to: '/teacher/analytics', icon: BarChart3, label: 'Analytics' },
]

const studentLinks = [
    { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/exam/demo', icon: Book, label: 'Take Exam' },
]

const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin', icon: Users, label: 'Users' },
    { to: '/admin', icon: Shield, label: 'Security' },
    { to: '/admin', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ role = 'teacher' }) {
    const [collapsed, setCollapsed] = useState(false)
    const location = useLocation()

    const links = role === 'admin' ? adminLinks : role === 'student' ? studentLinks : teacherLinks

    return (
        <>
            <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-top">
                    <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
                    </button>
                </div>
                <nav className="sidebar-nav">
                    {links.map((link, i) => {
                        const Icon = link.icon
                        const active = location.pathname === link.to
                        return (
                            <Link key={i} to={link.to} className={`sidebar-link ${active ? 'active' : ''}`} title={link.label}>
                                <Icon size={20} />
                                {!collapsed && <span>{link.label}</span>}
                            </Link>
                        )
                    })}
                </nav>
            </aside>

            {/* Mobile bottom nav */}
            <nav className="bottom-nav">
                {links.slice(0, 4).map((link, i) => {
                    const Icon = link.icon
                    const active = location.pathname === link.to
                    return (
                        <Link key={i} to={link.to} className={`bottom-nav-item ${active ? 'active' : ''}`}>
                            <Icon size={20} />
                            <span>{link.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </>
    )
}
