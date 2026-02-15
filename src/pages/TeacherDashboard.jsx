import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useExam } from '../context/ExamContext'
import { useAuth } from '../context/AuthContext'
import {
    FileUp, ClipboardList, BarChart3, Users, TrendingUp,
    Clock, AlertTriangle, BookOpen, Plus, ChevronRight, Eye,
    Ban, Shield, XCircle, PenTool, Copy, Download
} from 'lucide-react'
// import { jsPDF } from 'jspdf'
// import 'jspdf-autotable'
import './Dashboard.css'

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }) }

export default function TeacherDashboard() {
    const { cheatingReports, exams, duplicateExam } = useExam()
    const { user } = useAuth()
    const userName = user?.name || localStorage.getItem('user_name') || 'Teacher'

    // Compute real stats from context
    const totalExams = exams.length
    const totalStudents = exams.reduce((sum, e) => sum + (e.submissions?.length || 0), 0)
    const totalQuestions = exams.reduce((sum, e) => sum + (e.questions?.length || 0), 0)
    const allScores = exams.flatMap(e => (e.submissions || []).map(s => s.score || 0))
    const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0

    const publishedExams = exams.filter(e => e.status === 'Published')

    const stats = [
        { label: 'Total Exams', value: totalExams, icon: ClipboardList, change: `${publishedExams.length} published`, color: '#673ab7' },
        { label: 'Submissions', value: totalStudents, icon: Users, change: `Across ${totalExams} exams`, color: '#2196f3' },
        { label: 'Questions', value: totalQuestions, icon: BookOpen, change: 'Created', color: '#4caf50' },
        { label: 'Avg Score', value: allScores.length > 0 ? `${avgScore}%` : '—', icon: TrendingUp, change: allScores.length > 0 ? `${allScores.length} submissions` : 'No submissions yet', color: '#ff9800' },
    ]

    const handleDuplicate = (examId) => {
        if (window.confirm('Are you sure you want to duplicate this exam?')) {
            duplicateExam(examId)
        }
    }

    const handleExportPDF = async (exam) => {
        try {
            // Dynamic import
            const { jsPDF } = await import('jspdf')
            await import('jspdf-autotable')

            const doc = new jsPDF()

            // Title
            doc.setFontSize(22)
            doc.setTextColor(40, 40, 40)
            doc.text(exam.title, 20, 20)

            doc.setFontSize(12)
            doc.setTextColor(100, 100, 100)
            doc.text(`Code: ${exam.code} | Duration: ${exam.duration} mins | Points: ${exam.totalPoints}`, 20, 30)

            let y = 45

            exam.questions.forEach((q, i) => {
                if (y > 270) {
                    doc.addPage()
                    y = 20
                }

                doc.setFontSize(14)
                doc.setTextColor(0, 0, 0)
                const questionText = doc.splitTextToSize(`${i + 1}. ${q.text} (${q.points} pt)`, 170)
                doc.text(questionText, 20, y)
                y += questionText.length * 7

                if (q.type === 'MCQ' || q.type === 'True/False') {
                    doc.setFontSize(12)
                    doc.setTextColor(80, 80, 80)
                    q.options.forEach((opt, j) => {
                        doc.text(`   ${String.fromCharCode(65 + j)}) ${opt}`, 20, y + (j * 6))
                    })
                    y += (q.options.length * 6) + 10
                } else if (q.type === 'Fill Blank') {
                    y += 10
                } else {
                    y += 25 // Space for short answer
                }
            })

            doc.save(`${exam.title.replace(/\s+/g, '_')}_QuestionPaper.pdf`)
        } catch (error) {
            console.error("Failed to generate PDF:", error)
            alert("Failed to generate PDF. Please try again.")
        }
    }

    return (
        <div className="page-wrapper">
            <Navbar />
            <Sidebar role="teacher" />
            <main className="main-content">
                <div className="page-header">
                    <h1>Teacher Dashboard</h1>
                    <p>Welcome back, {userName}! Here's your examination overview.</p>
                </div>

                {/* Cheating Alert Banner */}
                {cheatingReports.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '14px 20px', marginBottom: 20, borderRadius: 12,
                            background: '#ffebee', border: '1px solid #ffcdd2',
                        }}
                    >
                        <Ban size={22} color="#c62828" />
                        <div style={{ flex: 1 }}>
                            <strong style={{ color: '#c62828' }}>
                                🚨 {cheatingReports.length} Cheating Report{cheatingReports.length > 1 ? 's' : ''} Detected
                            </strong>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                                {cheatingReports.filter(r => !r.reviewed).length} unreviewed
                            </p>
                        </div>
                    </motion.div>
                )}

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

                {/* Quick Actions */}
                <div style={{ display: 'flex', gap: 12, margin: '24px 0', flexWrap: 'wrap' }}>
                    <Link to="/teacher/upload" className="btn btn-primary"><FileUp size={16} /> Upload PDF & Generate</Link>
                    <Link to="/teacher/exam-builder" className="btn btn-secondary"><PenTool size={16} /> Create Manually</Link>
                    <Link to="/teacher/analytics" className="btn btn-secondary"><BarChart3 size={16} /> Analytics</Link>
                </div>

                {/* Your Exams */}
                <div className="glass" style={{ overflow: 'hidden' }}>
                    <div className="table-top">
                        <h3>Your Exams ({exams.length})</h3>
                    </div>
                    {exams.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                            <ClipboardList size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
                            <p>No exams yet. Create your first exam!</p>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
                                <Link to="/teacher/upload" className="btn btn-primary btn-sm"><FileUp size={14} /> Upload PDF</Link>
                                <Link to="/teacher/exam-builder" className="btn btn-secondary btn-sm"><PenTool size={14} /> Create Manually</Link>
                            </div>
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
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exams.map(e => (
                                        <tr key={e.id}>
                                            <td><strong>{e.title}</strong></td>
                                            <td><code style={{ background: 'var(--primary-50)', color: 'var(--primary-500)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{e.code}</code></td>
                                            <td>{e.questions?.length || 0}</td>
                                            <td>{e.submissions?.length || 0}</td>
                                            <td>
                                                <span className={`badge ${e.status === 'Published' ? 'badge-success' : 'badge-warning'}`}>
                                                    {e.status}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                                                {new Date(e.createdAt).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    {e.status === 'Published' && (
                                                        <Link to={`/teacher/published/${e.id}`} className="btn btn-sm btn-primary" title="View Results & Details">
                                                            <Eye size={14} /> Results
                                                        </Link>
                                                    )}
                                                    <button onClick={() => handleDuplicate(e.id)} className="btn btn-sm btn-secondary" title="Duplicate Exam">
                                                        <Copy size={14} />
                                                    </button>
                                                    <button onClick={() => handleExportPDF(e)} className="btn btn-sm btn-secondary" title="Export PDF">
                                                        <Download size={14} />
                                                    </button>
                                                </div>
                                            </td>
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
                            <h3>⚠️ Cheating Reports ({cheatingReports.length})</h3>
                        </div>
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Reason</th>
                                        <th>Violations</th>
                                        <th>Severity</th>
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
