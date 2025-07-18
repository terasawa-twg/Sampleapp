// src/features/file-list/components/FileItem.tsx
// ファイル一覧のアイテムコンポーネント

import type { FileListItem } from "../types";
import { FileActions } from "./FileActions";
import { useState } from "react";
import Link from "next/link";

interface FileItemProps {
  file: FileListItem;
  onDownload: (photoId: number, filePath: string) => void;
  onDelete: (photoId: number) => void;
  isDeleting?: boolean;
}

export function FileItem({
  file,
  onDownload,
  onDelete,
  isDeleting,
}: FileItemProps) {
  const [imageError, setImageError] = useState(false);

  // ファイル名をパスから抽出
  const getFileName = (filePath: string) => {
    return filePath.split("/").pop() ?? filePath;
  };

  // 日付をフォーマット
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(date));
  };

  // ファイル拡張子から種類を判定
  const getFileType = (filePath: string) => {
    const ext = filePath.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return "PDF";
      case "docx":
      case "doc":
        return "Word文書";
      case "xlsx":
      case "xls":
        return "Excel文書";
      case "pptx":
      case "ppt":
        return "PowerPoint";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "画像ファイル";
      default:
        return "ドキュメント";
    }
  };

  // ファイルアイコンを表示（画像の場合はサムネイル風に）
  const renderFileIcon = (filePath: string) => {
    const ext = filePath.split(".").pop()?.toLowerCase();
    const isImage = ["jpg", "jpeg", "png", "gif"].includes(ext ?? "");

    if (isImage) {
      if (imageError) {
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded border bg-gray-200">
            <div className="text-xs text-gray-500">画像</div>
          </div>
        );
      }

      return (
        <div className="h-12 w-12 overflow-hidden rounded border bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={filePath}
            alt="サムネイル"
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
            style={{ display: imageError ? "none" : "block" }}
          />
        </div>
      );
    }
  };

    // アクションボタンのクリックイベントを止める
  const handleActionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Link href={`/history/${file.visit_id}`} className="block">
      <div className="rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md hover:border-gray-300 cursor-pointer">
        <div className="flex items-center gap-4">
          {/* ファイルアイコン/サムネイル */}
          {renderFileIcon(file.file_path)}

          {/* ファイル情報 */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-medium text-gray-900 group-hover:text-blue-600">
                  {getFileName(file.file_path)}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  メモ: {file.description || "なし"}
                </p>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  <span>{formatDate(file.visits.visit_date)}</span>
                  <span className="font-medium text-blue-600">
                    {file.visits.locations.name}
                  </span>
                  <span>{getFileType(file.file_path)}</span>
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  クリックして訪問履歴の詳細を表示
                </div>
              </div>

              {/* アクションボタン */}
              <div className="ml-4 flex-shrink-0" onClick={handleActionClick}>
                <FileActions
                  photoId={file.photo_id}
                  fileName={getFileName(file.file_path)}
                  filePath={file.file_path}
                  onDownload={onDownload}
                  onDelete={onDelete}
                  isDeleting={isDeleting}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}