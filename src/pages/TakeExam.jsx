import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useExam } from '../context/ExamContext'
import * as faceapi from 'face-api.js'
import {
    Clock, ChevronLeft, ChevronRight, Flag, AlertTriangle,
    Camera, CameraOff, Wifi, Shield, Send, CheckCircle,
    XCircle, Ban, Eye, EyeOff
} from 'lucide-react'
import MathText from '../components/MathText'
import './TakeExam.css'

const fallbackQuestions = []

export default function TakeExam() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { getExamById, submitExamAnswers, cancelStudentExam } = useExam()
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const streamRef = useRef(null)
    const audioCtxRef = useRef(null)

    // Try context first, then sessionStorage (set by JoinExam from URL-embedded data)
    const contextExam = getExamById(id)
    const sessionExam = (() => {
        try {
            const stored = sessionStorage.getItem('current_exam')
            if (stored) {
                const parsed = JSON.parse(stored)
                if (parsed.id == id) return parsed
            }
        } catch { }
        return null
    })()
    const exam = contextExam || sessionExam
    const examQuestions = exam?.questions || fallbackQuestions
    const examTitle = exam?.title || 'Practice Exam'
    const examDuration = exam?.duration || 90
    const maxViolations = exam?.settings?.maxViolations || 3

    const [currentQ, setCurrentQ] = useState(0)
    const [answers, setAnswers] = useState({})
    const [shuffledQuestions, setShuffledQuestions] = useState([])
    const [connectionStatus, setConnectionStatus] = useState('CHECKING') // OK, ERROR, CHECKING

    // Initialize questions (shuffle if needed)
    useEffect(() => {
        if (examQuestions.length > 0 && shuffledQuestions.length === 0) {
            let q = [...examQuestions]
            if (exam?.settings?.shuffle) {
                for (let i = q.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [q[i], q[j]] = [q[j], q[i]];
                }
            }
            setShuffledQuestions(q)
        }
    }, [examQuestions, exam?.settings?.shuffle])

    const activeQuestions = shuffledQuestions.length > 0 ? shuffledQuestions : examQuestions
    const [flagged, setFlagged] = useState(new Set())
    const [timeLeft, setTimeLeft] = useState(examDuration * 60)
    const [submitted, setSubmitted] = useState(false)
    const [cancelled, setCancelled] = useState(false)
    const [cancelReason, setCancelReason] = useState('')

    // Security state
    const [violations, setViolations] = useState([])
    const [cameraActive, setCameraActive] = useState(false)
    const [cameraError, setCameraError] = useState(false)
    const [showWarning, setShowWarning] = useState(false)
    const [warningMsg, setWarningMsg] = useState('')
    const [showCancelScreen, setShowCancelScreen] = useState(false)
    const [copyBlocked, setCopyBlocked] = useState(false)

    // Face Detection State
    const [modelsLoaded, setModelsLoaded] = useState(false)
    const [faceMissing, setFaceMissing] = useState(false)
    const [missingTimer, setMissingTimer] = useState(0)

    const studentInfo = (() => {
        try { return JSON.parse(sessionStorage.getItem('exam_student')) || { name: 'Student' } }
        catch { return { name: 'Student' } }
    })()

    // Sound Alarm function
    const playAlarm = useCallback(() => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
        }
        const ctx = audioCtxRef.current
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(880, ctx.currentTime) // A5
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1)

        gain.gain.setValueAtTime(0.5, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)

        osc.start()
        osc.stop(ctx.currentTime + 0.5)
    }, [])

    // Load Face API Models
    useEffect(() => {
        const loadModels = async () => {
            try {
                // Using CDN for models to avoid local file issues
                const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models'
                await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
                setModelsLoaded(true)
                console.log('FaceAPI Models Loaded')
            } catch (err) {
                console.error('Failed to load face models', err)
                // Fallback: If models fail, we might disable face check or warn user
            }
        }
        loadModels()
    }, [])

    // ========== CAMERA MONITORING ==========
    useEffect(() => {
        let mounted = true
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 320, height: 240, facingMode: 'user' }
                })
                if (mounted) {
                    streamRef.current = stream
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream
                    }
                    setCameraActive(true)
                    setCameraError(false)
                }
            } catch (err) {
                console.error('Camera access denied:', err)
                if (mounted) {
                    setCameraActive(false)
                    setCameraError(true)
                    addViolation('Camera access denied — exam requires camera monitoring')
                }
            }
        }
        startCamera()

        // CONNECTION CHECK (Verify "Anyone" permission)
        const checkConnection = async () => {
            if (!exam?.sheetUrl) return
            try {
                // Try to fetch data. If permissions are wrong (e.g. "Only Me"), this will fail CORS or return HTML login page
                const res = await fetch(exam.sheetUrl)
                const text = await res.text()
                // If it returns HTML (Google Login) instead of JSON, permissions are wrong
                if (text.trim().startsWith('<!DOCTYPE html') || text.includes('accounts.google.com')) {
                    throw new Error('Auth Required')
                }
                setConnectionStatus('OK')
            } catch (err) {
                console.error("Connection Check Failed:", err)
                setConnectionStatus('ERROR')
            }
        }
        checkConnection()

        return () => {
            mounted = false
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop())
            }
        }
    }, [exam?.sheetUrl])

    // Face Detection Loop
    useEffect(() => {
        if (!modelsLoaded || !cameraActive || submitted || cancelled) return

        const interval = setInterval(async () => {
            if (videoRef.current) {
                const detections = await faceapi.detectAllFaces(
                    videoRef.current,
                    new faceapi.TinyFaceDetectorOptions()
                )

                if (detections.length === 0) {
                    setMissingTimer(prev => prev + 1)
                    setFaceMissing(true)
                } else if (detections.length > 1) {
                    addViolation('Multiple faces detected!')
                    setFaceMissing(false)
                    setMissingTimer(0)
                } else {
                    setFaceMissing(false)
                    setMissingTimer(0)
                }
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [modelsLoaded, cameraActive, submitted, cancelled])

    // Handle Missing Face Timer
    useEffect(() => {
        if (missingTimer > 0) {
            // Warning after 3 seconds
            if (missingTimer > 3 && missingTimer <= 8) {
                playAlarm() // Beep
            }
            // Cancel after 10 seconds
            if (missingTimer > 10) {
                handleCancelExam([], 'Face not visible for > 10 seconds')
            }
        }
    }, [missingTimer, playAlarm])


    // ========== ANTI-CHEAT: Tab Switch / Window Blur ==========
    useEffect(() => {
        if (submitted || cancelled) return

        const handleVisibility = () => {
            if (document.hidden) {
                addViolation('Tab switch detected — student left the exam window')
            }
        }

        const handleBlur = () => {
            addViolation('Window blur detected — student may have switched applications')
        }

        const handleContext = (e) => { e.preventDefault(); addViolation('Right-click attempt blocked') }
        const handleCopy = (e) => {
            e.preventDefault(); setCopyBlocked(true); setTimeout(() => setCopyBlocked(false), 2000);
            addViolation('Copy/Paste attempt blocked')
        }
        const handleKeyDown = (e) => {
            if (e.ctrlKey && ['c', 'v', 'a', 'x', 'p', 'u'].includes(e.key.toLowerCase())) {
                e.preventDefault(); addViolation(`Keyboard shortcut blocked: Ctrl+${e.key.toUpperCase()}`)
            }
            if (e.key === 'PrintScreen' || e.key === 'F12') {
                e.preventDefault(); addViolation('Screenshot/DevTools attempt blocked')
            }
            if (e.altKey && e.key === 'Tab') {
                addViolation('Alt+Tab detected — application switching')
            }
        }

        let lastWidth = window.innerWidth
        const handleResize = () => {
            if (Math.abs(window.innerWidth - lastWidth) > 200) {
                addViolation('Significant window resize detected — possible screen sharing')
            }
            lastWidth = window.innerWidth
        }

        const handleBeforeUnload = (e) => {
            e.preventDefault()
            e.returnValue = 'Your exam will be cancelled if you leave this page!'
            return e.returnValue
        }

        document.addEventListener('visibilitychange', handleVisibility)
        window.addEventListener('blur', handleBlur)
        document.addEventListener('contextmenu', handleContext)
        document.addEventListener('copy', handleCopy)
        document.addEventListener('cut', handleCopy)
        document.addEventListener('paste', handleCopy)
        document.addEventListener('keydown', handleKeyDown)
        window.addEventListener('resize', handleResize)
        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibility)
            window.removeEventListener('blur', handleBlur)
            document.removeEventListener('contextmenu', handleContext)
            document.removeEventListener('copy', handleCopy)
            document.removeEventListener('cut', handleCopy)
            document.removeEventListener('paste', handleCopy)
            document.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [submitted, cancelled])

    // ========== VIOLATION HANDLER ==========
    const addViolation = useCallback((reason) => {
        setViolations(prev => {
            const now = Date.now()
            const recent = prev.filter(v => now - v.timestamp < 2000)
            if (recent.some(v => v.reason === reason)) return prev

            const newViolation = { reason, timestamp: now, time: new Date().toLocaleTimeString() }
            const updated = [...prev, newViolation]

            playAlarm()
            setWarningMsg(reason)
            setShowWarning(true)
            setTimeout(() => setShowWarning(false), 3000)

            if (updated.length >= maxViolations) {
                setTimeout(() => {
                    handleCancelExam(updated, reason)
                }, 500)
            }

            return updated
        })
    }, [maxViolations, playAlarm])

    // ========== TIMER ==========
    useEffect(() => {
        if (submitted || cancelled) return
        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) { handleSubmit(); return 0 }
                return t - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [submitted, cancelled])

    const formatTime = (s) => {
        const h = Math.floor(s / 3600)
        const m = Math.floor((s % 3600) / 60)
        const sec = s % 60
        return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    }

    const selectAnswer = (qId, optIdx) => setAnswers({ ...answers, [qId]: optIdx })
    const toggleFlag = (qId) => {
        const next = new Set(flagged)
        next.has(qId) ? next.delete(qId) : next.add(qId)
        setFlagged(next)
    }

    // ========== EXAM CANCELLATION — Report to Teacher ==========
    const handleCancelExam = (allViolations, lastReason) => {
        setCancelled(true)
        setCancelReason(lastReason)
        setShowCancelScreen(true)

        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())

        if (exam) {
            cancelStudentExam(
                exam.id,
                studentInfo,
                `Exam cancelled: ${lastReason}`,
                allViolations || violations
            )
        }
    }

    const handleSubmit = () => {
        if (submitted || cancelled) return
        setSubmitted(true)
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
        if (exam) submitExamAnswers(exam.id, answers, studentInfo, violations)
    }

    const q = activeQuestions[currentQ]
    const answeredCount = Object.keys(answers).length
    const progressPct = (answeredCount / activeQuestions.length) * 100
    const violationCount = violations.length

    // ========== RENDER STATES ==========

    // RED SCREEN OVERLAY (Face Missing)
    const renderRedScreen = () => {
        if (faceMissing && missingTimer > 3 && !cancelled && !submitted) {
            return (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    background: 'rgba(239,68,68,0.85)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', color: '#fff', textAlign: 'center'
                }}>
                    <AlertTriangle size={80} color="#fff" style={{ marginBottom: 20 }} />
                    <h1 style={{ fontSize: '3rem', fontWeight: 800 }}>FACE NOT DETECTED</h1>
                    <p style={{ fontSize: '1.5rem' }}>Return to frame immediately!</p>
                    <p style={{ marginTop: 20, fontWeight: 700 }}>Cancelling in {10 - missingTimer} seconds...</p>
                </div>
            )
        }
        return null
    }

    if (cancelled || showCancelScreen) {
        return (
            <div className="exam-submitted" style={{ background: 'rgba(20,0,0,0.95)' }}>
                <div className="submitted-card glass" style={{ borderColor: 'rgba(239,68,68,0.4)', maxWidth: 520 }}>
                    <Ban size={72} color="var(--danger-400)" />
                    <h2 style={{ color: 'var(--danger-400)', marginTop: 16 }}>🚫 Exam Cancelled</h2>
                    <h3 style={{ color: 'var(--danger-300)', fontWeight: 400, marginTop: 4 }}>Security Violation</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.6 }}>
                        Your exam has been <strong>cancelled</strong>.<br />
                        Reason: <strong>{cancelReason}</strong>
                    </p>
                    <button className="btn btn-secondary btn-lg" style={{ marginTop: 20 }} onClick={() => navigate('/')}>
                        Return to Home
                    </button>
                </div>
            </div>
        )
    }

    // Calculate score for display

    const downloadResult = () => {
        const resultData = {
            examId: exam.id,
            studentInfo,
            answers,
            violations: violationCount,
            violationLogs: violations, // detailed logs
            score: Object.keys(answers).reduce((total, qId) => {
                const q = examQuestions.find(q => q.id == qId)
                if (q && (q.type === 'MCQ' || q.type === 'True/False')) {
                    return total + (answers[qId] === q.correct ? q.points : 0)
                }
                return total
            }, 0),
            submittedAt: new Date().toISOString(),
            status: violationCount > 0 ? 'Flagged' : 'Clean',
            cancelReason: cancelReason || null, // Include if cancelled
            cancelledBy: cancelled ? 'System' : null
        }

        const blob = new Blob([JSON.stringify(resultData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${studentInfo.rollNo}_${studentInfo.name.replace(/\s+/g, '_')}_Result.json`
        a.click()
    }

    if (submitted) {
        return (
            <div className="exam-submitted">
                <div className="submitted-card glass">
                    <CheckCircle size={64} color="var(--success-400)" />
                    <h2>Exam Submitted!</h2>
                    <p>Thank you, <strong>{studentInfo.name}</strong>.</p>
                    <div className="submitted-stats">
                        <div><strong>{answeredCount}</strong><span>Answered</span></div>
                        <div><strong>{violationCount}</strong><span>Violations</span></div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'center' }}>
                        <button className="btn btn-secondary" onClick={downloadResult}>
                            Download Result
                        </button>
                        <button className="btn btn-primary" onClick={() => navigate('/')}>Home</button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="exam-page" style={{ userSelect: 'none' }}>
            {renderRedScreen()}

            {/* Connection Debug Indicator (Hidden in print) */}
            <div style={{
                position: 'fixed', bottom: 10, left: 10, zIndex: 9000,
                fontSize: '0.75rem',
                color: connectionStatus === 'ERROR' ? '#ef4444' : connectionStatus === 'OK' ? '#22c55e' : 'rgba(255,255,255,0.3)',
                pointerEvents: 'none', fontWeight: 600,
                background: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: 4
            }} className="no-print">
                Server: {exam?.sheetUrl ? `Linked (${exam.sheetUrl.slice(-6)})` : 'Default (Local)'}
                <span style={{ marginLeft: 8 }}>
                    [{connectionStatus === 'CHECKING' ? '...' : connectionStatus}]
                </span>
                {connectionStatus === 'ERROR' && (
                    <div style={{ fontSize: '0.7rem', color: '#fca5a5', marginTop: 2 }}>
                        ⚠️ Permission Denied: Set Script to "Anyone"
                    </div>
                )}
            </div>

            {showWarning && (
                <div className="warning-overlay">
                    <div className="warning-card">
                        <AlertTriangle size={36} color="var(--warning-400)" />
                        <h3>⚠️ Warning</h3>
                        <p>{warningMsg}</p>
                    </div>
                </div>
            )}

            <header className="exam-topbar">
                <div className="exam-title">
                    <Shield size={18} color="var(--primary-400)" />
                    <span>{examTitle}</span>
                </div>
                <div className="exam-timer" style={{ color: timeLeft < 600 ? 'var(--danger-400)' : 'var(--text-primary)' }}>
                    <Clock size={16} />
                    <span>{formatTime(timeLeft)}</span>
                </div>
                <div className="exam-indicators">
                    <div className={`indicator ${cameraActive ? 'good' : 'bad'}`}>
                        {cameraActive ? <Camera size={14} /> : <CameraOff size={14} />}
                    </div>
                    <div className={`indicator ${violationCount > 0 ? 'warn' : 'good'}`}>
                        <AlertTriangle size={14} /> {violationCount}/{maxViolations}
                    </div>
                </div>
            </header>

            <div className="exam-body">
                <aside className="exam-nav">
                    <div className="camera-feed-container" style={{
                        width: '100%', aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden',
                        border: `2px solid ${faceMissing ? 'var(--danger-500)' : 'var(--success-500)'}`,
                        background: '#000', marginBottom: 12, position: 'relative'
                    }}>
                        <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {/* Hidden Warning Text if Face Missing */}
                        {faceMissing && (
                            <div style={{ position: 'absolute', inset: 0, border: '4px solid red', pointerEvents: 'none' }}></div>
                        )}
                    </div>

                    <h4>Questions</h4>
                    <div className="nav-grid">
                        {activeQuestions.map((q, i) => (
                            <button
                                key={q.id}
                                className={`nav-btn ${currentQ === i ? 'current' : ''} ${answers[q.id] !== undefined ? 'answered' : ''} ${flagged.has(q.id) ? 'flagged' : ''}`}
                                onClick={() => setCurrentQ(i)}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </aside>

                <div className="question-panel">
                    <div className="qp-header">
                        <div className="qp-meta">
                            <span className="q-num">Question {currentQ + 1}</span>
                            <span className="badge badge-info">{q.type}</span>
                            <span className="bq-points">{q.points} pts</span>
                        </div>
                        <button className={`flag-btn ${flagged.has(q.id) ? 'active' : ''}`} onClick={() => toggleFlag(q.id)}>
                            <Flag size={16} /> {flagged.has(q.id) ? 'Flagged' : 'Flag'}
                        </button>
                    </div>

                    <p className="qp-text">
                        <MathText text={q.text} />
                    </p>

                    {q.type === 'Code' ? (
                        <div className="code-runner">
                            <textarea
                                className="input"
                                value={answers[q.id] || ''}
                                onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                                placeholder="// Write your JavaScript code here..."
                                style={{
                                    fontFamily: 'monospace', minHeight: 200, width: '100%',
                                    background: '#1e1e1e', color: '#d4d4d4', border: 'none',
                                    padding: 16, borderRadius: 8, lineHeight: 1.5
                                }}
                                spellCheck={false}
                            />
                            <div style={{ marginTop: 12 }}>
                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => {
                                        try {
                                            const logs = []
                                            const originalLog = console.log
                                            console.log = (...args) => logs.push(args.join(' '))
                                             
                                            new Function(answers[q.id] || '')()
                                            console.log = originalLog
                                            alert('Output:\n' + (logs.length ? logs.join('\n') : 'No output'))
                                        } catch (err) {
                                            alert('Error:\n' + err.message)
                                        }
                                    }}
                                >
                                    ▶ Run Code
                                </button>
                            </div>
                        </div>
                    ) : (q.type === 'MCQ' || q.type === 'True/False') ? (
                        <div className="qp-options">
                            {q.options.map((opt, j) => (
                                <button key={j} className={`qp-opt ${answers[q.id] === j ? 'selected' : ''}`} onClick={() => selectAnswer(q.id, j)}>
                                    <span className="opt-letter">{String.fromCharCode(65 + j)}</span>
                                    <MathText text={opt} />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <textarea
                            className="input qp-textarea"
                            rows={6}
                            value={answers[q.id] || ''}
                            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                        />
                    )}

                    <div className="qp-nav">
                        <button className="btn btn-secondary" disabled={currentQ === 0} onClick={() => setCurrentQ(currentQ - 1)}>
                            <ChevronLeft size={16} /> Previous
                        </button>
                        {currentQ < activeQuestions.length - 1 ? (
                            <button className="btn btn-primary" onClick={() => setCurrentQ(currentQ + 1)}>
                                Next <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button className="btn btn-primary" onClick={handleSubmit}>
                                <Send size={16} /> Submit Exam
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
