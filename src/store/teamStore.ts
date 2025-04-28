import { create } from 'zustand';
import { Team } from '../types/team';

interface TeamState {
  teams: Team[];
  setTeams: (teams: Team[]) => void;
  addTeam: (team: Team) => void;
  updateTeam: (teamId: string, team: Partial<Team>) => void;
  clearData: () => void;
}

const useTeamStore = create<TeamState>((set) => ({
  teams: [],
  setTeams: (teams) => set({ teams }),
  addTeam: (team) => set((state) => ({ teams: [...state.teams, team] })),
  updateTeam: (teamId, team) =>
    set((state) => ({
      teams: state.teams.map((t) => (t.id === teamId ? { ...t, ...team } : t)),
    })),
  clearData: () => set({ teams: [] }),
}));

export default useTeamStore;