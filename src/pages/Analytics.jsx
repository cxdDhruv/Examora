import { useState } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import {
    BarChart3, TrendingUp, Users, AlertTriangle, Download, Filter
} from 'lucide-react'
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
    PolarRadiusAxis, Radar, Legend
} from 'recharts'
import './Analytics.css'
import './Dashboard.css'

const performanceData = [
    { name: 'Physics MT', avgScore: 74, passRate: 82, attempts: 145 },
    { name: 'DS Final', avgScore: 68, passRate: 75, attempts: 198 },
    { name: 'ML Quiz', avgScore: 81, passRate: 90, attempts: 87 },
    { name: 'Calc Ch5', avgScore: 72, passRate: 78, attempts: 210 },
    { name: 'OS Quiz', avgScore: 65, passRate: 70, attempts: 156 },
]

const topicStrength = [
    { topic: 'Mechanics', score: 85 },
    { topic: 'Thermodynamics', score: 62 },
    { topic: 'Optics', score: 78 },
    { topic: 'Electromagnetism', score: 70 },
    { topic: 'Quantum', score: 55 },
    { topic: 'Relativity', score: 72 },
]

const timeDistribution = [
    { name: 'Q1', avgTime: 45, expectedTime: 60 },
    { name: 'Q2', avgTime: 30, expectedTime: 30 },
    { name: 'Q3', avgTime: 90, expectedTime: 60 },
    { name: 'Q4', avgTime: 120, expectedTime: 90 },
    { name: 'Q5', avgTime: 180, expectedTime: 120 },
    { name: 'Q6', avgTime: 35, expectedTime: 30 },
    { name: 'Q7', avgTime: 25, expectedTime: 30 },
    { name: 'Q8', avgTime: 55, expectedTime: 60 },
]

const riskStudents = [
    { name: 'Ankit Kumar', exam: 'Physics MT', violations: 5, riskScore: 87, riskLevel: 'High' },
    { name: 'Priya Singh', exam: 'ML Quiz', violations: 3, riskScore: 62, riskLevel: 'Medium' },
    { name: 'Ravi Patel', exam: 'DS Final', violations: 4, riskScore: 75, riskLevel: 'High' },
    { name: 'Neha Gupta', exam: 'Calc Ch5', violations: 2, riskScore: 40, riskLevel: 'Low' },
    { name: 'Arun Mehta', exam: 'OS Quiz', violations: 3, riskScore: 58, riskLevel: 'Medium' },
]

const heatMapData = [
    [85, 90, 72, 65, 88, 45, 70, 82, 91, 60],
    [70, 55, 80, 78, 40, 72, 85, 60, 75, 82],
    [92, 88, 65, 70, 85, 78, 55, 90, 68, 72],
    [60, 72, 88, 82, 75, 90, 78, 45, 85, 70],
    [78, 65, 70, 90, 82, 55, 92, 85, 60, 88],
]

const heatMapLabels = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10']
const heatMapExams = ['Physics MT', 'DS Final', 'ML Quiz', 'Calc Ch5', 'OS Quiz']

function getHeatColor(val) {
    if (val >= 80) return '#22c55e'
    if (val >= 60) return '#f59e0b'
    return '#ef4444'
}

