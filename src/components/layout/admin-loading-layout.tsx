import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

interface AdminLoadingLayoutProps {
  children: React.ReactNode;
}

/**
 * Admin Loading Layout
 * Provides skeleton structure matching AdminLayout with sidebar on desktop
 */
export function AdminLoadingLayout({ children }: AdminLoadingLayoutProps) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 overflow-hidden">
      {/* Sidebar Skeleton - Hidden on mobile, visible on desktop */}
      <aside className="hidden md:flex w-64 bg-gradient-to-b from-white to-slate-50/50 border-r border-gray-200 shadow-xl flex-col h-screen overflow-hidden">
        {/* Logo/Brand Skeleton */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 flex-shrink-0 shadow-md" style={{ background: 'linear-gradient(135deg, #0082ae 0%, #52c2ef 100%)' }}>
          <Skeleton variant="text" width={120} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
        </div>

        {/* Navigation Skeleton */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={44}
              sx={{ borderRadius: '12px' }}
            />
          ))}
        </nav>

        {/* User Section Skeleton */}
        <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-slate-50 to-blue-50/30 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="flex flex-col flex-1">
              <Skeleton variant="text" width="80%" height={20} />
              <Skeleton variant="text" width="40%" height={16} sx={{ mt: 0.5 }} />
            </div>
          </div>
          <Skeleton variant="rectangular" height={38} sx={{ borderRadius: '8px' }} />
        </div>

        {/* Logo Skeleton */}
        <div className="p-4 border-t border-gray-200 flex justify-center items-center flex-shrink-0 bg-white">
          <Skeleton variant="rectangular" width={90} height={30} />
        </div>
      </aside>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto h-screen">
        <div className="h-full pt-16 md:pt-0">{children}</div>
      </main>
    </div>
  );
}
