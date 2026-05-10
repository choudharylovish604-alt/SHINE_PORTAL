import API_BASE_URL from '../config';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, ShieldAlert, CheckCircle2, TrendingUp, Calendar, Zap, MessageSquare, GraduationCap, AlertTriangle } from 'lucide-react';
import { TrendLineChart } from '../components/ui/Charts';
import { Card, CardHeader, CardBody } from '../components/ui/Card';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/students/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let hist = [];
      if (res.data.profile) {
        const hRes = await axios.get(`${API_BASE_URL}/students/${res.data.profile.id}/history`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        hist = hRes.data.records;
      }
      setData(res.data);
      setHistory(hist);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { profile, latestRecord, risk, counseling } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Welcome Header */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hello, {profile.name}!</h1>
           <p className="text-slate-500 text-sm mt-1">Here is your academic and attendance summary.</p>
        </div>
        <div className="flex items-center space-x-3 bg-indigo-50 px-5 py-3 rounded-2xl border border-indigo-100">
            <GraduationCap className="w-6 h-6 text-indigo-600" />
            <div>
               <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Enrolled Course</p>
               <p className="text-sm font-bold text-indigo-900">{profile.course}</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Attendance Summary */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attendance Status</p>
              <Activity className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex items-end space-x-2">
              <h4 className={`text-4xl font-black ${latestRecord?.attendance_percentage >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {latestRecord?.attendance_percentage || 0}%
              </h4>
              <span className="text-xs font-bold text-slate-400 mb-1">Last Updated</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
               <div className={`h-full transition-all duration-1000 ${latestRecord?.attendance_percentage < 75 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${latestRecord?.attendance_percentage || 0}%` }}></div>
            </div>
        </div>

        {/* Risk Assessment */}
        <div className={`bg-white p-8 rounded-3xl border-2 shadow-sm space-y-4 ${risk?.risk_category === 'High' ? 'border-rose-100' : 'border-slate-100'}`}>
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Risk Assessment</p>
              <ShieldAlert className={`w-4 h-4 ${risk?.risk_category === 'High' ? 'text-rose-500' : 'text-emerald-500'}`} />
            </div>
            <h4 className={`text-2xl font-black uppercase tracking-tight ${risk?.risk_category === 'High' ? 'text-rose-600' : risk?.risk_category === 'Medium' ? 'text-amber-600' : 'text-emerald-600'}`}>
              {risk?.risk_category || 'Low Risk'}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {risk?.reason || 'Your performance and attendance are within optimal parameters.'}
            </p>
        </div>

        {/* Academic Marks */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Academic Score</p>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <h4 className="text-4xl font-black text-slate-900">
              {latestRecord?.marks_percentage || 0}<span className="text-lg text-slate-400 ml-1">pts</span>
            </h4>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`h-2 flex-1 rounded-full ${i <= Math.ceil((latestRecord?.marks_percentage || 0) / 20) ? 'bg-amber-400' : 'bg-slate-100'}`}></div>
              ))}
            </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 pro-card">
          <CardHeader title="Performance History" />
          <CardBody>
            <div className="h-[300px]">
              <TrendLineChart 
                data={history} 
                xAxisKey="semester" 
                lines={[
                  { key: 'attendance_percentage', color: '#10b981', label: 'Attendance' },
                  { key: 'marks_percentage', color: '#4f46e5', label: 'Academic Score' }
                ]} 
              />
            </div>
          </CardBody>
        </Card>

        <div className="space-y-6">
            <Card className="pro-card">
                <CardHeader title="Counseling Sessions" />
                <CardBody>
                  {counseling.length > 0 ? (
                      <div className="space-y-3">
                          {counseling.slice(0, 2).map((session, i) => (
                              <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-colors">
                                  <div className="flex justify-between items-center mb-2">
                                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${session.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{session.status}</span>
                                      <span className="text-[10px] font-bold text-slate-400">{new Date(session.scheduled_date).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-xs font-bold text-slate-800">Meeting with Mentor</p>
                                  <p className="text-[10px] text-slate-500 italic mt-1 line-clamp-2">"{session.notes}"</p>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="text-center py-10">
                          <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No Sessions</p>
                      </div>
                  )}
                </CardBody>
            </Card>

            <div className="p-6 rounded-3xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 relative overflow-hidden">
                <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-80">Quick Tip</h4>
                <p className="text-sm font-medium leading-relaxed relative z-10">
                  Try to keep your attendance above 85% to maintain a low-risk profile.
                </p>
                <TrendingUp className="absolute bottom-[-10px] right-[-10px] w-20 h-20 text-white/10" />
            </div>
        </div>
      </div>

    </div>
  );
};

export default StudentDashboard;
