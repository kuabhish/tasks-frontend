export interface Task {
  id: string;
  title: string;
  description?: string;
  category: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  completed: boolean;
  isRecurring: boolean;
  recurringPattern?: {
    type: 'daily' | 'weekly' | 'monthly';
    days?: number[]; // 0-6 for weekly (Sunday-Saturday)
    interval?: number; // every X days/weeks/months
  };
  tags: string[];
  color?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface TimeBlock {
  id: string;
  taskId: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
}

export type ViewMode = 'day' | 'week' | 'month';

export interface FilterOptions {
  categories: string[];
  tags: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
}