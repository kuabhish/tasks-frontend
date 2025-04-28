import { create } from 'zustand';
import { Task } from '../types/task';

interface TaskStore {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  addSubtask: (taskId: string, subtask: Task['subtasks'][0]) => void;
  updateTask: (taskId: string, updatedTask: Task) => void;
  updateSubtask: (taskId: string, subtaskId: string, updatedSubtask: Task['subtasks'][0]) => void;
  deleteTask: (taskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
}

const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
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
        task.id === taskId ? updatedTask : task
      ),
    })),
  updateSubtask: (taskId, subtaskId, updatedSubtask) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
            ...task,
            subtasks: task.subtasks.map((subtask) =>
              subtask.id === subtaskId ? updatedSubtask : subtask
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