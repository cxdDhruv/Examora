import { createContext, useContext, useState, useEffect } from 'react'
import { db, auth } from '../config/firebase'
import {
    collection, addDoc, updateDoc, doc,
    query, where, onSnapshot, getDocs, orderBy,
    serverTimestamp, setDoc, getDoc, increment
} from 'firebase/firestore'

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

// ============================================================
// FIREBASE-BACKED CONTEXT
// ============================================================

export function ExamProvider({ children }) {
    const [exams, setExams] = useState([])
    const [cheatingReports, setCheatingReports] = useState([]) // In-memory/local for now for immediate feedback, or fetch from Firestore
    const [currentQuestions, setCurrentQuestions] = useState([])
    const [uploadedFileName, setUploadedFileName] = useState('')
    const [extractedText, setExtractedText] = useState('')
    const [userEmail, setUserEmail] = useState(localStorage.getItem('user_email'))
    const [loadingExams, setLoadingExams] = useState(true)

    // Listen for User Login changes (to subscribe to their exams)
    useEffect(() => {
        // Simple polling for localStorage change or event listener
        const checkUser = () => {
            const email = localStorage.getItem('user_email')
            if (email !== userEmail) setUserEmail(email)
        }
        const interval = setInterval(checkUser, 1000)
        return () => clearInterval(interval)
    }, [userEmail])

    // ============================================================
    // 1. TEACHER: SUBSCRIBE TO EXAMS
    // ============================================================
    useEffect(() => {
        if (!userEmail || !db) {
            setExams([])
            setLoadingExams(false)
            return
        }

        setLoadingExams(true)
        try {
            const q = query(
                collection(db, 'exams'),
                where('createdBy', '==', userEmail),
                orderBy('createdAt', 'desc')
            )

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedExams = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                setExams(fetchedExams)
                setLoadingExams(false)
            }, (err) => {
                console.error("Error fetching exams:", err)
                setLoadingExams(false)
            })

            return () => unsubscribe()
        } catch (e) {
            console.error("Firestore Error:", e)
            setLoadingExams(false)
        }
    }, [userEmail])

    // ============================================================
    // 2. EXAM MANAGEMENT
    // ============================================================
    const addExam = async (exam) => {
        if (!db) { alert("Database offline"); return; }
        const newExam = {
            ...exam,
            code: generateExamCode(),
            createdAt: new Date().toISOString(),
            createdBy: userEmail || 'unknown',
            status: 'Draft',
            submissionCount: 0, // Denormalized count for dashboard
        }

        try {
            // Use time-based ID for easier sorting/compat
            const docId = String(Date.now())
            await setDoc(doc(db, 'exams', docId), { ...newExam, id: docId }) // Store ID inside doc too
            return { ...newExam, id: docId }
        } catch (e) {
            console.error("Error adding exam:", e)
            throw e
        }
    }

    const publishExam = async (examId) => {
        if (!db) return;
        try {
            const examRef = doc(db, 'exams', String(examId))
            await updateDoc(examRef, { status: 'Published' })
        } catch (e) {
            console.error("Error publishing exam:", e)
        }
    }

    // ============================================================
    // 3. STUDENT: FETCH & SUBMIT
    // ============================================================

    // Fetch Single Exam by Code (for Student)
    const getExamByCode = async (code) => {
        // First check local state (if teacher is viewing)
        const local = exams.find(e => e.code === code)
        if (local) return local

        if (!db) return null;

        // If not found (student), query Firestore
        const q = query(collection(db, 'exams'), where('code', '==', code))
        const snapshot = await getDocs(q)
        if (!snapshot.empty) {
            return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
        }
        return null
    }

    const getExamById = (id) => exams.find(e => String(e.id) === String(id))

    // Submit Exam - Writes to Sub-collection AND updates count
    const submitExamAnswers = async (examId, answers, studentInfo, violations) => {
        if (!db) { console.error("DB Offline"); return; }
        try {
            const examRef = doc(db, 'exams', String(examId))
            const textScore = calculateScore(getExamById(examId)?.questions || [], answers)

            const submission = {
                studentInfo,
                answers,
                violations,
                submittedAt: new Date().toISOString(),
                status: violations > 0 ? 'Flagged' : 'Clean',
                score: textScore
            }

            // 1. Add to submissions subcollection
            await addDoc(collection(examRef, 'submissions'), submission)

            // 2. Update parent exam submission count
            await updateDoc(examRef, {
                submissionCount: increment(1)
            })

        } catch (e) {
            console.error("Error submitting exam:", e)
        }
    }

    const calculateScore = (questions, answers) => {
        return questions.reduce((total, q) => {
            if (q.type === 'MCQ' || q.type === 'True/False') {
                return total + (answers[q.id] === q.correct ? q.points : 0)
            }
            return total
        }, 0)
    }

    // ============================================================
    // 4. SECURITY / CHEATING REPORTS
    // ============================================================
    const reportCheating = (report) => {
        // Ideally write to 'reports' collection
        const newReport = {
            id: Date.now(),
            ...report,
            reportedAt: new Date().toISOString(),
            reviewed: false,
        }
        // For MVP, just pushing to local state. 
        // Real app: addDoc(collection(db, 'reports'), newReport)
        setCheatingReports(prev => [newReport, ...prev])
        return newReport
    }

    const cancelStudentExam = async (examId, studentInfo, reason, violations) => {
        // Log report
        reportCheating({
            examId,
            studentName: studentInfo.name,
            reason,
            violations,
            severity: violations >= 3 ? 'Critical' : violations >= 2 ? 'High' : 'Medium',
            action: 'Exam Cancelled — Auto-submitted',
        })

        // Submit as Cancelled
        try {
            const examRef = doc(db, 'exams', String(examId))
            const submission = {
                studentInfo,
                answers: {},
                violations,
                submittedAt: new Date().toISOString(),
                status: 'Cancelled',
                cancelReason: reason,
                score: 0
            }
            await addDoc(collection(examRef, 'submissions'), submission)
        } catch (e) {
            console.error("Error cancelling exam:", e)
        }
    }

    // Generate Questions (Text)
    const generateQuestions = async (text, count, config) => {
        try {
            if (import.meta.env.VITE_OPENAI_API_KEY) {
                const { generateQuestionsOpenAI } = await import('../services/openai');
                const questions = await generateQuestionsOpenAI(text, count, config.types, config.difficulty);
                setCurrentQuestions(questions);
                return questions;
            } else {
                // Fallback to local regex logic
                const questions = generateQuestionsFromText(text, count, config);
                setCurrentQuestions(questions);
                return questions;
            }
        } catch (err) {
            console.error("Generation Error:", err);
            // Fallback on error
            const questions = generateQuestionsFromText(text, count, config);
            setCurrentQuestions(questions);
            return questions;
        }
    }

    // Generate Questions (Topic)
    const generateQuestionsFromTopic = async (topic, count, config) => {
        try {
            if (import.meta.env.VITE_OPENAI_API_KEY) {
                const { generateQuestionsFromTopicOpenAI } = await import('../services/openai');
                const questions = await generateQuestionsFromTopicOpenAI(topic, count, config.types, config.difficulty);
                setCurrentQuestions(questions);
                return questions;
            } else {
                // Mock for topic if no API
                const questions = getDefaultQuestions().map(q => ({ ...q, text: `${q.text} (${topic})` }));
                setCurrentQuestions(questions);
                return questions;
            }
        } catch (err) {
            console.error("Topic Generation Error:", err);
            alert("Failed to generate from topic with AI. Using offline mode.");
            const questions = getDefaultQuestions();
            setCurrentQuestions(questions);
            return questions;
        }
    }

    // Helper to get submissions for an exam (real-time)
    const subscribeToSubmissions = (examId, callback) => {
        if (!db) return () => { };
        const q = query(
            collection(db, 'exams', String(examId), 'submissions'),
            orderBy('submittedAt', 'desc')
        )
        return onSnapshot(q, (snapshot) => {
            const subs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
            callback(subs)
        })
    }

    return (
        <ExamContext.Provider value={{
            exams,
            loadingExams,
            currentQuestions,
            setCurrentQuestions,
            uploadedFileName,
            setUploadedFileName,
            extractedText,
            setExtractedText,
            cheatingReports,
            addExam,
            publishExam,
            submitExamAnswers,
            reportCheating,
            cancelStudentExam,
            getExamByCode,
            getExamById,
            generateQuestions,
            generateQuestionsFromTopic,
            subscribeToSubmissions,
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
