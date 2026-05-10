import API_BASE_URL from '../config';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, MessageSquare, Clock, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';

const StudentCounseling = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestNotes, setRequestNotes] = useState('');

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

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!requestNotes) return;
    
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      await axios.post(`${API_BASE_URL}/counseling`, {
        student_id: user.studentId,
        scheduled_date: new Date(Date.now() + 86400000).toISOString(),
        notes: requestNotes
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setRequestNotes('');
      fetchSessions();
      alert('Your counseling request has been submitted.');
    } catch (error) {
      console.error('Request failed:', error);
    }
  };

  if (loading) return <div className="py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing counseling records...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Counseling Support</h1>
           <p className="text-slate-500 text-sm mt-1">Connect with your mentor for academic or personal support.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="pro-card p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-indigo-600" />
                Request a Session
            </h3>
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Reason for Request</label>
                <textarea 
                  className="input-field min-h-[150px]"
                  placeholder="Describe your concerns or topics you'd like to discuss..."
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary w-full py-4 text-sm">
                Submit Request
              </button>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-slate-800 px-2 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
              Session History
          </h3>
          
          <div className="space-y-4">
            {sessions.length > 0 ? sessions.map((session, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-indigo-200 transition-all">
                <div className="flex items-center space-x-6">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${session.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {session.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                   </div>
                   <div>
                      <div className="flex items-center space-x-2">
                         <span className={`status-badge ${session.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{session.status}</span>
                         <span className="text-[10px] font-bold text-slate-400">{new Date(session.scheduled_date).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-slate-800 font-bold mt-1">Session with {session.mentor_name || 'Assigned Faculty'}</h4>
                      <p className="text-xs text-slate-500 italic mt-1 leading-relaxed">"{session.notes}"</p>
                   </div>
                </div>
                {session.status === 'pending' && (
                  <div className="flex items-center text-amber-600 text-[10px] font-bold uppercase tracking-widest bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
                     <AlertCircle className="w-3 h-3 mr-2" />
                     Waiting for Confirmation
                  </div>
                )}
              </div>
            )) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm font-medium italic">No counseling sessions recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCounseling;
