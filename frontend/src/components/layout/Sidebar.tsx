'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Search,
  Calendar,
  TrendingUp,
  Mail,
  Settings,
  LogOut,
  User,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/authStore';
import { resolveAssetUrl } from '@/lib/api/client';
import { useRouter } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Resumes', href: '/resumes', icon: FileText },
  { name: 'Applications', href: '/applications', icon: Briefcase },
  { name: 'Job Search', href: '/jobs', icon: Search },
  { name: 'Interviews', href: '/interviews', icon: Calendar },
  { name: 'Email', href: '/emails', icon: Mail },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-200">
      {/* Logo */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-end'}`}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 py-4">
        <Link
          href="/profile"
          className="flex items-center justify-center"
          title={user?.full_name || 'Profile'}
        >
          <div className="h-16 w-16 rounded-full border border-slate-200 bg-white shadow-sm transition hover:border-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-500/40 flex items-center justify-center">
            <div className="h-14 w-14 overflow-hidden rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 flex items-center justify-center text-lg font-semibold">
              {user?.profile_picture_url ? (
                <img
                  src={resolveAssetUrl(user.profile_picture_url)}
                  alt="Profile"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                user?.full_name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-base ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.name : undefined}
            >
              <Icon className="h-6 w-6" />
              {!collapsed && <span className="font-semibold">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <Button
          variant="ghost"
          className={`w-full ${collapsed ? 'justify-center' : 'justify-start'}`}
          onClick={handleLogout}
        >
          <LogOut className={collapsed ? 'h-6 w-6' : 'mr-3 h-6 w-6'} />
          {!collapsed && 'Logout'}
        </Button>
      </div>
    </div>
  );
}
