import React, { useEffect, useState } from 'react';
import { Card } from './Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, colorClass }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof value !== 'number') return setCount(value);
    let start = 0;
    const duration = 1000;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <Card className="hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-default group">
      <div className="p-8">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-cyan-500/80 uppercase tracking-widest leading-none">{title}</p>
            <h4 className="text-4xl font-black text-white tracking-tighter">{count}</h4>
          </div>
          <div className={`p-4 rounded-[20px] transition-transform duration-500 group-hover:rotate-12 ${colorClass}`}>
            <Icon className="w-7 h-7" />
          </div>
        </div>
        
        {trend && (
          <div className="mt-6 flex items-center text-[11px] font-bold">
            <div className={`flex items-center px-2 py-1 rounded-lg ${
              trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 
              trend === 'down' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'
            }`}>
                {trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" strokeWidth={3} />}
                {trend === 'down' && <TrendingDown className="w-3 h-3 mr-1" strokeWidth={3} />}
                {trend === 'neutral' && <Minus className="w-3 h-3 mr-1" strokeWidth={3} />}
                <span>{trendValue}</span>
            </div>
            <span className="text-slate-400 ml-2 font-medium">vs last month</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
