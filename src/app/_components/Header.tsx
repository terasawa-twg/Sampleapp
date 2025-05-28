'use client'
// ここにimport
import { MapPin } from 'lucide-react'; // アイコンライブラリ
import { Button } from '@/components/ui/button'; // ボタンコンポーネント
import { Input } from '@/components/ui/input'; // 入力コンポーネント
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // アバターコンポーネント

// ここにinterfaceや型定義など
// ページタイトルを受け取るプロパティ
interface HeaderProps {
    title: string;
    subtitle?: string;
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