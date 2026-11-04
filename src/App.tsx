/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * E-Rapor SD AJ (IAS Al-Jannah) - Rapor Digital Kurikulum Merdeka
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Header } from './components/layout/Header.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { DashboardView } from './components/dashboard/DashboardView.tsx';
import { SchoolProfileView } from './components/master/SchoolProfileView.tsx';
import { TeachersView } from './components/master/TeachersView.tsx';
import { StudentsView } from './components/master/StudentsView.tsx';
import { ClassesView } from './components/master/ClassesView.tsx';
import { SubjectsView } from './components/master/SubjectsView.tsx';
import { ExtracurricularMasterView } from './components/master/ExtracurricularMasterView.tsx';
import { CPTPView } from './components/curriculum/CPTPView.tsx';
import { AssessmentInputView } from './components/assessment/AssessmentInputView.tsx';
import { CocurricularView } from './components/cocurricular/CocurricularView.tsx';
import { ExtracurricularView } from './components/extracurricular/ExtracurricularView.tsx';
import { AttendanceView } from './components/administration/AttendanceView.tsx';
import { HomeroomNotesView } from './components/administration/HomeroomNotesView.tsx';
import { AchievementsView } from './components/administration/AchievementsView.tsx';
import { LegerRankingView } from './components/reports/LegerRankingView.tsx';
import { PrintReportModal } from './components/reports/PrintReportModal.tsx';
import { DatabaseExportModal } from './components/system/DatabaseExportModal.tsx';

const AppContent: React.FC = () => {
  const { currentView } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [dbModalOpen, setDbModalOpen] = useState(false);

  // View dispatcher
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            onOpenPrintModal={() => setPrintModalOpen(true)}
            onOpenDbModal={() => setDbModalOpen(true)}
          />
        );
      case 'profil-sekolah':
        return <SchoolProfileView />;
      case 'guru':
        return <TeachersView />;
      case 'siswa':
        return <StudentsView />;
      case 'kelas':
        return <ClassesView />;
      case 'mata-pelajaran':
        return <SubjectsView />;
      case 'ekskul-master':
        return <ExtracurricularMasterView />;
      case 'cp-tp':
        return <CPTPView />;
      case 'input-nilai':
        return <AssessmentInputView />;
      case 'kokurikuler':
        return <CocurricularView />;
      case 'ekskul':
        return <ExtracurricularView />;
      case 'kehadiran':
        return <AttendanceView />;
      case 'catatan-wali':
        return <HomeroomNotesView />;
      case 'prestasi':
        return <AchievementsView />;
      case 'leger':
      case 'ranking':
        return <LegerRankingView />;
      default:
        return (
          <DashboardView
            onOpenPrintModal={() => setPrintModalOpen(true)}
            onOpenDbModal={() => setDbModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        onOpenDbModal={() => setDbModalOpen(true)}
      />

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenPrintModal={() => setPrintModalOpen(true)}
          onOpenDbModal={() => setDbModalOpen(true)}
        />

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {renderView()}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <PrintReportModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
      />

      <DatabaseExportModal
        isOpen={dbModalOpen}
        onClose={() => setDbModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
