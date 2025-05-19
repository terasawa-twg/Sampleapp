import GeoloniaMap from '@/app/_components/GeoloniaMap'
import { HydrateClient } from '@/trpc/server' // パスはプロジェクトに合わせて調整してください

export default function Page() {
  return (
    <HydrateClient>
      <GeoloniaMap />
    </HydrateClient>
  )
}