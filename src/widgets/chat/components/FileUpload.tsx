import React, { useRef, useState } from 'react';
import { Upload, X, FileText, Image, File as FileIcon } from 'lucide-react';
import { useChatStore } from '../store';
import { ChatAPI } from '../utils/api';
import type { FileAttachment } from '../types';

interface FileUploadProps {
  onFilesUploaded: (files: FileAttachment[]) => void;
  className?: string;
  maxFiles?: number;
}

export default function FileUpload({ onFilesUploaded, className = '', maxFiles = 5 }: FileUploadProps) {
  const { config } = useChatStore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const api = new ChatAPI(config);

  const supportedTypes = config.supportedFileTypes || ['.txt', '.md', '.pdf', '.png', '.jpg', '.jpeg'];
  const maxFileSize = config.maxFileSize || 10 * 1024 * 1024; // 10MB

  const handleFiles = async (files: FileList) => {
    if (!config.enableFileUploads) {
      alert('File uploads are disabled');
      return;
    }

    const fileArray = Array.from(files).slice(0, maxFiles);
    
    // Validate files
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of fileArray) {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!supportedTypes.includes(extension)) {
        errors.push(`${file.name}: Unsupported file type`);
        continue;
      }
      
      if (file.size > maxFileSize) {
        errors.push(`${file.name}: File too large (max ${Math.round(maxFileSize / 1024 / 1024)}MB)`);
        continue;
      }
      
      validFiles.push(file);
    }

    if (errors.length > 0) {
      alert('Some files could not be uploaded:\n' + errors.join('\n'));
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);

    try {
      let result;
      if (validFiles.length === 1) {
        result = await api.uploadFile(validFiles[0]);
        if (result.success) {
          onFilesUploaded([{
            id: `file_${Date.now()}`,
            filename: result.file.filename,
            type: result.file.type,
            size: result.file.size,
            content: result.file.content,
            summary: result.file.summary,
          }]);
        }
      } else {
        result = await api.uploadMultipleFiles(validFiles);
        if (result.success) {
          const attachments: FileAttachment[] = result.files.map((file: any) => ({
            id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            filename: file.filename,
            type: file.type,
            size: file.size,
            content: file.content,
            summary: file.summary,
          }));
          onFilesUploaded(attachments);
        }
      }

      if (result.errors && result.errors.length > 0) {
        alert('Some files had errors:\n' + result.errors.map((e: any) => `${e.filename}: ${e.error}`).join('\n'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'txt':
      case 'md':
        return <FileText className="w-4 h-4" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
        return <Image className="w-4 h-4" />;
      default:
        return <FileIcon className="w-4 h-4" />;
    }
  };

  if (!config.enableFileUploads) {
    return null;
  }

  return (
    <div className={`file-upload ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={supportedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      <div
        className={`
          border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className={`w-8 h-8 mb-2 ${isUploading ? 'animate-pulse' : ''}`} />
          
          {isUploading ? (
            <div>
              <p className="text-sm text-gray-600">Uploading files...</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-1">
                Click to upload or drag and drop files here
              </p>
              <p className="text-xs text-gray-500">
                Supported: {supportedTypes.join(', ')} 
                (max {Math.round(maxFileSize / 1024 / 1024)}MB each)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}