import React, { useState } from 'react';
import { Send, Clock } from 'lucide-react';

const ChatInput = ({ onSend, isLoading, cooldown }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || cooldown > 0) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-100 rounded-b-2xl">
      <div className="relative flex items-center">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || cooldown > 0}
          placeholder={
            cooldown > 0
              ? `Vui lòng chờ ${cooldown}s trước khi gửi tiếp...`
              : 'Mô tả triệu chứng của bạn (Shift+Enter để xuống dòng)...'
          }
          className="w-full resize-none pl-3.5 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-60 max-h-24 overflow-y-auto"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading || cooldown > 0}
          className="absolute right-1.5 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors shadow-xs"
        >
          {cooldown > 0 ? (
            <Clock className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
