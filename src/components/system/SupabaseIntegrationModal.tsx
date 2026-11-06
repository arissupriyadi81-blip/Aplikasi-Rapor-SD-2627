/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  syncAllDataToSupabase,
} from '../../lib/supabase.ts';
import {
  Database,
  Copy,
  Check,
  X,
  ExternalLink,
  RefreshCw,
  Server,
  Key,
  Globe,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileCode,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Download,
} from 'lucide-react';

interface SupabaseIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseIntegrationModal: React.FC<SupabaseIntegrationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    schoolProfile,
    academicYears,
    semesters,
    teachers,
    classes,
    subjects,
    students,
    extracurriculars,
    extracurricularMembers,
    assessments,
    attendances,
    homeroomNotes,
    achievements,
    cocurricularActivities,
    cocurricularRubrics,
    cocurricularAssessments,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'query' | 'connection' | 'guide'>('query');
  const [copied, setCopied] = useState(false);
  const [sqlContent, setSqlContent] = useState<string>('');
  const [isLoadingSql, setIsLoadingSql] = useState<boolean>(true);

  // Form State
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ tested: false, loading: false });

  // Sync State
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<string>('');
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message: string;
    details: string[];
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      setSupabaseUrl(cfg.url);
      setSupabaseAnonKey(cfg.anonKey);

      // Load SQL file
      fetch('/database/supabase_schema.sql')
        .then(res => res.text())
        .then(text => {
          setSqlContent(text);
          setIsLoadingSql(false);
        })
        .catch(() => {
          setSqlContent('-- Gagal membaca berkas SQL. Silakan periksa file /database/supabase_schema.sql');
          setIsLoadingSql(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([sqlContent], { type: 'text/sql;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'supabase_schema_aljannah.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveConfig = () => {
    saveSupabaseConfig({
      url: supabaseUrl.trim(),
      anonKey: supabaseAnonKey.trim(),
    });
  };

  const handleTestConnection = async () => {
    handleSaveConfig();
    setConnectionStatus({ tested: false, loading: true });
    const res = await testSupabaseConnection(supabaseUrl.trim(), supabaseAnonKey.trim());
    setConnectionStatus({
      tested: true,
      loading: false,
      success: res.success,
      message: res.message,
    });
  };

  const handleSyncData = async () => {
    handleSaveConfig();
    setIsSyncing(true);
    setSyncProgress('Memulai sinkronisasi...');
    setSyncResult(null);

    const res = await syncAllDataToSupabase(
      {
        schoolProfile,
        academicYears,
        semesters,
        teachers,
        classes,
        subjects,
        students,
        extracurriculars,
        extracurricularMembers,
        assessments,
        attendances,
        homeroomNotes,
        achievements,
        cocurricularActivities,
        cocurricularRubrics,
        cocurricularAssessments,
      },
      (msg) => setSyncProgress(msg)
    );

    setIsSyncing(false);
    setSyncResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="flex flex-col h-[90vh] w-full max-w-4xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  Integrasi Database Supabase (PostgreSQL)
                </h3>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Cloud DB
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hubungkan E-Rapor SD IAS Al-Jannah dengan Supabase untuk penyimpanan data terpusat, aman, & real-time.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('query')}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 transition-all ${
              activeTab === 'query'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <FileCode className="h-4 w-4" />
            <span>1. Query SQL Editor</span>
          </button>

          <button
            onClick={() => setActiveTab('connection')}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 transition-all ${
              activeTab === 'connection'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Server className="h-4 w-4" />
            <span>2. Koneksi & Sinkronisasi Data</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 transition-all ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>3. Panduan Integrasi Step-by-Step</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/50">
          {/* TAB 1: QUERY SQL EDITOR */}
          {activeTab === 'query' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Skrip DDL PostgreSQL Khusus Supabase SQL Editor
                  </h4>
                  <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                    Skrip ini mencakup 17 tabel (siswa, guru, nilai, rapor, ekskul, dll), relasi foreign key, Row Level Security (RLS), dan data awal resmi SD IAS Al-Jannah.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? 'Berhasil Disalin!' : 'Salin Seluruh Query SQL'}</span>
                  </button>

                  <button
                    onClick={handleDownloadSql}
                    className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-all"
                    title="Unduh file supabase_schema.sql"
                  >
                    <Download className="h-4 w-4" />
                    <span>Unduh .sql</span>
                  </button>
                </div>
              </div>

              {/* Code Viewer */}
              <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
                <div className="flex items-center justify-between bg-slate-900 px-4 py-2 border-b border-slate-800 text-[11px] text-slate-400">
                  <span className="font-mono">database/supabase_schema.sql (PostgreSQL 15+)</span>
                  <span>{sqlContent.split('\n').length} baris kode</span>
                </div>
                <pre className="p-4 text-[11px] font-mono leading-relaxed text-emerald-400 overflow-x-auto max-h-[380px] whitespace-pre selection:bg-emerald-700 selection:text-white">
                  {isLoadingSql ? 'Memuat skrip SQL...' : sqlContent}
                </pre>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Setelah menjalankan skrip ini di SQL Editor Supabase, lanjutkan ke tab <strong>2. Koneksi & Sinkronisasi Data</strong>.
                </p>
                <button
                  onClick={() => setActiveTab('connection')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                >
                  <span>Lanjut Konfigurasi Koneksi</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: KONEKSI & SINKRONISASI */}
          {activeTab === 'connection' && (
            <div className="space-y-6">
              {/* Form Input Kredensial */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                    Kredensial API Supabase Proyek Anda
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Dapatkan URL dan Anon Key dari dashboard Supabase menu <strong>Project Settings → API</strong>.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Project URL (VITE_SUPABASE_URL)</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://xyzcompany.supabase.co"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <Key className="h-3.5 w-3.5 text-emerald-600" />
                      <span>API Anon / Public Key (VITE_SUPABASE_ANON_KEY)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={supabaseAnonKey}
                      onChange={(e) => setSupabaseAnonKey(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={connectionStatus.loading || !supabaseUrl || !supabaseAnonKey}
                      className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-900 disabled:opacity-50 transition-all dark:bg-slate-700 dark:hover:bg-slate-600"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${connectionStatus.loading ? 'animate-spin' : ''}`} />
                      <span>{connectionStatus.loading ? 'Menguji...' : 'Uji Koneksi Supabase'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveConfig}
                      className="rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Simpan Kredensial
                    </button>
                  </div>

                  {connectionStatus.tested && (
                    <div
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        connectionStatus.success
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {connectionStatus.success ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                      )}
                      <span>{connectionStatus.message}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sinkronisasi Data Lokal ke Cloud */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/20 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                      <UploadCloud className="h-5 w-5 text-emerald-600" />
                      Sinkronkan Data Aplikasi ke Supabase
                    </h4>
                    <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-1">
                      Kirim seluruh data lokal (profil sekolah, rombel kelas, siswa, guru, ekstrakurikuler, dan nilai) yang ada di aplikasi saat ini langsung ke tabel-tabel Supabase Anda.
                    </p>
                  </div>

                  <button
                    onClick={handleSyncData}
                    disabled={isSyncing || !supabaseUrl || !supabaseAnonKey}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 transition-all shrink-0"
                  >
                    <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? syncProgress || 'Menyinkronkan...' : 'Sinkronkan Data Sekarang'}</span>
                  </button>
                </div>

                {/* Progress / Result Log */}
                {syncResult && (
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>{syncResult.message}</span>
                    </div>
                    {syncResult.details.length > 0 && (
                      <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                        {syncResult.details.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PANDUAN INTEGRASI STEP-BY-STEP */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  Langkah-Langkah Mengintegrasikan Supabase ke E-Rapor Al-Jannah
                </h4>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs">
                      1
                    </span>
                    <div className="space-y-1">
                      <strong className="text-slate-900 dark:text-white">Buat Proyek Baru di Supabase</strong>
                      <p className="text-slate-600 dark:text-slate-400">
                        Buka{' '}
                        <a
                          href="https://supabase.com/dashboard"
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
                        >
                          supabase.com/dashboard <ExternalLink className="h-3 w-3" />
                        </a>
                        , login lalu klik <strong>"New Project"</strong>. Beri nama proyek misalnya <code>erapor-sd-aljannah</code> dan tentukan kata sandi database.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs">
                      2
                    </span>
                    <div className="space-y-1">
                      <strong className="text-slate-900 dark:text-white">Jalankan Skrip di SQL Editor</strong>
                      <p className="text-slate-600 dark:text-slate-400">
                        Di dashboard proyek Supabase Anda, buka tab <strong>SQL Editor</strong> di menu sebelah kiri. Klik <strong>"New query"</strong>, salin query dari tab <strong>1. Query SQL Editor</strong> di modal ini, lalu klik tombol hijau <strong>"RUN"</strong> (atau tekan Ctrl+Enter).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs">
                      3
                    </span>
                    <div className="space-y-1">
                      <strong className="text-slate-900 dark:text-white">Ambil Kredensial URL & API Key</strong>
                      <p className="text-slate-600 dark:text-slate-400">
                        Masuk ke menu <strong>Project Settings → API</strong> di Supabase. Salin nilai <strong>Project URL</strong> dan <strong>Project API Keys (anon / public)</strong>, lalu masukkan ke tab <strong>2. Koneksi & Sinkronisasi</strong> di atas.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs">
                      4
                    </span>
                    <div className="space-y-1">
                      <strong className="text-slate-900 dark:text-white">Pasang di Vercel (Production Deployment)</strong>
                      <p className="text-slate-600 dark:text-slate-400">
                        Pada dashboard Vercel Anda di <strong>Settings → Environment Variables</strong>, tambahkan 2 variabel berikut agar aplikasi live selalu otomatis terhubung:
                      </p>
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 font-mono text-[11px] space-y-1">
                        <div>VITE_SUPABASE_URL = https://your-project-id.supabase.co</div>
                        <div>VITE_SUPABASE_ANON_KEY = eyJhbGciOi...</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3.5 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Format skrip PostgreSQL 100% kompatibel dengan Supabase Table Editor & RLS</span>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
