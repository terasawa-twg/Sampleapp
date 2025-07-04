import { VisitsList } from '@/features/history';

/**
 * 訪問履歴一覧ページ
 * URL: /visits
 */
export default function VisitsPage() {
  return (
    <div className="flex">
      {/* 既存のサイドバーとの連携 */}
      <main className="flex-1 min-h-screen bg-gray-50">
        <VisitsList />
      </main>
    </div>
  );
}

// ページのメタデータ
export const metadata = {
  title: '訪問履歴一覧 - VisitLogger',
  description: '登録した訪問履歴の一覧を表示します。',
};