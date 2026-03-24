import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { MessageSquare, Star, Search, Filter, MessageCircle, User as UserIcon } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Feedback as FeedbackType } from '../types';
import { toast } from 'sonner';

const Feedback: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const q = query(collection(db, 'feedback'));
      const snap = await getDocs(q);
      const feedbacksList = snap.docs.map(doc => ({ ...doc.data() as FeedbackType, id: doc.id }));
      // Sort client-side to avoid index requirement
      setFeedbacks(feedbacksList.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedback = feedbacks.filter(f => 
    f.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.comment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const averageRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : '0.0';

  if (loading) return <Layout title="Member Feedback"><div>Loading...</div></Layout>;

  return (
    <Layout title="Member Feedback">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-sm">
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2">Average Rating</p>
            <div className="flex items-center gap-3">
              <h3 className="text-3xl font-bold">{averageRating}</h3>
              <div className="flex items-center gap-0.5 text-orange-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star 
                    key={s} 
                    size={16} 
                    fill={s <= Math.round(parseFloat(averageRating)) ? "currentColor" : "none"} 
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-sm">
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2">Total Reviews</p>
            <h3 className="text-3xl font-bold">{feedbacks.length}</h3>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-sm">
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2">Response Rate</p>
            <h3 className="text-3xl font-bold">98.5%</h3>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Search feedback..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all">
            <Filter size={18} />
            Filter
          </button>
        </div>

        <div className="space-y-4">
          {filteredFeedback.map((item) => (
            <div key={item.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-sm hover:border-zinc-700 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700">
                    <UserIcon size={18} className="text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{item.userName}</p>
                    <p className="text-xs text-zinc-500">{item.date ? new Date(item.date).toLocaleDateString() : 'Recent'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 text-orange-500">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={12} fill={s <= item.rating ? "currentColor" : "none"} />)}
                </div>
              </div>
              <p className="text-sm text-zinc-300 mb-6 leading-relaxed">"{item.comment}"</p>
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Verified Member
                </span>
                <button className="flex items-center gap-2 text-xs text-zinc-400 hover:text-orange-500 font-bold transition-all">
                  <MessageCircle size={14} />
                  Reply
                </button>
              </div>
            </div>
          ))}
          {filteredFeedback.length === 0 && (
            <p className="text-center text-zinc-500 py-12">No feedback found</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Feedback;
