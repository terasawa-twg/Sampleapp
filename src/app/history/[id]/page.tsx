import { Header } from '@/app/_components/Header';
import { Sidebar } from '@/app/_components/Sidebar';
import { HistoryDetailClient } from './HistoryDetailClient';

interface HistoryDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * 訪問履歴詳細ページ (Server Component)
 * URL: /history/[id]
 * paramsの解決をServer Componentで行い、Client Componentに渡す
 */
export default async function HistoryDetailPage({ params }: HistoryDetailPageProps) {
  // Server Componentでparamsを解決
  const { id } = await params;
  const visitId = parseInt(id, 10);

  // ダッシュボードと同じユーザー情報を使用
  const currentUser = {
    name: "ジョン・スミス",
    email: "johnsmith@email.jp"
  };

  // 無効なIDの場合のエラー表示
  if (isNaN(visitId)) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar 
          currentUser={currentUser}
          currentPath="/history"
        />
        <div className="flex-1 flex flex-col min-w-0">
          <Header title="エラー" />
          <main className="flex-1 overflow-y-auto overflow-x-auto">
            <div className="max-w-6xl mx-auto p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <h3 className="font-bold mb-2">無効なIDです</h3>
                <p>訪問履歴のIDが正しくありません。</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Client Componentに必要なデータを渡す
  return (
    <HistoryDetailClient 
      visitId={visitId} 
      currentUser={currentUser} 
    />
  );
}