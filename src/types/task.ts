// types/task.ts
export interface Task {
  id: string;
  customer_id: string;
  project_id: string;
  category_id?: string;
  title: string;
  description?: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  due_date?: string;
  tags?: string[];
  estimated_duration?: number;
  actual_duration?: number;
  created_at: string;
  updated_at: string;
  subtasks: Subtask[];
  completion_percentage?: number;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  description?: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  assigned_user_id?: string;
  assigned_team_id?: string;
  due_date?: string;
  tags?: string[];
  estimated_duration?: number;
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