import React, { useEffect, useState, useCallback } from 'react';
import { Chart } from 'react-google-charts';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Button from '../components/ui/Button';
import { ArrowLeftIcon, FolderIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import useProjectStore from '../store/projectStore';
import useTaskStore from '../store/taskStore';
import { fetchProjects, fetchTasks } from '../utils/api';
import { Project } from '../types/project';
import { Task } from '../types/task';

const GanttDashboard: React.FC = () => {
  const { projects, setProjects } = useProjectStore();
  const { tasks, setTasks } = useTaskStore();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchProjects();
      setProjects(response.data.data);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, [setProjects]);

  const loadTasks = useCallback(
    async (projectId: string) => {
      setIsLoading(true);
      try {
        const response = await fetchTasks(projectId);
        setTasks(response.data.data);
      } catch (err) {
        toast.error('Failed to load tasks');
      } finally {
        setIsLoading(false);
      }
    },
    [setTasks]
  );

  useEffect(() => {
    if (!selectedProject) {
      loadProjects();
    } else {
      loadTasks(selectedProject.id);
    }
  }, [loadProjects, loadTasks, selectedProject]);

  // Helper to validate date strings
  const isValidDate = (dateStr: string | null | undefined): boolean => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };

  // Format projects for Google Gantt chart
  const projectGanttData = [
    [
      { type: 'string', label: 'Task ID' },
      { type: 'string', label: 'Task Name' },
      { type: 'date', label: 'Start Date' },
      { type: 'date', label: 'End Date' },
      { type: 'number', label: 'Duration' },
      { type: 'number', label: 'Percent Complete' },
      { type: 'string', label: 'Dependencies' },
    ],
    ...projects
      .filter((project) => {
        const isValid = isValidDate(project.start_date);
        if (!isValid) {
          console.log('Invalid project dates:', {
            id: project.id,
            title: project.title,
            start_date: project.start_date,
            end_date: project.end_date,
          });
        }
        return isValid;
      })
      .map((project) => [
        project.id,
        project.title,
        new Date(project.start_date!),
        project.end_date ? new Date(project.end_date) : new Date(),
        null,
        100,
        null,
      ]),
  ];

  // Format tasks for Google Gantt chart, including selected project
  const taskGanttData = [
    [
      { type: 'string', label: 'Task ID' },
      { type: 'string', label: 'Task Name' },
      { type: 'date', label: 'Start Date' },
      { type: 'date', label: 'End Date' },
      { type: 'number', label: 'Duration' },
      { type: 'number', label: 'Percent Complete' },
      { type: 'string', label: 'Dependencies' },
    ],
    // Add selected project as the first entry if available and valid
    ...(selectedProject && isValidDate(selectedProject.start_date) && isValidDate(selectedProject.end_date)
      ? [
        [
          selectedProject.id,
          `Project: ${selectedProject.title}`,
          new Date(selectedProject.start_date!),
          selectedProject?.end_date ? new Date(selectedProject.end_date) : new Date(),
          null,
          100,
          null,
        ],
      ]
      : []),
    // Add tasks
    ...tasks
      .filter((task) => {
        const isValid = isValidDate(task.start_date || task.created_at);
        if (!isValid) {
          console.log('Invalid task dates:', {
            id: task.id,
            title: task.title,
            start_date: task.start_date,
            created_at: task.created_at,
            end_date: task.end_date,
            due_date: task.due_date,
          });
        }
        return isValid;
      })
      .map((task) => [
        task.id,
        `${task.title} (${task.status})`,
        task.start_date ? new Date(task.start_date) : new Date(task.created_at),
        task.end_date ? new Date(task.end_date) : new Date(),
        null,
        task.status === 'Completed' ? 100 : task.status === 'In Progress' ? 50 : 0,
        null,
      ]),
  ];

  const handleProjectSelect = ({ chartWrapper }: { chartWrapper: any }) => {
    console.log('Select event:', chartWrapper);
    try {
      const chart = chartWrapper.getChart ? chartWrapper.getChart() : chartWrapper;
      const selection = chart.getSelection();
      console.log('Selection:', selection);
      if (selection.length > 0) {
        const row = selection[0].row;
        const projectId = projectGanttData[row + 1][0];
        const project = projects.find((p) => p.id === projectId);
        if (project) {
          console.log('Selected project:', project);
          setSelectedProject(project);
        } else {
          toast.error('Project not found');
        }
      } else {
        console.log('No selection detected');
      }
    } catch (error) {
      console.error('Error handling selection:', error);
      toast.error('Failed to select project');
    }
  };

  const handleTaskSelect = ({ chartWrapper }: { chartWrapper: any }) => {
    console.log('Task select event:', chartWrapper);
    try {
      const chart = chartWrapper.getChart ? chartWrapper.getChart() : chartWrapper;
      const selection = chart.getSelection();
      if (selection.length > 0) {
        const row = selection[0].row;
        const taskId = taskGanttData[row + 1][0];
        // Check if the selected item is the project
        if (selectedProject && taskId === selectedProject.id) {
          toast.info(`Project: ${selectedProject.title}\nStart: ${selectedProject.start_date}\nEnd: ${selectedProject.end_date}`);
        } else {
          const task = tasks.find((t) => t.id === taskId);
          if (task) {
            toast.info(
              `Task: ${task.title}\nStatus: ${task.status}\nPriority: ${task.priority}\nDue: ${task.due_date}`
            );
          }
        }
      }
    } catch (error) {
      console.error('Error handling task selection:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <FolderIcon className="h-6 w-6 mr-2 text-indigo-600" />
                  {selectedProject ? `${selectedProject.title} Timeline` : 'Projects Timeline'}
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  {selectedProject
                    ? `Viewing tasks for ${selectedProject.title}`
                    : 'Overview of all projects'}
                </p>
              </div>
              {selectedProject && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedProject(null)}
                  aria-label="Back to projects"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Projects
                </Button>
              )}
            </div>

            {/* Project selection list as fallback */}
            {!selectedProject && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Select a Project</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((project) => (
                    <Button
                      key={project.id}
                      variant="outline"
                      className="text-left justify-start"
                      onClick={() => setSelectedProject(project)}
                    >
                      <FolderIcon className="h-4 w-4 mr-2 text-indigo-600" />
                      {project.title}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : selectedProject ? (
              taskGanttData.length > 1 ? (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <Chart
                    chartType="Gantt"
                    data={taskGanttData}
                    width="100%"
                    height="400px"
                    options={{
                      gantt: {
                        trackHeight: 30,
                        barCornerRadius: 4,
                        defaultStartToEndColor: '#3b82f6', // Blue-500 for tasks
                        criticalPathEnabled: true, // Highlight project bar
                        criticalPathStyle: {
                          stroke: '#4f46e5', // Indigo-600 for project
                          strokeWidth: 5,
                        },
                      },
                    }}
                    chartEvents={[
                      {
                        eventName: 'select',
                        callback: handleTaskSelect,
                      },
                    ]}
                  />
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  No tasks or valid project dates found for this project.
                </div>
              )
            ) : projectGanttData.length > 1 ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <Chart
                  chartType="Gantt"
                  data={projectGanttData}
                  width="100%"
                  height="400px"
                  options={{
                    gantt: {
                      trackHeight: 30,
                      barCornerRadius: 4,
                      defaultStartToEndColor: '#4f46e5', // Indigo-600 for projects
                    },
                  }}
                  chartEvents={[
                    {
                      eventName: 'select',
                      callback: handleProjectSelect,
                    },
                  ]}
                />
              </div>
            ) : (
              <div className="text-center text-gray-500">
                No projects with valid start and end dates found.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default GanttDashboard;