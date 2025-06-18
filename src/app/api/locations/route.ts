import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';

// GET /api/locations
export async function GET() {
  try {
    // データベースから全ての訪問先を取得
    const locations = await db.locations.findMany({
      select: {
        location_id: true,
        name: true,
        latitude: true,
        longitude: true,
        address: true,
        description: true,
      },
      orderBy: {
        name: 'asc', // 名前順でソート
      },
    });

    console.log(`訪問先データ取得完了: ${locations.length}件`);

    return NextResponse.json({
      success: true,
      data: locations,
      message: `${locations.length}件の訪問先を取得しました`,
    });

  } catch (error) {
    console.error('訪問先取得エラー:', error);
    
    // エラーの詳細をログに出力
    if (error instanceof Error) {
      console.error('エラーメッセージ:', error.message);
      console.error('スタックトレース:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: '訪問先の取得に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/locations (将来の新規作成用)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // バリデーション
    if (!body.name || !body.latitude || !body.longitude) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }

    // 新しい訪問先を作成
    const location = await db.locations.create({
      data: {
        name: body.name,
        latitude: body.latitude,
        longitude: body.longitude,
        address: body.address || '',
        description: body.description || '',
        created_by: body.created_by || 1,
        updated_by: body.created_by || 1,
      },
    });

    console.log('新しい訪問先作成完了:', location);

    return NextResponse.json({
      success: true,
      data: location,
      message: '訪問先が正常に作成されました',
    }, { status: 201 });

  } catch (error) {
    console.error('訪問先作成エラー:', error);
    
    return NextResponse.json(
      { 
        error: '訪問先の作成に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}