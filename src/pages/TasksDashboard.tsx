import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import TaskForm from '../components/TaskForm';
import Modal from '../components/Modal';
import Button from '../components/ui/Button';
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react';
import useTaskStore from '../store/taskStore';
import useAuthStore from '../store/authStore';
import { fetchTasks, createTask, createSubtask, updateTask, updateSubtask, deleteTask, deleteSubtask, fetchUsers, fetchTeams } from '../utils/api';
import { toast } from 'react-toastify';
import { Task } from '../types/task';
import { User } from '../types/user';
import { Team } from '../types/team';
import SubtaskForm from '../components/SubTaskForm';
import ConfirmDialog from '../components/ConfirmDailog';

const TasksDashboard: React.FC = () => {
  const { tasks, setTasks, addTask, addSubtask, updateTask: updateTaskStore, updateSubtask: updateSubtaskStore, deleteTask: deleteTaskStore, deleteSubtask: deleteSubtaskStore } = useTaskStore();
  const role = useAuthStore((state) => state.user?.role);
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState<string | null>(null);
  const [isTaskEditModalOpen, setIsTaskEditModalOpen] = useState<string | null>(null);
  const [isSubtaskEditModalOpen, setIsSubtaskEditModalOpen] = useState<{ taskId: string; subtaskId: string } | null>(null);
  const [isTaskDeleteDialogOpen, setIsTaskDeleteDialogOpen] = useState<string | null>(null);
  const [isSubtaskDeleteDialogOpen, setIsSubtaskDeleteDialogOpen] = useState<{ taskId: string; subtaskId: string } | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tasksResponse, usersResponse, teamsResponse] = await Promise.all([
          fetchTasks(projectId || undefined),
          fetchUsers(),
          fetchTeams(),
        ]);
        setTasks(tasksResponse.data.data);
        setUsers(usersResponse.data.data);
        setTeams(teamsResponse.data.data);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to fetch data');
      }
    };
    loadData();
  }, [projectId, setTasks]);

  const handleOpenTaskModal = () => {
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
  };

  const handleOpenSubtaskModal = (taskId: string) => {
    setIsSubtaskModalOpen(taskId);
  };

  const handleCloseSubtaskModal = () => {
    setIsSubtaskModalOpen(null);
  };

  const handleOpenTaskEditModal = (taskId: string) => {
    setIsTaskEditModalOpen(taskId);
  };

  const handleCloseTaskEditModal = () => {
    setIsTaskEditModalOpen(null);
  };

  const handleOpenSubtaskEditModal = (taskId: string, subtaskId: string) => {
    setIsSubtaskEditModalOpen({ taskId, subtaskId });
  };

  const handleCloseSubtaskEditModal = () => {
    setIsSubtaskEditModalOpen(null);
  };

  const handleOpenTaskDeleteDialog = (taskId: string) => {
    setIsTaskDeleteDialogOpen(taskId);
  };

  const handleCloseTaskDeleteDialog = () => {
    setIsTaskDeleteDialogOpen(null);
  };

  const handleOpenSubtaskDeleteDialog = (taskId: string, subtaskId: string) => {
    setIsSubtaskDeleteDialogOpen({ taskId, subtaskId });
  };

  const handleCloseSubtaskDeleteDialog = () => {
    setIsSubtaskDeleteDialogOpen(null);
  };

  const handleTaskSubmit = async (taskData: Omit<Task, 'id' | 'subtasks'>) => {
    try {
      const response = await createTask(taskData);
      addTask(response.data.data.task);
      toast.success('Task created successfully!');
      handleCloseTaskModal();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleTaskEditSubmit = async (taskData: Partial<Task>) => {
    if (!isTaskEditModalOpen) return;
    try {
      const response = await updateTask(isTaskEditModalOpen, taskData);
      updateTaskStore(isTaskEditModalOpen, response.data.data.task);
      toast.success('Task updated successfully!');
      handleCloseTaskEditModal();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleSubtaskSubmit = async (subtaskData: Omit<Task['subtasks'][0], 'id'>) => {
    try {
      const response = await createSubtask(subtaskData);
      addSubtask(subtaskData.task_id, response.data.data.subtask);
      toast.success('Subtask created successfully!');
      handleCloseSubtaskModal();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create subtask');
    }
  };

  const handleSubtaskEditSubmit = async (subtaskData: Partial<Task['subtasks'][0]>) => {
    if (!isSubtaskEditModalOpen) return;
    try {
      const response = await updateSubtask(isSubtaskEditModalOpen.subtaskId, subtaskData);
      updateSubtaskStore(isSubtaskEditModalOpen.taskId, isSubtaskEditModalOpen.subtaskId, response.data.data.subtask);
      toast.success('Subtask updated successfully!');
      handleCloseSubtaskEditModal();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update subtask');
    }
  };

  const handleTaskDelete = async () => {
    if (!isTaskDeleteDialogOpen) return;
    try {
      await deleteTask(isTaskDeleteDialogOpen);
      deleteTaskStore(isTaskDeleteDialogOpen);
      toast.success('Task deleted successfully!');
      handleCloseTaskDeletesDialog();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleSubtaskDelete = async () => {
    if (!isSubtaskDeleteDialogOpen) return;
    try {
      await deleteSubtask(isSubtaskDeleteDialogOpen.subtaskId);
      deleteSubtaskStore(isSubtaskDeleteDialogOpen.taskId, isSubtaskDeleteDialogOpen.subtaskId);
      toast.success('Subtask deleted successfully!');
      handleCloseSubtaskDeleteDialog();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete subtask');
    }
  };

  const filteredTasks = filterStatus === 'All'
    ? tasks
    : tasks.filter((task) => task.status === filterStatus);

  const priorityColors: { [key: string]: string } = {
    High: 'bg-red-100 text-red-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Low: 'bg-green-100 text-green-800',
  };

  const getUserName = (userId?: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.username} (${user.email})` : 'Unassigned';
  };

  const getTeamName = (teamId?: string) => {
    const team = teams.find((t) => t.id === teamId);
    return team ? team.name : 'Unassigned';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Tasks Dashboard</h1>
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              >
                <option value="All">All Statuses</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              {['Admin', 'Project Manager'].includes(role || '') && (
                <Button variant="primary" onClick={handleOpenTaskModal}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-6">
            {filteredTasks.map((task) => (
              <div key={task.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                    <p className="text-sm text-gray-600">{task.description || 'No description'}</p>
                    <div className="mt-2 space-y-1 text-sm text-gray-500">
                      <p>
                        Status: {task.status} | Priority:{' '}
                        <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      </p>
                      <p>Due: {task.dueDate || 'N/A'}</p>
                      <p>Tags: {task.tags?.join(', ') || 'None'}</p>
                      <p>Estimated Duration: {task.estimatedDuration || 'N/A'} hours</p>
                      <p>Actual Duration: {task.actualDuration || 0} hours</p>
                    </div>
                  </div>
                  {['Admin', 'Project Manager'].includes(role || '') && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenTaskEditModal(task.id)}
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenTaskDeleteDialog(task.id)}
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenSubtaskModal(task.id)}
                      >
                        Add Subtask
                      </Button>
                    </div>
                  )}
                </div>
                {task.subtasks.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700">Subtasks</h4>
                    <ul className="mt-2 space-y-2">
                      {task.subtasks.map((subtask) => (
                        <li key={subtask.id} className="pl-4 border-l-2 border-gray-200">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-800">{subtask.title}</p>
                              <p className="text-sm text-gray-600">{subtask.description || 'No description'}</p>
                              <div className="text-sm text-gray-500">
                                <p>Status: {subtask.status}</p>
                                <p>Assigned User: {getUserName(subtask.assignedUserId)}</p>
                                <p>Assigned Team: {getTeamName(subtask.assignedTeamId)}</p>
                                <p>Due: {subtask.dueDate || 'N/A'}</p>
                                <p>Tags: {subtask.tags?.join(', ') || 'None'}</p>
                                <p>Estimated Duration: {subtask.estimatedDuration || 'N/A'} hours</p>
                              </div>
                            </div>
                            {['Admin', 'Project Manager'].includes(role || '') && (
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenSubtaskEditModal(task.id, subtask.id)}
                                >
                                  <PencilIcon className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenSubtaskDeleteDialog(task.id, subtask.id)}
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
            ))}
          </div>
        </main>
      </div>
      <Modal
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        title="Create New Task"
        maxWidth="lg"
      >
        <TaskForm onSubmit={handleTaskSubmit} onCancel={handleCloseTaskModal} />
      </Modal>
      {isTaskEditModalOpen && (
        <Modal
          isOpen={!!isTaskEditModalOpen}
          onClose={handleCloseTaskEditModal}
          title="Edit Task"
          maxWidth="lg"
        >
          <TaskForm
            task={tasks.find((t) => t.id === isTaskEditModalOpen)}
            onSubmit={handleTaskEditSubmit}
            onCancel={handleCloseTaskEditModal}
          />
        </Modal>
      )}
      {isSubtaskModalOpen && (
        <Modal
          isOpen={!!isSubtaskModalOpen}
          onClose={handleCloseSubtaskModal}
          title="Create New Subtask"
          maxWidth="lg"
        >
          <SubtaskForm
            taskId={isSubtaskModalOpen}
            onSubmit={handleSubtaskSubmit}
            onCancel={handleCloseSubtaskModal}
          />
        </Modal>
      )}
      {isSubtaskEditModalOpen && (
        <Modal
          isOpen={!!isSubtaskEditModalOpen}
          onClose={handleCloseSubtaskEditModal}
          title="Edit Subtask"
          maxWidth="lg"
        >
          <SubtaskForm
            taskId={isSubtaskEditModalOpen.taskId}
            subtask={tasks
              .find((t) => t.id === isSubtaskEditModalOpen.taskId)
              ?.subtasks.find((s) => s.id === isSubtaskEditModalOpen.subtaskId)}
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