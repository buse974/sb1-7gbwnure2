import React from 'react';
import { Task } from '../../types';

interface TaskProgressBarProps {
  task: Task;
  className?: string;
  showLegend?: boolean;
}

const TaskProgressBar: React.FC<TaskProgressBarProps> = ({ task, className = '', showLegend = false }) => {
  const totalCollaborators = task.collaborators.length;
  const completedCollaborators = task.collaborators.filter(c => c.status === 'completed').length;
  const activeCollaborators = task.collaborators.filter(c => c.status === 'active').length;
  const pausedCollaborators = task.collaborators.filter(c => c.status === 'paused').length;

  const completedPercentage = (completedCollaborators / totalCollaborators) * 100;
  const activePercentage = (activeCollaborators / totalCollaborators) * 100;
  const pausedPercentage = (pausedCollaborators / totalCollaborators) * 100;

  return (
    <div className="space-y-2">
      <div className={`h-2 w-full bg-gray-200 rounded-full overflow-hidden ${className}`}>
        <div className="h-full flex">
          <div
            className="bg-green-500 transition-all duration-300"
            style={{ width: `${completedPercentage}%` }}
          />
          <div
            className="bg-yellow-500 transition-all duration-300"
            style={{ width: `${activePercentage}%` }}
          />
          <div
            className="bg-orange-500 transition-all duration-300"
            style={{ width: `${pausedPercentage}%` }}
          />
        </div>
      </div>

      {showLegend && (
        <div className="flex justify-center space-x-4 text-xs">
          {completedCollaborators > 0 && (
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1" />
              <span>Terminé ({completedCollaborators})</span>
            </div>
          )}
          {activeCollaborators > 0 && (
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1" />
              <span>En cours ({activeCollaborators})</span>
            </div>
          )}
          {pausedCollaborators > 0 && (
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-orange-500 mr-1" />
              <span>En pause ({pausedCollaborators})</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskProgressBar;