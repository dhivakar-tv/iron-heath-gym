import { collection, setDoc, doc, getDocs, query, limit } from 'firebase/firestore';
import { db } from './firebase';

export const seedInitialData = async () => {
  try {
    // Check if data already exists
    const equipmentSnap = await getDocs(query(collection(db, 'equipment'), limit(1)));
    if (!equipmentSnap.empty) return;

    console.log('Seeding initial data...');

    // Seed Equipment
    const equipment = [
      { id: 'eq1', name: 'Treadmill X100', category: 'Cardio', status: 'available', description: 'High-speed treadmill with heart rate monitor', health: 95 },
      { id: 'eq2', name: 'Dumbbell Set (5-50kg)', category: 'Strength', status: 'available', description: 'Complete set of rubber-coated dumbbells', health: 100 },
      { id: 'eq3', name: 'Bench Press Station', category: 'Strength', status: 'maintenance', description: 'Standard Olympic bench press', health: 65 },
      { id: 'eq4', name: 'Leg Press Machine', category: 'Strength', status: 'available', description: 'Heavy-duty leg press for lower body strength', health: 88 },
    ];

    for (const item of equipment) {
      const { id, ...data } = item;
      await setDoc(doc(db, 'equipment', id), data);
    }

    // Seed Plans
    const plans = [
      { id: 'basic', name: 'Basic Plan', price: 2999, benefits: ['Gym Access', 'Locker Room', '1 Group Class/mo'] },
      { id: 'pro', name: 'Pro Plan', price: 4999, benefits: ['24/7 Access', 'All Group Classes', 'Personal Trainer (1 session/mo)'] },
      { id: 'elite', name: 'Elite Plan', price: 9999, benefits: ['Unlimited Access', 'Private Coaching', 'Nutrition Plan', 'Spa & Sauna'] },
    ];

    for (const plan of plans) {
      const { id, ...data } = plan;
      await setDoc(doc(db, 'plans', id), data);
    }

    // Seed Trainers (Mock users)
    const trainers = [
      { uid: 't1', name: 'Mike Johnson', email: 'mike@gym.com', role: 'trainer', joinedAt: new Date().toISOString(), bio: 'Strength & Conditioning Specialist', rating: 4.9 },
      { uid: 't2', name: 'Emma Wilson', email: 'emma@gym.com', role: 'trainer', joinedAt: new Date().toISOString(), bio: 'Yoga & Flexibility Expert', rating: 4.8 },
      { uid: 't3', name: 'Sarah K.', email: 'sarah@gym.com', role: 'trainer', joinedAt: new Date().toISOString(), bio: 'Zumba & Cardio Instructor', rating: 4.7 },
    ];

    for (const t of trainers) {
      const { uid, ...data } = t;
      await setDoc(doc(db, 'users', uid), { ...data, uid });
    }

    // Seed Feedback
    const feedback = [
      { id: 'f1', uid: 'user1', userName: 'John Doe', comment: 'Amazing facilities and very professional trainers!', rating: 5, createdAt: new Date().toISOString() },
      { id: 'f2', uid: 'user2', userName: 'Sarah Smith', comment: 'The equipment is always clean and well-maintained.', rating: 4, createdAt: new Date().toISOString() },
      { id: 'f3', uid: 'user3', userName: 'Mike Johnson', comment: 'Best gym in the city. The community is amazing.', rating: 5, createdAt: new Date().toISOString() },
    ];

    for (const f of feedback) {
      const { id, ...data } = f;
      await setDoc(doc(db, 'feedback', id), data);
    }

    // Seed Payments
    const payments = [
      { id: 'TRX-9281', uid: 'user1', memberName: 'John Doe', amount: 2999, date: '2026-03-22', status: 'Completed', planName: 'Basic Plan' },
      { id: 'TRX-9280', uid: 'user2', memberName: 'Sarah Smith', amount: 2999, date: '2026-03-21', status: 'Completed', planName: 'Basic Plan' },
      { id: 'TRX-9279', uid: 'user3', memberName: 'Mike Johnson', amount: 4999, date: '2026-03-20', status: 'Pending', planName: 'Pro Plan' },
      { id: 'TRX-9278', uid: 'user4', memberName: 'Emma Wilson', amount: 9999, date: '2026-03-19', status: 'Completed', planName: 'Elite Plan' },
    ];

    for (const p of payments) {
      const { id, ...data } = p;
      await setDoc(doc(db, 'payments', id), data);
    }

    console.log('Seed data successfully added');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};
