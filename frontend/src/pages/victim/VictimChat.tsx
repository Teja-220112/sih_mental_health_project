import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { MessageSquare, Send, Bot, User, ShieldCheck, Mic, MicOff, HeartHandshake } from 'lucide-react';

export const VictimChat: React.FC = () => {
  const { victim, user } = useAuth();
  const victimId = victim?.id || user?.id || '70000000-0000-0000-0000-000000000001';

  const [sessionId, setSessionId] = useState<string>('session-1');
  const [messages, setMessages] = useState<Array<{ sender: string; message_text: string; timestamp?: string }>>([
    {
      sender: 'bot',
      message_text: `Hello ${victim?.name || 'there'}. I am your supportive care assistant. I am here to listen, offer calming guidance, and provide a safe space whenever you need to talk. How are you feeling right now?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initialChatTextRef = useRef<string>('');

  const toggleSpeech = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Chrome, Edge, or Brave.");
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsRecording(false);
      return;
    }

    try {
      initialChatTextRef.current = inputText;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += trans;
          } else {
            interimTranscript += trans;
          }
        }

        const currentSpeech = (finalTranscript + interimTranscript).trim();
        const base = initialChatTextRef.current.trim();
        setInputText(base ? `${base} ${currentSpeech}` : currentSpeech);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn("Failed speech start:", e);
      setIsRecording(false);
    }
  };

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
      // Note: Emotion and sentiment telemetry is intentionally private and NOT shown to victims
    } catch (e) {
      console.warn("API Chat fallback to dynamic local generator:", e);
      const lower = userText.toLowerCase();
      let dynamicReply = `Thank you for sharing that with me. I hear you, and please know that you are not alone in this journey. Would you like me to suggest a relaxing breathing exercise, or would you prefer to talk through what is on your mind?`;
      
      if (lower.includes('sad') || lower.includes('low') || lower.includes('cry') || lower.includes('depressed') || lower.includes('alone')) {
        dynamicReply = "I hear how heavy and overwhelming things feel right now. What you are experiencing is valid, and carrying this stress is difficult. Take a deep, gentle breath with me. I am right here with you.";
      } else if (lower.includes('angry') || lower.includes('mad') || lower.includes('frustrated') || lower.includes('scared') || lower.includes('fear')) {
        dynamicReply = "It is completely normal and understandable to feel this way. Your safety and peace of mind are the top priority. If you ever feel unsafe at any moment, please press the Emergency Call button or reach out to 112.";
      } else if (lower.includes('help') || lower.includes('support') || lower.includes('counsel')) {
        dynamicReply = "Your dedicated counsellor and protection support team are actively assigned to your case. If you'd like to schedule time with your counsellor or need emergency assistance, I can help connect you immediately.";
      }

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            message_text: dynamicReply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 500);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[calc(100vh-14rem)] min-h-[460px] max-h-[720px] transition-colors">
      
      {/* Header */}
      <div className="bg-slate-900 text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="p-2 sm:p-2.5 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30 shrink-0">
            <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-white">Supportive Care Assistant</h3>
            <p className="text-[10px] sm:text-[11px] text-slate-400">Confidential listening &amp; guidance</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-[10px] sm:text-[11px] font-semibold bg-teal-950/80 text-teal-300 px-2.5 sm:px-3 py-1 rounded-full border border-teal-800 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span className="hidden xs:inline">Protected</span>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-teal-50/80 dark:bg-teal-950/60 px-3 sm:px-4 py-2 border-b border-teal-100 dark:border-teal-900/60 text-[10px] sm:text-[11px] text-teal-900 dark:text-teal-200 flex items-center justify-between">
        <span>This assistant is here to listen. For immediate emergency or physical danger, always call <strong>112</strong> or <strong>181</strong>.</span>
      </div>

      {/* Message List */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 sm:space-y-4 bg-slate-50/60 dark:bg-slate-950/40">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-2 sm:space-x-2.5 ${
              msg.sender === 'victim' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender !== 'victim' && (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3 sm:p-3.5 text-xs leading-relaxed shadow-sm ${
                msg.sender === 'victim'
                  ? 'bg-teal-700 text-white rounded-tr-none'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
              }`}
            >
              <p>{msg.message_text}</p>
              <div className={`text-[10px] mt-1.5 text-right ${msg.sender === 'victim' ? 'text-teal-200' : 'text-slate-400 dark:text-slate-500'}`}>
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === 'victim' && (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            )}
          </div>
        ))}

        {isSending && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs italic pl-2 py-1">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
            <span>Assistant is typing a supportive response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isRecording ? "Listening to your voice... Speak now." : "Share your thoughts or concerns with your assistant..."}
          className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none transition-all ${
            isRecording 
              ? 'bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-800 placeholder-red-400 font-medium' 
              : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:border-teal-600'
          }`}
        />

        <button
          type="button"
          onClick={toggleSpeech}
          title={isRecording ? "Stop voice recording" : "Speak into microphone"}
          className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer ${
            isRecording
              ? 'bg-red-600 text-white border-red-700 animate-pulse shadow'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
        </button>

        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="p-2 sm:p-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl shadow transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};

export default VictimChat;
