import API_BASE_URL from '../config';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Upload, FileText, Search, ShieldAlert, Download, MessageSquare, TrendingUp, Info } from 'lucide-react';
import Table, { RiskBadge } from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { TrendLineChart } from '../components/ui/Charts';
import { Card, CardHeader, CardBody } from '../components/ui/Card';

const MentorStudents = () => {
  const [students, setStudents] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentHistory, setStudentHistory] = useState({ records: [], risk: [] });
  const [counselingNotes, setCounselingNotes] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/upload-data`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      fetchStudents();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to process data');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleRowClick = async (student) => {
    setSelectedStudent(student);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/students/${student.id}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudentHistory(res.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Error fetching student history:', error);
    }
  };

  const handleScheduleClick = (student, e) => {
    e.stopPropagation();
    setSelectedStudent(student);
    setCounselingNotes(`Review for ${student.name}`);
    setIsModalOpen(true);
  };

  const submitCounseling = async () => {
    try {
      const token = localStorage.getItem('token');
      const mentorId = localStorage.getItem('userId');
      await axios.post(`${API_BASE_URL}/counseling`, {
        student_id: selectedStudent.id,
        mentor_id: mentorId,
        scheduled_date: new Date(Date.now() + 86400000).toISOString(),
        notes: counselingNotes
      }, { headers: { Authorization: `Bearer ${token}` } });
      setIsModalOpen(false);
      alert('Counseling session scheduled.');
    } catch (error) {
       console.error(error);
       alert('Failed to schedule session.');
    }
  };

  const tableColumns = [
    { header: 'Student', accessor: 'name', render: (row) => (
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">
          {row.name.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-slate-800">{row.name}</p>
          <p className="text-[10px] text-slate-500 font-medium">{row.enrollment_number}</p>
        </div>
      </div>
    )},
    { header: 'Course / Year', accessor: 'course', render: (row) => (
        <div className="flex flex-col">
            <span className="font-bold text-slate-700 text-xs">{row.course || 'N/A'}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Year {row.year || '-'}</span>
        </div>
    )},
    { header: 'Attendance', accessor: 'attendance_percentage', render: (row) => (
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
            <span>Current</span>
            <span className={row.attendance_percentage < 75 ? 'text-rose-600' : 'text-emerald-600'}>{row.attendance_percentage || 0}%</span>
        </div>
        <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-1000 ${row.attendance_percentage < 75 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, row.attendance_percentage || 0)}%` }}></div>
        </div>
      </div>
    )},
    { header: 'Academic Score', accessor: 'marks_percentage', render: (row) => (
        <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-900 text-lg">{row.marks_percentage || 0}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Points</span>
        </div>
    )},
    { header: 'Risk Status', accessor: 'risk_category', render: (row) => <RiskBadge level={row.risk_category} /> }
  ];

  const latestRecord = studentHistory.records[studentHistory.records.length - 1];

  return (
    <div className="space-y-6 animate-fade-in">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and monitor all student profiles and performance data.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <input type="file" id="excel-upload" accept=".xlsx, .xls" onChange={handleUpload} className="hidden" />
          <label 
            htmlFor="excel-upload"
            className={`btn-secondary flex items-center space-x-2 cursor-pointer ${uploading ? 'opacity-70 pointer-events-none' : ''}`}
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>Import Data</span>
          </label>
        </div>
      </div>

      <Table 
        title="Student Roster"
        data={students}
        columns={tableColumns}
        onRowAction={handleRowClick}
        actionText="View Profile"
        selectable={true}
        onBulkAction={(ids) => alert(`Selected ${ids.length} students.`)}
      />

      {/* Student Details Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Student Profile">
        {selectedStudent && (
          <div className="space-y-8 p-2">
            {/* Header */}
            <div className="flex items-center space-x-6 p-8 bg-white border border-slate-200 rounded-3xl">
              <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-3xl shadow-lg">
                {selectedStudent.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900">{selectedStudent.name}</h3>
                <p className="text-slate-500 text-sm">{selectedStudent.enrollment_number} • {selectedStudent.course}</p>
                <div className="mt-3 flex space-x-2">
                   <RiskBadge level={selectedStudent.risk_category} />
                   <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-tight border border-slate-200">Year {selectedStudent.year}</span>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Attendance</p>
                  <p className="text-4xl font-black text-slate-900">{selectedStudent.attendance_percentage}<span className="text-sm text-slate-400 ml-1">%</span></p>
               </div>
               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Academic Score</p>
                  <p className="text-4xl font-black text-slate-900">{selectedStudent.marks_percentage}<span className="text-sm text-slate-400 ml-1">pts</span></p>
               </div>
               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Fee Status</p>
                  <p className={`text-xl font-bold uppercase ${selectedStudent.fee_paid ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {selectedStudent.fee_paid ? 'Cleared' : 'Pending'}
                  </p>
               </div>
            </div>

            {/* Chart and Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 pro-card p-6">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Performance Trend
                    </h4>
                    <div className="h-[250px]">
                      <TrendLineChart 
                          data={studentHistory.records} 
                          xAxisKey="semester" 
                          lines={[
                          { key: 'attendance_percentage', color: '#10b981', label: 'Attendance' },
                          { key: 'marks_percentage', color: '#4f46e5', label: 'Academic' }
                          ]} 
                      />
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card className="pro-card p-6 bg-indigo-50/30">
                        <h4 className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mb-4 flex items-center">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Latest Feedback
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed italic">
                            {latestRecord?.student_feedback ? `"${latestRecord.student_feedback}"` : "No feedback provided."}
                        </p>
                    </Card>

                    <Card className="pro-card p-6">
                        <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                            <Download className="w-4 h-4 mr-2" />
                            Documents
                        </h4>
                        <div className="space-y-2">
                            {studentHistory.records.map((rec, i) => (
                                <a key={i} href={rec.report_url} target="_blank" rel="noreferrer" className="flex justify-between items-center text-[10px] p-3 rounded-xl bg-slate-50 hover:bg-white hover:border-indigo-200 transition-all border border-slate-100 font-bold text-slate-700">
                                    <span>{rec.semester} Report</span>
                                    <Download className="w-3 h-3 text-indigo-600" />
                                </a>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            <div className="flex pt-4">
              <button 
                onClick={(e) => { setIsDetailModalOpen(false); handleScheduleClick(selectedStudent, e); }}
                className="btn-primary w-full py-4"
              >
                Schedule Counseling Session
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Scheduling Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Counseling Session">
        {selectedStudent && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Selected Student</p>
              <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-indigo-600">{selectedStudent.name.charAt(0)}</div>
                  <p className="font-bold text-slate-800">{selectedStudent.name} • {selectedStudent.enrollment_number}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Session Notes / Objectives</label>
              <textarea 
                className="input-field min-h-[160px]"
                value={counselingNotes}
                onChange={(e) => setCounselingNotes(e.target.value)}
                placeholder="Enter details for the intervention..."
              ></textarea>
            </div>
            
            <button onClick={submitCounseling} className="btn-primary w-full py-4 shadow-lg shadow-indigo-100">
              Confirm Schedule
            </button>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default MentorStudents;
