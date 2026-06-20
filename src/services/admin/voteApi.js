import api from '@/services/api'

const ADMIN_VOTES_ENDPOINT = '/api/admin/votes'

const unwrap = (payload) => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data
  }

  return payload
}

export const voteApi = {
  list: (params) => api.get(ADMIN_VOTES_ENDPOINT, { params }).then((response) => response.data),
  detail: (voteId) => api.get(`${ADMIN_VOTES_ENDPOINT}/${voteId}`).then((response) => unwrap(response.data)),
  update: (voteId, body) => api.patch(`${ADMIN_VOTES_ENDPOINT}/${voteId}`, body).then((response) => unwrap(response.data)),
  updateStatus: (voteId, status) =>
    api.patch(`${ADMIN_VOTES_ENDPOINT}/${voteId}/status`, { status }).then((response) => unwrap(response.data)),
  delete: (voteId) => api.delete(`${ADMIN_VOTES_ENDPOINT}/${voteId}`).then((response) => unwrap(response.data)),
}
