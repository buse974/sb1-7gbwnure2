import React, { useState, useEffect } from 'react';
import { X, ListChecks, MapPin, Calendar, Users, Flag } from 'lucide-react';
import { Task } from '../../types';
import { useTaskStore } from '../../store/taskStore';
import { useZoneStore } from '../../store/zoneStore';
import { useUserStore } from '../../store/userStore';
import { useDesignationStore } from '../../store/designationStore';
import FormSection from '../shared/FormSection';

interface TaskFormProps {
  onClose: () => void;
  editingTask?: Task;
}

const TaskForm: React.FC<TaskFormProps> = ({ onClose, editingTask }) => {
  const [formData, setFormData] = useState({
    designationId: editingTask?.designationId || '',
    title: editingTask?.title || '',
    description: editingTask?.description || '',
    actionDate: editingTask?.actionDate || new Date().toISOString().split('T')[0],
    hasDeadline: editingTask?.hasDeadline || false,
    deadlineDate: editingTask?.deadlineDate || '',
    zoneId: editingTask?.zoneId || '',
    subZoneId: editingTask?.subZoneId || '',
    collaboratorIds: editingTask?.collaborators?.map(c => c.userId) || []
  });
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createTask, updateTask } = useTaskStore();
  const zones = useZoneStore(state => state.zones);
  const users = useUserStore(state => state.users);
  const { designations, fetchDesignations } = useDesignationStore();

  useEffect(() => {
    fetchDesignations();
  }, [fetchDesignations]);

  const selectedZone = zones.find(zone => zone.id === formData.zoneId);
  const selectedDesignation = designations.find(d => d.id === formData.designationId);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    if (name === 'zoneId') {
      setFormData(prev => ({ ...prev, zoneId: value, subZoneId: '' }));
    }

    if (name === 'designationId') {
      const designation = designations.find(d => d.id === value);
      if (designation) {
        setFormData(prev => ({ ...prev, designationId: value, title: designation.title }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.designationId) {
      setError('Please select a task designation');
      return;
    }

    if (!formData.zoneId) {
      setError('Zone is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const taskData = {
        ...formData,
        description: formData.description.trim(),
        subZoneId: formData.subZoneId || undefined,
        deadlineDate: formData.hasDeadline ? formData.deadlineDate : undefined
      };

      if (editingTask) {
        await updateTask(editingTask.id, taskData);
      } else {
        await createTask(taskData);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            {editingTask ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <FormSection title="Task Information">
            <div>
              <label htmlFor="designationId" className="block text-sm font-medium text-gray-700 mb-1">
                Task Type *
              </label>
              <div className="relative">
                <ListChecks className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="designationId"
                  name="designationId"
                  value={formData.designationId}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  disabled={isSubmitting}
                  required
                >
                  <option value="">Select task type</option>
                  {designations.map(designation => (
                    <option key={designation.id} value={designation.id}>
                      {designation.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                readOnly
                className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Task description"
                disabled={isSubmitting}
              />
            </div>
          </FormSection>

          <FormSection title="Dates">
            <div>
              <label htmlFor="actionDate" className="block text-sm font-medium text-gray-700 mb-1">
                Action Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="actionDate"
                  name="actionDate"
                  type="date"
                  value={formData.actionDate}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="hasDeadline"
                    name="hasDeadline"
                    type="checkbox"
                    checked={formData.hasDeadline}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="hasDeadline" className="font-medium text-gray-700">
                    Has deadline
                  </label>
                </div>
              </div>

              {formData.hasDeadline && (
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="deadlineDate"
                    name="deadlineDate"
                    type="date"
                    value={formData.deadlineDate}
                    onChange={handleChange}
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    disabled={isSubmitting}
                    required={formData.hasDeadline}
                  />
                </div>
              )}
            </div>
          </FormSection>

          <FormSection title="Location">
            <div>
              <label htmlFor="zoneId" className="block text-sm font-medium text-gray-700 mb-1">
                Zone *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="zoneId"
                  name="zoneId"
                  value={formData.zoneId}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  disabled={isSubmitting}
                  required
                >
                  <option value="">Select a zone</option>
                  {zones.map(zone => (
                    <option key={zone.id} value={zone.id}>{zone.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedZone && selectedZone.subZones.length > 0 && (
              <div>
                <label htmlFor="subZoneId" className="block text-sm font-medium text-gray-700 mb-1">
                  Sub-zone
                </label>
                <div className="relative">
                  <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    id="subZoneId"
                    name="subZoneId"
                    value={formData.subZoneId}
                    onChange={handleChange}
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    disabled={isSubmitting}
                  >
                    <option value="">Select a sub-zone</option>
                    {selectedZone.subZones.map(subZone => (
                      <option key={subZone.id} value={subZone.id}>
                        {subZone.name} (Priority {subZone.priority})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </FormSection>

          <FormSection title="Collaborators">
            <div>
              <label htmlFor="collaboratorIds" className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Collaborators
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="collaboratorIds"
                  name="collaboratorIds"
                  multiple
                  value={formData.collaboratorIds}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData(prev => ({ ...prev, collaboratorIds: selectedOptions }));
                  }}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm min-h-[100px]"
                  disabled={isSubmitting}
                >
                  {users
                    .filter(user => user.role !== 'admin')
                    .map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Hold Ctrl (Cmd on Mac) to select multiple collaborators
              </p>
            </div>
          </FormSection>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (editingTask ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;