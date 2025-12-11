
import React, { useRef, useState, useEffect } from 'react';
import { UploadedFile } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface RedactionToolProps {
  file: UploadedFile;
  onSave: (file: File, base64: string) => void;
  onCancel: () => void;
}

export const RedactionTool: React.FC<RedactionToolProps> = ({ file, onSave, onCancel }) => {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [rects, setRects] = useState<{x: number, y: number, w: number, h: number}[]>([]);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
    };
    if (file.base64) {
      img.src = `data:${file.type};base64,${file.base64.replace(/^data:.*,/, '')}`; // Ensure format
    } else if (file.previewUrl) {
      img.src = file.previewUrl;
    } else if (file.file) {
      img.src = URL.createObjectURL(file.file);
    }
  }, [file]);

  // Initial Draw
  useEffect(() => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current;
      // We set canvas size to match image size exactly for full resolution processing
      if (canvas.width !== image.width || canvas.height !== image.height) {
        canvas.width = image.width;
        canvas.height = image.height;
      }
      drawCanvas();
    }
  }, [image, rects]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !image) return;

    // Clear and redraw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
    
    // Draw existing rects
    ctx.fillStyle = '#000000';
    rects.forEach(r => {
      ctx.fillRect(r.x, r.y, r.w, r.h);
    });
  };

  const getPos = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handleStart = (clientX: number, clientY: number) => {
    setIsDrawing(true);
    setStartPos(getPos(clientX, clientY));
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDrawing || !canvasRef.current || !image) return;
    
    // Redraw base state
    drawCanvas();
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const currentPos = getPos(clientX, clientY);
    const w = currentPos.x - startPos.x;
    const h = currentPos.y - startPos.y;
    
    // Draw current selection preview (semi-transparent)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(startPos.x, startPos.y, w, h);
    
    // Draw border
    ctx.strokeStyle = '#fbbf24'; // Amber-500
    ctx.lineWidth = 2;
    ctx.strokeRect(startPos.x, startPos.y, w, h);
  };

  const handleEnd = (clientX: number, clientY: number) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const currentPos = getPos(clientX, clientY);
    const w = currentPos.x - startPos.x;
    const h = currentPos.y - startPos.y;
    
    // Normalize rect (handle negative width/height)
    const newRect = {
        x: w < 0 ? currentPos.x : startPos.x,
        y: h < 0 ? currentPos.y : startPos.y,
        w: Math.abs(w),
        h: Math.abs(h)
    };
    
    // Only add if it has size
    if (newRect.w > 5 && newRect.h > 5) {
        setRects(prev => [...prev, newRect]);
    } else {
        // Redraw to clear the preview rect if it was too small
        drawCanvas(); 
    }
  };

  // Mouse Events
  const onMouseDown = (e: React.MouseEvent) => handleStart(e.clientX, e.clientY);
  const onMouseMove = (e: React.MouseEvent) => handleMove(e.clientX, e.clientY);
  const onMouseUp = (e: React.MouseEvent) => handleEnd(e.clientX, e.clientY);
  
  // Touch Events
  const onTouchStart = (e: React.TouchEvent) => {
      // Prevent default to stop scrolling while drawing
      if (e.cancelable) e.preventDefault(); 
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchMove = (e: React.TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      const touch = e.changedTouches[0];
      handleEnd(touch.clientX, touch.clientY);
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    
    // Final draw ensures clean state
    drawCanvas();

    const dataUrl = canvasRef.current.toDataURL(file.type || 'image/png');
    
    // Convert base64 to File object
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    const newFile = new File([u8arr], "redacted_" + file.name, {type: mime});
    
    onSave(newFile, dataUrl.split(',')[1]); // Send file object and raw base64 data
  };
  
  const handleUndo = () => {
      setRects(prev => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-1 w-full max-w-6xl flex flex-col shadow-2xl h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-900 rounded-t-lg">
          <div>
            <h3 className="text-white font-serif font-bold text-xl flex items-center gap-2">
               <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
               {t('redaction', 'header')}
            </h3>
            <p className="text-slate-500 text-xs mt-1">{t('redaction', 'subHeader')}</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-[10px] font-bold uppercase text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                {rects.length} {t('redaction', 'count')}
             </div>
             <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
        </div>
        
        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-slate-950/50 relative cursor-crosshair flex items-center justify-center p-4 touch-none">
           {!image && <div className="text-amber-500 animate-pulse font-mono text-sm">{t('redaction', 'loading')}</div>}
           <canvas 
             ref={canvasRef}
             onMouseDown={onMouseDown}
             onMouseMove={onMouseMove}
             onMouseUp={onMouseUp}
             onMouseLeave={onMouseUp}
             onTouchStart={onTouchStart}
             onTouchMove={onTouchMove}
             onTouchEnd={onTouchEnd}
             className="border border-slate-800 shadow-xl max-w-full max-h-full object-contain"
           />
        </div>

        {/* Toolbar */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 rounded-b-lg flex justify-between items-center">
           <div className="flex gap-2">
              <button onClick={handleUndo} disabled={rects.length === 0} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-sm hover:bg-slate-700 border border-slate-700 text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-colors">
                 {t('redaction', 'undo')}
              </button>
              <button onClick={() => setRects([])} disabled={rects.length === 0} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-sm hover:bg-slate-700 border border-slate-700 text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-colors">
                 {t('redaction', 'clear')}
              </button>
           </div>
           <div className="flex gap-3">
             <button onClick={onCancel} className="px-4 py-2 text-slate-400 hover:text-white font-bold uppercase text-xs tracking-wider transition-colors">
               {t('redaction', 'cancel')}
             </button>
             <button onClick={handleSave} className="px-6 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-sm font-bold uppercase text-xs tracking-wider shadow-lg transition-colors flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
               {t('redaction', 'save')}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
