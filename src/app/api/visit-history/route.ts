import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import type { Prisma } from '@prisma/client';

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

    // データベーストランザクション開始
    const result = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. 訪問履歴を作成
      const visit = await tx.visits.create({
        data: {
          location_id: body.location_id,
          visit_date: new Date(body.visit_date),
          notes: body.notes || '',
          rating: body.rating || 0,
          created_by: body.created_by,
          updated_by: body.created_by,
        },
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

      // 2. ファイルがある場合は visit_photos に保存
      if (body.files && Array.isArray(body.files) && body.files.length > 0) {
        const photoPromises = body.files.map((file: any) => 
          tx.visit_photos.create({
            data: {
              visit_id: visit.visit_id,
              file_path: file.filePath,
              description: file.description || '', // ファイルごとの説明
              created_by: body.created_by,
              updated_by: body.created_by,
            }
          })
        );

        const photos = await Promise.all(photoPromises);
        console.log(`${photos.length}個のファイルをvisit_photosに保存完了`);
        
        return { visit, photos };
      }

      return { visit, photos: [] };
    });

    console.log('データベース保存成功:', result.visit);
    if (result.photos.length > 0) {
      console.log('写真保存成功:', result.photos.length, '個');
    }

    // 保存後の確認クエリ
    const verifyQuery = await db.visits.findUnique({
      where: { visit_id: result.visit.visit_id },
      include: {
        locations: { select: { name: true } },
        visit_photos: true,
      }
    });
    console.log('保存確認クエリ結果:', verifyQuery);

    const response = {
      success: true,
      data: {
        visit_id: result.visit.visit_id,
        location_id: result.visit.location_id,
        location_name: result.visit.locations.name,
        visit_date: result.visit.visit_date.toISOString(),
        notes: result.visit.notes,
        rating: result.visit.rating,
        created_by: result.visit.created_by,
        created_at: result.visit.created_at.toISOString(),
        photos_count: result.photos.length,
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