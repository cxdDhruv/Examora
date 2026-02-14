import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useExam } from '../context/ExamContext'
import { Clock, BookOpen, Trophy, AlertTriangle, ChevronRight, Play, CheckCircle, Search } from 'lucide-react'
import './Dashboard.css'

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }) }

export default function StudentDashboard() {
    const { exams } = useExam()
    const navigate = useNavigate()
    const [joinCode, setJoinCode] = useState('')

    // Only show published exams
    const publishedExams = exams.filter(e => e.status === 'Published')

    const handleJoinExam = (e) => {
        e.preventDefault()
        if (joinCode.trim()) {
            navigate(`/join/${joinCode.trim().toUpperCase()}`)
        }
    }

    return (
        <div className="page-wrapper">
            <Navbar />
            <Sidebar role="student" />
            <main className="main-content">
                <div className="page-header">
                    <h1>Student Dashboard</h1>
                    <p>Join an exam using your exam code</p>
                </div>

                {/* Join Exam Card */}
                <div className="glass" style={{ padding: 32, marginBottom: 24 }}>
                    <h3 style={{ marginBottom: 16, fontSize: '1.05rem' }}>🎓 Join an Exam</h3>
                    <form onSubmit={handleJoinExam} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <input
                            className="input"
                            placeholder="Enter exam code (e.g. AB3XY9)"
                            value={joinCode}
                            onChange={e => setJoinCode(e.target.value.toUpperCase())}
                            style={{ flex: 1, minWidth: 200, fontSize: '1rem', letterSpacing: 2, textTransform: 'uppercase' }}
                            maxLength={6}
                        />
                        <button type="submit" className="btn btn-primary btn-lg" disabled={joinCode.trim().length < 4}>
                            <Play size={18} /> Join Exam
                        </button>
                    </form>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 10 }}>
                        Ask your teacher for the 6-character exam code
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-4">
                    {[
                        { label: 'Available Exams', value: publishedExams.length, icon: BookOpen, color: '#673ab7' },
                        { label: 'Join via Code', value: '→', icon: Search, color: '#2196f3' },
                        { label: 'Join via Link', value: '→', icon: ChevronRight, color: '#4caf50' },
                        { label: 'Join via QR', value: '📱', icon: Clock, color: '#ff9800' },
                    ].map((s, i) => (
                        <motion.div key={i} className="stat-card glass" custom={i} initial="hidden" animate="visible" variants={fadeUp}>
                            <div className="stat-icon" style={{ background: `${s.color}15`, color: s.color }}>
                                <s.icon size={22} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{s.value}</span>
                                <span className="stat-label">{s.label}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Available Exams */}
                <div className="glass" style={{ marginTop: 20, overflow: 'hidden' }}>
                    <div className="table-top">
                        <h3>Available Exams</h3>
                    </div>
                    {publishedExams.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                            <BookOpen size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
                            <p>No exams available. Enter a code above or ask your teacher for a link.</p>
                        </div>
                    ) : (
                        <div style={{ padding: 12 }}>
                            {publishedExams.map(ex => (
                                <div key={ex.id} className="exam-item glass" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', marginBottom: 8 }}>
                                    <div>
                                        <h4 style={{ marginBottom: 4 }}>{ex.title}</h4>
                                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                            {ex.questions?.length || 0} questions • {ex.duration || 60} min • Code: <strong>{ex.code}</strong>
                                        </p>
                                    </div>
                                    <Link to={`/join/${ex.code}`} className="btn btn-primary btn-sm">
                                        <Play size={14} /> Start
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
