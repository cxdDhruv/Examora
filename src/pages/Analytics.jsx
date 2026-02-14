import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useExam } from '../context/ExamContext'
import {
    BarChart3, TrendingUp, Users, AlertTriangle, Download
} from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts'
import './Analytics.css'
import './Dashboard.css'

export default function Analytics() {
    const { exams, cheatingReports } = useExam()

    // Build real analytics from exam data
    const examPerformance = exams.map(e => {
        const subs = e.submissions || []
        const scores = subs.map(s => s.score || 0)
        const totalPossible = e.totalPoints || e.questions?.reduce((s, q) => s + (q.points || 1), 0) || 1
        return {
            name: (e.title || 'Untitled').slice(0, 15),
            avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
            submissions: subs.length,
            passRate: scores.length > 0 ? Math.round(scores.filter(s => s >= totalPossible * 0.4).length / scores.length * 100) : 0,
        }
    })

    const totalSubmissions = exams.reduce((sum, e) => sum + (e.submissions?.length || 0), 0)
    const allScores = exams.flatMap(e => (e.submissions || []).map(s => s.score || 0))
    const overallAvg = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0

    // Violation breakdown from cheating reports
    const violationTypes = {}
    cheatingReports.forEach(r => {
        const reason = r.reason || 'Unknown'
        violationTypes[reason] = (violationTypes[reason] || 0) + 1
    })

    return (
        <div className="page-wrapper">
            <Navbar />
            <Sidebar role="teacher" />
            <main className="main-content">
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1>Analytics</h1>
                        <p>Insights from your exams and student performance</p>
                    </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-4" style={{ marginBottom: 24 }}>
                    {[
                        { label: 'Total Exams', value: exams.length, icon: BarChart3, color: '#673ab7' },
                        { label: 'Submissions', value: totalSubmissions, icon: Users, color: '#2196f3' },
                        { label: 'Overall Avg', value: allScores.length > 0 ? `${overallAvg}%` : '—', icon: TrendingUp, color: '#4caf50' },
                        { label: 'Violations', value: cheatingReports.length, icon: AlertTriangle, color: '#f44336' },
                    ].map((s, i) => (
                        <div key={i} className="stat-card glass">
                            <div className="stat-icon" style={{ background: `${s.color}15`, color: s.color }}>
                                <s.icon size={22} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{s.value}</span>
                                <span className="stat-label">{s.label}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {exams.length === 0 ? (
                    <div className="glass" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                        <BarChart3 size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
                        <h3 style={{ fontWeight: 500, marginBottom: 8 }}>No analytics yet</h3>
                        <p>Create and publish exams to see performance data here.</p>
                    </div>
                ) : (
                    <>
                        {/* Performance Chart */}
                        <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
                            <h3 style={{ marginBottom: 20 }}>Exam Performance</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={examPerformance}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis dataKey="name" stroke="#666" fontSize={11} />
                                    <YAxis stroke="#666" fontSize={11} />
                                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13 }} />
                                    <Bar dataKey="avgScore" name="Avg Score" fill="#673ab7" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="submissions" name="Submissions" fill="#2196f3" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Exam Details Table */}
                        <div className="glass" style={{ overflow: 'hidden' }}>
                            <div className="table-top">
                                <h3>Exam Details</h3>
                            </div>
                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Exam</th>
                                            <th>Submissions</th>
                                            <th>Avg Score</th>
                                            <th>Pass Rate</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {exams.map(e => {
                                            const subs = e.submissions || []
                                            const scores = subs.map(s => s.score || 0)
                                            const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
                                            return (
                                                <tr key={e.id}>
                                                    <td><strong>{e.title}</strong></td>
                                                    <td>{subs.length}</td>
                                                    <td>{scores.length > 0 ? `${avg}` : '—'}</td>
                                                    <td>{scores.length > 0 ? `${Math.round(scores.filter(s => s > 0).length / scores.length * 100)}%` : '—'}</td>
                                                    <td>
                                                        <span className={`badge ${e.status === 'Published' ? 'badge-success' : 'badge-warning'}`}>
                                                            {e.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Violation Breakdown */}
                        {cheatingReports.length > 0 && (
                            <div className="glass" style={{ marginTop: 20, overflow: 'hidden' }}>
                                <div className="table-top">
                                    <h3>Violation Breakdown</h3>
                                </div>
                                <div className="table-responsive">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Violation Type</th>
                                                <th>Count</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(violationTypes).map(([type, count]) => (
                                                <tr key={type}>
                                                    <td>{type}</td>
                                                    <td><strong>{count}</strong></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
