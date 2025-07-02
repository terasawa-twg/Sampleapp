// src/features/file-list/components/FileActions.tsx
// ファイル一覧のアクションボタンコンポーネント

import { Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface FileActionsProps {
  photoId: number;
  fileName: string;
  filePath: string;
  onDownload: (photoId: number, filePath: string) => void;
  onDelete: (photoId: number) => void;
  isDeleting?: boolean;
}

export function FileActions({ 
  photoId, 
  fileName, 
  filePath, 
  onDownload, 
  onDelete, 
  isDeleting = false 
}: FileActionsProps) {
  const handleDownload = () => {
    onDownload(photoId, filePath);
  };

  const handleDelete = () => {
    onDelete(photoId);
  };

  return (
    <div className="flex gap-2">
      {/* ダウンロードボタン */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        className="bg-red-500 text-white hover:bg-red-600 border-red-500"
      >
        <Download className="h-4 w-4 mr-1" />
        ダウンロード
      </Button>

      {/* 削除ボタン */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isDeleting}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            削除
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ファイルを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              「{fileName}」を削除します。この操作は取り消すことができません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? '削除中...' : '削除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}