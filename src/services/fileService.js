import api from '../config/axios';

export const fileService = {
  /**
   * Upload an image/file to S3 via backend endpoint
   * @param {File} file - The file object from input or dropzone
   * @param {string} folder - Target folder on S3 (e.g. 'diagnostics', 'avatars', 'prescriptions')
   * @returns {Promise<{ url: string, fileName: string, fileSize: number, contentType: string }>}
   */
  uploadFile: async (file, folder = 'diagnostics') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // The backend response format is: ApiResponse<FileUploadResponse> -> response.data.data
    return response.data?.data || response.data;
  },

  /**
   * Upload multiple files sequentially or in parallel
   * @param {FileList|File[]} files
   * @param {string} folder
   * @returns {Promise<Array<{ url: string, fileName: string, fileSize: number }>>}
   */
  uploadMultipleFiles: async (files, folder = 'diagnostics') => {
    const uploadPromises = Array.from(files).map((file) => fileService.uploadFile(file, folder));
    return await Promise.all(uploadPromises);
  },
};
