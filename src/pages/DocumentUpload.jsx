import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useExam } from '../context/ExamContext'
import {
    Upload, FileText, File, CheckCircle, Brain, Sparkles,
    Loader, ChevronRight, Download, RefreshCw, Settings2, AlertCircle
} from 'lucide-react'
import './Upload.css'

export default function DocumentUpload() {
    const navigate = useNavigate()
    const fileInputRef = useRef(null)
    const { generateQuestions, currentQuestions, setCurrentQuestions, setUploadedFileName, setExtractedText } = useExam()

    const [stage, setStage] = useState('upload') // upload, configure, processing, done
    const [progress, setProgress] = useState(0)
    const [file, setFile] = useState(null)
    const [error, setError] = useState('')
    const [rawText, setRawText] = useState('')
    const [pageCount, setPageCount] = useState(1)

    // Teacher Configuration
    const [questionCount, setQuestionCount] = useState(10)
    const [selectedTypes, setSelectedTypes] = useState({ MCQ: true, 'True/False': true, 'Fill Blank': true, 'Short Answer': true })
    const [difficultyDist, setDifficultyDist] = useState({ Easy: 30, Medium: 50, Hard: 20 })

    const [pipelineSteps, setPipelineSteps] = useState([
        { label: 'Reading File', done: false },
        { label: 'Text Extraction', done: false },
        { label: 'NLP Processing', done: false },
        { label: 'Key Concept Extraction', done: false },
        { label: 'Question Generation', done: false },
        { label: 'Distractor Generation', done: false },
    ])

    const updatePipeline = (index) => {
        setPipelineSteps(prev => prev.map((s, i) => i <= index ? { ...s, done: true } : s))
    }

    // Extract text from PDF using pdfjs-dist
    const extractTextFromPDF = async (arrayBuffer) => {
        try {
            const pdfjsLib = await import('pdfjs-dist')
            // Use the CDN worker matching the installed version
            const version = pdfjsLib.version || '4.9.155'
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`

            const loadingTask = pdfjsLib.getDocument({
                data: arrayBuffer,
                useWorkerFetch: false,
                isEvalSupported: false,
                useSystemFonts: true,
            })

            const pdf = await loadingTask.promise
            let fullText = ''

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i)
                const content = await page.getTextContent()
                const pageText = content.items.map(item => item.str).join(' ')
                fullText += pageText + '\n'
            }

            if (fullText.trim().length < 20) {
                throw new Error('Could not extract meaningful text from PDF')
            }

            return { text: fullText, pages: pdf.numPages }
        } catch (pdfError) {
            console.warn('PDF.js extraction failed, using fallback:', pdfError)
            // Fallback: try reading raw text from the PDF bytes
            return extractTextFallback(arrayBuffer)
        }
    }

    // Fallback text extraction from raw PDF bytes
    const extractTextFallback = (arrayBuffer) => {
        const uint8Array = new Uint8Array(arrayBuffer)
        const rawText = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array)
        // Extract readable text between PDF stream markers
        const textChunks = []
        const textRegex = /\(([^)]{3,})\)/g
        let match
        while ((match = textRegex.exec(rawText)) !== null) {
            const chunk = match[1].replace(/\\[nrt]/g, ' ').trim()
            if (chunk.length > 3 && /[a-zA-Z]/.test(chunk)) {
                textChunks.push(chunk)
            }
        }
        // Also try BT...ET blocks
        const btRegex = /BT\s*([\s\S]*?)ET/g
        while ((match = btRegex.exec(rawText)) !== null) {
            const inner = match[1]
            const tjRegex = /\(([^)]{2,})\)/g
            let m2
            while ((m2 = tjRegex.exec(inner)) !== null) {
                const t = m2[1].trim()
                if (t.length > 2) textChunks.push(t)
            }
        }
        const extractedText = textChunks.join('. ')
        return {
            text: extractedText.length > 30 ? extractedText : 'Document text could not be fully extracted. The PDF may contain images or scanned content.',
            pages: Math.max(1, Math.floor(arrayBuffer.byteLength / 3000))
        }
    }

    // Extract text from TXT file
    const extractTextFromTXT = async (file) => {
        const text = await file.text()
        const lines = text.split('\n').length
        return { text, pages: Math.ceil(lines / 40) }
    }

    // Main upload handler
    const handleFileSelect = async (e) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        const validTypes = [
            'application/pdf',
            'text/plain',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ]
        const ext = selectedFile.name.split('.').pop().toLowerCase()

        if (!validTypes.includes(selectedFile.type) && !['pdf', 'txt', 'docx'].includes(ext)) {
            setError('Please upload a PDF, DOCX, or TXT file.')
            return
        }

        if (selectedFile.size > 50 * 1024 * 1024) {
            setError('File size must be under 50MB.')
            return
        }

        setError('')
        setFile({
            name: selectedFile.name,
            size: (selectedFile.size / (1024 * 1024)).toFixed(1) + ' MB',
            type: ext.toUpperCase(),
        })

        try {
            // Step 1: Reading file
            let extractedTextResult = ''
            let pageCountResult = 1

            if (ext === 'pdf') {
                const arrayBuffer = await selectedFile.arrayBuffer()
                const result = await extractTextFromPDF(arrayBuffer)
                extractedTextResult = result.text
                pageCountResult = result.pages
            } else if (ext === 'txt') {
                const result = await extractTextFromTXT(selectedFile)
                extractedTextResult = result.text
                pageCountResult = result.pages
            } else if (ext === 'docx') {
                const text = await selectedFile.text()
                extractedTextResult = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ')
                pageCountResult = Math.ceil(extractedTextResult.length / 3000)
            }

            setRawText(extractedTextResult)
            setPageCount(pageCountResult)
            setFile(prev => ({ ...prev, pages: pageCountResult }))
            setUploadedFileName(selectedFile.name)
            setExtractedText(extractedTextResult)

            // Move to configuration stage
            setStage('configure')

        } catch (err) {
            console.error('Processing error:', err)
            setError('Error processing file: ' + err.message)
            setStage('upload')
        }
    }

    // Run question generation after teacher configures
    const runGeneration = async () => {
        setStage('processing')
        setProgress(0)

        try {
            setProgress(5)
            updatePipeline(0)
            await new Promise(r => setTimeout(r, 500))

            updatePipeline(1)
            setProgress(30)

            // Step 3: NLP Processing
            await new Promise(r => setTimeout(r, 800))
            updatePipeline(2)
            setProgress(50)

            // Step 4: Key Concept Extraction
            await new Promise(r => setTimeout(r, 600))
            updatePipeline(3)
            setProgress(65)

            // Step 5: Question Generation with teacher config
            await new Promise(r => setTimeout(r, 700))
            const activeTypes = Object.entries(selectedTypes).filter(([, v]) => v).map(([k]) => k)
            const questions = generateQuestions(rawText, questionCount, { types: activeTypes, difficulty: difficultyDist })
            updatePipeline(4)
            setProgress(85)

            // Step 6: Distractor Generation
            await new Promise(r => setTimeout(r, 500))
            updatePipeline(5)
            setProgress(100)

            await new Promise(r => setTimeout(r, 400))
            setStage('done')
        } catch (err) {
            console.error('Generation error:', err)
            setError('Error generating questions: ' + err.message)
            setStage('configure')
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        const file = e.dataTransfer.files?.[0]
        if (file) {
            const input = fileInputRef.current
            const dataTransfer = new DataTransfer()
            dataTransfer.items.add(file)
            input.files = dataTransfer.files
            handleFileSelect({ target: input })
        }
    }

    const resetUpload = () => {
        setStage('upload')
        setFile(null)
        setRawText('')
        setProgress(0)
        setCurrentQuestions([])
        setError('')
        setPipelineSteps(prev => prev.map(s => ({ ...s, done: false })))
    }

    const deleteQuestion = (qId) => {
        setCurrentQuestions(prev => prev.filter(q => q.id !== qId))
    }

    const toggleType = (type) => {
        setSelectedTypes(prev => ({ ...prev, [type]: !prev[type] }))
    }

    return (
        <div className="page-wrapper">
            <Navbar />
            <Sidebar role="teacher" />
            <main className="main-content">
                <div className="page-header">
                    <h1>📄 Upload Document & Generate Questions</h1>
                    <p>Upload a PDF, DOCX, or TXT from your device — AI will extract text and generate exam questions</p>
                </div>

                {error && (
                    <div className="error-banner glass" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', marginBottom: 16, borderColor: 'rgba(239,68,68,0.3)' }}>
                        <AlertCircle size={18} color="var(--danger-400)" />
                        <span style={{ color: 'var(--danger-400)' }}>{error}</span>
                    </div>
                )}

                {/* Upload Zone */}
                {stage === 'upload' && (
                    <motion.div
                        className="upload-zone glass"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={e => e.preventDefault()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.docx,.txt"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                        <div className="upload-icon">
                            <Upload size={40} />
                        </div>
                        <h3>Drop your document here or click to upload</h3>
                        <p>Supports PDF, DOCX, TXT — Max 50MB</p>
                        <div className="upload-formats">
                            <span><FileText size={14} /> PDF</span>
                            <span><File size={14} /> DOCX</span>
                            <span><FileText size={14} /> TXT</span>
                        </div>
                        <p style={{ marginTop: 16, fontSize: '0.82rem', color: 'var(--primary-300)' }}>
                            📱 Works on desktop, laptop, tablet, and phone
                        </p>
                    </motion.div>
                )}

                {/* ===== Configuration Panel ===== */}
                {stage === 'configure' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="glass" style={{ padding: 28, marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                <Settings2 size={22} color="var(--primary-400)" />
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Configure Question Generation</h3>
                                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                        {file?.name} — {file?.pages} pages • {rawText.split(/\s+/).length} words extracted
                                    </p>
                                </div>
                            </div>

                            {/* Question Count */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ fontSize: '0.88rem', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                                    Number of Questions: <strong style={{ color: 'var(--primary-400)' }}>{questionCount}</strong>
                                </label>
                                <input
                                    type="range" min={5} max={30} value={questionCount}
                                    onChange={e => setQuestionCount(Number(e.target.value))}
                                    style={{ width: '100%', accentColor: 'var(--primary-500)' }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    <span>5</span><span>15</span><span>30</span>
                                </div>
                            </div>

                            {/* Question Types */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ fontSize: '0.88rem', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                                    Question Types
                                </label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {Object.entries(selectedTypes).map(([type, active]) => (
                                        <button key={type}
                                            className={`btn btn-sm ${active ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => toggleType(type)}
                                            style={{ fontSize: '0.82rem' }}
                                        >
                                            {active ? '✓ ' : ''}{type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Difficulty Distribution */}
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ fontSize: '0.88rem', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                                    Difficulty Distribution
                                </label>
                                {Object.entries(difficultyDist).map(([level, pct]) => (
                                    <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                        <span style={{
                                            width: 70, fontSize: '0.82rem', fontWeight: 600,
                                            color: level === 'Easy' ? 'var(--success-400)' : level === 'Medium' ? 'var(--warning-400)' : 'var(--danger-400)'
                                        }}>
                                            {level}
                                        </span>
                                        <input
                                            type="range" min={0} max={100} value={pct}
                                            onChange={e => setDifficultyDist(prev => ({ ...prev, [level]: Number(e.target.value) }))}
                                            style={{ flex: 1, accentColor: level === 'Easy' ? '#4ade80' : level === 'Medium' ? '#fbbf24' : '#f87171' }}
                                        />
                                        <span style={{ width: 35, fontSize: '0.82rem', fontWeight: 600, textAlign: 'right' }}>{pct}%</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button className="btn btn-secondary" onClick={resetUpload}>
                                    ← Upload Different File
                                </button>
                                <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={runGeneration}>
                                    <Sparkles size={18} /> Generate {questionCount} Questions
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Processing */}
                {stage === 'processing' && (
                    <motion.div className="processing-card glass" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="processing-header">
                            <Loader size={24} className="spin" />
                            <div>
                                <h3>Processing Document</h3>
                                <p>{file?.name} — {file?.pages || '...'} pages</p>
                            </div>
                        </div>

                        <div className="processing-pipeline">
                            {pipelineSteps.map((step, i) => (
                                <div key={i} className={`pipeline-step ${step.done ? 'done' : progress > i * 15 ? 'active' : ''}`}>
                                    <div className="step-indicator">
                                        {step.done ? <CheckCircle size={16} /> : <div className="step-dot"></div>}
                                    </div>
                                    <span>{step.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="progress-bar" style={{ marginTop: 24 }}>
                            <div className="fill" style={{ width: `${progress}%` }}></div>
                        </div>
                        <p style={{ textAlign: 'center', marginTop: 8, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{progress}% complete</p>
                    </motion.div>
                )}

                {/* Generated Questions */}
                {stage === 'done' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="gen-success glass">
                            <div className="gen-success-icon">
                                <Sparkles size={28} />
                            </div>
                            <div>
                                <h3>✨ AI Generated {currentQuestions.length} Questions!</h3>
                                <p>From <strong>{file?.name}</strong> — {file?.pages} pages analyzed</p>
                            </div>
                            <div className="gen-success-actions">
                                <button className="btn btn-secondary btn-sm" onClick={resetUpload}><RefreshCw size={14} /> Upload New</button>
                            </div>
                        </div>

                        {/* Difficulty Distribution */}
                        <div className="diff-dist glass" style={{ marginTop: 16 }}>
                            <h4>Difficulty Distribution</h4>
                            <div className="diff-bars">
                                {['Easy', 'Medium', 'Hard'].map(d => {
                                    const count = currentQuestions.filter(q => q.difficulty === d).length
                                    const pct = currentQuestions.length ? (count / currentQuestions.length * 100) : 0
                                    return (
                                        <div key={d} className="diff-bar">
                                            <span>{d}</span>
                                            <div className="progress-bar">
                                                <div className="fill" style={{
                                                    width: `${pct}%`,
                                                    background: d === 'Easy' ? 'var(--success-400)' : d === 'Medium' ? 'var(--warning-400)' : 'var(--danger-400)'
                                                }}></div>
                                            </div>
                                            <span>{count}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Questions List */}
                        <div className="questions-list" style={{ marginTop: 16 }}>
                            {currentQuestions.map((q, i) => (
                                <div key={q.id} className="question-card glass">
                                    <div className="q-header" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                                        <span className="q-num">Q{i + 1}</span>
                                        <span className={`badge ${q.difficulty === 'Easy' ? 'badge-success' : q.difficulty === 'Medium' ? 'badge-warning' : 'badge-danger'}`}>{q.difficulty}</span>
                                        <span className="badge badge-info">{q.type}</span>
                                        <span className="bloom-tag">{q.bloom}</span>
                                        <button onClick={() => deleteQuestion(q.id)} style={{
                                            marginLeft: 'auto', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                                            color: 'var(--danger-400)', borderRadius: 6, padding: '4px 10px', fontSize: '0.75rem',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                                        }}>
                                            🗑️ Remove
                                        </button>
                                    </div>
                                    <p className="q-text">{q.text}</p>
                                    {q.options && (
                                        <div className="q-options">
                                            {q.options.map((opt, j) => (
                                                <div key={j} className={`q-opt ${q.correct === j ? 'correct' : ''}`}>
                                                    <span className="opt-letter">{String.fromCharCode(65 + j)}</span>
                                                    {opt}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {q.answer && (
                                        <div className="q-answer">
                                            <strong>Answer:</strong> {q.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button className="btn btn-secondary btn-lg" onClick={resetUpload}>
                                <Upload size={18} /> Upload Another Document
                            </button>
                            <button className="btn btn-primary btn-lg" onClick={() => navigate('/teacher/exam-builder')}>
                                Create Exam & Publish <ChevronRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    )
}
