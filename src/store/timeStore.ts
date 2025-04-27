import { create } from 'zustand';
import { TimeEntry, Category } from '../types/task';

interface TimeStore {
  timeEntries: TimeEntry[];
  categories: Category[];
  setTimeEntries: (timeEntries: TimeEntry[]) => void;
  addTimeEntry: (timeEntry: TimeEntry) => void;
  setCategories: (categories: Category[]) => void;
}

const useTimeStore = create<TimeStore>((set) => ({
  timeEntries: [],
  categories: [
    { id: '1', name: 'Development', color: '#3B82F6' },
    { id: '2', name: 'Design', color: '#EC4899' },
    { id: '3', name: 'Testing', color: '#10B981' },
    { id: '4', name: 'Planning', color: '#F59E0B' },
  ], // Mock categories; replace with API call if needed
  setTimeEntries: (timeEntries) => set({ timeEntries }),
  addTimeEntry: (timeEntry) => set((state) => ({ timeEntries: [...state.timeEntries, timeEntry] })),
  setCategories: (categories) => set({ categories }),
}));

export default useTimeStore;