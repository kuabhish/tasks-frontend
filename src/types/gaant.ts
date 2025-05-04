export interface GanttItem {
  id: string;
  name: string;
  start: Date;
  end: Date;
  color?: string;
  projectId?: string;
  taskId?: string;
}