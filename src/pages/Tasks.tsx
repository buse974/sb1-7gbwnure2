import React, { useState, useEffect } from 'react';
import { Plus, Filter, ListChecks } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useRoutineStore } from '../store/routineStore';
import { useUserStore } from '../store/userStore';
import { useAuth } from '../hooks/useAuth';
import TaskCard from '../components/tasks/TaskCard';
import RoutineCard from '../components/routines/RoutineCard';
import TaskForm from '../components/tasks/TaskForm';
import RoutineForm from '../components/routines/RoutineForm';
import TaskFilters from '../components/tasks/TaskFilters';
import DesignationManager from '../components/tasks/DesignationManager';
import { Task, Routine } from '../types';

const Tasks = () => {
  const { user } = useAuth();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showRoutineForm, setShowRoutineForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDesignationManager, setShowDesignationManager] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [filters, setFilters] = useState({
    status: ['available', 'in-progress', 'pending'],
    zoneId: undefined as string | undefined,
    subZoneId: undefined as string | undefined,
    collaboratorId: undefined as string | undefined,
    dateRange: 'all' as 'today' | 'week' | 'month' | 'all',
    showRoutines: true,
    showTasks: true
  });

  const { tasks = [], isLoading: tasksLoading, error: tasksError, fetchTasks } = useTaskStore();
  const { routines = [], isLoading: routinesLoading, error: routinesError, fetchRoutines } = useRoutineStore();
  const users = useUserStore(state => state.users);

  useEffect(() => {
    fetchTasks();
    fetchRoutines();
  }, [fetchTasks, fetchRoutines]);

  const filterItems = (items: (Task | Routine)[]) => {
    return items.filter(item => {
      if (!filters.status.includes(item.status)) {
        return false;
      }

      if (filters.zoneId && item.zoneId !== filters.zoneId) {
        return false;
      }

      if (filters.subZoneId && item.subZoneId !== filters.subZoneId) {
        return false;
      }

      if (filters.collaboratorId) {
        const hasCollaborator = 'collaborators' in item
          ? item.collaborators.some(c => c.userId === filters.collaboratorId)
          : item.routineConfig?.assignedUsers?.includes(filters.collaboratorId);
        if (!hasCollaborator) {
          return false;
        }
      }

      return true;
    });
  };

  const filteredTasks = filters.showTasks ? filterItems(tasks) as Task[] : [];
  const filteredRoutines = filters.showRoutines ? filterItems(routines) as Routine[] : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Tasks and Routines</h1>
        {user?.role !== 'restricted' && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowDesignationManager(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ListChecks className="h-5 w-5 mr-2" />
              Manage Designations
            </button>
            <button
              onClick={() => setShowRoutineForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Routine
            </button>
            <button
              onClick={() => setShowTaskForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Task
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>
        )}
      </div>

      {showFilters && (
        <TaskFilters
          filters={filters}
          onChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {(tasksError || routinesError) && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">
            {tasksError || routinesError}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Column */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-gray-900">
            Tasks
            {filteredTasks.length > 0 && (
              <span className="ml-2 text-sm text-gray-500">
                ({filteredTasks.length})
              </span>
            )}
          </h2>
          <div className="space-y-4">
            {tasksLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
              </div>
            ) : filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => setSelectedTask(task)}
                />
              ))
            ) : (
              <p className="text-center py-4 text-gray-500">
                No tasks available
              </p>
            )}
          </div>
        </div>

        {/* Routines Column */}
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-gray-900">
            Routines
            {filteredRoutines.length > 0 && (
              <span className="ml-2 text-sm text-gray-500">
                ({filteredRoutines.length})
              </span>
            )}
          </h2>
          <div className="space-y-4">
            {routinesLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
              </div>
            ) : filteredRoutines.length > 0 ? (
              filteredRoutines.map(routine => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  onClick={() => setSelectedRoutine(routine)}
                />
              ))
            ) : (
              <p className="text-center py-4 text-gray-500">
                No routines available
              </p>
            )}
          </div>
        </div>
      </div>

      {showTaskForm && (
        <TaskForm
          onClose={() => setShowTaskForm(false)}
        />
      )}

      {showRoutineForm && (
        <RoutineForm
          onClose={() => setShowRoutineForm(false)}
          users={users}
        />
      )}

      {showDesignationManager && (
        <DesignationManager
          onClose={() => setShowDesignationManager(false)}
        />
      )}
    </div>
  );
};

export default Tasks;