import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
    title: String,
    description: String,
    order: Number
});

const examSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true }, // UUID for URL
    title: { type: String, required: true },
    subject: { type: String },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    duration: { type: Number, required: true }, // in minutes
    totalMarks: { type: Number, default: 0 },
    passingMarks: { type: Number, default: 0 },
    startTime: { type: Date },
    endTime: { type: Date },
    isActive: { type: Boolean, default: false },
    settings: {
        shuffleQuestions: { type: Boolean, default: false },
        shuffleOptions: { type: Boolean, default: false },
        allowReview: { type: Boolean, default: true },
        showScore: { type: Boolean, default: true },
        antiCheatLevel: { type: String, enum: ['none', 'medium', 'strict'], default: 'medium' }
    },
    sections: [sectionSchema]
}, { timestamps: true });

export default mongoose.model('Exam', examSchema);