export default function Analytics() {
    const [tab, setTab] = useState('overview')

    return (
        <div className="page-wrapper">
            <Navbar user={{ name: 'Dhruv Patel', role: 'teacher' }} />
            <Sidebar role="teacher" />
            <main className="main-content">
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1>Analytics Dashboard</h1>
                        <p>Comprehensive insights into exam performance, student behavior, and question quality</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary"><Filter size={16} /> Filter</button>
                        <button className="btn btn-primary"><Download size={16} /> Export PDF</button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs" style={{ marginBottom: 20 }}>
                    {['overview', 'performance', 'behavior', 'questions'].map(t => (
                        <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Overview Stats */}
                <div className="grid grid-4">
                    {[
                        { label: 'Average Score', value: '72%', icon: TrendingUp, color: '#818cf8' },
                        { label: 'Pass Rate', value: '79%', icon: BarChart3, color: '#4ade80' },
                        { label: 'Total Students', value: '796', icon: Users, color: '#22d3ee' },
                        { label: 'Flagged Students', value: '12', icon: AlertTriangle, color: '#f87171' },
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

                <div className="grid grid-2" style={{ marginTop: 20 }}>
                    {/* Performance Chart */}
                    <div className="chart-card glass">
                        <div className="chart-header">
                            <h3>Exam Performance Trends</h3>
                        </div>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip contentStyle={{ background: '#1a1a3e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: 13 }} />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Bar dataKey="avgScore" name="Avg Score" fill="#818cf8" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="passRate" name="Pass Rate %" fill="#4ade80" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Topic Radar */}
                    <div className="chart-card glass">
                        <div className="chart-header">
                            <h3>Topic Strength Analysis</h3>
                            <span className="badge badge-warning">Weak: Quantum</span>
                        </div>
                        <ResponsiveContainer width="100%" height={260}>
                            <RadarChart data={topicStrength}>
                                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                                <PolarAngleAxis dataKey="topic" stroke="#94a3b8" fontSize={11} />
                                <PolarRadiusAxis stroke="rgba(255,255,255,0.05)" fontSize={10} />
                                <Radar name="Score" dataKey="score" stroke="#818cf8" fill="#818cf8" fillOpacity={0.2} strokeWidth={2} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Time Distribution */}
                <div className="chart-card glass" style={{ marginTop: 20 }}>
                    <div className="chart-header">
                        <h3>Time Spent per Question vs Expected</h3>
                        <span className="badge badge-info">Physics Mid-Term</span>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={timeDistribution}>
                            <defs>
                                <linearGradient id="gTime" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} label={{ value: 'seconds', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: '#1a1a3e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: 13 }} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Area type="monotone" dataKey="avgTime" name="Avg Time" stroke="#818cf8" fill="url(#gTime)" strokeWidth={2} />
                            <Area type="monotone" dataKey="expectedTime" name="Expected" stroke="#64748b" fill="transparent" strokeDasharray="5 5" strokeWidth={1.5} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Heat Map */}
                <div className="glass" style={{ marginTop: 20, padding: 24 }}>
                    <div className="chart-header">
                        <h3>Question Accuracy Heat Map</h3>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Green = High accuracy, Red = Low accuracy</span>
                    </div>
                    <div className="heatmap-container">
                        <div className="heatmap-header">
                            <div className="heatmap-label"></div>
                            {heatMapLabels.map(l => <div key={l} className="heatmap-cell-label">{l}</div>)}
                        </div>
                        {heatMapData.map((row, ri) => (
                            <div key={ri} className="heatmap-row">
                                <div className="heatmap-label">{heatMapExams[ri]}</div>
                                {row.map((val, ci) => (
                                    <div key={ci} className="heatmap-cell" style={{ background: `${getHeatColor(val)}15`, color: getHeatColor(val), borderColor: `${getHeatColor(val)}33` }}>
                                        {val}%
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Risk Students */}
                <div className="glass" style={{ marginTop: 20, overflow: 'hidden' }}>
                    <div className="table-top">
                        <h3>⚠️ High-Risk Students</h3>
                        <span className="badge badge-danger">Requires Review</span>
                    </div>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr><th>Student</th><th>Exam</th><th>Violations</th><th>Risk Score</th><th>Level</th></tr>
                            </thead>
                            <tbody>
                                {riskStudents.map((s, i) => (
                                    <tr key={i}>
                                        <td><strong>{s.name}</strong></td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{s.exam}</td>
                                        <td>{s.violations}</td>
                                        <td>
                                            <div className="risk-meter">
                                                <div className="risk-bar-bg">
                                                    <div className="risk-bar-fill" style={{
                                                        width: `${s.riskScore}%`,
                                                        background: s.riskScore > 70 ? 'var(--danger-400)' : s.riskScore > 50 ? 'var(--warning-400)' : 'var(--success-400)'
                                                    }}></div>
                                                </div>
                                                <span className="risk-value" style={{
                                                    color: s.riskScore > 70 ? 'var(--danger-400)' : s.riskScore > 50 ? 'var(--warning-400)' : 'var(--success-400)',
                                                    fontSize: '0.85rem'
                                                }}>{s.riskScore}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${s.riskLevel === 'High' ? 'badge-danger' : s.riskLevel === 'Medium' ? 'badge-warning' : 'badge-success'}`}>
                                                {s.riskLevel}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    )
}
