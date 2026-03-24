import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Users, Search, Filter, Plus, XCircle, CheckCircle2 } from 'lucide-react';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from '../types';
import { toast } from 'sonner';
import { motion } from 'motion/react';

const Members: React.FC = () => {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'member' as const, age: 0, contact: '', planId: 'basic' });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'member'));
      const querySnapshot = await getDocs(q);
      setMembers(querySnapshot.docs.map(doc => ({ ...doc.data() as User, uid: doc.id })));
    } catch (error) {
      toast.error('Failed to load members');
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
        status: 'Active'
      });
      toast.success('Member added successfully');
      setShowAddModal(false);
      setNewMember({ name: '', email: '', role: 'member', age: 0, contact: '', planId: 'basic' });
      fetchMembers();
    } catch (error) {
      toast.error('Failed to add member');
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Layout title="Members"><div>Loading...</div></Layout>;

  return (
    <Layout title="Members Management">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Search members..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all">
              <Filter size={18} />
              Filter
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-zinc-950 rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
            >
              <Plus size={18} />
              Add Member
            </button>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-800/50 border-b border-zinc-800">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredMembers.map((member) => (
                <tr key={member.uid} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700 font-bold">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{member.name}</p>
                        <p className="text-xs text-zinc-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-500">
                      <CheckCircle2 size={12} />
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-300 capitalize">{member.planId || 'Basic'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs text-orange-500 font-bold hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">No members found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-lg shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Add New Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-zinc-100">
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
                    onChange={(e) => setNewMember({...newMember, age: parseInt(e.target.value) || 0})}
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
              <button type="submit" className="w-full bg-orange-500 text-zinc-950 font-bold py-3 rounded-xl transition-all mt-4">
                Create Member Account
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </Layout>
  );
};

export default Members;
