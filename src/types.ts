export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  age: number;
  phone?: string;
  username: string;
  points: number;
  lastSpinAt?: any;
  level: string;
  referralCode: string;
  referredBy?: string;
  role?: string;
  createdAt: string;
}

export interface Order {
  id?: string;
  userId: string;
  productId: string;
  productName: string;
  price: number;
  uid: string;
  transactionId: string;
  paymentMethod: string;
  status: 'processing' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
}

export interface PointTransaction {
  id?: string;
  userId: string;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface TournamentRegistration {
  id?: string;
  userId: string;
  teamName: string;
  player1: string;
  player2: string;
  player3: string;
  player4: string;
  phone: string;
  status: 'pending' | 'approved' | 'denied';
  denyReason?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}
