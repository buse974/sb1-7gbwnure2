import React, { useState, useEffect, useMemo } from 'react';
import { CheckSquare, ListChecks, Repeat } from 'lucide-react';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import DesignationManager from './DesignationManager';
import TaskDetailModal from './TaskDetailModal';
import RoutineForm from './RoutineForm';
import { Task } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useDesignationStore } from '../../store/designationStore';
import { useTaskStore } from '../../store/taskStore';
import { useUserStore } from '../../store/userStore';

const TasksPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDesignationManagerOpen, setIsDesignationManagerOpen] = useState(false);
  const [isRoutineFormOpen, setIsRoutineFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  
  const user = useAuthStore(state => state.user);
  const users = useUserStore(state => state.users);
  const designations = useDesignationStore(state => state.designations);
  const tasks = useTaskStore(state => state.tasks);
  const addTask = useTaskStore(state => state.addTask);
  const generateRoutineTasks = useTaskStore(state => state.generateRoutineTasks);

  // Check for routine tasks that need to be generated
  useEffect(() => {
    const interval = setInterval(() => {
      generateRoutineTasks();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [generateRoutineTasks]);

  const {
    routineTasks,
    availableTasks,
    inProgressTasks,
    completedTasks
  } = useMemo(() => {
    const allTasks = [...tasks].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      routineTasks: allTasks.filter(task => task.isRoutine),
      availableTasks: allTasks.filter(task => !task.isRoutine && task.status === 'available'),
      inProgressTasks: allTasks.filter(task => !task.isRoutine && (task.status === 'in-progress' || task.status === 'pending')),
      completedTasks: allTasks.filter(task => !task.isRoutine && task.status === 'completed')
    };
  }, [tasks]);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(undefined);
  };

  const handleRoutineSubmit = (routineConfig: Task['routineConfig'], taskData: Partial<Task>) => {
    if (!routineConfig) return;

    const newTask: Partial<Task> = {
      ...taskData,
      isRoutine: true,
      routineConfig,
      status: 'available',
      collaborators: [],
      assignedUsers: routineConfig.assignedUsers
    };

    addTask(newTask);
    setIsRoutineFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Tâches</h1>
        {user?.role !== 'restricted' && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsRoutineFormOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
            >
              <Repeat className="h-5 w-5 mr-2" />
              Définir une Routine
            </button>
            <button
              onClick={() => setIsDesignationManagerOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ListChecks className="h-5 w-5 mr-2" />
              Gérer les Désignations
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              disabled={designations.length === 0}
              title={designations.length === 0 ? 'Créez au moins une désignation pour ajouter des tâches' : ''}
            >
              <CheckSquare className="h-5 w-5 mr-2" />
              Ajouter une Tâche
            </button>
          </div>
        )}
      </div>

      {designations.length === 0 && user?.role !== 'restricted' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Aucune désignation n'a été créée. Veuillez créer au moins une désignation avant d'ajouter des tâches.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Routines Section */}
      {routineTasks.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Routines
            <span className="ml-2 text-sm text-gray-500">({routineTasks.length})</span>
          </h2>
          <TaskList tasks={routineTasks} onEditTask={setSelectedTask} />
        </div>
      )}

      {/* Available Tasks Section */}
      {availableTasks.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Tâches Disponibles
            <span className="ml-2 text-sm text-gray-500">({availableTasks.length})</span>
          </h2>
          <TaskList tasks={availableTasks} onEditTask={setSelectedTask} />
        </div>
      )}

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* In Progress Tasks */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Tâches en Cours
            {inProgressTasks.length > 0 && (
              <span className="ml-2 text-sm text-gray-500">({inProgressTasks.length})</span>
            )}
          </h2>
          {inProgressTasks.length > 0 ? (
            <TaskList tasks={inProgressTasks} onEditTask={setSelectedTask} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">Aucune tâche en cours</p>
          )}
        </div>

        {/* Completed Tasks */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Tâches Terminées
            {completedTasks.length > 0 && (
              <span className="ml-2 text-sm text-gray-500">({completedTasks.length})</span>
            )}
          </h2>
          {completedTasks.length > 0 ? (
            <TaskList tasks={completedTasks} onEditTask={setSelectedTask} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">Aucune tâche terminée</p>
          )}
        </div>
      </div>

      {isFormOpen && user?.role !== 'restricted' && (
        <TaskForm 
          onClose={handleCloseForm}
          editingTask={editingTask}
        />
      )}

      {isDesignationManagerOpen && user?.role !== 'restricted' && (
        <DesignationManager
          onClose={() => setIsDesignationManagerOpen(false)}
        />
      )}

      {isRoutineFormOpen && (
        <RoutineForm
          onClose={() => setIsRoutineFormOpen(false)}
          onSubmit={handleRoutineSubmit}
          users={users}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

export default TasksPage;