import api from './api'

export interface Task {
  id: string
  title: string
  assignedTo: string
  layerType: string
  deadline: string
  priority: string
  status: string
  note: string
}

export const taskService = {
  getAll: async (): Promise<Task[]> => {
    const response = await api.get<Task[]>('/api/tasks')
    return response.data
  },

  create: async (task: Omit<Task, 'id' | 'status'>): Promise<Task> => {
    const response = await api.post<Task>('/api/tasks', task)
    return response.data
  },

  update: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const response = await api.patch<Task>(`/api/tasks/${id}`, updates)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/tasks/${id}`)
  },
}

export default taskService
