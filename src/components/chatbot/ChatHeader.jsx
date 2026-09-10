import React from 'react';
import { Bot, RefreshCw, X, Sparkles } from 'lucide-react';

const ChatHeader = ({ onResetSession, onClose, isResetting }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl shadow-md">
      <div className="flex items-center space-x-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white">
          <Bot className="w-6 h-6" />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-blue-600 rounded-full"></span>
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <h3 className="font-semibold text-sm leading-tight text-white">Trợ lý Care Slot</h3>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
          </div>
          <p className="text-xs text-blue-100 flex items-center gap-1 mt-0.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Tư vấn chuyên khoa AI
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <button
          type="button"
          onClick={onResetSession}
          disabled={isResetting}
          title="Tạo đoạn chat mới"
          className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
        </button>
        <button
          type="button"
          onClick={onClose}
          title="Đóng chat"
          className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
