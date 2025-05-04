// types/task.ts
export interface Task {
  id: string;
  customer_id: string;
  project_id: string | null; // Changed to allow null since project_id is nullable in the model
  category_id?: string | null; // Allow null to match nullable category_id
  title: string;
  description?: string | null; // Allow null to match nullable description
  status: 'Not Started' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  due_date?: string | null; // Allow null to match nullable due_date
  tags?: string[] | null; // Allow null to match nullable tags (default [])
  estimated_duration?: number | null; // Allow null to match nullable estimated_duration
  actual_duration?: number | null; // Allow null to match nullable actual_duration
  start_date?: string | null; // Added to match new start_date field (ISO string or null)
  end_date?: string | null; // Added to match new end_date field (ISO string or null)
  created_at: string;
  updated_at: string;
  subtasks: Subtask[];
  completion_percentage?: number; // Already included, matches backend
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  description?: string | null; // Allow null to match nullable description
  status: 'Not Started' | 'In Progress' | 'Completed';
  assigned_user_id?: string | null; // Allow null to match nullable assigned_user_id
  assigned_team_id?: string | null; // Allow null to match nullable assigned_team_id
  due_date?: string | null; // Allow null to match nullable due_date
  tags?: string[] | null; // Allow null to match nullable tags (default [])
  estimated_duration?: number | null; // Allow null to match nullable estimated_duration
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
  id: string;
  customerId: string;
  userId: string;
  subtaskId: string;
  startTime: string;
  endTime: string;
  duration: number;
  notes?: string;
  createdAt: string;
}