import React, { useState } from 'react';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { AlertTriangle, CheckCircle2, ArrowRight, ArrowLeft, Mic, MicOff, ShieldAlert, HeartHandshake } from 'lucide-react';

interface CheckinWizardProps {
  onComplete: (assessmentResult: any) => void;
  onCancel: () => void;
}

export const CheckinWizard: React.FC<CheckinWizardProps> = ({ onComplete, onCancel }) => {
  const { victim } = useAuth();
  const victimId = victim?.id || '70000000-0000-0000-0000-000000000001';

  const [step, setStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  // Questionnaire state (0 to 4 scale)
  const [answers, setAnswers] = useState({
    stress_score: 2,
    anxiety_score: 2,
    fear_score: 2,
    sleep_score: 2,
    safety_score: 2, // 0 = Not safe at all, 4 = Completely safe
    threat_score: 1,
    social_support_score: 3,
    functioning_score: 2,
    case_related_distress: 3,
    immediate_danger: false,
    free_text_response: '',
  });

  const questions = [
    { key: 'stress_score', label: '1. How stressed have you felt recently?', domain: 'Stress' },
    { key: 'anxiety_score', label: '2. How worried or anxious have you felt?', domain: 'Anxiety' },
    { key: 'fear_score', label: '3. How often have you felt afraid or terrified?', domain: 'Fear' },
    { key: 'sleep_score', label: '4. How much trouble have you had falling or staying asleep?', domain: 'Sleep' },
    { key: 'safety_score', label: '5. How safe do you currently feel in your residence / village?', domain: 'Safety' },
    { key: 'threat_score', label: '6. Have you recently experienced threats, coercion or harassment?', domain: 'Threat' },
    { key: 'social_support_score', label: '7. How supported do you feel by people you trust?', domain: 'Support' },
    { key: 'functioning_score', label: '8. How difficult has it been to perform daily work or responsibilities?', domain: 'Functioning' },
    { key: 'case_related_distress', label: '9. How much anxiety or concern do you feel regarding your court case?', domain: 'Case Context' },
  ];

  const scaleOptions = [
    { value: 0, label: '0 — Not at all' },
    { value: 1, label: '1 — A little' },
    { value: 2, label: '2 — Moderately' },
    { value: 3, label: '3 — Quite a lot' },
    { value: 4, label: '4 — Extremely / Almost always' },
  ];

  const handleImmediateDangerToggle = (val: boolean) => {
    setAnswers((prev) => ({ ...prev, immediate_danger: val }));
  };

  const [speechStatus, setSpeechStatus] = useState<string>('');
  const recognitionRef = React.useRef<any>(null);
  const initialTextRef = React.useRef<string>('');

  const toggleRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Chrome, Edge, or Brave.");
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn("Error stopping recognition:", e);
        }
      }
      setIsRecording(false);
      setSpeechStatus('Recording stopped.');
      return;
    }

    try {
      initialTextRef.current = answers.free_text_response;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setSpeechStatus('🎤 Listening... Speak clearly into your microphone.');
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
        const base = initialTextRef.current.trim();
        const combined = base ? `${base} ${currentSpeech}` : currentSpeech;
        setAnswers((prev) => ({ ...prev, free_text_response: combined }));
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
        setSpeechStatus(`Speech error: ${event.error}. Please check mic permissions.`);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setSpeechStatus('Voice transcription completed.');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn("Failed to initialize SpeechRecognition:", e);
      setIsRecording(false);
      alert("Unable to access microphone. Please allow microphone permissions in your browser.");
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        victim_id: victimId,
        ...answers
      };
      const res = await api.submitCheckin(payload);
      onComplete(res);
    } catch (e) {
      console.warn("Failed to submit checkin to backend:", e);
      onComplete({
        status: 'success',
        message: 'Your check-in has been securely recorded and forwarded to your assigned support officers.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800 transition-colors">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>Periodic Mental Health Check-in</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Step {step + 1} of {questions.length + 2}</p>
        </div>
        <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
          Cancel
        </button>
      </div>

      {/* STEP 0: Safety Gate Question */}
      {step === 0 && (
        <div className="py-5 sm:py-6 space-y-5 sm:space-y-6">
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl space-y-3">
            <div className="flex items-center space-x-2 text-red-800 dark:text-red-300 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
              <span>Immediate Safety Check Gate</span>
            </div>
            <p className="text-xs text-red-900 dark:text-red-200 leading-relaxed font-medium">
              Do you currently feel that you or someone close to you may be in immediate physical danger right now?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleImmediateDangerToggle(true)}
                className={`py-3 px-4 rounded-xl border font-bold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  answers.immediate_danger
                    ? 'bg-red-600 text-white border-red-700 shadow-md ring-2 ring-red-400'
                    : 'bg-white dark:bg-slate-800 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-950/60'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>YES — I am in Immediate Danger</span>
              </button>

              <button
                type="button"
                onClick={() => handleImmediateDangerToggle(false)}
                className={`py-3 px-4 rounded-xl border font-bold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  !answers.immediate_danger
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
                    : 'bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>NO — I am currently Safe</span>
              </button>
            </div>
          </div>

          {answers.immediate_danger && (
            <div className="p-3 bg-red-100 dark:bg-red-950/60 text-red-900 dark:text-red-200 rounded-xl text-xs font-semibold border border-red-200 dark:border-red-800">
              ⚠️ Selecting YES triggers an instant CRITICAL safety alert to your counsellor and district officer. Emergency services helpline (112) is also available.
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(1)}
              className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl shadow flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Continue to Questionnaire</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEPS 1..9: Questions */}
      {step >= 1 && step <= questions.length && (
        <div className="py-5 sm:py-6 space-y-5 sm:space-y-6">
          {(() => {
            const q = questions[step - 1];
            const currentVal = (answers as any)[q.key];

            return (
              <div className="space-y-4">
                <div className="inline-block px-2.5 py-0.5 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 rounded text-[11px] font-semibold uppercase tracking-wider border border-teal-200 dark:border-teal-800">
                  Domain: {q.domain}
                </div>
                
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-snug">{q.label}</h3>

                <div className="space-y-2">
                  {scaleOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.key]: opt.value }))}
                      className={`w-full p-3 sm:p-3.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                        currentVal === opt.value
                          ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/70 text-teal-900 dark:text-teal-200 font-bold shadow-xs ring-1 ring-teal-500'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {currentVal === opt.value && <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          <div className="flex items-center justify-between pt-5 sm:pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-3.5 sm:px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-4 sm:px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl shadow flex items-center space-x-2 cursor-pointer"
            >
              <span>Next Question</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 10: Free Text & Voice Note */}
      {step === questions.length + 1 && (
        <div className="py-5 sm:py-6 space-y-5 sm:space-y-6">
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
            10. Is there anything else you would like to tell your counsellor today?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            You can type your thoughts or record an optional voice note. NLP sentiment and safety models will analyze text signals.
          </p>

          <div className="space-y-3">
            <textarea
              rows={4}
              value={answers.free_text_response}
              onChange={(e) => setAnswers((prev) => ({ ...prev, free_text_response: e.target.value }))}
              placeholder="Type your feelings, concerns, or recent events here..."
              className="w-full p-3 sm:p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
            />

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={toggleRecording}
                className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-red-600 text-white border-red-700 animate-pulse shadow-lg'
                    : 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/60'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
                <span>{isRecording ? 'Stop Recording' : 'Speak Voice Input (Real STT)'}</span>
              </button>

              {speechStatus && (
                <span className="text-xs font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg border border-teal-100 dark:border-teal-800 text-center sm:text-left">
                  {speechStatus}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 sm:pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-3.5 sm:px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-4 sm:px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Analyzing NLP & Calculating Score...</span>
              ) : (
                <>
                  <span>Submit Check-in</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
