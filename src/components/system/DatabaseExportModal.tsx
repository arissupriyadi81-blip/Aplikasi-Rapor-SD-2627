/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Database,
  Download,
  Copy,
  Check,
  X,
  Server,
  Terminal,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

interface DatabaseExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseExportModal: React.FC<DatabaseExportModalProps> = ({ isOpen, onClose }) => {
  const { resetAllData } = useApp();
  const [activeTab, setActiveTab] = useState<'sql' | 'php' | 'guide'>('sql');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlSample = `-- ==============================================================================
-- DATABASE SCHEMA: E-RAPOR SD AJ (IAS AL-JANNAH)
-- Rapor Digital Kurikulum Merdeka - Sekolah Dasar Islam Alam & Sains Al-Jannah
-- Dialek: MySQL 8.0+ / MariaDB 10.5+
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS erapor_sd_aj CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE erapor_sd_aj;

CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    role ENUM('admin', 'kepala_sekolah', 'guru_mapel', 'wali_kelas') NOT NULL,
    email VARCHAR(100),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE school_profiles (
    id VARCHAR(36) PRIMARY KEY,
    school_name VARCHAR(150) NOT NULL,
    npsn VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    headmaster_name VARCHAR(120) NOT NULL,
    headmaster_nip VARCHAR(50),
    report_place VARCHAR(50) DEFAULT 'Jakarta Timur',
    report_date DATE
) ENGINE=InnoDB;

CREATE TABLE students (
    id VARCHAR(36) PRIMARY KEY,
    nis VARCHAR(20) NOT NULL UNIQUE,
    nisn VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(120) NOT NULL,
    gender ENUM('L', 'P') NOT NULL,
    status ENUM('aktif', 'pindah', 'lulus', 'keluar') DEFAULT 'aktif'
) ENGINE=InnoDB;

-- (File lengkap tersedia di folder /database/database.sql)`;

  const phpSample = `<?php
/**
 * Konfigurasi Database PDO - E-Rapor SD AJ (IAS Al-Jannah)
 * Kompatibel dengan XAMPP, Laragon, & Hosting MySQL/MariaDB
 */
date_default_timezone_set('Asia/Jakarta');

$db_host = '127.0.0.1';
$db_port = '3306';
$db_name = 'erapor_sd_aj';
$db_user = 'root';
$db_pass = '';

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
];

try {
    $pdo = new PDO("mysql:host={$db_host};port={$db_port};dbname={$db_name};charset=utf8mb4", $db_user, $db_pass, $options);
} catch (PDOException $e) {
    die("Database Connection Error: " . $e->getMessage());
}
?>`;

  const handleCopyCode = () => {
    const text = activeTab === 'sql' ? sqlSample : phpSample;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSQL = () => {
    const element = document.createElement('a');
    const file = new Blob([sqlSample], { type: 'text/sql' });
    element.href = URL.createObjectURL(file);
    element.download = 'database.sql';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex flex-col h-[85vh] w-full max-w-4xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Ekspor Database SQL & Panduan PHP Native (XAMPP/Laragon)
              </h3>
              <p className="text-xs text-slate-500">
                Skema tabel relasional MySQL 8, konfigurasi PDO, dan instruksi deployment lokal.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 dark:border-slate-800 dark:bg-slate-800/50 text-xs">
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-4 font-bold border-b-2 transition-all ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Struktur database.sql
          </button>
          <button
            onClick={() => setActiveTab('php')}
            className={`py-3 px-4 font-bold border-b-2 transition-all ${
              activeTab === 'php'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Koneksi PHP PDO (config.php)
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 font-bold border-b-2 transition-all ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Panduan Instalasi XAMPP
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs">
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">
                  Dialek MySQL 8 / MariaDB (InnoDB, Foreign Key CASCADE, UTF8MB4). File lengkap berada di <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-600">/database/database.sql</code>.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
                  </button>
                  <button
                    onClick={handleDownloadSQL}
                    className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 font-bold text-white hover:bg-emerald-700"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Unduh database.sql</span>
                  </button>
                </div>
              </div>
              <pre className="rounded-xl bg-slate-950 p-4 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed border border-slate-800">
                {sqlSample}
              </pre>
            </div>
          )}

          {activeTab === 'php' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">
                  Script koneksi database PDO dengan pencegahan SQL Injection (prepared statements). Tersedia di <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-600">/database/config.php</code>.
                </span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin PHP Code'}</span>
                </button>
              </div>
              <pre className="rounded-xl bg-slate-950 p-4 font-mono text-[11px] text-sky-400 overflow-x-auto leading-relaxed border border-slate-800">
                {phpSample}
              </pre>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm mb-1">
                  Petunjuk Menjalankan di XAMPP / Laragon:
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-xs text-emerald-950 dark:text-emerald-300 mt-2">
                  <li>Nyalakan service <strong>Apache</strong> dan <strong>MySQL</strong> pada XAMPP Control Panel.</li>
                  <li>Buka browser dan akses <code>http://localhost/phpmyadmin</code>.</li>
                  <li>Buat database baru bernama <code>erapor_sd_aj</code> dengan collation <code>utf8mb4_unicode_ci</code>.</li>
                  <li>Klik tab <strong>Import</strong> dan pilih file <code>/database/database.sql</code> yang telah diunduh.</li>
                  <li>Letakkan folder project di dalam direktori <code>C:\xampp\htdocs\erapor-sd-aj\</code>.</li>
                  <li>Buka browser dan akses <code>http://localhost/erapor-sd-aj/</code>. Aplikasi langsung dapat digunakan bersama dalam mode terpadu.</li>
                </ol>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Reset Data Simulasi Browser</h4>
                  <p className="text-[11px] text-slate-500">
                    Kembalikan seluruh data di browser ini ke kondisi awal bawaan pabrik SD IAS Al-Jannah.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Yakin ingin mereset seluruh data lokal ke kondisi awal demo?')) {
                      resetAllData();
                      alert('Data berhasil direset.');
                    }
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 font-bold text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950 dark:text-red-300 text-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset ke Data Default
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 dark:border-slate-800 dark:bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
