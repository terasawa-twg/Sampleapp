import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';

// POST /api/visit-history
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('受信データ:', body);
    
    // バリデーション
    if (!body.location_id || !body.visit_date || !body.created_by) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }

    // 実際のデータベース保存
    const visit = await db.visits.create({
      data: {
        location_id: body.location_id,
        visit_date: new Date(body.visit_date),
        notes: body.notes || '',
        rating: body.rating || 0,
        created_by: body.created_by,
        updated_by: body.created_by,
      },
      // 作成されたデータを取得
      include: {
        locations: {
          select: {
            name: true,
            address: true,
          }
        },
        users_visits_created_byTousers: {
          select: {
            username: true,
          }
        }
      }
    });

    console.log('データベース保存成功:', visit);

    const response = {
      success: true,
      data: {
        visit_id: visit.visit_id,
        location_id: visit.location_id,
        location_name: visit.locations.name,
        visit_date: visit.visit_date.toISOString(),
        notes: visit.notes,
        rating: visit.rating,
        created_by: visit.created_by,
        created_at: visit.created_at.toISOString(),
      },
      message: '訪問履歴が正常に登録されました',
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('データベース保存エラー:', error);
    
    // エラーの詳細をログに出力
    if (error instanceof Error) {
      console.error('エラーメッセージ:', error.message);
      console.error('スタックトレース:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: '訪問履歴の登録に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}