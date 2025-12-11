
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UploadedFile } from '../types';
import { sendChatMessage, textToSpeech } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';
import DictationButton from './DictationButton';
import { useLanguage } from '../context/LanguageContext';

interface ChatInterfaceProps {
  files: UploadedFile[];
  onFilesAdded?: (files: File[]) => void;
  onLinkAdded?: (link: UploadedFile) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ files, onFilesAdded, onLinkAdded }) => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: language === 'es' 
        ? "Abogado, estoy en línea. Use 'Simular Juicio' para simular los argumentos de la contraparte, o solicite aclaración procesal. ¿Cómo procedemos?" 
        : "Counsel, I am online. Use 'Wargame It' to simulate opposing counsel, or request procedural clarification. How shall we proceed?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showTools, setShowTools] = useState(false); // State for Legal Tools Sidebar
  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const streamResult = await sendChatMessage(history, text, language, files, useSearch);
      
      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'model',
        content: '',
        timestamp: Date.now(),
        hasAudio: true
      }]);

      let fullText = '';

      for await (const chunk of streamResult) {
        const c = chunk as GenerateContentResponse;
        const chunkText = c.text || '';
        fullText += chunkText;
        
        setMessages(prev => prev.map(m => 
          m.id === botMsgId ? { ...m, content: fullText } : m
        ));
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: language === 'es' 
          ? "Encontré un error táctico al acceder a la red de estrategia. Por favor verifique la configuración API."
          : "I encountered a tactical error accessing the strategy network. Please verify API configuration.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onFilesAdded) {
      const selectedFiles = Array.from(e.target.files) as File[];
      onFilesAdded(selectedFiles);
      const fileMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: `📎 Uploaded Document(s): ${selectedFiles.map(f => f.name).join(', ')}`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, fileMsg]);
      setShowAttachMenu(false);
    }
  };

  const handleLinkSubmit = () => {
     if(linkName && linkUrl && onLinkAdded) {
       onLinkAdded({
         id: Math.random().toString(36).substr(2, 9),
         name: linkName,
         url: linkUrl,
         type: 'link'
       });
       const linkMsg: ChatMessage = {
         id: Date.now().toString(),
         role: 'user',
         content: `🖇️ Attached Link: ${linkName} (${linkUrl})`,
         timestamp: Date.now()
       };
       setMessages(prev => [...prev, linkMsg]);
       setShowLinkInput(false);
       setShowAttachMenu(false);
       setLinkName('');
       setLinkUrl('');
     }
  };

  const playTTS = async (text: string) => {
    try {
      const base64Audio = await textToSpeech(text);
      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
      audio.play();
    } catch (e) {
      console.error("TTS Failed", e);
      alert("Could not generate speech.");
    }
  };

  return (
    <div className="flex h-full bg-slate-950 overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <div className="px-6 py-5 bg-slate-950 border-b border-slate-800 flex justify-between items-center shadow-lg z-10 shrink-0">
           <div className="group relative">
              <h2 className="text-slate-100 font-serif font-black text-xl tracking-tight">
                {t('chat', 'header')}
              </h2>
              <p className="text-[10px] text-amber-600 uppercase tracking-[0.25em] font-bold">{t('chat', 'subHeader')}</p>
           </div>
           
           <div className="flex items-center gap-3">
             <div className="flex items-center gap-4 bg-slate-900 px-4 py-2 border border-slate-800 rounded-sm">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${useSearch ? 'text-blue-400' : 'text-slate-500'}`} title="Enable Google Search Grounding for real-time legal research">{t('chat', 'researchMode')}</span>
                <button 
                  onClick={() => setUseSearch(!useSearch)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${useSearch ? 'bg-blue-600' : 'bg-slate-800 border border-slate-600'}`}
                >
                   <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all shadow-sm ${useSearch ? 'left-6' : 'left-1'}`}></div>
                </button>
             </div>

             <button
                onClick={() => setShowTools(!showTools)}
                className={`p-2 rounded-sm border transition-colors flex items-center gap-2 ${showTools ? 'bg-amber-700 border-amber-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-amber-500 hover:border-amber-600'}`}
                title="Toggle External Legal Databases & Tools"
             >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
             </button>
           </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-slate-950">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] border shadow-md p-6 relative ${
                msg.role === 'user' 
                  ? 'bg-slate-900 border-amber-900/50 text-slate-100 rounded-tr-none rounded-sm' 
                  : 'bg-slate-900 border-slate-800 text-slate-200 rounded-tl-none rounded-sm'
              }`}>
                <div className={`absolute top-0 w-4 h-4 border-t bg-slate-900 ${
                    msg.role === 'user' 
                    ? '-right-[17px] border-l border-amber-900/50 [clip-path:polygon(0_0,0_100%,100%_0)]' 
                    : '-left-[17px] border-r border-slate-800 [clip-path:polygon(100%_0,100%_100%,0_0)]'
                }`}></div>
                
                <div className={`text-[10px] font-bold uppercase mb-3 tracking-[0.2em] ${msg.role === 'user' ? 'text-amber-600' : 'text-slate-500'}`}>
                  {msg.role === 'user' ? (language === 'es' ? 'CLIENTE' : 'CLIENT') : 'JUSTICE ALLY'}
                </div>
                <div className="whitespace-pre-wrap text-sm leading-7 font-serif">
                  {msg.content}
                </div>
                {msg.role === 'model' && (
                  <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] text-slate-600 font-mono">ID: {msg.id.substring(0,8)}</span>
                    {msg.hasAudio && (
                      <button onClick={() => playTTS(msg.content)} className="text-slate-500 hover:text-amber-500 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider bg-slate-950 px-3 py-1 border border-slate-800 hover:border-amber-600">
                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                         Read Aloud
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-slate-900 border-t border-slate-800 shrink-0">
          <div className="max-w-5xl mx-auto">
            {/* Quick Actions */}
            <div className="flex gap-3 mb-5 overflow-x-auto pb-2">
              <button 
                onClick={() => handleSend("Wargame It: Simulate the opponent's strongest argument against my current evidence.")}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-amber-600 rounded-none text-[10px] text-amber-500 hover:text-amber-400 whitespace-nowrap transition-all uppercase font-bold tracking-[0.1em] flex items-center gap-2"
                title="Simulate opposing counsel's strongest argument and learn how to counter it."
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                {t('chat', 'wargame')}
              </button>
              <button 
                onClick={() => handleSend("Simplify: Explain the last legal concept like I'm a 5th grader.")}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-blue-500 rounded-none text-[10px] text-blue-400 whitespace-nowrap transition-all uppercase font-bold tracking-[0.1em] flex items-center gap-2"
                title="Translate complex legal jargon into simple, plain English."
              >
                 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                {t('chat', 'simplify')}
              </button>
               <button 
                onClick={() => handleSend("Draft a timeline of events based on the uploaded documents.")}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-green-500 rounded-none text-[10px] text-green-400 whitespace-nowrap transition-all uppercase font-bold tracking-[0.1em] flex items-center gap-2"
                title="Create a chronological list of key events extracted from your evidence."
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {t('chat', 'timeline')}
              </button>
            </div>

            <div className="relative flex items-center gap-0 border border-slate-600 bg-slate-950">
              {/* Attachment Menu */}
              <div className="relative border-r border-slate-700">
                <button 
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  className="p-4 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Attach File or Link"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                </button>
                
                {showAttachMenu && (
                  <div className="absolute bottom-full mb-2 left-0 bg-slate-900 border border-slate-600 shadow-2xl w-72 z-20">
                     {!showLinkInput ? (
                       <>
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full text-left px-5 py-4 hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-3 uppercase font-bold tracking-wider"
                          >
                            {t('chat', 'uploadDoc')}
                          </button>
                          <button 
                            onClick={() => setShowLinkInput(true)}
                            className="w-full text-left px-5 py-4 hover:bg-slate-800 text-xs text-slate-200 flex items-center gap-3 border-t border-slate-800 uppercase font-bold tracking-wider"
                          >
                            {t('chat', 'refLink')}
                          </button>
                       </>
                     ) : (
                       <div className="p-4">
                          <div className="mb-3">
                             <input className="w-full bg-slate-950 border border-slate-700 text-xs p-2 text-white font-serif" placeholder="Title" value={linkName} onChange={e => setLinkName(e.target.value)} />
                          </div>
                          <div className="mb-4">
                             <input className="w-full bg-slate-950 border border-slate-700 text-xs p-2 text-white font-serif" placeholder="URL" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setShowLinkInput(false)} className="flex-1 bg-slate-800 text-[10px] py-2 text-slate-300 uppercase font-bold">Back</button>
                            <button onClick={handleLinkSubmit} className="flex-1 bg-amber-700 text-[10px] py-2 text-white font-bold uppercase">Attach</button>
                          </div>
                       </div>
                     )}
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
              </div>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                placeholder={useSearch ? t('chat', 'enterResearch') : t('chat', 'enterMsg')}
                className="flex-1 bg-transparent text-white p-4 focus:outline-none font-serif text-sm placeholder:text-slate-600"
                disabled={isStreaming}
              />
              
              <div className="flex items-center gap-2 pr-2">
                 <DictationButton 
                   onTranscript={(text) => setInput(prev => prev + (prev ? ' ' : '') + text)} 
                   className="p-2 hover:bg-slate-800 text-slate-500"
                 />
                 <button
                   onClick={() => handleSend(input)}
                   disabled={isStreaming || !input}
                   className={`p-2 text-white disabled:opacity-50 transition-colors ${useSearch ? 'text-blue-500 hover:text-blue-400' : 'text-amber-600 hover:text-amber-500'}`}
                   title="Send Message"
                 >
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                   </svg>
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Tools Sidebar */}
      {showTools && (
        <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl z-20 shrink-0 h-full">
           <div className="p-6 border-b border-slate-800 bg-slate-950">
             <div className="flex justify-between items-center mb-1">
                <h3 className="text-white font-serif font-bold">{t('chat', 'legalTools')}</h3>
                <button onClick={() => setShowTools(false)} className="text-slate-500 hover:text-white">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
             <p className="text-[10px] text-amber-600 uppercase tracking-widest font-bold">{t('chat', 'extDb')}</p>
           </div>
           
           <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {/* Google Scholar */}
              <div className="bg-slate-950 border border-slate-800 rounded-sm p-4 hover:border-blue-500/50 transition-colors group">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-900/20 rounded-sm text-blue-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                    <span className="font-bold text-slate-200 text-sm">Google Scholar</span>
                 </div>
                 <p className="text-xs text-slate-500 mb-3 font-serif">{t('chat', 'scholarDesc')}</p>
                 <a href="https://scholar.google.com/scholar_courts" target="_blank" rel="noreferrer" className="block w-full py-2 bg-slate-900 text-blue-400 text-center text-[10px] font-bold uppercase tracking-widest border border-slate-800 hover:bg-blue-900/20 hover:border-blue-500 transition-all rounded-sm">
                    {t('chat', 'searchCaseLaw')}
                 </a>
              </div>

              {/* CourtListener */}
              <div className="bg-slate-950 border border-slate-800 rounded-sm p-4 hover:border-amber-500/50 transition-colors group">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-900/20 rounded-sm text-amber-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                    </div>
                    <span className="font-bold text-slate-200 text-sm">CourtListener</span>
                 </div>
                 <p className="text-xs text-slate-500 mb-3 font-serif">{t('chat', 'clDesc')}</p>
                 <a href="https://www.courtlistener.com/" target="_blank" rel="noreferrer" className="block w-full py-2 bg-slate-900 text-amber-500 text-center text-[10px] font-bold uppercase tracking-widest border border-slate-800 hover:bg-amber-900/20 hover:border-amber-500 transition-all rounded-sm">
                    {t('chat', 'accessDockets')}
                 </a>
              </div>

              {/* Cornell LII */}
              <div className="bg-slate-900 border border-slate-800 rounded-sm p-4 hover:border-red-500/50 transition-colors group">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-900/20 rounded-sm text-red-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                    </div>
                    <span className="font-bold text-slate-200 text-sm">Cornell LII</span>
                 </div>
                 <p className="text-xs text-slate-500 mb-3 font-serif">{t('chat', 'cornellDesc')}</p>
                 <a href="https://www.law.cornell.edu/" target="_blank" rel="noreferrer" className="block w-full py-2 bg-slate-900 text-red-400 text-center text-[10px] font-bold uppercase tracking-widest border border-slate-800 hover:bg-red-900/20 hover:border-red-500 transition-all rounded-sm">
                    {t('chat', 'browseStatutes')}
                 </a>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <p className="text-[9px] text-slate-600 italic">
                  *External links open in a new tab. These are third-party free resources not affiliated with JusticeAlly.
                </p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
