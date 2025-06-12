'use client';

import Link from 'next/link';
import type { VisitWithDetails } from '@/features/visits/types';
import { useDeleteVisit } from '@/features/visits/hooks/useVisits';

interface VisitCardProps {
  visit: VisitWithDetails;
  index: number;
}

/**
 * 訪問履歴カードコンポーネント
 * - 訪問先での使用される簡潔なカード表示
 */
export const VisitCard = ({ visit, index }: VisitCardProps) => {
  const deleteVisit = useDeleteVisit();

  const handleDelete = async () => {
    if (window.confirm(`${visit.location.name}への訪問履歴を削除しますか？`)) {
      try {
        await deleteVisit.mutateAsync({ id: visit.id });
      } catch (error) {
        alert('削除に失敗しました。もう一度お試しください。');
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* ヘッダー部分 */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium text-gray-900">
            {index}. {visit.location.name}
          </span>
        </div>
      </div>

      {/* 訪問情報 */}
      <div className="text-sm text-gray-600 mb-4">
        <div>訪問日時: {formatDate(visit.visitDate)}</div>
        {visit.user && (
          <div>訪問者: {visit.user.name}</div>
        )}
      </div>

      {/* アクション部分 */}
      <div className="flex justify-between items-center">
        <Link 
          href={`/visits/${visit.id}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          詳細を見る
        </Link>
        
        <button
          onClick={handleDelete}
          disabled={deleteVisit.isPending}
          className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
        >
          {deleteVisit.isPending ? '削除中...' : '削除'}
        </button>
      </div>
    </div>
  );
};