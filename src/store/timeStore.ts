import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Category, TimeBlock, ViewMode, FilterOptions } from '../types';
import { addDays, format, startOfDay, endOfDay, isWithinInterval, isValid } from 'date-fns';

interface TimeState {
  tasks: Task[];
  categories: Category[];
  timeBlocks: TimeBlock[];
  currentView: ViewMode;
  selectedDate: Date;
  isTracking: boolean;
  activeTaskId: string | null;
  trackingStartTime: Date | null;
  filterOptions: FilterOptions;

  // Actions
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  startTracking: (taskId: string) => void;
  stopTracking: (notes?: string) => void;
  addTimeBlock: (timeBlock: Omit<TimeBlock, 'id'>) => void;
  updateTimeBlock: (id: string, updates: Partial<TimeBlock>) => void;
  deleteTimeBlock: (id: string) => void;
  setCurrentView: (view: ViewMode) => void;
  setSelectedDate: (date: Date) => void;
  setFilterOptions: (options: Partial<FilterOptions>) => void;
  getFilteredTasks: () => Task[];
  getTasksForDay: (date: Date) => Task[];
  getTasksForWeek: (startDate: Date) => Task[];
  generateId: () => string;
}

const useTimeStore = create<TimeState>()(
  persist(
    (set, get) => ({
      tasks: [],
      categories: [
        { id: '1', name: 'Work', color: '#4F46E5' },
        { id: '2', name: 'Personal', color: '#14B8A6' },
        { id: '3', name: 'Learning', color: '#F59E0B' },
        { id: '4', name: 'Meetings', color: '#EC4899' },
      ],
      timeBlocks: [],
      currentView: 'day',
      selectedDate: new Date(),
      isTracking: false,
      activeTaskId: null,
      trackingStartTime: null,
      filterOptions: {
        categories: [],
        tags: [],
      },

      addTask: (task) => {
        const id = get().generateId();
        set((state) => ({
          tasks: [...state.tasks, { ...task, id }],
        }));
        return id;
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          timeBlocks: state.timeBlocks.filter((block) => block.taskId !== id),
        }));
      },

      addCategory: (category) => {
        const id = get().generateId();
        set((state) => ({
          categories: [...state.categories, { ...category, id }],
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((category) => category.id !== id),
        }));
      },

      startTracking: (taskId) => {
        set({
          isTracking: true,
          activeTaskId: taskId,
          trackingStartTime: new Date(),
        });
      },

      stopTracking: (notes) => {
        const { isTracking, activeTaskId, trackingStartTime } = get();

        if (isTracking && activeTaskId && trackingStartTime) {
          const endTime = new Date();
          const timeBlock = {
            taskId: activeTaskId,
            startTime: trackingStartTime,
            endTime,
            notes: notes || '',
          };

          get().addTimeBlock(timeBlock);
        }

        set({
          isTracking: false,
          activeTaskId: null,
          trackingStartTime: null,
        });
      },

      addTimeBlock: (timeBlock) => {
        const id = get().generateId();
        set((state) => ({
          timeBlocks: [...state.timeBlocks, { ...timeBlock, id }],
        }));
      },

      updateTimeBlock: (id, updates) => {
        set((state) => ({
          timeBlocks: state.timeBlocks.map((block) =>
            block.id === id ? { ...block, ...updates } : block
          ),
        }));
      },

      deleteTimeBlock: (id) => {
        set((state) => ({
          timeBlocks: state.timeBlocks.filter((block) => block.id !== id),
        }));
      },

      setCurrentView: (view) => {
        set({ currentView: view });
      },

      setSelectedDate: (date) => {
        set({ selectedDate: isValid(date) ? date : new Date() });
      },

      setFilterOptions: (options) => {
        set((state) => ({
          filterOptions: {
            ...state.filterOptions,
            ...options,
          },
        }));
      },

      getFilteredTasks: () => {
        const { tasks, filterOptions } = get();
        return tasks.filter((task) => {
          // Filter by categories
          if (
            filterOptions.categories.length > 0 &&
            !filterOptions.categories.includes(task.category)
          ) {
            return false;
          }

          // Filter by tags
          if (
            filterOptions.tags.length > 0 &&
            !task.tags.some((tag) => filterOptions.tags.includes(tag))
          ) {
            return false;
          }

          // Filter by date range
          if (filterOptions.dateRange) {
            const { start, end } = filterOptions.dateRange;
            if (!task.startTime || !isValid(task.startTime) || !isWithinInterval(task.startTime, { start, end })) {
              return false;
            }
          }

          // Filter by search query
          if (filterOptions.searchQuery) {
            const query = filterOptions.searchQuery.toLowerCase();
            return (
              task.title.toLowerCase().includes(query) ||
              (task.description?.toLowerCase().includes(query) || false)
            );
          }

          return true;
        });
      },

      getTasksForDay: (date) => {
        if (!isValid(date)) {
          return [];
        }

        const start = startOfDay(date);
        const end = endOfDay(date);

        return get().tasks.filter((task) => {
          const hasValidStartTime = task.startTime && isValid(task.startTime);
          const hasValidEndTime = task.endTime && isValid(task.endTime);

          if (!hasValidStartTime) return false;

          return isWithinInterval(task.startTime, { start, end }) ||
            (hasValidEndTime && isWithinInterval(task.endTime, { start, end }));
        });
      },

      getTasksForWeek: (startDate) => {
        if (!isValid(startDate)) {
          return [];
        }

        const start = startOfDay(startDate);
        const end = endOfDay(addDays(startDate, 6));

        return get().tasks.filter((task) => {
          const hasValidStartTime = task.startTime && isValid(task.startTime);
          const hasValidEndTime = task.endTime && isValid(task.endTime);

          if (!hasValidStartTime) return false;

          return isWithinInterval(task.startTime, { start, end }) ||
            (hasValidEndTime && isWithinInterval(task.endTime, { start, end }));
        });
      },

      generateId: () => {
        return Math.random().toString(36).substring(2, 9);
      },
    }),
    {
      name: 'time-tracker-storage',
    }
  )
);

export default useTimeStore;