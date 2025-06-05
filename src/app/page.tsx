import GeoloniaMap from '@/app/_components/GeoloniaMap'
import { HydrateClient } from '@/trpc/server' // パスはプロジェクトに合わせて調整してください
import { redirect } from 'next/navigation';

export default function HomePage() {
  // ルートアクセス時にダッシュボードへリダイレクト
  redirect('/dashboard');
}