import React from 'react';
import { Search, Bell, User } from 'lucide-react';

const Navbar = ({ userName, role }) => {
  return (
    <div className="h-20 bg-slate-950/20 backdrop-blur-md border-b border-cyan-500/10 flex items-center justify-between px-10 sticky top-0 z-10 transition-all duration-300">
      {/* Search Bar */}
      <div className="flex-1 max-w-md group">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Scanning student database..." 
            className="w-full pl-12 pr-6 py-2.5 bg-slate-900/50 border border-cyan-500/10 rounded-2xl text-sm font-medium text-cyan-50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:bg-slate-900 focus:border-cyan-500/50 transition-all placeholder:text-slate-700 font-mono"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-8">
        {/* Notifications */}
        <button className="relative p-2.5 text-slate-500 hover:text-cyan-400 transition-all rounded-2xl hover:bg-slate-900 shadow-none hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-950"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-4 cursor-pointer group">
          <div className="text-right hidden md:block">
            <p className="text-sm font-black text-slate-100 leading-none group-hover:text-cyan-400 transition-colors">{userName || 'User'}</p>
            <p className="text-[10px] text-cyan-500 mt-1.5 uppercase font-black tracking-widest leading-none opacity-60">ADMIN CONSOLE</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-black text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:scale-110 transition-transform">
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
