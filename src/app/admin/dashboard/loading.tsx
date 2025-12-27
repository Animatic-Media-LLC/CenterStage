import Box from '@mui/material/Box';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Skeleton from '@mui/material/Skeleton';
import { AdminLoadingLayout } from '@/components/layout/admin-loading-layout';

export default function DashboardLoading() {
  return (
    <AdminLoadingLayout>
      {/* Header Skeleton */}
      <Box sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Box sx={{
          px: { xs: 2, sm: 4 },
          py: 3,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2
        }}>
          <Box>
            <Skeleton variant="text" width={150} height={36} />
            <Skeleton variant="text" width={200} height={20} sx={{ mt: 0.5 }} />
          </Box>
          <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 1 }} />
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ px: { xs: 2, sm: 4 }, py: 3 }}>
        {/* Stats Grid Skeleton */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 3,
            mb: 4,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton variant="text" width="60%" height={20} />
              </CardHeader>
              <CardContent className="hidden md:block">
                <Skeleton variant="text" width="40%" height={40} />
                <Skeleton variant="text" width="50%" height={16} sx={{ mt: 0.5 }} />
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Recent Submissions Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton variant="text" width={200} height={28} />
          </CardHeader>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2 }}>
                  <Skeleton variant="rectangular" width={60} height={60} sx={{ borderRadius: 1 }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="80%" height={20} />
                    <Skeleton variant="text" width="60%" height={16} sx={{ mt: 0.5 }} />
                    <Skeleton variant="text" width="40%" height={16} sx={{ mt: 0.5 }} />
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </AdminLoadingLayout>
  );
}
