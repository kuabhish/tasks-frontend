import { create } from 'zustand';
import { Project, Task as ProjectTask } from '../types/project';

interface ProjectState {
  projects: Project[];
  tasks: ProjectTask[];
  setProjects: (projects: Project[]) => void;
  setTasks: (tasks: ProjectTask[]) => void;
  clearData: () => void;
}

const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  tasks: [],
  setProjects: (projects) => set({ projects }),
  setTasks: (tasks) => set({ tasks }),
  clearData: () => set({ projects: [], tasks: [] }),
}));

export default useProjectStore;