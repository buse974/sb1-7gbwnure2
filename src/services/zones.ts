import api from './api'
import { Zone } from '../types'

export const zonesApi = {
  getAll: async () => {
    const response = await api.get<Zone[]>('/zones')
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get<Zone>(`/zones/${id}`)
    return response.data
  },

  create: async (data: Partial<Zone>) => {
    const response = await api.post<Zone>('/zones', data)
    return response.data
  },

  update: async (id: string, data: Partial<Zone>) => {
    const response = await api.put<Zone>(`/zones/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    await api.delete(`/zones/${id}`)
  }
}