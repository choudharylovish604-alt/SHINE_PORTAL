import API_BASE_URL from '../config';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  BookOpen, 
  UserCheck, 
  UserX, 
  AlertTriangle, 
  History, 
  Plus, 
  Save,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  List,
  ChevronLeft
} from 'lucide-react';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { Card, CardHeader, CardBody } from '../components/ui/Card';

const AttendanceRecord = () => {
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [activeTab, setActiveTab] = useState(role === 'mentor' ? 'mark' : 'history');
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [defaulters, setDefaulters] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State for new session
  const [newSession, setNewSession] = useState({
    subject_id: '',
    session_name: '',
    session_date: new Date().toISOString().split('T')[0],
    timing: ''
  });

  // Attendance logging state
  const [attendanceLogs, setAttendanceLogs] = useState({});
  const [isMarking, setIsMarking] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, [role]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const subRes = await axios.get(`${API_BASE_URL}/subjects`, { headers });
      setSubjects(subRes.data);

      if (role === 'mentor') {
        const stuRes = await axios.get(`${API_BASE_URL}/students`, { headers });
        setStudents(stuRes.data);
        
        const defRes = await axios.get(`${API_BASE_URL}/attendance/defaulters`, { headers });
        setDefaulters(defRes.data);
      } else {
        const sId = JSON.parse(localStorage.getItem('user'))?.studentId;
        const histRes = await axios.get(`${API_BASE_URL}/attendance/student/${sId}`, { headers });
        setHistory(histRes.data);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!newSession.subject_id || !newSession.session_name || !newSession.timing) {
      alert('Please complete all session details.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/attendance/sessions`, newSession, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentSessionId(res.data.id);
      setIsMarking(true);
      const initialLogs = {};
      students.forEach(s => {
        initialLogs[s.id] = { status: 'present', reason: '' };
      });
      setAttendanceLogs(initialLogs);
    } catch (error) {
      console.error('Session creation failed:', error);
    }
  };

  const handleStatusToggle = (studentId) => {
    setAttendanceLogs(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status: prev[studentId].status === 'present' ? 'absent' : 'present'
      }
    }));
  };

  const handleReasonChange = (studentId, reason) => {
    setAttendanceLogs(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        reason
      }
    }));
  };

  const submitAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const logs = Object.entries(attendanceLogs).map(([studentId, data]) => ({
        student_id: parseInt(studentId),
        status: data.status,
        reason: data.reason
      }));

      await axios.post(`${API_BASE_URL}/attendance/logs`, {
        session_id: currentSessionId,
        logs
      }, { headers: { Authorization: `Bearer ${token}` } });

      alert('Attendance saved successfully.');
      setIsMarking(false);
      setCurrentSessionId(null);
      fetchInitialData();
    } catch (error) {
      console.error('Attendance submission failed:', error);
    }
  };

  const defaulterColumns = [
    { header: 'Student', accessor: 'name', render: (row) => (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
          {row.name.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-slate-800 text-xs">{row.name}</p>
          <p className="text-[10px] text-slate-500">{row.enrollment_number}</p>
        </div>
      </div>
    )},
    { header: 'Subject', accessor: 'subject_name' },
    { header: 'Attendance %', accessor: 'attendance_percentage', render: (row) => (
      <div className="flex items-center space-x-2">
         <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-24">
            <div className="h-full bg-rose-500" style={{ width: `${row.attendance_percentage || 0}%` }}></div>
         </div>
         <span className="text-[10px] font-bold text-rose-600">{Math.round(row.attendance_percentage || 0)}%</span>
      </div>
    )},
    { header: 'Status', render: () => <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-100 uppercase tracking-tight">Below Threshold</span> }
  ];

  const historyColumns = [
    { header: 'Date', accessor: 'session_date' },
    { header: 'Session Details', accessor: 'session_name', render: (row) => (
        <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-800">{row.session_name}</span>
            <span className="text-[10px] text-slate-500">{row.subject_name} • {row.timing}</span>
        </div>
    )},
    { header: 'Status', accessor: 'status', render: (row) => (
        row.status === 'present' ? 
        <span className="flex items-center text-emerald-600 text-[10px] font-bold">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Present
        </span> :
        <span className="flex items-center text-rose-600 text-[10px] font-bold">
            <XCircle className="w-3 h-3 mr-1" /> Absent
        </span>
    )},
    { header: 'Reason for Absence', accessor: 'reason', render: (row) => (
        <span className="text-[10px] text-slate-500 italic max-w-xs block truncate">
            {row.reason || 'N/A'}
        </span>
    )}
  ];

  if (isMarking) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-4">
             <button onClick={() => setIsMarking(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
             </button>
             <div>
                <h2 className="text-xl font-bold text-slate-900">Mark Attendance</h2>
                <p className="text-xs text-slate-500">{newSession.session_name} • {newSession.timing}</p>
             </div>
          </div>
          <button onClick={submitAttendance} className="btn-primary flex items-center space-x-2">
             <Save className="w-4 h-4" />
             <span>Save Records</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
           {students.map(student => (
              <div 
                key={student.id} 
                className={`bg-white p-5 rounded-2xl border-2 transition-all duration-300 ${attendanceLogs[student.id]?.status === 'present' ? 'border-emerald-100 bg-emerald-50/20' : 'border-rose-100 bg-rose-50/20'}`}
              >
                 <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${attendanceLogs[student.id]?.status === 'present' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            {student.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">{student.name}</p>
                            <p className="text-[10px] text-slate-500">{student.enrollment_number}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleStatusToggle(student.id)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${attendanceLogs[student.id]?.status === 'present' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
                    >
                        {attendanceLogs[student.id]?.status === 'present' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                    </button>
                 </div>
                 
                 {attendanceLogs[student.id]?.status === 'absent' && (
                    <div className="mt-3 animate-fade-in">
                        <label className="text-[9px] font-bold text-rose-500 uppercase mb-1 block">Reason for absence</label>
                        <input 
                            type="text" 
                            className="w-full bg-white border border-rose-100 rounded-lg px-3 py-2 text-[11px] text-slate-700 focus:outline-none focus:border-rose-400"
                            placeholder="Optional reason..."
                            value={attendanceLogs[student.id]?.reason}
                            onChange={(e) => handleReasonChange(student.id, e.target.value)}
                        />
                    </div>
                 )}
              </div>
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Attendance Management</h1>
           <p className="text-slate-500 text-sm mt-1">Track student participation and manage session records.</p>
        </div>

        {role === 'mentor' && (
            <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                    onClick={() => setActiveTab('mark')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'mark' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Mark Attendance
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    History
                </button>
                <button 
                    onClick={() => setActiveTab('defaulters')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'defaulters' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Defaulters
                </button>
            </div>
        )}
      </div>

      {activeTab === 'mark' && role === 'mentor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 pro-card p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                    <Plus className="w-5 h-5 mr-2 text-indigo-600" />
                    New Session
                </h3>
                <form onSubmit={handleCreateSession} className="space-y-5">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Subject</label>
                        <select 
                            className="input-field"
                            value={newSession.subject_id}
                            onChange={(e) => setNewSession({...newSession, subject_id: e.target.value})}
                        >
                            <option value="">Select Subject...</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Session Title</label>
                        <input 
                            type="text" 
                            className="input-field"
                            placeholder="e.g. Lecture 01, Practical Lab"
                            value={newSession.session_name}
                            onChange={(e) => setNewSession({...newSession, session_name: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Date</label>
                            <input 
                                type="date" 
                                className="input-field"
                                value={newSession.session_date}
                                onChange={(e) => setNewSession({...newSession, session_date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Time Slot</label>
                            <input 
                                type="text" 
                                className="input-field"
                                placeholder="9:00 - 10:00 AM"
                                value={newSession.timing}
                                onChange={(e) => setNewSession({...newSession, timing: e.target.value})}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary w-full py-3 text-sm mt-2">
                        Start Session
                    </button>
                </form>
            </Card>

            <div className="lg:col-span-2 space-y-6">
                <div className="pro-card p-8 bg-slate-50 border-l-4 border-l-indigo-600">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Instructions</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        Attendance data is used to calculate risk profiles. Students falling below the 30% attendance threshold will be automatically flagged for review.
                    </p>
                    <div className="flex gap-4 mt-6">
                        <div className="p-4 bg-white rounded-2xl border border-slate-200 flex-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Subjects</p>
                            <p className="text-xl font-bold text-slate-900">{subjects.length}</p>
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-slate-200 flex-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Students</p>
                            <p className="text-xl font-bold text-slate-900">{students.length}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'defaulters' && role === 'mentor' && (
        <Table 
            title="Defaulter List (Below 30%)"
            data={defaulters}
            columns={defaulterColumns}
        />
      )}

      {activeTab === 'history' && (
        <Table 
            title={role === 'mentor' ? "Attendance History" : "My Attendance Records"}
            data={history}
            columns={historyColumns}
        />
      )}

    </div>
  );
};

export default AttendanceRecord;
