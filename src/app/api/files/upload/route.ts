import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.files || !Array.isArray(body.files)) {
      return NextResponse.json(
        { error: 'ファイルデータが不正です' },
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

    const uploadedFiles = [];

    for (const fileData of body.files) {
      const { name, base64Data, size, type } = fileData;
      
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
      });
      
      console.log(`ファイル保存完了: ${fileName}`);
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