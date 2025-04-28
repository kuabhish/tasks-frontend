import { create } from 'zustand';
import { User } from '../types/user';

interface UserState {
  users: User[];
  setUsers: (users: User[]) => void;
  updateUser: (userId: string, user: Partial<User>) => void;
  clearData: () => void;
}

const useUserStore = create<UserState>((set) => ({
  users: [],
  setUsers: (users) => set({ users }),
  updateUser: (userId, user) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === userId ? { ...u, ...user } : u)),
    })),
  clearData: () => set({ users: [] }),
}));

export default useUserStore;