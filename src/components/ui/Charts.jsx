import React from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';

export const TrendLineChart = ({ data, lines = [], xAxisKey }) => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(6, 182, 212, 0.1)" />
        <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} tick={{fill: 'rgba(6, 182, 212, 0.4)', fontSize: 10, fontWeight: 'bold'}} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(6, 182, 212, 0.4)', fontSize: 10, fontWeight: 'bold'}} />
        <Tooltip 
          contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.2)', boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)' }}
          itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
          labelStyle={{ color: '#06b6d4', fontWeight: '900', fontSize: '11px', marginBottom: '4px' }}
        />
        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingBottom: '20px', color: '#fff' }} />
        {lines.map((line, i) => (
           <Line key={i} type="monotone" dataKey={line.key} stroke={line.color || "#06b6d4"} strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#020617'}} activeDot={{r: 6, strokeWidth: 0, fill: line.color}} name={line.label || line.key} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export const TrendAreaChart = ({ data, dataKey, xAxisKey, color = "#06b6d4" }) => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(6, 182, 212, 0.1)" />
        <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} tick={{fill: 'rgba(6, 182, 212, 0.4)', fontSize: 10}} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(6, 182, 212, 0.4)', fontSize: 10}} />
        <Tooltip 
           contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.2)' }}
        />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} fillOpacity={1} fill={`url(#color-${dataKey})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const DistributionBarChart = ({ data, dataKey, xAxisKey, fill = "#06b6d4" }) => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(6, 182, 212, 0.1)" />
        <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} tick={{fill: 'rgba(6, 182, 212, 0.4)', fontSize: 10}} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(6, 182, 212, 0.4)', fontSize: 10}} />
        <Tooltip 
          cursor={{fill: 'rgba(6, 182, 212, 0.05)'}}
          contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.2)' }}
        />
        <Bar dataKey={dataKey} fill={fill} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const RiskPieChart = ({ data }) => {
  const COLORS = {
    'High': '#f43f5e',   // rose-500
    'Medium': '#f59e0b', // amber-500
    'Low': '#10b981'     // emerald-500
  };

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          stroke="rgba(2, 6, 23, 0.8)"
          strokeWidth={2}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#9ca3af'} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.2)' }}
        />
        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#fff' }} />
      </PieChart>
    </ResponsiveContainer>
  );
};
