// app/dashboard/page.tsx（地図付き）
'use client';

import { Sidebar } from '@/app/_components/Sidebar';
import { Header } from '@/app/_components/Header';
import { Calendar } from '@/app/_components/Calendar';
import GeoloniaMap from '@/app/_components/GeoloniaMap';

export default function DashboardPage() {
  const currentUser = {
    name: "ジョン・スミス", 
    email: "johnsmith@email.jp"
  };

  // カレンダーの日付が選択されたときの処理
  const handleDateSelect = (date: Date) => {
    console.log('選択された日付:', date);
    // ここで選択された日付に応じた処理を追加できます
    // 例：その日の訪問予定を表示、訪問履歴をフィルタリングなど
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* サイドバー */}
      <Sidebar 
        currentUser={currentUser}
        currentPath="/dashboard"
      />

      {/* メインコンテンツエリア */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <Header title="ダッシュボード" />

        {/* ページコンテンツ */}
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* ページタイトル */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
              <p className="text-gray-600">VisitLoggerのメインダッシュボードへようこそ</p>
            </div>

            {/* 2段レイアウト */}
            <div className="space-y-6">
              {/* 上段: カレンダーと最近の活動を横並び */}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* カレンダー（固定幅320px） */}
                <div className="w-80 flex-shrink-0">
                  <Calendar onDateSelect={handleDateSelect} />
                </div>

                {/* 最近の活動（可変幅） */}
                <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">最近の活動</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">2025年5月1日 13:00 - ABC商店を訪問</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">2025年5月1日 13:00 - 株式会社サンプルを訪問</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">2025年5月1日 13:00 - いろはマートを訪問</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">2025年4月30日 15:30 - デパート田中を訪問</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">2025年4月30日 10:00 - 山田商店を訪問</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 下段: 地図（可変幅） */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">地図</h2>
                </div>
                <div className="h-96">
                  <GeoloniaMap />
                </div>
              </div>
            </div>


          </div>
        </main>
      </div>
    </div>
  );
}