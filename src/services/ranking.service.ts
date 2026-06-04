import api from './api'

export interface RankingEntry {
  rank: number
  seriesId: string
  title: string
  author: string
  views: number
  likes: number
  comments: number
  score: number
  trend: 'up' | 'down' | 'stable'
}

export const rankingService = {
  getWeekly: async (): Promise<RankingEntry[]> => {
    const response = await api.get<RankingEntry[]>('/api/ranking')
    return response.data
  },
}

export default rankingService
