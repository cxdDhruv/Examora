import React from 'react';
import { Search, Filter, Download, ExternalLink } from 'lucide-react';

const Results = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Exam Results</h1>
                    <p className="text-gray-500 mt-1">View and analyze student performance.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-medium">
                        <Download className="w-4 h-4" />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center space-x-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search student name or ID..."
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-shadow"
                        />
                    </div>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center space-x-4 ml-auto text-sm text-gray-600">
                    <span>Total Submissions: <span className="font-bold text-gray-900">142</span></span>
                    <span>Average Score: <span className="font-bold text-gray-900">76%</span></span>
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Rank</th>
                                <th className="px-6 py-4">Student Name</th>
                                <th className="px-6 py-4">Score</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Integrity Score</th>
                                <th className="px-6 py-4">Time Taken</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                            {[
                                { rank: 1, name: 'David Chen', id: 'CS-1088', score: '98/100', status: 'Passed', integrity: 100, time: '30m 10s' },
                                { rank: 2, name: 'Sarah Miller', id: 'CS-1092', score: '95/100', status: 'Passed', integrity: 95, time: '35m 45s' },
                                { rank: 3, name: 'Alex Johnson', id: 'CS-1021', score: '88/100', status: 'Passed', integrity: 100, time: '41m 20s' },
                                { rank: 4, name: 'Samantha Williams', id: 'CS-1045', score: '42/100', status: 'Failed', integrity: 45, time: '44m 30s' },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">#{row.rank}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{row.name}</div>
                                        <div className="text-xs text-gray-500">{row.id}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900">{row.score}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${row.status === 'Passed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className={`h-1.5 rounded-full ${row.integrity >= 80 ? 'bg-green-500' : row.integrity >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                    style={{ width: `${row.integrity}%` }}
                                                ></div>
                                            </div>
                                            <span className={`font-semibold ${row.integrity >= 80 ? 'text-green-600' : row.integrity >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{row.integrity}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{row.time}</td>
                                    <td className="px-6 py-4">
                                        <button className="text-primary-600 hover:text-primary-800 flex items-center space-x-1 font-medium text-sm transition-colors">
                                            <ExternalLink className="w-4 h-4" />
                                            <span>View details</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Results;
