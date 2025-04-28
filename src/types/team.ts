export interface Team {
  id: string;
  customerId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  members: Array<{
    userId: string;
    teamId: string;
    joinedAt: string;
    user: { id: string; username: string; email: string; role: string };
  }>;
}

export interface TeamMember {
  userId: string;
  teamId: string;
  joinedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}