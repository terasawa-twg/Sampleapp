import type { UploadedFile } from '@/features/visit-history/types/index';

export interface FileUploadResult {
  fileName: string;
  filePath: string;
  originalName: string;
  size: number;
  mimeType: string;
  description: string;
}

export const fileService = {
  // ファイルをBase64に変換
  fileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // data:image/jpeg;base64, の部分を除去
        const base64Data = result.split(',')[1];
        resolve(base64Data || '');
      };
      reader.onerror = (error) => reject(error);
    });
  },

  // 複数ファイルをBase64に変換
  convertFilesToBase64: async (files: UploadedFile[]): Promise<FileUploadResult[]> => {
    const results: FileUploadResult[] = [];
    
    for (const uploadedFile of files) {
      try {
        const base64Data = await fileService.fileToBase64(uploadedFile.file);
        const fileName = `${Date.now()}_${uploadedFile.file.name}`;
        
        results.push({
          fileName,
          filePath: `/uploads/${fileName}`,
          originalName: uploadedFile.file.name,
          size: uploadedFile.file.size,
          mimeType: uploadedFile.file.type,
          description: uploadedFile.description, // ファイルごとの説明
        });
      } catch (error) {
        console.error(`ファイル変換エラー: ${uploadedFile.name}`, error);
        throw new Error(`ファイル "${uploadedFile.name}" の変換に失敗しました`);
      }
    }
    
    return results;
  },

  // ファイルごとの説明付きでアップロード
  uploadFilesWithDescriptions: async (files: UploadedFile[]): Promise<FileUploadResult[]> => {
    try {
      const fileData = await Promise.all(
        files.map(async (file) => ({
          name: file.file.name,
          size: file.file.size,
          type: file.file.type,
          description: file.description, // ファイルごとの説明
          base64Data: await fileService.fileToBase64(file.file),
        }))
      );

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: fileData,
        }),
      });

      if (!response.ok) {
        throw new Error(`ファイルアップロードエラー: ${response.status}`);
      }

      const result = await response.json();
      return result.files;
    } catch (error) {
      console.error('ファイルアップロードエラー:', error);
      throw error;
    }
  },

  // APIにファイルを送信
  uploadFiles: async (files: UploadedFile[], description: string): Promise<FileUploadResult[]> => {
    try {
      const fileData = await Promise.all(
        files.map(async (file) => ({
          name: file.file.name,
          size: file.file.size,
          type: file.file.type,
          base64Data: await fileService.fileToBase64(file.file),
        }))
      );

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: fileData,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error(`ファイルアップロードエラー: ${response.status}`);
      }

      const result = await response.json();
      return result.files;
    } catch (error) {
      console.error('ファイルアップロードエラー:', error);
      throw error;
    }
  },
};