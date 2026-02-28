import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['teacher'], default: 'teacher' },
    exams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }]
}, { timestamps: true });

export default mongoose.model('User', userSchema);
