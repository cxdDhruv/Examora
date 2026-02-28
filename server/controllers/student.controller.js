import { v4 as uuidv4 } from 'uuid';
import Session from '../models/Session.js';
import Submission from '../models/Submission.js';
import CheatEvent from '../models/CheatEvent.js';
import Exam from '../models/Exam.js';
import Question from '../models/Question.js';

// @desc    Start exam session
// @route   POST /api/student/sessions/start
// @access  Public
export const startSession = async (req, res) => {
    try {
        const { token, studentName, studentId } = req.body;

        const exam = await Exam.findOne({ token });
        if (!exam || !exam.isActive) {
            return res.status(400).json({ message: 'Exam is invalid or not active' });
        }

        const sessionToken = uuidv4();
        const sessionId = sessionToken; // Map sessionId directly to sessionToken for simplicity

        const session = await Session.create({
            examId: exam._id,
            studentName,
            sessionToken,
        });

        res.status(201).json({
            sessionId: session.sessionToken,
            examId: exam._id,
            studentName: session.studentName
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auto-save answers
// @route   PATCH /api/student/sessions/:sessionId
// @access  Public
export const autoSaveAnswers = async (req, res) => {
    try {
        const { answers, currentQuestionIndex } = req.body;
        const { sessionId } = req.params;

        const session = await Session.findOne({ sessionToken: sessionId });
        if (!session || !session.isActive) {
            return res.status(400).json({ message: 'Invalid or inactive session' });
        }

        if (answers) {
            session.answers = new Map(Object.entries(answers));
        }
        if (currentQuestionIndex !== undefined) {
            session.currentQuestionIndex = currentQuestionIndex;
        }

        session.lastActiveAt = Date.now();
        await session.save();

        // Use req.app.get('io') to emit if needed, skipping for autosave to reduce noise
        res.json({ message: 'Autosaved successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get questions for the active session
// @route   GET /api/student/sessions/:sessionId/questions
// @access  Public
export const getExamQuestionsBySession = async (req, res) => {
    try {
        const session = await Session.findOne({ sessionToken: req.params.sessionId });
        if (!session || !session.isActive) {
            return res.status(400).json({ message: 'Invalid or inactive session' });
        }

        const questions = await Question.find({ examId: session.examId }).sort('order');

        // Strip correctAnswers and explanation from student view
        const safeQuestions = questions.map(q => {
            const qObj = q.toObject();
            delete qObj.correctAnswers;
            delete qObj.explanation;
            return qObj;
        });

        res.json(safeQuestions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit final exam
// @route   POST /api/student/submissions
// @access  Public
export const submitExam = async (req, res) => {
    try {
        const { sessionId, finalAnswers, cheatEventCount, integrityScore } = req.body;

        const session = await Session.findOne({ sessionToken: sessionId });
        if (!session || !session.isActive) {
            return res.status(400).json({ message: 'Invalid or already submitted session' });
        }

        const exam = await Exam.findById(session.examId);
        if (!exam) return res.status(404).json({ message: 'Exam not found' });

        // Retrieve all questions to auto-grade
        const questions = await Question.find({ examId: exam._id });

        // Process answers and grade
        let score = 0;
        let totalMarks = exam.totalMarks || 0;
        const formattedAnswers = [];

        // Simple grading logic
        questions.forEach(q => {
            const stAnswer = finalAnswers[q._id.toString()];
            const isCorrect = q.correctAnswers && q.correctAnswers.length > 0 && stAnswer && q.correctAnswers.includes(stAnswer);

            if (isCorrect) score += (q.points || 1);

            formattedAnswers.push({
                questionId: q._id,
                answer: stAnswer || null
            });
        });

        const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
        const passed = percentage >= (exam.passingMarks || 0);

        const submission = await Submission.create({
            examId: exam._id,
            studentName: session.studentName,
            sessionId: session.sessionToken,
            answers: formattedAnswers,
            score,
            totalMarks,
            percentage,
            passed,
            integrityScore: integrityScore || 100,
            cheatEventCount: cheatEventCount || 0,
            status: 'submitted',
            ipAddress: req.ip
        });

        session.isActive = false; // Close session
        await session.save();

        const io = req.app.get('io');
        if (io) {
            io.to(`exam_${exam._id}_teacher`).emit('exam_submitted', { sessionId, score, timestamp: new Date() });
        }

        res.status(201).json({
            message: 'Exam submitted successfully',
            submissionId: submission._id,
            score: exam.settings.showScore ? score : null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Log a cheat event
// @route   POST /api/student/cheat-events
// @access  Public
export const logCheatEvent = async (req, res) => {
    try {
        const { sessionId, eventType, violationCount, redAlertTriggered } = req.body;

        const session = await Session.findOne({ sessionToken: sessionId });
        if (!session) return res.status(400).json({ message: 'Session not found' });

        const cheatEvent = await CheatEvent.create({
            examId: session.examId,
            studentName: session.studentName,
            sessionId,
            eventType,
            violationCount,
            redAlertTriggered,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        const io = req.app.get('io');
        if (io) {
            io.to(`exam_${session.examId}_teacher`).emit('cheat_alert', {
                sessionId,
                studentName: session.studentName,
                eventType,
                count: violationCount,
                redAlert: redAlertTriggered
            });
        }

        res.status(201).json(cheatEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
