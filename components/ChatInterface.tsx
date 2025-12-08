import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UploadedFile } from '../types';
import { sendChatMessage } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';

interface ChatInterfaceProps {
  files: UploadedFile[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ files }) => {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      const streamResult = await sendChatMessage(history, text, files);
      
      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'model',
        content: '',
        timestamp: Date.now()
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

  return (
    <div className="flex flex-col h-full bg-slate-950">
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
                <div className="mt-2 pt-2 border-t border-slate-800/50 text-[10px] text-slate-500 flex items-center gap-1">
                   <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                   </svg>
                   AI-Generated. Verify citations.
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

          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder="Ask for strategic advice or drafting help..."
              className="w-full bg-slate-950 text-white rounded-lg border border-slate-700 p-4 pr-12 focus:border-amber-500 focus:outline-none"
              disabled={isStreaming}
            />
            <button
              onClick={() => handleSend(input)}
              disabled={isStreaming || !input}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-amber-600 rounded-md text-white disabled:opacity-50 hover:bg-amber-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;