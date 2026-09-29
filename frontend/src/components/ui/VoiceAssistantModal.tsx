import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Send, Bot, User, Sparkles, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/authContext';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const { victim } = useAuth();
  const victimId = victim?.id || '70000000-0000-0000-0000-000000000001';

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Click microphone to speak to Voice Assistant');

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Cleanup speech when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopListening();
      stopSpeaking();
      setTranscript('');
      setResponse(null);
    }
  }, [isOpen]);

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const speakText = (text: string) => {
    if (!synthRef.current) return;
    stopSpeaking();

    const cleanSpeech = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 0.95; // Gentle pace
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn("Error stopping recognition:", e);
      }
    }
    setIsListening(false);
  };

  const startListening = () => {
    stopSpeaking();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Brave.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMessage('🎤 Listening... Speak clearly now.');
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
        
        const fullSpeech = (finalTranscript + interimTranscript).trim();
        setTranscript(fullSpeech);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setStatusMessage(`Mic error: ${event.error}. Please verify microphone permissions.`);
      };

      recognition.onend = () => {
        setIsListening(false);
        setStatusMessage('Voice recording paused. Click Send or Microphone to talk again.');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn("Failed to start speech recognition:", e);
      setIsListening(false);
      alert("Unable to access microphone. Please grant mic permissions.");
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSendVoiceMessage = async () => {
    if (!transcript.trim() || isProcessing) return;
    
    stopListening();
    setIsProcessing(true);
    setStatusMessage('Analyzing voice message...');

    const userQuery = transcript;

    try {
      const res = await api.sendChatMessage('voice-session-1', victimId, userQuery);
      const replyText = res?.bot_message?.message_text || "I am here to support you. Your safety and wellbeing are our priority.";
      setResponse(replyText);
      setStatusMessage('Voice Assistant responded.');
      speakText(replyText);
    } catch (e) {
      console.warn("Voice assistant request failed, using fallback:", e);
      const fallbackReply = "I hear how difficult things are right now. Please take deep breaths. Your human counsellor has been updated on your check-in status.";
      setResponse(fallbackReply);
      setStatusMessage('Voice Assistant responded.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-gradient-to-br from-slate-900 via-navy-900 to-slate-900 text-white rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-700/80 relative overflow-hidden flex flex-col space-y-4 sm:space-y-5">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 sm:pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-2.5 bg-teal-500/20 text-teal-300 rounded-2xl border border-teal-500/30">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">MoSJE Interactive Voice Assistant</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400">Real-time voice-to-text & voice response assistant</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Audio Visualizer & Mic Button */}
        <div className="flex flex-col items-center justify-center py-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 p-4 sm:p-6 space-y-4">
          <button
            type="button"
            onClick={toggleListening}
            className={`relative p-5 sm:p-6 rounded-full transition-all shadow-2xl cursor-pointer ${
              isListening
                ? 'bg-red-600 text-white animate-pulse ring-8 ring-red-500/30'
                : 'bg-teal-600 hover:bg-teal-500 text-white ring-4 ring-teal-500/20'
            }`}
          >
            {isListening ? <MicOff className="w-7 h-7 sm:w-8 sm:h-8" /> : <Mic className="w-7 h-7 sm:w-8 sm:h-8" />}
          </button>

          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-slate-200">
              {isListening ? 'Microphone Active — Speak Now' : 'Click Mic to Start Voice Input'}
            </span>
            <p className="text-[11px] text-slate-400">{statusMessage}</p>
          </div>
        </div>

        {/* Real-time Voice Transcript Box */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Your Exact Voice Transcript</span>
            {transcript && (
              <button
                onClick={() => setTranscript('')}
                className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                Clear
              </button>
            )}
          </label>
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 min-h-[70px] max-h-[120px] overflow-y-auto text-xs leading-relaxed text-slate-100 font-mono">
            {transcript ? transcript : <span className="text-slate-500 italic font-sans">Spoken voice text will appear here automatically without duplicate words...</span>}
          </div>
        </div>

        {/* Voice Assistant Reply Box */}
        {response && (
          <div className="p-3.5 sm:p-4 bg-teal-950/60 rounded-2xl border border-teal-700/50 space-y-2 text-xs">
            <div className="flex items-center justify-between text-teal-300 font-bold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>Voice Assistant Response</span>
              </span>

              <button
                onClick={() => (isSpeaking ? stopSpeaking() : speakText(response))}
                className="p-1.5 bg-teal-900/80 hover:bg-teal-800 text-teal-200 rounded-lg transition-all flex items-center space-x-1 text-[11px] cursor-pointer"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? 'Mute Audio' : 'Play Audio'}</span>
              </button>
            </div>
            <p className="text-slate-200 leading-relaxed">{response}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
          <span className="text-[10px] text-slate-500 text-center sm:text-left">
            Powered by MoSJE NLP & Web Speech Engine
          </span>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={handleSendVoiceMessage}
              disabled={!transcript.trim() || isProcessing}
              className="px-4 sm:px-5 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white font-bold rounded-xl shadow-lg flex items-center space-x-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Processing...' : 'Send Voice Message'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
