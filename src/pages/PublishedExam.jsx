import { useState, useRef, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useGoogleLogin } from '@react-oauth/google'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useExam } from '../context/ExamContext'
import {
    Copy, CheckCircle, Share2, Download, ArrowLeft,
    Clock, FileText, Shield, Users, CloudUpload, ScanLine, AlertTriangle, Ban
} from 'lucide-react'
// import { jsPDF } from 'jspdf'
// import 'jspdf-autotable'
import './Dashboard.css'

export default function PublishedExam() {
    const { examId } = useParams()
    const navigate = useNavigate()
    const { getExamById, exams, cancelStudentExam, importSubmission, updateExam, googleSheetUrl } = useExam()
    const exam = getExamById(examId)
    const [copied, setCopied] = useState(false)
    const [viewingLogs, setViewingLogs] = useState(null)
    const [exporting, setExporting] = useState(false)
    const [liveSubmissions, setLiveSubmissions] = useState([])

    // Listen for real-time updates from Firebase
    useEffect(() => {
        let unsubscribe = () => { }
        const setupListener = async () => {
            try {
                const { db } = await import('../config/firebase')
                const { collection, query, where, onSnapshot } = await import('firebase/firestore')
                const q = query(collection(db, "submissions"), where("examId", "==", Number(examId)))

                unsubscribe = onSnapshot(q, (snapshot) => {
                    const subs = []
                    snapshot.forEach((doc) => {
                        subs.push(doc.data())
                    })
                    if (subs.length > 0) {
                        setLiveSubmissions(subs)
                        // Optional: Merge with local if needed, but for "Results" view, live is better
                        // Actually, let's update the context/local state so the table renders it
                        // importSubmission(parseInt(examId), subs) // Be careful of loops
                    }
                })
            } catch (err) {
                console.log("Firebase listener error (likely not configured):", err)
            }
        }
        setupListener()
        return () => unsubscribe()
    }, [examId])

    // Listen for Google Sheet updates (Polling) - Firewall Bypass Mode
    useEffect(() => {
        if (!googleSheetUrl) return

        const fetchSheetData = async () => {
            try {
                const res = await fetch(googleSheetUrl)
                if (res.ok) {
                    const data = await res.json()
                    // Filter for this exam
                    // data is array of full submission objects
                    const relevant = data.filter(d => Number(d.examId) === Number(examId))
                    if (relevant.length > 0) {
                        setLiveSubmissions(relevant)
                    }
                }
            } catch (err) {
                console.error("Sheet polling failed", err)
            }
        }

        fetchSheetData()
        const interval = setInterval(fetchSheetData, 5000) // Poll every 5s
        return () => clearInterval(interval)
    }, [examId, googleSheetUrl])

    // Merge live submissions with local ones for display
    const displaySubmissions = useMemo(() => {
        const local = exam?.submissions || []
        // Combine by student rollNo or email to avoid duplicates
        const combined = [...local]
        liveSubmissions.forEach(live => {
            if (!combined.some(l => l.studentInfo?.rollNo === live.studentInfo?.rollNo)) {
                combined.push(live)
            }
        })
        return combined
    }, [exam?.submissions, liveSubmissions])

    // ========== CSV Download ==========
    const downloadCSV = () => {
        if (!exam.submissions || exam.submissions.length === 0) return
        const headers = ['Name', 'Email', 'Roll No', 'Section', 'Batch', 'Branch', 'Score', 'Violations', 'Status', 'Submitted At']
        const rows = exam.submissions.map(sub => [
            sub.studentInfo?.name || sub.studentName || '',
            sub.studentInfo?.email || '',
            sub.studentInfo?.rollNo || '',
            sub.studentInfo?.section || '',
            sub.studentInfo?.batch || '',
            sub.studentInfo?.branch || '',
            sub.score !== undefined ? sub.score : '',
            sub.violations || 0,
            sub.status || '',
            sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '',
        ])
        const csvContent = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${exam.title.replace(/\s+/g, '_')}_results.csv`
        link.click()
        link.click()
        URL.revokeObjectURL(url)
    }

    // ========== PDF Report Download ==========
    const downloadReportPDF = async () => {
        if (!exam.submissions || exam.submissions.length === 0) return

        try {
            // Dynamic import to avoid initial bundle crash
            const { jsPDF } = await import('jspdf')
            await import('jspdf-autotable')

            const doc = new jsPDF()

            // Title
            doc.setFontSize(20)
            doc.setTextColor(40, 40, 40)
            doc.text(`Exam Results: ${exam.title}`, 14, 20)

            doc.setFontSize(11)
            doc.setTextColor(100, 100, 100)
            doc.text(`Code: ${exam.code} | Date: ${new Date().toLocaleDateString()}`, 14, 28)

            const tableColumn = ["Student Name", "Roll No", "Score", "Total", "Status", "Violations", "Submitted"]
            const tableRows = []

            exam.submissions.forEach(sub => {
                const row = [
                    sub.studentInfo?.name || sub.studentName || 'Unknown',
                    sub.studentInfo?.rollNo || '-',
                    sub.score !== undefined ? sub.score : '-',
                    exam.totalPoints,
                    sub.status,
                    sub.violations || 0,
                    sub.submittedAt ? new Date(sub.submittedAt).toLocaleTimeString() : '-'
                ]
                tableRows.push(row)
            })

            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: 35,
                theme: 'grid',
                headStyles: { fillColor: [99, 102, 241], textColor: 255 },
                styles: { fontSize: 10, cellPadding: 3 },
                alternateRowStyles: { fillColor: [248, 250, 252] }
            })

            doc.save(`${exam.title.replace(/\s+/g, '_')}_StudentResults.pdf`)
        } catch (error) {
            console.error("Failed to load PDF generator:", error)
            alert("Failed to generate PDF. Please try again or use CSV export.")
        }
    }

    // ========== Google Drive Export ==========
    const exportToGoogleDrive = async () => { /* ... */ }

    // ========== Google Sheets Sync ==========
    const [syncing, setSyncing] = useState(false)

    const syncToSheets = async (accessToken) => {
        if (!exam.submissions || exam.submissions.length === 0) {
            alert('No submissions to sync.')
            return
        }
        setSyncing(true)

        try {
            // 1. Create Sheet if needed
            let spreadsheetId = exam.sheetId
            if (!spreadsheetId) {
                const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ properties: { title: `${exam.title} - Examora Results` } })
                })
                const createData = await createRes.json()
                if (createData.spreadsheetId) {
                    spreadsheetId = createData.spreadsheetId
                    updateExam(exam.id, { sheetId: spreadsheetId, sheetUrl: createData.spreadsheetUrl })
                } else {
                    throw new Error('Failed to create spreadsheet')
                }
            }

            // 2. Prepare Data
            const headers = ['Name', 'Roll No', 'Score', 'Status', 'Violations', 'Submitted At']
            const rows = exam.submissions.map(s => [
                s.studentInfo?.name || s.studentName,
                s.studentInfo?.rollNo || '-',
                s.score || 0,
                s.status,
                s.violations || 0,
                s.submittedAt ? new Date(s.submittedAt).toLocaleString() : ''
            ])

            // 3. Clear existing values (optional, but safer to avoid dupes if we just overwrite A1)
            // For now, let's just update Sheet1!A1
            const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1?valueInputOption=USER_ENTERED`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ values: [headers, ...rows] })
            })

            if (updateRes.ok) {
                alert(`Successfully synced to Google Sheets!\nSheet ID: ${spreadsheetId}`)
                if (exam.sheetUrl) window.open(exam.sheetUrl, '_blank')
            } else {
                throw new Error('Failed to update sheet values')
            }

        } catch (err) {
            console.error('Sheets Sync Error:', err)
            alert('Failed to sync to Google Sheets. Check console for details.')
        } finally {
            setSyncing(false)
        }
    }

    const loginToSheets = useGoogleLogin({
        scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
        onSuccess: (tokenResponse) => syncToSheets(tokenResponse.access_token),
        onError: () => alert('Google Sheets login failed'),
    })

    if (!exam) {
        return (
            <div className="page-wrapper">
                <Navbar />
                <Sidebar role="teacher" />
                <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass" style={{ padding: 40, textAlign: 'center' }}>
                        <h2>Exam not found</h2>
                        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/teacher')}>
                            Back to Dashboard
                        </button>
                    </div>
                </main>
            </div>
        )
    }

    // Generate Shareable Link (Compressed)
    const joinUrl = useMemo(() => {
        if (!exam) return ''
        const baseUrl = window.location.origin + window.location.pathname
        // Create a minimal payload
        const payload = {
            id: exam.id,
            title: exam.title,
            questions: exam.questions,
            duration: exam.duration,
            settings: exam.settings,
            sheetUrl: googleSheetUrl // Embed current sheet URL for remote students
        }
        // Use LZString to compress (we need to add this library)
        // For now, we'll try to strip unnecessary data if we can't add libraries easily
        // But since we can't easily add libraries without npm install, let's try to minify the JSON
        const json = JSON.stringify(payload)
        const encoded = btoa(encodeURIComponent(json))
        return `${baseUrl}#/join/${encoded}`
    }, [exam, googleSheetUrl])

    const copyLink = () => {
        navigator.clipboard.writeText(joinUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const copyCode = () => {
        navigator.clipboard.writeText(exam.code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="page-wrapper">
            <Navbar />
            <Sidebar role="teacher" />
            <main className="main-content">
                <button className="btn btn-secondary" onClick={() => navigate('/teacher')} style={{ marginBottom: 16 }}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>

                {/* Success Banner */}
                <div className="glass" style={{ padding: '32px', marginBottom: 24, textAlign: 'center', borderColor: 'rgba(34,197,94,0.3)' }}>
                    <CheckCircle size={48} color="var(--success-400)" style={{ marginBottom: 12 }} />
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>
                        🎉 Exam Published Successfully!
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Students can now scan the QR code or use the exam code to access the exam on their devices
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {/* QR Code Section */}
                    <div className="glass" style={{ padding: 32, textAlign: 'center' }}>
                        <h3 style={{ marginBottom: 20, fontSize: '1.1rem', fontWeight: 700 }}>
                            <ScanLine size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                            Scan QR Code
                        </h3>

                        {joinUrl.length > 2000 ? (
                            <div style={{ padding: 20, background: '#fff3cd', color: '#856404', borderRadius: 8, marginBottom: 16 }}>
                                <AlertTriangle size={24} style={{ marginBottom: 8 }} />
                                <p style={{ fontSize: '0.9rem', margin: 0 }}>
                                    <strong>Exam too large for QR Code</strong><br />
                                    Please share the link directly.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div style={{ background: '#fff', padding: 24, borderRadius: 16, display: 'inline-block', marginBottom: 16 }}>
                                    <QRCodeSVG
                                        value={joinUrl}
                                        size={220}
                                        level="M"
                                        includeMargin
                                        fgColor="#1a1a2e"
                                        bgColor="#ffffff"
                                    />
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                                    Students scan this with their phone camera to open the exam
                                </p>
                                <button className="btn btn-secondary" onClick={() => {
                                    // Download QR as image
                                    const svg = document.querySelector('.glass svg')
                                    if (svg) {
                                        const canvas = document.createElement('canvas')
                                        canvas.width = 300
                                        canvas.height = 300
                                        const ctx = canvas.getContext('2d')
                                        const data = new XMLSerializer().serializeToString(svg)
                                        const img = new Image()
                                        img.onload = () => {
                                            ctx.fillStyle = '#fff'
                                            ctx.fillRect(0, 0, 300, 300)
                                            ctx.drawImage(img, 0, 0, 300, 300)
                                            const a = document.createElement('a')
                                            a.download = `${exam.code}-qr.png`
                                            a.href = canvas.toDataURL()
                                            a.click()
                                        }
                                        img.src = 'data:image/svg+xml;base64,' + btoa(data)
                                    }
                                }}>
                                    <Download size={16} /> Download QR
                                </button>
                            </>
                        )}
                    </div>

                    {/* Exam Code & Link */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="glass" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: 12 }}>Exam Code</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    flex: 1, fontSize: '2.5rem', fontWeight: 900, letterSpacing: 8,
                                    textAlign: 'center', color: 'var(--primary-300)', fontFamily: 'monospace',
                                    padding: '16px 0', background: 'rgba(99,102,241,0.06)', borderRadius: 12,
                                    border: '2px dashed var(--primary-600)'
                                }}>
                                    {exam.code}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                <button className="btn btn-primary" style={{ flex: 1 }} onClick={copyCode}>
                                    {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                                    {copied ? 'Copied!' : 'Copy Code'}
                                </button>
                            </div>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 8 }}>
                                Students can enter this code at the join page
                            </p>
                        </div>

                        <div className="glass" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: 12 }}>Shareable Link</h3>
                            <div style={{
                                padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--border-subtle)', borderRadius: 8,
                                fontSize: '0.82rem', color: 'var(--primary-300)', wordBreak: 'break-all',
                                marginBottom: 12
                            }}>
                                {joinUrl}
                            </div>
                            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={copyLink}>
                                <Share2 size={16} /> Copy Link
                            </button>
                            <div style={{ marginTop: 12, fontSize: '0.75rem', color: '#999', wordBreak: 'break-all' }}>
                                <strong>Linked Sheet:</strong> {googleSheetUrl.substring(0, 40)}...
                            </div>
                        </div>

                        {/* Student Submissions Table */}
                        <div className="glass" style={{ padding: 24, gridColumn: '1 / -1' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Student Submissions</h3>
                                {exam.submissions && (
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn btn-primary btn-sm" onClick={() => document.getElementById('import-input').click()}>
                                            <CloudUpload size={14} /> Import Results
                                        </button>
                                        <input
                                            id="import-input"
                                            type="file"
                                            multiple
                                            accept=".json"
                                            style={{ display: 'none' }}
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files)
                                                let importedCount = 0
                                                files.forEach(file => {
                                                    const reader = new FileReader()
                                                    reader.onload = (ev) => {
                                                        try {
                                                            const data = JSON.parse(ev.target.result)
                                                            if (data.examId === exam.id && data.studentInfo) {
                                                                importSubmission(exam.id, data)
                                                                importedCount++
                                                            }
                                                        } catch (err) {
                                                            console.error('Import failed for file:', file.name)
                                                        }
                                                    }
                                                    reader.readAsText(file)
                                                })
                                                setTimeout(() => {
                                                    alert(`Import process started for ${files.length} files. Valid submissions will appear in the table.`)
                                                }, 500)
                                                e.target.value = '' // Reset
                                            }}
                                        />
                                        <button className="btn btn-secondary btn-sm" onClick={downloadReportPDF}>
                                            <FileText size={14} /> Report PDF
                                        </button>
                                        <button className="btn btn-secondary btn-sm" onClick={downloadCSV}>
                                            <Download size={14} /> CSV
                                        </button>
                                        <button className="btn btn-primary btn-sm" onClick={() => loginToSheets()} disabled={syncing}>
                                            <CloudUpload size={14} /> {syncing ? 'Syncing...' : 'Sync to Sheets'}
                                        </button>
                                    </div>
                                )}
                            </div>
                            {(!import.meta.env.VITE_FIREBASE_API_KEY) && (
                                <div style={{ padding: '12px 16px', marginBottom: 16, background: '#fff3cd', color: '#856404', borderRadius: 8, border: '1px solid #ffeeba', fontSize: '0.9rem' }}>
                                    <strong>⚠️ Real-time results not configured</strong><br />
                                    To see student results instantly across devices, you must configure Firebase in your project settings.
                                    Currently showing local submissions only.
                                </div>
                            )}
                            {displaySubmissions.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)' }}>No submissions yet. (If students have submitted, ensure Firebase is configured or use "Import Results")</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Roll No</th>
                                                <th>Branch/Sec</th>
                                                <th>Score</th>
                                                <th>Status</th>
                                                <th>Submitted</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {displaySubmissions.map((sub, i) => (
                                                <tr key={i} style={
                                                    sub.status === 'Cancelled' ? { opacity: 0.6, background: '#f5f5f5' } :
                                                        sub.violations > 0 ? { background: '#fff0f0', borderLeft: '3px solid var(--danger-500)' } : {}
                                                }>
                                                    <td>
                                                        <strong>{sub.studentInfo?.name || sub.studentName}</strong>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                            {sub.studentInfo?.email}
                                                        </div>
                                                    </td>
                                                    <td>{sub.studentInfo?.rollNo || '-'}</td>
                                                    <td>
                                                        {sub.studentInfo?.branch || '-'} ({sub.studentInfo?.section || '-'}) - {sub.studentInfo?.batch || '-'}
                                                    </td>
                                                    <td>
                                                        <span style={{ fontWeight: 700, color: 'var(--primary-400)' }}>
                                                            {sub.score !== undefined ? sub.score : '-'}
                                                        </span>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> / {exam.totalPoints}</span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${sub.status === 'Clean' ? 'badge-success' :
                                                            sub.status === 'Cancelled' ? 'badge-danger' :
                                                                'badge-warning'
                                                            }`}>
                                                            {sub.status}
                                                        </span>
                                                        {sub.violations > 0 && (
                                                            <div>
                                                                <span style={{ fontSize: '0.75rem', color: 'var(--danger-500)', display: 'block', fontWeight: 600 }}>
                                                                    {sub.violations} violations
                                                                </span>
                                                                <button
                                                                    className="btn-link"
                                                                    style={{ fontSize: '0.75rem', color: 'var(--primary-500)', textDecoration: 'underline', padding: 0, marginTop: 4, background: 'none', border: 'none', cursor: 'pointer' }}
                                                                    onClick={() => setViewingLogs(sub)}
                                                                >
                                                                    View Logs
                                                                </button>
                                                            </div>
                                                        )}
                                                        {sub.cancelReason && (
                                                            <div style={{ fontSize: '0.7rem', color: 'var(--danger-500)', marginTop: 2 }}>
                                                                {sub.cancelReason}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                        {new Date(sub.submittedAt).toLocaleTimeString()}
                                                    </td>
                                                    <td>
                                                        {sub.status !== 'Cancelled' && (
                                                            <button
                                                                className="btn btn-sm btn-danger"
                                                                onClick={() => {
                                                                    if (window.confirm(`Are you sure you want to CANCEL the exam for ${sub.studentInfo?.name || 'this student'}?\n\nThis will maintain their record but mark it invalid.`)) {
                                                                        cancelStudentExam(exam.id, sub.studentInfo, 'Teacher Manual Cancellation', sub.violations || 0)
                                                                    }
                                                                }}
                                                                title="Cancel this student's exam"
                                                            >
                                                                <Ban size={14} /> Cancel
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Exam Details */}
                        <div className="glass" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: 12 }}>Exam Details</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {[
                                    { icon: FileText, label: 'Title', value: exam.title },
                                    { icon: FileText, label: 'Questions', value: exam.questions?.length || 0 },
                                    { icon: Clock, label: 'Duration', value: `${exam.duration} minutes` },
                                    { icon: Shield, label: 'Proctoring', value: exam.settings?.proctoring ? 'Enabled' : 'Disabled' },
                                    { icon: Users, label: 'Submissions', value: exam.submissions?.length || 0 },
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
                                            <item.icon size={14} /> {item.label}
                                        </span>
                                        <strong>{item.value}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            {viewingLogs && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={() => setViewingLogs(null)}>
                    <div style={{
                        background: 'var(--bg-secondary)', padding: 24, borderRadius: 12,
                        width: '90%', maxWidth: 500, maxHeight: '80vh', overflowY: 'auto',
                        border: '1px solid var(--border-subtle)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Violation Logs</h3>
                            <button className="btn btn-sm btn-secondary" onClick={() => setViewingLogs(null)}>Close</button>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <strong>Student:</strong> {viewingLogs.studentInfo?.name} <br />
                            <strong>Status:</strong> {viewingLogs.status}
                        </div>

                        {viewingLogs.violationLogs && viewingLogs.violationLogs.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {viewingLogs.violationLogs.map((log, i) => (
                                    <div key={i} style={{
                                        padding: 12, background: 'rgba(239,68,68,0.1)',
                                        borderLeft: '4px solid var(--danger-500)', borderRadius: 4
                                    }}>
                                        <div style={{ fontWeight: 600, color: 'var(--danger-500)' }}>{log.reason}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                            Time: {log.time}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-muted)' }}>No detailed logs available for this submission.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
