import React, { useState, useEffect } from 'react';
import { X, ListChecks, MapPin, Calendar, Users, Flag, Clock } from 'lucide-react';
import { Routine } from '../../types';
import { useRoutineStore } from '../../store/routineStore';
import { useZoneStore } from '../../store/zoneStore';
import { useUserStore } from '../../store/userStore';
import { useDesignationStore } from '../../store/designationStore';
import FormSection from '../shared/FormSection';

interface RoutineFormProps {
  onClose: () => void;
  editingRoutine?: Routine;
}

const RoutineForm: React.FC<RoutineFormProps> = ({ onClose, editingRoutine }) => {
  const [formData, setFormData] = useState({
    designationId: editingRoutine?.designationId || '',
    title: editingRoutine?.title || '',
    description: editingRoutine?.description || '',
    frequency: editingRoutine?.frequency || 'weekly',
    customInterval: editingRoutine?.customInterval || 1,
    startDate: editingRoutine?.nextExecution?.split('T')[0] || new Date().toISOString().split('T')[0],
    zoneId: editingRoutine?.zoneId || '',
    subZoneId: editingRoutine?.subZoneId || '',
    assignedUserIds: editingRoutine?.routineConfig?.assignedUsers || []
  });
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createRoutine, updateRoutine } = useRoutineStore();
  const zones = useZoneStore(state => state.zones);
  const users = useUserStore(state => state.users);
  const { designations, fetchDesignations } = useDesignationStore();

  useEffect(() => {
    fetchDesignations();
  }, [fetchDesignations]);

  const selectedZone = zones.find(zone => zone.id === formData.zoneId);
  const selectedDesignation = designations.find(d => d.id === formData.designationId);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'customInterval' ? parseInt(value) || 1 : value
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
      setError('Please select a routine designation');
      return;
    }

    if (!formData.zoneId) {
      setError('Zone is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const routineData = {
        ...formData,
        description: formData.description.trim(),
        subZoneId: formData.subZoneId || undefined,
        routineConfig: {
          frequency: formData.frequency,
          customInterval: formData.frequency === 'custom' ? formData.customInterval : undefined,
          assignedUsers: formData.assignedUserIds
        }
      };

      if (editingRoutine) {
        await updateRoutine(editingRoutine.id, routineData);
      } else {
        await createRoutine(routineData);
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
            {editingRoutine ? 'Edit Routine' : 'New Routine'}
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

          <FormSection title="Routine Information">
            <div>
              <label htmlFor="designationId" className="block text-sm font-medium text-gray-700 mb-1">
                Routine Type *
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
                  <option value="">Select routine type</option>
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
                placeholder="Routine description"
                disabled={isSubmitting}
              />
            </div>
          </FormSection>

          <FormSection title="Schedule">
            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                Frequency *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  disabled={isSubmitting}
                  required
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            {formData.frequency === 'custom' && (
              <div>
                <label htmlFor="customInterval" className="block text-sm font-medium text-gray-700 mb-1">
                  Interval (days) *
                </label>
                <input
                  id="customInterval"
                  name="customInterval"
                  type="number"
                  min="1"
                  value={formData.customInterval}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  disabled={isSubmitting}
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  disabled={isSubmitting}
                  required
                />
              </div>
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
              <label htmlFor="assignedUserIds" className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Collaborators
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="assignedUserIds"
                  name="assignedUserIds"
                  multiple
                  value={formData.assignedUserIds}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData(prev => ({ ...prev, assignedUserIds: selectedOptions }));
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
              {isSubmitting ? 'Saving...' : (editingRoutine ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoutineForm;