import express from 'express';
import { createExam, getExams, getExamById, toggleExamStatus, getExamByToken } from '../controllers/exam.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
    .post(protect, createExam)
    .get(protect, getExams);

router.get('/token/:token', getExamByToken);

router.route('/:id')
    .get(protect, getExamById);

router.post('/:id/activate', protect, toggleExamStatus);

export default router;
