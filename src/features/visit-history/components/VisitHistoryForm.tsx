'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";

import { useVisitForm } from '@/features/visit-history/hooks/useVisitForm';
import { useFileUpload } from '@/features/visit-history/hooks/useFileUpload';
import { mockVisitLocations, mockCreateVisit } from '@/features/visit-history/data/mockData';
import { FileUpload } from './FileUpload';
import type { VisitLocation } from '../types/index';

export const VisitHistoryForm = () => {
  const {
    visitLocation,
    visitDate,
    visitTime,
    rating,
    memo,
    fileDescription,
    setVisitLocation,
    setVisitDate,
    setVisitTime,
    setRating,
    setMemo,
    setFileDescription,
    getFormData,
    resetForm,
    validateForm,
    createSubmitData,
  } = useVisitForm();

  const {
    uploadedFiles,
    isDragOver,
    handleFileRemove,
    handleFileInputChange,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    resetFiles,
  } = useFileUpload();

  // フォーム送信処理
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // バリデーション
    const validation = validateForm();
    if (!validation.isValid) {
      toast.error("入力エラー", {
        description: validation.error,
        duration: 3000,
      });
      return;
    }

    try {
      // フォームデータを取得
      const formData = { ...getFormData(), uploadedFiles };
      
      // 送信用データを作成
      const submitData = createSubmitData(formData, mockVisitLocations);

      // ダミーのAPI呼び出し
      await mockCreateVisit.mutateAsync(submitData);

      // フォームをリセット
      resetForm();
      resetFiles();

    } catch (error) {
      console.error('送信エラー:', error);
      toast.error("登録エラー", {
        description: "訪問履歴の登録に失敗しました。もう一度お試しください。",
        duration: 4000,
      });
    }
  };

  // キャンセル処理
  const handleCancel = () => {
    toast("入力内容をリセットしますか？", {
      description: "入力した内容は失われます",
      action: {
        label: "リセット",
        onClick: () => {
          resetForm();
          resetFiles();
          toast.success("入力内容をリセットしました");
        },
      },
      duration: 5000,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">
          📍 訪問履歴登録
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 訪問先と訪問日の行 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 訪問先 */}
            <div className="space-y-2">
              <Label htmlFor="visitLocation">訪問先</Label>
              <Select value={visitLocation} onValueChange={setVisitLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="訪問先を選択" />
                </SelectTrigger>
                <SelectContent>
                  {mockVisitLocations.map((location: VisitLocation) => (
                    <SelectItem key={location.location_id} value={location.location_id.toString()}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 訪問日 */}
            <div className="space-y-2">
              <Label htmlFor="visitDate">訪問日</Label>
              <Input
                id="visitDate"
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                placeholder="年-月-日"
              />
            </div>
          </div>

          {/* 訪問時間と評価の行 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 訪問時間 */}
            <div className="space-y-2">
              <Label htmlFor="visitTime">訪問時間</Label>
              <Input
                id="visitTime"
                type="time"
                value={visitTime}
                onChange={(e) => setVisitTime(e.target.value)}
                placeholder="時:分"
              />
            </div>

            {/* 評価 */}
            <div className="space-y-2">
              <Label htmlFor="rating">評価</Label>
              <Input
                id="rating"
                type="number"
                min="0"
                max="999"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="138"
              />
            </div>
          </div>

          {/* 訪問メモ */}
          <div className="space-y-2">
            <Label htmlFor="memo">訪問メモ</Label>
            <Textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="ここに訪問メモを入力してください..."
              rows={4}
            />
          </div>

          {/* ファイルアップロード */}
          <FileUpload
            uploadedFiles={uploadedFiles}
            isDragOver={isDragOver}
            fileDescription={fileDescription}
            onFileDescription={setFileDescription}
            onFileRemove={handleFileRemove}
            onFileInputChange={handleFileInputChange}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />

          {/* ボタン */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="px-8 py-2"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={mockCreateVisit.isPending}
              className="px-8 py-2 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              {mockCreateVisit.isPending ? '登録中...' : '登録'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};