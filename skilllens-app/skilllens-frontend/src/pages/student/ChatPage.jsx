import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Bot,
  User,
  Info,
  Loader2,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

export const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    const fetchHistory = async () => {
      setInitialLoading(true);
      try {
        const res = await api.get('/chat/history');
        const history = res.data?.messages || res.data || [];
        if (history.length > 0) {
          setMessages(history);
          if (history[0].conversationId) {
            setConversationId(history[0].conversationId);
          }
        } else {
          // Welcome default greeting
          setMessages([
            {
              id: 'welcome',
              senderType: 'ASSISTANT',
              content:
                "Hello! I am your SkillLens Career Advisory Assistant. I can help evaluate your verified competencies, explain skill gap calculations, recommend career pathways, or guide interview prep.",
              verifiedFacts: [
                "Your responses are contextualized using your verified student assessments and active roadmap milestones.",
                "Factual data points are tagged and distinguished from strategic suggestions."
              ],
              suggestions: [
                "How do I prepare for a Full Stack Engineer role?",
                "Which skill gap should I bridge first?",
                "What projects will best demonstrate my Java proficiency?"
              ],
              sourceLinks: [
                { title: "SkillLens Gap Methodology", url: "/skill-gap" }
              ],
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      } catch (err) {
        console.warn('Chat history error:', err.message);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const text = inputValue.trim();
    if (!text || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      senderType: 'USER',
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const res = await api.post('/chat/messages', {
        message: text,
        conversationId: conversationId || undefined,
      });

      const botReply = res.data;
      if (botReply.conversationId) {
        setConversationId(botReply.conversationId);
      }
      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg = {
        id: `err-${Date.now()}`,
        senderType: 'ASSISTANT',
        content:
          "I am having difficulty retrieving real-time responses right now. Please try referencing your Skill Gap Analysis or Roadmap directly, or verify your query and ask again.",
        suggestions: [
          "Check your Roadmap Page",
          "Review your Assessment Scores"
        ],
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendPrompt = (promptText) => {
    setInputValue(promptText);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-navy-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <span>AI Career Advisor</span>
          </h1>
          <p className="text-xs text-slate-500">
            Intelligent career counseling referencing your active assessment proficiencies and roadmap targets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge status="VERIFIED" label="FACT-CHECKED AI" size="sm" />
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.senderType === 'USER';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-navy-900 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Bot className="w-4 h-4 text-brand-400" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-sm space-y-3 leading-relaxed ${
                  isUser
                    ? 'bg-navy-900 text-white rounded-tr-xs shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-card'
                }`}
              >
                {/* Main text content */}
                <div className="whitespace-pre-line">{msg.content}</div>

                {/* Visually Distinct: Verified Facts Section */}
                {msg.verifiedFacts && msg.verifiedFacts.length > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Verified Benchmark Facts</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1">
                      {msg.verifiedFacts.map((fact, idx) => (
                        <li key={idx} className="text-emerald-900/90 font-medium">
                          {fact}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Visually Distinct: AI Strategic Suggestions */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-brand-900">
                      <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                      <span>Strategic Recommendations</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendPrompt(sug)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-brand-800 hover:bg-brand-50 hover:border-brand-300 font-medium transition-colors text-left"
                        >
                          "{sug}"
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Source Links Beneath Factual Answers */}
                {msg.sourceLinks && msg.sourceLinks.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[11px] font-semibold text-slate-400">Sources:</span>
                    {msg.sourceLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-800 font-medium"
                      >
                        <span>{link.title || 'Documentation Reference'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[10px] ${
                    isUser ? 'text-slate-300' : 'text-slate-400'
                  } text-right`}
                >
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-navy-900 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-brand-400" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-4 shadow-card flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
              <span>Analyzing student profile & generating guidance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Box */}
      <Card className="border-slate-200 shadow-card">
        <form onSubmit={handleSendMessage} className="p-3 flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={loading}
            placeholder="Ask about role requirements, skill gaps, or interview strategies..."
            className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!inputValue.trim() || loading}
            icon={Send}
            iconPosition="right"
          >
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ChatPage;
