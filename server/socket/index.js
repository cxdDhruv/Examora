export const initSocket = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on('join_exam', ({ examId, role, sessionId }) => {
            if (role === 'teacher') {
                socket.join(`exam_${examId}_teacher`);
                console.log(`Teacher joined room: exam_${examId}_teacher`);
            } else {
                socket.join(`exam_${examId}_student_${sessionId}`);
                socket.join(`exam_${examId}_students`); // General room for all students in exam
                console.log(`Student ${sessionId} joined room: exam_${examId}_student_${sessionId}`);
                // Notify teacher
                io.to(`exam_${examId}_teacher`).emit('student_joined', { sessionId, timestamp: new Date() });
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};
