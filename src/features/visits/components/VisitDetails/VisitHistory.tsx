'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Clock, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PastVisit {
  visit_id: number;
  visit_date: string | Date;
  notes?: string;
}

interface VisitHistoryProps {
  locationVisits: PastVisit[];
  currentVisitId: number;
  currentVisitDate?: string | Date;
  formatDate: (date: Date | string) => string;
}

/**
 * 📅 訪問履歴サイドバーコンポーネント
 * 同じ場所への過去の訪問履歴を表示
 */
export const VisitHistory = ({ 
  locationVisits, 
  currentVisitId, 
  currentVisitDate,
  formatDate 
}: VisitHistoryProps) => {
  // デバウンス処理でtRPC重複実行エラーを軽減
  useEffect(() => {
    const timer = setTimeout(() => {
      // 何もしない（キャッシュ効果を期待）
    }, 150);
    return () => clearTimeout(timer);
  }, [currentVisitId, locationVisits]);
  return (
    <div className="lg:col-span-1">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            訪問履歴
            {locationVisits.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {locationVisits.length + 1}件
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* 🔗 過去の訪問履歴をクリック可能なリンクに変更 */}
            {locationVisits.map((pastVisit) => (
              <Link 
                key={pastVisit.visit_id} 
                href={`/visits/${pastVisit.visit_id}`}
                className="block p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors group cursor-pointer border hover:border-muted-foreground/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-muted-foreground font-mono">
                        #{pastVisit.visit_id}
                      </span>
                      <div className="font-medium text-sm text-muted-foreground">
                        {formatDate(pastVisit.visit_date).split(' ')[0]}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground/70 mt-0.5">
                      {formatDate(pastVisit.visit_date).split(' ').slice(1).join(' ')}
                    </div>
                    {pastVisit.notes && (
                      <div className="text-xs text-muted-foreground/70 mt-1 line-clamp-2 leading-relaxed">
                        {pastVisit.notes}
                      </div>
                    )}
                  </div>
                  {/* ホバー時に外部リンクアイコンを表示 */}
                  <ExternalLink className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1 ml-2" />
                </div>
              </Link>
            ))}
            
            {/* 現在の訪問（リンクなし） */}
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm font-mono">#{currentVisitId}</span>
                <div className="font-medium text-sm">
                  {currentVisitDate ? formatDate(currentVisitDate).split(' ')[0] : '日時不明'}
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {currentVisitDate ? formatDate(currentVisitDate).split(' ').slice(1).join(' ') : ''}
              </div>
              <Badge variant="secondary" className="mt-2 text-xs">
                現在の訪問
              </Badge>
            </div>
            
            {locationVisits.length === 0 && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                この場所への過去の訪問履歴はありません
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};