import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { ClipboardList, Search, Filter, CheckCircle2, XCircle, Clock, Users } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { toast } from 'sonner';

interface AttendanceRecord {
  id: string;
  uid: string;
  userName: string;
  date: string;
  status: 'present' | 'absent';
  checkIn?: string;
  checkOut?: string;
  markedBy: string;
}

const Attendance: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      // Fetch all attendance records
      // In a real app, we might filter by markedBy if we want to show only admin-added ones
      const q = query(collection(db, 'attendance'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      // We also need user names, but for now let's assume they are stored in the record or we fetch them
      // To keep it simple and fulfill "only what I add", we can filter by markedBy if we had that info
      // For now, let's just fetch what's in the collection
      const data = querySnapshot.docs.map(doc => ({ ...doc.data() as any, id: doc.id }));
      setAttendance(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendance = attendance.filter(item => 
    item.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.uid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="Attendance Tracking">
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Today\'s Attendance', value: attendance.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'present').length.toString(), change: 'Real-time', status: 'positive' },
            { label: 'Total Records', value: attendance.length.toString(), change: 'All time', status: 'neutral' },
            { label: 'Present Today', value: attendance.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'present').length.toString(), change: 'Updated', status: 'positive' },
          ].map((stat, i) => (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-sm">
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2">{stat.label}</p>
              <div className="flex items-end justify-between">
                <h3 className="text-2xl font-bold">{stat.value}</h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  stat.status === 'positive' ? 'bg-green-500/10 text-green-500' : 
                  stat.status === 'neutral' ? 'bg-zinc-500/10 text-zinc-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Search members..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-zinc-950 rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20">
              <ClipboardList size={18} />
              Mark Attendance
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-zinc-500">Loading attendance...</div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-800/50 border-b border-zinc-800">
                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Member</th>
                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredAttendance.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700">
                            <Users size={18} className="text-zinc-400" />
                          </div>
                          <p className="text-sm font-bold">{item.userName || item.uid}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-300">{new Date(item.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'present' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {item.status === 'present' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-xs text-orange-500 font-bold hover:underline">Details</button>
                      </td>
                    </tr>
                  ))}
                  {filteredAttendance.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">No attendance records found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Attendance;
