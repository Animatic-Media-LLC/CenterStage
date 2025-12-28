'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FolderKanban, Users, LogOut, Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils/cn';

interface Project {
  id: string;
  name: string;
  slug: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  userName?: string;
  userRole?: 'admin' | 'super_admin';
  projects?: Project[];
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

export function AdminLayout({ children, userName, userRole, projects = [] }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);

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

  // Check if we're on a projects-related page
  const isProjectsActive = pathname.startsWith('/admin/projects');

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={cn(
          "md:hidden fixed top-4 z-50 p-2 bg-white rounded-xl shadow-xl border border-gray-200 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:scale-105",
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
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar - Hidden on mobile, slide in when menu open */}
      <aside className={cn(
        "w-64 bg-gradient-to-b from-slate-200 via-slate-100 to-white border-r border-gray-300 shadow-xl flex flex-col h-screen overflow-hidden transition-transform duration-300 z-40",
        "fixed md:relative",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Logo/Brand */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 flex-shrink-0 shadow-md" style={{ background: 'linear-gradient(135deg, #0082ae 0%, #52c2ef 100%)' }}>
          <h1 className="text-2xl font-bold text-white tracking-tight" style={{ textShadow: '0 1px 1px rgba(0, 0, 0, 0.75)' }}>CenterStage</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const isProjectsItem = item.href === '/admin/projects';

            if (isProjectsItem) {
              return (
                <div key={item.href}>
                  <div
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm cursor-pointer',
                      isProjectsActive
                        ? 'text-white shadow-lg scale-105'
                        : 'text-gray-700 hover:shadow-md hover:scale-102'
                    )}
                    style={isProjectsActive ? { background: 'linear-gradient(135deg, #0082ae 0%, #52c2ef 100%)', boxShadow: '0 10px 15px -3px rgba(0, 130, 174, 0.3)' } : {}}
                    onMouseEnter={(e) => {
                      if (!isProjectsActive) {
                        e.currentTarget.style.background = 'rgba(0, 130, 174, 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isProjectsActive) {
                        e.currentTarget.style.background = '';
                      }
                    }}
                    onClick={() => {
                      if (!isProjectsActive) {
                        router.push('/admin/projects');
                        closeMobileMenu();
                      } else {
                        setIsProjectsExpanded(!isProjectsExpanded);
                      }
                    }}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="flex-1">{item.title}</span>
                    {isProjectsExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>

                  {/* Submenu - Projects List */}
                  <div
                    className={cn(
                      'overflow-hidden transition-all duration-300',
                      isProjectsExpanded ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
                    )}
                  >
                    <div className="ml-4 space-y-1 border-l-2 pl-4" style={{ borderColor: 'rgba(0, 130, 174, 0.3)' }}>
                      <Link
                        href="/admin/projects"
                        onClick={closeMobileMenu}
                        className={cn(
                          'block px-3 py-2 text-sm rounded-lg transition-colors',
                          pathname === '/admin/projects'
                            ? 'font-semibold'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                        style={pathname === '/admin/projects' ? { backgroundColor: 'rgba(0, 130, 174, 0.1)', color: '#0082ae' } : {}}
                      >
                        All Projects
                      </Link>
                      {projects.map((project) => {
                        const projectEditPath = `/admin/projects/${project.slug}/edit`;
                        // Highlight if on any page related to this project (edit, review, qr, etc.)
                        const isProjectActive = pathname.startsWith(`/admin/projects/${project.slug}/`);
                        return (
                          <Link
                            key={project.id}
                            href={projectEditPath}
                            onClick={closeMobileMenu}
                            className={cn(
                              'block px-3 py-2 text-sm rounded-lg transition-colors truncate',
                              isProjectActive
                                ? 'font-semibold'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            )}
                            style={isProjectActive ? { backgroundColor: 'rgba(0, 130, 174, 0.1)', color: '#0082ae' } : {}}
                            title={project.name}
                          >
                            {project.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm',
                  isActive
                    ? 'text-white shadow-lg scale-105'
                    : 'text-gray-700 hover:shadow-md hover:scale-102'
                )}
                style={isActive ? { background: 'linear-gradient(135deg, #0082ae 0%, #52c2ef 100%)', boxShadow: '0 10px 15px -3px rgba(0, 130, 174, 0.3)' } : {}}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(0, 130, 174, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '';
                  }
                }}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-slate-50 to-blue-50/30 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #0082ae 0%, #52c2ef 100%)', boxShadow: '0 10px 15px -3px rgba(0, 130, 174, 0.3)' }}>
                <span className="text-sm font-bold text-white">
                  {userName?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">
                  {userName || 'User'}
                </span>
                <span className="text-xs font-medium" style={{ color: '#0082ae' }}>Admin</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-white hover:text-red-600 rounded-lg transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        {/* Logo */}
        <div className="p-4 border-t border-gray-200 flex justify-center items-center flex-shrink-0 bg-white">
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
