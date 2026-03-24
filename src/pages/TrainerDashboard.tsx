import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  Users, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search,
  ChevronRight,
  Activity,
  ClipboardList,
  TrendingUp
} from 'lucide-react';
import { motion } from 'motion/react';
import { collection, query, getDocs, where, addDoc, updateDoc, doc, Timestamp, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, Attendance } from '../types';
import { toast } from 'sonner';
import { format } from 'date-fns';

const TrainerDashboard: React.FC = () => {
  const [assignedMembers, setAssignedMembers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | null>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAssignedMembers();
  }, []);

  const fetchAssignedMembers = async () => {
    try {
      // In a real app, we'd filter by trainerId. For demo, we'll show some members.
      const membersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'member')));
      const members = membersSnap.docs.map(doc => ({ ...doc.data() as User, uid: doc.id }));
      setAssignedMembers(members);

      // Fetch today's attendance
      const today = format(new Date(), 'yyyy-MM-dd');
      const attendanceSnap = await getDocs(query(collection(db, 'attendance'), where('date', '==', today)));
      const attendanceMap: Record<string, 'present' | 'absent' | null> = {};
      attendanceSnap.docs.forEach(doc => {
        const data = doc.data() as Attendance;
        attendanceMap[data.uid] = data.status;
      });
      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (memberId: string, status: 'present' | 'absent') => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const attendanceId = `${memberId}_${today}`;
      
      await setDoc(doc(db, 'attendance', attendanceId), {
        uid: memberId,
        date: today,
        status: status,
        markedBy: 'trainer_uid' // In real app, use current user UID
      });

      setAttendance(prev => ({ ...prev, [memberId]: status }));
      toast.success(`Marked ${status} for member`);
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance');
    }
  };

  const filteredMembers = assignedMembers.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Layout title="Trainer Dashboard"><div>Loading...</div></Layout>;

  return (
    <Layout title="Trainer Dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Assigned Members & Attendance */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                  <Users size={20} />
                </div>
                <h3 className="text-xl font-bold">Assigned Members</h3>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Search members..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-zinc-800 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 w-full sm:w-64"
                />
              </div>
            </div>
            <div className="divide-y divide-zinc-800">
              {filteredMembers.map((member, i) => (
                <motion.div 
                  key={member.uid}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-lg font-bold border border-zinc-700">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold">{member.name}</h4>
                      <p className="text-sm text-zinc-500">{member.planId || 'Pro'} Member • {member.age || 25} yrs</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => markAttendance(member.uid, 'present')}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                        attendance[member.uid] === 'present'
                          ? 'bg-green-500 text-zinc-950'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      <CheckCircle2 size={18} />
                      Present
                    </button>
                    <button 
                      onClick={() => markAttendance(member.uid, 'absent')}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                        attendance[member.uid] === 'absent'
                          ? 'bg-red-500 text-zinc-950'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      <XCircle size={18} />
                      Absent
                    </button>
                  </div>
                </motion.div>
              ))}
              {filteredMembers.length === 0 && (
                <div className="p-12 text-center text-zinc-500">No members assigned to you yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Today's Agenda & Stats */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <Clock size={20} />
              </div>
              <h3 className="text-xl font-bold">Today's Agenda</h3>
            </div>
            <div className="space-y-4">
              {[
                { time: '06:00 AM', task: 'Morning HIIT Session', members: 4 },
                { time: '08:30 AM', task: 'Personal Training - John D.', members: 1 },
                { time: '10:00 AM', task: 'Yoga Basics Class', members: 12 },
                { time: '04:00 PM', task: 'Strength Training Group', members: 8 },
                { time: '06:30 PM', task: 'Personal Training - Sarah K.', members: 1 },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-xl bg-zinc-800/50 border border-zinc-800">
                  <div className="text-xs font-mono text-orange-500 mt-1 whitespace-nowrap">{item.time}</div>
                  <div>
                    <p className="text-sm font-semibold">{item.task}</p>
                    <p className="text-xs text-zinc-500">{item.members} members attending</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-sm">
            <h3 className="text-xl font-bold mb-6">Quick Stats</h3>
            <div className="space-y-4">
              <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-400">Monthly Attendance</span>
                  <span className="text-sm font-bold text-green-500">92%</span>
                </div>
                <div className="w-full bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-400">Member Progress Rate</span>
                  <span className="text-sm font-bold text-blue-500">78%</span>
                </div>
                <div className="w-full bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <button className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 border border-zinc-700">
            <ClipboardList size={18} />
            Generate Weekly Report
          </button>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-xl font-bold">Member Progress</h3>
            </div>
            <div className="space-y-6">
              {[
                { name: 'John Doe', progress: 85, goal: 'Weight Loss' },
                { name: 'Sarah Smith', progress: 62, goal: 'Muscle Gain' },
                { name: 'Mike Johnson', progress: 45, goal: 'Endurance' },
              ].map((m, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{m.name}</span>
                    <span className="text-xs text-zinc-500">{m.goal}</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-full" style={{ width: `${m.progress}%` }}></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Progress</span>
                    <span className="text-[10px] font-bold text-orange-500">{m.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TrainerDashboard;
