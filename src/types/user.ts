import { Team } from './team';

export interface User {
  id: string;
  customerId: string;
  username: string;
  email: string;
  role: 'Admin' | 'Project Manager' | 'Team Member';
  createdAt: string;
  updatedAt: string;
  teams?: Team[];
}