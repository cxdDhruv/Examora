import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { Clock, BookOpen, Trophy, AlertTriangle, ChevronRight, Play, CheckCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './Dashboard.css'

const stats = [
    { label: 'Upcoming Exams', value: '3', icon: Clock, change: 'Next: Feb 15', color: '#818cf8' },
    { label: 'Completed', value: '12', icon: CheckCircle, change: 'This semester', color: '#4ade80' },
    { label: 'Average Score', value: '78%', icon: Trophy, change: 'Top 15%', color: '#fbbf24' },
    { label: 'Violations', value: '1', icon: AlertTriangle, change: 'Low risk', color: '#f87171' },
]

const upcomingExams = [
    { id: 1, title: 'Calculus Chapter 5 Test', subject: 'Mathematics', date: 'Feb 15, 2026 — 10:00 AM', duration: '90 min', questions: 40, status: 'upcoming' },
    { id: 2, title: 'Data Structures Quiz 3', subject: 'Computer Science', date: 'Feb 16, 2026 — 2:00 PM', duration: '45 min', questions: 25, status: 'upcoming' },
    { id: 3, title: 'Physics End-Term', subject: 'Physics', date: 'Feb 20, 2026 — 9:00 AM', duration: '120 min', questions: 60, status: 'upcoming' },
]

const pastResults = [
    { title: 'Machine Learning Quiz', score: 85, total: 100, grade: 'A', date: 'Feb 10' },
    { title: 'Physics Mid-Term', score: 72, total: 100, grade: 'B+', date: 'Feb 5' },
    { title: 'Data Structures Quiz 2', score: 90, total: 100, grade: 'A+', date: 'Jan 28' },
    { title: 'Calculus Ch. 4 Test', score: 65, total: 100, grade: 'B', date: 'Jan 20' },
    { title: 'Operating Systems Quiz', score: 78, total: 100, grade: 'B+', date: 'Jan 15' },
]

const performanceData = pastResults.map(r => ({ name: r.title.split(' ').slice(0, 2).join(' '), score: r.score }))

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }) }

export default function StudentDashboard() {
    return (
        <div className="page-wrapper">
            <Navbar user={{ name: 'Rahul Sharma', role: 'student' }} />
            <Sidebar role="student" />
            <main className="main-content">
                <div className="page-header">
                    <h1>Student Dashboard</h1>
                    <p>Welcome, Rahul! Your next exam is in 18 hours.</p>
                </div>

                {/* Countdown Banner */}
                <div className="exam-countdown">
                    <Clock size={24} color="var(--primary-400)" />
                    <div>
                        <strong>Next Exam: Calculus Chapter 5 Test</strong>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>Feb 15, 2026 — 10:00 AM</p>
                    </div>
                    <span className="countdown-time" style={{ marginLeft: 'auto' }}>18:04:32</span>
                </div>

                {/* Stats */}
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

                <div className="grid grid-2" style={{ marginTop: 20 }}>
                    {/* Upcoming Exams */}
                    <div className="glass" style={{ padding: 0, overflow: 'hidden' }}>
                        <div className="table-top">
                            <h3>Upcoming Exams</h3>
                        </div>
                        <div className="exam-list" style={{ padding: '12px' }}>
                            {upcomingExams.map(ex => (
                                <div key={ex.id} className="exam-item glass">
                                    <div className="exam-item-info">
                                        <h4>{ex.title}</h4>
                                        <p>{ex.subject} • {ex.duration} • {ex.questions} questions</p>
                                        <p style={{ color: 'var(--primary-300)' }}>{ex.date}</p>
                                    </div>
                                    <div className="exam-item-meta">
                                        <Link to={`/student/exam/${ex.id}`} className="btn btn-primary btn-sm">
                                            <Play size={14} /> Start
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Performance Chart */}
                    <div className="chart-card glass">
                        <div className="chart-header">
                            <h3>Recent Performance</h3>
                            <span className="badge badge-success">Trending Up</span>
                        </div>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                                <Tooltip contentStyle={{ background: '#1a1a3e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: 13 }} />
                                <Bar dataKey="score" fill="#818cf8" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Past Results */}
                <div className="glass" style={{ marginTop: 20, overflow: 'hidden' }}>
                    <div className="table-top">
                        <h3>Past Results</h3>
                    </div>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Exam</th>
                                    <th>Score</th>
                                    <th>Grade</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pastResults.map((r, i) => (
                                    <tr key={i}>
                                        <td><strong>{r.title}</strong></td>
                                        <td>{r.score}/{r.total}</td>
                                        <td><span className={`badge ${r.score >= 80 ? 'badge-success' : r.score >= 60 ? 'badge-warning' : 'badge-danger'}`}>{r.grade}</span></td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{r.date}</td>
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
