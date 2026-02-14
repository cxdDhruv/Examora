import { useState } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import {
    Users, Shield, Settings, BarChart3, Search, MoreVertical,
    UserPlus, Trash2, Edit, Eye, Check, X, AlertTriangle,
    Monitor, Clock, Database
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './Dashboard.css'
import './Admin.css'

const systemStats = [
    { label: 'Total Users', value: '2,341', icon: Users, color: '#818cf8', sub: '1,890 students, 412 teachers, 39 admins' },
    { label: 'Active Exams', value: '8', icon: Monitor, color: '#22d3ee', sub: '3 live right now' },
    { label: 'Security Events', value: '247', icon: Shield, color: '#f87171', sub: '12 high-risk today' },
    { label: 'System Uptime', value: '99.8%', icon: Clock, color: '#4ade80', sub: 'Last 30 days' },
]

const users = [
    { id: 1, name: 'Dhruv Patel', email: 'dhruv@examai.com', role: 'Teacher', dept: 'Computer Science', status: 'Active', exams: 24, lastLogin: '2 hours ago' },
    { id: 2, name: 'Rahul Sharma', email: 'rahul@student.edu', role: 'Student', dept: 'Physics', status: 'Active', exams: 15, lastLogin: '5 min ago' },
    { id: 3, name: 'Priya Singh', email: 'priya@student.edu', role: 'Student', dept: 'Mathematics', status: 'Active', exams: 12, lastLogin: '1 hour ago' },
    { id: 4, name: 'Ankit Kumar', email: 'ankit@student.edu', role: 'Student', dept: 'Computer Science', status: 'Suspended', exams: 8, lastLogin: '3 days ago' },
    { id: 5, name: 'Prof. Mehra', email: 'mehra@examai.com', role: 'Teacher', dept: 'Physics', status: 'Active', exams: 31, lastLogin: '30 min ago' },
    { id: 6, name: 'Dr. Kapoor', email: 'kapoor@examai.com', role: 'Admin', dept: 'IT', status: 'Active', exams: 0, lastLogin: '4 hours ago' },
]

const trafficData = [
    { name: '00:00', users: 12 }, { name: '04:00', users: 5 },
    { name: '08:00', users: 45 }, { name: '09:00', users: 180 },
    { name: '10:00', users: 342 }, { name: '11:00', users: 298 },
    { name: '12:00', users: 156 }, { name: '13:00', users: 210 },
    { name: '14:00', users: 384 }, { name: '15:00', users: 267 },
    { name: '16:00', users: 188 }, { name: '17:00', users: 95 },
    { name: '18:00', users: 42 }, { name: '20:00', users: 18 },
]

const liveExams = [
    { title: 'Machine Learning Quiz', teacher: 'Prof. Mehra', students: 87, active: 82, violations: 3, startedAt: '2:00 PM' },
    { title: 'Algorithms Mid-Term', teacher: 'Dhruv Patel', students: 145, active: 138, violations: 7, startedAt: '1:30 PM' },
    { title: 'Statistics Exam', teacher: 'Dr. Sharma', students: 56, active: 56, violations: 0, startedAt: '2:30 PM' },
]

export default function AdminPanel() {
    const [searchQuery, setSearchQuery] = useState('')
    const [tab, setTab] = useState('users')

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="page-wrapper">
            <Navbar user={{ name: 'Admin', role: 'admin' }} />
            <Sidebar role="admin" />
            <main className="main-content">
                <div className="page-header">
                    <h1>Admin Panel</h1>
                    <p>System management, user administration, and live monitoring</p>
                </div>

                {/* System Stats */}
                <div className="grid grid-4">
                    {systemStats.map((s, i) => (
                        <div key={i} className="stat-card glass">
                            <div className="stat-icon" style={{ background: `${s.color}15`, color: s.color }}>
                                <s.icon size={22} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{s.value}</span>
                                <span className="stat-label">{s.label}</span>
                                <span className="stat-change">{s.sub}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="tabs" style={{ margin: '20px 0' }}>
                    {['users', 'monitoring', 'security'].map(t => (
                        <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>

                {tab === 'users' && (
                    <>
                        {/* User Management */}
                        <div className="glass" style={{ overflow: 'hidden' }}>
                            <div className="table-top">
                                <div className="search-bar">
                                    <Search size={16} />
                                    <input type="text" className="input" placeholder="Search users..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ border: 'none', background: 'transparent', padding: '8px 0' }} />
                                </div>
                                <button className="btn btn-primary btn-sm"><UserPlus size={14} /> Add User</button>
                            </div>
                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead>
                                        <tr><th>User</th><th>Role</th><th>Department</th><th>Status</th><th>Exams</th><th>Last Login</th><th></th></tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map(u => (
                                            <tr key={u.id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>{u.name.charAt(0)}</div>
                                                        <div>
                                                            <strong>{u.name}</strong>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span className="badge badge-info">{u.role}</span></td>
                                                <td style={{ color: 'var(--text-secondary)' }}>{u.dept}</td>
                                                <td>
                                                    <span className={`badge ${u.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                                                        {u.status}
                                                    </span>
                                                </td>
                                                <td>{u.exams}</td>
                                                <td style={{ color: 'var(--text-muted)' }}>{u.lastLogin}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: 4 }}>
                                                        <button className="btn btn-sm btn-secondary"><Edit size={12} /></button>
                                                        <button className="btn btn-sm btn-danger"><Trash2 size={12} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {tab === 'monitoring' && (
                    <>
                        {/* Live Traffic */}
                        <div className="chart-card glass">
                            <div className="chart-header">
                                <h3>Live Platform Traffic</h3>
                                <span className="badge badge-success">Real-time</span>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={trafficData}>
                                    <defs>
                                        <linearGradient id="gTraffic" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                                    <YAxis stroke="#64748b" fontSize={11} />
                                    <Tooltip contentStyle={{ background: '#1a1a3e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: 13 }} />
                                    <Area type="monotone" dataKey="users" stroke="#22d3ee" fill="url(#gTraffic)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Live Exams */}
                        <div className="glass" style={{ marginTop: 20, overflow: 'hidden' }}>
                            <div className="table-top">
                                <h3>🟢 Live Exams</h3>
                                <span className="badge badge-success">{liveExams.length} active</span>
                            </div>
                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead>
                                        <tr><th>Exam</th><th>Teacher</th><th>Students</th><th>Active</th><th>Violations</th><th>Started</th><th></th></tr>
                                    </thead>
                                    <tbody>
                                        {liveExams.map((ex, i) => (
                                            <tr key={i}>
                                                <td><strong>{ex.title}</strong></td>
                                                <td style={{ color: 'var(--text-secondary)' }}>{ex.teacher}</td>
                                                <td>{ex.students}</td>
                                                <td>
                                                    <span style={{ color: 'var(--success-400)', fontWeight: 600 }}>{ex.active}</span>
                                                </td>
                                                <td>
                                                    {ex.violations > 0 ? (
                                                        <span className="badge badge-danger">{ex.violations} <AlertTriangle size={10} /></span>
                                                    ) : (
                                                        <span className="badge badge-success">Clean</span>
                                                    )}
                                                </td>
                                                <td style={{ color: 'var(--text-muted)' }}>{ex.startedAt}</td>
                                                <td><button className="btn btn-sm btn-secondary"><Eye size={14} /> Monitor</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {tab === 'security' && (
                    <div className="security-grid">
                        {[
                            { title: 'Screenshot Detection', desc: 'Monitor PrintScreen and screen recording attempts', enabled: true, icon: Monitor },
                            { title: 'Tab Switch Detection', desc: 'Real-time tab switching via Visibility API', enabled: true, icon: Eye },
                            { title: 'Copy-Paste Blocking', desc: 'Disable clipboard operations during exams', enabled: true, icon: Shield },
                            { title: 'Fullscreen Enforcement', desc: 'Require fullscreen mode during examination', enabled: true, icon: Monitor },
                            { title: 'AI Proctoring', desc: 'Face detection, multi-person, head pose tracking', enabled: true, icon: Eye },
                            { title: 'Auto-Submission', desc: 'Submit on violation threshold (default: 3)', enabled: true, icon: AlertTriangle },
                            { title: 'Object Detection (YOLO)', desc: 'Detect phones and unauthorized materials', enabled: false, icon: Shield },
                            { title: 'Audio Monitoring', desc: 'Detect verbal communication during exams', enabled: false, icon: Clock },
                        ].map((s, i) => (
                            <div key={i} className="security-card glass">
                                <div className="security-card-header">
                                    <div className="stat-icon" style={{ width: 40, height: 40, background: s.enabled ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.04)', color: s.enabled ? 'var(--success-400)' : 'var(--text-muted)' }}>
                                        <s.icon size={18} />
                                    </div>
                                    <div className={`toggle ${s.enabled ? 'active' : ''}`}></div>
                                </div>
                                <h4>{s.title}</h4>
                                <p>{s.desc}</p>
                                <span className={`badge ${s.enabled ? 'badge-success' : 'badge-warning'}`}>{s.enabled ? 'Enabled' : 'Disabled'}</span>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
