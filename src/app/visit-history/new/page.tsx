// 訪問履歴登録画面
// app/visit-history/new/page.tsx

'use client';

import { useState } from 'react'; // ReactのuseStateフックをインポート
import { Sidebar } from '@/app/_components/Sidebar'; // サイドバーコンポーネント
import { Header } from '@/app/_components/Header'; // ヘッダーコンポーネント
import { Button } from '@/components/ui/button'; // ボタンコンポーネント
import { Input } from '@/components/ui/input'; // 入力フィールド
import { Label } from '@/components/ui/label'; // ラベル
import { Textarea } from '@/components/ui/textarea'; // テキストエリア
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // セレクトボックス
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // カードコンポーネント
import { Trash2, Upload } from 'lucide-react'; // アイコン

// 訪問先データの型定義
interface VisitLocation {
  location_id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  description: string;
}

// アップロードファイルの型定義
interface UploadedFile {
  id: string;
  name: string;
  size: number;
  file: File;
}

export default function VisitHistoryPage() {
  // フォームの状態管理
  const [visitLocation, setVisitLocation] = useState<string>(''); // 選択された訪問先
  const [visitDate, setVisitDate] = useState<string>(''); // 訪問日
  const [visitTime, setVisitTime] = useState<string>('');  // 訪問時間
  const [rating, setRating] = useState<string>(''); // 評価
  const [memo, setMemo] = useState<string>(''); // 訪問メモ
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]); // アップロードされたファイルのリスト
  const [fileDescription, setFileDescription] = useState<string>(''); // ファイルの説明
  const [isDragOver, setIsDragOver] = useState<boolean>(false); // ドラッグ状態の管理

  // ダミーデータの訪問先リスト
  const visitLocations: VisitLocation[] = [
    {
      location_id: 1,
      name: 'ABCD商店',
      latitude: 35.6762,
      longitude: 139.6503,
      address: '東京都渋谷区渋谷1-1-1',
      description: '老舗の商店です'
    },
    {
      location_id: 2,
      name: '株式会社サンプル',
      latitude: 35.6896,
      longitude: 139.6917,
      address: '東京都新宿区新宿2-2-2',
      description: 'IT企業です'
    },
    {
      location_id: 3,
      name: 'いろはマート',
      latitude: 35.7286,
      longitude: 139.7185,
      address: '東京都豊島区南池袋3-3-3',
      description: 'スーパーマーケットです'
    },
    {
      location_id: 4,
      name: 'デパート田中',
      latitude: 35.6580,
      longitude: 139.7016,
      address: '東京都港区六本木4-4-4',
      description: '百貨店です'
    },
    {
      location_id: 5,
      name: '山田商店',
      latitude: 35.6938,
      longitude: 139.7036,
      address: '東京都新宿区歌舞伎町5-5-5',
      description: '雑貨店です'
    }
  ];

  // 訪問履歴作成用（現在はコンソール出力のみ）
  const createVisit = {
    mutateAsync: async (data: any) => {
      console.log('送信データ:', data);
      // TODO: 実際のAPI呼び出し処理（後で実装）
      alert('訪問履歴が登録されました！（現在はダミー処理）');
      return Promise.resolve();
    },
    isPending: false
  };

  const currentUser = {
    name: "ジョン・スミス", 
    email: "johnsmith@email.jp"
  };

  // ファイル削除処理
  const handleFileRemove = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // ファイルアップロード処理（ドラッグ&ドロップ対応）
  const handleFileUpload = (files: FileList) => {
    const newFiles = Array.from(files).map((file, index) => ({
      id: `new_${Date.now()}_${index}`,
      name: file.name,
      size: file.size,
      file: file,
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  // ファイル選択ボタンでのアップロード処理
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFileUpload(files);
    }
  };

  // ドラッグオーバー時の処理
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  // ドラッグエンター時の処理
  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  // ドラッグリーブ時の処理
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    // relatedTargetをチェックして、要素外に出た場合のみドラッグ状態を解除
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  // ドロップ時の処理
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false); // ドラッグ状態を解除
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  // フォーム送信処理
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // バリデーション
    if (!visitLocation) {
      alert('訪問先を選択してください');
      return;
    }
    if (!visitDate) {
      alert('訪問日を入力してください');
      return;
    }
    if (!visitTime) {
      alert('訪問時間を入力してください');
      return;
    }

    try {
      // 日付と時刻を結合してDate オブジェクトを作成
      const visitDateTime = new Date(`${visitDate}T${visitTime}:00`);

      // 選択された訪問先の情報を取得
      const selectedLocation = visitLocations.find(loc => loc.location_id.toString() === visitLocation);

      // フォームデータを整理
      const formData = {
        location_id: parseInt(visitLocation),
        location_name: selectedLocation?.name || '',
        visit_date: visitDateTime,
        visit_time: visitTime,
        notes: memo || '',
        rating: rating ? parseInt(rating) : 0,
        created_by: 1, // ダミーユーザーID
        files: uploadedFiles,
        file_description: fileDescription
      };

      // ダミーのAPI呼び出し
      await createVisit.mutateAsync(formData);

      // フォームをリセット
      setVisitLocation('');
      setVisitDate('');
      setVisitTime('');
      setRating('');
      setMemo('');
      setFileDescription('');
      setUploadedFiles([]);

    } catch (error) {
      console.error('送信エラー:', error);
      alert('エラーが発生しました');
    }
  };

  // キャンセル処理
  const handleCancel = () => {
    if (window.confirm('入力内容が失われますが、よろしいですか？')) {
      // フォームをリセット
      setVisitLocation('');
      setVisitDate('');
      setVisitTime('');
      setRating('');
      setMemo('');
      setFileDescription('');
      setUploadedFiles([]);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* サイドバー */}
      <Sidebar 
        currentUser={currentUser}
        currentPath="/visit-history/new"
      />

      {/* メインコンテンツエリア */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ヘッダー */}
        <Header title="訪問履歴登録" />

        {/* ページコンテンツ */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
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
                          {visitLocations.map((location: VisitLocation) => (
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

                  {/* 写真/ファイルのアップロード */}
                  <div className="space-y-4">
                    <Label>写真／ファイルのアップロード</Label>
                    
                    {/* ファイルドロップエリア */}
                    <div 
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                        isDragOver 
                          ? 'border-blue-400 bg-blue-50' 
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="space-y-4">
                        <Upload className={`mx-auto h-12 w-12 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                        <div>
                          <p className={`${isDragOver ? 'text-blue-600' : 'text-gray-600'}`}>
                            {isDragOver ? 'ファイルをドロップしてください' : 'ファイルをここにドラッグ&ドロップしてください'}
                          </p>
                        </div>
                        
                        {/* ファイル説明入力 */}
                        <div className="max-w-md mx-auto">
                          <Input
                            type="text"
                            value={fileDescription}
                            onChange={(e) => setFileDescription(e.target.value)}
                            placeholder="ファイルの説明を入力してください"
                            className="text-sm"
                          />
                        </div>

                        {/* ファイル選択ボタン */}
                        <div>
                          <input
                            type="file"
                            id="fileUpload"
                            multiple
                            accept="image/*,.pdf,.doc,.docx"
                            onChange={handleFileInputChange}
                            className="hidden"
                          />
                          <Label
                            htmlFor="fileUpload"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                          >
                            ファイルを選択
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* アップロードされたファイル一覧 */}
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">
                          アップロードされたファイル:
                        </p>
                        <div className="space-y-2">
                          {uploadedFiles.map(file => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="text-sm">
                                  <p className="font-medium text-gray-900">{file.name}</p>
                                  <p className="text-gray-500">
                                    {(file.size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleFileRemove(file.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

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
                      disabled={createVisit.isPending}
                      className="px-8 py-2 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                    >
                      {createVisit.isPending ? '登録中...' : '登録'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}