import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Lightbulb, 
  ExternalLink, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { SkeletonLoader, StatusBadge } from '../components/UIState';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/chat/messages');
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Failed to load chat history', err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'student',
      message: query,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/chat/send', { message: query });
      const aiResponse = res.data.reply;
      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'ai',
          message: 'Sorry, I encountered a temporary connection issue. Please retry.',
          is_fallback: true,
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'What skills do Chennai tech employers currently demand?',
    'How do I bridge my gap for Full Stack Engineer?',
    'What are the eligibility criteria for SIH 2026?',
    'Suggest top free learning resources for Docker & Kubernetes.'
  ];

  if (initialLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <SkeletonLoader count={3} className="h-24" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-800 to-indigo-600 text-white flex items-center justify-center shadow">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">SkillLens AI Career Advisor</h1>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-xs text-slate-500">
              Grounded in verified job datasets, curriculum taxonomies, and opportunities
            </p>
          </div>
        </div>

        <StatusBadge status="ACTIVE" label="Grounded AI" size="sm" />
      </div>

      {/* Messages Stream */}
      <div className="flex-1 bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm overflow-y-auto space-y-6">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot className="w-12 h-12 text-blue-600 mx-auto mb-3 opacity-80" />
            <h3 className="text-base font-bold text-slate-800">Ask SkillLens Career Advisor</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              Get factual answers grounded in live engineering recruitment datasets and curated roadmaps.
            </p>

            <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-brand-900 border border-blue-100 text-xs font-semibold transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => {
          const isUser = m.sender === 'student' || m.sender === 'user';
          const verifiedFacts = m.verified_facts ? (typeof m.verified_facts === 'string' ? JSON.parse(m.verified_facts) : m.verified_facts) : [];
          const suggestions = m.suggestions ? (typeof m.suggestions === 'string' ? JSON.parse(m.suggestions) : m.suggestions) : [];
          const sourceLinks = m.source_links ? (typeof m.source_links === 'string' ? JSON.parse(m.source_links) : m.source_links) : [];

          return (
            <div key={m.id} className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                isUser ? 'bg-slate-800 text-white' : 'bg-brand-800 text-white shadow'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] rounded-3xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                isUser ? 'bg-brand-800 text-white' : 'bg-slate-50 border border-slate-200/80 text-slate-800'
              }`}>
                {/* Fallback warning badge */}
                {m.is_fallback && (
                  <div className="mb-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    <span>General Suggestion (Grounded Context Unavailable)</span>
                  </div>
                )}

                <p className="whitespace-pre-line">{m.message}</p>

                {/* Grounded Verified Facts Card */}
                {verifiedFacts.length > 0 && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-white border border-blue-100 shadow-xs">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-brand-900 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Verified Industry Facts:</span>
                    </div>
                    <ul className="space-y-1">
                      {verifiedFacts.map((fact, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                          <span>{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actionable Suggestions Card */}
                {suggestions.length > 0 && (
                  <div className="mt-2.5 p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900 mb-2">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <span>Recommended Strategic Actions:</span>
                    </div>
                    <ul className="space-y-1">
                      {suggestions.map((sug, idx) => (
                        <li key={idx} className="text-xs text-amber-900 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <span>{sug}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Source Citations */}
                {sourceLinks.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="font-bold text-slate-500 uppercase tracking-wider">Sources:</span>
                    {sourceLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-brand-700 hover:text-brand-900 font-semibold underline"
                      >
                        {link.title || link.url}
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    ))}
                  </div>
                )}

                <span className={`block text-[10px] mt-2 ${isUser ? 'text-blue-200' : 'text-slate-400'}`}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold p-2">
            <Bot className="w-5 h-5 text-brand-700 animate-bounce" />
            <span>Formulating grounded career analysis...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="mt-4 bg-white rounded-2xl p-2 border border-slate-200 shadow-sm flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask about high-growth skills, gap analysis, or hackathon opportunities..."
          className="flex-1 px-4 py-2.5 text-xs sm:text-sm outline-none text-slate-800 placeholder-slate-400"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!input.trim() || loading}
          className="px-4 py-2.5 rounded-xl bg-brand-800 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-40 shadow"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
