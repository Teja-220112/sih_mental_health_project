import React, { useState } from 'react';
import { AuthProvider, useAuth } from './lib/authContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DisclaimerBanner } from './components/layout/DisclaimerBanner';
import { Login } from './pages/Login';

import { VictimDashboard } from './pages/victim/VictimDashboard';
import { CheckinWizard } from './pages/victim/CheckinWizard';
import { VictimChat } from './pages/victim/VictimChat';
import { CounsellorDashboard } from './pages/counsellor/CounsellorDashboard';
import { VictimDetail } from './pages/counsellor/VictimDetail';
import { DistrictDashboard } from './pages/district/DistrictDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { MLMonitoring } from './pages/admin/MLMonitoring';
import { AuditLogs } from './pages/admin/AuditLogs';
import { Privacy } from './pages/Privacy';

const MainContent: React.FC = () => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedVictimId, setSelectedVictimId] = useState<string | null>(null);

  if (!user) {
    return <Login />;
  }

  // Handle switching views inside sub-workflows
  const renderVictimPage = () => {
    switch (activeTab) {
      case 'checkin':
        return (
          <CheckinWizard
            onComplete={(res) => {
              alert(`Check-in completed! Dynamic Distress Score: ${res.dynamic_distress_score}/100 (${res.risk_level})`);
              setActiveTab('dashboard');
            }}
            onCancel={() => setActiveTab('dashboard')}
          />
        );
      case 'chat':
        return <VictimChat />;
      case 'threat':
        return (
          <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">Report Threat or Intimidation Event</h3>
            <p className="text-xs text-slate-500">Submitting a threat report instantly notifies your counsellor and triggers a district protection review.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Threat report submitted! High-priority protection alert created.");
                setActiveTab('dashboard');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Threat Type</label>
                <select className="w-full p-2.5 border border-slate-300 rounded-lg">
                  <option>Witness Coercion / Verbal Threat</option>
                  <option>Physical Harassment / Stalking</option>
                  <option>Property Damage Threat</option>
                  <option>Social Pressure to Withdraw Case</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Severity (1 to 5)</label>
                <select className="w-full p-2.5 border border-slate-300 rounded-lg">
                  <option value="5">5 — Critical Immediate Threat</option>
                  <option value="4">4 — Severe Coercion</option>
                  <option value="3">3 — Moderate Pressure</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description of Incident</label>
                <textarea rows={3} placeholder="Describe when, where, and what occurred..." className="w-full p-2.5 border border-slate-300 rounded-lg" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow">
                Submit Immediate Threat Report
              </button>
            </form>
          </div>
        );
      case 'privacy':
        return <Privacy />;
      case 'dashboard':
      default:
        return (
          <VictimDashboard
            onStartCheckin={() => setActiveTab('checkin')}
            onOpenChat={() => setActiveTab('chat')}
            onReportThreat={() => setActiveTab('threat')}
          />
        );
    }
  };

  const renderCounsellorPage = () => {
    if (selectedVictimId) {
      return (
        <VictimDetail
          victimId={selectedVictimId}
          onBack={() => setSelectedVictimId(null)}
        />
      );
    }

    switch (activeTab) {
      case 'alerts':
      case 'victims':
      case 'interventions':
      case 'dashboard':
      default:
        return (
          <CounsellorDashboard
            onSelectVictim={(vid) => setSelectedVictimId(vid)}
          />
        );
    }
  };

  const renderDistrictPage = () => {
    return <DistrictDashboard />;
  };

  const renderAdminPage = () => {
    switch (activeTab) {
      case 'ml_metrics':
        return <MLMonitoring />;
      case 'audit_logs':
        return <AuditLogs />;
      case 'dashboard':
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <DisclaimerBanner />
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setSelectedVictimId(null); setActiveTab(tab); }} />

        <main className="flex-1 p-6 overflow-x-hidden">
          {role === 'victim' && renderVictimPage()}
          {role === 'counsellor' && renderCounsellorPage()}
          {role === 'district_officer' && renderDistrictPage()}
          {role === 'admin' && renderAdminPage()}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;
