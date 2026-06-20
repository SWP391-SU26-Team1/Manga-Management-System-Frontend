import api from './api'

export interface UploadResponse {
  secure_url: string
  public_id: string
  resource_type: string
  format: string
}

export const uploadService = {
  /** POST /api/uploads/single - Tải một file lên Cloudinary */
  uploadSingle: async (file: File, folder?: string): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    if (folder) {
      formData.append('folder', folder)
    }

    const res = await api.post<{ success: boolean; data: UploadResponse }>('/api/uploads/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return res.data.data
  },
}

export default uploadService
