'use client';

import { Sidebar } from '@/app/_components/Sidebar';
import { Header } from '@/app/_components/Header';
import { VisitHistoryForm } from '@/features/visit-history/components/VisitHistoryForm';

export default function NewVisitHistoryPage() {
  const currentUser = {
    name: "ジョン・スミス", 
    email: "johnsmith@email.jp"
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* サイドバー */}
      <Sidebar 
        currentUser={currentUser}
        currentPath="/visit-history/new"
      />

      {/* メインコンテンツエリア */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ヘッダー */}
        <Header title="訪問履歴登録" />

        {/* ページコンテンツ */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <VisitHistoryForm />
          </div>
        </main>
      </div>
    </div>
  );
}