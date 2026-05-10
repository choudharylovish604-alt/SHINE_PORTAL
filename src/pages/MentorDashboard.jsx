import API_BASE_URL from '../config';
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Users, AlertTriangle, Activity, CheckCircle, TrendingUp, ShieldAlert, FileText, Info } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import { TrendLineChart, RiskPieChart } from '../components/ui/Charts';
import { Card, CardHeader, CardBody } from '../components/ui/Card';

const MentorDashboard = () => {
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
      console.error('Error fetching dashboard data:', error);
    }
  };

  const stats = useMemo(() => {
    const total = students.length;
    const highRisk = students.filter(s => s.risk_category === 'High').length;
    const mediumRisk = students.filter(s => s.risk_category === 'Medium').length;
    const lowRisk = students.filter(s => s.risk_category === 'Low').length;
    return { total, highRisk, mediumRisk, lowRisk };
  }, [students]);

  const chartData = useMemo(() => {
    const riskPie = [
      { name: 'High', value: stats.highRisk },
      { name: 'Medium', value: stats.mediumRisk },
      { name: 'Low', value: stats.lowRisk }
    ].filter(d => d.value > 0);

    const trendData = analytics.trendData.length > 0 ? analytics.trendData : [
      { month: 'Sem 1', avgAtt: 75, avgMarks: 70 },
      { month: 'Sem 2', avgAtt: 72, avgMarks: 68 },
      { month: 'Sem 3', avgAtt: 80, avgMarks: 75 },
    ];

    return { riskPie, trendData };
  }, [stats, analytics]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mentor Dashboard</h1>
          <p className="text-slate-500 text-sm">Overview of student performance and risk metrics.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-semibold text-slate-600">System Live</span>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={stats.total} icon={Users} colorClass="bg-indigo-50 text-indigo-600 border-indigo-100" />
        <StatCard title="High Risk" value={stats.highRisk} icon={ShieldAlert} colorClass="bg-rose-50 text-rose-600 border-rose-100" />
        <StatCard title="Medium Risk" value={stats.mediumRisk} icon={AlertTriangle} colorClass="bg-amber-50 text-amber-600 border-amber-100" />
        <StatCard title="Low Risk" value={stats.lowRisk} icon={CheckCircle} colorClass="bg-emerald-50 text-emerald-600 border-emerald-100" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column */}
        <div className="lg:col-span-2 space-y-6">
            <Card className="pro-card">
              <CardHeader title="Performance Trends" />
              <CardBody>
                <div className="h-[300px] w-full">
                  <TrendLineChart 
                      data={chartData.trendData} 
                      xAxisKey="month" 
                      lines={[
                          { key: 'avgAtt', color: '#4f46e5', label: 'Attendance' },
                          { key: 'avgMarks', color: '#e11d48', label: 'Academic' }
                      ]} 
                  />
                </div>
              </CardBody>
            </Card>
        </div>

        {/* Distribution Column */}
        <div className="space-y-6">
            <Card className="pro-card h-full">
              <CardHeader title="Risk Distribution" />
              <CardBody className="flex flex-col items-center justify-center py-10">
                {chartData.riskPie.length > 0 ? (
                   <RiskPieChart data={chartData.riskPie} />
                ) : (
                   <div className="text-slate-400 text-sm italic py-20 text-center">
                     <Info className="w-8 h-8 mx-auto mb-2 opacity-20" />
                     No data available
                   </div>
                )}
              </CardBody>
            </Card>
        </div>
      </div>

      {/* Action Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="pro-card p-8 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Generate Report</h3>
                <p className="text-indigo-100 text-sm mb-6 max-w-sm">Create a comprehensive PDF report of current student standings and dropout risks.</p>
                <button className="bg-white text-indigo-600 px-6 py-2 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all">Download PDF</button>
             </div>
             <FileText className="absolute top-[-20px] right-[-20px] w-40 h-40 text-white/10 rotate-12" />
          </div>

          <div className="pro-card p-8 bg-white border border-slate-200 flex flex-col justify-between">
             <div>
                <h3 className="text-xl font-bold mb-2 text-slate-800">Analyze New Cohort</h3>
                <p className="text-slate-500 text-sm mb-6">Upload student batch files (XLSX/CSV) for instant risk profiling and AI insights.</p>
             </div>
             <button 
                onClick={() => window.location.href = '/mentor/batch-analysis'}
                className="bg-indigo-50 text-indigo-600 px-6 py-2 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-all text-center"
             >
                Start Batch Analysis
             </button>
          </div>
      </div>

    </div>
  );
};

export default MentorDashboard;
