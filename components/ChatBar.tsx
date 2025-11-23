import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface ChatBarProps {
  onSendMessage: (msg: string) => void;
  isGenerating: boolean;
}

export const ChatBar: React.FC<ChatBarProps> = ({ onSendMessage, isGenerating }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    onSendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-l border-zinc-800 w-80 shrink-0">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          AI Editor
        </h2>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-sm text-zinc-300 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-white font-medium">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>Yes, you can make changes!</span>
          </div>
          <p className="text-zinc-400 leading-relaxed mb-3">
            Your design has been converted to code. You can now iterate on it indefinitely using this chat.
          </p>
          <div className="space-y-2">
            <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800/50 text-xs text-zinc-500 italic">
                "Change the background to a dark gradient"
            </div>
             <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800/50 text-xs text-zinc-500 italic">
                "Make the buttons rounder and larger"
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-zinc-800 bg-zinc-900">
        <form onSubmit={handleSubmit} className="relative">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isGenerating ? "AI is thinking..." : "Describe a change..."}
                disabled={isGenerating}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-4 pr-10 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
            <button 
                type="submit"
                disabled={isGenerating || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-purple-600 disabled:opacity-50 disabled:hover:bg-zinc-800 disabled:hover:text-zinc-400 transition-colors"
            >
                {isGenerating ? (
                    <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                    <Send className="w-4 h-4" />
                )}
            </button>
        </form>
      </div>
    </div>
  );
};