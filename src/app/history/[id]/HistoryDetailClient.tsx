'use client'
import { usePathname } from 'next/navigation';
// 🔧 既存の _components を直接使用
import { Header } from '@/app/_components/Header';
import { Sidebar } from '@/app/_components/Sidebar';
import { VisitDetails } from '@/features/history';

interface HistoryDetailClientProps {
  visitId: number;
  currentUser: {
    name: string;
    email: string;
  };
}

/**
 * 訪問履歴詳細ページ (Client Component)
 * usePathnameなどのhooksを使用するためClient Componentとして分離
 */
export function HistoryDetailClient({ 
  visitId, 
  currentUser 
}: HistoryDetailClientProps) {
  const pathname = usePathname();

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
        <Header title="訪問履歴詳細" />

        {/* ページコンテンツ */}
        <main className="flex-1 overflow-y-auto overflow-x-auto">
          <VisitDetails visitId={visitId} />
        </main>
      </div>
    </div>
  );
}