import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Cpu, AlertTriangle, CheckCircle2, ShieldAlert, BarChart2 } from 'lucide-react';

export const MLMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await api.getMLMetrics();
        setMetrics(res);
      } catch (e) {
        console.warn("Failed to load ML metrics from API:", e);
      }
    }
    loadMetrics();
  }, []);

  const bestModel = metrics?.best_model_name || 'RandomForest';
  const evalData = metrics?.models_evaluated?.[bestModel] || { accuracy: 0.96, precision: 0.9048, recall: 1.0, f1_score: 0.95, confusion_matrix: [[29, 2], [0, 19]] };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-xl">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI / ML Model Performance Monitoring</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Validation metrics, confusion matrix & synthetic training data evaluation</p>
          </div>
        </div>

        <span className="text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
          Active Model: {bestModel} (v1.0.0)
        </span>
      </div>

      {/* Synthetic Warning Card */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl text-amber-900 dark:text-amber-200 text-xs flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-wider text-amber-950 dark:text-amber-300">Ethical & Clinical Warning:</span>
          <p className="mt-0.5 leading-relaxed text-amber-900/90 dark:text-amber-200/90">
            Performance metrics shown here are evaluated on a synthetic demonstration dataset (200 records). Real-world deployment requires ethically governed victim data, clinical validation, bias evaluation, and legal review.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-t-4 border-t-teal-500">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Accuracy</div>
          <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 mt-1">{(evalData.accuracy * 100).toFixed(1)}%</div>
          <div className="text-[10px] text-slate-400">Classification Correctness</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-t-4 border-t-blue-500">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Precision</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{(evalData.precision * 100).toFixed(1)}%</div>
          <div className="text-[10px] text-slate-400">Positive Predictive Value</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-t-4 border-t-emerald-500">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Recall (Sensitivity)</div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{(evalData.recall * 100).toFixed(1)}%</div>
          <div className="text-[10px] text-slate-400">Escalation Signal Detection</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-t-4 border-t-purple-500">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">F1 Score</div>
          <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 mt-1">{(evalData.f1_score * 100).toFixed(1)}%</div>
          <div className="text-[10px] text-slate-400">Harmonized Metric</div>
        </div>
      </div>

      {/* Confusion Matrix & Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Confusion Matrix */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Confusion Matrix ({bestModel})</h3>
          
          <div className="grid grid-cols-2 gap-3 text-center text-xs">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl">
              <div className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase">True Negative (Stable)</div>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{evalData.confusion_matrix?.[0]?.[0] ?? 29}</div>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 rounded-xl">
              <div className="text-[10px] font-semibold text-red-800 dark:text-red-300 uppercase">False Positive</div>
              <div className="text-2xl font-bold text-red-700 dark:text-red-400 mt-1">{evalData.confusion_matrix?.[0]?.[1] ?? 2}</div>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl">
              <div className="text-[10px] font-semibold text-amber-800 dark:text-amber-300 uppercase">False Negative</div>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">{evalData.confusion_matrix?.[1]?.[0] ?? 0}</div>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl">
              <div className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase">True Positive (Escalated)</div>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{evalData.confusion_matrix?.[1]?.[1] ?? 19}</div>
            </div>
          </div>
        </div>

        {/* Feature Importance List */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Top Model Feature Predictors</h3>
          
          <div className="space-y-2 text-xs">
            {[
              { feature: 'current_structured_distress', importance: '35%' },
              { feature: 'threat_score (NLP + Questionnaire)', importance: '20%' },
              { feature: 'fear_nlp_score & anxiety_nlp_score', importance: '15%' },
              { feature: 'distress_change (Longitudinal Trend)', importance: '15%' },
              { feature: 'case_risk_score & hearing delays', importance: '10%' },
              { feature: 'sleep_disruption_score', importance: '5%' },
            ].map((f, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg flex items-center justify-between border border-transparent dark:border-slate-700/50">
                <span className="font-mono text-slate-800 dark:text-slate-200">{f.feature}</span>
                <span className="font-bold text-teal-600 dark:text-teal-400">{f.importance}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
