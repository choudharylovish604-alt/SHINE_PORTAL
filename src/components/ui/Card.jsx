import React from 'react';

export const Card = ({ children, className = '', title, action }) => (
  <div className={`glass-card overflow-hidden ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ title, action, className = '' }) => (
  <div className={`px-8 py-6 border-b border-slate-50 flex items-center justify-between ${className}`}>
    <h3 className="font-black text-slate-900 tracking-tight text-sm uppercase tracking-widest">{title}</h3>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`p-8 ${className}`}>
    {children}
  </div>
);
