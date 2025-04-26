import React from 'react';
import { PlusIcon, ListFilterIcon, PieChartIcon, TagIcon, FolderIcon } from 'lucide-react';
import Button from './ui/Button';
import useTimeStore from '../store/timeStore';

interface SidebarProps {
  onNewTask: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNewTask }) => {
  const categories = useTimeStore((state) => state.categories);
  const tasks = useTimeStore((state) => state.tasks);
  const filterOptions = useTimeStore((state) => state.filterOptions);
  const setFilterOptions = useTimeStore((state) => state.setFilterOptions);

  // Extract all unique tags from tasks
  const allTags = Array.from(
    new Set(tasks.flatMap((task) => task.tags))
  );

  const handleCategoryFilter = (categoryId: string) => {
    const newCategories = filterOptions.categories.includes(categoryId)
      ? filterOptions.categories.filter(id => id !== categoryId)
      : [...filterOptions.categories, categoryId];
    
    setFilterOptions({ categories: newCategories });
  };

  const handleTagFilter = (tag: string) => {
    const newTags = filterOptions.tags.includes(tag)
      ? filterOptions.tags.filter(t => t !== tag)
      : [...filterOptions.tags, tag];
    
    setFilterOptions({ tags: newTags });
  };

  return (
    <aside className="bg-white border-r border-gray-200 w-64 h-full overflow-y-auto">
      <div className="p-4">
        <Button variant="primary" fullWidth onClick={onNewTask}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Task
        </Button>
        
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center">
            <FolderIcon className="h-4 w-4 mr-2" />
            Categories
          </h3>
          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`flex items-center px-3 py-2 text-sm rounded-md w-full text-left transition-colors ${
                  filterOptions.categories.includes(category.id)
                    ? 'bg-gray-100 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => handleCategoryFilter(category.id)}
              >
                <span
                  className="h-3 w-3 rounded-full mr-2"
                  style={{ backgroundColor: category.color }}
                ></span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {allTags.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center">
              <TagIcon className="h-4 w-4 mr-2" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    filterOptions.tags.includes(tag)
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handleTagFilter(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-6 space-y-2">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center">
            <ListFilterIcon className="h-4 w-4 mr-2" />
            Quick Filters
          </h3>
          <button className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-md w-full text-left hover:bg-gray-50 transition-colors">
            Today's Tasks
          </button>
          <button className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-md w-full text-left hover:bg-gray-50 transition-colors">
            Completed Tasks
          </button>
          <button className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-md w-full text-left hover:bg-gray-50 transition-colors">
            In Progress
          </button>
        </div>
        
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Reports
          </h3>
          <button className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-md w-full text-left hover:bg-gray-50 transition-colors">
            Weekly Summary
          </button>
          <button className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-md w-full text-left hover:bg-gray-50 transition-colors">
            Time Distribution
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;