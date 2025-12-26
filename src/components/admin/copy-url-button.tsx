'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useSnackbar } from '@/components/providers/snackbar-provider';

interface CopyUrlButtonProps {
  url: string;
  label?: string;
}

export function CopyUrlButton({ url, label = 'Copy URL' }: CopyUrlButtonProps) {
  const [copied, setCopied] = useState(false);
  const { success } = useSnackbar();

  const handleCopy = async () => {
    try {
      // Get the full URL
      const fullUrl = `${window.location.origin}${url}`;

      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      success('URL copied to clipboard!');

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-6 px-2 text-xs"
      title={label}
    >
      {copied ? (
        <Check className="h-3 w-3 text-green-600" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  );
}
