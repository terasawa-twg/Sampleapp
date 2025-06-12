'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useVisitDetails } from '@/features/visits/hooks/useVisitDetails';
import { useDeleteVisit } from '@/features/visits/hooks/useVisits';

interface VisitDetailsProps {
  visitId: number;
}

/**
 * 訪問履歴詳細ページのメインコンポーネント
 */
export const VisitDetails = ({ visitId }: VisitDetailsProps) => {
  const router = useRouter();
  const { visit, photos, isLoading, error } = useVisitDetails(visitId);
  const deleteVisit = useDeleteVisit();

  const handleDelete = async () => {
    if (window.confirm(`${visit?.locations?.name}への訪問履歴を削除しますか？`)) {
      try {
        await deleteVisit.mutateAsync({ id: visitId });
        router.push('/visits');
      } catch (error) {
        alert('削除に失敗しました。もう一度お試しください。');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">読み込み中...</span>
      </div>
    );
  }

  if (error || !visit) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <h3 className="font-bold mb-2">訪問履歴が見つかりません</h3>
        <p>指定された訪問履歴の詳細を取得できませんでした。</p>
        <Link 
          href="/visits"
          className="mt-2 inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          一覧に戻る
        </Link>
      </div>
    );
  }

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
    }).format(new Date(date));
  };

  // APIデータ構造に対応するための安全なアクセス
  const locationData = visit.locations;
  const userData = visit.users_visits_created_byTousers;
  const visitDate = visit.visit_date;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/visits"
            className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1"
          >
            ← 訪問履歴一覧
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">訪問履歴詳細</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/visits/${visitId}/edit`}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            修正
          </Link>
          <button 
            onClick={handleDelete}
            disabled={deleteVisit.isPending}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
          >
            {deleteVisit.isPending ? '削除中...' : '削除'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メイン情報 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 店舗情報 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {locationData?.name || '店舗名不明'}
            </h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="font-medium text-gray-700 w-20 flex-shrink-0">電話番号:</span>
                <span className="text-gray-900">未登録</span>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="font-medium text-gray-700 w-20 flex-shrink-0">郵便番号:</span>
                <span className="text-gray-900">100-0001</span>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="font-medium text-gray-700 w-20 flex-shrink-0">所在地:</span>
                <span className="text-gray-900">
                  {locationData?.address || '住所未登録'}
                </span>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="font-medium text-gray-700 w-20 flex-shrink-0">概要:</span>
                <span className="text-gray-900">
                  {locationData?.description || '概要は未登録です。'}
                </span>
              </div>
            </div>

            {/* 地図エリア */}
            <div className="mt-6">
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <span className="text-gray-500 text-lg">🗺️</span>
                  <p className="text-gray-500 mt-2">地図表示エリア</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Google Maps連携予定
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 履歴詳細 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">履歴詳細</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-700">日時:</span>
                <span className="text-gray-900">
                  {visitDate ? formatDate(visitDate) : '日時不明'}
                </span>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="font-medium text-gray-700">メモ:</span>
                <span className="text-gray-900">
                  {visit.notes || 'メモはありません'}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-700">評価点数:</span>
                <span className="text-gray-900">
                  {visit.rating ? (
                    <span className="inline-flex items-center gap-1">
                      {visit.rating}/10
                      <span className="text-yellow-500">
                        {'★'.repeat(Math.floor(visit.rating / 2))}
                      </span>
                    </span>
                  ) : '未評価'}
                </span>
              </div>
            </div>

            {/* ユーザー情報 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-700">ユーザー名:</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {userData?.username?.charAt(0) || userData?.username?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="text-gray-900">
                    {userData?.username || userData?.username || 'ユーザー不明'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* アップロードされたメディア */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">アップロードされたメディア</h3>
            
            {!photos || photos.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">📷</div>
                <p className="text-gray-500">アップロードされたメディアはありません</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.photo_id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={photo.file_path}
                        alt={`訪問時の写真 ${photo.description || ''}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  写真: {photos.length}枚のファイルがアップロードされています。
                </div>
              </>
            )}
          </div>
        </div>

        {/* サイドバー（訪問履歴） */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">訪問履歴</h3>
            
            <div className="space-y-3">
              <div className="text-sm">
                <div className="font-medium text-gray-700">2023年10月15日 14:30</div>
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-700">2023年10月16日 09:45</div>
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-700 bg-green-50 px-2 py-1 rounded">
                  {visitDate ? formatDate(visitDate) : '日時不明'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};