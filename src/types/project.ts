// types/project.ts
export interface Project {
  id: string;
  customer_id: string;
  title: string;
  description?: string | null; // Allow null to match nullable description
  project_manager_id: string;
  status: 'Active' | 'On Hold' | 'Completed';
  start_date?: string | null; // Allow null to match nullable start_date
  end_date?: string | null; // Allow null to match nullable end_date
  budget?: number | null; // Allow null to match nullable budget
  goals?: Record<string, string> | null; // Allow null to match nullable goals
  milestones?: Record<string, string> | null; // Allow null to match nullable milestones
  tech_stack?: string[] | null; // Allow null to match nullable tech_stack
  repository_url?: string | null; // Allow null to match nullable repository_url
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}