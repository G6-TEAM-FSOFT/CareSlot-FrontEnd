import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, AlertTriangle } from 'lucide-react';

const ChatMessageItem = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystemError = message.isError || message.role === 'system';

  if (isSystemError) {
    return (
      <div className="flex items-start gap-2 my-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 shadow-sm">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1 leading-relaxed">{message.text}</div>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 my-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs shrink-0 shadow-xs mb-0.5">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div
        className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
            : 'bg-white text-slate-800 border border-slate-100 rounded-bl-xs shadow-xs'
        }`}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap break-words">{message.text}</div>
        ) : (
          <div className="prose prose-sm max-w-none text-slate-800 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-strong:text-blue-700">
            <ReactMarkdown>{message.text}</ReactMarkdown>
          </div>
        )}

        {message.timestamp && (
          <div
            className={`text-[10px] mt-1 text-right ${
              isUser ? 'text-blue-200' : 'text-slate-400'
            }`}
          >
            {message.timestamp}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs shrink-0 shadow-xs mb-0.5">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};

export default ChatMessageItem;
