import React from 'react';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${colorClass}`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
    </div>
);

const Dashboard = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back, Instructor</h1>
                    <p className="text-gray-500 mt-1">Here's an overview of your exam activities.</p>
                </div>
                <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
                    + New Exam
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Exams"
                    value="12"
                    icon={FileText}
                    colorClass="bg-blue-100 text-blue-600"
                />
                <StatCard
                    title="Active Exams"
                    value="2"
                    icon={Clock}
                    colorClass="bg-amber-100 text-amber-600"
                />
                <StatCard
                    title="Total Students Tested"
                    value="843"
                    icon={Users}
                    colorClass="bg-purple-100 text-purple-600"
                />
                <StatCard
                    title="Average Score"
                    value="76%"
                    icon={CheckCircle}
                    colorClass="bg-green-100 text-green-600"
                />
            </div>

            {/* Recent Activity placeholder */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-800">Recent Exams</h2>
                    <button className="text-primary-600 text-sm font-medium hover:underline">View All</button>
                </div>
                <div className="divide-y divide-gray-100">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div>
                                <h4 className="font-medium text-gray-900">Midterm Examination - CS101</h4>
                                <p className="text-sm text-gray-500">Created 2 days ago • 45 Submissions</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Active
                                </span>
                                <button className="text-gray-400 hover:text-gray-600">→</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
