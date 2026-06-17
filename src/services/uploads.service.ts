import api from '@/services/api'

export const uploadsService = {
  uploadSingle: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/api/uploads/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  uploadMultiple: async (files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    const response = await api.post('/api/uploads/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  delete: async (publicId: string) => {
    const response = await api.delete(`/api/uploads/${publicId}`)
    return response.data
  },
}
