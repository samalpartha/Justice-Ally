
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UploadedFile } from '../types';
import { sendChatMessage, textToSpeech } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';
import DictationButton from './DictationButton';

interface ChatInterfaceProps {
  files: UploadedFile[];
  onFilesAdded?: (files: File[]) => void;
  onLinkAdded?: (link: UploadedFile) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ files, onFilesAdded, onLinkAdded }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: "I am ready. Use 'Wargame It' to simulate opposing counsel, or 'Simplify' to explain concepts. How shall we proceed?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  
  // Search Grounding Toggle
  const [useSearch, setUseSearch] = useState(false);

  // Link Input in Chat
  const [showLinkInput, setShowLinkInput] = useState(false);
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
      // Prepare history for API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      // Start streaming response
      const streamResult = await sendChatMessage(history, text, files, useSearch);
      
      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'model',
        content: '',
        timestamp: Date.now(),
        hasAudio: true // Assume we can generate audio for this response
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
        content: "I encountered a tactical error accessing the strategy network. Please verify API configuration.",
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
      
      // Add visual feedback to chat
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
       
       // Add visual feedback to chat
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
      // Play Audio
      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
      audio.play();
    } catch (e) {
      console.error("TTS Failed", e);
      alert("Could not generate speech.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header / Mode Toggle */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
         <h2 className="text-white font-bold flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            Tactical Chat
         </h2>
         <div className="flex items-center gap-3">
            <span className={`text-xs font-bold ${useSearch ? 'text-blue-400' : 'text-slate-500'}`}>LEGAL RESEARCH MODE</span>
            <button 
              onClick={() => setUseSearch(!useSearch)}
              className={`w-10 h-5 rounded-full relative transition-colors ${useSearch ? 'bg-blue-600' : 'bg-slate-700'}`}
              title="Enable Google Search Grounding to find live case law and news."
            >
               <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${useSearch ? 'left-6' : 'left-1'}`}></div>
            </button>
         </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl p-4 ${
              msg.role === 'user' 
                ? 'bg-amber-700 text-white rounded-tr-none' 
                : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
            }`}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed font-light">
                {msg.content}
              </div>
              {msg.role === 'model' && (
                <div className="mt-2 pt-2 border-t border-slate-800/50 flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                     <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                     </svg>
                     AI-Generated.
                  </span>
                  {msg.hasAudio && (
                    <button onClick={() => playTTS(msg.content)} className="text-slate-400 hover:text-amber-500 transition-colors" title="Read Aloud">
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
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
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="max-w-4xl mx-auto">
          {/* Quick Actions */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            <button 
              onClick={() => handleSend("Wargame It: Simulate the opponent's strongest argument against my current evidence.")}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-xs text-amber-500 whitespace-nowrap transition-colors"
            >
              ⚔️ Wargame It
            </button>
            <button 
              onClick={() => handleSend("Simplify: Explain the last legal concept like I'm a 5th grader.")}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-xs text-blue-400 whitespace-nowrap transition-colors"
            >
              🎓 Simplify
            </button>
             <button 
              onClick={() => handleSend("Draft a timeline of events based on the uploaded documents.")}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-xs text-green-400 whitespace-nowrap transition-colors"
            >
              📅 Create Timeline
            </button>
          </div>

          <div className="relative flex items-center gap-2">
            {/* Attachment Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="p-3 bg-slate-800 text-slate-400 rounded-full hover:bg-slate-700 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
              </button>
              
              {showAttachMenu && (
                <div className="absolute bottom-full mb-2 left-0 bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-64 overflow-hidden z-20">
                   {!showLinkInput ? (
                     <>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full text-left px-4 py-3 hover:bg-slate-700 text-sm text-slate-200 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          Upload Document
                        </button>
                        <button 
                          onClick={() => setShowLinkInput(true)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-700 text-sm text-slate-200 flex items-center gap-2 border-t border-slate-700"
                        >
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                          Add Web Link
                        </button>
                     </>
                   ) : (
                     <div className="p-3">
                        <div className="mb-2">
                           <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Title</label>
                           <input className="w-full bg-slate-900 border border-slate-600 rounded text-xs p-2 text-white" placeholder="e.g. Court Docket" value={linkName} onChange={e => setLinkName(e.target.value)} />
                        </div>
                        <div className="mb-3">
                           <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1">URL</label>
                           <input className="w-full bg-slate-900 border border-slate-600 rounded text-xs p-2 text-white" placeholder="https://..." value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setShowLinkInput(false)} className="flex-1 bg-slate-700 text-xs py-1.5 rounded hover:bg-slate-600 text-slate-300">Back</button>
                          <button onClick={handleLinkSubmit} className="flex-1 bg-amber-600 text-xs py-1.5 rounded hover:bg-amber-500 text-white font-bold">Attach Link</button>
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
              placeholder={useSearch ? "Ask a research question (e.g. 'Latest case law on constructive eviction in NY')..." : "Ask for strategic advice or drafting help..."}
              className={`w-full bg-slate-950 text-white rounded-lg border ${useSearch ? 'border-blue-700 focus:border-blue-500' : 'border-slate-700 focus:border-amber-500'} p-4 pr-16 focus:outline-none`}
              disabled={isStreaming}
            />
            
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
               <DictationButton 
                 onTranscript={(text) => setInput(prev => prev + (prev ? ' ' : '') + text)} 
                 className="p-1.5 hover:bg-slate-800 rounded-full"
               />
               <button
                 onClick={() => handleSend(input)}
                 disabled={isStreaming || !input}
                 className={`p-2 rounded-md text-white disabled:opacity-50 transition-colors ${useSearch ? 'bg-blue-600 hover:bg-blue-500' : 'bg-amber-600 hover:bg-amber-500'}`}
               >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                 </svg>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
