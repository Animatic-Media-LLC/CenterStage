'use client';

import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { ColorPicker } from '@/components/ui/color-picker';
import { Download, Copy, Check } from 'lucide-react';
import { generateQRCode, generateQRCodeSVG, downloadDataUrl, downloadSVG } from '@/lib/utils/qr-code';
import { useSnackbar } from '@/components/providers/snackbar-provider';

interface QRCodeDisplayProps {
  project: {
    name: string;
    slug: string;
    commentUrl: string;
    presentUrl: string;
  };
}

export function QRCodeDisplay({ project }: QRCodeDisplayProps) {
  const { success, error: showError } = useSnackbar();
  const [commentQR, setCommentQR] = useState<string>('');
  const [presentQR, setPresentQR] = useState<string>('');
  const [darkColor, setDarkColor] = useState('#000000');
  const [lightColor, setLightColor] = useState('#FFFFFF');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate QR codes on mount and when colors change
  useEffect(() => {
    generateQRCodes();
  }, [darkColor, lightColor]);

  const generateQRCodes = async () => {
    setIsGenerating(true);
    try {
      const options = {
        width: 1000,
        margin: 2,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      };

      const commentDataUrl = await generateQRCode(project.commentUrl, options);
      const presentDataUrl = await generateQRCode(project.presentUrl, options);

      setCommentQR(commentDataUrl);
      setPresentQR(presentDataUrl);
    } catch (error) {
      console.error('Error generating QR codes:', error);
      showError('Failed to generate QR codes');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPNG = async (url: string, type: 'comment' | 'present') => {
    try {
      const options = {
        width: 1000,
        margin: 2,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      };

      const dataUrl = await generateQRCode(url, options);
      const filename = `${project.slug}-${type}-qr.png`;
      downloadDataUrl(dataUrl, filename);
      success('QR code downloaded');
    } catch (error) {
      console.error('Error downloading PNG:', error);
      showError('Failed to download QR code');
    }
  };

  const handleDownloadSVG = async (url: string, type: 'comment' | 'present') => {
    try {
      const options = {
        width: 1000,
        margin: 2,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      };

      const svg = await generateQRCodeSVG(url, options);
      const filename = `${project.slug}-${type}-qr.svg`;
      downloadSVG(svg, filename);
      success('QR code downloaded');
    } catch (error) {
      console.error('Error downloading SVG:', error);
      showError('Failed to download QR code');
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    success('URL copied to clipboard');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Color Customization */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            QR Code Customization
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
            <Box>
              <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                Dark Color (Foreground)
              </Typography>
              <ColorPicker
                value={darkColor}
                onChange={setDarkColor}
                className="mt-2"
              />
            </Box>
            <Box>
              <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                Light Color (Background)
              </Typography>
              <ColorPicker
                value={lightColor}
                onChange={setLightColor}
                className="mt-2"
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Public Form QR Code */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
            Public Submission Form
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Users scan this to submit feedback
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            {/* QR Code Preview */}
            <Box sx={{ flexShrink: 0 }}>
              {isGenerating || !commentQR ? (
                <Box sx={{ width: 256, height: 256, bgcolor: 'grey.100', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Generating...</Typography>
                </Box>
              ) : (
                <img
                  src={commentQR}
                  alt="Public Form QR Code"
                  className="w-64 h-64 border-2 border-gray-200 rounded-lg"
                />
              )}
            </Box>

            {/* URL and Actions */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                  URL
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <input
                    type="text"
                    value={project.commentUrl}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50"
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleCopyUrl(project.commentUrl)}
                  >
                    {copiedUrl === project.commentUrl ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                  Download Options
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => handleDownloadPNG(project.commentUrl, 'comment')}
                    startIcon={<Download className="h-4 w-4" />}
                  >
                    Download PNG
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => handleDownloadSVG(project.commentUrl, 'comment')}
                    startIcon={<Download className="h-4 w-4" />}
                  >
                    Download SVG
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Presentation QR Code */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
            Presentation Display
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Direct link to the presentation slideshow
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            {/* QR Code Preview */}
            <Box sx={{ flexShrink: 0 }}>
              {isGenerating || !presentQR ? (
                <Box sx={{ width: 256, height: 256, bgcolor: 'grey.100', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">Generating...</Typography>
                </Box>
              ) : (
                <img
                  src={presentQR}
                  alt="Presentation QR Code"
                  className="w-64 h-64 border-2 border-gray-200 rounded-lg"
                />
              )}
            </Box>

            {/* URL and Actions */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                  URL
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <input
                    type="text"
                    value={project.presentUrl}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50"
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleCopyUrl(project.presentUrl)}
                  >
                    {copiedUrl === project.presentUrl ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                  Download Options
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => handleDownloadPNG(project.presentUrl, 'present')}
                    startIcon={<Download className="h-4 w-4" />}
                  >
                    Download PNG
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => handleDownloadSVG(project.presentUrl, 'present')}
                    startIcon={<Download className="h-4 w-4" />}
                  >
                    Download SVG
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Print Instructions */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Printing Tips
          </Typography>
          <Box component="ul" sx={{ pl: 3, '& li': { mb: 1, color: 'text.secondary' } }}>
            <li>Download the SVG version for the highest quality when printing at large sizes</li>
            <li>PNG files work great for most standard printing needs</li>
            <li>Test scan the printed QR code before deploying to ensure it works</li>
            <li>Print with good contrast - dark code on light background works best</li>
            <li>Leave adequate white space around the QR code (minimum 1cm on all sides)</li>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
