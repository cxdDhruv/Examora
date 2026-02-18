import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useExam } from '../context/ExamContext'
import {
    GripVertical, Plus, Trash2, Settings, Eye,
    Clock, Shuffle, Lock, Copy, Send, Edit3, Check, X,
    ChevronDown, FileText, PenTool
} from 'lucide-react'
import './ExamBuilder.css'

export default function ExamBuilder() {
    const navigate = useNavigate()
    const { currentQuestions, uploadedFileName, addExam, publishExam } = useExam()

    // Start empty if no PDF questions, so teacher creates from scratch
    const [questions, setQuestions] = useState(
        currentQuestions.length > 0 ? currentQuestions : []
    )
    const [settings, setSettings] = useState({
        title: uploadedFileName
            ? uploadedFileName.replace(/\.[^/.]+$/, '') + ' — Exam'
            : '',
        duration: 60,
        shuffle: true,
        negativeMarking: false,
        fullscreen: true,
        proctoring: true,
        autoSubmit: true,
        maxViolations: 3,
    })
    const [showSettings, setShowSettings] = useState(true)
    const [editingId, setEditingId] = useState(null)
    const [showAddForm, setShowAddForm] = useState(false)

    // New question template
    const emptyQuestion = {
        type: 'MCQ',
        text: '',
        options: ['', '', '', ''],
        correct: 0,
        difficulty: 'Medium',
        points: 2,
    }
    const [newQ, setNewQ] = useState({ ...emptyQuestion })

    const removeQuestion = (id) => setQuestions(questions.filter(q => q.id !== id))
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)

    // Add new question
    const addQuestion = () => {
        if (!newQ.text.trim()) return
        const q = {
            ...newQ,
            id: Date.now(),
            options: newQ.type === 'Short Answer' ? null : newQ.options.filter(o => o.trim()),
            correct: newQ.type === 'Short Answer' ? null : newQ.correct,
        }
        setQuestions(prev => [...prev, q])
        setNewQ({ ...emptyQuestion })
        setShowAddForm(false)
    }

    // Edit question inline
    const updateQuestion = (id, field, value) => {
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q))
    }

    const updateOption = (qId, optIndex, value) => {
        setQuestions(prev => prev.map(q => {
            if (q.id === qId) {
                const opts = [...q.options]
                opts[optIndex] = value
                return { ...q, options: opts }
            }
            return q
        }))
    }

    const handlePublish = async () => {
        if (!settings.title.trim()) {
            alert('Please enter an exam title')
            return
        }
        if (questions.length === 0) {
            alert('Please add at least one question')
            return
        }
        try {
            const exam = await addExam({
                title: settings.title,
                duration: settings.duration,
                questions,
                settings,
                totalPoints,
            })
            await publishExam(exam.id)
            navigate(`/teacher/published/${exam.id}`)
        } catch (e) {
            alert("Failed to publish exam. Please try again.")
        }
    }

    return (
        <div className="page-wrapper">
            <Navbar />
            <Sidebar role="teacher" />
            <main className="main-content">
                <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1>Exam Builder</h1>
                        <p>{questions.length} question{questions.length !== 1 ? 's' : ''} • {totalPoints} total points</p>
                        {uploadedFileName && (
                            <p style={{ fontSize: '0.82rem', color: 'var(--primary-500)', marginTop: 4 }}>
                                📄 Questions from: <strong>{uploadedFileName}</strong>
                            </p>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button className="btn btn-secondary" onClick={() => setShowSettings(!showSettings)}>
                            <Settings size={16} /> Settings
                        </button>
                        <button className="btn btn-primary" onClick={handlePublish} disabled={questions.length === 0 || !settings.title.trim()}>
                            <Send size={16} /> Publish & Get QR Code
                        </button>
                    </div>
                </div>

                {/* Settings Panel */}
                {showSettings && (
                    <div className="settings-panel glass" style={{ marginBottom: 20 }}>
                        <h3>Exam Configuration</h3>
                        <div className="settings-grid">
                            <div className="input-group">
                                <label>Exam Title *</label>
                                <input className="input" placeholder="e.g. Physics Mid-Term 2026" value={settings.title} onChange={e => setSettings({ ...settings, title: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Duration (minutes)</label>
                                <input type="number" className="input" value={settings.duration} onChange={e => setSettings({ ...settings, duration: +e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Max Violations</label>
                                <input type="number" className="input" value={settings.maxViolations} onChange={e => setSettings({ ...settings, maxViolations: +e.target.value })} />
                            </div>
                        </div>
                        <div className="toggle-list">
                            {[
                                { key: 'shuffle', label: 'Auto-Shuffle Questions', icon: Shuffle },
                                { key: 'negativeMarking', label: 'Negative Marking', icon: Clock },
                                { key: 'fullscreen', label: 'Fullscreen Enforcement', icon: Lock },
                                { key: 'proctoring', label: 'AI Proctoring', icon: Eye },
                                { key: 'autoSubmit', label: 'Auto-Submit on Violations', icon: Clock },
                            ].map(({ key, label, icon: Icon }) => (
                                <div key={key} className="toggle-item" onClick={() => setSettings({ ...settings, [key]: !settings[key] })}>
                                    <Icon size={16} />
                                    <span>{label}</span>
                                    <div className={`toggle ${settings[key] ? 'active' : ''}`}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {questions.length === 0 && !showAddForm && (
                    <div style={{
                        textAlign: 'center', padding: '60px 20px',
                        background: 'white', borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-subtle)',
                    }}>
                        <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: 8 }}>No questions yet</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 24 }}>
                            Create questions manually or upload a PDF to auto-generate them
                        </p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                                <PenTool size={16} /> Create Manually
                            </button>
                            <button className="btn btn-secondary" onClick={() => navigate('/teacher/upload')}>
                                <FileText size={16} /> Upload PDF
                            </button>
                        </div>
                    </div>
                )}

                {/* Questions List */}
                <div className="builder-questions">
                    {questions.map((q, idx) => (
                        <div key={q.id} className="builder-q glass">
                            <div className="bq-drag"><GripVertical size={16} /></div>
                            <div className="bq-content">
                                <div className="bq-header">
                                    <span className="q-num">Q{idx + 1}</span>
                                    {editingId === q.id ? (
                                        <>
                                            <select className="input" value={q.difficulty} onChange={e => updateQuestion(q.id, 'difficulty', e.target.value)} style={{ width: 100, padding: '4px 8px', fontSize: '0.78rem' }}>
                                                <option>Easy</option>
                                                <option>Medium</option>
                                                <option>Hard</option>
                                            </select>
                                            <select className="input" value={q.type} onChange={e => updateQuestion(q.id, 'type', e.target.value)} style={{ width: 120, padding: '4px 8px', fontSize: '0.78rem' }}>
                                                <option>MCQ</option>
                                                <option>True/False</option>
                                                <option>Short Answer</option>
                                                <option>Code</option>
                                            </select>
                                            <input type="number" className="input" value={q.points} onChange={e => updateQuestion(q.id, 'points', +e.target.value)} style={{ width: 60, padding: '4px 8px', fontSize: '0.78rem' }} min={1} />
                                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>pts</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className={`badge ${q.difficulty === 'Easy' ? 'badge-success' : q.difficulty === 'Medium' ? 'badge-warning' : 'badge-danger'}`}>{q.difficulty}</span>
                                            <span className="badge badge-info">{q.type}</span>
                                            <span className="bq-points">{q.points} pts</span>
                                        </>
                                    )}
                                    <div className="bq-actions">
                                        {editingId === q.id ? (
                                            <button className="btn btn-sm btn-primary" onClick={() => setEditingId(null)}><Check size={12} /> Done</button>
                                        ) : (
                                            <button className="btn btn-sm btn-secondary" onClick={() => setEditingId(q.id)}><Edit3 size={12} /></button>
                                        )}
                                        <button className="btn btn-sm btn-secondary" onClick={() => setQuestions([...questions, { ...q, id: Date.now() }])}><Copy size={12} /></button>
                                        <button className="btn btn-sm btn-danger" onClick={() => removeQuestion(q.id)}><Trash2 size={12} /></button>
                                    </div>
                                </div>

                                {/* Question Text */}
                                {editingId === q.id ? (
                                    <textarea
                                        className="input"
                                        value={q.text}
                                        onChange={e => updateQuestion(q.id, 'text', e.target.value)}
                                        rows={2}
                                        style={{ width: '100%', marginBottom: 12, resize: 'vertical' }}
                                    />
                                ) : (
                                    <p className="bq-text">{q.text}</p>
                                )}

                                {/* Options */}
                                {q.options && (
                                    <div className="bq-options">
                                        {q.options.map((opt, j) => (
                                            <div key={j} className={`bq-opt ${q.correct === j ? 'correct' : ''}`} onClick={editingId === q.id ? () => updateQuestion(q.id, 'correct', j) : undefined} style={editingId === q.id ? { cursor: 'pointer' } : {}}>
                                                <span className="opt-letter">{String.fromCharCode(65 + j)}</span>
                                                {editingId === q.id ? (
                                                    <input className="input" value={opt} onChange={e => updateOption(q.id, j, e.target.value)} style={{ flex: 1, padding: '4px 8px', fontSize: '0.82rem', border: 'none', background: 'transparent' }} placeholder={`Option ${String.fromCharCode(65 + j)}`} />
                                                ) : (
                                                    opt
                                                )}
                                                {editingId === q.id && q.correct === j && <Check size={14} style={{ color: '#2e7d32', marginLeft: 'auto' }} />}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {editingId === q.id && q.options && (
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                                        💡 Click an option to mark it as the correct answer
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ADD NEW QUESTION FORM */}
                {showAddForm && (
                    <div className="builder-q glass" style={{ marginTop: 12, border: '2px solid var(--primary-500)' }}>
                        <div className="bq-content" style={{ width: '100%' }}>
                            <div className="bq-header" style={{ marginBottom: 16 }}>
                                <span className="q-num" style={{ fontSize: '0.92rem' }}>New Question</span>
                                <div className="bq-actions" style={{ marginLeft: 'auto' }}>
                                    <button className="btn btn-sm btn-primary" onClick={addQuestion} disabled={!newQ.text.trim()}>
                                        <Check size={12} /> Add
                                    </button>
                                    <button className="btn btn-sm btn-secondary" onClick={() => { setShowAddForm(false); setNewQ({ ...emptyQuestion }) }}>
                                        <X size={12} /> Cancel
                                    </button>
                                </div>
                            </div>

                            {/* Type, Difficulty, Points row */}
                            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                                <div className="input-group" style={{ flex: 1, minWidth: 120 }}>
                                    <label>Type</label>
                                    <select className="input" value={newQ.type} onChange={e => {
                                        const type = e.target.value
                                        setNewQ({
                                            ...newQ,
                                            type,
                                            options: (type === 'Short Answer' || type === 'Code') ? null : type === 'True/False' ? ['True', 'False'] : ['', '', '', ''],
                                            correct: (type === 'Short Answer' || type === 'Code') ? null : 0,
                                        })
                                    }}>
                                        <option>MCQ</option>
                                        <option>True/False</option>
                                        <option>Short Answer</option>
                                        <option>Code</option>
                                    </select>
                                </div>
                                <div className="input-group" style={{ flex: 1, minWidth: 100 }}>
                                    <label>Difficulty</label>
                                    <select className="input" value={newQ.difficulty} onChange={e => setNewQ({ ...newQ, difficulty: e.target.value })}>
                                        <option>Easy</option>
                                        <option>Medium</option>
                                        <option>Hard</option>
                                    </select>
                                </div>
                                <div className="input-group" style={{ flex: 0, minWidth: 80 }}>
                                    <label>Points</label>
                                    <input type="number" className="input" value={newQ.points} onChange={e => setNewQ({ ...newQ, points: +e.target.value })} min={1} />
                                </div>
                            </div>

                            {/* Question Text */}
                            <div className="input-group" style={{ marginBottom: 16 }}>
                                <label>Question Text *</label>
                                <textarea
                                    className="input"
                                    placeholder="Type your question here..."
                                    value={newQ.text}
                                    onChange={e => setNewQ({ ...newQ, text: e.target.value })}
                                    rows={3}
                                    style={{ resize: 'vertical', width: '100%' }}
                                    autoFocus
                                />
                            </div>

                            {/* Options (for MCQ / True/False) */}
                            {newQ.options && (
                                <div className="input-group" style={{ marginBottom: 12 }}>
                                    <label>Options (click to mark correct)</label>
                                    <div className="bq-options">
                                        {newQ.options.map((opt, j) => (
                                            <div key={j} className={`bq-opt ${newQ.correct === j ? 'correct' : ''}`} onClick={() => setNewQ({ ...newQ, correct: j })} style={{ cursor: 'pointer' }}>
                                                <span className="opt-letter">{String.fromCharCode(65 + j)}</span>
                                                {newQ.type === 'True/False' ? (
                                                    <span>{opt}</span>
                                                ) : (
                                                    <input
                                                        className="input"
                                                        placeholder={`Option ${String.fromCharCode(65 + j)}`}
                                                        value={opt}
                                                        onChange={e => {
                                                            const opts = [...newQ.options]
                                                            opts[j] = e.target.value
                                                            setNewQ({ ...newQ, options: opts })
                                                        }}
                                                        onClick={e => e.stopPropagation()}
                                                        style={{ flex: 1, border: 'none', background: 'transparent', padding: '4px 8px', fontSize: '0.82rem' }}
                                                    />
                                                )}
                                                {newQ.correct === j && <Check size={14} style={{ color: '#2e7d32', marginLeft: 'auto' }} />}
                                            </div>
                                        ))}
                                    </div>
                                    {newQ.type === 'MCQ' && (
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            style={{ marginTop: 8 }}
                                            onClick={() => setNewQ({ ...newQ, options: [...newQ.options, ''] })}
                                        >
                                            <Plus size={12} /> Add Option
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Add Question Button */}
                {!showAddForm && questions.length > 0 && (
                    <button className="add-question-btn glass" onClick={() => setShowAddForm(true)}>
                        <Plus size={20} /> Add Question
                    </button>
                )}
            </main>
        </div>
    )
}
