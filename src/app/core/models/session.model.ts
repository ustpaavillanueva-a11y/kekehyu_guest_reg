import { User } from './user.model';

export interface UserSession {
  id: string;
  userId: string;
  user: User;
  loginAt: Date;
  logoutAt?: Date;
  ipAddress?: string;
  durationMinutes?: number;
  isActive: boolean;
}

export interface FrontDeskActivity {
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  totalMinutes: number;
  totalHours: number;
  sessions: UserSession[];
}
