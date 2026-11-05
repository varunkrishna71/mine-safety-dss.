import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Trash2,
  RotateCcw,
  Copy,
  Check,
  ShieldAlert,
  FileText,
  X,
  Bot,
  User,
  Info,
  ExternalLink
} from 'lucide-react';
import { chatWithAi, AiChatMessage } from '../../services/apiClient';

interface AiAssistantScreenProps {
  activeReport?: any | null;
  onClearActiveReport?: () => void;
  onNavigateToReport?: (report: any) => void;
}

export const AiAssistantScreen: React.FC<AiAssistantScreenProps> = ({
  activeReport,
  onClearActiveReport,
  onNavigateToReport,
}) => {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      role: 'assistant',
      content:
        `**Welcome to the Mine Safety AI Assistant.**\n\nI provide statutory explanations grounded in the **Directorate General of Mines Safety (DGMS)** framework and the **Coal Mines Regulations (CMR 2017)**.\n\n` +
        (activeReport
          ? `I have loaded your active inspection report **"${activeReport.title || 'Incident Report'}"** (Risk Score: ${activeReport.riskScore}/100 - ${activeReport.safetyStatus || activeReport.status}). You can ask me to explain its detected hazards, summarize key risks, or identify information gaps.`
          : `You can ask me about statutory threshold limits, Systematic Support Rules (SSR), the six statutory hazard categories, or reporting protocols under Form IV-A, Form J, and Form K.`),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const defaultPromptSuggestions = [
    'Explain CMR 2017 Methane thresholds (0.5%, 1.25%, 2.0%)',
    'What are Systematic Support Rules (SSR) for underground roofs?',
    'Why is ventilation failure immediately hazardous?',
    'What are the statutory criteria for DGMS Form IV-A?',
    'What precautions are mandated for Water Inrush?',
  ];

  const reportPromptSuggestions = [
    'Explain why this report is classified with this risk score',
    'What are the primary hazards detected in this inspection?',
    'What information gaps exist in this report narrative?',
    'What immediate physical inspections should be conducted?',
  ];

  const suggestions = activeReport
    ? [...reportPromptSuggestions, ...defaultPromptSuggestions.slice(0, 2)]
    : defaultPromptSuggestions;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setInputMessage('');
    setErrorText(null);

    const userMsg: AiChatMessage = { role: 'user', content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const response = await chatWithAi(
        text,
        activeReport || undefined,
        newHistory.map((m) => ({ role: m.role, content: m.content }))
      );

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.reply,
        },
      ]);
    } catch (err: any) {
      setErrorText(err.message || 'Failed to communicate with AI Assistant service.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **Service Notice:** Unable to reach Gemini AI service. ${err.message || 'Please check network connectivity or backend service.'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: 'assistant',
        content: `**Conversation cleared.**\n\nAsk any question regarding DGMS guidelines, CMR 2017 statutory requirements, or active inspection report data.`,
      },
    ]);
    setErrorText(null);
  };

  const handleRetryLast = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSend(lastUserMsg.content);
    }
  };

  const handleCopyText = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-amber-300 text-sm mt-2 pt-1 border-b border-amber-900/40">
                {trimmed.replace('### ', '')}
              </h4>
            );
          }
          if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.slice(2, -2).includes('**')) {
            return (
              <p key={idx} className="font-semibold text-slate-100 mt-1">
                {trimmed.slice(2, -2)}
              </p>
            );
          }
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-2">
                <span className="text-amber-400 mt-1">•</span>
                <span>{line.replace(/^[-*]\s+/, '')}</span>
              </div>
            );
          }
          if (/^\d+\.\s/.test(trimmed)) {
            const match = trimmed.match(/^(\d+\.)\s+(.*)/);
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-2">
                <span className="text-amber-400 font-semibold">{match ? match[1] : '•'}</span>
                <span>{match ? match[2] : trimmed}</span>
              </div>
            );
          }
          if (trimmed.startsWith('*Notice:') || trimmed.startsWith('Notice:') || trimmed.startsWith('⚠️')) {
            return (
              <div key={idx} className="p-2 rounded bg-amber-950/40 border border-amber-700/40 text-[11px] text-amber-300 italic mt-2">
                {trimmed}
              </div>
            );
          }
          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }
          return <p key={idx}>{line}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100">
      {/* Top Banner / Context Pill */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-slate-100">AI Safety Assistant</h2>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 font-mono">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-[10px] text-slate-400">DGMS & Coal Mines Regulations 2017 Grounded</p>
            </div>
          </div>
          <button
            onClick={handleClearHistory}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Clear</span>
          </button>
        </div>

        {/* Active Report Context Banner */}
        {activeReport ? (
          <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300 block">
                  Active Report Context
                </span>
                <span className="text-slate-200 font-medium truncate block">
                  {activeReport.title || 'Report'} • Score: {activeReport.riskScore}/100 ({activeReport.safetyStatus || activeReport.status})
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              {onNavigateToReport && (
                <button
                  onClick={() => onNavigateToReport(activeReport)}
                  className="px-2 py-1 rounded bg-indigo-800 hover:bg-indigo-700 text-[10px] text-indigo-100 flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  View
                </button>
              )}
              {onClearActiveReport && (
                <button
                  onClick={onClearActiveReport}
                  className="p-1 text-slate-400 hover:text-slate-200 hover:bg-indigo-900/40 rounded"
                  title="Detach context"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/60 border border-slate-700/40 text-[11px] text-slate-400">
            <Info className="w-3 h-3 text-amber-400 shrink-0" />
            <span>General Q&A Mode. Analyze a report to ask context-aware questions.</span>
          </div>
        )}
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-3 py-2 bg-slate-900/50 border-b border-slate-800/60 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Suggested:</span>
          {suggestions.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleSend(sug)}
              disabled={isLoading}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-amber-950/60 hover:text-amber-300 hover:border-amber-600/50 border border-slate-700 text-slate-300 transition-colors shrink-0 disabled:opacity-50"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  isUser
                    ? 'bg-amber-600 text-white'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`relative max-w-[85%] rounded-2xl p-3 shadow-md ${
                  isUser
                    ? 'bg-amber-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {/* Role / Model tag for assistant */}
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-800/60">
                    <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      DGMS Safety Assistant
                    </span>
                    <button
                      onClick={() => handleCopyText(msg.content, index)}
                      className="text-slate-400 hover:text-slate-200 transition-colors p-0.5"
                      title="Copy explanation"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}

                {/* Formatted Message Body */}
                {isUser ? (
                  <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                ) : (
                  renderFormattedContent(msg.content)
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <Bot className="w-3.5 h-3.5 animate-bounce" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-3 max-w-[85%] space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Consulting CMR 2017 & DGMS Guidelines...</span>
              </div>
              <div className="flex gap-1.5 pt-1">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse delay-75" />
                <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse delay-150" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error / Retry Bar */}
      {errorText && (
        <div className="px-3 py-1.5 bg-rose-950/80 border-t border-rose-800 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center gap-1.5 truncate">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="truncate">{errorText}</span>
          </div>
          <button
            onClick={handleRetryLast}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-800 hover:bg-rose-700 text-[11px] font-medium shrink-0 ml-2"
          >
            <RotateCcw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}

      {/* Input Box and Disclaimer */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              activeReport
                ? `Ask about "${activeReport.title?.slice(0, 20)}..." or CMR 2017 rules`
                : 'Ask about mine safety regulations, hazards, or CMR 2017...'
            }
            disabled={isLoading}
            className="flex-1 bg-slate-950 border border-slate-700 focus:border-amber-500 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center shrink-0"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Human Decision-making / Statutory Disclaimer */}
        <p className="text-[10px] text-center text-slate-500 leading-tight">
          AI-generated information is intended for explanatory decision support only. Under CMR 2017, it does not replace statutory mining officials or the Mine Manager.
        </p>
      </div>
    </div>
  );
};
