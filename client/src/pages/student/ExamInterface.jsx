import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Flag, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { useAntiCheat } from '../../hooks/useAntiCheat';

const ExamInterface = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    // Anti-Cheat State
    const [redAlert, setRedAlert] = useState(false);
    const [warningMessage, setWarningMessage] = useState(null);

    const handleCheatEvent = (type, count) => {
        if (count >= 3) {
            setRedAlert(true);
            // Play beep sound here via Web Audio API
            playBeep();
        } else {
            setWarningMessage(`Warning: ${type.replace('_', ' ').toUpperCase()}. Violations: ${count}/3`);
            setTimeout(() => setWarningMessage(null), 4000);
        }
    };

    const { requestFullscreen, isFullscreen } = useAntiCheat('strict', handleCheatEvent);

    const playBeep = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            let i = 0;
            const interval = setInterval(() => {
                if (i >= 3) {
                    clearInterval(interval);
                    return;
                }
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = 880;
                osc.start();
                setTimeout(() => osc.stop(), 500);
                i++;
            }, 700);
        } catch (e) { console.error(e) }
    };

    return (
        <div className={`min-h-screen bg-gray-50 flex flex-col ${redAlert ? 'overflow-hidden' : ''}`}>

            {/* RED ALERT OVERLAY */}
            {redAlert && (
                <div className="fixed inset-0 z-50 bg-red-600 flex flex-col items-center justify-center p-6 text-center animate-pulse">
                    <AlertTriangle className="w-32 h-32 text-white mb-6" />
                    <h1 className="text-5xl font-bold text-white mb-4 uppercase tracking-widest">Cheating Detected</h1>
                    <p className="text-2xl text-red-100 max-w-2xl bg-red-800/50 p-6 rounded-lg">
                        This incident has been permanently recorded and reported to your instructor.
                        The exam has been locked.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-10 bg-white text-red-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors"
                    >
                        Exit Exam Portal
                    </button>
                </div>
            )}

            {/* WARNING TOAST */}
            {warningMessage && !redAlert && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-red-500 text-white px-6 py-3 rounded-lg shadow-xl font-medium animate-bounce flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>{warningMessage}</span>
                </div>
            )}

            {/* Top Navbar */}
            <header className="bg-white border-b h-16 flex items-center justify-between px-6 shrink-0 relative z-30 shadow-sm">
                <h1 className="font-bold text-xl text-gray-800 tracking-tight select-none">Midterm Examination - CS101</h1>

                <div className="flex items-center space-x-6">
                    <div className="font-medium text-gray-600 select-none">Question 4 of 20</div>
                    <div className="flex items-center space-x-2 bg-gray-100 px-4 py-1.5 rounded-full border">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <span className="font-bold text-lg text-gray-800 tracking-wider font-mono select-none">44:12</span>
                    </div>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 h-1">
                <div className="bg-primary-500 h-1 transition-all duration-300" style={{ width: '20%' }}></div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-6 md:p-10 flex justify-center">
                    <div className="max-w-3xl w-full">

                        {/* Enter Fullscreen Prompt */}
                        {!isFullscreen && !redAlert && (
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg mb-6 flex justify-between items-center shadow-sm">
                                <div>
                                    <h4 className="font-bold mb-1 flex items-center"><AlertTriangle className="w-5 h-5 mr-2" /> Fullscreen Required</h4>
                                    <p className="text-sm">You must remain in fullscreen mode while taking this exam.</p>
                                </div>
                                <button
                                    onClick={requestFullscreen}
                                    className="bg-amber-500 text-white px-4 py-2 rounded font-medium hover:bg-amber-600 transition-colors shadow-sm whitespace-nowrap"
                                >
                                    Enter Fullscreen
                                </button>
                            </div>
                        )}

                        {/* Question Card */}
                        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-8 select-none ${!isFullscreen ? 'opacity-50 pointer-events-none blur-[2px] transition-all' : ''}`}>
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-2xl font-medium text-gray-900 leading-snug">
                                    4. Which of the following data structures operates on a Last-In-First-Out (LIFO) principle?
                                </h2>
                                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">1 Point</span>
                            </div>

                            <div className="space-y-3 mt-8">
                                {['Queue', 'Linked List', 'Stack', 'Tree'].map((opt, i) => (
                                    <label key={i} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:bg-primary-50 has-[:checked]:border-primary-500">
                                        <input type="radio" name="q4" className="w-5 h-5 text-primary-600 border-gray-300 focus:ring-primary-500" />
                                        <span className="text-lg text-gray-700">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Bottom Navigation Navigation */}
                        <div className={`mt-8 flex justify-between items-center ${!isFullscreen ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div className="flex space-x-3">
                                <button className="flex items-center space-x-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors shadow-sm">
                                    <ChevronLeft className="w-5 h-5" />
                                    <span>Previous</span>
                                </button>
                                <button className="flex items-center space-x-1 px-4 py-2 bg-white border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 font-medium transition-colors shadow-sm">
                                    <Flag className="w-5 h-5" />
                                    <span>Flag</span>
                                </button>
                            </div>

                            <button className="flex items-center space-x-1 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium transition-colors shadow-sm">
                                <span>Next</span>
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                    </div>
                </main>

                {/* Question Palette Sidebar */}
                <aside className="w-72 bg-white border-l border-gray-200 hidden lg:flex flex-col select-none">
                    <div className="p-4 border-b">
                        <h3 className="font-bold text-gray-800">Question Palette</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-5 gap-2">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <button
                                    key={i}
                                    className={`w-10 h-10 rounded-md flex items-center justify-center font-medium shadow-sm transition-colors border
                    ${i === 3 ? 'bg-primary-100 border-primary-500 text-primary-700' // current
                                            : i < 3 ? 'bg-primary-500 border-primary-500 text-white' // answered
                                                : i === 7 ? 'bg-amber-100 border-amber-400 text-amber-700' // flagged
                                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50' // unanswered
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 border-t bg-gray-50">
                        <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg shadow-sm transition-colors uppercase tracking-wide">
                            Submit Exam
                        </button>
                    </div>
                </aside>
            </div>

        </div>
    );
};

export default ExamInterface;
