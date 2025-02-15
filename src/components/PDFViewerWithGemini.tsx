// src/components/PDFViewerWithGemini.tsx
import React, { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { useLiveAPIContext } from '../contexts/LiveAPIContext';
import PDFViewer from './PDFViewer';
import { AudioRecorder } from '../lib/audio-recorder';

interface PDFViewerWithGeminiProps {
  file: File;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  onClose: () => void;
}

const PDFViewerWithGemini: React.FC<PDFViewerWithGeminiProps> = ({ file, isDarkMode, onThemeToggle, onClose, ...props }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [audioRecorder] = useState(() => new AudioRecorder());
  const renderCanvasRef = useRef<HTMLCanvasElement>(null);

  const { client, connected, connect, disconnect } = useLiveAPIContext();

  // Auto-connect when component mounts
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Handle audio recording and sending
  useEffect(() => {
    const onData = (base64: string) => {
      client.sendRealtimeInput([
        {
          mimeType: "audio/pcm;rate=16000",
          data: base64,
        },
      ]);
    };

    if (connected && audioRecorder) {
      audioRecorder.on("data", onData).start();
    } else {
      audioRecorder.stop();
    }

    return () => {
      audioRecorder.off("data", onData);
    };
  }, [connected, client, audioRecorder]);

  // Function to convert base64 to blob
  const base64ToBlob = (base64: string, type: string) => {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type });
  };

  // This function captures the PDF viewer and sends it as realtime input to Gemini.
  const captureAndSend = async () => {
    if (viewerRef.current && connected) {
      const canvas = await html2canvas(viewerRef.current);
      const base64 = canvas.toDataURL("image/jpeg", 0.1);
      const data = base64.slice(base64.indexOf(",") + 1, Infinity);
      client.sendRealtimeInput([{ mimeType: "image/jpeg", data }]);
      console.log("Sent image");
    }
  };

  // Capture and send PDF view periodically
  useEffect(() => {
    // Initial capture when component mounts
    captureAndSend();

    // Set up interval for periodic captures
    const interval = setInterval(captureAndSend, 10000);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [connected]);

  return (
    <div ref={viewerRef}>
      <canvas style={{ display: "none" }} ref={renderCanvasRef} />
      <PDFViewer file={file} isDarkMode={isDarkMode} onThemeToggle={onThemeToggle} onClose={onClose} {...props} />
    </div>
  );
};

export default PDFViewerWithGemini;
