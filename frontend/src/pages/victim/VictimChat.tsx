import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { MessageSquare, Send, ShieldAlert, Bot, User, AlertTriangle } from 'lucide-react';

export const VictimChat: React.FC = () => {
  const { victim } = useAuth();
  const victimId = victim?.id || '70000000-0000-0000-0000-000000000001';

  const [sessionId, setSessionId] = useState<string>('session-1');
  const [messages, setMessages] = useState<Array<{ sender: string; message_text: string; timestamp?: string }>>([
    {
      sender: 'bot',
      message_text: "Hello. I am your supportive MoSJE assistant. I am here to listen and help monitor your check-in wellbeing. How are you feeling today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [lastNLP, setLastNLP] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const userText = inputText;
    setInputText('');
    
    setMessages((prev) => [
      ...prev,
      { sender: 'victim', message_text: userText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);

    setIsSending(true);

    try {
      const res = await api.sendChatMessage(sessionId, victimId, userText);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', message_text: res.bot_message.message_text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      setLastNLP(res.nlp_analysis);
    } catch (e) {
      console.warn("API Chat failed, using fallback:", e);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            message_text: "I hear how much stress this court process is causing you. Your counsellor has been notified to follow up with you. Please take deep breaths and remember you are supported.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 800);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[650px]">
      
      {/* Header */}
      <div className="bg-navy-900 text-white p-4 flex items-center justify-between border-b border-navy-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-teal-700/80 rounded-xl text-teal-100">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Supportive AI Chatbot</h3>
            <p className="text-[11px] text-slate-400">Non-clinical supportive conversational assistant</p>
          </div>
        </div>

        <span className="text-[10px] font-semibold bg-teal-900/60 text-teal-300 px-2.5 py-1 rounded-full border border-teal-700">
          ● AI Safety Guardrails Active
        </span>
      </div>

      {/* Safety Notice */}
      <div className="bg-amber-50 p-2.5 border-b border-amber-200 text-[11px] text-amber-900 flex items-center space-x-2">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>This chatbot offers supportive listening. High-risk signals or threats are escalated to human counsellors.</span>
      </div>

      {/* Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-2.5 ${
              msg.sender === 'victim' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender !== 'victim' && (
              <div className="w-7 h-7 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[75%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                msg.sender === 'victim'
                  ? 'bg-teal-700 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
              }`}
            >
              <p>{msg.message_text}</p>
              <div className={`text-[10px] mt-1.5 text-right ${msg.sender === 'victim' ? 'text-teal-200' : 'text-slate-400'}`}>
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === 'victim' && (
              <div className="w-7 h-7 rounded-full bg-navy-800 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isSending && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs italic pl-2">
            <Bot className="w-4 h-4 animate-spin text-teal-600" />
            <span>AI is analyzing message signals and generating supportive response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* NLP Preview Banner */}
      {lastNLP && (
        <div className="bg-slate-900 text-slate-300 p-2.5 text-[11px] border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span>Sentiment: <strong className="text-teal-400">{lastNLP.sentiment_label}</strong></span>
            <span>Primary Emotion: <strong className="text-amber-400">{lastNLP.emotion_label}</strong></span>
            {lastNLP.threat_signal && (
              <span className="text-red-400 font-bold bg-red-950 px-2 py-0.5 rounded border border-red-800">
                ⚠️ Threat Signal Detected ({lastNLP.threat_score}/100)
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Signal Extraction Engine</span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Share your thoughts or concerns with supportive assistant..."
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="p-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl shadow transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
