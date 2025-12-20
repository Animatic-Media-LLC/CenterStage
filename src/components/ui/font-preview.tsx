'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Card, CardContent } from '@/components/ui/card';
import type { FontFamily } from '@/lib/constants/fonts';

interface FontPreviewProps {
  fontFamily: FontFamily;
  fontSize: number;
  textColor: string;
  outlineColor: string;
  backgroundColor: string;
}

export function FontPreview({
  fontFamily,
  fontSize,
  textColor,
  outlineColor,
  backgroundColor,
}: FontPreviewProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          Preview
        </Typography>
        <Box
          sx={{
            backgroundColor,
            padding: 3,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 120,
          }}
        >
          <Box
            sx={{
              border: `3px solid ${outlineColor}`,
              borderRadius: 1,
              padding: 2,
              backgroundColor: 'transparent',
            }}
          >
            <Typography
              sx={{
                fontFamily: `"${fontFamily}", sans-serif`,
                fontSize: `${fontSize}px`,
                color: textColor,
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              The Quick Brown Fox
            </Typography>
          </Box>
        </Box>
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary">
            Font: {fontFamily}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            •
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Size: {fontSize}px
          </Typography>
          <Typography variant="caption" color="text.secondary">
            •
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Text: {textColor}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            •
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Card Border: {outlineColor}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            •
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Background: {backgroundColor}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
