import React, { useEffect, useRef } from 'react';
import ChatMessageItem from './ChatMessageItem';
import { Bot, ShieldAlert } from 'lucide-react';

const ChatMessageList = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50 space-y-1">
      {messages.map((msg, index) => (
        <ChatMessageItem key={msg.id || index} message={msg} />
      ))}

      {isLoading && (
        <div className="flex items-end gap-2 my-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs shrink-0 shadow-xs mb-0.5">
            <Bot className="w-4 h-4" />
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-xs px-4 py-3 shadow-xs flex items-center space-x-1.5">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
          </div>
        </div>
      )}

      {/* Cảnh báo y tế nhỏ phía dưới */}
      <div className="pt-2 pb-1 text-center">
        <div className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-100/80 px-2.5 py-1 rounded-full border border-slate-200/60">
          <ShieldAlert className="w-3 h-3 text-slate-400" />
          <span>Tư vấn mang tính tham khảo. Hãy tham khảo ý kiến bác sĩ khi cần cấp cứu.</span>
        </div>
      </div>

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;
