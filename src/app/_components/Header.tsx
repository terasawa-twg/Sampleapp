'use client'
import { MapPin } from 'lucide-react'; // マップアイコン

// ページタイトルを受け取るプロパティ
interface HeaderProps {
    title: string;
}

export function Header({ title }: HeaderProps) {
    return (
        <header className="h-16 border-b bg-white px-6 flex items-center">
        {/* ページタイトルのみ */}
            <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-500" />
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>
        </header>
    );
}