import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { PanelLeftClose, PanelLeft, ZoomIn, ZoomOut, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import SoundControl from './SoundControl';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  file: File;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  onClose: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ file, isDarkMode, onThemeToggle, onClose }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState<number[]>([1]);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [scale, setScale] = useState(1);
  const baseWidth = 900;

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPages(Array.from(new Array(numPages), (_, index) => index + 1));
  }

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    document.getElementById(`page-${pageNumber}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleNavbar = () => {
    setIsNavbarVisible(!isNavbarVisible);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const getPageWidth = () => {
    const availableWidth = Math.min(window.innerWidth - (isNavbarVisible ? 400 : 100), baseWidth);
    return availableWidth;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar Navigation */}
      <div 
        className={`${
          isNavbarVisible ? 'w-52' : 'w-0'
        } h-full flex-shrink-0 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } border-r ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        } overflow-hidden transition-all duration-300 relative`}
      >
        <button
          onClick={toggleNavbar}
          className={`absolute top-4 right-4 z-50 p-2 rounded-lg transition-colors duration-200 ${
            isDarkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
          }`}
        >
          <PanelLeftClose className="w-5 h-5" />
        </button>

        <div className="w-52 h-full p-4 overflow-y-auto">
          <div className="sticky top-0 space-y-4">
            <h2 className="text-lg font-serif pl-2">Pages</h2>
            <div className="space-y-4">
              {pages.map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`group relative w-full rounded-lg overflow-hidden transition-transform duration-200 hover:scale-102 ${
                    currentPage === pageNum
                      ? 'ring-2 ring-blue-500'
                      : ''
                  }`}
                >
                  <Document file={file}>
                    <Page
                      pageNumber={pageNum}
                      width={180}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </Document>
                  <div className={`absolute inset-0 flex items-center justify-center ${
                    currentPage === pageNum
                      ? isDarkMode
                        ? 'bg-gray-900/50'
                        : 'bg-white/50'
                      : 'bg-transparent group-hover:bg-gray-900/20'
                    } transition-colors duration-200`}
                  >
                    <span className="text-sm font-medium bg-gray-900/75 text-white px-2 py-1 rounded">
                      {pageNum}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 overflow-y-auto ${isDarkMode ? 'bg-gray-900' : 'bg-[#FDF6E3]'} relative`}>
        {/* Header with controls */}
        <div className={`sticky top-0 z-50 w-full ${
          isDarkMode ? 'bg-gray-800/90 text-gray-100' : 'bg-white/90 text-gray-800'
        } backdrop-blur-sm border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        } px-4 py-2`}>
          <div className="max-w-[900px] mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {!isNavbarVisible && (
                <button
                  onClick={toggleNavbar}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    isDarkMode 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <PanelLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex items-center space-x-2 ml-2">
                <button
                  onClick={handleZoomOut}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    isDarkMode 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="min-w-[60px] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    isDarkMode 
                      ? 'hover:bg-gray-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle isDarkMode={isDarkMode} onToggle={onThemeToggle} />
              <SoundControl isDarkMode={isDarkMode} />
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-100' 
                    : 'hover:bg-gray-100 text-gray-800'
                }`}
                aria-label="Close PDF viewer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-[900px] mx-auto px-8">
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            className="flex flex-col items-center space-y-8 py-8"
          >
            {pages.map((pageNum) => (
              <div
                key={pageNum}
                id={`page-${pageNum}`}
                className="flex justify-center w-full"
              >
                <div className={`shadow-xl transition-shadow duration-300 ${
                  isDarkMode ? 'shadow-gray-800' : 'shadow-gray-300'
                }`}>
                  <Page
                    pageNumber={pageNum}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    width={getPageWidth()}
                    scale={scale}
                  />
                </div>
              </div>
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;