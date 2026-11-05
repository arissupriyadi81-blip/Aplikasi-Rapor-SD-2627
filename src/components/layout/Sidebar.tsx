/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  DoorOpen,
  BookOpen,
  Compass,
  FileCheck2,
  ClipboardPen,
  Sparkles,
  Award,
  CalendarCheck2,
  MessageSquareQuote,
  Trophy,
  TableProperties,
  ArrowUpDown,
  LockKeyhole,
  Printer,
  History,
  Database,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPrintModal: () => void;
  onOpenDbModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onOpenPrintModal,
  onOpenDbModal,
}) => {
  const { currentView, setCurrentView, currentUser } = useApp();

  const role = currentUser.role;

  interface NavItem {
    id: string;
    label: string;
    icon: any;
    allowedRoles: ('admin' | 'kepala_sekolah' | 'guru_mapel' | 'wali_kelas')[];
    badge?: string;
    action?: () => void;
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  const sections: NavSection[] = [
    {
      title: 'UTAMA',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, allowedRoles: ['admin', 'kepala_sekolah', 'guru_mapel', 'wali_kelas'] },
      ],
    },
    {
      title: 'DATA MASTER',
      items: [
        { id: 'profil-sekolah', label: 'Profil Sekolah', icon: Building2, allowedRoles: ['admin', 'kepala_sekolah'] },
        { id: 'guru', label: 'Data Guru', icon: Users, allowedRoles: ['admin', 'kepala_sekolah'] },
        { id: 'siswa', label: 'Data Siswa', icon: GraduationCap, allowedRoles: ['admin', 'kepala_sekolah', 'wali_kelas'] },
        { id: 'kelas', label: 'Rombel / Kelas', icon: DoorOpen, allowedRoles: ['admin', 'kepala_sekolah', 'wali_kelas'] },
        { id: 'mata-pelajaran', label: 'Mata Pelajaran', icon: BookOpen, allowedRoles: ['admin', 'kepala_sekolah', 'guru_mapel'] },
        { id: 'ekskul-master', label: 'Master Ekskul', icon: Award, allowedRoles: ['admin', 'kepala_sekolah'] },
      ],
    },
    {
      title: 'KURIKULUM MERDEKA',
      items: [
        { id: 'cp-tp', label: 'Capaian & TP (CP/TP)', icon: Compass, allowedRoles: ['admin', 'guru_mapel', 'wali_kelas', 'kepala_sekolah'] },
      ],
    },
    {
      title: 'PENILAIAN & ASESMEN',
      items: [
        { id: 'input-nilai', label: 'Input Nilai Siswa', icon: ClipboardPen, allowedRoles: ['admin', 'guru_mapel', 'wali_kelas'], badge: 'CP & TP' },
        { id: 'kokurikuler', label: 'Kokurikuler (Rubrik & Asesmen)', icon: Sparkles, allowedRoles: ['admin', 'guru_mapel', 'wali_kelas', 'kepala_sekolah'] },
        { id: 'ekskul', label: 'Nilai Ekstrakurikuler', icon: Award, allowedRoles: ['admin', 'wali_kelas', 'guru_mapel'] },
      ],
    },
    {
      title: 'ADMINISTRASI KELAS',
      items: [
        { id: 'kehadiran', label: 'Kehadiran Siswa', icon: CalendarCheck2, allowedRoles: ['admin', 'wali_kelas'] },
        { id: 'catatan-wali', label: 'Catatan Wali Kelas', icon: MessageSquareQuote, allowedRoles: ['admin', 'wali_kelas'] },
        { id: 'prestasi', label: 'Prestasi Siswa', icon: Trophy, allowedRoles: ['admin', 'wali_kelas', 'kepala_sekolah'] },
      ],
    },
    {
      title: 'LAPORAN & CETAK RAPOR',
      items: [
        { id: 'leger', label: 'Leger Nilai Kelas', icon: TableProperties, allowedRoles: ['admin', 'kepala_sekolah', 'wali_kelas'] },
        { id: 'ranking', label: 'Ranking Siswa (Opsional)', icon: ArrowUpDown, allowedRoles: ['admin', 'kepala_sekolah', 'wali_kelas'] },
        {
          id: 'cetak-rapor',
          label: 'Cetak Rapor Digital',
          icon: Printer,
          allowedRoles: ['admin', 'kepala_sekolah', 'wali_kelas'],
          badge: 'PDF A4',
          action: onOpenPrintModal,
        },
      ],
    },
    {
      title: 'SISTEM & EKSPOR',
      items: [
        {
          id: 'export-db',
          label: 'Unduh SQL & PHP Bundle',
          icon: Database,
          allowedRoles: ['admin', 'kepala_sekolah', 'guru_mapel', 'wali_kelas'],
          action: onOpenDbModal,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header in Drawer */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white p-1 border border-slate-200 dark:border-slate-700 dark:bg-slate-800">
              <img src="/logo-aljannah-emblem.png" alt="Logo SD IAS Al-Jannah" className="h-full w-full object-contain" />
            </div>
            <span className="font-bold text-slate-800 dark:text-white text-sm">
              E-Rapor SD AJ
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Tutup Menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {sections.map((sec, idx) => {
            const filteredItems = sec.items.filter((item) =>
              item.allowedRoles.includes(role)
            );
            if (filteredItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                  {sec.title}
                </p>
                <div className="space-y-0.5">
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (item.action) {
                            item.action();
                          } else {
                            setCurrentView(item.id);
                          }
                          onClose();
                        }}
                        className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`h-4 w-4 transition-colors ${
                              isActive
                                ? 'text-white'
                                : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info in sidebar */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
              SD IAS Al-Jannah
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              NPSN: 20108390 • Kurikulum Merdeka
            </p>
            <div className="mt-2 flex items-center justify-between text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              <span>Status Sistem</span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Aktif & Terhubung
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
