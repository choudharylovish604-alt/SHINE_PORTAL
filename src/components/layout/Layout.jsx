import React from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const userName = localStorage.getItem('userName') || 'User';

  if (!token) return <Navigate to="/" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role={role} />
      
      <main className="flex-1 ml-20 lg:ml-64 p-4 lg:p-8 transition-all duration-300">
        {/* Top Navbar */}
        <div className="flex justify-between items-center mb-8 px-4 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <span>Shine</span>
              <span>/</span>
              <span className="text-slate-900">{role === 'mentor' ? 'Faculty Portal' : 'Student Portal'}</span>
           </div>
           <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                 <p className="text-xs font-bold text-slate-900 leading-none">{userName}</p>
                 <p className="text-[10px] text-slate-500 uppercase tracking-tight mt-1">{role}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-200">
                 {userName.charAt(0)}
              </div>
           </div>
        </div>

        {/* Page Content */}
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
