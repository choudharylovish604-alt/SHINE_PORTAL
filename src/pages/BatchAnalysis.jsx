import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Upload, FileText, CheckCircle, AlertCircle, FileUp } from 'lucide-react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import API_BASE_URL from '../config';

const BatchAnalysis = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [fileName, setFileName] = useState('');

    const processPredictions = (predictions) => {
        const riskCounts = { Safe: 0, 'Medium Risk': 0, 'High Risk': 0 };
        predictions.forEach(p => riskCounts[p.risk_label]++);

        setResults(predictions);
        setStats([
            { name: 'Safe', value: riskCounts['Safe'], color: '#10B981' },
            { name: 'Medium Risk', value: riskCounts['Medium Risk'], color: '#F59E0B' },
            { name: 'High Risk', value: riskCounts['High Risk'], color: '#EF4444' }
        ]);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFileName(file.name);
        setLoading(true);

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                // Send to Batch Predict
                const aiResponse = await axios.post(`${API_BASE_URL}/ai/batch-predict`, data);
                processPredictions(aiResponse.data);
            } catch (error) {
                console.error("Upload Error:", error);
                alert("Error processing file. Please ensure it matches the required format.");
            } finally {
                setLoading(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    // Mock data processing for the 50 students
    const handleBatchProcess = async () => {
        setLoading(true);
        try {
            // Load the test students from the backend
            const response = await axios.get(`${API_BASE_URL}/test-students`);
            const students = response.data;

            // Send to Batch Predict
            const aiResponse = await axios.post(`${API_BASE_URL}/ai/batch-predict`, students);
            processPredictions(aiResponse.data);
            setFileName('Demo Test Dataset (50 Students)');
        } catch (error) {
            console.error("Batch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Batch Student Analysis</h1>
                <div className="flex gap-3">
                    {/* File Upload Button */}
                    <label className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 cursor-pointer shadow-sm transition-all">
                        <FileUp size={20} className="text-indigo-600" />
                        <span>{fileName ? `File: ${fileName}` : "Upload Local Excel"}</span>
                        <input 
                            type="file" 
                            className="hidden" 
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileUpload}
                            disabled={loading}
                        />
                    </label>

                    <button 
                        onClick={handleBatchProcess}
                        disabled={loading}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 shadow-md transition-all"
                    >
                        {loading ? "Processing..." : "Run Demo (50 Students)"}
                        <Upload size={20} />
                    </button>
                </div>
            </div>

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pie Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold mb-4">Risk Distribution</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {stats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 gap-4">
                        {stats.map(s => (
                            <div key={s.name} className="bg-white p-4 rounded-lg shadow-sm border-l-4" style={{ borderLeftColor: s.color }}>
                                <div className="text-gray-500 text-sm font-medium">{s.name}</div>
                                <div className="text-2xl font-bold">{s.value} Students</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {results.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">Student ID</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Risk Label</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Confidence</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Top Drivers</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.slice(0, 10).map((r, i) => (
                                <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">#STU-{100 + i}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            r.risk_level === 0 ? 'bg-green-100 text-green-700' :
                                            r.risk_level === 1 ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {r.risk_label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{(r.confidence * 100).toFixed(1)}%</td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {r.explanation.join(', ') || 'General factors'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-4 bg-gray-50 text-center text-sm text-gray-500">
                        Showing top 10 results out of {results.length}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchAnalysis;
