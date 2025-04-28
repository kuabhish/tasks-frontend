import { Project } from './../types/project';
import { create } from 'zustand';

import { Task as ProjectTask } from '../types/task';

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