// src/components/PDFViewerWithGemini.tsx
import React, { useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { useLiveAPIContext } from '../contexts/LiveAPIContext';
import PDFViewer from './PDFViewer'; // Your existing PDFViewer component

interface PDFViewerWithGeminiProps {
  file: File;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  onClose: () => void;
}

const PDFViewerWithGemini: React.FC<PDFViewerWithGeminiProps> = ({ file, isDarkMode, onThemeToggle, onClose, ...props }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const { client, connected } = useLiveAPIContext();

  // This function captures the PDF viewer and sends it as realtime input to Gemini.
  const captureAndSend = async () => {
    if (viewerRef.current && connected) {
      try {
        // Capture the PDF view using html2canvas
        const canvas = await html2canvas(viewerRef.current, { backgroundColor: null });
        const base64 = canvas.toDataURL('image/jpeg', 1.0);
        const data = base64.slice(base64.indexOf(',') + 1);
        // Send as realtime input with mime type "image/jpeg"
        client.sendRealtimeInput([{ mimeType: 'image/jpeg', data }]);
      } catch (error) {
        console.error('Error capturing PDF view:', error);
      }
    }
  };

  // Capture the view when the file loads or when needed (e.g. on page change).
  useEffect(() => {
    captureAndSend();

    // Optionally update the shared view every 5 seconds:
    const interval = setInterval(captureAndSend, 5000);
    return () => clearInterval(interval);
  }, [file, connected]);

  return (
    <div ref={viewerRef}>
      <PDFViewer file={file} isDarkMode={isDarkMode} onThemeToggle={onThemeToggle} onClose={onClose} {...props} />
    </div>
  );
};

export default PDFViewerWithGemini;
