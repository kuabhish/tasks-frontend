export interface Task {
  id: string;
  customerId: string;
  projectId: string;
  categoryId?: string;
  title: string;
  description?: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  tags?: string[];
  estimatedDuration?: number;
  actualDuration?: number;
  createdAt: string;
  updatedAt: string;
  subtasks: Subtask[];
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  description?: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  assignedUserId?: string;
  assignedTeamId?: string;
  dueDate?: string;
  tags?: string[];
  estimatedDuration?: number;
  createdAt: string;
  updatedAt: string;
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
  subtask?: Subtask;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}