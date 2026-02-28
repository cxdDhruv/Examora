import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    studentName: { type: String, required: true },
    sessionToken: { type: String, required: true, unique: true },
    lastActiveAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    currentQuestionIndex: { type: Number, default: 0 },
    answers: { type: Map, of: mongoose.Schema.Types.Mixed } // in-progress autosave map
}, { timestamps: { createdAt: 'startedAt' } });

export default mongoose.model('Session', sessionSchema);
