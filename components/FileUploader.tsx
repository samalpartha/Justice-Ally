
import React, { useState } from 'react';
import { UploadedFile } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  onLinkAdded?: (link: UploadedFile) => void;
}

const MAX_FILE_SIZE_MB = 20;

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected, onLinkAdded }) => {
  const { t } = useLanguage();
  const [url, setUrl] = useState('');
  const [linkName, setLinkName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recentUploads, setRecentUploads] = useState<{name: string, date: string}[]>(() => {
      const saved = localStorage.getItem('recent_uploads');
      return saved ? JSON.parse(saved) : [];
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files.length > 0) {
      // Explicitly type the array to avoid 'unknown' inference
      const selected: File[] = Array.from(e.target.files);
      
      // Validate
      const validFiles: File[] = [];
      let error = "";

      for (const file of selected) {
          if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
              error = `${t('uploader', 'fileTooLarge')} (${file.name})`;
              continue;
          }
          if (!['application/pdf', 'image/jpeg', 'image/png', 'video/mp4', 'video/quicktime', 'video/webm'].includes(file.type)) {
              // Note: Quicktime is .mov
              if (!file.name.endsWith('.mov')) { // basic fallback check
                 error = `${t('uploader', 'unsupportedType')} (${file.name})`;
                 continue;
              }
          }
          validFiles.push(file);
      }

      if (error) {
          setErrorMsg(error);
      }

      if (validFiles.length > 0) {
          onFilesSelected(validFiles);
          
          // Update Recent History
          const newHistory = [
              ...validFiles.map(f => ({ name: f.name, date: new Date().toLocaleDateString() })),
              ...recentUploads
          ].slice(0, 5);
          setRecentUploads(newHistory);
          localStorage.setItem('recent_uploads', JSON.stringify(newHistory));
      }
    }
  };

  const handleAddLink = () => {
    if (!url || !linkName || !onLinkAdded) return;
    const newLink: UploadedFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: linkName,
      url: url,
      type: 'link'
    };
    onLinkAdded(newLink);
    setUrl('');
    setLinkName('');
  };

  return (
    <div className="w-full space-y-6">
      {/* File Dropzone */}
      <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-sm cursor-pointer transition-all group ${errorMsg ? 'border-red-500 bg-red-950/10' : 'border-slate-800 bg-slate-950 hover:bg-slate-900 hover:border-amber-600'}`} title="Drag and drop or click to select files. Supports PDF, Images, and Video.">
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          {errorMsg ? (
             <svg className="w-8 h-8 mb-3 text-red-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ) : (
             <svg className="w-8 h-8 mb-3 text-slate-500 group-hover:text-amber-600 transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
               <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
             </svg>
          )}
          <p className="mb-1 text-sm text-slate-400 font-serif"><span className={`font-bold ${errorMsg ? 'text-red-400' : 'text-slate-200 group-hover:text-amber-500'}`}>{t('uploader', 'dropzoneMain')}</span> {t('uploader', 'dropzoneSub')}</p>
          <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">{t('uploader', 'formats')}</p>
          {errorMsg && (
            <div className="mt-2 bg-red-950/80 px-3 py-1 border border-red-900 rounded-sm inline-flex items-center gap-2">
                <span className="text-[9px] text-red-300 font-bold uppercase tracking-wider">{errorMsg}</span>
            </div>
          )}
        </div>
        <input 
          type="file" 
          className="hidden" 
          multiple 
          accept=".pdf,.jpg,.jpeg,.png,.mp4,.mov,.webm"
          onChange={handleFileChange}
        />
      </label>

      {/* Recent Uploads (Local History) */}
      {recentUploads.length > 0 && (
          <div className="px-4">
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">Recent Session Uploads</p>
              <ul className="space-y-1">
                  {recentUploads.map((file, idx) => (
                      <li key={idx} className="flex justify-between text-xs text-slate-400 font-mono border-b border-slate-800/50 pb-1">
                          <span className="truncate max-w-[200px]">{file.name}</span>
                          <span className="text-slate-600">{file.date}</span>
                      </li>
                  ))}
              </ul>
          </div>
      )}

      {/* OR Divider */}
      <div className="flex items-center gap-4">
        <div className="h-px bg-slate-800 flex-1"></div>
        <span className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">{t('uploader', 'divider')}</span>
        <div className="h-px bg-slate-800 flex-1"></div>
      </div>

      {/* Link Input */}
      {onLinkAdded && (
        <div className="bg-slate-900 border border-slate-800 rounded-sm p-4 flex flex-col gap-3">
           <input 
             type="text" 
             placeholder={t('uploader', 'citationTitle')}
             value={linkName}
             onChange={(e) => setLinkName(e.target.value)}
             className="bg-slate-950 border-b border-slate-700 rounded-none px-2 py-2 text-sm text-white focus:border-amber-600 outline-none font-serif placeholder:text-slate-600"
           />
           <div className="flex flex-col md:flex-row gap-3">
             <input 
               type="text" 
               placeholder={t('uploader', 'urlPlaceholder')}
               value={url}
               onChange={(e) => setUrl(e.target.value)}
               className="bg-slate-950 border-b border-slate-700 rounded-none px-2 py-2 text-sm text-white focus:border-amber-600 outline-none flex-1 font-serif placeholder:text-slate-600"
             />
             <button 
               onClick={handleAddLink}
               disabled={!url || !linkName}
               className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-3 md:py-0 rounded-sm border border-slate-700 text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
             >
               {t('uploader', 'attachBtn')}
             </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
