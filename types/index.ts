export type UserRole = 'organizer' | 'participant';

export type InviteStatus = 'pending' | 'accepted' | 'rejected';

export type TenderStatus = 'open' | 'full' | 'closed';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  groups: string[];
  linkedUserId?: string;
}

export interface Group {
  id: string;
  name: string;
  contactIds: string[];
}

export interface Invite {
  userId: string;
  userName: string;
  userPhone: string;
  status: InviteStatus;
  updatedAt: Date;
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
}
