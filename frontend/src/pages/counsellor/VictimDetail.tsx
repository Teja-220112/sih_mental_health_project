import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { TrendBadge } from '../../components/ui/TrendBadge';
import { DistressGauge } from '../../components/ui/DistressGauge';
import { AIExplanationCard } from '../../components/ui/AIExplanationCard';
import { 
  ArrowLeft, Calendar, ShieldAlert, FileText, CheckCircle2, UserCheck, 
  Brain, AlertTriangle, Shield, Clock, Plus, Edit3
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface VictimDetailProps {
  victimId: string;
  onBack: () => void;
}

export const VictimDetail: React.FC<VictimDetailProps> = ({ victimId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'checkins' | 'nlp' | 'threats' | 'interventions'>('overview');
  const [trendData, setTrendData] = useState<any[]>([]);
  const [latestAssessment, setLatestAssessment] = useState<any>(null);
  const [threats, setThreats] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for Counselling / Intervention
  const [showModal, setShowModal] = useState(false);
  const [interventionType, setInterventionType] = useState('Scheduled In-Person Counselling');
  const [notes, setNotes] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [isAiOverride, setIsAiOverride] = useState(false);

  useEffect(() => {
    async function loadVictimDetail() {
      try {
        const trendRes = await api.getVictimTrend(victimId);
        setTrendData(trendRes.chart_data || []);
        const riskRes = await api.getLatestRisk(victimId);
        setLatestAssessment(riskRes.latest_assessment);
        const thRes = await api.getVictimThreats(victimId);
        setThreats(thRes.threats || []);
        const invRes = await api.getVictimInterventions(victimId);
        setInterventions(invRes.interventions || []);
      } catch (e) {
        console.warn("Failed to load victim detail from API:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadVictimDetail();
  }, [victimId]);

  const score = latestAssessment?.dynamic_distress_score ?? 82;
  const prevScore = 71;
  const riskLevel = latestAssessment?.risk_level ?? 'CRITICAL';
  const trend = latestAssessment?.distress_trend ?? 'Rapidly Increasing';

  const defaultExplanation = {
    top_factors: [
      { factor: 'Recent intimidation signal reported by victim', impact: 'high' },
      { factor: 'Distress score increased by 11 points from previous assessment', impact: 'high' },
      { factor: 'Severe sleep disturbance & high fear score reported', impact: 'high' },
      { factor: 'Upcoming court trial hearing date in 7 days', impact: 'moderate' }
    ],
    disclaimer: 'AI-assisted screening assessment — requires human professional verification.'
  };

  const handleCreateIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAiOverride && !overrideReason.trim()) {
      alert("Mandatory reason required when overriding AI recommendation.");
      return;
    }

    try {
      await api.createIntervention({
        victim_id: victimId,
        intervention_type: interventionType,
        notes,
        override_reason: isAiOverride ? overrideReason : null
      });

      alert("Intervention recorded successfully!");
      setShowModal(false);
      const invRes = await api.getVictimInterventions(victimId);
      setInterventions(invRes.interventions || []);
    } catch (e) {
      console.warn("Failed to create intervention:", e);
      setShowModal(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900">Victim Code: VIC-2026-101</h2>
              <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                Case: POA-PUNE-2026-042
              </span>
            </div>
            <p className="text-xs text-slate-500">Sunita Devi • Female (26-35) • Pune District</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <RiskBadge level={riskLevel} size="lg" />
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center space-x-1.5"
          >
            <UserCheck className="w-4 h-4" />
            <span>Record Intervention</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Current Score</span>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">{score} <span className="text-xs font-normal text-slate-400">/ 100</span></div>
          <span className="text-[10px] text-slate-400 mt-1">Screening Signal</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Previous Assessment</span>
          <div className="text-2xl font-bold text-slate-700 mt-1">{prevScore} <span className="text-xs font-normal text-slate-400">/ 100</span></div>
          <span className="text-[10px] text-slate-400 mt-1">Change: +{score - prevScore} pts</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Distress Trend</span>
          <div className="mt-2"><TrendBadge trend={trend} /></div>
          <span className="text-[10px] text-slate-400 mt-1">7-Day Change Horizon</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Safety Concern</span>
          <div className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md mt-2 border border-red-200 inline-flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Intimidation Reported</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Escalated to Protection Officer</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex space-x-4">
        {[
          { id: 'overview', label: 'Longitudinal Overview & AI Factors' },
          { id: 'checkins', label: 'Domain Scores Breakdown' },
          { id: 'nlp', label: 'NLP Signal Analysis' },
          { id: 'threats', label: 'Threat & Protection Events' },
          { id: 'interventions', label: 'Counselling Records' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Longitudinal Distress Recovery Curve</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData.length > 0 ? trendData : [
                  { date: 'Aug 5', score: 38 },
                  { date: 'Aug 9', score: 45 },
                  { date: 'Aug 13', score: 57 },
                  { date: 'Aug 17', score: 71 },
                  { date: 'Aug 20', score: 82 },
                  { date: 'Aug 24', score: 67 },
                  { date: 'Aug 29', score: 52 },
                  { date: 'Sep 4', score: 43 },
                ]}>
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#fff', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="score" stroke="#0F766E" strokeWidth={3} fill="#CCFBF1" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-slate-500 italic">
              Demonstrates AI early escalation warning on Aug 20 followed by human counselling intervention improving trend.
            </p>
          </div>

          <div>
            <AIExplanationCard explanation={latestAssessment?.explanation || defaultExplanation} />
          </div>
        </div>
      )}

      {/* TAB CONTENT: Domain Breakdown */}
      {activeTab === 'checkins' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Structured Questionnaire Domain Breakdown (0-100 Scale)</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { domain: 'Stress', score: 80, color: 'bg-orange-500' },
              { domain: 'Anxiety', score: 85, color: 'bg-red-500' },
              { domain: 'Fear', score: 90, color: 'bg-red-600' },
              { domain: 'Sleep Disruption', score: 75, color: 'bg-orange-500' },
              { domain: 'Safety Perception', score: 25, color: 'bg-red-500' },
              { domain: 'Threat / Harassment', score: 85, color: 'bg-red-600' },
              { domain: 'Social Support', score: 40, color: 'bg-amber-500' },
              { domain: 'Daily Functioning', score: 70, color: 'bg-orange-500' },
              { domain: 'Case Related Distress', score: 85, color: 'bg-red-500' },
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>{item.domain}</span>
                  <span className="font-bold">{item.score}/100</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                  <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: NLP */}
      {activeTab === 'nlp' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900">NLP Multilingual Sentiment & Emotion Signal Analysis</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="text-xs font-semibold text-slate-500">Sentiment Score</div>
              <div className="text-lg font-bold text-red-600">-0.85 (Strongly Negative)</div>
              <p className="text-[11px] text-slate-500">Extracted from free-text check-in and chatbot message history.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="text-xs font-semibold text-slate-500">Primary Emotion Signal</div>
              <div className="text-lg font-bold text-orange-600">Fear & High Anxiety (0.92)</div>
              <p className="text-[11px] text-slate-500">XLM-RoBERTa Multilingual Emotion Classifier.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Threats */}
      {activeTab === 'threats' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Reported Threat & Intimidation Events</h3>
          
          {threats.length > 0 ? (
            <div className="space-y-3">
              {threats.map((th: any) => (
                <div key={th.id} className="p-4 bg-red-50 rounded-xl border border-red-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-red-900">
                    <span>{th.threat_type}</span>
                    <span className="text-[10px] bg-red-200 text-red-800 px-2 py-0.5 rounded">Severity {th.severity}/5</span>
                  </div>
                  <p className="text-red-800">{th.description}</p>
                  <div className="text-[11px] text-red-700 font-medium">Action Taken: {th.action_taken}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-4 text-center">No active threat events reported.</div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Interventions */}
      {activeTab === 'interventions' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Counselling & Intervention Records</h3>
            <button
              onClick={() => setShowModal(true)}
              className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold"
            >
              + New Intervention
            </button>
          </div>

          <div className="space-y-3">
            {interventions.map((inv: any) => (
              <div key={inv.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{inv.intervention_type}</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px]">{inv.status}</span>
                </div>
                <p className="text-slate-600">{inv.outcome || inv.notes}</p>
                <div className="text-[11px] text-slate-400">Approved by: {inv.approved_by}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Record Intervention & Override AI */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">Record Human Intervention Decision</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateIntervention} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Intervention Type</label>
                <select
                  value={interventionType}
                  onChange={(e) => setInterventionType(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-600 text-xs"
                >
                  <option>Scheduled In-Person Counselling</option>
                  <option>Urgent Protection Escort Request</option>
                  <option>Relocation Welfare Assistance</option>
                  <option>Legal Aid Case Status Review</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Counsellor Clinical Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record observations, safety findings, and scheduled follow-ups..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                <label className="flex items-center space-x-2 font-semibold text-amber-900">
                  <input
                    type="checkbox"
                    checked={isAiOverride}
                    onChange={(e) => setIsAiOverride(e.target.checked)}
                    className="rounded text-teal-600"
                  />
                  <span>Override AI Recommended Action Plan</span>
                </label>

                {isAiOverride && (
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">
                      Mandatory Clinical Override Reason *
                    </label>
                    <input
                      type="text"
                      required
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="State reason why AI recommendation is overridden..."
                      className="w-full p-2 bg-white border border-amber-300 rounded text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg shadow"
                >
                  Save Intervention Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
