import { 
  MapPin, 
  Grid3X3, 
  Camera, 
  Clock, 
  Settings, 
  LogOut 
} from 'lucide-react'; // アイコンのインポート
import { Button } from '@/components/ui/button'; // ボタンコンポーネントのインポート
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';  // アバターコンポーネントのインポート

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
      label: 'ダッシュボード',
      path: '/dashboard'
    },
    {
      icon: Grid3X3,
      label: '訪問先管理',
      path: '/visits'
    },
    {
      icon: MapPin,
      label: 'マップ',
      path: '/map'
    },
    {
      icon: Camera,
      label: 'ファイル管理',
      path: '/file-list'
    },
    {
      icon: Clock,
      label: '訪問履歴一覧',
      path: '/history'
    }
  ];

  const isActive = (path: string) => currentPath === path; // 現在のパスと比較してアクティブ状態を判定

  return (
    <aside className="w-64 h-screen bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* ========== ロゴ部分 ========== */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">VisitLogger</span>
        </div>
      </div>

      {/* ========== ナビゲーションメニュー ========== */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <li key={item.path}>
                <Button
                  variant={active ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 h-12 ${
                    active 
                      ? "bg-red-500 text-white hover:bg-red-600" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ========== ユーザー情報エリア ========== */}
      <div className="p-4 border-t border-gray-200">
        {/* ユーザー管理ボタン */}
        <Button className="w-full mb-4 bg-red-500 hover:bg-red-600 text-white">
          ユーザー管理
        </Button>

        {/* ユーザープロフィール */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback className="bg-gray-200 text-gray-700">
              {currentUser.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {currentUser.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
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