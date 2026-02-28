import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId },
    type: {
        type: String,
        enum: ['mcq_single', 'mcq_multi', 'short', 'long', 'truefalse', 'dropdown', 'scale'],
        required: true
    },
    questionText: { type: String, required: true },
    imageUrl: { type: String },
    options: [{ id: String, text: String, imageUrl: String }], // For MCQ, Dropdown
    correctAnswers: [{ type: String }], // Store option IDs or exact text values
    points: { type: Number, default: 1 },
    required: { type: Boolean, default: true },
    hint: { type: String },
    explanation: { type: String },
    tags: [{ type: String }],
    order: { type: Number, default: 0 }
});

export default mongoose.model('Question', questionSchema);
