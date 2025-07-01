'use client';

import { Sidebar } from '@/app/_components/Sidebar';
import { Header } from '@/app/_components/Header';
import MapContainer from '@/features/map/components/MapContainer';

// マップページ
// レイアウトとメイン機能を組み合わせるだけ
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
        currentPath="/map"
      />

      {/* メインコンテンツエリア */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <Header title="マップ" />

        {/* マップ機能 */}
        <MapContainer />
      </div>
    </div>
  );
}