import React, { useState, useEffect } from 'react';
import { FileText, Moon, Sun, LogOut } from 'lucide-react';
import PDFUploader from './components/PDFUploader';
import PDFViewerWithGemini from './components/PDFViewerWithGemini';
import LoginPage from './components/LoginPage';
import DocumentList from './components/DocumentList';
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';
import { LiveAPIProvider } from './contexts/LiveAPIContext';

interface Document {
  id: string;
  name: string;
  created_at: string;
  last_accessed: string;
  storage_path: string;
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
if (typeof API_KEY !== "string") {
  throw new Error("set VITE_GEMINI_API_KEY in .env");
}

const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      // Fetch user's documents
      const fetchDocuments = async () => {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .order('last_accessed', { ascending: false });

        if (error) {
          console.error('Error fetching documents:', error);
        } else {
          setDocuments(data || []);
        }
      };

      fetchDocuments();
    }
  }, [user]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleClosePDF = () => {
    setPdfFile(null);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-[#FDF6E3] text-gray-800'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-current border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage isDarkMode={isDarkMode} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-[#FDF6E3] text-gray-800'
    }`}>
      {!pdfFile ? (
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Your Documents</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => supabase.auth.signOut()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
          <DocumentList
            documents={documents}
            onDocumentSelect={setPdfFile}
            onFileSelect={setPdfFile}
          />
        </div>
      ) : (
        <LiveAPIProvider apiKey={API_KEY} url={uri}>
          <PDFViewerWithGemini
            file={pdfFile} 
            isDarkMode={isDarkMode} 
            onThemeToggle={toggleTheme}
            onClose={handleClosePDF}
          />
        </LiveAPIProvider>
      )}
    </div>
  );
}

export default App;