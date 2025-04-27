export interface Project {
  id: string;
  customerId: string;
  title: string;
  description: string;
  projectManagerId: string;
  status: 'Active' | 'On Hold' | 'Completed';
  startDate: string;
  endDate: string | null;
  budget: number;
  goals: Record<string, string>;
  milestones: Record<string, string>;
  techStack: string[];
  repositoryUrl: string;
  createdAt: string;
  updatedAt: string;
}
