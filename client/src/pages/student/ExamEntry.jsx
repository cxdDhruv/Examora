import React from 'react';
import { useParams } from 'react-router-dom';

const ExamEntry = () => {
    const { token } = useParams();

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md border-t-8 border-t-primary-500 p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Portal</h1>
                <p className="text-gray-600 mb-6">Enter your details to begin the exam session: {token}</p>

                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student ID (Optional)</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            placeholder="12345678"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="button"
                            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2.5 rounded-md transition-colors"
                        >
                            Start Exam
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExamEntry;
