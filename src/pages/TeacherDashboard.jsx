import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useExam } from '../context/ExamContext'
import {
    FileUp, ClipboardList, BarChart3, Users, TrendingUp,
    Clock, AlertTriangle, BookOpen, Plus, ChevronRight, Eye,
    Ban, Shield, XCircle
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import './Dashboard.css'

const stats = [
    { label: 'Total Exams', value: '24', icon: ClipboardList, change: '+3 this week', color: '#818cf8' },
    { label: 'Students', value: '1,247', icon: Users, change: '+89 this month', color: '#22d3ee' },
    { label: 'AI Questions', value: '3,482', icon: BookOpen, change: 'Auto-generated', color: '#4ade80' },
    { label: 'Avg Score', value: '72%', icon: TrendingUp, change: '+5% improvement', color: '#fbbf24' },
]

const activityData = [
    { name: 'Mon', exams: 12, students: 145 },
    { name: 'Tue', exams: 8, students: 98 },
    { name: 'Wed', exams: 15, students: 210 },
    { name: 'Thu', exams: 11, students: 178 },
    { name: 'Fri', exams: 18, students: 256 },
    { name: 'Sat', exams: 6, students: 73 },
    { name: 'Sun', exams: 3, students: 42 },
]

const recentExams = [
    { id: 1, title: 'Physics Mid-Term 2026', students: 145, date: 'Feb 12, 2026', status: 'Completed', avgScore: 74, violations: 3 },
    { id: 2, title: 'Data Structures Final', students: 198, date: 'Feb 10, 2026', status: 'Completed', avgScore: 68, violations: 7 },
    { id: 3, title: 'Machine Learning Quiz', students: 87, date: 'Feb 14, 2026', status: 'Active', avgScore: null, violations: 1 },
    { id: 4, title: 'Calculus Chapter 5 Test', students: 210, date: 'Feb 15, 2026', status: 'Scheduled', avgScore: null, violations: 0 },
]

const violationData = [
    { name: 'Tab Switch', value: 45, color: '#818cf8' },
    { name: 'Face Not Detected', value: 22, color: '#f87171' },
    { name: 'Multiple Faces', value: 12, color: '#fbbf24' },
    { name: 'Fullscreen Exit', value: 18, color: '#22d3ee' },
    { name: 'Copy Attempt', value: 8, color: '#4ade80' },
]

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }) }

export default function TeacherDashboard() {
    const { cheatingReports, exams } = useExam()

    return (
        <div className="page-wrapper">
            <Navbar user={{ name: 'Dhruv Patel', role: 'teacher' }} />
            <Sidebar role="teacher" />
            <main className="main-content">
                <div className="page-header">
                    <h1>Teacher Dashboard</h1>
                    <p>Welcome back, Dhruv! Here's an overview of your examination activity.</p>
                </div>

                {/* Cheating Alert Banner */}
                {cheatingReports.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '14px 20px', marginBottom: 20, borderRadius: 12,
                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                        }}
                    >
                        <Ban size={22} color="var(--danger-400)" />
                        <div style={{ flex: 1 }}>
                            <strong style={{ color: 'var(--danger-400)' }}>
                                🚨 {cheatingReports.length} Cheating Report{cheatingReports.length > 1 ? 's' : ''} Detected
                            </strong>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                                {cheatingReports.filter(r => !r.reviewed).length} unreviewed — scroll down to see details
                            </p>
                        </div>
                        <a href="#cheating-reports" className="btn btn-sm btn-danger">View Reports ↓</a>
                    </motion.div>
                )}

                {/* Stats row */}
                <div className="grid grid-4">
                    {stats.map((s, i) => (
                        <motion.div key={i} className="stat-card glass" custom={i} initial="hidden" animate="visible" variants={fadeUp}>
                            <div className="stat-icon" style={{ background: `${s.color}15`, color: s.color }}>
                                <s.icon size={22} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{s.value}</span>
                                <span className="stat-label">{s.label}</span>
                                <span className="stat-change">{s.change}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                    <Link to="/teacher/upload" className="action-btn glass">
                        <FileUp size={20} /> Upload Document & Generate Questions
                    </Link>
                    <Link to="/teacher/exam-builder" className="action-btn glass">
                        <Plus size={20} /> Create New Exam
                    </Link>
                    <Link to="/teacher/analytics" className="action-btn glass">
                        <BarChart3 size={20} /> View Analytics
                    </Link>
                </div>

                {/* Charts row */}
                <div className="grid grid-2" style={{ marginTop: 20 }}>
                    <div className="chart-card glass">
                        <div className="chart-header">
                            <h3>Weekly Activity</h3>
                            <span className="badge badge-info">Last 7 days</span>
                        </div>
                        <ResponsiveContainer width="100%" height={240}>
                            <AreaChart data={activityData}>
                                <defs>
                                    <linearGradient id="colorExams" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip contentStyle={{ background: '#1a1a3e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: 13 }} />
                                <Area type="monotone" dataKey="students" stroke="#22d3ee" fill="url(#colorStudents)" strokeWidth={2} />
                                <Area type="monotone" dataKey="exams" stroke="#818cf8" fill="url(#colorExams)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-card glass">
                        <div className="chart-header">
                            <h3>Violations Breakdown</h3>
                            <span className="badge badge-danger">105 total</span>
                        </div>
                        <div className="pie-container">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={violationData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                                        {violationData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#1a1a3e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: 13 }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="pie-legend">
                                {violationData.map((v, i) => (
                                    <div key={i} className="legend-item">
                                        <span className="legend-dot" style={{ background: v.color }}></span>
                                        <span>{v.name}</span>
                                        <strong>{v.value}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Exams Table */}
                <div className="glass" style={{ marginTop: 20, overflow: 'hidden' }}>
                    <div className="table-top">
                        <h3>Recent Examinations</h3>
                        <Link to="/teacher/analytics" className="btn btn-sm btn-secondary">View All <ChevronRight size={14} /></Link>
                    </div>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Exam Title</th>
                                    <th>Students</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Avg Score</th>
                                    <th>Violations</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentExams.map(ex => (
                                    <tr key={ex.id}>
                                        <td><strong>{ex.title}</strong></td>
                                        <td>{ex.students}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{ex.date}</td>
                                        <td>
                                            <span className={`badge ${ex.status === 'Completed' ? 'badge-success' : ex.status === 'Active' ? 'badge-warning' : 'badge-info'}`}>
                                                {ex.status}
                                            </span>
                                        </td>
                                        <td>{ex.avgScore ? `${ex.avgScore}%` : '—'}</td>
                                        <td>
                                            {ex.violations > 0 ? (
                                                <span className="badge badge-danger">{ex.violations} <AlertTriangle size={10} /></span>
                                            ) : '—'}
                                        </td>
                                        <td><button className="btn btn-sm btn-secondary"><Eye size={14} /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ========== CHEATING REPORTS ========== */}
                <div id="cheating-reports" className="glass" style={{ marginTop: 20, overflow: 'hidden', borderColor: cheatingReports.length > 0 ? 'rgba(239,68,68,0.2)' : undefined }}>
                    <div className="table-top">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Shield size={18} color="var(--danger-400)" />
                            🚨 Cheating Reports
                            {cheatingReports.length > 0 && (
                                <span className="badge badge-danger">{cheatingReports.length} reports</span>
                            )}
                        </h3>
                    </div>

                    {cheatingReports.length === 0 ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Shield size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
                            <p>No cheating reports yet. All students are following the rules! ✅</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Severity</th>
                                        <th>Violations</th>
                                        <th>Reason</th>
                                        <th>Action Taken</th>
                                        <th>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cheatingReports.map(report => {
                                        const examData = exams.find(e => e.id === report.examId)
                                        return (
                                            <tr key={report.id} style={{
                                                background: report.severity === 'Critical'
                                                    ? 'rgba(239,68,68,0.04)'
                                                    : report.severity === 'High'
                                                        ? 'rgba(245,158,11,0.04)' : undefined
                                            }}>
                                                <td>
                                                    <div>
                                                        <strong>{report.studentName}</strong>
                                                        <br />
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                            {examData?.title || 'Unknown Exam'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${report.severity === 'Critical' ? 'badge-danger' :
                                                        report.severity === 'High' ? 'badge-warning' : 'badge-info'
                                                        }`}>
                                                        {report.severity === 'Critical' ? '🔴' : report.severity === 'High' ? '🟠' : '🟡'} {report.severity}
                                                    </span>
                                                </td>
                                                <td>
                                                    <strong style={{ color: 'var(--danger-400)', fontSize: '1.05rem' }}>
                                                        {report.violations}
                                                    </strong>
                                                </td>
                                                <td style={{ maxWidth: 250, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                                    {report.reason}
                                                </td>
                                                <td>
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                                        color: 'var(--danger-400)', fontWeight: 600, fontSize: '0.82rem'
                                                    }}>
                                                        <XCircle size={14} /> {report.action}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                                    {new Date(report.reportedAt).toLocaleString()}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

