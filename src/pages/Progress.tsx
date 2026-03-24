import React from 'react';
import Layout from '../components/Layout';
import { Activity, TrendingUp, Target, Calendar, Plus, ChevronRight } from 'lucide-react';

const Progress: React.FC = () => {
  return (
    <Layout title="Your Progress Tracking">
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Current Weight', value: '78.5 kg', change: '-1.2 kg', status: 'positive' },
            { label: 'Body Fat', value: '18.2%', change: '-0.5%', status: 'positive' },
            { label: 'Muscle Mass', value: '38.4 kg', change: '+0.4 kg', status: 'positive' },
            { label: 'Workouts', value: '12', change: '+2', status: 'positive' },
          ].map((stat, i) => (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-sm">
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2">{stat.label}</p>
              <div className="flex items-end justify-between">
                <h3 className="text-2xl font-bold">{stat.value}</h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  stat.status === 'positive' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                  <TrendingUp size={20} />
                </div>
                <h3 className="text-xl font-bold">Weight History</h3>
              </div>
              <div className="flex items-center gap-2 bg-zinc-800 rounded-lg p-1">
                {['1W', '1M', '3M', '6M', '1Y'].map((t) => (
                  <button key={t} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                    t === '3M' ? 'bg-orange-500 text-zinc-950' : 'text-zinc-500 hover:text-zinc-100'
                  }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-64 flex items-end justify-between gap-2 px-4">
              {[65, 72, 68, 85, 78, 92, 88, 75, 82, 79, 84, 80].map((h, i) => (
                <div key={i} className="flex-1 bg-zinc-800 rounded-t-lg relative group">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-orange-500/50 rounded-t-lg transition-all group-hover:bg-orange-500" 
                    style={{ height: `${h}%` }}
                  ></div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {75 + (h/10)}kg
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 px-4 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                  <Target size={20} />
                </div>
                <h3 className="text-xl font-bold">Fitness Goals</h3>
              </div>
              <button className="p-1.5 hover:bg-zinc-800 rounded-lg transition-all text-zinc-400 hover:text-zinc-100">
                <Plus size={18} />
              </button>
            </div>
            
            <div className="space-y-6">
              {[
                { title: 'Bench Press 100kg', current: 85, target: 100, color: 'bg-orange-500' },
                { title: 'Run 5km in 25min', current: 28, target: 25, color: 'bg-blue-500', inverse: true },
                { title: 'Body Fat 15%', current: 18.2, target: 15, color: 'bg-green-500', inverse: true },
              ].map((goal, i) => {
                let progress = goal.inverse 
                  ? Math.min(100, (goal.target / goal.current) * 100)
                  : Math.min(100, (goal.current / goal.target) * 100);
                if (isNaN(progress)) progress = 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-bold">{goal.title}</span>
                      <span className="text-xs text-zinc-500">{goal.current} / {goal.target}</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div className={`${goal.color} h-full transition-all`} style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button className="w-full mt-8 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-bold transition-all border border-zinc-700 flex items-center justify-center gap-2">
              View All Goals
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Progress;
