import React from 'react';
import { Menu, Bell, Shield } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';

export function AdminHeader({ onMenuClick }) {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-30 h-16 glass border-b border-white/10 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/10"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm" icon={Shield}>
            ADMIN CONSOLE
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pl-3 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-text-primary leading-tight">
              {user?.fullName || 'Administrator'}
            </p>
            <p className="text-[10px] font-mono text-primary-light">SUPER_ADMIN</p>
          </div>
          <Avatar name={user?.fullName || 'Admin'} size="sm" />
        </div>
      </div>
    </header>
  );
}
