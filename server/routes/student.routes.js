import express from 'express';
import {
    startSession,
    autoSaveAnswers,
    getExamQuestionsBySession,
    submitExam,
    logCheatEvent
} from '../controllers/student.controller.js';

const router = express.Router();

router.post('/sessions/start', startSession);
router.route('/sessions/:sessionId')
    .patch(autoSaveAnswers);

router.get('/sessions/:sessionId/questions', getExamQuestionsBySession);

router.post('/submissions', submitExam);
router.post('/cheat-events', logCheatEvent);

export default router;
