import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useExam } from '../context/ExamContext'
import {
    QrCode, Copy, CheckCircle, Share2, Download, ArrowLeft,
    Clock, FileText, Shield, Users, CloudUpload
} from 'lucide-react'
import './Dashboard.css'

export default function PublishedExam() {
    const { examId } = useParams()
    const navigate = useNavigate()
    const { getExamById, exams } = useExam()
    const [copied, setCopied] = useState(false)
    const [exporting, setExporting] = useState(false)

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
        URL.revokeObjectURL(url)
    }

    // ========== Google Drive Export ==========
    const exportToGoogleDrive = async () => {
        setExporting(true)
        try {
            // Generate CSV content
            const headers = ['Name', 'Email', 'Roll No', 'Section', 'Batch', 'Branch', 'Score', 'Violations', 'Status', 'Submitted At']
            const rows = (exam.submissions || []).map(sub => [
                sub.studentInfo?.name || '', sub.studentInfo?.email || '',
                sub.studentInfo?.rollNo || '', sub.studentInfo?.section || '',
                sub.studentInfo?.batch || '', sub.studentInfo?.branch || '',
                sub.score !== undefined ? sub.score : '', sub.violations || 0,
                sub.status || '', sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '',
            ])
            const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')

            // Use Google Drive API (requires gapi loaded)
            // For now, download as CSV since Drive API needs API key setup
            const blob = new Blob([csvContent], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${exam.title.replace(/\s+/g, '_')}_drive_export.csv`
            link.click()
            URL.revokeObjectURL(url)
            alert('CSV downloaded! You can upload this to Google Drive manually, or configure the Google Drive API for automatic upload.')
        } catch (err) {
            console.error('Export failed:', err)
            alert('Export failed. Please try again.')
        }
        setExporting(false)
    }

    const exam = getExamById(examId)

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

    // Encode exam data into the URL so students on any device can take the exam
    const examPayload = {
        id: exam.id,
        title: exam.title,
        code: exam.code,
        questions: exam.questions,
        duration: exam.duration,
        totalPoints: exam.totalPoints,
        settings: exam.settings,
    }
    const encodedExam = btoa(unescape(encodeURIComponent(JSON.stringify(examPayload))))
    const basePath = import.meta.env.BASE_URL || '/'
    const joinUrl = `${window.location.origin}${basePath}#/join/${exam.code}?d=${encodedExam}`

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
                            <QrCode size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                            Scan QR Code
                        </h3>
                        <div style={{ background: '#fff', padding: 24, borderRadius: 16, display: 'inline-block', marginBottom: 16 }}>
                            <QRCodeSVG
                                value={joinUrl}
                                size={220}
                                level="H"
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
                        </div>

                        {/* Student Submissions Table */}
                        <div className="glass" style={{ padding: 24, gridColumn: '1 / -1' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Student Submissions</h3>
                                {exam.submissions && exam.submissions.length > 0 && (
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn btn-secondary btn-sm" onClick={downloadCSV}>
                                            <Download size={14} /> Download CSV
                                        </button>
                                        <button className="btn btn-primary btn-sm" onClick={exportToGoogleDrive} disabled={exporting}>
                                            <CloudUpload size={14} /> {exporting ? 'Exporting...' : 'Export to Drive'}
                                        </button>
                                    </div>
                                )}
                            </div>
                            {(!exam.submissions || exam.submissions.length === 0) ? (
                                <p style={{ color: 'var(--text-muted)' }}>No submissions yet.</p>
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
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {exam.submissions.map((sub, i) => (
                                                <tr key={i}>
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
                                                            sub.status === 'Flagged' ? 'badge-warning' : 'badge-danger'
                                                            }`}>
                                                            {sub.status}
                                                        </span>
                                                        {sub.violations > 0 && (
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--danger-400)', display: 'block' }}>
                                                                {sub.violations} violations
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                        {new Date(sub.submittedAt).toLocaleTimeString()}
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
        </div>
    )
}
