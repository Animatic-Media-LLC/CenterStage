import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import { AdminLoadingLayout } from '@/components/layout/admin-loading-layout';

export default function ProjectsLoading() {
  return (
    <AdminLoadingLayout>
      {/* Header Skeleton */}
      <Box sx={{
        bgcolor: 'white',
        borderBottom: 1,
        borderColor: 'divider',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ px: 4, py: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Skeleton variant="text" width={120} height={36} />
            <Skeleton variant="text" width={220} height={20} sx={{ mt: 0.5 }} />
          </Box>
          <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 1 }} />
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ px: 4, py: 3 }}>
        {/* Search Skeleton */}
        <Box sx={{ mb: 3, maxWidth: 480 }}>
          <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
        </Box>

        {/* Projects Grid Skeleton */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Box key={i}>
              <Card>
                <Box sx={{ p: 2.5 }}>
                  <Skeleton variant="text" width="60%" height={28} />
                  <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
                </Box>
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Skeleton variant="text" width="30%" height={16} />
                    <Skeleton variant="text" width="80%" height={20} sx={{ mt: 0.5 }} />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Skeleton variant="text" width="30%" height={16} />
                    <Skeleton variant="text" width="60%" height={20} sx={{ mt: 0.5 }} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Skeleton variant="rectangular" height={36} sx={{ flex: 1, borderRadius: 1 }} />
                    <Skeleton variant="rectangular" height={36} sx={{ flex: 1, borderRadius: 1 }} />
                    <Skeleton variant="rectangular" height={36} width={36} sx={{ borderRadius: 1 }} />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>
    </AdminLoadingLayout>
  );
}
