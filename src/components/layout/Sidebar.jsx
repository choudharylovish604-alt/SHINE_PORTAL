import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Calendar, 
  Menu, 
  LogOut, 
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  FileUp,
  MessageCircle
} from 'lucide-react';

const Sidebar = ({ role }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const navItems = role === 'mentor' ? [
    { name: 'Dashboard', path: '/mentor', icon: LayoutDashboard },
    { name: 'Students', path: '/mentor/students', icon: Users },
    { name: 'Attendance', path: '/mentor/attendance', icon: ClipboardList },
    { name: 'Analytics', path: '/mentor/analytics', icon: BarChart3 },
    { name: 'Counseling', path: '/mentor/counseling', icon: Calendar },
    { name: 'Batch Analysis', path: '/mentor/batch-analysis', icon: FileUp },
    { name: 'Student Queries', path: '/mentor/chatbot', icon: MessageCircle }
  ] : [
    { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
    { name: 'Attendance', path: '/student/attendance', icon: ClipboardList },
    { name: 'My Profile', path: '/student/profile', icon: Users },
    { name: 'Counseling', path: '/student/counseling', icon: Calendar },
    { name: 'Chatbot', path: '/student/student-chatbot', icon: MessageCircle }
  ];

  return (
    <div className={`bg-white border-r border-slate-200 h-screen transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-64'} fixed left-0 top-0 z-20`}>
      {/* Logo Area */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <img src="/shine_logo.png" alt="Shine Logo" className="h-10 w-10 object-contain" />
            <span className="text-indigo-600 font-black text-xl tracking-tighter">SHINE</span>
          </div>
        )}
        {collapsed && <img src="/shine_logo.png" alt="Logo" className="h-8 w-8 object-contain mx-auto" />}
        
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-all absolute right-[-14px] top-7 bg-white border border-slate-200 shadow-sm"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 flex flex-col gap-1 px-3 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/mentor' || item.path === '/student'}
            className={({ isActive }) =>
              `flex items-center ${collapsed ? 'justify-center' : 'justify-start'} px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
              }`
            }
            title={collapsed ? item.name : ''}
          >
            <item.icon className={`w-5 h-5 ${!collapsed && 'mr-3'}`} />
            {!collapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </div>

      {/* Bottom Area */}
      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={handleLogout}
          className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} w-full px-4 py-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200 font-semibold text-sm`}
          title={collapsed ? "Logout" : ""}
        >
          <LogOut className={`w-5 h-5 ${!collapsed && 'mr-3'}`} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
