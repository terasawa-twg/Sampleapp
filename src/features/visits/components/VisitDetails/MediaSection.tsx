'use client';

import { Camera, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Photo {
  photo_id: number;
  file_path: string;
  description?: string;
}

interface MediaSectionProps {
  photos?: Photo[];
}

/**
 * 📷 メディア表示コンポーネント
 * 訪問時にアップロードされた写真を表示
 */
export const MediaSection = ({ photos }: MediaSectionProps) => {
  const photoCount = photos?.length ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          アップロードされたメディア
          {photoCount > 0 && (
            <Badge variant="secondary">{photoCount}枚</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {photoCount === 0 ? (
          <div className="text-center py-8">
            <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground font-medium">
              アップロードされたメディアはありません
            </p>
            <p className="text-muted-foreground/70 text-sm mt-1">
              メディアが登録されていません
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos!.map((photo) => (
                <div key={photo.photo_id} className="group relative aspect-square bg-muted rounded-lg overflow-hidden">
                  <img
                    src={photo.file_path}
                    alt={`訪問時の写真 ${photo.description ?? ''}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{photoCount}枚のファイルがアップロードされています</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};