import React, { useState, useRef } from 'react';
import { Paperclip, Sparkles, Send, Upload, FileText, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CommandCenter = ({ onExecute }) => {
  const [inputValue, setInputValue] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    const newFiles = selectedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2),
      progress: 0,
      status: 'uploading'
    }));

    setUploadingFiles(prev => [...prev, ...newFiles]);

    // Upload each file
    selectedFiles.forEach((file, index) => {
      uploadFile(file, newFiles[index].id);
    });

    // Reset input
    e.target.value = '';
  };

  const uploadFile = (file, id) => {
    const formData = new FormData();
    formData.append('files', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:8000/upload-holidays', true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percentComplete = Math.round((e.loaded / e.total) * 90); // Keep 10% for processing
        updateFileState(id, { progress: percentComplete });
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        updateFileState(id, { progress: 100, status: 'completed' });
        // Auto-remove completed files after 3 seconds
        setTimeout(() => {
          removeFile(id);
        }, 3000);
      } else {
        updateFileState(id, { status: 'error' });
      }
    };

    xhr.onerror = () => {
      updateFileState(id, { status: 'error' });
    };

    xhr.send(formData);
  };

  const updateFileState = (id, updates) => {
    setUploadingFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeFile = (id) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-2 rounded-[28px] shadow-2xl border-white border-opacity-10 group focus-within:border-accent-primary transition-all duration-500"
      >
        <div className="relative flex items-center px-4 py-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            multiple 
            className="hidden" 
          />
          
          <button 
            onClick={handleFileClick}
            className="p-2 hover:bg-white hover:bg-opacity-10 rounded-full transition-all group/btn"
          >
            <Paperclip className="w-5 h-5 text-text-muted group-hover/btn:text-white" />
          </button>
          
          <textarea 
            rows="1"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Feed me your holiday list and balances to unlock vacation mode! 🌴"
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-text-muted px-4 py-2 resize-none text-lg min-h-[44px]"
            style={{ overflow: 'hidden' }}
          />

          <button 
            onClick={() => onExecute(inputValue)}
            className="bg-accent-primary hover:bg-opacity-80 p-3 rounded-2xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] group/send"
          >
            <Sparkles className="w-5 h-5 text-white group-hover/send:rotate-12 transition-transform" />
          </button>
        </div>
        
        <div className="px-6 pb-2 flex gap-4 text-[10px] text-text-muted uppercase tracking-widest font-bold">
          <span 
            className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors"
            onClick={handleFileClick}
          >
            <Upload className="w-3 h-3" /> Attach CSV/PDF
          </span>
          <span className="flex items-center gap-1"><Send className="w-3 h-3" /> Press Enter to Plan</span>
        </div>
      </motion.div>

      {/* Upload Progress Area */}
      <div className="mt-4 space-y-2">
        <AnimatePresence>
          {uploadingFiles.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass p-4 rounded-2xl border border-white border-opacity-5 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${file.status === 'completed' ? 'bg-emerald-500 bg-opacity-20' : 'bg-accent-primary bg-opacity-20'}`}>
                    {file.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <FileText className="w-4 h-4 text-accent-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{file.name}</p>
                    <p className="text-[10px] text-text-muted">{file.size} MB • {file.status}</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeFile(file.id)}
                  className="p-1 hover:bg-white hover:bg-opacity-10 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-text-muted" />
                </button>
              </div>
              
              <div className="w-full bg-white bg-opacity-5 rounded-full h-1.5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${file.progress}%` }}
                  className={`h-full ${file.status === 'completed' ? 'bg-emerald-500' : 'bg-accent-primary'}`}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommandCenter;
