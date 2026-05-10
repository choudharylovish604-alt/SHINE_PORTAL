import API_BASE_URL from '../config';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Clock, User, CheckCircle2, XCircle, MessageSquare, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';

const CounselingManager = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/counseling`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(res.data);
    } catch (error) {
      console.error('Error fetching counseling sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      alert(`Session updated: Status set to ${status}.`);
      fetchSessions();
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const filteredSessions = sessions.filter(s => filter === 'all' || s.status === filter);

  if (loading) return <div className="py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Loading management matrix...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Session Management</h1>
          <p className="text-slate-500 text-sm mt-1">Review and manage student counseling requests.</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
            {['all', 'pending', 'completed'].map((f) => (
                <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all capitalize ${filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    {f}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSessions.map((session, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all flex flex-col justify-between">
                <div>
                   <div className="flex justify-between items-start mb-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${session.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                         {session.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                      </div>
                      <span className={`status-badge ${session.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {session.status}
                      </span>
                   </div>

                   <div className="space-y-4">
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Student ID</p>
                         <div className="flex items-center space-x-2">
                             <User className="w-4 h-4 text-indigo-600" />
                             <span className="text-slate-800 font-bold">{session.enrollment_number}</span>
                         </div>
                      </div>

                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Scheduled Date</p>
                         <div className="flex items-center space-x-2">
                             <Calendar className="w-4 h-4 text-slate-400" />
                             <span className="text-slate-600 font-medium text-sm">{new Date(session.scheduled_date).toLocaleDateString()}</span>
                         </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                            <MessageSquare className="w-3 h-3 mr-2" /> Session Notes
                         </p>
                         <p className="text-xs text-slate-600 italic leading-relaxed">"{session.notes}"</p>
                      </div>
                   </div>
                </div>

                {session.status === 'pending' && (
                  <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
                     <button 
                        onClick={() => updateStatus(session.id, 'completed')}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-all"
                     >
                        Mark Completed
                     </button>
                     <button 
                        onClick={() => updateStatus(session.id, 'cancelled')}
                        className="p-3 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl border border-slate-200 transition-all"
                     >
                        <XCircle className="w-5 h-5" />
                     </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm font-medium italic">No session requests found for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CounselingManager;
