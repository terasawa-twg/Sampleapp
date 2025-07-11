// src/app/_components/Sidebar.tsx
// サイドバーコンポーネントの定義

// 20250704 Next.js Link コンポーネントを追加（ナビゲーション機能のため）
import Link from "next/link";
import { MapPin, Grid3X3, Camera, Clock, Settings, LogOut } from "lucide-react"; // アイコンのインポート
import { Button } from "@/components/ui/button"; // ボタンコンポーネントのインポート
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // アバターコンポーネントのインポート

// サイドバーコンポーネントのプロパティ型定義
interface SidebarProps {
  currentUser: {
    name: string;
    email: string;
    avatar?: string;
  };
  currentPath: string; // 現在のページパスでアクティブ状態を判定
}

// ナビゲーションメニューのアイテム型定義
interface NavigationItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

// サイドバーコンポーネントの定義
export function Sidebar({ currentUser, currentPath = "/" }: SidebarProps) {
  // ナビゲーションメニューの定義
  const navigationItems: NavigationItem[] = [
    {
      icon: MapPin,
      label: "ダッシュボード",
      path: "/",
    },
    {
      icon: Grid3X3,
      label: "訪問先管理",
      path: "/visits",
    },
    {
      icon: MapPin,
      label: "マップ",
      path: "/map",
    },
    {
      icon: Camera,
      label: "ファイル管理",
      path: "/files",
    },
    {
      icon: Clock,
      label: "訪問履歴一覧",
      path: "/history",
    },
  ];

  const isActive = (path: string) => currentPath === path; // 現在のパスと比較してアクティブ状態を判定

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-gray-50">
      {/* ========== ロゴ部分 ========== */}
      <div className="border-b border-gray-200 p-6">
        {/* 20250704 ロゴをクリック可能にしてダッシュボードから遷移 */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded bg-red-500">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">VisitLogger</span>
        </Link>
      </div>

      {/* ========== ナビゲーションメニュー ========== */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <li key={item.path}>
                {/* 20250704 ボタンをLinkでラップしてページ遷移を可能にした */}
                <Link href={item.path} className="block">
                  <Button
                    variant={active ? "default" : "ghost"}
                    className={`h-12 w-full justify-start gap-3 ${
                      active
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ========== ユーザー情報エリア ========== */}
      <div className="border-t border-gray-200 p-4">
        {/* ユーザー管理ボタン */}
        <Button className="mb-4 w-full bg-red-500 text-white hover:bg-red-600">
          ユーザー管理
        </Button>

        {/* ユーザープロフィール */}
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback className="bg-gray-200 text-gray-700">
              {currentUser.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">
              {currentUser.name}
            </p>
            <p className="truncate text-xs text-gray-500">
              {currentUser.email}
            </p>
          </div>
        </div>

        {/* 設定とサインアウト */}
        <div className="mt-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-gray-700 hover:bg-gray-100"
          >
            <Settings className="h-4 w-4" />
            <span className="text-sm">設定</span>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Sign out</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
