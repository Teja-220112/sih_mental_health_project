import React, { useState } from 'react';
import { ThemeProvider } from './lib/themeContext';
import { AuthProvider, useAuth } from './lib/authContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { VoiceAssistantModal } from './components/ui/VoiceAssistantModal';
import { Login } from './pages/Login';

import { VictimDashboard } from './pages/victim/VictimDashboard';
import { CheckinWizard } from './pages/victim/CheckinWizard';
import { VictimChat } from './pages/victim/VictimChat';
import { CounsellorDashboard } from './pages/counsellor/CounsellorDashboard';
import { VictimDetail } from './pages/counsellor/VictimDetail';
import { DistrictDashboard } from './pages/district/DistrictDashboard';
import { ProtectionDashboard } from './pages/protection/ProtectionDashboard';
import { PoliceDashboard } from './pages/police/PoliceDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { MLMonitoring } from './pages/admin/MLMonitoring';
import { AuditLogs } from './pages/admin/AuditLogs';
import { VictimThreatReport } from './pages/victim/VictimThreatReport';

const MainContent: React.FC = () => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedVictimId, setSelectedVictimId] = useState<string | null>(null);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  if (!user) {
    return <Login />;
  }

  // Handle switching views inside sub-workflows
  const renderVictimPage = () => {
    switch (activeTab) {
      case 'checkin':
        return (
          <CheckinWizard
            onComplete={(_res) => {
              setActiveTab('dashboard');
            }}
            onCancel={() => setActiveTab('dashboard')}
          />
        );
      case 'chat':
        return <VictimChat />;
      case 'threat':
        return (
          <VictimThreatReport
            onBack={() => setActiveTab('dashboard')}
            onSuccess={() => setActiveTab('dashboard')}
          />
        );
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

    return (
      <CounsellorDashboard
        activeTab={activeTab}
        onNavigate={(tab) => setActiveTab(tab)}
        onSelectVictim={(vid) => setSelectedVictimId(vid)}
      />
    );
  };

  const renderDistrictPage = () => {
    return <DistrictDashboard activeTab={activeTab} onNavigate={(tab) => setActiveTab(tab)} />;
  };

  const renderProtectionPage = () => {
    return <ProtectionDashboard activeTab={activeTab} onNavigate={(tab) => setActiveTab(tab)} />;
  };

  const renderPolicePage = () => {
    return <PoliceDashboard activeTab={activeTab} onNavigate={(tab) => setActiveTab(tab)} />;
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <div className="sticky top-0 z-50">
        <Navbar
          onQuickCheckin={() => setActiveTab('checkin')}
          onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
          isMobileNavOpen={isMobileNavOpen}
          onToggleMobileNav={() => setIsMobileNavOpen((prev) => !prev)}
        />
      </div>

      <div className="flex-1 flex max-w-7xl w-full mx-auto min-w-0">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => { setSelectedVictimId(null); setActiveTab(tab); }}
          isMobileOpen={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
        />

        <main className="flex-1 p-3.5 sm:p-5 md:p-6 pb-24 lg:pb-6 overflow-x-hidden min-w-0">
          {role === 'victim' && renderVictimPage()}
          {role === 'police_officer' && renderPolicePage()}
          {role === 'counsellor' && renderCounsellorPage()}
          {role === 'protection_officer' && renderProtectionPage()}
          {role === 'district_officer' && renderDistrictPage()}
          {role === 'admin' && renderAdminPage()}
        </main>
      </div>

      <VoiceAssistantModal
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
