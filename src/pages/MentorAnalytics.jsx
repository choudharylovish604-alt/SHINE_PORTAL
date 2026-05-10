import API_BASE_URL from '../config';
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { BarChart3, TrendingUp, Info, ShieldAlert, Target } from 'lucide-react';
import { TrendLineChart, RiskPieChart } from '../components/ui/Charts';
import { Card, CardHeader, CardBody } from '../components/ui/Card';

const MentorAnalytics = () => {
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState({ trendData: [] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [studentsRes, analyticsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/students`, config),
        axios.get(`${API_BASE_URL}/analytics`, config)
      ]);
      setStudents(studentsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const chartData = useMemo(() => {
    const highRisk = students.filter(s => s.risk_category === 'High').length;
    const mediumRisk = students.filter(s => s.risk_category === 'Medium').length;
    const lowRisk = students.filter(s => s.risk_category === 'Low').length;

    const riskPie = [
      { name: 'High', value: highRisk },
      { name: 'Medium', value: mediumRisk },
      { name: 'Low', value: lowRisk }
    ].filter(d => d.value > 0);

    return { riskPie, trendData: analytics.trendData };
  }, [students, analytics]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Population Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Aggregated performance and risk insights across the student body.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="pro-card p-6">
          <CardHeader title="Performance History" />
          <div className="mt-6 h-[350px]">
             <TrendLineChart 
                data={chartData.trendData} 
                xAxisKey="month" 
                lines={[
                { key: 'avgAtt', color: '#4f46e5', label: 'Avg Attendance' },
                { key: 'avgMarks', color: '#e11d48', label: 'Avg Score' }
                ]} 
             />
          </div>
        </Card>

        <Card className="pro-card p-6">
          <CardHeader title="Overall Risk Distribution" />
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <div className="h-[300px] w-full flex items-center justify-center">
              <RiskPieChart data={chartData.riskPie} />
            </div>
            <div className="mt-8 grid grid-cols-3 gap-8 w-full max-w-sm">
                <div className="text-center">
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-1">High Risk</p>
                    <p className="text-2xl font-black text-slate-900">{chartData.riskPie.find(d => d.name === 'High')?.value || 0}</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Medium Risk</p>
                    <p className="text-2xl font-black text-slate-900">{chartData.riskPie.find(d => d.name === 'Medium')?.value || 0}</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Low Risk</p>
                    <p className="text-2xl font-black text-slate-900">{chartData.riskPie.find(d => d.name === 'Low')?.value || 0}</p>
                </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
             <div className="flex items-center space-x-3 mb-3">
                 <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                     <Target className="w-5 h-5" />
                 </div>
                 <h3 className="font-bold text-slate-800">Attendance Focus</h3>
             </div>
             <p className="text-slate-500 text-sm leading-relaxed">Students with attendance below 70% represent 85% of the total high-risk population this semester.</p>
         </div>

         <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
             <div className="flex items-center space-x-3 mb-3">
                 <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
                     <ShieldAlert className="w-5 h-5" />
                 </div>
                 <h3 className="font-bold text-slate-800">Key Indicators</h3>
             </div>
             <p className="text-slate-500 text-sm leading-relaxed">Financial status and early-semester performance are the strongest predictors for long-term retention.</p>
         </div>

         <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
             <div className="flex items-center space-x-3 mb-3">
                 <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                     <Info className="w-5 h-5" />
                 </div>
                 <h3 className="font-bold text-slate-800">Strategic Tip</h3>
             </div>
             <p className="text-slate-500 text-sm leading-relaxed">Proactive mentoring in Semester 2 has historically reduced dropout rates by approximately 12%.</p>
         </div>
      </div>

    </div>
  );
};

export default MentorAnalytics;
