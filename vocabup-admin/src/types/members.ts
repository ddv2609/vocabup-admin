export interface FullName {
  firstName: string;
  lastName: string;
}

export interface Address {
  country: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
}

export interface User {
  _id: string;
  role: string;
  fullName: FullName;
  email: string;
  googleId?: string | null;
  tel: string;
  dob: string;
  gender: string;
  address: Address;
  avatar: string | null;
  avatarId?: string | null;
  language: string;
  theme: string;
  sendAuthCodeAt: number;
  verifiedAt: string;
  gems: number;
  scores: number;
  streak: Streak;
  hiddenAt: string | null;
  hiddenBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Streak {
  currentStreak: number;
  highestStreak: number;
  lastActivityDate: string;
}

export interface Admin {
  uid: string;
  _id: string;
  role: string;
  fullName: FullName;
  email: string;
  tel: string;
  dob: string;
  gender: string;
  address: Address;
  avatar: string | null;
  avatarId: string | null;
  language: string;
  theme: string;
  verifiedAt: string;
  createdAt: string;
  updatedAt: string;
}
