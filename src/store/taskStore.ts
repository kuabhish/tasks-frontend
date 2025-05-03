import { create } from 'zustand';
import { Task, Subtask } from '../types/task';

interface TaskState {
  tasks: Task[];
  projectStats: { total_tasks: number; total_subtasks: number; completed_subtasks: number; completion_rate: number } | null;
  setTasks: (tasks: Task[]) => void;
  setProjectStats: (stats: { total_tasks: number; total_subtasks: number; completed_subtasks: number; completion_rate: number }) => void;
  addTask: (task: Task) => void;
  addSubtask: (taskId: string, subtask: Subtask) => void;
  updateTask: (taskId: string, task: Partial<Task>) => void;
  updateSubtask: (taskId: string, subtaskId: string, subtask: Partial<Subtask>) => void;
  deleteTask: (taskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
}

const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  projectStats: null,
  setTasks: (tasks) => set({ tasks }),
  setProjectStats: (projectStats) => set({ projectStats }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  addSubtask: (taskId, subtask) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, subtasks: [...task.subtasks, subtask] }
          : task
      ),
    })),
  updateTask: (taskId, updatedTask) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updatedTask } : task
      ),
    })),
  updateSubtask: (taskId, subtaskId, updatedSubtask) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
            ...task,
            subtasks: task.subtasks.map((subtask) =>
              subtask.id === subtaskId ? { ...subtask, ...updatedSubtask } : subtask
            ),
          }
          : task
      ),
    })),
  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    })),
  deleteSubtask: (taskId, subtaskId) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
            ...task,
            subtasks: task.subtasks.filter((subtask) => subtask.id !== subtaskId),
          }
          : task
      ),
    })),
}));

export default useTaskStore;