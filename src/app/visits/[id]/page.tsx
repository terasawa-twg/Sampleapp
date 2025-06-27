import { VisitDetails } from '@/features/visits';

interface VisitDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VisitDetailPage({ params }: VisitDetailPageProps) {
  const { id } = await params;
  const visitId = parseInt(id, 10);

  if (isNaN(visitId)) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <h3 className="font-bold mb-2">無効なIDです</h3>
          <p>訪問履歴のIDが正しくありません。</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <VisitDetails visitId={visitId} />
    </div>
  );
}