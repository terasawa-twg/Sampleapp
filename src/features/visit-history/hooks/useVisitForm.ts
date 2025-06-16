import { useState } from 'react';
import type { VisitFormData, CreateVisitData, VisitLocation } from '@/features/visit-history/types/index';

export const useVisitForm = () => {
  // フォームの状態管理
  const [visitLocation, setVisitLocation] = useState<string>('');
  const [visitDate, setVisitDate] = useState<string>('');
  const [visitTime, setVisitTime] = useState<string>('');
  const [rating, setRating] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [fileDescription, setFileDescription] = useState<string>('');

  // フォームデータを取得
  const getFormData = (): VisitFormData => ({
    visitLocation,
    visitDate,
    visitTime,
    rating,
    memo,
    uploadedFiles: [], // ファイルは別フックで管理
    fileDescription,
  });

  // フォームをリセット
  const resetForm = () => {
    setVisitLocation('');
    setVisitDate('');
    setVisitTime('');
    setRating('');
    setMemo('');
    setFileDescription('');
  };

  // バリデーション（Sonner用にエラー情報を返す）
  const validateForm = (): { isValid: boolean; error?: string } => {
    if (!visitLocation) return { isValid: false, error: '訪問先を選択してください' };
    if (!visitDate) return { isValid: false, error: '訪問日を入力してください' };
    if (!visitTime) return { isValid: false, error: '訪問時間を入力してください' };
    return { isValid: true };
  };

  // 送信用データの作成
  const createSubmitData = (
    formData: VisitFormData,
    visitLocations: VisitLocation[]
  ): CreateVisitData => {
    const visitDateTime = new Date(`${formData.visitDate}T${formData.visitTime}:00`);
    const selectedLocation = visitLocations.find(
      loc => loc.location_id.toString() === formData.visitLocation
    );

    return {
      location_id: parseInt(formData.visitLocation),
      location_name: selectedLocation?.name || '',
      visit_date: visitDateTime,
      visit_time: formData.visitTime,
      notes: formData.memo || '',
      rating: formData.rating ? parseInt(formData.rating) : 0,
      created_by: 1, // TODO: 実際のユーザーIDに置き換える
      files: formData.uploadedFiles,
      file_description: formData.fileDescription,
    };
  };

  return {
    // 状態
    visitLocation,
    visitDate,
    visitTime,
    rating,
    memo,
    fileDescription,
    // セッター
    setVisitLocation,
    setVisitDate,
    setVisitTime,
    setRating,
    setMemo,
    setFileDescription,
    // メソッド
    getFormData,
    resetForm,
    validateForm,
    createSubmitData,
  };
};