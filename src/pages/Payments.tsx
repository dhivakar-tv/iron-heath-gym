import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { CreditCard, Search, Filter, Plus, Download, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { collection, getDocs, query, orderBy, addDoc, Timestamp, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Payment } from '../types';
import { generateInvoice } from '../lib/invoiceGenerator';
import { toast } from 'sonner';
import { motion } from 'motion/react';

import { useAuth } from '../context/AuthContext';

const Payments: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({ memberName: '', amount: 0, planName: 'Basic Plan', status: 'Completed' as const });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    if (!currentUser) return;
    try {
      let q = query(collection(db, 'payments'));
      
      // If member, only show their own payments
      if (currentUser.role === 'member') {
        q = query(
          collection(db, 'payments'), 
          where('memberName', '==', currentUser.name) // In real app, use uid
        );
      }

      const paymentsSnap = await getDocs(q);
      const paymentsList = paymentsSnap.docs.map(doc => ({ ...doc.data() as Payment, id: doc.id }));
      // Sort client-side to avoid index requirement
      setPayments(paymentsList.sort((a, b) => b.date.localeCompare(a.date)));
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const paymentData = {
        ...newPayment,
        id: `TRX-${Math.floor(Math.random() * 10000)}`,
        uid: `user_${Math.random().toString(36).substring(7)}`,
        date: new Date().toISOString().split('T')[0],
      };
      await addDoc(collection(db, 'payments'), paymentData);
      toast.success('Payment recorded successfully');
      setShowAddPayment(false);
      fetchPayments();
    } catch (error) {
      toast.error('Failed to record payment');
    }
  };

  const filteredPayments = payments.filter(p => 
    p.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = payments
    .filter(p => p.status === 'Completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingRevenue = payments
    .filter(p => p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) return <Layout title="Payments & Billing"><div>Loading...</div></Layout>;

  return (
    <Layout title={currentUser?.role === 'admin' ? "Payments & Billing" : "My Payment History"}>
      <div className="space-y-8">
        {currentUser?.role === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, change: '+15.2%', status: 'positive' },
              { label: 'Pending Payments', value: `₹${pendingRevenue.toLocaleString('en-IN')}`, change: '-5.2%', status: 'negative' },
              { label: 'Active Subscriptions', value: payments.length.toString(), change: '+8', status: 'positive' },
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
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Search transactions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all">
              <Filter size={18} />
              Filter
            </button>
            {currentUser?.role === 'admin' && (
              <button 
                onClick={() => setShowAddPayment(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-zinc-950 rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
              >
                <Plus size={18} />
                New Payment
              </button>
            )}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-800/50 border-b border-zinc-800">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Transaction ID</th>
                {currentUser?.role === 'admin' && <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Member</th>}
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredPayments.map((trx) => (
                <tr key={trx.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-zinc-400">{trx.id}</td>
                  {currentUser?.role === 'admin' && <td className="px-6 py-4 text-sm font-bold">{trx.memberName}</td>}
                  <td className="px-6 py-4 text-sm text-zinc-500">{trx.date}</td>
                  <td className="px-6 py-4 text-sm font-bold">₹{trx.amount.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      trx.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 
                      trx.status === 'Pending' ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {trx.status === 'Completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {trx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => generateInvoice(trx)}
                      className="p-2 hover:bg-zinc-800 rounded-lg transition-all text-zinc-400 hover:text-orange-500"
                    >
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">No transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payment Modal */}
      {showAddPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-lg shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Record New Payment</h3>
              <button onClick={() => setShowAddPayment(false)} className="text-zinc-400 hover:text-zinc-100">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Member Name</label>
                <input 
                  type="text" 
                  required
                  value={newPayment.memberName}
                  onChange={(e) => setNewPayment({...newPayment, memberName: e.target.value})}
                  className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Amount (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={newPayment.amount || ''}
                    onChange={(e) => setNewPayment({...newPayment, amount: parseInt(e.target.value) || 0})}
                    className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Plan</label>
                  <select 
                    value={newPayment.planName}
                    onChange={(e) => setNewPayment({...newPayment, planName: e.target.value})}
                    className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    <option value="Basic Plan">Basic Plan</option>
                    <option value="Pro Plan">Pro Plan</option>
                    <option value="Elite Plan">Elite Plan</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Status</label>
                <select 
                  value={newPayment.status}
                  onChange={(e) => setNewPayment({...newPayment, status: e.target.value as any})}
                  className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
              <button 
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-zinc-950 font-bold py-3 rounded-xl transition-all mt-4"
              >
                Record Payment
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </Layout>
  );
};

export default Payments;
