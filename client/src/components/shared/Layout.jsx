import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, FileText, PlusCircle, BarChart3, Settings, LogOut } from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, children }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                ? 'bg-primary-50 text-primary-600 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`
        }
    >
        <Icon className="w-5 h-5" />
        <span>{children}</span>
    </NavLink>
);

const Layout = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <div className="w-8 h-8 bg-primary-500 rounded-md flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-lg">E</span>
                    </div>
                    <span className="text-xl font-bold text-gray-800 tracking-tight">Examora</span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1">
                    <SidebarLink to="/teacher/dashboard" icon={LayoutDashboard}>Dashboard</SidebarLink>
                    <SidebarLink to="/teacher/exams" icon={FileText}>My Exams</SidebarLink>
                    <SidebarLink to="/teacher/create-exam" icon={PlusCircle}>Create Exam</SidebarLink>
                    <SidebarLink to="/teacher/results" icon={BarChart3}>Results</SidebarLink>
                    <SidebarLink to="/teacher/settings" icon={Settings}>Settings</SidebarLink>
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header (minimal) */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:hidden">
                    <span className="text-xl font-bold text-gray-800 tracking-tight">Examora</span>
                </header>

                <div className="flex-1 overflow-auto p-6 md:p-8">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
