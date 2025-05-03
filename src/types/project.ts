// types/project.ts
export interface Project {
  id: string;
  customer_id: string;
  title: string;
  description?: string;
  project_manager_id: string;
  status: 'Active' | 'On Hold' | 'Completed';
  start_date?: string;
  end_date?: string;
  budget?: number;
  goals?: Record<string, string>;
  milestones?: Record<string, string>;
  tech_stack?: string[];
  repository_url?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}