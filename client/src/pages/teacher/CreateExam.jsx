import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Settings } from 'lucide-react';

const CreateExam = () => {
    const [questions, setQuestions] = [useState([])]; // mock state for now

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create New Exam</h1>
                    <p className="text-gray-500 mt-1">Design your exam structure and add questions.</p>
                </div>
                <button className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center space-x-2">
                    <span>Save Exam</span>
                </button>
            </div>

            {/* Main Settings Form */}
            <div className="bg-white rounded-xl border-t-8 border-t-primary-500 border border-gray-200 shadow-sm p-8 mb-8">
                <input
                    type="text"
                    placeholder="Untitled Exam"
                    className="w-full text-4xl font-bold text-gray-900 border-none focus:ring-0 outline-none placeholder-gray-300 mb-4"
                />
                <textarea
                    placeholder="Form description or instructions"
                    className="w-full text-gray-600 border-none focus:ring-0 outline-none resize-none placeholder-gray-400"
                    rows={2}
                />
            </div>

            {/* Exam Settings Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-8 flex flex-wrap gap-4 items-center">
                <Settings className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 border-r pr-4">Settings</span>

                <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Duration (mins):</label>
                    <input type="number" defaultValue={60} className="w-20 px-2 py-1 border rounded" />
                </div>

                <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Anti-Cheat:</label>
                    <select className="px-2 py-1 border rounded text-sm bg-white">
                        <option value="none">None</option>
                        <option value="medium">Medium</option>
                        <option value="strict">Strict</option>
                    </select>
                </div>

                <div className="flex items-center space-x-2 ml-auto">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" className="rounded text-primary-500 focus:ring-primary-500" />
                        <span className="text-sm text-gray-600">Shuffle Questions</span>
                    </label>
                </div>
            </div>

            {/* Question Cards Placeholder */}
            <div className="space-y-6">
                {/* Sample Question Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm relative group transition-all focus-within:ring-2 focus-within:ring-primary-500">
                    <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-move text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="w-4 h-4" />
                    </div>

                    <div className="p-6 pl-10">
                        <div className="flex space-x-4 mb-4">
                            <input
                                type="text"
                                placeholder="Question text..."
                                className="flex-1 bg-gray-50 px-4 py-3 rounded-lg border-b-2 border-transparent focus:border-primary-500 focus:bg-white outline-none transition-colors font-medium text-gray-800"
                                defaultValue="What is the capital of France?"
                            />
                            <select className="w-48 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500">
                                <option value="mcq">Multiple Choice</option>
                                <option value="short">Short Answer</option>
                                <option value="long">Long Answer</option>
                            </select>
                        </div>

                        {/* Options */}
                        <div className="space-y-3 pl-2">
                            {['Paris', 'London', 'Berlin', 'Madrid'].map((opt, i) => (
                                <div key={i} className="flex items-center space-x-3 group/opt">
                                    <input type="radio" disabled className="text-gray-300" />
                                    <input
                                        type="text"
                                        defaultValue={opt}
                                        className="flex-1 border-b border-transparent hover:border-gray-200 focus:border-primary-500 outline-none text-gray-700 py-1"
                                    />
                                    <button className="text-gray-300 hover:text-red-500 opacity-0 group-hover/opt:opacity-100 transition-opacity">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <div className="flex items-center space-x-3 pt-2">
                                <input type="radio" disabled className="text-gray-300" />
                                <button className="text-sm text-primary-600 hover:underline">Add option</button>
                            </div>
                        </div>

                        {/* Question Footer Controls */}
                        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                            <div className="flex space-x-4">
                                <button className="font-medium text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded transition-colors">Answer Key (1 pt)</button>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button className="hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <div className="h-6 w-px bg-gray-200"></div>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <span className="text-gray-700 font-medium">Required</span>
                                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                        <input type="checkbox" name="toggle" id="toggle1" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300" />
                                        <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"></label>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Add Menu (simplified static version) */}
            <div className="mt-6 flex justify-center">
                <button className="bg-white border border-gray-300 shadow-sm text-gray-700 hover:text-primary-600 hover:border-primary-400 font-medium px-4 py-2 rounded-full flex items-center space-x-2 transition-all">
                    <Plus className="w-5 h-5" />
                    <span>Add Question</span>
                </button>
            </div>

        </div>
    );
};

export default CreateExam;
