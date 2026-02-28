import React, { useState } from 'react';
import { Play, Pause, AlertTriangle, Users } from 'lucide-react';

const StudentCard = ({ student, status, progress, time, score, recentEvent }) => {
    const isAlert = student.integrityScore < 80;

    return (
        <div className={`bg-white rounded-xl shadow-sm border p-5 relative overflow-hidden ${isAlert ? 'border-red-400' : 'border-gray-200'}`}>
            {isAlert && (
                <div className="absolute top-0 right-0 left-0 h-1 bg-red-500"></div>
            )}
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-semibold text-gray-900">{student.name}</h3>
                    <p className="text-xs text-gray-500">ID: {student.id}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-semibold ${isAlert ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    Score: {student.integrityScore}
                </div>
            </div>

            <div className="space-y-3">
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium text-gray-800">{progress}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: progress }}></div>
                    </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{status}</span>
                    <span className="font-medium text-gray-700">{time}</span>
                </div>

                {isAlert && (
                    <div className="mt-2 text-xs flex items-center text-red-600 bg-red-50 p-2 rounded">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {recentEvent}
                    </div>
                )}
            </div>
        </div>
    );
};

const LiveMonitor = () => {
    return (
        <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <div className="flex items-center space-x-3 mb-1">
                        <h1 className="text-2xl font-bold text-gray-900">Midterm Examination - CS101</h1>
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-sm font-semibold text-green-600 uppercase tracking-wider">LIVE</span>
                    </div>
                    <p className="text-gray-500">45 mins remaining • 145 students joined</p>
                </div>

                <div className="flex items-center space-x-3 bg-white p-2 rounded-lg border shadow-sm">
                    <div className="flex flex-col items-center px-4 border-r">
                        <span className="text-2xl font-bold text-gray-800">45:12</span>
                        <span className="text-xs text-gray-500 uppercase">Timer</span>
                    </div>
                    <div className="flex flex-col items-center px-4">
                        <span className="text-2xl font-bold text-primary-600">12</span>
                        <span className="text-xs text-gray-500 uppercase">Submitted</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-6 flex-1 min-h-0">
                {/* Student Grid */}
                <div className="flex-1 overflow-y-auto pr-2 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <StudentCard
                            student={{ name: "Alex Johnson", id: "CS-1021", integrityScore: 100 }}
                            progress="80%" status="Answering Q12" time="32:15"
                        />
                        <StudentCard
                            student={{ name: "Samantha Williams", id: "CS-1045", integrityScore: 65 }}
                            progress="45%" status="Answering Q7" time="32:15"
                            recentEvent="Tab Switch Detected (x2)"
                        />
                        <StudentCard
                            student={{ name: "David Chen", id: "CS-1088", integrityScore: 95 }}
                            progress="100%" status="Submitted" time="30:10"
                        />
                        {/* More cards... */}
                    </div>
                </div>

                {/* Action & Alerts Sidebar */}
                <div className="w-80 flex flex-col gap-4">
                    {/* Controls */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <h3 className="font-semibold text-gray-900 mb-4">Exam Controls</h3>
                        <div className="space-y-3">
                            <button className="w-full flex justify-center items-center space-x-2 bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium py-2 rounded-lg transition-colors">
                                <Pause className="w-4 h-4" />
                                <span>Pause All</span>
                            </button>
                            <button className="w-full flex justify-center items-center space-x-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 rounded-lg transition-colors">
                                <Users className="w-4 h-4" />
                                <span>Send Announcement</span>
                            </button>
                            <button className="w-full flex justify-center items-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 rounded-lg transition-colors mt-4">
                                <span>Force End Exam</span>
                            </button>
                        </div>
                    </div>

                    {/* Live Activity Feed */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900 text-sm">Live Alerts Feed</h3>
                            <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">3 New</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div className="text-sm">
                                <div className="text-xs text-gray-400 mb-0.5">10:42 AM</div>
                                <div className="font-medium text-red-600">Samantha Williams</div>
                                <div className="text-gray-600">Exited Fullscreen</div>
                            </div>
                            <div className="text-sm">
                                <div className="text-xs text-gray-400 mb-0.5">10:39 AM</div>
                                <div className="font-medium text-gray-800">David Chen</div>
                                <div className="text-gray-600">Submitted Exam</div>
                            </div>
                            <div className="text-sm">
                                <div className="text-xs text-gray-400 mb-0.5">10:35 AM</div>
                                <div className="font-medium text-amber-600">Michael Ross</div>
                                <div className="text-gray-600">Tab Switch Warning</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveMonitor;
