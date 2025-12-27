import Box from '@mui/material/Box';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Skeleton from '@mui/material/Skeleton';

export default function ProjectsLoading() {
  return (
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
              <CardHeader>
                <Skeleton variant="text" width="60%" height={28} />
                <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
              </CardHeader>
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
  );
}
