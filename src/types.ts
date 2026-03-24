export type UserRole = 'admin' | 'trainer' | 'member';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  age?: number;
  planId?: string;
  trainerId?: string;
  contact?: string;
  joinedAt?: string;
}

export interface Attendance {
  id?: string;
  uid: string;
  date: string;
  status: 'present' | 'absent';
  markedBy?: string;
}

export interface Equipment {
  id: string;
  name: string;
  status: 'available' | 'maintenance';
  image?: string;
  description?: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  benefits: string[];
}

export interface Feedback {
  id: string;
  uid: string;
  userName: string;
  comment: string;
  rating: number;
  createdAt?: string;
}

export interface Payment {
  id: string;
  uid: string;
  memberName: string;
  amount: number;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
  planName: string;
}
