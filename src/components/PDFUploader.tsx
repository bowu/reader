import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';

interface PDFUploaderProps {
  onFileSelect: (file: File) => void;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onFileSelect }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type === 'application/pdf') {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type === 'application/pdf') {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors duration-300"
    >
      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
      <p className="mb-2 text-lg">Drag and drop your PDF here</p>
      <p className="text-sm text-gray-500 mb-4">or</p>
      <label className="cursor-pointer inline-flex items-center px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-300">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileInput}
          className="hidden"
        />
        Choose File
      </label>
    </div>
  );
};

export default PDFUploader;