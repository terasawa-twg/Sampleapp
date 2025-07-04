'use client'
import { usePathname } from 'next/navigation';
// 🔧 既存の _components を直接使用
import { Header } from '@/app/_components/Header';
import { Sidebar } from '@/app/_components/Sidebar';
import { VisitsList } from '@/features/history';

/**
 * 訪問履歴一覧ページ
 * URL: /history
 * 既存のダッシュボードと同じレイアウト構造を使用
 */
export default function HistoryPage() {
  const pathname = usePathname();
  
  // ダッシュボードと同じユーザー情報を使用
  const currentUser = {
    name: "ジョン・スミス",
    email: "johnsmith@email.jp"
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* サイドバー（ダッシュボードと同じコンポーネント） */}
      <Sidebar 
        currentUser={currentUser}
        currentPath={pathname}
      />

      {/* メインコンテンツエリア（ダッシュボードと同じ構造） */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ヘッダー（ダッシュボードと同じコンポーネント） */}
        <Header title="訪問履歴一覧" />

        {/* ページコンテンツ */}
        <main className="flex-1 overflow-y-auto overflow-x-auto">
          <VisitsList />
        </main>
      </div>
    </div>
  );
}