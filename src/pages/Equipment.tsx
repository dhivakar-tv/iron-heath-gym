import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Dumbbell, Search, Plus, AlertCircle, CheckCircle2, Settings } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Equipment as EquipmentType } from '../types';
import { toast } from 'sonner';
import { motion } from 'motion/react';

const Equipment: React.FC = () => {
  const [equipment, setEquipment] = useState<EquipmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEquipment, setNewEquipment] = useState({ name: '', category: 'Strength', status: 'available' as const });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'equipment'));
      setEquipment(querySnapshot.docs.map(doc => ({ ...doc.data() as EquipmentType, id: doc.id })));
    } catch (error) {
      toast.error('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'equipment'), {
        ...newEquipment,
        lastMaintenance: new Date().toISOString(),
        health: 100
      });
      toast.success('Equipment added successfully');
      setShowAddModal(false);
      setNewEquipment({ name: '', category: 'Strength', status: 'available' });
      fetchEquipment();
    } catch (error) {
      toast.error('Failed to add equipment');
    }
  };

  const toggleStatus = async (item: EquipmentType) => {
    const newStatus = item.status === 'available' ? 'maintenance' : 'available';
    try {
      await updateDoc(doc(db, 'equipment', item.id), { status: newStatus });
      toast.success(`Equipment marked as ${newStatus}`);
      fetchEquipment();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredEquipment = equipment.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Layout title="Equipment"><div>Loading...</div></Layout>;

  return (
    <Layout title="Equipment & Facilities">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Search equipment..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-zinc-950 rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
          >
            <Plus size={18} />
            Add Equipment
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((item) => (
            <div key={item.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-sm hover:border-zinc-700 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700">
                  <Dumbbell size={24} className="text-orange-500" />
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  item.status === 'available' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {item.status === 'available' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  {item.status}
                </div>
              </div>
              <h3 className="text-lg font-bold mb-1">{item.name}</h3>
              <p className="text-xs text-zinc-500 mb-4">Category: {item.category}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                  <span>Equipment Health</span>
                  <span>{item.health || 100}%</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      (item.health || 100) > 80 ? 'bg-green-500' : (item.health || 100) > 50 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${item.health || 100}%` }}
                  ></div>
                </div>
              </div>
              
              <button 
                onClick={() => toggleStatus(item)}
                className="w-full mt-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold transition-all border border-zinc-700 flex items-center justify-center gap-2"
              >
                <Settings size={14} />
                Toggle Status
              </button>
            </div>
          ))}
          {filteredEquipment.length === 0 && (
            <div className="col-span-full text-center py-12 text-zinc-500">No equipment found</div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-2xl font-bold mb-6">Add New Equipment</h3>
            <form onSubmit={handleAddEquipment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Name</label>
                <input 
                  type="text" 
                  required
                  value={newEquipment.name}
                  onChange={(e) => setNewEquipment({...newEquipment, name: e.target.value})}
                  className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
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
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-zinc-400">Cancel</button>
                <button type="submit" className="bg-orange-500 text-zinc-950 px-6 py-2 rounded-xl text-sm font-bold">Add Equipment</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </Layout>
  );
};

export default Equipment;
