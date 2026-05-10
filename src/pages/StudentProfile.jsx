import API_BASE_URL from '../config';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, Mail, GraduationCap, MapPin, Calendar, Award, TrendingUp } from 'lucide-react';
import { TrendLineChart } from '../components/ui/Charts';
import { Card, CardHeader, CardBody } from '../components/ui/Card';

const StudentProfile = () => {
  const [data, setData] = useState(null);
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
      
      let history = { records: [] };
      if (res.data.profile) {
        const hRes = await axios.get(`${API_BASE_URL}/students/${res.data.profile.id}/history`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        history = hRes.data;
      }
      setData({ ...res.data, history: history.records });
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { profile, history } = data;

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Profile Header Card */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-40 bg-gradient-to-r from-indigo-600 to-indigo-800"></div>
        <div className="px-10 pb-10 relative">
          <div className="flex flex-col md:flex-row items-end -mt-16 gap-6">
            <div className="w-32 h-32 rounded-[40px] bg-white p-2 shadow-xl relative z-10">
                <div className="w-full h-full rounded-[32px] bg-indigo-600 text-white flex items-center justify-center text-4xl font-black">
                    {profile.name?.charAt(0)}
                </div>
            </div>
            <div className="flex-1 mb-2">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{profile.name}</h1>
              <div className="flex items-center text-slate-500 font-medium space-x-4 mt-2">
                <div className="flex items-center space-x-1.5">
                    <GraduationCap className="w-4 h-4 text-indigo-500" />
                    <span>{profile.enrollment_number}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    <span>Main Campus</span>
                </div>
              </div>
            </div>
            <button className="btn-secondary mb-2">Update Information</button>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sidebar info */}
            <div className="md:col-span-1 space-y-8">
               <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Contact Details</h4>
                  <div className="space-y-4">
                     <div className="flex items-center space-x-3 text-slate-600">
                        <Mail className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-semibold">student@university.edu</span>
                     </div>
                     <div className="flex items-center space-x-3 text-slate-600">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-semibold">Joined Academic Year 2024</span>
                     </div>
                  </div>
               </div>

               <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Course Assignment</h4>
                  <div className="space-y-4">
                     <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Current Program</p>
                        <p className="text-sm font-bold text-slate-800">{profile.course}</p>
                     </div>
                     <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Current Status</p>
                        <p className="text-sm font-bold text-slate-800">Year {profile.year} • Semester {profile.semester || 'N/A'}</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Main Profile Body */}
            <div className="md:col-span-2 space-y-8">
                <Card className="pro-card p-8">
                   <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                       <TrendingUp className="w-4 h-4 mr-2" />
                       Academic Performance Trajectory
                   </h4>
                   <div className="h-[250px]">
                     <TrendLineChart 
                      data={history} 
                      xAxisKey="semester" 
                      lines={[
                        { key: 'attendance_percentage', color: '#10b981', label: 'Attendance' },
                        { key: 'marks_percentage', color: '#4f46e5', label: 'Marks' }
                      ]} 
                     />
                   </div>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Scholarships</p>
                            <p className="font-bold text-slate-800">Active Listing</p>
                        </div>
                    </div>
                    <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Assigned Mentor</p>
                            <p className="font-bold text-slate-800">Dr. Sarah Jenkins</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
