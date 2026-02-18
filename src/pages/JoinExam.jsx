import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useExam } from '../context/ExamContext'
import {
    KeyRound, Shield, ArrowRight, AlertCircle
} from 'lucide-react'

export default function JoinExam() {
    const { code: urlCode } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const { getExamByCode } = useExam()

    const [code, setCode] = useState(urlCode || '')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [exam, setExam] = useState(null)

    // Student Form State
    const [studentName, setStudentName] = useState('')
    const [studentEmail, setStudentEmail] = useState('')
    const [rollNo, setRollNo] = useState('')
    const [section, setSection] = useState('')
    const [batch, setBatch] = useState('')
    const [branch, setBranch] = useState('')

    const [step, setStep] = useState('code') // code, info, ready

    // Initialize: Check URL for exam data or code
    useEffect(() => {
        const init = async () => {
            // 1. Try URL-embedded data (Base64)
            const hashPart = location.search || ''
            const params = new URLSearchParams(hashPart)
            const d = params.get('d')

            if (d) {
                try {
                    const decoded = decodeURIComponent(atob(d))
                    const data = JSON.parse(decoded)
                    if (data && data.id) {
                        setExam(data)
                        setStep('info')
                        return
                    }
                } catch (e) { console.warn('INVALID_URL_DATA', e) }
            }

            // 2. Try fetching from Firestore if we have a short code (and no embedded data)
            if (urlCode && urlCode.length <= 8) {
                setLoading(true)
                try {
                    const found = await getExamByCode(urlCode.toUpperCase())
                    if (found) {
                        setExam(found)
                        setStep('info')
                    } else {
                        // If not found in DB, maybe it was a bad link or just needs manual entry
                        setError('Exam not found. Please check the code.')
                    }
                } catch (e) {
                    console.error(e)
                } finally {
                    setLoading(false)
                }
            } else if (urlCode) {
                // If it's a long code but failed decoding above, show error
                setStep('code')
            }
        }
        init()
    }, [urlCode, location.search, getExamByCode])

    const handleCodeSubmit = async (e) => {
        e.preventDefault()
        if (!code.trim()) {
            setError('Please enter an exam code.')
            return
        }

        setLoading(true)
        setError('')

        try {
            const found = await getExamByCode(code.toUpperCase())
            if (!found) {
                setError('Invalid exam code. Please use the full link shared by your teacher.')
                setLoading(false)
                return
            }
            if (found.status !== 'Published') {
                setError('This exam is not yet published.')
                setLoading(false)
                return
            }
            setExam(found)
            setStep('info')
        } catch (err) {
            setError('Error searching for exam. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleInfoSubmit = (e) => {
        e.preventDefault()
        if (!studentName.trim() || !rollNo.trim() || !section.trim()) {
            setError('Please fill in all required fields.')
            return
        }
        setError('')
        setStep('ready')
    }

    const startExam = () => {
        if (exam) {
            // Store student info for the exam
            sessionStorage.setItem('exam_student', JSON.stringify({
                name: studentName,
                email: studentEmail,
                rollNo,
                section,
                batch,
                branch
            }))
            // Store exam data in sessionStorage so TakeExam can access it
            // (Even with Firestore, we keep this as a backup/cache)
            sessionStorage.setItem('current_exam', JSON.stringify(exam))
            navigate(`/student/exam/${exam.id}`)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            padding: 20,
        }}>
            {/* Background */}
            <div className="animated-bg">
                <div className="bg-orb bg-orb-1"></div>
                <div className="bg-orb bg-orb-2"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
            >
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px', fontSize: '1.4rem', fontWeight: 800
                    }}>
                        E
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Examora</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Join your exam securely</p>
                </div>

                <div className="glass" style={{ padding: 32 }}>
                    {error && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '10px 14px', marginBottom: 16,
                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: 8, fontSize: '0.85rem', color: 'var(--danger-400)'
                        }}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    {step === 'code' && (
                        <form onSubmit={handleCodeSubmit}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>Enter Exam Code</h3>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                                Enter the 6-character code from your teacher or use the full link
                            </p>
                            <div className="input-group" style={{ marginBottom: 20 }}>
                                <label><KeyRound size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Exam Code</label>
                                <input
                                    className="input"
                                    placeholder="e.g. AB3XY9"
                                    value={code}
                                    onChange={e => setCode(e.target.value.toUpperCase())}
                                    maxLength={6}
                                    style={{
                                        fontSize: '1.6rem', fontWeight: 800, letterSpacing: 8,
                                        textAlign: 'center', fontFamily: 'monospace', textTransform: 'uppercase'
                                    }}
                                    autoFocus
                                    disabled={loading}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                                {loading ? 'Searching...' : <>Find Exam <ArrowRight size={16} /></>}
                            </button>
                        </form>
                    )}

                    {step === 'info' && exam && (
                        <form onSubmit={handleInfoSubmit}>
                            <div style={{
                                padding: '12px 16px', background: 'rgba(99,102,241,0.06)',
                                border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, marginBottom: 20,
                            }}>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 4 }}>{exam.title}</h4>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                    {exam.questions?.length} questions • {exam.duration} min • Code: {exam.code}
                                </p>
                            </div>

                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16 }}>Student Information</h3>

                            <div className="input-group" style={{ marginBottom: 12 }}>
                                <label>Full Name *</label>
                                <input className="input" placeholder="Enter your full name" value={studentName} onChange={e => setStudentName(e.target.value)} autoFocus required />
                            </div>

                            <div className="input-group" style={{ marginBottom: 12 }}>
                                <label>Email Address *</label>
                                <input className="input" type="email" placeholder="you@college.edu" value={studentEmail} onChange={e => setStudentEmail(e.target.value)} required />
                            </div>

                            <div className="grid grid-2" style={{ gap: 12, marginBottom: 12 }}>
                                <div className="input-group">
                                    <label>Roll Number *</label>
                                    <input className="input" placeholder="e.g. 21CS045" value={rollNo} onChange={e => setRollNo(e.target.value)} required />
                                </div>
                                <div className="input-group">
                                    <label>Section *</label>
                                    <input className="input" placeholder="e.g. A" value={section} onChange={e => setSection(e.target.value)} required />
                                </div>
                            </div>

                            <div className="grid grid-2" style={{ gap: 12, marginBottom: 20 }}>
                                <div className="input-group">
                                    <label>Batch *</label>
                                    <input className="input" placeholder="e.g. 2024-2028" value={batch} onChange={e => setBatch(e.target.value)} required />
                                </div>
                                <div className="input-group">
                                    <label>Branch *</label>
                                    <input className="input" placeholder="e.g. CSE" value={branch} onChange={e => setBranch(e.target.value)} required />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                                Continue <ArrowRight size={16} />
                            </button>
                        </form>
                    )}

                    {step === 'ready' && exam && (
                        <div style={{ textAlign: 'center' }}>
                            <Shield size={48} color="var(--primary-400)" style={{ marginBottom: 16 }} />
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>Ready to Start</h3>
                            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
                                Welcome, <strong>{studentName}</strong>
                            </p>

                            <div style={{
                                padding: 16, background: 'rgba(255,255,255,0.03)',
                                borderRadius: 12, border: '1px solid var(--border-subtle)', marginBottom: 20,
                                textAlign: 'left',
                            }}>
                                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: 12 }}>{exam.title}</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                    <span>📝 {exam.questions?.length} Questions • {exam.totalPoints} Points</span>
                                    <span>⏱ {exam.duration} Minutes</span>
                                    {exam.settings?.proctoring && <span>🔒 AI Proctoring Enabled</span>}
                                    {exam.settings?.fullscreen && <span>🖥 Fullscreen Required</span>}
                                </div>
                            </div>

                            <div style={{
                                padding: '10px 16px', background: 'rgba(245,158,11,0.08)',
                                border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8,
                                fontSize: '0.78rem', color: 'var(--warning-400)', marginBottom: 20, textAlign: 'left',
                            }}>
                                ⚠️ <strong>Important:</strong> Do not switch tabs during the exam. Violations will be recorded and may result in auto-submission.
                            </div>

                            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={startExam}>
                                🚀 Start Exam Now
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <a href="#/" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                        Powered by Examora
                    </a>
                </div>
            </motion.div>
        </div>
    )
}
