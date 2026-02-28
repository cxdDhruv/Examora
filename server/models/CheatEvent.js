import mongoose from 'mongoose';

const cheatEventSchema = new mongoose.Schema({
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    studentName: { type: String, required: true },
    studentId: { type: String },
    sessionId: { type: String, required: true },
    eventType: {
        type: String,
        enum: ['tab_switch', 'fullscreen_exit', 'devtools', 'copy_attempt', 'screenshot'],
        required: true
    },
    violationCount: { type: Number, default: 1 },
    redAlertTriggered: { type: Boolean, default: false },
    ipAddress: { type: String },
    userAgent: { type: String }
}, { timestamps: true });

export default mongoose.model('CheatEvent', cheatEventSchema);
