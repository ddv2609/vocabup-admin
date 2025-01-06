export interface AppNotification {
  _id: string;
  sender: Sender;
  title: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sender {
  _id: string;
  avatar: string | null;
  fullName: { firstName: string; lastName: string };
}
