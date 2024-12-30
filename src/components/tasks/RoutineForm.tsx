import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Clock, Users, Calendar, ListChecks, MapPin, Flag } from 'lucide-react';
import { Task, RoutineFrequency, User } from '../../types';
import { addDays, addWeeks, addMonths, format, startOfDay, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useZoneStore } from '../../store/zoneStore';
import { useDesignationStore } from '../../store/designationStore';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

registerLocale('fr', fr);

interface RoutineFormProps {
  onClose: () => void;
  onSubmit: (routineConfig: Task['routineConfig'], taskData: Partial<Task>) => void;
  users: User[];
}

type Step = 'basic' | 'frequency' | 'location' | 'collaborators' | 'review';

const RoutineForm: React.FC<RoutineFormProps> = ({ onClose, onSubmit, users }) => {
  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [designationId, setDesignationId] = useState('');
  const [frequency, setFrequency] = useState<RoutineFrequency>('daily');
  const [customInterval, setCustomInterval] = useState(1);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [zoneId, setZoneId] = useState('');
  const [subZoneId, setSubZoneId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const zones = useZoneStore(state => state.zones);
  const designations = useDesignationStore(state => state.designations);

  const getNextExecutionDate = (baseDate: Date = new Date()) => {
    const base = startOfDay(baseDate);
    
    switch (frequency) {
      case 'daily':
        return addDays(base, 1);
      case 'weekly':
        return addWeeks(base, 1);
      case 'monthly':
        return addMonths(base, 1);
      case 'custom':
        return addDays(base, customInterval);
    }
  };

  const validateBasic = () => {
    const newErrors: Record<string, string> = {};
    
    if (!designationId) {
      newErrors.designationId = 'La désignation est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateFrequency = () => {
    const newErrors: Record<string, string> = {};

    if (!startDate) {
      newErrors.startDate = 'La date de début est requise';
    } else if (isBefore(startDate, startOfDay(new Date()))) {
      newErrors.startDate = 'La date de début ne peut pas être dans le passé';
    }

    if (frequency === 'custom' && (customInterval < 1 || customInterval > 365)) {
      newErrors.customInterval = 'L\'intervalle doit être entre 1 et 365 jours';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLocation = () => {
    const newErrors: Record<string, string> = {};
    
    if (!zoneId) {
      newErrors.zoneId = 'La zone est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCollaborators = () => {
    const newErrors: Record<string, string> = {};

    if (selectedUsers.length === 0) {
      newErrors.users = 'Sélectionnez au moins un collaborateur';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'basic':
        if (validateBasic()) setCurrentStep('frequency');
        break;
      case 'frequency':
        if (validateFrequency()) setCurrentStep('location');
        break;
      case 'location':
        if (validateLocation()) setCurrentStep('collaborators');
        break;
      case 'collaborators':
        if (validateCollaborators()) setCurrentStep('review');
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'frequency':
        setCurrentStep('basic');
        break;
      case 'location':
        setCurrentStep('frequency');
        break;
      case 'collaborators':
        setCurrentStep('location');
        break;
      case 'review':
        setCurrentStep('collaborators');
        break;
    }
  };

  const handleSubmit = () => {
    if (!validateBasic() || !validateFrequency() || !validateLocation() || !validateCollaborators() || !startDate) {
      return;
    }

    const routineConfig = {
      frequency,
      assignedUsers: selectedUsers,
      customInterval: frequency === 'custom' ? customInterval : undefined,
      nextGeneration: getNextExecutionDate(startDate).toISOString()
    };

    const taskData = {
      title: designations.find(d => d.id === designationId)?.title || '',
      designationId,
      description,
      zoneId,
      subZoneId: subZoneId || undefined,
      actionDate: startDate.toISOString(),
      hasDeadline: false
    };

    onSubmit(routineConfig, taskData);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {(['basic', 'frequency', 'location', 'collaborators', 'review'] as Step[]).map((step, index) => (
          <React.Fragment key={step}>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 
                ${currentStep === step 
                  ? 'border-purple-500 bg-purple-50 text-purple-600' 
                  : currentStep === 'review' && index < 4
                    ? 'border-purple-500 bg-purple-500 text-white'
                    : 'border-gray-300 text-gray-500'
                }`}
            >
              {index + 1}
            </div>
            {index < 4 && (
              <div 
                className={`w-12 h-0.5 ${
                  currentStep === 'review' || 
                  (index === 0 && currentStep === 'frequency') ||
                  (index === 1 && currentStep === 'location') ||
                  (index === 2 && currentStep === 'collaborators')
                    ? 'bg-purple-500'
                    : 'bg-gray-300'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Désignation *
        </label>
        <div className="relative">
          <ListChecks className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={designationId}
            onChange={(e) => setDesignationId(e.target.value)}
            className={`pl-10 block w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm
              ${errors.designationId ? 'border-red-300' : 'border-gray-300'}`}
          >
            <option value="">Sélectionner une désignation</option>
            {designations.map(designation => (
              <option key={designation.id} value={designation.id}>
                {designation.title}
              </option>
            ))}
          </select>
        </div>
        {errors.designationId && (
          <p className="mt-1 text-sm text-red-600">{errors.designationId}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          placeholder="Description optionnelle de la routine..."
        />
      </div>
    </div>
  );

  const renderFrequency = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date de début *
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="dd/MM/yyyy"
            locale="fr"
            minDate={new Date()}
            customInput={
              <input
                className={`pl-10 block w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm
                  ${errors.startDate ? 'border-red-300' : 'border-gray-300'}`}
              />
            }
          />
        </div>
        {errors.startDate && (
          <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fréquence *
        </label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as RoutineFrequency)}
            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          >
            <option value="daily">Quotidienne</option>
            <option value="weekly">Hebdomadaire</option>
            <option value="monthly">Mensuelle</option>
            <option value="custom">Personnalisée</option>
          </select>
        </div>
      </div>

      {frequency === 'custom' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Intervalle (jours) *
          </label>
          <input
            type="number"
            min="1"
            max="365"
            value={customInterval}
            onChange={(e) => setCustomInterval(parseInt(e.target.value))}
            className={`block w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm
              ${errors.customInterval ? 'border-red-300' : 'border-gray-300'}`}
          />
          {errors.customInterval && (
            <p className="mt-1 text-sm text-red-600">{errors.customInterval}</p>
          )}
        </div>
      )}

      {startDate && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prochaine exécution
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <div className="pl-10 py-2 block w-full rounded-md border border-gray-300 bg-gray-50 text-sm text-gray-500">
              {format(getNextExecutionDate(startDate), 'PPP', { locale: fr })}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderLocation = () => {
    const selectedZone = zones.find(zone => zone.id === zoneId);

    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zone *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={zoneId}
              onChange={(e) => {
                setZoneId(e.target.value);
                setSubZoneId('');
              }}
              className={`pl-10 block w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm
                ${errors.zoneId ? 'border-red-300' : 'border-gray-300'}`}
            >
              <option value="">Sélectionner une zone</option>
              {zones.map(zone => (
                <option key={zone.id} value={zone.id}>{zone.name}</option>
              ))}
            </select>
          </div>
          {errors.zoneId && (
            <p className="mt-1 text-sm text-red-600">{errors.zoneId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sous-zone
          </label>
          <div className="relative">
            <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={subZoneId}
              onChange={(e) => setSubZoneId(e.target.value)}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              disabled={!selectedZone || selectedZone.subZones.length === 0}
            >
              <option value="">Sélectionner une sous-zone</option>
              {selectedZone?.subZones.map(subZone => (
                <option key={subZone.id} value={subZone.id}>
                  {subZone.name} (Priorité {subZone.priority})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  };

  const renderCollaborators = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Collaborateurs assignés *
        </label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            multiple
            value={selectedUsers}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              setSelectedUsers(values);
            }}
            className={`pl-10 block w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm min-h-[200px]
              ${errors.users ? 'border-red-300' : 'border-gray-300'}`}
          >
            {users
              .filter(user => user.role !== 'admin')
              .map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
          </select>
        </div>
        {errors.users && (
          <p className="mt-1 text-sm text-red-600">{errors.users}</p>
        )}
        <p className="mt-2 text-sm text-gray-500">
          Maintenez Ctrl (Cmd sur Mac) pour sélectionner plusieurs collaborateurs
        </p>
      </div>

      {selectedUsers.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Collaborateurs sélectionnés ({selectedUsers.length})
          </h4>
          <ul className="space-y-2">
            {selectedUsers.map(userId => {
              const user = users.find(u => u.id === userId);
              return (
                <li key={userId} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                    <span className="text-sm text-gray-500 ml-2">{user?.email}</span>
                  </div>
                  <button
                    onClick={() => setSelectedUsers(prev => prev.filter(id => id !== userId))}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );

  const renderReview = () => {
    const designation = designations.find(d => d.id === designationId);
    const zone = zones.find(z => z.id === zoneId);
    const subZone = zone?.subZones.find(sz => sz.id === subZoneId);

    return (
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Informations de Base</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-500 w-24">Désignation:</span>
              <span className="text-sm text-gray-900">{designation?.title}</span>
            </div>
            {description && (
              <div className="flex items-start">
                <span className="text-sm font-medium text-gray-500 w-24">Description:</span>
                <span className="text-sm text-gray-900">{description}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Configuration</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-500 w-24">Début:</span>
              <span className="text-sm text-gray-900">
                {startDate ? format(startDate, 'PPP', { locale: fr }) : 'Non défini'}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-500 w-24">Fréquence:</span>
              <span className="text-sm text-gray-900">
                {frequency === 'daily' && 'Quotidienne'}
                {frequency === 'weekly' && 'Hebdomadaire'}
                {frequency === 'monthly' && 'Mensuelle'}
                {frequency === 'custom' && `Tous les ${customInterval} jours`}
              </span>
            </div>
            {startDate && (
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 w-24">Prochaine:</span>
                <span className="text-sm text-gray-900">
                  {format(getNextExecutionDate(startDate), 'PPP', { locale: fr })}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Localisation</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-500 w-24">Zone:</span>
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: zone?.color }}
                />
                <span className="text-sm text-gray-900">{zone?.name}</span>
              </div>
            </div>
            {subZone && (
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 w-24">Sous-zone:</span>
                <div className="flex items-center">
                  <span className="text-sm text-gray-900">{subZone.name}</span>
                  <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    subZone.priority === 1 ? 'bg-red-100 text-red-800' :
                    subZone.priority === 2 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    Priorité {subZone.priority}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Collaborateurs ({selectedUsers.length})
          </h3>
          <div className="space-y-2">
            {selectedUsers.map(userId => {
              const user = users.find(u => u.id === userId);
              return (
                <div key={userId} className="flex items-center">
                  <span className="text-sm text-gray-900">{user?.name}</span>
                  <span className="text-sm text-gray-500 ml-2">{user?.email}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Créer une Routine</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {renderStepIndicator()}

        <div className="mb-8">
          {currentStep === 'basic' && renderBasicInfo()}
          {currentStep === 'frequency' && renderFrequency()}
          {currentStep === 'location' && renderLocation()}
          {currentStep === 'collaborators' && renderCollaborators()}
          {currentStep === 'review' && renderReview()}
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleBack}
            className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
              currentStep === 'basic' ? 'invisible' : ''
            }`}
          >
            <ChevronLeft className="h-4 w-4 mr-1.5" />
            Retour
          </button>

          <button
            type="button"
            onClick={currentStep === 'review' ? handleSubmit : handleNext}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
          >
            {currentStep === 'review' ? (
              'Créer la Routine'
            ) : (
              <>
                Suivant
                <ChevronRight className="h-4 w-4 ml-1.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoutineForm;