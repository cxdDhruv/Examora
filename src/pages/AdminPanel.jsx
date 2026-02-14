import { useState } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useExam } from '../context/ExamContext'
import { useAuth } from '../context/AuthContext'
import {
    Users, Shield, Settings, BarChart3, Search, MoreVertical,
    Clock, AlertTriangle, Eye, Check, X, Activity
} from 'lucide-react'
import './Admin.css'
import './Dashboard.css'

export default function AdminPanel() {
    const { exams, cheatingReports } = useExam()
    const { user } = useAuth()
    const [searchQuery, setSearchQuery] = useState('')

    const totalSubmissions = exams.reduce((sum, e) => sum + (e.submissions?.length || 0), 0)
    const totalQuestions = exams.reduce((sum, e) => sum + (e.questions?.length || 0), 0)
    const publishedExams = exams.filter(e => e.status === 'Published')

    const stats = [
        { label: 'Total Exams', value: exams.length, icon: BarChart3, color: '#673ab7', sub: `${publishedExams.length} published` },
        { label: 'Total Submissions', value: totalSubmissions, icon: Users, color: '#2196f3', sub: 'All exams' },
        { label: 'Questions Created', value: totalQuestions, icon: Activity, color: '#4caf50', sub: 'Total' },
        { label: 'Cheating Reports', value: cheatingReports.length, icon: Shield, color: '#f44336', sub: `${cheatingReports.filter(r => !r.reviewed).length} unreviewed` },
    ]

    // Filter exams by search
    const filteredExams = exams.filter(e =>
        e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.code?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="page-wrapper">
            <Navbar />
            <Sidebar role="teacher" />
            <main className="main-content">
                <div className="page-header">
                    <h1>Admin Panel</h1>
                    <p>System overview and management</p>
                </div>

                {/* Stats */}
                <div className="grid grid-4">
                    {stats.map((s, i) => (
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

                {/* Search */}
                <div className="admin-search" style={{ marginTop: 24, marginBottom: 20 }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            className="input"
                            placeholder="Search exams by title or code..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: 40, width: '100%', maxWidth: 480 }}
                        />
                    </div>
                </div>

                {/* All Exams Table */}
                <div className="glass" style={{ overflow: 'hidden' }}>
                    <div className="table-top">
                        <h3>All Exams ({filteredExams.length})</h3>
                    </div>
                    {filteredExams.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                            <BarChart3 size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
                            <p>{searchQuery ? 'No exams match your search' : 'No exams created yet'}</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Exam</th>
                                        <th>Code</th>
                                        <th>Questions</th>
                                        <th>Submissions</th>
                                        <th>Status</th>
                                        <th>Created</th>
                                        <th>Created By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredExams.map(e => (
                                        <tr key={e.id}>
                                            <td><strong>{e.title}</strong></td>
                                            <td><code style={{ background: '#f3e5f5', color: '#673ab7', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{e.code}</code></td>
                                            <td>{e.questions?.length || 0}</td>
                                            <td>{e.submissions?.length || 0}</td>
                                            <td>
                                                <span className={`badge ${e.status === 'Published' ? 'badge-success' : 'badge-warning'}`}>
                                                    {e.status}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                                {new Date(e.createdAt).toLocaleDateString()}
                                            </td>
                                            <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{e.createdBy || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Cheating Reports */}
                {cheatingReports.length > 0 && (
                    <div className="glass" style={{ marginTop: 20, overflow: 'hidden' }}>
                        <div className="table-top">
                            <h3>⚠️ Security Reports ({cheatingReports.length})</h3>
                        </div>
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Reason</th>
                                        <th>Violations</th>
                                        <th>Severity</th>
                                        <th>Action</th>
                                        <th>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cheatingReports.map(r => (
                                        <tr key={r.id}>
                                            <td><strong>{r.studentName}</strong></td>
                                            <td>{r.reason}</td>
                                            <td>{r.violations}</td>
                                            <td>
                                                <span className={`badge ${r.severity === 'Critical' ? 'badge-danger' : r.severity === 'High' ? 'badge-warning' : 'badge-info'}`}>
                                                    {r.severity}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '0.82rem' }}>{r.action || '—'}</td>
                                            <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                                {new Date(r.reportedAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
