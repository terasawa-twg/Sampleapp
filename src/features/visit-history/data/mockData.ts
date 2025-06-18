import { toast } from "sonner";
import type { CreateVisitData } from '../types/index';
import { visitHistoryService } from '../services/visitHistoryService';

// 実際のAPI呼び出しサービス
export const createVisitService = {
  mutateAsync: async (data: CreateVisitData) => {
    try {
      console.log('送信データ:', data);
      
      // 実際のAPI呼び出し
      const result = await visitHistoryService.create(data);
      
      // 成功時のトースト（ファイル数も含める）
      const fileMessage = data.files.length > 0 
        ? ` (${data.files.length}個のファイル含む)` 
        : '';
      
      toast.success("訪問履歴が登録されました！", {
        description: `${data.location_name} の訪問履歴を登録しました${fileMessage}`,
        duration: 4000,
      });
      
      return result;
    } catch (error) {
      console.error('登録エラー:', error);
      // エラーを再スローしてフォーム側でキャッチ
      throw error;
    }
  },
  isPending: false // TODO: 実際のloading状態を管理
};