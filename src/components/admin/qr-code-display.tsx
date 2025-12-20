'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
    <div className="space-y-6">
      {/* Color Customization */}
      <Card>
        <CardHeader>
          <CardTitle>QR Code Customization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dark_color">Dark Color (Foreground)</Label>
              <ColorPicker
                value={darkColor}
                onChange={setDarkColor}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="light_color">Light Color (Background)</Label>
              <ColorPicker
                value={lightColor}
                onChange={setLightColor}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Public Form QR Code */}
      <Card>
        <CardHeader>
          <CardTitle>Public Submission Form</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Users scan this to submit feedback
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            {/* QR Code Preview */}
            <div className="flex-shrink-0">
              {isGenerating || !commentQR ? (
                <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Generating...</p>
                </div>
              ) : (
                <img
                  src={commentQR}
                  alt="Public Form QR Code"
                  className="w-64 h-64 border-2 border-gray-200 rounded-lg"
                />
              )}
            </div>

            {/* URL and Actions */}
            <div className="flex-1 space-y-4">
              <div>
                <Label>URL</Label>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={project.commentUrl}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyUrl(project.commentUrl)}
                  >
                    {copiedUrl === project.commentUrl ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Download Options</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadPNG(project.commentUrl, 'comment')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PNG
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadSVG(project.commentUrl, 'comment')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download SVG
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Presentation QR Code */}
      <Card>
        <CardHeader>
          <CardTitle>Presentation Display</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Direct link to the presentation slideshow
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            {/* QR Code Preview */}
            <div className="flex-shrink-0">
              {isGenerating || !presentQR ? (
                <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Generating...</p>
                </div>
              ) : (
                <img
                  src={presentQR}
                  alt="Presentation QR Code"
                  className="w-64 h-64 border-2 border-gray-200 rounded-lg"
                />
              )}
            </div>

            {/* URL and Actions */}
            <div className="flex-1 space-y-4">
              <div>
                <Label>URL</Label>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={project.presentUrl}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyUrl(project.presentUrl)}
                  >
                    {copiedUrl === project.presentUrl ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Download Options</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadPNG(project.presentUrl, 'present')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PNG
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadSVG(project.presentUrl, 'present')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download SVG
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Printing Tips</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Download the SVG version for the highest quality when printing at large sizes</li>
            <li>PNG files work great for most standard printing needs</li>
            <li>Test scan the printed QR code before deploying to ensure it works</li>
            <li>Print with good contrast - dark code on light background works best</li>
            <li>Leave adequate white space around the QR code (minimum 1cm on all sides)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
