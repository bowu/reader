import React from 'react';
import { FileText, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Document {
  id: string;
  name: string;
  created_at: string;
  last_accessed: string;
  storage_path: string;
}

interface DocumentListProps {
  documents: Document[];
  onDocumentSelect: (file: File) => void;
  onFileSelect: (file: File) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, onDocumentSelect, onFileSelect }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      try {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return;

        // Upload file to storage
        const timestamp = new Date().getTime();
        const storagePath = `${user.id}/${timestamp}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('pdfs')
          .upload(storagePath, file);

        if (uploadError) throw uploadError;

        // Insert document record
        const { error: insertError } = await supabase.from('documents').insert({
          user_id: user.id,
          name: file.name,
          storage_path: storagePath
        });

        if (insertError) throw insertError;
        onFileSelect(file);
      } catch (error) {
        console.error('Error uploading document:', error);
      }
    }
  };

  const handleDocumentClick = async (doc: Document) => {
    try {
      // Get the file from storage
      const { data, error } = await supabase.storage
        .from('pdfs')
        .download(doc.storage_path);

      if (error) throw error;

      // Convert the blob to a File object
      const file = new File([data], doc.name, { type: 'application/pdf' });

      // Update last_accessed timestamp
      await supabase
        .from('documents')
        .update({ last_accessed: new Date().toISOString() })
        .eq('id', doc.id);

      onDocumentSelect(file);
    } catch (error) {
      console.error('Error loading document:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif">My Documents</h2>
        <label className="cursor-pointer inline-flex items-center px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-300">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileInput}
            className="hidden"
          />
          Upload New PDF
        </label>
      </div>
      
      <div className="grid gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => handleDocumentClick(doc)}
          >
            <FileText className="w-8 h-8 text-blue-500 mr-4" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{doc.name}</h3>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Clock className="w-4 h-4 mr-1" />
                <span>Last opened: {formatDate(doc.last_accessed)}</span>
              </div>
            </div>
          </div>
        ))}
        
        {documents.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No documents yet. Upload your first PDF to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentList;