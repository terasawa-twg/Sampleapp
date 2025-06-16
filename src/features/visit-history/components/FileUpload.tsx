import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Upload } from 'lucide-react';
import type { UploadedFile } from '../types/index';

interface FileUploadProps {
  uploadedFiles: UploadedFile[];
  isDragOver: boolean;
  fileDescription: string;
  onFileDescription: (value: string) => void;
  onFileRemove: (fileId: string) => void;
  onFileInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnter: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
}

export const FileUpload = ({
  uploadedFiles,
  isDragOver,
  fileDescription,
  onFileDescription,
  onFileRemove,
  onFileInputChange,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
}: FileUploadProps) => {
  return (
    <div className="space-y-4">
      <Label>写真／ファイルのアップロード</Label>
      
      {/* ファイルドロップエリア */}
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="space-y-4">
          <Upload className={`mx-auto h-12 w-12 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
          <div>
            <p className={`${isDragOver ? 'text-blue-600' : 'text-gray-600'}`}>
              {isDragOver ? 'ファイルをドロップしてください' : 'ファイルをここにドラッグ&ドロップしてください'}
            </p>
          </div>
          
          {/* ファイル説明入力 */}
          <div className="max-w-md mx-auto">
            <Input
              type="text"
              value={fileDescription}
              onChange={(e) => onFileDescription(e.target.value)}
              placeholder="ファイルの説明を入力してください"
              className="text-sm"
            />
          </div>

          {/* ファイル選択ボタン */}
          <div>
            <input
              type="file"
              id="fileUpload"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={onFileInputChange}
              className="hidden"
            />
            <Label
              htmlFor="fileUpload"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              ファイルを選択
            </Label>
          </div>
        </div>
      </div>

      {/* アップロードされたファイル一覧 */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            アップロードされたファイル:
          </p>
          <div className="space-y-2">
            {uploadedFiles.map(file => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onFileRemove(file.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};