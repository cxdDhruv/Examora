import { v4 as uuidv4 } from 'uuid';
import Exam from '../models/Exam.js';
import Question from '../models/Question.js';

// @desc    Create new exam
// @route   POST /api/exams
// @access  Private (Teacher)
export const createExam = async (req, res) => {
    try {
        const { title, subject, description, duration, settings, sections } = req.body;

        const token = uuidv4();

        const exam = await Exam.create({
            token,
            title,
            subject,
            description,
            duration,
            settings,
            sections,
            createdBy: req.user._id
        });

        // Add exam to User's exams list
        req.user.exams.push(exam._id);
        await req.user.save();

        res.status(201).json(exam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all exams for a teacher
// @route   GET /api/exams
// @access  Private
export const getExams = async (req, res) => {
    try {
        const exams = await Exam.find({ createdBy: req.user._id }).sort('-createdAt');
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single exam by ID (for teacher)
// @route   GET /api/exams/:id
// @access  Private
export const getExamById = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam || exam.createdBy.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        const questions = await Question.find({ examId: exam._id }).sort('order');

        res.json({ exam, questions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Activate/Deactivate exam
// @route   POST /api/exams/:id/activate
// @access  Private
export const toggleExamStatus = async (req, res) => {
    try {
        const { isActive } = req.body;
        const exam = await Exam.findById(req.params.id);

        if (!exam || exam.createdBy.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        exam.isActive = isActive;
        await exam.save();

        res.json(exam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get exam by public token (for students)
// @route   GET /api/exams/token/:token
// @access  Public
export const getExamByToken = async (req, res) => {
    try {
        const exam = await Exam.findOne({ token: req.params.token });

        if (!exam) return res.status(404).json({ message: 'Exam not found or invalid link' });
        if (!exam.isActive) return res.status(400).json({ message: 'This exam is currently inactive' });

        // Do NOT return settings that students shouldn't see
        res.json({
            _id: exam._id,
            title: exam.title,
            subject: exam.subject,
            description: exam.description,
            duration: exam.duration,
            totalMarks: exam.totalMarks,
            sections: exam.sections,
            settings: {
                allowReview: exam.settings.allowReview,
                antiCheatLevel: exam.settings.antiCheatLevel
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
