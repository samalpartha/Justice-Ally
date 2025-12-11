
import React, { useState } from 'react';
import { UploadedFile } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  onLinkAdded?: (link: UploadedFile) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected, onLinkAdded }) => {
  const { t } = useLanguage();
  const [url, setUrl] = useState('');
  const [linkName, setLinkName] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
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
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-800 border-dashed rounded-sm cursor-pointer bg-slate-950 hover:bg-slate-900 hover:border-amber-600 transition-all group" title="Drag and drop or click to select files. Supports PDF, Images, and Video.">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg className="w-8 h-8 mb-3 text-slate-500 group-hover:text-amber-600 transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
          </svg>
          <p className="mb-1 text-sm text-slate-400 font-serif"><span className="font-bold text-slate-200 group-hover:text-amber-500">{t('uploader', 'dropzoneMain')}</span> {t('uploader', 'dropzoneSub')}</p>
          <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">{t('uploader', 'formats')}</p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          multiple 
          accept=".pdf,.jpg,.jpeg,.png,.mp4,.mov,.webm"
          onChange={handleFileChange}
        />
      </label>

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
           <div className="flex gap-3">
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
               className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 rounded-sm border border-slate-700 text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
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
