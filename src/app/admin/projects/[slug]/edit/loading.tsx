import Box from '@mui/material/Box';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Skeleton from '@mui/material/Skeleton';

export default function ProjectEditLoading() {
  return (
    <>
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-8 py-6">
          <Skeleton variant="text" width={120} height={20} className="mb-4" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Skeleton variant="text" width={150} height={32} />
              <Skeleton variant="text" width={250} height={20} sx={{ mt: 1 }} />
            </div>
            <Skeleton variant="rectangular" width={180} height={40} sx={{ borderRadius: 1 }} />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="px-4 sm:px-8 py-6 max-w-4xl">
        {/* Project Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <Skeleton variant="text" width={150} height={28} />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
          </CardContent>
        </Card>

        {/* Presentation Config Card */}
        <Card className="mb-6">
          <CardHeader>
            <Skeleton variant="text" width={220} height={28} />
          </CardHeader>
          <CardContent className="space-y-4">
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
            </Box>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
            </Box>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 1 }} />
        </Box>
      </div>
    </>
  );
}
