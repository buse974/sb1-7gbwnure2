import React, { useState } from 'react';
import { X, MapPin, Plus, Trash2, Flag } from 'lucide-react';
import { Zone, SubZone } from '../../types';
import { useZoneStore } from '../../store/zoneStore';

interface ZoneFormProps {
  onClose: () => void;
  editingZone?: Zone;
}

const PRESET_COLORS = [
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#FFC107', // Yellow
  '#9C27B0', // Purple
  '#F44336', // Red
  '#FF9800', // Orange
  '#795548', // Brown
  '#607D8B', // Blue Grey
];

const ZoneForm: React.FC<ZoneFormProps> = ({ onClose, editingZone }) => {
  const [formData, setFormData] = useState({
    name: editingZone?.name || '',
    description: editingZone?.description || '',
    color: editingZone?.color || PRESET_COLORS[0],
    subZones: editingZone?.subZones || []
  });
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const { createZone, updateZone } = useZoneStore();

  const handleAddSubZone = () => {
    setFormData(prev => ({
      ...prev,
      subZones: [
        ...prev.subZones,
        {
          id: crypto.randomUUID(),
          zoneId: editingZone?.id || '',
          name: '',
          priority: 2
        }
      ]
    }));
  };

  const handleRemoveSubZone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subZones: prev.subZones.filter((_, i) => i !== index)
    }));
  };

  const handleSubZoneChange = (index: number, field: keyof SubZone, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      subZones: prev.subZones.map((sz, i) => 
        i === index ? { ...sz, [field]: field === 'priority' ? Number(value) : value } : sz
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Le nom est requis');
      return;
    }

    // Validate sub-zones
    const invalidSubZones = formData.subZones.some(sz => !sz.name.trim());
    if (invalidSubZones) {
      setError('Le nom est requis pour toutes les sous-zones');
      return;
    }

    setIsSubmitting(true);
    try {
      const zoneData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        subZones: formData.subZones.map(sz => ({
          ...sz,
          name: sz.name.trim(),
          priority: Number(sz.priority)
        }))
      };

      if (editingZone) {
        await updateZone(editingZone.id, zoneData);
      } else {
        await createZone(zoneData);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            {editingZone ? 'Modifier la Zone' : 'Nouvelle Zone'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Nom de la zone"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Description de la zone (optionnel)"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Couleur *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-full px-3 py-2 flex items-center rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <div
                  className="w-6 h-6 rounded-full mr-2"
                  style={{ backgroundColor: formData.color }}
                />
                <span className="text-sm text-gray-700">{formData.color}</span>
              </button>

              {showColorPicker && (
                <div className="absolute z-10 mt-2 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, color }));
                          setShowColorPicker(false);
                        }}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-green-500' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Personnalisé
                    </label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="block w-full h-10 rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Sous-zones
              </label>
              <button
                type="button"
                onClick={handleAddSubZone}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Ajouter
              </button>
            </div>

            <div className="space-y-4">
              {formData.subZones.map((subZone, index) => (
                <div key={index} className="relative p-4 bg-gray-50 rounded-lg">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom *
                      </label>
                      <div className="relative">
                        <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={subZone.name}
                          onChange={(e) => handleSubZoneChange(index, 'name', e.target.value)}
                          className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          placeholder="Nom de la sous-zone"
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                    </div>

                    <div className="w-32">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priorité *
                      </label>
                      <select
                        value={subZone.priority}
                        onChange={(e) => handleSubZoneChange(index, 'priority', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        disabled={isSubmitting}
                      >
                        <option value={1}>1 - Haute</option>
                        <option value={2}>2 - Moyenne</option>
                        <option value={3}>3 - Basse</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSubZone(index)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {formData.subZones.length === 0 && (
                <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Flag className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm font-medium text-gray-900">Aucune sous-zone</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Commencez par ajouter une sous-zone
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : (editingZone ? 'Mettre à jour' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ZoneForm;