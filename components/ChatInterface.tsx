
import React, { useState, useRef, useEffect } from "react";
import { CaseData } from "../types";
import { sendChatMessage } from "../services/geminiService";
import { useLanguage } from "../context/LanguageContext";
import DictationButton from "./DictationButton";

interface ChatInterfaceProps {
  caseData: CaseData | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ caseData }) => {
  const { language } = useLanguage();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "model"; content: string }[]
  >([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Auto-scroll ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setError(null);

    // Optimistically add user message to UI
    const newMessages = [
      ...messages,
      { role: "user" as const, content: trimmed },
    ];
    setMessages(newMessages);
    setInput("");

    try {
      setIsSending(true);

      const history = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      }));

      // Construct context string from caseData
      const contextStr = caseData ? `
        SUMMARY: ${caseData.caseSummary}
        NOTES: ${caseData.notes || 'None'}
        DOCUMENTS: ${caseData.documents.map(d => `${d.fileName} (Rel: ${d.relevanceScore}/10)`).join(', ')}
        STRATEGY: ${caseData.strategy?.sunTzu?.strategyName || 'None'}
        DEADLINES: ${caseData.strategy?.procedural?.deadlines?.join(', ') || 'None'}
      ` : undefined;

      const stream = await sendChatMessage(history, trimmed, language, [], false, undefined, contextStr);

      let modelReply = "";

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          modelReply += text;
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            // If last message is from model, update it. Otherwise, add new model message.
            if (last && last.role === "model") {
              copy[copy.length - 1] = { ...last, content: modelReply };
            } else {
              copy.push({ role: "model" as const, content: modelReply });
            }
            return copy;
          });
        }
      }
    } catch (err: any) {
      console.error("Chat Error:", err);
      // Show specific error if available, else generic
      const msg = err?.message || "Service unavailable";
      if (msg.includes("400")) {
         setError("Connection Error: Invalid request structure. Please clear chat and try again.");
      } else if (msg.includes("503") || msg.includes("unavailable")) {
         setError("AI Service Overloaded. Please wait a moment and try again.");
      } else {
         setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSending(false);
    }
  };

  const headerSummary =
    caseData?.caseSummary ||
    "No case summary yet. You can still ask general legal strategy questions.";

  return (
    <section className="flex flex-col h-full bg-slate-950">
      <header className="border-b border-slate-800 px-6 py-4 bg-slate-950 shadow-md z-10">
        <h2 className="text-sm font-semibold tracking-widest text-amber-400 uppercase">
          AI COUNSEL – WARGAME &amp; ASSISTANT
        </h2>
        <p className="mt-1 text-xs text-slate-400 font-serif truncate">
          {headerSummary}
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-slate-950 custom-scrollbar">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-sm shadow-sm text-sm font-serif leading-relaxed ${
                m.role === "user"
                  ? "bg-slate-900 border border-amber-900/50 text-slate-100"
                  : "bg-slate-900 border border-slate-800 text-slate-200"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
            <svg className="w-12 h-12 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            <p className="text-xs text-slate-400 max-w-md">
              Ask AI Counsel to stress-test your strategy, draft questions,
              or simulate the other side. Your current notes and documents
              will be used where available.
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-sm text-center animate-in fade-in slide-in-from-bottom-2">
            <p className="text-xs text-red-400 font-bold uppercase tracking-wide">
              {error}
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="border-t border-slate-800 p-4 bg-slate-900 flex gap-3 items-center"
      >
        <div className="relative flex-1">
          <input
            className="w-full bg-slate-950 text-sm text-slate-100 px-4 py-3 pr-12 rounded-sm border border-slate-700 focus:border-amber-600 outline-none font-serif placeholder:text-slate-600 transition-colors"
            placeholder="Type a question or 'Wargame my next hearing'…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <DictationButton 
              onTranscript={(text) => setInput(prev => prev + (prev ? ' ' : '') + text)}
              className="p-1.5 text-slate-500 hover:text-amber-500 transition-colors rounded-full hover:bg-slate-800"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="px-6 py-3 text-xs font-bold uppercase tracking-wider rounded-sm bg-amber-700 hover:bg-amber-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
        >
          {isSending ? "..." : "Send"}
        </button>
      </form>
    </section>
  );
};

export default ChatInterface;
