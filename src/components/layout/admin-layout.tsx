'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderKanban, Users, LogOut, Menu, X } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils/cn';

interface AdminLayoutProps {
  children: React.ReactNode;
  userName?: string;
  userRole?: 'admin' | 'super_admin';
}

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Projects',
    href: '/admin/projects',
    icon: FolderKanban,
  },
  {
    title: 'Manage Users',
    href: '/admin/users',
    icon: Users,
    superAdminOnly: true,
  },
];

export function AdminLayout({ children, userName, userRole }: AdminLayoutProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Filter nav items based on user role
  const visibleNavItems = navItems.filter(
    (item) => !item.superAdminOnly || userRole === 'super_admin'
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={cn(
          "md:hidden fixed top-4 z-50 p-2 bg-white rounded-md shadow-lg border border-gray-200 transition-all duration-300",
          isMobileMenuOpen ? "right-4" : "left-4"
        )}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6 text-gray-700" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar - Hidden on mobile, slide in when menu open */}
      <aside className={cn(
        "w-64 bg-white border-r border-gray-200 flex flex-col h-screen overflow-hidden transition-transform duration-300 z-40",
        "fixed md:relative",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Logo/Brand */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900">CenterStage</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-700">
                  {userName?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {userName || 'User'}
                </span>
                <span className="text-xs text-gray-500">Admin</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        {/* Logo */}
        <div className="p-4 border-t border-gray-200 flex justify-center items-center flex-shrink-0">
          <span className="text-xs text-gray-500">Powered by </span>
          <Image src="/animatic_logo.svg" alt="Animatic Logo" width={90} height={90} />
        </div>
      </aside>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto h-screen">
        <div className="h-full pt-16 md:pt-0">{children}</div>
      </main>
    </div>
  );
}
