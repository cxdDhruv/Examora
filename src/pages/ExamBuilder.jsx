import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useExam } from '../context/ExamContext'
import {
    GripVertical, Plus, Trash2, Settings, Save, Eye,
    Clock, Shuffle, Lock, Copy, Send
} from 'lucide-react'
import './ExamBuilder.css'

const defaultQuestions = [
    { id: 1, type: 'MCQ', text: "What is Newton's Second Law of Motion?", options: ['F = ma', 'F = mv', 'E = mc²', 'v = at'], correct: 0, difficulty: 'Medium', points: 2 },
    { id: 2, type: 'True/False', text: 'Acceleration is a vector quantity.', options: ['True', 'False'], correct: 0, difficulty: 'Easy', points: 1 },
    { id: 3, type: 'MCQ', text: 'A 5kg object accelerates at 3 m/s². What is the net force?', options: ['15 N', '8 N', '1.67 N', '2 N'], correct: 0, difficulty: 'Hard', points: 3 },
    { id: 4, type: 'Short Answer', text: 'Explain the relationship between mass, force, and acceleration.', options: null, correct: null, difficulty: 'Hard', points: 5 },
    { id: 5, type: 'MCQ', text: 'Which of these is NOT a fundamental force?', options: ['Gravity', 'Electromagnetic', 'Centrifugal', 'Strong Nuclear'], correct: 2, difficulty: 'Easy', points: 1 },
]

export default function ExamBuilder() {
    const navigate = useNavigate()
    const { currentQuestions, uploadedFileName, addExam, publishExam } = useExam()

    // Use questions from document upload if available, otherwise use defaults
    const [questions, setQuestions] = useState(
        currentQuestions.length > 0 ? currentQuestions : defaultQuestions
    )
    const [settings, setSettings] = useState({
        title: uploadedFileName
            ? uploadedFileName.replace(/\.[^/.]+$/, '') + ' — Exam'
            : 'Physics Mid-Term Examination',
        duration: 90,
        shuffle: true,
        negativeMarking: false,
        fullscreen: true,
        proctoring: true,
        autoSubmit: true,
        maxViolations: 3,
    })
    const [showSettings, setShowSettings] = useState(false)

    const removeQuestion = (id) => setQuestions(questions.filter(q => q.id !== id))
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)

    const handlePublish = () => {
        const exam = addExam({
            title: settings.title,
            duration: settings.duration,
            questions,
            settings,
            totalPoints,
        })
        publishExam(exam.id)
        navigate(`/teacher/published/${exam.id}`)
    }

    return (
        <div className="page-wrapper">
            <Navbar user={{ name: 'Dhruv Patel', role: 'teacher' }} />
            <Sidebar role="teacher" />
            <main className="main-content">
                <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1>Exam Builder</h1>
                        <p>{questions.length} questions • {totalPoints} total points</p>
                        {uploadedFileName && (
                            <p style={{ fontSize: '0.82rem', color: 'var(--primary-300)', marginTop: 4 }}>
                                📄 Questions generated from: <strong>{uploadedFileName}</strong>
                            </p>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button className="btn btn-secondary" onClick={() => setShowSettings(!showSettings)}>
                            <Settings size={16} /> Settings
                        </button>
                        <button className="btn btn-secondary"><Eye size={16} /> Preview</button>
                        <button className="btn btn-primary" onClick={handlePublish}>
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
                                <label>Exam Title</label>
                                <input className="input" value={settings.title} onChange={e => setSettings({ ...settings, title: e.target.value })} />
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

                {/* Questions List */}
                <div className="builder-questions">
                    {questions.map((q, idx) => (
                        <div key={q.id} className="builder-q glass">
                            <div className="bq-drag"><GripVertical size={16} /></div>
                            <div className="bq-content">
                                <div className="bq-header">
                                    <span className="q-num">Q{idx + 1}</span>
                                    <span className={`badge ${q.difficulty === 'Easy' ? 'badge-success' : q.difficulty === 'Medium' ? 'badge-warning' : 'badge-danger'}`}>{q.difficulty}</span>
                                    <span className="badge badge-info">{q.type}</span>
                                    <span className="bq-points">{q.points} pts</span>
                                    <div className="bq-actions">
                                        <button className="btn btn-sm btn-secondary" onClick={() => setQuestions([...questions, { ...q, id: Date.now() }])}><Copy size={12} /></button>
                                        <button className="btn btn-sm btn-danger" onClick={() => removeQuestion(q.id)}><Trash2 size={12} /></button>
                                    </div>
                                </div>
                                <p className="bq-text">{q.text}</p>
                                {q.options && (
                                    <div className="bq-options">
                                        {q.options.map((opt, j) => (
                                            <div key={j} className={`bq-opt ${q.correct === j ? 'correct' : ''}`}>
                                                <span className="opt-letter">{String.fromCharCode(65 + j)}</span>
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <button className="add-question-btn glass" onClick={() => setQuestions([...questions, { id: Date.now(), type: 'MCQ', text: 'New question...', options: ['Option A', 'Option B', 'Option C', 'Option D'], correct: 0, difficulty: 'Medium', points: 2 }])}>
                    <Plus size={20} /> Add Question
                </button>
            </main>
        </div>
    )
}
