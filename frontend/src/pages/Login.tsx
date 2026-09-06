import React, { useState } from 'react';
import { useAuth } from '../lib/authContext';
import { UserRole } from '../types';
import { Shield, Lock, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

export const Login: React.FC = () => {
  const { switchRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('victim');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    switchRole(selectedRole);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex p-3 bg-teal-600/20 text-teal-400 rounded-2xl border border-teal-500/30 mb-3">
          <Shield className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-white">
          Ministry of Social Justice & Empowerment
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          AI-Powered Dynamic Mental Health Monitoring & Distress Prediction System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800/90 py-8 px-6 shadow-2xl rounded-2xl border border-slate-700 sm:px-10">
          
          {/* Quick Demo Persona Switcher Notice */}
          <div className="mb-6 p-3 bg-teal-950/60 border border-teal-800 rounded-xl text-xs text-teal-300 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">1-Click Hackathon Demo Mode:</span>
              <p className="mt-0.5 text-slate-300">Select any role below for instant automated persona authentication with pre-populated longitudinal data.</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Select Portal Persona / Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { role: 'victim', label: 'Victim / Witness', desc: 'Check-in & Chatbot' },
                  { role: 'counsellor', label: 'Counsellor', desc: 'Assigned Victims & Alerts' },
                  { role: 'district_officer', label: 'District Officer', desc: 'Protection & Welfare' },
                  { role: 'admin', label: 'Admin / State', desc: 'ML & Analytics' }
                ].map((item) => (
                  <button
                    type="button"
                    key={item.role}
                    onClick={() => setSelectedRole(item.role as UserRole)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedRole === item.role
                        ? 'border-teal-500 bg-teal-900/40 text-white shadow-md'
                        : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{item.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address (Demo)</label>
              <input
                type="email"
                value={email || `${selectedRole}@demo.mosje.gov.in`}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value="••••••••••••"
                readOnly
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              <span>Enter MoSJE Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-700/60 text-center">
            <p className="text-[11px] text-slate-400">
              Authorized access under SC/ST (Prevention of Atrocities) Act Lifecycle Monitoring Scheme.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
