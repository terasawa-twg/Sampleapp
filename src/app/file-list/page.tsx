// src/app/file-list/page.tsx
// ファイル一覧ページ

"use client";

import { Header } from "@/app/_components/Header";
import { Sidebar } from "@/app/_components/Sidebar";
import { FileList } from "@/features/file-list/components/FileList";

// モックユーザーデータ（実際の実装では認証情報から取得）
const currentUser = {
  name: "ジョン・スミス",
  email: "johnsmith@email.com",
  avatar: undefined,
};

export default function FileListPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* サイドバー */}
      <Sidebar currentUser={currentUser} currentPath="/file-list" />

      {/* メインコンテンツ */}
      <div className="flex flex-1 flex-col">
        {/* ヘッダー */}
        <Header title="ファイル管理" />

        {/* ファイル一覧コンテンツ */}
        <main className="flex-1 overflow-hidden">
          <FileList />
        </main>
      </div>
    </div>
  );
}
