'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { VisitFilters } from '@/features/visits/types';

interface VisitFiltersProps {
  onFiltersChange: (filters: VisitFilters) => void;
  filters: VisitFilters;
}

/**
 * 訪問履歴の検索・フィルターコンポーネント
 */
export const VisitFiltersComponent = ({ onFiltersChange, filters }: VisitFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLocationNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      locationName: e.target.value || undefined,
    });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      startDate: e.target.value ? new Date(e.target.value) : undefined,
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      endDate: e.target.value ? new Date(e.target.value) : undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const formatDateForInput = (date?: Date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      {/* 検索フィールド */}
      <div className="flex gap-4 items-center mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="訪問先名で検索"
            value={filters.locationName || ''}
            onChange={handleLocationNameChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <Link
          href="/visits/new"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          訪問履歴を登録する
        </Link>
      </div>

      {/* フィルター展開ボタン */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
      >
        {isExpanded ? '▼' : '▶'} 詳細フィルター
      </button>

      {/* フィルター展開エリア */}
      {isExpanded && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">フィルター</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 市区町村フィルター（将来実装） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                市区町村
              </label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled
              >
                <option value="">全て（実装予定）</option>
              </select>
            </div>

            {/* 自由項目（将来実装） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                自由項目
              </label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled
              >
                <option value="">選択してください（実装予定）</option>
              </select>
            </div>

            {/* 空のスペース */}
            <div></div>
          </div>

          {/* 日付フィルター */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                開始日
              </label>
              <input
                type="date"
                value={formatDateForInput(filters.startDate)}
                onChange={handleStartDateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                終了日
              </label>
              <input
                type="date"
                value={formatDateForInput(filters.endDate)}
                onChange={handleEndDateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* フィルタークリアボタン */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              フィルターをクリア
            </button>
          </div>
        </div>
      )}
    </div>
  );
};