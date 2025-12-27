import Box from '@mui/material/Box';
import { Card, CardContent } from '@/components/ui/card';
import Skeleton from '@mui/material/Skeleton';
import { AdminLoadingLayout } from '@/components/layout/admin-loading-layout';

export default function ReviewLoading() {
  return (
    <AdminLoadingLayout>
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div className="px-4 sm:px-8 py-6">
          <Skeleton variant="text" width={120} height={20} className="mb-4" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Skeleton variant="text" width={200} height={32} />
              <Skeleton variant="text" width={280} height={20} sx={{ mt: 1 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <Box sx={{ px: { xs: 2, sm: 4 }, py: 3 }}>
        {/* Tabs Skeleton */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rectangular" width={100} height={40} sx={{ borderRadius: 1 }} />
          ))}
        </Box>

        {/* Search/Filter Skeleton */}
        <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <Skeleton variant="rectangular" height={40} sx={{ flex: 1, borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={150} height={40} sx={{ borderRadius: 1 }} />
        </Box>

        {/* Submissions List Skeleton */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4 }}>
                  {/* Media Skeleton */}
                  <Skeleton
                    variant="rectangular"
                    width={192}
                    height={192}
                    sx={{ borderRadius: 2, flexShrink: 0 }}
                  />

                  {/* Content Skeleton */}
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="80%" height={24} />
                    <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
                    <Skeleton variant="text" width="100%" height={60} sx={{ mt: 2 }} />
                    <Skeleton variant="text" width="30%" height={20} sx={{ mt: 2 }} />

                    {/* Action Buttons Skeleton */}
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                      <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
                      <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
                      <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </AdminLoadingLayout>
  );
}
