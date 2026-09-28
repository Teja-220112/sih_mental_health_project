import React, { useState } from 'react';
import { useAuth } from '../lib/authContext';
import { UserRole } from '../types';
import { 
  Shield, Lock, User, Mail, Eye, EyeOff, 
  AlertCircle, X, HelpCircle, Phone, ArrowRight, 
  CheckCircle2, ShieldCheck, KeyRound
} from 'lucide-react';

interface RoleOption {
  id: UserRole;
  label: string;
  formHeading: string;
  identifierLabel: string;
  identifierPlaceholder: string;
  defaultId: string;
  defaultPass: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'victim',
    label: 'Victim',
    formHeading: 'Victim Portal Access',
    identifierLabel: 'Victim Access ID',
    identifierPlaceholder: 'Enter your Login ID or Access Code',
    defaultId: 'VIC-2026-NTR-0042',
    defaultPass: 'CasePass@2026'
  },
  {
    id: 'police_officer',
    label: 'Police Officer',
    formHeading: 'Police / Station Officer Login',
    identifierLabel: 'Official Email or Badge ID',
    identifierPlaceholder: 'Enter official email or badge ID',
    defaultId: 'police.demo@sih.test',
    defaultPass: 'SIH-Police@2026'
  },
  {
    id: 'counsellor',
    label: 'Counsellor',
    formHeading: 'Clinical Counsellor Login',
    identifierLabel: 'Practitioner Email / ID',
    identifierPlaceholder: 'Enter counsellor email or practitioner ID',
    defaultId: 'counsellor.demo@sih.test',
    defaultPass: 'SIH-Counsel@2026'
  },
  {
    id: 'protection_officer',
    label: 'Protection Officer',
    formHeading: 'Protection Officer Login',
    identifierLabel: 'Department Email',
    identifierPlaceholder: 'Enter protection officer email',
    defaultId: 'protection.demo@sih.test',
    defaultPass: 'SIH-Protect@2026'
  },
  {
    id: 'district_officer',
    label: 'District Admin',
    formHeading: 'District Administrator Login',
    identifierLabel: 'Admin Email or SSO ID',
    identifierPlaceholder: 'Enter administrator email or SSO ID',
    defaultId: 'admin.demo@sih.test',
    defaultPass: 'SIH-Admin@2026'
  }
];

export const Login: React.FC = () => {
  const { loginWithCredentials } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('victim');
  const [identifier, setIdentifier] = useState(ROLE_OPTIONS[0].defaultId);
  const [password, setPassword] = useState(ROLE_OPTIONS[0].defaultPass);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const activeConfig = ROLE_OPTIONS.find((r) => r.id === selectedRole) || ROLE_OPTIONS[0];

  const handleRoleChange = (roleId: UserRole) => {
    setSelectedRole(roleId);
    const target = ROLE_OPTIONS.find((r) => r.id === roleId);
    if (target) {
      setIdentifier(target.defaultId);
      setPassword(target.defaultPass);
    }
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMessage('Please enter both your identifier and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await loginWithCredentials(identifier.trim(), password, selectedRole);
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-teal-100 selection:text-teal-900 font-sans">
      
      {/* Sleek Fixed Header (Never Collides) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-800 text-white rounded-xl shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 leading-tight tracking-tight">
                Victim Safety &amp; Rehabilitation Portal
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Ministry of Social Justice &amp; Empowerment • Government of Andhra Pradesh
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/80">
              <Phone className="w-3.5 h-3.5 text-teal-700" />
              <span>Emergency <strong>112</strong> • Women Helpline <strong>181</strong></span>
            </div>

            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              className="text-xs font-semibold text-slate-600 hover:text-teal-800 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Assistance</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Focus Area (Simple, Spacious, Professional) */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Official Welcome & Trust Guarantees */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-teal-50 border border-teal-200/80 rounded-full text-xs font-semibold text-teal-800">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>NTR District Official Support Cell</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Welcome to the <br />
                <span className="text-teal-700">Victim Safety &amp; Rehabilitation Portal</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg">
                A secure, confidential gateway providing coordinated legal protection, psychological support, and rehabilitation tracking for citizens and authorized department personnel.
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <div className="flex items-center space-x-3 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>End-to-End Confidential &amp; Protected Case Communications</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Multi-Agency Synchronization: Police, Healthcare &amp; Legal Protection</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Proactive Threat Escalation with Dedicated Emergency Dispatch</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/80">
              <p className="text-xs text-slate-500 leading-relaxed">
                Authorized access managed under the SC/ST (Prevention of Atrocities) Protection Framework and National Mental Health Program.
              </p>
            </div>

          </div>

          {/* Right Column: Premium, Professional Login Card */}
          <div className="lg:col-span-6 max-w-md w-full mx-auto lg:ml-auto">
            <div className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-900/5 p-7 sm:p-9 space-y-6">
              
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Portal Sign In</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Select your role to access your workspace</p>
                </div>
                <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl">
                  <Lock className="w-5 h-5 text-teal-700" />
                </div>
              </div>

              {/* Role Switcher */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Account Type
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl">
                  {ROLE_OPTIONS.map((opt) => {
                    const isSelected = selectedRole === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleRoleChange(opt.id)}
                        className={`py-2 px-1 text-xs rounded-lg text-center transition-all cursor-pointer truncate ${
                          isSelected
                            ? 'bg-teal-700 text-white shadow-xs font-semibold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 1-Click Quick Demo Presets */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-teal-700" />
                    <span>Quick Demo Accounts:</span>
                  </span>
                  <span className="text-[10px] text-teal-700 font-medium">Click to switch</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleRoleChange(opt.id)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                        selectedRole === opt.id
                          ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="identifier" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {activeConfig.identifierLabel}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      {selectedRole === 'victim' ? <User className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    </div>
                    <input
                      id="identifier"
                      type="text"
                      required
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={activeConfig.identifierPlaceholder}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="text-xs font-semibold text-slate-700">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center space-x-2 cursor-pointer mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In as {activeConfig.label}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsHelpOpen(true)}
                  className="text-xs text-slate-500 hover:text-teal-700 transition-colors cursor-pointer"
                >
                  Need login assistance or lost your access card?
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Official Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Government of Andhra Pradesh • NTR District | MoSJE Prototype (PS-26094)</span>
          <span className="text-[11px] text-slate-400">Emergency: 112 • Women&apos;s Helpline: 181 • Tele-MANAS: 14416</span>
        </div>
      </footer>

      {/* Assistance Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 relative">
            <button
              type="button"
              onClick={() => setIsHelpOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-5">
              <div className="p-2.5 bg-teal-50 text-teal-800 rounded-xl">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Portal Login Assistance</h3>
                <p className="text-xs text-slate-500">Official credential access guidance</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-1">Victim Access Cards</h4>
                <p>
                  Your unique confidential login identifier is issued on your physical card by the NTR District Protection Cell or Suryaraopet Police Station.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-1">Departmental Accounts</h4>
                <p>
                  Police officers, Clinical Counsellors, and District Administrators sign in using credentials managed by the Collectorate IT Cell.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-700">
                <span>Emergency Helplines:</span>
                <span className="font-bold text-teal-800 text-sm">112 / 181 / 14416</span>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;
