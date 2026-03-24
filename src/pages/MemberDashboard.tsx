import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { 
  Dumbbell, 
  Calendar, 
  CheckCircle2, 
  Star, 
  CreditCard, 
  Tag, 
  Users, 
  Activity,
  ChevronRight,
  Clock,
  MapPin,
  MessageSquare,
  Plus,
  Download
} from 'lucide-react';
import { motion } from 'motion/react';
import { collection, query, getDocs, where, addDoc, updateDoc, doc, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, Equipment, Plan, Feedback, Payment } from '../types';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { generateInvoice } from '../lib/invoiceGenerator';

const MemberDashboard: React.FC = () => {
  const { user } = useAuth();
  const [trainers, setTrainers] = useState<User[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [userPayments, setUserPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [newFeedback, setNewFeedback] = useState({ rating: 5, comment: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const trainersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'trainer')));
      const equipmentSnap = await getDocs(collection(db, 'equipment'));
      const plansSnap = await getDocs(collection(db, 'plans'));
      const feedbacksSnap = await getDocs(collection(db, 'feedback'));
      
      // Fetch user specific payments
      const paymentsSnap = await getDocs(query(
        collection(db, 'payments'), 
        where('memberName', '==', user.name) // In real app, use uid
      ));

      setTrainers(trainersSnap.docs.map(doc => ({ ...doc.data() as User, uid: doc.id })));
      setEquipment(equipmentSnap.docs.map(doc => ({ ...doc.data() as Equipment, id: doc.id })));
      setPlans(plansSnap.docs.map(doc => ({ ...doc.data() as Plan, id: doc.id })));
      setFeedbacks(feedbacksSnap.docs.map(doc => ({ ...doc.data() as Feedback, id: doc.id })));
      
      // Sort payments client-side
      const payments = paymentsSnap.docs.map(doc => ({ ...doc.data() as Payment, id: doc.id }));
      setUserPayments(payments.sort((a, b) => b.date.localeCompare(a.date)));
    } catch (error) {
      console.error('Error fetching data:', error);
      // Don't show error toast if it's just a query index issue during dev
      if (!(error instanceof Error && error.message.includes('index'))) {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectTrainer = async (trainer: User) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { 
        trainerId: trainer.uid,
        trainerName: trainer.name 
      });
      toast.success(`Trainer ${trainer.name} assigned successfully!`);
      fetchData();
    } catch (error) {
      toast.error('Failed to assign trainer');
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmittingFeedback(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        userId: user.uid,
        userName: user.name,
        rating: newFeedback.rating,
        comment: newFeedback.comment,
        createdAt: new Date().toISOString()
      });
      toast.success('Thank you for your feedback!');
      setNewFeedback({ rating: 5, comment: '' });
      setShowFeedbackForm(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const facilities = [
    { name: 'Cardio Zone', icon: Activity, desc: 'High-end treadmills and ellipticals' },
    { name: 'Weight Area', icon: Dumbbell, desc: 'Free weights and resistance machines' },
    { name: 'Yoga Studio', icon: MapPin, desc: 'Quiet space for mindfulness' },
    { name: 'Steam/Sauna', icon: Clock, desc: 'Relaxation after your workout' },
  ];

  const weeklySchedule = [
    { day: 'Mon', workout: 'Chest & Triceps', time: '06:00 AM' },
    { day: 'Tue', workout: 'Back & Biceps', time: '06:00 AM' },
    { day: 'Wed', workout: 'Legs & Core', time: '07:30 AM' },
    { day: 'Thu', workout: 'Shoulders & Abs', time: '06:00 AM' },
    { day: 'Fri', workout: 'Full Body HIIT', time: '08:00 AM' },
    { day: 'Sat', workout: 'Cardio & Yoga', time: '09:00 AM' },
    { day: 'Sun', workout: 'Rest Day', time: '-' },
  ];

  if (loading) return <Layout title="Member Dashboard"><div>Loading...</div></Layout>;

  return (
    <Layout title="Member Dashboard">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-8 mb-8 text-zinc-950 relative overflow-hidden shadow-2xl shadow-orange-500/20">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-zinc-900/80 font-medium max-w-md">"The only bad workout is the one that didn't happen." Ready to crush your goals today?</p>
          <div className="mt-6 flex items-center gap-4">
            <div className="bg-zinc-950/20 backdrop-blur-md px-4 py-2 rounded-xl border border-zinc-950/10 flex items-center gap-2">
              <Activity size={18} />
              <span className="font-bold">85% Progress</span>
            </div>
            <div className="bg-zinc-950/20 backdrop-blur-md px-4 py-2 rounded-xl border border-zinc-950/10 flex items-center gap-2">
              <Calendar size={18} />
              <span className="font-bold">Day 12 Streak</span>
            </div>
          </div>
        </div>
        <Dumbbell className="absolute right-[-20px] bottom-[-20px] w-64 h-64 text-zinc-950/10 rotate-[-15deg]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Facilities */}
          <section>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MapPin className="text-orange-500" size={20} />
              Gym Facilities
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {facilities.map((f, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl hover:border-orange-500/50 transition-all group">
                  <div className="p-3 bg-zinc-800 rounded-xl mb-3 group-hover:bg-orange-500/10 group-hover:text-orange-500 transition-colors">
                    <f.icon size={24} />
                  </div>
                  <h4 className="font-bold text-sm mb-1">{f.name}</h4>
                  <p className="text-xs text-zinc-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Weekly Schedule */}
          <section>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="text-orange-500" size={20} />
              Weekly Schedule
            </h3>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Day</th>
                    <th className="px-6 py-4 font-semibold">Workout Plan</th>
                    <th className="px-6 py-4 font-semibold">Time</th>
                    <th className="px-6 py-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {weeklySchedule.map((item, i) => (
                    <tr key={i} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 font-bold">{item.day}</td>
                      <td className="px-6 py-4 text-zinc-300">{item.workout}</td>
                      <td className="px-6 py-4 text-zinc-500 text-sm">{item.time}</td>
                      <td className="px-6 py-4 text-right">
                        {item.workout !== 'Rest Day' ? (
                          <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded-md">Scheduled</span>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-zinc-800 text-zinc-500 rounded-md">Rest</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Trainers */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Users className="text-orange-500" size={20} />
                Our Expert Trainers
              </h3>
              <button className="text-sm text-orange-500 hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trainers.map((trainer) => (
                <div 
                  key={trainer.uid} 
                  onClick={() => selectTrainer(trainer)}
                  className={`bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between group hover:border-orange-500/30 transition-all cursor-pointer ${user?.trainerId === trainer.uid ? 'border-orange-500/50' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center text-xl font-bold border border-zinc-700 group-hover:border-orange-500/50 transition-colors">
                      {trainer.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold">{trainer.name}</h4>
                      <p className="text-xs text-zinc-500">{trainer.bio || 'Strength & Conditioning'}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} className="fill-orange-500 text-orange-500" />)}
                      </div>
                    </div>
                  </div>
                  {user?.trainerId === trainer.uid ? (
                    <span className="px-4 py-2 rounded-xl text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                      Your Trainer
                    </span>
                  ) : (
                    <button className="text-xs text-zinc-500 group-hover:text-orange-500 font-bold uppercase tracking-widest">Select</button>
                  )}
                </div>
              ))}
              {trainers.length === 0 && <p className="text-zinc-500 text-center py-4">No trainers available</p>}
            </div>
          </section>

          {/* Feedback */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="text-orange-500" size={20} />
                Member Feedback
              </h3>
              <button 
                onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                className="text-sm bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-xl border border-zinc-700 transition-all flex items-center gap-2"
              >
                <Plus size={14} />
                Share Your Experience
              </button>
            </div>

            {showFeedbackForm && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 border border-orange-500/30 p-6 rounded-2xl mb-6 shadow-lg shadow-orange-500/5"
              >
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-zinc-400">Rating:</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNewFeedback({ ...newFeedback, rating: s })}
                          className="focus:outline-none"
                        >
                          <Star 
                            size={20} 
                            className={s <= newFeedback.rating ? "fill-orange-500 text-orange-500" : "text-zinc-700"} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <textarea
                      required
                      placeholder="Tell us about your experience..."
                      value={newFeedback.comment}
                      onChange={(e) => setNewFeedback({ ...newFeedback, comment: e.target.value })}
                      className="w-full bg-zinc-800 border-zinc-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none min-h-[100px]"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowFeedbackForm(false)}
                      className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingFeedback}
                      className="bg-orange-500 hover:bg-orange-600 text-zinc-950 px-6 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                    >
                      {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            <div className="space-y-4">
              {feedbacks.map((f) => (
                <div key={f.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-xs font-bold">
                        {f.userName.charAt(0)}
                      </div>
                      <span className="font-bold text-sm">{f.userName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} className={s <= f.rating ? "fill-orange-500 text-orange-500" : "text-zinc-700"} />)}
                    </div>
                  </div>
                  <p className="text-zinc-400 text-sm italic">"{f.comment}"</p>
                </div>
              ))}
              {feedbacks.length === 0 && <p className="text-zinc-500 text-center py-4">No feedback yet</p>}
            </div>
          </section>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          {/* Today's Agenda */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Clock className="text-orange-500" size={20} />
              Today's Agenda
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">Current Workout</p>
                <p className="font-bold text-lg">Chest & Triceps</p>
                <div className="flex items-center gap-2 mt-3 text-sm text-zinc-400">
                  <Clock size={14} />
                  <span>60 Minutes</span>
                </div>
              </div>
              <div className="space-y-3">
                {['Bench Press (4x10)', 'Incline Dumbbell Press (3x12)', 'Tricep Pushdowns (3x15)', 'Dips (3xAMRAP)'].map((ex, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-zinc-400">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span>{ex}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Membership Plan */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <CreditCard className="text-orange-500" size={20} />
              My Plan
            </h3>
            <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-800 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Current Plan</span>
                <span className="text-xs px-2 py-0.5 bg-orange-500 text-zinc-950 rounded-full font-bold uppercase">
                  {user?.planId || 'Basic'}
                </span>
              </div>
              <p className="text-2xl font-bold">
                ₹{(plans.find(p => p.id === user?.planId)?.price || 2999).toLocaleString('en-IN')}
                <span className="text-sm text-zinc-500 font-normal">/mo</span>
              </p>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Status</span>
                <span className="text-green-500 font-bold">Paid</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Next Billing</span>
                <span className="text-zinc-300">April 12, 2026</span>
              </div>
            </div>
            <button className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-bold transition-all border border-zinc-700">
              Upgrade Plan
            </button>
          </div>

          {/* Recent Payments */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CreditCard className="text-orange-500" size={20} />
                Recent Payments
              </h3>
              <Link to="/payments" className="text-sm text-orange-500 hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
              {userPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl border border-zinc-800">
                  <div>
                    <p className="text-sm font-bold">{p.date}</p>
                    <p className="text-xs text-zinc-500">{p.planName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">₹{p.amount.toLocaleString('en-IN')}</p>
                    <p className={`text-[10px] font-bold uppercase ${
                      p.status === 'Completed' ? 'text-green-500' : 
                      p.status === 'Pending' ? 'text-orange-500' : 'text-red-500'
                    }`}>{p.status}</p>
                  </div>
                </div>
              ))}
              {userPayments.length === 0 && (
                <p className="text-center text-zinc-500 py-4 text-sm">No recent payments</p>
              )}
            </div>
          </div>

          {/* Special Offers */}
          <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 p-6 rounded-2xl shadow-sm relative overflow-hidden">
            <Tag className="absolute right-[-10px] top-[-10px] w-24 h-24 text-orange-500/10 rotate-12" />
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 relative z-10">
              <Tag className="text-orange-500" size={20} />
              Special Offers
            </h3>
            <div className="space-y-4 relative z-10">
              <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800">
                <p className="text-xs font-bold text-orange-500 uppercase mb-1">Summer Sale</p>
                <p className="font-bold">20% OFF Elite Plan</p>
                <p className="text-xs text-zinc-500 mt-1">Valid until June 30</p>
              </div>
              <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800">
                <p className="text-xs font-bold text-blue-500 uppercase mb-1">Referral</p>
                <p className="font-bold">1 Month FREE</p>
                <p className="text-xs text-zinc-500 mt-1">Refer a friend today</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MemberDashboard;
