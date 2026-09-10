import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Sparkles } from 'lucide-react';
import ChatHeader from './ChatHeader';
import ChatMessageList from './ChatMessageList';
import ChatInput from './ChatInput';
import { chatService } from '../../services/chatService';

const SESSION_STORAGE_KEY = 'care_slot_chat_session_id';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const initializedRef = useRef(false);

  // Interval đếm ngược cooldown Rate Limit
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Khởi tạo Chat Session khi người dùng mở Widget
  useEffect(() => {
    if (isOpen && !initializedRef.current) {
      initializedRef.current = true;
      initChatSession();
    }
  }, [isOpen]);

  const getCurrentTimeString = () => {
    return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const initChatSession = async () => {
    let activeSessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
    setIsLoading(true);

    try {
      if (!activeSessionId) {
        // Tạo Session mới
        const sessionRes = await chatService.createNewSession();
        activeSessionId = sessionRes?.data?.sessionId || sessionRes?.data;
        if (activeSessionId) {
          sessionStorage.setItem(SESSION_STORAGE_KEY, activeSessionId);
          setSessionId(activeSessionId);
        }
        await loadWelcomeMessage();
      } else {
        setSessionId(activeSessionId);
        // Tải lịch sử chat của Session
        const historyRes = await chatService.getHistory(activeSessionId);
        const historyData = historyRes?.data || [];

        if (Array.isArray(historyData) && historyData.length > 0) {
          const formattedMessages = historyData.map((item, index) => ({
            id: `hist-${index}`,
            role: item.role === 'model' ? 'model' : 'user',
            text: item.parts?.[0]?.text || '',
            timestamp: '',
          }));
          setMessages(formattedMessages);
        } else {
          await loadWelcomeMessage();
        }
      }
    } catch (error) {
      console.error('Lỗi khi khởi tạo Chatbot Session:', error);
      // Hiển thị lời chào dự phòng nếu BE gặp sự cố
      setMessages([
        {
          id: 'welcome-fallback',
          role: 'model',
          text: 'Xin chào! Tôi là **Trợ lý Care Slot**. Bạn đang gặp triệu chứng gì, hãy chia sẻ để tôi gợi ý chuyên khoa phù hợp nhé!',
          timestamp: getCurrentTimeString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWelcomeMessage = async () => {
    try {
      const welcomeRes = await chatService.getWelcomeMessage();
      const welcomeText = welcomeRes?.data || 'Xin chào! Tôi là Trợ lý AI Care Slot.';
      setMessages([
        {
          id: 'welcome-msg',
          role: 'model',
          text: welcomeText,
          timestamp: getCurrentTimeString(),
        },
      ]);
    } catch (error) {
      console.warn('Không lấy được lời chào cá nhân hóa:', error);
    }
  };

  const handleResetSession = async () => {
    if (isResetting) return;
    setIsResetting(true);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setSessionId('');
    setMessages([]);

    try {
      const sessionRes = await chatService.createNewSession();
      const newSessionId = sessionRes?.data?.sessionId || sessionRes?.data;
      if (newSessionId) {
        sessionStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
        setSessionId(newSessionId);
      }
      await loadWelcomeMessage();
    } catch (error) {
      console.error('Lỗi reset session:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const handleSendMessage = async (text) => {
    let currentSessionId = sessionId || sessionStorage.getItem(SESSION_STORAGE_KEY);

    if (!currentSessionId) {
      try {
        const sessionRes = await chatService.createNewSession();
        currentSessionId = sessionRes?.data?.sessionId || sessionRes?.data;
        if (currentSessionId) {
          sessionStorage.setItem(SESSION_STORAGE_KEY, currentSessionId);
          setSessionId(currentSessionId);
        }
      } catch (err) {
        console.error('Không tạo được session mới:', err);
      }
    }

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: getCurrentTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await chatService.consult(currentSessionId, text);
      const botReplyText = res?.data || res?.message || 'Đã nhận câu hỏi.';

      const botMsg = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: botReplyText,
        timestamp: getCurrentTimeString(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('Lỗi gửi tin nhắn consult:', error);

      let errorMessage = 'Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.';
      let isRateLimit = false;

      if (typeof error === 'object' && error !== null) {
        if (error.code === 1009 || error.status === 429) {
          isRateLimit = true;
          errorMessage = error.message || 'Bạn đã gửi quá nhiều yêu cầu chat, vui lòng thử lại sau 1 phút.';
          setCooldown(60); // Đếm ngược 60 giây
        } else if (error.message) {
          errorMessage = error.message;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'system',
          isError: true,
          text: errorMessage,
          timestamp: getCurrentTimeString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Khung Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[540px] sm:h-[600px] max-h-[85vh] mb-4 bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          <ChatHeader
            onResetSession={handleResetSession}
            onClose={() => setIsOpen(false)}
            isResetting={isResetting}
          />

          <ChatMessageList messages={messages} isLoading={isLoading} />

          <ChatInput
            onSend={handleSendMessage}
            isLoading={isLoading}
            cooldown={cooldown}
          />
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
        title={isOpen ? 'Đóng chat' : 'Chat tư vấn Care Slot'}
      >
        {isOpen ? (
          <X className="w-6 h-6 transition-transform duration-200 rotate-0" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400 border border-blue-600"></span>
            </span>
          </div>
        )}

        {/* Tooltip khi hover trên FAB */}
        {!isOpen && (
          <div className="absolute right-16 top-2 hidden group-hover:flex items-center px-3 py-1.5 bg-slate-900 text-white text-xs rounded-xl shadow-md whitespace-nowrap animate-in fade-in duration-150">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 mr-1.5" />
            Chat tư vấn Care Slot
          </div>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
