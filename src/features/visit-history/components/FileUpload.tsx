import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Upload } from 'lucide-react';
import type { UploadedFile } from '../types/index';

interface FileUploadProps {
  uploadedFiles: UploadedFile[];
  isDragOver: boolean;
  onFileRemove: (fileId: string) => void;
  onFileInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnter: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onFileDescriptionChange: (fileId: string, description: string) => void;
}

export const FileUpload = ({
  uploadedFiles,
  isDragOver,
  onFileRemove,
  onFileInputChange,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onFileDescriptionChange,
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
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700">
            アップロードされたファイル:
          </p>
          <div className="space-y-4">
            {uploadedFiles.map(file => (
              <div
                key={file.id}
                className="p-4 bg-gray-50 rounded-lg border"
              >
                {/* ファイル情報行 */}
                <div className="flex items-center justify-between mb-3">
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
                
                {/* ファイル説明入力 */}
                <div className="space-y-2">
                  <Label htmlFor={`file-desc-${file.id}`} className="text-xs text-gray-600">
                    ファイルの説明
                  </Label>
                  <Input
                    id={`file-desc-${file.id}`}
                    type="text"
                    value={file.description}
                    onChange={(e) => onFileDescriptionChange(file.id, e.target.value)}
                    placeholder="このファイルの説明を入力してください"
                    className="text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};