import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import TaskForm from '../components/TaskForm';
import SubtaskForm from '../components/SubTaskForm';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDailog';
import Button from '../components/ui/Button';
import { PlusIcon, PencilIcon, TrashIcon, ListIcon, ChevronDownIcon, FilterIcon, ColumnsIcon } from 'lucide-react';
import useTaskStore from '../store/taskStore';
import useAuthStore from '../store/authStore';
import {
  fetchTasks,
  createTask,
  createSubtask,
  updateTask,
  updateSubtask,
  deleteTask,
  deleteSubtask,
  fetchUsers,
  fetchTeams,
  fetchProjectStats,
} from '../utils/api';
import { toast } from 'react-toastify';
import { Task, Subtask } from '../types/task';
import { User } from '../types/user';
import { Team } from '../types/team';

const TasksDashboard: React.FC = () => {
  const { tasks, setTasks, addTask, addSubtask, updateTask: updateTaskStore, updateSubtask: updateSubtaskStore, deleteTask: deleteTaskStore, deleteSubtask: deleteSubtaskStore, setProjectStats } = useTaskStore();
  const role = useAuthStore((state) => state.user?.role);
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const [view, setView] = useState<'list' | 'kanban'>('list'); // Changed to 'kanban'
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState<string | null>(null);
  const [isTaskEditModalOpen, setIsTaskEditModalOpen] = useState<string | null>(null);
  const [isSubtaskEditModalOpen, setIsSubtaskEditModalOpen] = useState<{ taskId: string; subtaskId: string } | null>(null);
  const [isTaskDeleteDialogOpen, setIsTaskDeleteDialogOpen] = useState<string | null>(null);
  const [isSubtaskDeleteDialogOpen, setIsSubtaskDeleteDialogOpen] = useState<{ taskId: string; subtaskId: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState({ status: '', priority: '', tags: '' });
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'title'>('due_date');
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [tasksResponse, usersResponse, teamsResponse, statsResponse] = await Promise.all([
        fetchTasks(projectId || undefined),
        fetchUsers(),
        fetchTeams(),
        projectId ? fetchProjectStats(projectId) : Promise.resolve(null),
      ]);
      setTasks(tasksResponse.data.data);
      setUsers(usersResponse.data.data);
      setTeams(teamsResponse.data.data);
      if (statsResponse) setProjectStats(statsResponse.data.data);
    } catch (err) {
      // Error handled in api.ts
    } finally {
      setIsLoading(false);
    }
  }, [projectId, setTasks, setProjectStats]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const calculateTaskCompletion = (task: Task) => {
    if (task.subtasks.length === 0) return 0;
    const completed = task.subtasks.filter((s) => s.status === 'Completed').length;
    return Math.round((completed / task.subtasks.length) * 100);
  };

  const updateTaskStatusFromSubtasks = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const completion = calculateTaskCompletion(task);
    let newStatus: Task['status'] = 'Not Started';
    if (completion === 100) newStatus = 'Completed';
    else if (completion > 0) newStatus = 'In Progress';

    if (task.status !== newStatus) {
      try {
        const response = await updateTask(taskId, { status: newStatus });
        updateTaskStore(taskId, response.data.data.task);
        if (projectId) {
          const statsResponse = await fetchProjectStats(projectId);
          if (statsResponse) setProjectStats(statsResponse.data.data);
        }
      } catch (err) {
        toast.error('Failed to update task status');
      }
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const [taskId, subtaskId] = draggableId.split("::__::");
    const sourceStatus = source.droppableId as Subtask['status'];
    const destStatus = destination.droppableId as Subtask['status'];

    console.log("debug -- ", subtaskId, sourceStatus, destStatus)
    if (sourceStatus === destStatus) return;

    try {
      // Optimistic update
      // const subtask = tasks.find((t) => t.id === taskId)?.subtasks.find((s) => s.id === subtaskId);
      // if (!subtask) return;

      // Update backend
      const response = await updateSubtask(subtaskId, { status: destStatus });
      // Update store with backend response
      updateSubtaskStore(taskId, subtaskId, response.data.data.subtask);
      toast.success('Subtask status updated!');
      // loadData()
      // Update task status and project stats
      // await updateTaskStatusFromSubtasks(taskId);
    } catch (err) {
      toast.error('Failed to update subtask status');
      // Revert UI if needed (optional)
    }
  };

  const toggleTaskAccordion = (taskId: string) => {
    setExpandedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) newSet.delete(taskId);
      else newSet.add(taskId);
      return newSet;
    });
  };

  const handleOpenTaskModal = () => setIsTaskModalOpen(true);
  const handleCloseTaskModal = () => setIsTaskModalOpen(false);
  const handleOpenSubtaskModal = (taskId: string) => setIsSubtaskModalOpen(taskId);
  const handleCloseSubtaskModal = () => setIsSubtaskModalOpen(null);
  const handleOpenTaskEditModal = (taskId: string) => setIsTaskEditModalOpen(taskId);
  const handleCloseTaskEditModal = () => setIsTaskEditModalOpen(null);
  const handleOpenSubtaskEditModal = (taskId: string, subtaskId: string) =>
    setIsSubtaskEditModalOpen({ taskId, subtaskId });
  const handleCloseSubtaskEditModal = () => setIsSubtaskEditModalOpen(null);
  const handleOpenTaskDeleteDialog = (taskId: string) => setIsTaskDeleteDialogOpen(taskId);
  const handleCloseTaskDeleteDialog = () => setIsTaskDeleteDialogOpen(null);
  const handleOpenSubtaskDeleteDialog = (taskId: string, subtaskId: string) =>
    setIsSubtaskDeleteDialogOpen({ taskId, subtaskId });
  const handleCloseSubtaskDeleteDialog = () => setIsSubtaskDeleteDialogOpen(null);

  const handleTaskSubmit = async (taskData: Omit<Task, 'id' | 'subtasks'>) => {
    try {
      const response = await createTask(taskData);
      addTask(response.data.data.task);
      toast.success('Task created successfully!');
      handleCloseTaskModal();
    } catch (err) {
      // Error handled in api.ts
    }
  };

  const handleTaskEditSubmit = async (taskData: Partial<Task>) => {
    if (!isTaskEditModalOpen) return;
    try {
      const response = await updateTask(isTaskEditModalOpen, taskData);
      updateTaskStore(isTaskEditModalOpen, response.data.data.task);
      toast.success('Task updated successfully!');
      handleCloseTaskEditModal();
    } catch (err) {
      // Error handled in api.ts
    }
  };

  const handleSubtaskSubmit = async (subtaskData: Omit<Subtask, 'id'>) => {
    try {
      const response = await createSubtask(subtaskData);
      addSubtask(subtaskData.task_id, response.data.subtask);
      toast.success('Subtask created successfully!');
      handleCloseSubtaskModal();
      await updateTaskStatusFromSubtasks(subtaskData.task_id);
    } catch (err) {
      // Error handled in api.ts
    }
  };

  const handleSubtaskEditSubmit = async (subtaskData: Partial<Subtask>) => {
    if (!isSubtaskEditModalOpen) return;
    try {
      const response = await updateSubtask(isSubtaskEditModalOpen.subtaskId, subtaskData);
      updateSubtaskStore(isSubtaskEditModalOpen.taskId, isSubtaskEditModalOpen.subtaskId, response.data.data.subtask);
      toast.success('Subtask updated successfully!');
      handleCloseSubtaskEditModal();
      await updateTaskStatusFromSubtasks(isSubtaskEditModalOpen.taskId);
    } catch (err) {
      // Error handled in api.ts
    }
  };

  const handleTaskDelete = async () => {
    if (!isTaskDeleteDialogOpen) return;
    try {
      await deleteTask(isTaskDeleteDialogOpen);
      deleteTaskStore(isTaskDeleteDialogOpen);
      toast.success('Task deleted successfully!');
      handleCloseTaskDeleteDialog();
      if (projectId) {
        const statsResponse = await fetchProjectStats(projectId);
        if (statsResponse) setProjectStats(statsResponse.data.data);
      }
    } catch (err) {
      // Error handled in api.ts
    }
  };

  const handleSubtaskDelete = async () => {
    if (!isSubtaskDeleteDialogOpen) return;
    try {
      await deleteSubtask(isSubtaskDeleteDialogOpen.subtaskId);
      deleteSubtaskStore(isSubtaskDeleteDialogOpen.taskId, isSubtaskDeleteDialogOpen.subtaskId);
      toast.success('Subtask deleted successfully!');
      handleCloseSubtaskDeleteDialog();
      await updateTaskStatusFromSubtasks(isSubtaskDeleteDialogOpen.taskId);
    } catch (err) {
      // Error handled in api.ts
    }
  };

  const priorityColors: { [key: string]: string } = {
    High: 'bg-red-100 text-red-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Low: 'bg-green-100 text-green-800',
  };

  const statusColors: { [key: string]: string } = {
    'Not Started': 'bg-gray-100 text-gray-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    Completed: 'bg-green-100 text-green-800',
  };

  const getUserName = useCallback((userId?: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.username} (${user.email})` : 'Unassigned';
  }, [users]);

  const getTeamName = useCallback((teamId?: string) => {
    const team = teams.find((t) => t.id === teamId);
    return team ? team.name : 'Unassigned';
  }, [teams]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (filter.status && task.status !== filter.status) return false;
        if (filter.priority && task.priority !== filter.priority) return false;
        if (filter.tags && !task.tags?.some((tag) => tag.toLowerCase().includes(filter.tags.toLowerCase()))) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'due_date') {
          const aDate = a.due_date ? new Date(a.due_date).getTime() : Infinity;
          const bDate = b.due_date ? new Date(b.due_date).getTime() : Infinity;
          return aDate - bDate;
        }
        if (sortBy === 'priority') {
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return a.title.localeCompare(b.title);
      });
  }, [tasks, filter, sortBy]);

  const projectStats = useMemo(() => {
    const totalTasks = tasks.length;
    const totalSubtasks = tasks.reduce((sum, task) => sum + task.subtasks.length, 0);
    const completedSubtasks = tasks.reduce((sum, task) => sum + task.subtasks.filter((s) => s.status === 'Completed').length, 0);
    const inProgressSubtasks = tasks.reduce((sum, task) => sum + task.subtasks.filter((s) => s.status === 'In Progress').length, 0);
    const notStartedSubtasks = tasks.reduce((sum, task) => sum + task.subtasks.filter((s) => s.status === 'Not Started').length, 0);
    const completionRate = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
    return { totalTasks, totalSubtasks, completedSubtasks, inProgressSubtasks, notStartedSubtasks, completionRate };
  }, [tasks]);

  const kanbanColumns: { id: Subtask['status']; title: string }[] = [
    { id: 'Not Started', title: 'Not Started' },
    { id: 'In Progress', title: 'In Progress' },
    { id: 'Completed', title: 'Completed' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {projectId ? 'Project Tasks' : 'All Tasks'}
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  {projectStats.totalTasks} tasks, {projectStats.totalSubtasks} subtasks (
                  {projectStats.notStartedSubtasks} Not Started, {projectStats.inProgressSubtasks} In Progress, {projectStats.completedSubtasks} Completed, {projectStats.completionRate}% complete)
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant={view === 'list' ? 'primary' : 'outline'}
                  onClick={() => setView('list')}
                  aria-label="Switch to List view"
                >
                  <ListIcon className="h-4 w-4 mr-2" />
                  List
                </Button>
                <Button
                  variant={view === 'kanban' ? 'primary' : 'outline'}
                  onClick={() => setView('kanban')}
                  aria-label="Switch to Kanban view"
                >
                  <ColumnsIcon className="h-4 w-4 mr-2" />
                  Kanban
                </Button>
                {role && ['Admin', 'Project Manager'].includes(role) && (
                  <Button variant="primary" onClick={handleOpenTaskModal} aria-label="Create new task">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    New Task
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Bar */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-4">
                <FilterIcon className="h-5 w-5 text-gray-500" />
                <select
                  className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                  aria-label="Filter by status"
                >
                  <option value="">All Statuses</option>
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <select
                  className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={filter.priority}
                  onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
                  aria-label="Filter by priority"
                >
                  <option value="">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <input
                  type="text"
                  placeholder="Filter by tags..."
                  className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={filter.tags}
                  onChange={(e) => setFilter({ ...filter, tags: e.target.value })}
                  aria-label="Filter by tags"
                />
                <select
                  className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'due_date' | 'priority' | 'title')}
                  aria-label="Sort by"
                >
                  <option value="due_date">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center text-gray-500">Loading tasks...</div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center text-gray-500">No tasks found.</div>
            ) : view === 'list' ? (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div key={task.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div
                      className="p-6 flex justify-between items-center cursor-pointer"
                      onClick={() => toggleTaskAccordion(task.id)}
                      aria-expanded={expandedTasks.has(task.id)}
                      aria-controls={`subtasks-${task.id}`}
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                        <p className="mt-1 text-sm text-gray-600">{task.description || 'No description'}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        {role && ['Admin', 'Project Manager'].includes(role) && (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenTaskEditModal(task.id);
                              }}
                              aria-label={`Edit task ${task.title}`}
                            >
                              <PencilIcon className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenTaskDeleteDialog(task.id);
                              }}
                              aria-label={`Delete task ${task.title}`}
                            >
                              <TrashIcon className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenSubtaskModal(task.id);
                              }}
                              aria-label={`Add subtask to ${task.title}`}
                            >
                              <PlusIcon className="h-4 w-4 mr-1" />
                              Subtask
                            </Button>
                          </div>
                        )}
                        <ChevronDownIcon
                          className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${expandedTasks.has(task.id) ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </div>
                    {expandedTasks.has(task.id) && (
                      <div id={`subtasks-${task.id}`} className="px-6 pb-6 transition-all duration-300 ease-in-out">
                        <div className="mt-4 space-y-2 text-sm text-gray-600">
                          <p>
                            Status: <span className={`px-2 py-1 text-xs rounded-full ${statusColors[task.status]}`}>{task.status}</span>
                            {' | '}
                            Priority: <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[task.priority]}`}>{task.priority}</span>
                          </p>
                          <p>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</p>
                          <p>Tags: {task.tags?.join(', ') || 'None'}</p>
                          <p>Estimated Duration: {task.estimated_duration || 'N/A'} hours</p>
                          <p>Actual Duration: {task.actual_duration || 0} hours</p>
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-700">
                              Completion: {calculateTaskCompletion(task)}% ({task.subtasks.filter((s) => s.status === 'Completed').length}/{task.subtasks.length} subtasks)
                            </p>
                          </div>
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                              style={{ width: `${calculateTaskCompletion(task)}%` }}
                            />
                          </div>
                        </div>
                        {task.subtasks.length > 0 && (
                          <div className="mt-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Subtasks</h4>
                            <ul className="space-y-4">
                              {task.subtasks.map((subtask) => (
                                <li key={subtask.id} className="pl-4 border-l-2 border-indigo-200">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="text-sm font-medium text-gray-800">{subtask.title}</p>
                                      <p className="text-sm text-gray-600">{subtask.description || 'No description'}</p>
                                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                                        <p>Status: <span className={`px-2 py-1 text-xs rounded-full ${statusColors[subtask.status]}`}>{subtask.status}</span></p>
                                        <p>Assigned User: {getUserName(subtask.assigned_user_id)}</p>
                                        <p>Assigned Team: {getTeamName(subtask.assigned_team_id)}</p>
                                        <p>Due: {subtask.due_date ? new Date(subtask.due_date).toLocaleDateString() : 'N/A'}</p>
                                        <p>Tags: {subtask.tags?.join(', ') || 'None'}</p>
                                        <p>Estimated Duration: {subtask.estimated_duration || 'N/A'} hours</p>
                                      </div>
                                    </div>
                                    {role && ['Admin', 'Project Manager'].includes(role) && (
                                      <div className="flex space-x-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleOpenSubtaskEditModal(task.id, subtask.id)}
                                          aria-label={`Edit subtask ${subtask.title}`}
                                        >
                                          <PencilIcon className="h-4 w-4 mr-1" />
                                          Edit
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleOpenSubtaskDeleteDialog(task.id, subtask.id)}
                                          aria-label={`Delete subtask ${subtask.title}`}
                                        >
                                          <TrashIcon className="h-4 w-4 mr-1" />
                                          Delete
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Kanban Board</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {kanbanColumns.map((column) => (
                      <Droppable key={column.id} droppableId={column.id}>
                        {(provided) => (
                          <div
                            className="bg-gray-50 rounded-lg p-4 min-h-[200px]"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            <h4 className="text-sm font-medium text-gray-700 mb-3">{column.title}</h4>
                            {tasks.flatMap((task) =>
                              task.subtasks
                                .filter((subtask) => subtask.status === column.id)
                                .map((subtask, index) => (
                                  <Draggable
                                    key={`${task.id}-${subtask.id}`}
                                    draggableId={`${task.id}::__::${subtask.id}`}
                                    index={index}
                                  >
                                    {(provided) => (
                                      <div
                                        className="bg-white rounded-md p-3 mb-2 shadow-sm hover:shadow-md transition-shadow"
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        ref={provided.innerRef}
                                      >
                                        <p className="text-sm font-medium text-gray-800">{subtask.title}</p>
                                        <p className="text-xs text-gray-600">Task: {task.title}</p>
                                        <p className="text-xs text-gray-600">
                                          Due: {subtask.due_date ? new Date(subtask.due_date).toLocaleDateString() : 'N/A'}
                                        </p>
                                        {role && ['Admin', 'Project Manager'].includes(role) && (
                                          <div className="flex space-x-1 mt-2">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => handleOpenSubtaskEditModal(task.id, subtask.id)}
                                              aria-label={`Edit subtask ${subtask.title}`}
                                            >
                                              <PencilIcon className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => handleOpenSubtaskDeleteDialog(task.id, subtask.id)}
                                              aria-label={`Delete subtask ${subtask.title}`}
                                            >
                                              <TrashIcon className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </Draggable>
                                ))
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    ))}
                  </div>
                </div>
              </DragDropContext>
            )}
          </div>
        </main>
      </div>

      {/* Modals and Dialogs */}
      <Modal isOpen={isTaskModalOpen} onClose={handleCloseTaskModal} title="Create New Task" maxWidth="lg">
        <TaskForm
          onSubmit={handleTaskSubmit}
          onCancel={handleCloseTaskModal}
          initialData={projectId ? { project_id: projectId } : undefined}
        />
      </Modal>
      {isTaskEditModalOpen && (
        <Modal isOpen={!!isTaskEditModalOpen} onClose={handleCloseTaskEditModal} title="Edit Task" maxWidth="lg">
          <TaskForm
            task={tasks.find((t) => t.id === isTaskEditModalOpen)}
            initialData={projectId ? { project_id: projectId } : undefined}
            onSubmit={handleTaskEditSubmit}
            onCancel={handleCloseTaskEditModal}
          />
        </Modal>
      )}
      {isSubtaskModalOpen && (
        <Modal isOpen={!!isSubtaskModalOpen} onClose={handleCloseSubtaskModal} title="Create New Subtask" maxWidth="lg">
          <SubtaskForm
            taskId={isSubtaskModalOpen}
            onSubmit={handleSubtaskSubmit}
            onCancel={handleCloseSubtaskModal}
          />
        </Modal>
      )}
      {isSubtaskEditModalOpen && (
        <Modal isOpen={!!isSubtaskEditModalOpen} onClose={handleCloseSubtaskEditModal} title="Edit Subtask" maxWidth="lg">
          <SubtaskForm
            taskId={isSubtaskEditModalOpen.taskId}
            subtask={tasks.find((t) => t.id === isSubtaskEditModalOpen.taskId)?.subtasks.find((s) => s.id === isSubtaskEditModalOpen.subtaskId)}
            onSubmit={handleSubtaskEditSubmit}
            onCancel={handleCloseSubtaskEditModal}
          />
        </Modal>
      )}
      {isTaskDeleteDialogOpen && (
        <ConfirmDialog
          isOpen={!!isTaskDeleteDialogOpen}
          onClose={handleCloseTaskDeleteDialog}
          onConfirm={handleTaskDelete}
          title="Delete Task"
          message="Are you sure you want to delete this task? This will also delete all associated subtasks. This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
      {isSubtaskDeleteDialogOpen && (
        <ConfirmDialog
          isOpen={!!isSubtaskDeleteDialogOpen}
          onClose={handleCloseSubtaskDeleteDialog}
          onConfirm={handleSubtaskDelete}
          title="Delete Subtask"
          message="Are you sure you want to delete this subtask? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default TasksDashboard;