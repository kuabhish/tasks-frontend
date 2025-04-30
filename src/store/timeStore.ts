import create from 'zustand';
import { TimeEntry } from '../types/task';

interface TimeEntryState {
  timeEntries: TimeEntry[];
  categories: { id: string; name: string; color: string }[];
  setTimeEntries: (entries: TimeEntry[]) => void;
  addTimeEntry: (entry: TimeEntry) => void;
  updateTimeEntry: (entry: TimeEntry) => void;
}

const useTimeStore = create<TimeEntryState>((set) => ({
  timeEntries: [],
  categories: [
    { id: 'default', name: 'Default', color: '#6B7280' },
    // Add more categories as needed
  ],
  setTimeEntries: (entries) => set({ timeEntries: entries }),
  addTimeEntry: (entry) => set((state) => ({ timeEntries: [...state.timeEntries, entry] })),
  updateTimeEntry: (entry) =>
    set((state) => ({
      timeEntries: state.timeEntries.map((e) => (e.id === entry.id ? entry : e)),
    })),
}));

export default useTimeStore;