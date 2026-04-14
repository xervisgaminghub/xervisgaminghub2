export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  age: number;
  phone?: string;
  username: string;
  points: number;
  level: string;
  referralCode: string;
  referredBy?: string;
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
  status: 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface PointTransaction {
  id?: string;
  userId: string;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}
