import api from '@/services/api'

const ADMIN_REVIEW_SESSIONS_ENDPOINT = '/api/admin/review-sessions'
const REVIEW_SESSIONS_ENDPOINT = '/api/review-sessions'
const BOARD_REVIEW_SESSIONS_ENDPOINT = '/api/board/review-sessions'
const SERIES_ENDPOINT = '/api/series'
const CHAPTERS_ENDPOINT = '/api/chapters'

const unwrap = (payload) => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data
  }

  return payload
}

export const reviewSessionApi = {
  list: (params) => api.get(ADMIN_REVIEW_SESSIONS_ENDPOINT, { params }).then((response) => response.data),
  detail: (sessionId) =>
    api.get(`${ADMIN_REVIEW_SESSIONS_ENDPOINT}/${sessionId}`).then((response) => unwrap(response.data)),
  create: (body) => {
    const seriesId = body.series_id || body.seriesId
    const chapterId = body.chapter_id || body.chapterId
    const payload = {
      status: 'pending',
      ...body,
      series_id: seriesId,
      seriesId,
      chapter_id: chapterId || undefined,
      chapterId: chapterId || undefined,
    }

    return api.post(ADMIN_REVIEW_SESSIONS_ENDPOINT, payload).then((response) => unwrap(response.data))
  },
  update: (sessionId, body) =>
    api.patch(`${REVIEW_SESSIONS_ENDPOINT}/${sessionId}`, body).then((response) => unwrap(response.data)),
  updateStatus: (sessionId, status) =>
    api.patch(`${REVIEW_SESSIONS_ENDPOINT}/${sessionId}/status`, { status }).then((response) => unwrap(response.data)),
  delete: (sessionId) => api.delete(`${ADMIN_REVIEW_SESSIONS_ENDPOINT}/${sessionId}`).then((response) => unwrap(response.data)),
  start: (sessionId) => api.patch(`${REVIEW_SESSIONS_ENDPOINT}/${sessionId}/start`).then((response) => unwrap(response.data)),
  pause: (sessionId) => api.patch(`${REVIEW_SESSIONS_ENDPOINT}/${sessionId}/pause`).then((response) => unwrap(response.data)),
  complete: (sessionId) => api.patch(`${REVIEW_SESSIONS_ENDPOINT}/${sessionId}/complete`).then((response) => unwrap(response.data)),
  finish: (sessionId) => api.patch(`${REVIEW_SESSIONS_ENDPOINT}/${sessionId}/finish`).then((response) => unwrap(response.data)),
  cancel: (sessionId) => api.patch(`${REVIEW_SESSIONS_ENDPOINT}/${sessionId}/cancel`).then((response) => unwrap(response.data)),
  getVotes: (sessionId) => api.get(`${REVIEW_SESSIONS_ENDPOINT}/${sessionId}/votes`).then((response) => unwrap(response.data)),
  createVote: (sessionId, body) =>
    api.post(`${REVIEW_SESSIONS_ENDPOINT}/${sessionId}/votes`, body).then((response) => unwrap(response.data)),
  processResult: (sessionId) =>
    api.post(`${BOARD_REVIEW_SESSIONS_ENDPOINT}/${sessionId}/process-result`).then((response) => unwrap(response.data)),
  searchSeries: (keyword) =>
    api.get(SERIES_ENDPOINT, { params: { keyword, page: 1, limit: 8 } }).then((response) => unwrap(response.data)),
  searchChapters: (keyword, seriesId) =>
    api
      .get(CHAPTERS_ENDPOINT, {
        params: {
          keyword,
          series_id: seriesId || undefined,
          seriesId: seriesId || undefined,
          series: seriesId || undefined,
          page: 1,
          limit: 20,
        },
      })
      .then((response) => unwrap(response.data)),
}
