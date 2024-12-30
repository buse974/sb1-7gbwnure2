import React, { useState } from 'react';
import { Task, User, Zone } from '../../../types';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertTriangle, Clock, TrendingDown, TrendingUp, Users, Check, X } from 'lucide-react';
import { calculateExpectedTime, formatDuration } from '../../../utils/timeStatistics';

interface AbnormalTasksSectionProps {
  tasks: Task[];
  users: User[];
  zones: Zone[];
}

const AbnormalTasksSection: React.FC<AbnormalTasksSectionProps> = ({ tasks, users, zones }) => {
  const [validatedTasks, setValidatedTasks] = useState<Set<string>>(new Set());
  const [rejectedTasks, setRejectedTasks] = useState<Set<string>>(new Set());

  // Calculate global average time for each task type
  const taskTypeAverages = tasks
    .filter(task => task.status === 'completed')
    .reduce((acc, task) => {
      if (!acc[task.title]) {
        acc[task.title] = {
          totalTime: 0,
          count: 0
        };
      }
      const totalTime = task.collaborators.reduce((sum, collab) => sum + (collab.timeSpent || 0), 0);
      acc[task.title].totalTime += totalTime;
      acc[task.title].count += 1;
      return acc;
    }, {} as Record<string, { totalTime: number; count: number }>);

  const abnormalTasks = tasks
    .filter(task => {
      if (!task?.collaborators || task.status !== 'completed' || 
          validatedTasks.has(task.id) || rejectedTasks.has(task.id)) {
        return false;
      }

      const taskAverage = taskTypeAverages[task.title];
      if (!taskAverage || taskAverage.count < 2) return false;

      const expectedTime = taskAverage.totalTime / taskAverage.count;
      const actualTime = task.collaborators.reduce((sum, collab) => sum + (collab.timeSpent || 0), 0);
      
      const deviation = ((actualTime - expectedTime) / expectedTime) * 100;
      return Math.abs(deviation) > 50; // Flag tasks that deviate by more than 50%
    })
    .map(task => {
      const taskAverage = taskTypeAverages[task.title];
      const expectedTime = taskAverage.totalTime / taskAverage.count;
      const actualTime = task.collaborators.reduce((sum, collab) => sum + (collab.timeSpent || 0), 0);
      const deviation = ((actualTime - expectedTime) / expectedTime) * 100;
      
      const zone = zones.find(z => z.id === task.zoneId);
      const subZone = zone?.subZones.find(sz => sz.id === task.subZoneId);
      
      const collaborators = task.collaborators.map(collab => {
        const user = users.find(u => u.id === collab.userId);
        return {
          ...collab,
          user,
          contribution: (collab.timeSpent || 0) / actualTime * 100
        };
      });

      const timeline = {
        start: task.statusHistory.find(h => h.status === 'in-progress')?.timestamp,
        completion: task.statusHistory.find(h => h.status === 'completed')?.timestamp
      };

      return {
        task,
        zone,
        subZone,
        actualTime,
        expectedTime,
        deviation,
        collaborators,
        timeline
      };
    })
    .sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));

  const handleValidateTask = (taskId: string) => {
    setValidatedTasks(prev => new Set([...prev, taskId]));
  };

  const handleRejectTask = (taskId: string) => {
    setRejectedTasks(prev => new Set([...prev, taskId]));
  };

  if (abnormalTasks.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Tâches Anormales</h2>
            <p className="mt-1 text-sm text-gray-500">
              Aucune tâche avec un temps d'exécution anormal n'a été détectée
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Tâches Anormales</h2>
          <p className="mt-1 text-sm text-gray-500">
            Tâches avec un temps d'exécution anormal nécessitant une validation
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <AlertTriangle className="h-4 w-4 mr-1.5" />
          {abnormalTasks.length} tâche{abnormalTasks.length > 1 ? 's' : ''} à vérifier
        </span>
      </div>

      <div className="space-y-6">
        {abnormalTasks.map(({ task, zone, subZone, actualTime, expectedTime, deviation, collaborators, timeline }) => (
          <div key={task.id} className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: zone?.color }}
                  />
                  <span>{zone?.name}</span>
                  {subZone && (
                    <>
                      <span className="mx-2">/</span>
                      <span>{subZone.name}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleValidateTask(task.id)}
                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Valider
                </button>
                <button
                  onClick={() => handleRejectTask(task.id)}
                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Rejeter
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Temps attendu</div>
                  <div className="text-sm text-gray-500">{formatDuration(expectedTime)}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Temps réel</div>
                  <div className="text-sm text-gray-500">{formatDuration(actualTime)}</div>
                </div>
              </div>
              <div className="flex items-center">
                {deviation < 0 ? (
                  <TrendingDown className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-red-500 mr-2" />
                )}
                <div>
                  <div className="text-sm font-medium text-gray-900">Écart</div>
                  <div className={`text-sm ${deviation < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(deviation).toFixed(1)}% {deviation < 0 ? 'plus rapide' : 'plus lent'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Chronologie</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {timeline.start && (
                  <div>
                    <span className="text-gray-500">Début:</span>{' '}
                    <span className="font-medium">
                      {format(parseISO(timeline.start), 'Pp', { locale: fr })}
                    </span>
                  </div>
                )}
                {timeline.completion && (
                  <div>
                    <span className="text-gray-500">Fin:</span>{' '}
                    <span className="font-medium">
                      {format(parseISO(timeline.completion), 'Pp', { locale: fr })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Users className="h-4 w-4 mr-1.5" />
                Collaborateurs ({collaborators.length})
              </h4>
              <div className="space-y-3">
                {collaborators.map(({ user, timeSpent, contribution }) => {
                  if (!user) return null;
                  return (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-900">{formatDuration(timeSpent || 0)}</div>
                        <div className="text-xs text-gray-500">
                          {contribution.toFixed(1)}% du temps total
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AbnormalTasksSection;