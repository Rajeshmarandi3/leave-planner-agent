import React, { useState } from 'react';
import { Upload, FileText, Image as ImageIcon, X } from 'lucide-react';

const UploadZone = ({ onUpload }) => {
  const [file, setFile] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  return (
    <div className="mb-12">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5 text-accent-primary" />
        Upload HR Holiday List
      </h2>
      
      {!file ? (
        <div 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-border-glass rounded-3xl p-12 flex flex-col items-center justify-center transition-all hover:border-accent-primary group cursor-pointer"
        >
          <div className="bg-accent-primary bg-opacity-10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8 text-accent-primary" />
          </div>
          <p className="text-text-muted text-center max-w-xs">
            Drag and drop your HR holiday list (PDF, XLSX, JPG, PNG) or 
            <span className="text-accent-primary ml-1">browser files</span>
          </p>
        </div>
      ) : (
        <div className="glass p-6 rounded-3xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500 bg-opacity-20 p-3 rounded-xl">
              <FileText className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-xs text-text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze</p>
            </div>
          </div>
          <button 
            onClick={() => setFile(null)}
            className="p-2 hover:bg-white hover:bg-opacity-10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadZone;
