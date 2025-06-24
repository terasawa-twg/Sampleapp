import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// リクエストボディの型定義
type FileData = {
  name: string;
  base64Data: string;
  size: number;
  type: string;
  description?: string;
};

type UploadRequestBody = {
  files: FileData[];
};

// 型ガード関数
function isValidFileData(data: any): data is FileData {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.name === 'string' &&
    typeof data.base64Data === 'string' &&
    typeof data.size === 'number' &&
    typeof data.type === 'string' &&
    (data.description === undefined || typeof data.description === 'string')
  );
}

function isValidUploadRequestBody(body: any): body is UploadRequestBody {
  return (
    typeof body === 'object' &&
    body !== null &&
    Array.isArray(body.files) &&
    body.files.every(isValidFileData)
  );
}

// レスポンスの型定義
type UploadedFile = {
  fileName: string;
  filePath: string;
  originalName: string;
  size: number;
  mimeType: string;
  description: string;
};

type UploadResponse = {
  success: boolean;
  files: UploadedFile[];
  message: string;
};

type ErrorResponse = {
  error: string;
  details?: string;
};

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse | ErrorResponse>> {
  try {
    const body = await request.json();
    
    // 型ガードによるバリデーション
    if (!isValidUploadRequestBody(body)) {
      return NextResponse.json(
        { error: 'リクエストデータの形式が不正です' },
        { status: 400 }
      );
    }

    // uploads ディレクトリを作成（存在しない場合）
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // ディレクトリがすでに存在する場合は無視
    }

    const uploadedFiles: UploadedFile[] = [];

    for (const fileData of body.files) {
      const { name, base64Data, size, type, description } = fileData;
      
      // Base64データをバッファに変換
      const buffer = Buffer.from(base64Data, 'base64');
      
      // ユニークなファイル名を生成
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}_${name}`;
      const filePath = path.join(uploadsDir, fileName);
      
      // ファイルを保存
      await writeFile(filePath, buffer);
      
      uploadedFiles.push({
        fileName,
        filePath: `/uploads/${fileName}`,
        originalName: name,
        size,
        mimeType: type,
        description: description || '', // ファイルごとの説明
      });
      
      console.log(`ファイル保存完了: ${fileName} (説明: ${description || 'なし'})`);
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      message: `${uploadedFiles.length}個のファイルが正常にアップロードされました`,
    });

  } catch (error) {
    console.error('ファイルアップロードエラー:', error);
    return NextResponse.json(
      { 
        error: 'ファイルのアップロードに失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}