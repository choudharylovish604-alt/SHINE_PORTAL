import React, { useState } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, UserCheck } from 'lucide-react';

export const RiskBadge = ({ level }) => {
  if (level === 'High') return <span className="status-badge text-rose-500 border-rose-500/50 bg-rose-500/10 shadow-[0_0_10px_rgba(244,63,94,0.3)]">HIGH RISK</span>;
  if (level === 'Medium') return <span className="status-badge text-amber-500 border-amber-500/50 bg-amber-500/10">MEDIUM RISK</span>;
  if (level === 'Low') return <span className="status-badge text-emerald-500 border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.3)]">LOW RISK</span>;
  return <span className="status-badge text-slate-500 border-slate-500/50">UNKNOWN</span>;
};

const Table = ({ data, columns, title, onRowAction, actionText = "View", itemsPerPage = 10, selectable = false, onBulkAction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  const filteredData = data.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.enrollment_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterLevel === 'All' || item.risk_category === filterLevel;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedData.map(item => item.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-8 py-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
           <h3 className="font-black text-slate-900 tracking-tight text-sm uppercase tracking-widest">{title}</h3>
           {selectable && selectedIds.length > 0 && (
              <div className="flex items-center space-x-3 mt-3 animate-in fade-in slide-in-from-left-2">
                 <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">{selectedIds.length} Selected</span>
                 <button 
                  onClick={() => onBulkAction?.(selectedIds)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 underline decoration-2 underline-offset-4"
                 >
                   <UserCheck className="w-3.5 h-3.5" />
                   <span>Bulk Action</span>
                 </button>
              </div>
           )}
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-72 group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search students..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="input-field pl-12 py-2.5 text-sm"
            />
          </div>
          
          <div className="relative group">
            <Filter className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-indigo-600 transition-colors pointer-events-none" />
            <select 
                value={filterLevel}
                onChange={(e) => { setFilterLevel(e.target.value); setCurrentPage(1); }}
                className="input-field pl-12 pr-10 py-2.5 text-sm appearance-none cursor-pointer"
            >
                <option value="All">All Risk Levels</option>
                <option value="High">High Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="Low">Low Risk</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
              {selectable && (
                <th className="px-8 py-4 w-12">
                  <div className="flex items-center justify-center">
                    <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded-lg border-2 border-slate-200 text-indigo-600 focus:ring-indigo-100 transition-all cursor-pointer" 
                        onChange={toggleSelectAll}
                        checked={selectedIds.length === paginatedData.length && paginatedData.length > 0}
                    />
                  </div>
                </th>
              )}
              {columns.map((col, i) => (
                <th key={i} className="px-8 py-4">{col.header}</th>
              ))}
              {onRowAction && <th className="px-8 py-4 text-right">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedData.length > 0 ? paginatedData.map((row, i) => (
              <tr key={i} className={`group hover:bg-indigo-50/20 transition-all duration-300 ${selectedIds.includes(row.id) ? 'bg-indigo-50/40' : ''}`}>
                {selectable && (
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center">
                        <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded-lg border-2 border-slate-200 text-indigo-600 focus:ring-indigo-100 transition-all cursor-pointer"
                            checked={selectedIds.includes(row.id)}
                            onChange={() => toggleSelectOne(row.id)}
                        />
                    </div>
                  </td>
                )}
                {columns.map((col, j) => (
                  <td key={j} className="px-8 py-5 text-sm font-medium text-slate-100 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
                {onRowAction && (
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => onRowAction(row)}
                      className="inline-flex items-center justify-center bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-100 transition-all duration-300 active:scale-95"
                    >
                      {actionText}
                    </button>
                  </td>
                )}
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length + (onRowAction ? 1 : 0) + (selectable ? 1 : 0)} className="px-8 py-20 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-4">
                        <Filter className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="font-bold">No results found</p>
                    <p className="text-xs mt-1">Try adjusting your filters or search terms</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-8 py-6 border-t border-slate-50/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">
            Showing <span className="text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-white">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="text-white">{filteredData.length}</span>
          </span>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center space-x-1 mx-2">
                {[...Array(totalPages)].map((_, i) => (
                <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                    {i + 1}
                </button>
                )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
            </div>

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
