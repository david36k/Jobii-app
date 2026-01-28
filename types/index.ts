export type UserRole = 'organizer' | 'participant';

export type InviteStatus = 'pending' | 'accepted' | 'rejected';

export type TenderStatus = 'open' | 'full' | 'closed';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  credits: number;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  groups: string[];
  linkedUserId?: string;
  tag?: string;
  notes?: string;
}

export interface Group {
  id: string;
  name: string;
  contactIds: string[];
}

export interface Invite {
  userId?: string;
  userName: string;
  userPhone: string;
  status: InviteStatus;
  updatedAt: Date;
  isGuest?: boolean;
}

export interface Tender {
  id: string;
  organizerId: string;
  organizerName: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  pay: number;
  quota: number;
  status: TenderStatus;
  invites: Invite[];
  createdAt: Date;
  description?: string;
  location?: string;
}
