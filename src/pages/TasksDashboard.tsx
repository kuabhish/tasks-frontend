import React from 'react';
import TaskCard from '../components/TaskCard';
import useTimeStore from '../store/timeStore';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const TasksDashboard: React.FC = () => {
  const tasks = useTimeStore((state) => state.tasks);
  const statuses = ['To Do', 'In Progress', 'Completed'];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <Sidebar onNewTask={() => { }} /> {/* Adjust as needed */}
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Tasks Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statuses.map((status) => (
              <div key={status} className="bg-gray-50 rounded-xl p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">{status}</h2>
                <div className="space-y-4">
                  {tasks
                    .filter((task) => task?.status === status)
                    .map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TasksDashboard;