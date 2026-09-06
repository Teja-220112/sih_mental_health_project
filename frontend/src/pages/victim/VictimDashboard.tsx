import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/authContext';
import { api } from '../../lib/api';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { DistressGauge } from '../../components/ui/DistressGauge';
import { TrendBadge } from '../../components/ui/TrendBadge';
import { AIAssessment } from '../../types';
import { HeartHandshake, MessageSquare, ShieldAlert, FileText, Calendar, Shield, Activity, Clock } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface VictimDashboardProps {
  onStartCheckin: () => void;
  onOpenChat: () => void;
  onReportThreat: () => void;
}

export const VictimDashboard: React.FC<VictimDashboardProps> = ({ onStartCheckin, onOpenChat, onReportThreat }) => {
  const { victim } = useAuth();
  const victimId = victim?.id || '70000000-0000-0000-0000-000000000001';

  const [trendData, setTrendData] = useState<any[]>([]);
  const [latestAssessment, setLatestAssessment] = useState<AIAssessment | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getVictimTrend(victimId);
        setTrendData(res.chart_data || []);
        const riskRes = await api.getLatestRisk(victimId);
        setLatestAssessment(riskRes.latest_assessment || null);
      } catch (e) {
        console.warn("Failed to load victim data from API, using local fallback:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [victimId]);

  const score = latestAssessment?.dynamic_distress_score ?? 43;
  const riskLevel = latestAssessment?.risk_level ?? 'MODERATE';
  const trend = latestAssessment?.distress_trend ?? 'Improving';

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <HeartHandshake className="w-4 h-4" />
            <span>Supportive Wellbeing Portal</span>
          </div>
          <h2 className="text-xl font-bold">Welcome back, {victim?.name || 'Sunita Devi'}</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Your responses help your assigned human counsellor monitor your wellbeing and coordinate legal and protection support.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={onStartCheckin}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Start Check-in</span>
          </button>

          <button
            onClick={onOpenChat}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-navy-700 hover:bg-navy-600 text-slate-100 text-xs font-semibold rounded-xl border border-slate-600 transition-all flex items-center justify-center space-x-2"
          >
            <MessageSquare className="w-4 h-4 text-teal-400" />
            <span>Talk to Support</span>
          </button>
        </div>
      </div>

      {/* Grid Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Score & Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Latest Wellbeing Screening Signal</h3>
          <DistressGauge score={score} riskLevel={riskLevel} size={130} />
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xs text-slate-500">Status:</span>
              <RiskBadge level={riskLevel} />
            </div>
            
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xs text-slate-500">Trend:</span>
              <TrendBadge trend={trend} />
            </div>
          </div>
        </div>

        {/* Card 2: Supportive Message */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-slate-800 font-semibold text-sm mb-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Personal Support Guidance</span>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              {riskLevel === 'CRITICAL' || riskLevel === 'HIGH' ? (
                "Your recent responses indicate that additional support may be helpful. A counsellor may contact you to check on your safety and offer assistance."
              ) : (
                "Your recent check-ins reflect steady wellbeing. Periodic check-ins help ensure your protection and legal support remain on track."
              )}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Last Check-in: Sept 4, 2026</span>
            </div>
            <button
              onClick={onReportThreat}
              className="text-red-600 hover:text-red-700 font-semibold flex items-center space-x-1"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Report Threat</span>
            </button>
          </div>
        </div>

        {/* Card 3: Support Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Case & Protection Status</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg">
                <span className="text-slate-500">Case Code:</span>
                <span className="font-semibold text-slate-800">POA-PUNE-2026-042</span>
              </div>

              <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg">
                <span className="text-slate-500">Counsellor:</span>
                <span className="font-semibold text-teal-700">Dr. Ananya Sharma</span>
              </div>

              <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg">
                <span className="text-slate-500">Protection Status:</span>
                <span className="font-semibold text-emerald-700">Active Police Escort</span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-[11px] text-slate-400 text-center">
            Managed under MoSJE SC/ST Atrocity Rehabilitation Framework.
          </div>
        </div>

      </div>

      {/* Longitudinal Graph */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Your Distress Trend History</h3>
            <p className="text-xs text-slate-500">Longitudinal monitoring showing post-intervention recovery curve</p>
          </div>
          <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">
            Aug 5 — Sep 4, 2026
          </span>
        </div>

        <div className="h-64 w-full">
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
              <defs>
                <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F766E" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#0F766E" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                formatter={(val: any) => [`${val} / 100`, 'Distress Score']}
              />
              <Area type="monotone" dataKey="score" stroke="#0F766E" strokeWidth={3} fillOpacity={1} fill="url(#scoreColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 text-center text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Noticeable Improvement:</span> Distress peaked at 82 on Aug 20 following threat report, then dropped to 43 post-counselling & protection deployment.
        </div>
      </div>

    </div>
  );
};
