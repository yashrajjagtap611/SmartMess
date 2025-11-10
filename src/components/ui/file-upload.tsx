import React, { useRef, useState } from 'react';
import { Upload, X, File, Image, FileText, Music, Video } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isOpen: boolean;
  onClose: () => void;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

const FILE_TYPE_ICONS = {
  'image': Image,
  'video': Video,
  'audio': Music,
  'text': FileText,
  'default': File
};

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return FILE_TYPE_ICONS.image;
  if (fileType.startsWith('video/')) return FILE_TYPE_ICONS.video;
  if (fileType.startsWith('audio/')) return FILE_TYPE_ICONS.audio;
  if (fileType.startsWith('text/')) return FILE_TYPE_ICONS.text;
  return FILE_TYPE_ICONS.default;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  isOpen, 
  onClose, 
  maxSize = 10, // 10MB default
  acceptedTypes = ['image/*', 'video/*', 'audio/*', 'application/pdf', 'text/*']
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isValidType) {
      alert('File type not supported');
      return;
    }

    setSelectedFile(file);
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
      setSelectedFile(null);
      onClose();
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  const FileIcon = selectedFile ? getFileIcon(selectedFile.type) : Upload;

  return (
    <div className="absolute bottom-full left-0 mb-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-card-foreground">Upload File</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!selectedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop a file here, or click to select
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
            >
              Choose File
            </button>
            <p className="text-xs text-muted-foreground mt-2">
              Max size: {maxSize}MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              accept={acceptedTypes.join(',')}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <FileIcon className="w-8 h-8 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <button
                onClick={removeSelectedFile}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleUpload}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
              >
                Upload
              </button>
              <button
                onClick={removeSelectedFile}
                className="px-4 py-2 border border-input text-foreground rounded-md text-sm hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
