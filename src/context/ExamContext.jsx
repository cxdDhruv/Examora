import { createContext, useContext, useState, useEffect } from 'react'

const ExamContext = createContext()

// ============================================================
// ROBUST Question Generator — works with any extracted text
// ============================================================
function generateQuestionsFromText(text, count = 10, config = {}) {
    const { types, difficulty: difficultyConfig } = config || {}
    if (!text || text.trim().length < 30) {
        return getDefaultQuestions()
    }

    // Clean the text
    const cleanText = text
        .replace(/\r\n/g, '\n')
        .replace(/\s+/g, ' ')
        .trim()

    // Split into sentences more robustly
    const sentences = cleanText
        .split(/(?<=[.!?])\s+|(?<=\n)\s*/)
        .map(s => s.trim())
        .filter(s => {
            // Accept any sentence with at least 10 chars and at least 3 words
            const words = s.split(/\s+/)
            return s.length >= 10 && words.length >= 3
        })

    // Also extract phrases from longer chunks
    const chunks = cleanText.split(/\n+/).filter(c => c.trim().length > 15)

    // Combine sources
    const allSources = [...sentences]
    if (allSources.length < count) {
        chunks.forEach(chunk => {
            if (!allSources.includes(chunk) && chunk.length > 15) {
                allSources.push(chunk)
            }
        })
    }

    if (allSources.length === 0) {
        return getDefaultQuestions()
    }

    // Extract key words/terms from the entire text
    const stopWords = new Set([
        'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
        'in', 'with', 'to', 'for', 'of', 'not', 'no', 'can', 'had', 'has',
        'have', 'was', 'were', 'been', 'will', 'would', 'could', 'should',
        'may', 'might', 'shall', 'do', 'does', 'did', 'are', 'this', 'that',
        'these', 'those', 'from', 'by', 'as', 'it', 'its', 'they', 'their',
        'them', 'we', 'our', 'you', 'your', 'he', 'she', 'his', 'her',
        'also', 'than', 'then', 'when', 'where', 'how', 'what', 'who', 'whom',
        'more', 'most', 'some', 'any', 'all', 'each', 'every', 'both',
        'into', 'through', 'during', 'before', 'after', 'above', 'below',
        'between', 'such', 'only', 'very', 'just', 'about', 'being', 'over',
        'other', 'there', 'here', 'much', 'many', 'well', 'back', 'even',
        'because', 'since', 'until', 'while',
    ])

    const allWords = cleanText
        .replace(/[^a-zA-Z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3 && !stopWords.has(w.toLowerCase()))

    // Count word frequency to find important terms
    const wordFreq = {}
    allWords.forEach(w => {
        const lower = w.toLowerCase()
        wordFreq[lower] = (wordFreq[lower] || 0) + 1
    })

    const importantWords = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 40)
        .map(([word]) => word)

    const questions = []
    // Use teacher-selected types or defaults
    const allowedTypes = types && types.length > 0 ? types : ['MCQ', 'True/False', 'Fill Blank', 'Short Answer']
    const difficulties = ['Easy', 'Medium', 'Hard']
    const blooms = ['Remembering', 'Understanding', 'Applying', 'Analyzing', 'Evaluating']

    for (let i = 0; i < Math.min(count, Math.max(allSources.length, 5)); i++) {
        const srcIdx = i % allSources.length
        const sentence = allSources[srcIdx]
        const type = allowedTypes[i % allowedTypes.length]
        // Use difficulty distribution if provided
        let difficulty
        if (difficultyConfig) {
            const total = difficultyConfig.Easy + difficultyConfig.Medium + difficultyConfig.Hard
            const rand = Math.random() * total
            if (rand < difficultyConfig.Easy) difficulty = 'Easy'
            else if (rand < difficultyConfig.Easy + difficultyConfig.Medium) difficulty = 'Medium'
            else difficulty = 'Hard'
        } else {
            difficulty = difficulties[i % 3]
        }
        const bloom = blooms[i % blooms.length]

        // Find a key term in this sentence
        const sentWords = sentence.split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w.toLowerCase()))
        const keyWord = sentWords.length > 0
            ? sentWords[Math.floor(sentWords.length / 2)].replace(/[^a-zA-Z0-9]/g, '')
            : importantWords[i % importantWords.length] || 'concept'

        const cleanSentence = sentence.length > 150 ? sentence.substring(0, 150) + '...' : sentence

        let question = null

        if (type === 'MCQ') {
            // Generate 3 distractor options from other important words
            const distractors = importantWords
                .filter(w => w.toLowerCase() !== keyWord.toLowerCase())
                .slice(0, 10)

            const options = [keyWord]
            for (let d = 0; d < 3 && d < distractors.length; d++) {
                options.push(distractors[(i + d) % distractors.length])
            }
            // Pad if needed
            while (options.length < 4) {
                options.push(`Option ${String.fromCharCode(65 + options.length)}`)
            }

            // Shuffle
            const shuffled = [...options].sort(() => Math.random() - 0.5)

            question = {
                id: Date.now() + i + Math.random(),
                type: 'MCQ',
                text: `According to the document: "${cleanSentence}" — Which term is most relevant?`,
                options: shuffled,
                correct: shuffled.indexOf(keyWord),
                difficulty,
                bloom,
                points: difficulty === 'Hard' ? 3 : difficulty === 'Medium' ? 2 : 1,
            }
        } else if (type === 'True/False') {
            question = {
                id: Date.now() + i + Math.random(),
                type: 'True/False',
                text: `True or False: "${cleanSentence}"`,
                options: ['True', 'False'],
                correct: 0,
                difficulty: 'Easy',
                bloom: 'Remembering',
                points: 1,
            }
        } else if (type === 'Fill Blank') {
            const blanked = sentence.replace(
                new RegExp(`\\b${keyWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'),
                '________'
            )
            question = {
                id: Date.now() + i + Math.random(),
                type: 'Fill Blank',
                text: blanked !== sentence ? blanked : `Complete: "${cleanSentence.substring(0, 80)}... ________"`,
                options: null,
                correct: null,
                answer: keyWord,
                difficulty: 'Medium',
                bloom: 'Applying',
                points: 2,
            }
        } else {
            question = {
                id: Date.now() + i + Math.random(),
                type: 'Short Answer',
                text: `In your own words, explain: "${cleanSentence}"`,
                options: null,
                correct: null,
                difficulty: 'Hard',
                bloom: 'Evaluating',
                points: 5,
            }
        }

        if (question) questions.push(question)
    }

    return questions.length > 0 ? questions : getDefaultQuestions()
}

function getDefaultQuestions() {
    return [
        { id: 1, type: 'MCQ', text: 'What is the main topic of this document?', options: ['Topic A', 'Topic B', 'Topic C', 'Topic D'], correct: 0, difficulty: 'Easy', bloom: 'Remembering', points: 1 },
        { id: 2, type: 'True/False', text: 'The document covers important concepts.', options: ['True', 'False'], correct: 0, difficulty: 'Easy', bloom: 'Remembering', points: 1 },
        { id: 3, type: 'MCQ', text: 'Which concept is discussed in detail?', options: ['Concept 1', 'Concept 2', 'Concept 3', 'Concept 4'], correct: 0, difficulty: 'Medium', bloom: 'Understanding', points: 2 },
        { id: 4, type: 'Short Answer', text: 'Summarize the key points from the document.', options: null, correct: null, difficulty: 'Hard', bloom: 'Evaluating', points: 5 },
        { id: 5, type: 'Fill Blank', text: 'The main subject of this document is ________.', options: null, correct: null, answer: 'the topic', difficulty: 'Medium', bloom: 'Applying', points: 2 },
    ]
}

// Generate unique exam code
function generateExamCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
    return code
}

// Get storage key scoped to current user's email
function getUserKey(base) {
    const email = localStorage.getItem('user_email') || 'anonymous'
    return `${base}_${email}`
}

// Load from localStorage (per-user)
function loadExams() {
    try {
        const data = localStorage.getItem(getUserKey('examai_exams'))
        return data ? JSON.parse(data) : []
    } catch { return [] }
}

function loadCheatingReports() {
    try {
        const data = localStorage.getItem(getUserKey('examai_cheating_reports'))
        return data ? JSON.parse(data) : []
    } catch { return [] }
}

function saveExams(exams) {
    localStorage.setItem(getUserKey('examai_exams'), JSON.stringify(exams))
}

function saveCheatingReports(reports) {
    localStorage.setItem(getUserKey('examai_cheating_reports'), JSON.stringify(reports))
}

// Clean up old shared keys (one-time migration)
function cleanOldData() {
    localStorage.removeItem('examai_exams')
    localStorage.removeItem('examai_cheating_reports')
}

export function ExamProvider({ children }) {
    const [exams, setExams] = useState(() => {
        cleanOldData()
        return loadExams()
    })
    const [cheatingReports, setCheatingReports] = useState(() => loadCheatingReports())
    const [currentQuestions, setCurrentQuestions] = useState([])
    const [uploadedFileName, setUploadedFileName] = useState('')
    const [extractedText, setExtractedText] = useState('')

    useEffect(() => { saveExams(exams) }, [exams])
    useEffect(() => { saveCheatingReports(cheatingReports) }, [cheatingReports])

    const addExam = (exam) => {
        const newExam = {
            ...exam,
            id: Date.now(),
            code: generateExamCode(),
            createdAt: new Date().toISOString(),
            createdBy: localStorage.getItem('user_email') || 'unknown',
            status: 'Draft',
            submissions: [],
        }
        setExams(prev => [newExam, ...prev])
        return newExam
    }

    const publishExam = (examId) => {
        setExams(prev => prev.map(e => e.id === examId ? { ...e, status: 'Published' } : e))
    }

    const updateExam = (examId, updates) => {
        setExams(prev => prev.map(e => e.id === examId ? { ...e, ...updates } : e))
    }

    const submitExamAnswers = (examId, answers, studentInfo, violations) => {
        setExams(prev => prev.map(e => {
            if (e.id === examId) {
                return {
                    ...e,
                    submissions: [...(e.submissions || []), {
                        studentInfo, // Store full object
                        answers,
                        violations,
                        submittedAt: new Date().toISOString(),
                        status: violations > 0 ? 'Flagged' : 'Clean',
                        score: calculateScore(e.questions, answers)
                    }]
                }
            }
            return e
        }))
    }

    const calculateScore = (questions, answers) => {
        return questions.reduce((total, q) => {
            if (q.type === 'MCQ' || q.type === 'True/False') {
                return total + (answers[q.id] === q.correct ? q.points : 0)
            }
            // For text answers, we can't auto-grade yet, so 0 or manual
            return total
        }, 0)
    }

    // CHEATING REPORT SYSTEM
    const reportCheating = (report) => {
        const newReport = {
            id: Date.now(),
            ...report,
            reportedAt: new Date().toISOString(),
            reviewed: false,
        }
        setCheatingReports(prev => [newReport, ...prev])
        return newReport
    }

    // Cancel an exam for a specific student (mark as cancelled due to cheating)
    // Cancel an exam for a specific student (mark as cancelled due to cheating)
    const cancelStudentExam = (examId, studentInfo, reason, violations) => {
        // Add to cheating reports
        reportCheating({
            examId,
            studentName: studentInfo.name,
            reason,
            violations,
            severity: violations >= 3 ? 'Critical' : violations >= 2 ? 'High' : 'Medium',
            action: 'Exam Cancelled — Auto-submitted',
        })

        // Mark the submission as cancelled
        setExams(prev => prev.map(e => {
            if (e.id === examId) {
                return {
                    ...e,
                    submissions: [...(e.submissions || []), {
                        studentInfo,
                        answers: {},
                        violations,
                        submittedAt: new Date().toISOString(),
                        status: 'Cancelled',
                        cancelReason: reason,
                        score: 0
                    }]
                }
            }
            return e
        }))
    }

    // IMPORT SUBMISSIONS (Manual Sync)
    const importSubmission = (examId, submissionData) => {
        setExams(prev => prev.map(e => {
            if (e.id === examId) {
                // Check for duplicates based on rollNo
                const existing = e.submissions || []
                const isDuplicate = existing.some(s =>
                    s.studentInfo?.rollNo === submissionData.studentInfo?.rollNo &&
                    s.studentInfo?.name === submissionData.studentInfo?.name
                )

                if (isDuplicate) return e

                return {
                    ...e,
                    submissions: [...existing, {
                        ...submissionData,
                        importedAt: new Date().toISOString()
                    }]
                }
            }
            return e
        }))
    }

    const getExamByCode = (code) => exams.find(e => e.code === code)
    const getExamById = (id) => exams.find(e => e.id === parseInt(id))

    const generateQuestions = (text, count, config) => {
        const questions = generateQuestionsFromText(text, count, config)
        setCurrentQuestions(questions)
        return questions
    }

    // DUPLICATE EXAM Feature
    const duplicateExam = (examId) => {
        const examToCopy = exams.find(e => e.id === examId)
        if (!examToCopy) return null

        const newExam = {
            ...examToCopy,
            id: Date.now(),
            code: generateExamCode(),
            title: `${examToCopy.title} (Copy)`,
            status: 'Draft',
            createdAt: new Date().toISOString(),
            submissions: [], // Clear submissions
        }
        setExams(prev => [newExam, ...prev])
        return newExam
    }

    // TOPIC-BASED GENERATION Feature
    const generateQuestionsFromTopic = (topic, count = 10, config = {}) => {
        const { types, difficulty: difficultyConfig } = config || {}
        const cleanTopic = topic.trim()
        const questions = []

        const allowedTypes = types && types.length > 0 ? types : ['MCQ', 'True/False', 'Fill Blank', 'Short Answer']
        const difficulties = ['Easy', 'Medium', 'Hard']
        const blooms = ['Remembering', 'Understanding', 'Applying', 'Analyzing']

        for (let i = 0; i < count; i++) {
            const type = allowedTypes[i % allowedTypes.length]
            let difficulty
            if (difficultyConfig) {
                const total = difficultyConfig.Easy + difficultyConfig.Medium + difficultyConfig.Hard
                const rand = Math.random() * total
                if (rand < difficultyConfig.Easy) difficulty = 'Easy'
                else if (rand < difficultyConfig.Easy + difficultyConfig.Medium) difficulty = 'Medium'
                else difficulty = 'Hard'
            } else {
                difficulty = difficulties[i % 3]
            }
            const bloom = blooms[i % blooms.length]

            let question = null

            if (type === 'MCQ') {
                const options = [
                    `Key aspect of ${cleanTopic}`,
                    `Unrelated concept A`,
                    `Unrelated concept B`,
                    `Opposite of ${cleanTopic}`
                ].sort(() => Math.random() - 0.5)

                question = {
                    id: Date.now() + i,
                    type: 'MCQ',
                    text: `What is a primary characteristic of ${cleanTopic}?`,
                    options: options,
                    correct: options.findIndex(o => o.includes('Key aspect')),
                    difficulty,
                    bloom,
                    points: 1
                }
            } else if (type === 'True/False') {
                question = {
                    id: Date.now() + i,
                    type: 'True/False',
                    text: `True or False: ${cleanTopic} is a fundamental concept in this field.`,
                    options: ['True', 'False'],
                    correct: 0,
                    difficulty: 'Easy',
                    bloom: 'Remembering',
                    points: 1
                }
            } else if (type === 'Fill Blank') {
                question = {
                    id: Date.now() + i,
                    type: 'Fill Blank',
                    text: `The concept of ________ is crucial to understanding ${cleanTopic}.`,
                    options: null,
                    correct: null,
                    answer: cleanTopic,
                    difficulty: 'Medium',
                    bloom: 'Applying',
                    points: 2
                }
            } else {
                question = {
                    id: Date.now() + i,
                    type: 'Short Answer',
                    text: `Explain the significance of ${cleanTopic} and provide an example.`,
                    options: null,
                    correct: null,
                    difficulty: 'Hard',
                    bloom: 'Evaluating',
                    points: 5
                }
            }
            questions.push(question)
        }

        setCurrentQuestions(questions)
        return questions
    }

    return (
        <ExamContext.Provider value={{
            exams,
            currentQuestions,
            setCurrentQuestions,
            uploadedFileName,
            setUploadedFileName,
            extractedText,
            setExtractedText,
            cheatingReports,
            cheatingReports,
            addExam,
            updateExam,
            publishExam,
            submitExamAnswers,
            reportCheating,
            cancelStudentExam,
            importSubmission,
            getExamByCode,
            getExamById,
            generateQuestions,
            duplicateExam,
            generateQuestionsFromTopic,
        }}>
            {children}
        </ExamContext.Provider>
    )
}

export function useExam() {
    const ctx = useContext(ExamContext)
    if (!ctx) throw new Error('useExam must be used within ExamProvider')
    return ctx
}
