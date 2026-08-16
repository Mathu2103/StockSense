import { api } from './axiosInstance';

export interface UploadResponse {
  success: boolean;
  message?: string;
  url: string;
  publicId?: string;
  format?: string;
  bytes?: number;
}

export const UploadService = {
  uploadImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);

    const res = await api.post<UploadResponse>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data;
  },
};
