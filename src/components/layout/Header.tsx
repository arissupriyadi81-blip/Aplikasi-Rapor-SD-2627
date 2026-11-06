/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Sun,
  Moon,
  Shield,
  Database,
  Calendar,
  Layers,
  Menu,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenDbModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onOpenDbModal }) => {
  const {
    isDarkMode,
    toggleDarkMode,
    currentUser,
    academicYears,
    activeAcademicYear,
    setActiveAcademicYearId,
    semesters,
    activeSemester,
    setActiveSemesterId,
    schoolProfile,
  } = useApp();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
      {/* Left: Mobile Toggle & School Identity */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800">
            <img
              src={schoolProfile.logoUrl || '/logo-aljannah-emblem.png'}
              alt="Logo SD IAS Al-Jannah"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                E-Rapor SD AJ
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                Kurikulum Merdeka
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs md:max-w-md">
              {schoolProfile.schoolName}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Academic Period, Role Switcher, SQL Export, Theme, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Academic Year & Semester Selector */}
        <div className="hidden md:flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800/80">
          <Calendar className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
          <select
            value={activeAcademicYear.id}
            onChange={(e) => setActiveAcademicYearId(e.target.value)}
            className="bg-transparent text-xs font-medium text-slate-700 outline-none dark:text-slate-200"
            aria-label="Pilih Tahun Pelajaran"
          >
            {academicYears.map((ay) => (
              <option key={ay.id} value={ay.id} className="dark:bg-slate-800">
                TP {ay.yearName}
              </option>
            ))}
          </select>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <Layers className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
          <select
            value={activeSemester.id}
            onChange={(e) => setActiveSemesterId(e.target.value)}
            className="bg-transparent text-xs font-medium text-slate-700 outline-none dark:text-slate-200"
            aria-label="Pilih Semester"
          >
            {semesters
              .filter((s) => s.academicYearId === activeAcademicYear.id)
              .map((s) => (
                <option key={s.id} value={s.id} className="dark:bg-slate-800">
                  {s.semesterName}
                </option>
              ))}
          </select>
        </div>

        {/* Supabase Cloud & Realtime Status Button */}
        <button
          onClick={onOpenDbModal}
          title="Database Supabase Terhubung - Sinkronisasi Realtime Aktif Antar-Browser"
          className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Database className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline font-bold">Supabase Realtime</span>
        </button>

        {/* Administrator Badge (Mode Admin Bersama) */}
        <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-sm">
          <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Mode Admin</span>
        </div>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          title={isDarkMode ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
          aria-label="Toggle tema tampilan"
        >
          {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </button>

        {/* User Info Avatar */}
        <div className="flex items-center gap-2 pl-1">
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
            alt={currentUser.fullName}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-emerald-500/20"
          />
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
              {currentUser.fullName}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
              {currentUser.role.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
