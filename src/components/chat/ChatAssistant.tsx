import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, X, ChevronUp, Bot, User, StopCircle } from 'lucide-react';
import { ChatMessage, EventDetails, FullEventPlan } from '../../types/event';
import { streamChatResponse } from '../../services/geminiService';
import { sanitizeText } from '../../services/sanitizer';
import { QUICK_CHAT_PROMPTS } from '../../constants/defaults';

interface ChatAssistantProps {
  plan: FullEventPlan;
}

export function ChatAssistant({ plan }: ChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Hello! I'm your EventCraft AI assistant. I'm actively synced with **${plan.details.title}** (${plan.details.guestCount} guests, ${plan.details.totalBudget} ${plan.details.currency}). How can I help you refine your timeline, negotiate with vendors, or troubleshoot logistics?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || inputText).trim();
    if (!prompt || isStreaming) return;

    setInputText('');

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const assistantMsgId = `msg-${Date.now()}-ai`;
    const pendingAssistantMessage: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
    };

    const updatedHistory = [...messages, userMessage];
    setMessages([...updatedHistory, pendingAssistantMessage]);
    setIsStreaming(true);

    abortControllerRef.current = new AbortController();

    await streamChatResponse(
      updatedHistory.map((m) => ({ role: m.role, content: m.content })),
      plan.details,
      (chunk) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, content: m.content + chunk } : m))
        );
      },
      () => {
        setIsStreaming(false);
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, isStreaming: false } : m))
        );
      },
      (errorMsg) => {
        setIsStreaming(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content:
                    m.content ||
                    `I encountered an error connecting: ${errorMsg}. Please try asking again.`,
                  isStreaming: false,
                }
              : m
          )
        );
      },
      abortControllerRef.current.signal
    );
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  /**
   * Safe parser for simple markdown bold and bullet points without innerHTML
   */
  const renderFormattedText = (rawContent: string) => {
    const sanitized = sanitizeText(rawContent);
    const lines = sanitized.split('\n');

    return (
      <div className="space-y-1.5 text-xs sm:text-sm">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          // Check if bullet point
          const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('• ') || /^\d+\.\s/.test(line.trim());
          const cleanLine = isBullet ? line.trim().replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '') : line;

          // Simple tokenization for bold **text**
          const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);

          const formattedContent = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-bold">{part.slice(2, -2)}</strong>;
            }
            return part;
          });

          if (isBullet) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-rose-500 font-bold shrink-0">•</span>
                <span>{formattedContent}</span>
              </div>
            );
          }

          return <p key={idx}>{formattedContent}</p>;
        })}
      </div>
    );
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-rose-500 via-rose-600 to-indigo-600 text-white font-bold text-sm shadow-xl shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 no-print"
          aria-label="Open AI Event Planning Assistant Chat"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span>Ask EventCraft AI</span>
        </button>
      )}

      {/* Floating Chat Box Panel */}
      {isOpen && (
        <div
          className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200 no-print"
          role="region"
          aria-label="EventCraft AI Chat Assistant"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-rose-500 via-rose-600 to-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold leading-tight">EventCraft AI Assistant</h4>
                <p className="text-[11px] text-rose-100 truncate max-w-[220px]">
                  Context: {plan.details.title}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white"
              aria-label="Close chat assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex gap-1.5 overflow-x-auto scrollbar-none">
            {QUICK_CHAT_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isStreaming}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-rose-500 transition-colors disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m) => {
              const isAi = m.role === 'assistant';

              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${isAi ? '' : 'flex-row-reverse'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isAi
                        ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[82%] p-3.5 rounded-2xl ${
                      isAi
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-sm'
                        : 'bg-rose-600 text-white rounded-tr-sm'
                    }`}
                  >
                    {m.content ? (
                      renderFormattedText(m.content)
                    ) : (
                      <div className="flex items-center gap-1.5 py-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" />
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce [animation-delay:0.2s]" />
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce [animation-delay:0.4s]" />
                      </div>
                    )}
                    <span className="block text-[10px] text-slate-400 dark:text-slate-400 mt-1 text-right">
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={isStreaming ? 'Streaming response...' : 'Ask about budget cuts, day-of schedules, RSVPs...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isStreaming}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />

              {isStreaming ? (
                <button
                  type="button"
                  onClick={handleStop}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 transition-colors"
                  aria-label="Stop generating response"
                  title="Stop generating"
                >
                  <StopCircle className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  aria-label="Send message to AI assistant"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
