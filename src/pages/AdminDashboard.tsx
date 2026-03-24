import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { 
  Users, 
  Dumbbell, 
  Activity, 
  Plus, 
  Search, 
  Filter,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Calendar as CalendarIcon,
  Settings,
  CreditCard
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { collection, query, getDocs, addDoc, updateDoc, doc, where, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, Equipment, Attendance, Payment } from '../types';
import { toast } from 'sonner';

import { seedInitialData } from '../lib/seedData';

const AdminDashboard: React.FC = () => {
  const [members, setMembers] = useState<User[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'member' as const, age: 0, contact: '', planId: 'basic' });
  const [newEquipment, setNewEquipment] = useState({ name: '', category: 'Strength', status: 'available' as const });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const membersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'member')));
      const equipmentSnap = await getDocs(collection(db, 'equipment'));
      const attendanceSnap = await getDocs(collection(db, 'attendance'));
      const paymentsSnap = await getDocs(query(collection(db, 'payments'), limit(10)));

      setMembers(membersSnap.docs.map(doc => ({ ...doc.data() as User, uid: doc.id })));
      setEquipment(equipmentSnap.docs.map(doc => ({ ...doc.data() as Equipment, id: doc.id })));
      setAttendance(attendanceSnap.docs.map(doc => ({ ...doc.data() as Attendance, id: doc.id })));
      
      // Sort payments client-side
      const paymentsList = paymentsSnap.docs.map(doc => ({ ...doc.data() as Payment, id: doc.id }));
      setPayments(paymentsList.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'users'), {
        ...newMember,
        joinedAt: new Date().toISOString(),
        uid: Math.random().toString(36).substring(7) // Mock UID for manual add
      });
      toast.success('Member added successfully');
      setShowAddMember(false);
      setNewMember({ name: '', email: '', role: 'member', age: 0, contact: '', planId: 'basic' });
      fetchData();
    } catch (error) {
      toast.error('Failed to add member');
    }
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'equipment'), {
        ...newEquipment,
        lastMaintenance: new Date().toISOString()
      });
      toast.success('Equipment added successfully');
      setShowAddEquipment(false);
      setNewEquipment({ name: '', category: 'Strength', status: 'available' });
      fetchData();
    } catch (error) {
      toast.error('Failed to add equipment');
    }
  };

  const toggleEquipmentStatus = async (item: Equipment) => {
    const newStatus = item.status === 'available' ? 'maintenance' : 'available';
    try {
      await updateDoc(doc(db, 'equipment', item.id), { status: newStatus });
      toast.success(`Equipment marked as ${newStatus}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update equipment status');
    }
  };

  const attendanceData = [
    { name: 'Mon', present: 45, absent: 5 },
    { name: 'Tue', present: 52, absent: 3 },
    { name: 'Wed', present: 38, absent: 12 },
    { name: 'Thu', present: 65, absent: 2 },
    { name: 'Fri', present: 48, absent: 7 },
    { name: 'Sat', present: 70, absent: 1 },
    { name: 'Sun', present: 30, absent: 15 },
  ];

  const COLORS = ['#f97316', '#3f3f46'];

  const totalRevenue = payments
    .filter(p => p.status === 'Completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    { label: 'Total Members', value: members.length, icon: Users, color: 'bg-blue-500/10 text-blue-500' },
    { label: 'Equipment Status', value: `${equipment.filter(e => e.status === 'available').length}/${equipment.length}`, icon: Dumbbell, color: 'bg-orange-500/10 text-orange-500' },
    { label: 'Daily Attendance', value: '85%', icon: Activity, color: 'bg-green-500/10 text-green-500' },
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'bg-purple-500/10 text-purple-500' },
  ];

  if (loading) return <Layout title="Admin Dashboard"><div>Loading...</div></Layout>;

  return (
    <Layout title="Admin Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
            <p className="text-zinc-400 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Attendance Overview</h3>
            <select className="bg-zinc-800 border-none rounded-lg text-sm px-3 py-1 text-zinc-300 focus:ring-2 focus:ring-orange-500">
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#f97316' }}
                />
                <Bar dataKey="present" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill="#3f3f46" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-sm">
          <h3 className="text-xl font-bold mb-6">Equipment Status</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {equipment.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 border border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-700 rounded-lg flex items-center justify-center">
                    <Dumbbell size={20} className="text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className={`text-xs ${item.status === 'available' ? 'text-green-500' : 'text-red-500'}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleEquipmentStatus(item)}
                  className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400"
                >
                  <Settings size={18} />
                </button>
              </div>
            ))}
            {equipment.length === 0 && <p className="text-zinc-500 text-center py-4">No equipment found</p>}
          </div>
          <button 
            onClick={() => setShowAddEquipment(true)}
            className="w-full mt-6 py-3 border border-zinc-800 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Add New Equipment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Recent Payments</h3>
            <Link to="/payments" className="text-sm text-orange-500 hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                    <CreditCard size={18} className="text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{payment.memberName}</p>
                    <p className="text-xs text-zinc-500">{payment.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">₹{payment.amount.toLocaleString('en-IN')}</p>
                  <p className={`text-xs ${
                    payment.status === 'Completed' ? 'text-green-500' : 
                    payment.status === 'Pending' ? 'text-orange-500' : 'text-red-500'
                  }`}>
                    {payment.status}
                  </p>
                </div>
              </div>
            ))}
            {payments.length === 0 && (
              <p className="text-center text-zinc-500 py-4 text-sm">No recent payments</p>
            )}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-sm">
          <h3 className="text-xl font-bold mb-6">Upcoming Schedule</h3>
          <div className="space-y-4">
            {[
              { time: '09:00 AM', event: 'Yoga Class', trainer: 'Emma W.' },
              { time: '11:30 AM', event: 'HIIT Training', trainer: 'Mike J.' },
              { time: '02:00 PM', event: 'Zumba Session', trainer: 'Sarah K.' },
              { time: '05:30 PM', event: 'Powerlifting', trainer: 'John D.' },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-800 flex items-center gap-3">
                <div className="text-xs font-mono text-orange-500">{item.time}</div>
                <div>
                  <p className="text-sm font-medium">{item.event}</p>
                  <p className="text-xs text-zinc-500">with {item.trainer}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-bold transition-all border border-zinc-700">
            Manage Schedule
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xl font-bold">Recent Members</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text" 
                placeholder="Search members..." 
                className="bg-zinc-800 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 w-full sm:w-64"
              />
            </div>
            <button 
              onClick={() => setShowAddMember(true)}
              className="bg-orange-500 hover:bg-orange-600 text-zinc-950 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              Add Member
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Plan</th>
                <th className="px-6 py-4 font-semibold">Joined</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {members.map((member) => (
                <tr key={member.uid} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {member.name.charAt(0)}
                      </div>
                      <span className="font-medium">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{member.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-zinc-800 rounded-md text-zinc-300 capitalize">{member.planId || 'Basic'}</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">
                    {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-green-500 text-sm">
                      <CheckCircle2 size={14} />
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-zinc-500 hover:text-zinc-100 transition-colors">
                      <Settings size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">No members found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-lg shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Add New Member</h3>
              <button onClick={() => setShowAddMember(false)} className="text-zinc-400 hover:text-zinc-100">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Age</label>
                  <input 
                    type="number" 
                    required
                  value={newMember.age || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setNewMember({...newMember, age: isNaN(val) ? 0 : val});
                  }}
                    className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Plan</label>
                  <select 
                    value={newMember.planId}
                    onChange={(e) => setNewMember({...newMember, planId: e.target.value})}
                    className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    <option value="basic">Basic Plan</option>
                    <option value="pro">Pro Plan</option>
                    <option value="elite">Elite Plan</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Contact Number</label>
                <input 
                  type="text" 
                  required
                  value={newMember.contact}
                  onChange={(e) => setNewMember({...newMember, contact: e.target.value})}
                  className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-zinc-950 font-bold py-3 rounded-xl transition-all mt-4"
              >
                Create Member Account
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Equipment Modal */}
      {showAddEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Add Equipment</h3>
              <button onClick={() => setShowAddEquipment(false)} className="text-zinc-400 hover:text-zinc-100">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleAddEquipment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Equipment Name</label>
                <input 
                  type="text" 
                  required
                  value={newEquipment.name}
                  onChange={(e) => setNewEquipment({...newEquipment, name: e.target.value})}
                  className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="e.g. Treadmill X1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Category</label>
                <select 
                  value={newEquipment.category}
                  onChange={(e) => setNewEquipment({...newEquipment, category: e.target.value})}
                  className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="Strength">Strength</option>
                  <option value="Cardio">Cardio</option>
                  <option value="Flexibility">Flexibility</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Initial Status</label>
                <select 
                  value={newEquipment.status}
                  onChange={(e) => setNewEquipment({...newEquipment, status: e.target.value as any})}
                  className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="available">Available</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="out-of-order">Out of Order</option>
                </select>
              </div>
              <button 
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-zinc-950 font-bold py-3 rounded-xl transition-all mt-4"
              >
                Add to Inventory
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;
