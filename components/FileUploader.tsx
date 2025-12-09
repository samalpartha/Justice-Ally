
import React, { useState } from 'react';
import { UploadedFile } from '../types';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  onLinkAdded?: (link: UploadedFile) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected, onLinkAdded }) => {
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
    <div className="w-full space-y-4">
      {/* File Dropzone */}
      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-800 hover:border-amber-500/50 transition-all group" title="Upload Documents or Videos">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg className="w-8 h-8 mb-2 text-slate-400 group-hover:text-amber-500 transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
          </svg>
          <p className="mb-1 text-sm text-slate-400"><span className="font-semibold text-amber-500">Click to upload</span> or drag files</p>
          <p className="text-[10px] text-slate-500">PDF, Images, Video (MP4)</p>
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
      <div className="flex items-center gap-2">
        <div className="h-px bg-slate-800 flex-1"></div>
        <span className="text-[10px] text-slate-500 uppercase font-bold">OR Add External Link</span>
        <div className="h-px bg-slate-800 flex-1"></div>
      </div>

      {/* Link Input */}
      {onLinkAdded && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col gap-2">
           <input 
             type="text" 
             placeholder="Link Title (e.g. 'County Clerk Docket', 'News Article')"
             value={linkName}
             onChange={(e) => setLinkName(e.target.value)}
             className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 outline-none"
           />
           <div className="flex gap-2">
             <input 
               type="text" 
               placeholder="https://..."
               value={url}
               onChange={(e) => setUrl(e.target.value)}
               className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 outline-none flex-1"
             />
             <button 
               onClick={handleAddLink}
               disabled={!url || !linkName}
               className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 rounded border border-slate-700 text-xs font-bold uppercase transition-colors disabled:opacity-50"
             >
               Add Link
             </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
