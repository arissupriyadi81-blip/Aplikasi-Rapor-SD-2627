/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Users,
  GraduationCap,
  DoorOpen,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Printer,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface DashboardViewProps {
  onOpenPrintModal: () => void;
  onOpenDbModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenPrintModal,
  onOpenDbModal,
}) => {
  const {
    schoolProfile,
    activeAcademicYear,
    activeSemester,
    students,
    teachers,
    classes,
    subjects,
    assessments,
    attendances,
    homeroomNotes,
    reportFinalizations,
    setCurrentView,
    currentUser,
    isDarkMode,
    supabaseSyncStatus,
  } = useApp();

  // Active metrics calculations
  const totalStudents = students.filter(s => s.status === 'aktif').length;
  const totalTeachers = teachers.filter(t => t.isActive).length;
  const totalClasses = classes.filter(c => c.isActive).length;
  const totalSubjects = subjects.filter(s => s.isActive).length;

  // Assessments completion
  const totalPossibleGrades = totalStudents * totalSubjects;
  const completedGrades = assessments.filter(a => a.finalScore !== null && a.semesterId === activeSemester.id).length;
  const gradeCompletionPercent = totalPossibleGrades > 0
    ? Math.min(100, Math.round((completedGrades / totalPossibleGrades) * 100))
    : 0;

  // Attendance completion
  const filledAttendanceCount = attendances.filter(a => a.semesterId === activeSemester.id).length;
  const attendancePercent = totalStudents > 0
    ? Math.min(100, Math.round((filledAttendanceCount / totalStudents) * 100))
    : 0;

  // Notes completion
  const filledNotesCount = homeroomNotes.filter(n => n.semesterId === activeSemester.id).length;
  const notesPercent = totalStudents > 0
    ? Math.min(100, Math.round((filledNotesCount / totalStudents) * 100))
    : 0;

  // Finalized classes
  const finalizedCount = reportFinalizations.filter(
    f => f.semesterId === activeSemester.id && (f.status === 'disetujui' || f.status === 'final_terkunci')
  ).length;

  // Chart data 1: Students per Class
  const classNames = classes.map(c => c.className.split(' - ')[0]);
  const studentsPerClass = classes.map(c => students.filter(s => s.currentClassId === c.id).length);

  const barChartData = {
    labels: classNames,
    datasets: [
      {
        label: 'Jumlah Siswa Terdaftar',
        data: studentsPerClass,
        backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.7)' : 'rgba(5, 150, 105, 0.85)',
        borderColor: isDarkMode ? '#10b981' : '#059669',
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: isDarkMode ? '#94a3b8' : '#475569',
          font: { size: 11, family: 'Plus Jakarta Sans' },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: isDarkMode ? '#94a3b8' : '#64748b' },
        grid: { color: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' },
      },
      y: {
        ticks: { color: isDarkMode ? '#94a3b8' : '#64748b' },
        grid: { color: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' },
      },
    },
  };

  // Chart data 2: Rapor Readiness Doughnut
  const doughnutData = {
    labels: ['Nilai Terinput', 'Catatan Terisi', 'Kehadiran Terisi'],
    datasets: [
      {
        data: [gradeCompletionPercent, notesPercent, attendancePercent],
        backgroundColor: [
          '#10b981', // emerald
          '#0ea5e9', // sky
          '#f59e0b', // amber
        ],
        borderWidth: 2,
        borderColor: isDarkMode ? '#1e293b' : '#ffffff',
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                Sistem Informasi Rapor Digital Kurikulum Merdeka
              </div>
              <button
                onClick={onOpenDbModal}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/25 border border-emerald-300/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md hover:bg-emerald-500/40 transition-colors shadow-sm"
                title="Status Supabase: Terhubung & Realtime Aktif. Klik untuk melihat detail & query SQL"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span>Supabase Realtime Terhubung</span>
              </button>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Selamat Datang, {currentUser.fullName}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
              {schoolProfile.schoolName} — Periode Aktif:{' '}
              <span className="font-semibold text-white">
                Tahun Ajaran {activeAcademicYear.yearName} ({activeSemester.semesterName})
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCurrentView('input-nilai')}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-emerald-900 shadow-md hover:bg-emerald-50 transition-all"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
              Input Nilai CP/TP
            </button>
            <button
              onClick={onOpenPrintModal}
              className="flex items-center gap-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white border border-emerald-400/40 backdrop-blur-sm transition-all"
            >
              <Printer className="h-4 w-4" />
              Cetak Rapor
            </button>
          </div>
        </div>

        {/* Ambient background blur elements */}
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Siswa */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Peserta Didik Aktif
            </span>
            <div className="rounded-xl bg-blue-100 p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalStudents}
            </span>
            <span className="text-xs font-medium text-emerald-600">Siswa</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
            Tersebar di {totalClasses} Rombongan Belajar
          </p>
        </div>

        {/* Guru */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Pendidik & Tendik
            </span>
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalTeachers}
            </span>
            <span className="text-xs font-medium text-emerald-600">Guru</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
            Wali kelas dan guru mata pelajaran
          </p>
        </div>

        {/* Kelas */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Rombel / Kelas
            </span>
            <div className="rounded-xl bg-amber-100 p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <DoorOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalClasses}
            </span>
            <span className="text-xs font-medium text-amber-600">Kelas</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
            Tingkat 1 s.d. 6 (Fase A, B, C)
          </p>
        </div>

        {/* Mapel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Mata Pelajaran
            </span>
            <div className="rounded-xl bg-purple-100 p-2 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalSubjects}
            </span>
            <span className="text-xs font-medium text-purple-600">Mapel</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
            Termasuk Nature & Science Al-Jannah
          </p>
        </div>
      </div>

      {/* Progress Cards: Status Kelengkapan Rapor */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Card 1: Input Nilai CP/TP */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                PENGISIAN NILAI CP/TP
              </p>
              <h3 className="mt-1 text-xl font-extrabold text-slate-800 dark:text-white">
                {gradeCompletionPercent}%
              </h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 dark:bg-emerald-950/50">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${gradeCompletionPercent}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{completedGrades} dari {totalPossibleGrades} entri nilai</span>
            <button
              onClick={() => setCurrentView('input-nilai')}
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              Lanjutkan <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Kehadiran Siswa */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                STATUS KEHADIRAN SISWA
              </p>
              <h3 className="mt-1 text-xl font-extrabold text-slate-800 dark:text-white">
                {attendancePercent}%
              </h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 dark:bg-sky-950/50">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-sky-500 transition-all duration-500"
              style={{ width: `${attendancePercent}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{filledAttendanceCount} dari {totalStudents} siswa terdata</span>
            <button
              onClick={() => setCurrentView('kehadiran')}
              className="text-sky-600 dark:text-sky-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              Kelola Absensi <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Card 3: Kesiapan Cetak Rapor */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                KESIAPAN CETAK RAPOR
              </p>
              <h3 className="mt-1 text-xl font-extrabold text-slate-800 dark:text-white">
                {totalStudents} Siswa Siap
              </h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 dark:bg-emerald-950/50">
              <Printer className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.round((gradeCompletionPercent + attendancePercent + notesPercent) / 3)}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Rata-rata kesiapan {Math.round((gradeCompletionPercent + attendancePercent + notesPercent) / 3)}%</span>
            <button
              onClick={onOpenPrintModal}
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              Cetak Rapor <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart.js Visualizations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart 1: Bar Chart of Students per Class */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Distribusi Peserta Didik per Rombongan Belajar
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kapasitas dan jumlah siswa aktif Tahun Pelajaran {activeAcademicYear.yearName}
              </p>
            </div>
          </div>
          <div className="h-64 w-full">
            <Bar data={barChartData} options={chartOptions as any} />
          </div>
        </div>

        {/* Chart 2: Doughnut of Completion */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Status Kesiapan Rapor
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Progres penilaian, catatan, dan absensi
            </p>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      boxWidth: 12,
                      font: { size: 10, family: 'Plus Jakarta Sans' },
                      color: isDarkMode ? '#94a3b8' : '#475569',
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">
          Aksi Cepat & Navigasi Modul Kurikulum Merdeka
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => setCurrentView('cp-tp')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-slate-800 dark:hover:bg-slate-800 transition-all text-center group"
          >
            <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">CP & TP</span>
            <span className="text-[10px] text-slate-400">Tujuan Belajar</span>
          </button>

          <button
            onClick={() => setCurrentView('input-nilai')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-slate-800 dark:hover:bg-slate-800 transition-all text-center group"
          >
            <div className="h-9 w-9 rounded-lg bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-2 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Input Nilai</span>
            <span className="text-[10px] text-slate-400">Formatif & Sumatif</span>
          </button>

          <button
            onClick={() => setCurrentView('kokurikuler')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-slate-800 dark:hover:bg-slate-800 transition-all text-center group"
          >
            <div className="h-9 w-9 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Kokurikuler</span>
            <span className="text-[10px] text-slate-400">Rubrik & Asesmen</span>
          </button>

          <button
            onClick={() => setCurrentView('leger')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-slate-800 dark:hover:bg-slate-800 transition-all text-center group"
          >
            <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Leger Nilai</span>
            <span className="text-[10px] text-slate-400">Rekap Satu Kelas</span>
          </button>

          <button
            onClick={() => setCurrentView('ranking')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-slate-800 dark:hover:bg-slate-800 transition-all text-center group"
          >
            <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-2 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Ranking Siswa</span>
            <span className="text-[10px] text-slate-400">Opsional Sekolah</span>
          </button>

          <button
            onClick={onOpenPrintModal}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-slate-800 dark:hover:bg-slate-800 transition-all text-center group"
          >
            <div className="h-9 w-9 rounded-lg bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-2 group-hover:scale-110 transition-transform">
              <Printer className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Cetak Rapor</span>
            <span className="text-[10px] text-slate-400">PDF A4 Resmi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
