import api from './api'

export interface Manga {
  id: string
  title: string
  author: string
  genre: string
  status: string
  coverUrl?: string
  chapters: number
  views: number
  likes: number
}

export const mangaService = {
  getAll: async (): Promise<Manga[]> => {
    const response = await api.get<Manga[]>('/api/manga')
    return response.data
  },

  getById: async (id: string): Promise<Manga> => {
    const response = await api.get<Manga>(`/api/manga/${id}`)
    return response.data
  },
}

export default mangaService
