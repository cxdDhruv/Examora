import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    studentName: { type: String, required: true },
    studentId: { type: String },
    studentEmail: { type: String },
    sessionId: { type: String, required: true },
    answers: [{
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        answer: mongoose.Schema.Types.Mixed, // String or Array of Strings
        timeTakenSeconds: { type: Number, default: 0 }
    }],
    score: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    timeTakenTotal: { type: Number, default: 0 },
    integrityScore: { type: Number, default: 100 },
    cheatEventCount: { type: Number, default: 0 },
    ipAddress: { type: String },
    status: { type: String, enum: ['in_progress', 'submitted', 'flagged'], default: 'in_progress' }
}, { timestamps: { createdAt: 'startedAt', updatedAt: 'submittedAt' } });

export default mongoose.model('Submission', submissionSchema);
