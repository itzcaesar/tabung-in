'use client';

import { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScanLine, Upload, Image as ImageIcon, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ReceiptsPage() {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploadedFile(file);
    setUploading(true);

    // In production, upload to storage and call OCR API
    // For now, simulate processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setUploading(false);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    },
    [handleFile]
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Receipt Scanner</h1>
        <p className="text-muted-foreground mt-1">
          Upload receipts to automatically extract transaction details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-muted-foreground" />
            Upload Receipt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              'relative border-2 border-dashed rounded-2xl p-12 transition-all duration-200',
              dragActive
                ? 'border-foreground/50 bg-muted'
                : 'border-border hover:border-foreground/30',
              uploading && 'pointer-events-none opacity-50'
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            <div className="flex flex-col items-center text-center">
              {uploading ? (
                <>
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4 animate-pulse">
                    <ScanLine className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium text-foreground mb-2">
                    Processing receipt...
                  </p>
                  <p className="text-muted-foreground">
                    Extracting details with OCR
                  </p>
                </>
              ) : uploadedFile ? (
                <>
                  <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-emerald-500" />
                  </div>
                  <p className="text-lg font-medium text-foreground mb-2">
                    {uploadedFile.name}
                  </p>
                  <p className="text-muted-foreground mb-4">Ready to process</p>
                  <Button
                    onClick={() => setUploadedFile(null)}
                    variant="secondary"
                  >
                    Upload Different Receipt
                  </Button>
                </>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium text-foreground mb-2">
                    Drop your receipt here
                  </p>
                  <p className="text-muted-foreground mb-4">
                    or click to browse your files
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ImageIcon className="h-4 w-4" aria-hidden="true" />
                    <span>Supports JPG, PNG, HEIC</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-foreground">1</span>
              </div>
              <h3 className="font-medium text-foreground mb-2">Upload</h3>
              <p className="text-sm text-muted-foreground">
                Take a photo or upload an image of your receipt
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-foreground">2</span>
              </div>
              <h3 className="font-medium text-foreground mb-2">Extract</h3>
              <p className="text-sm text-muted-foreground">
                AI reads the receipt and extracts merchant, date, and items
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-foreground">3</span>
              </div>
              <h3 className="font-medium text-foreground mb-2">Save</h3>
              <p className="text-sm text-muted-foreground">
                Review the details and save as a transaction
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
