import { create } from 'zustand';
import { Zone } from '../types';
import { zoneRepository } from '../db/repositories/zoneRepository';

interface ZoneState {
  zones: Zone[];
  isLoading: boolean;
  error: string | null;
  fetchZones: () => Promise<void>;
  createZone: (zone: Partial<Zone>) => Promise<void>;
  updateZone: (id: string, updates: Partial<Zone>) => Promise<void>;
  deleteZone: (id: string) => Promise<void>;
}

export const useZoneStore = create<ZoneState>((set) => ({
  zones: [],
  isLoading: false,
  error: null,

  fetchZones: async () => {
    set({ isLoading: true, error: null });
    try {
      const zones = await zoneRepository.getAll();
      set({ zones, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load zones';
      set({ error: errorMessage, isLoading: false, zones: [] });
    }
  },

  createZone: async (zoneData) => {
    set({ isLoading: true, error: null });
    try {
      if (!zoneData.name?.trim()) {
        throw new Error('Zone name is required');
      }
      if (!zoneData.color?.trim()) {
        throw new Error('Zone color is required');
      }

      const newZone = await zoneRepository.create(zoneData);
      set(state => ({
        zones: [...state.zones, newZone],
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create zone';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateZone: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedZone = await zoneRepository.update(id, updates);
      set(state => ({
        zones: state.zones.map(zone => zone.id === id ? updatedZone : zone),
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update zone';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteZone: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await zoneRepository.delete(id);
      set(state => ({
        zones: state.zones.filter(zone => zone.id !== id),
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete zone';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  }
}));