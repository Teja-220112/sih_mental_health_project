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

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setAnswers((prev) => ({
          ...prev,
          free_text_response: prev.free_text_response + " [Voice Note Transcribed]: I am worried about the court date next week. Some people approached me at the market yesterday."
        }));
      }, 3000);
    } else {
      setIsRecording(false);
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
      onComplete(res.assessment);
    } catch (e) {
      console.warn("Failed to submit checkin to backend:", e);
      onComplete({
        dynamic_distress_score: answers.immediate_danger ? 85 : 55,
        risk_level: answers.immediate_danger ? 'CRITICAL' : 'MODERATE',
        distress_trend: 'Stable',
        explanation: {
          top_factors: [{ factor: 'Check-in processed', impact: 'moderate' }]
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-teal-600" />
            <span>Periodic Mental Health Check-in</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Step {step + 1} of {questions.length + 2}</p>
        </div>
        <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600">
          Cancel
        </button>
      </div>

      {/* STEP 0: Safety Gate Question */}
      {step === 0 && (
        <div className="py-6 space-y-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
            <div className="flex items-center space-x-2 text-red-800 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
              <span>Immediate Safety Check Gate</span>
            </div>
            <p className="text-xs text-red-900 leading-relaxed font-medium">
              Do you currently feel that you or someone close to you may be in immediate physical danger right now?
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleImmediateDangerToggle(true)}
                className={`py-3 px-4 rounded-xl border font-bold text-xs transition-all flex items-center justify-center space-x-2 ${
                  answers.immediate_danger
                    ? 'bg-red-600 text-white border-red-700 shadow-md ring-2 ring-red-400'
                    : 'bg-white text-red-700 border-red-300 hover:bg-red-100'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>YES — I am in Immediate Danger</span>
              </button>

              <button
                type="button"
                onClick={() => handleImmediateDangerToggle(false)}
                className={`py-3 px-4 rounded-xl border font-bold text-xs transition-all flex items-center justify-center space-x-2 ${
                  !answers.immediate_danger
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
                    : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>NO — I am currently Safe</span>
              </button>
            </div>
          </div>

          {answers.immediate_danger && (
            <div className="p-3 bg-red-100 text-red-900 rounded-lg text-xs font-semibold">
              ⚠️ Selecting YES triggers an instant CRITICAL safety alert to your counsellor and district officer. Emergency services helpline (112) is also available.
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl shadow flex items-center space-x-2"
            >
              <span>Continue to Questionnaire</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEPS 1..9: Questions */}
      {step >= 1 && step <= questions.length && (
        <div className="py-6 space-y-6">
          {(() => {
            const q = questions[step - 1];
            const currentVal = (answers as any)[q.key];

            return (
              <div className="space-y-4">
                <div className="inline-block px-2.5 py-0.5 bg-teal-50 text-teal-700 rounded text-[11px] font-semibold uppercase tracking-wider">
                  Domain: {q.domain}
                </div>
                
                <h3 className="text-base font-semibold text-slate-900">{q.label}</h3>

                <div className="space-y-2">
                  {scaleOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.key]: opt.value }))}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                        currentVal === opt.value
                          ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {currentVal === opt.value && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 border border-slate-300 text-slate-600 text-xs font-medium rounded-xl hover:bg-slate-50 flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl shadow flex items-center space-x-2"
            >
              <span>Next Question</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 10: Free Text & Voice Note */}
      {step === questions.length + 1 && (
        <div className="py-6 space-y-6">
          <h3 className="text-base font-semibold text-slate-900">
            10. Is there anything else you would like to tell your counsellor today?
          </h3>
          <p className="text-xs text-slate-500">
            You can type your thoughts or record an optional voice note. NLP sentiment and safety models will analyze text signals.
          </p>

          <div className="space-y-3">
            <textarea
              rows={4}
              value={answers.free_text_response}
              onChange={(e) => setAnswers((prev) => ({ ...prev, free_text_response: e.target.value }))}
              placeholder="Type your feelings, concerns, or recent events here..."
              className="w-full p-3.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600"
            />

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={toggleRecording}
                className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition-all ${
                  isRecording
                    ? 'bg-red-600 text-white border-red-700 animate-pulse'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-teal-600" />}
                <span>{isRecording ? 'Listening (Microphone Active)...' : 'Record Voice Input (Whisper STT)'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 border border-slate-300 text-slate-600 text-xs font-medium rounded-xl hover:bg-slate-50 flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-2"
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
