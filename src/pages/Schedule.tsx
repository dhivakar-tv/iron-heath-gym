import React from 'react';
import Layout from '../components/Layout';
import { Calendar, Clock, User, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const Schedule: React.FC = () => {
  return (
    <Layout title="Gym Schedule">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold">March 2026</h3>
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
              <button className="p-1.5 hover:bg-zinc-800 rounded-lg transition-all text-zinc-400 hover:text-zinc-100">
                <ChevronLeft size={18} />
              </button>
              <button className="p-1.5 hover:bg-zinc-800 rounded-lg transition-all text-zinc-400 hover:text-zinc-100">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-zinc-950 rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20">
            <Plus size={18} />
            Add Class
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-zinc-800/50 p-3 text-center border-b border-zinc-800">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{day}</span>
              </div>
              <div className="p-3 space-y-3 min-h-[400px]">
                {[
                  { time: '08:00', class: 'Yoga', trainer: 'Emma W.', color: 'border-blue-500/50 bg-blue-500/5' },
                  { time: '10:30', class: 'HIIT', trainer: 'Mike J.', color: 'border-orange-500/50 bg-orange-500/5' },
                  { time: '17:00', class: 'Zumba', trainer: 'Sarah K.', color: 'border-purple-500/50 bg-purple-500/5' },
                ].filter(() => Math.random() > 0.4).map((item, j) => (
                  <div key={j} className={`p-3 rounded-xl border ${item.color} transition-all hover:scale-[1.02] cursor-pointer`}>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 mb-1">
                      <Clock size={10} />
                      {item.time}
                    </div>
                    <h4 className="text-sm font-bold mb-1">{item.class}</h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                      <User size={10} />
                      {item.trainer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Schedule;
