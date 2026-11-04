/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  LockKeyhole,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  History,
  FileCheck2,
  ShieldAlert,
} from 'lucide-react';

export const FinalizationView: React.FC = () => {
  const {
    classes,
    reportFinalizations,
    activeSemester,
    updateFinalizationStatus,
    currentUser,
  } = useApp();

  const [unlockModalClassId, setUnlockModalClassId] = useState<string | null>(null);
  const [unlockReason, setUnlockReason] = useState('');

  const canApprove = currentUser.role === 'admin' || currentUser.role === 'kepala_sekolah';
  const canUnlock = currentUser.role === 'admin';

  const handleStatusChange = (classId: string, newStatus: any) => {
    updateFinalizationStatus(classId, newStatus);
  };

  const handleConfirmUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockModalClassId || !unlockReason.trim()) return;

    updateFinalizationStatus(unlockModalClassId, 'draft', unlockReason);
    setUnlockModalClassId(null);
    setUnlockReason('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <LockKeyhole className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Alur Pemeriksaan, Finalisasi & Kunci Rapor
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kontrol integritas data rapor: Draft → Pemeriksaan Wali Kelas → Persetujuan Kepala Sekolah → Kunci Permanen Rapor.
          </p>
        </div>
      </div>

      {/* Workflow Explainer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            TAHAP 1
          </span>
          <h4 className="mt-2 text-xs font-bold text-slate-800 dark:text-white">Draft (Input Nilai)</h4>
          <p className="mt-1 text-[11px] text-slate-500 leading-snug">
            Guru mapel & wali kelas memasukkan nilai, absensi, dan catatan perkembangan.
          </p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 shadow-sm dark:border-blue-900/50 dark:bg-blue-950/20">
          <span className="rounded bg-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-900 dark:bg-blue-900 dark:text-blue-200">
            TAHAP 2
          </span>
          <h4 className="mt-2 text-xs font-bold text-blue-950 dark:text-blue-100">Review / Pemeriksaan</h4>
          <p className="mt-1 text-[11px] text-blue-800/80 dark:text-blue-300 leading-snug">
            Wali kelas memeriksa kelengkapan seluruh mapel, leger, dan absensi satu rombel.
          </p>
        </div>

        <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-3.5 shadow-sm dark:border-purple-900/50 dark:bg-purple-950/20">
          <span className="rounded bg-purple-200 px-2 py-0.5 text-[10px] font-bold text-purple-900 dark:bg-purple-900 dark:text-purple-200">
            TAHAP 3
          </span>
          <h4 className="mt-2 text-xs font-bold text-purple-950 dark:text-purple-100">Disetujui Kepala Sekolah</h4>
          <p className="mt-1 text-[11px] text-purple-800/80 dark:text-purple-300 leading-snug">
            Kepala Sekolah memvalidasi kualitas rapor dan memberikan persetujuan penerbitan.
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <span className="rounded bg-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200">
            TAHAP 4
          </span>
          <h4 className="mt-2 text-xs font-bold text-emerald-950 dark:text-emerald-100">Final & Terkunci</h4>
          <p className="mt-1 text-[11px] text-emerald-800/80 dark:text-emerald-300 leading-snug">
            Rapor terkunci aman dari perubahan, siap dicetak dan didistribusikan ke orang tua.
          </p>
        </div>
      </div>

      {/* Class Finalization Status Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-4">Rombongan Belajar (Kelas)</th>
                <th className="py-3 px-3">Tingkat / Fase</th>
                <th className="py-3 px-4">Status Rapor Saat Ini</th>
                <th className="py-3 px-4">Disetujui Oleh & Waktu</th>
                <th className="py-3 px-4 text-center">Tindakan Alur Kerja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {classes.map((cls, idx) => {
                const fin = reportFinalizations.find(
                  f => f.classId === cls.id && f.semesterId === activeSemester.id
                );
                const status = fin?.status || 'draft';

                return (
                  <tr key={cls.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 text-center text-slate-500 font-medium">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">
                      {cls.className}
                    </td>
                    <td className="py-3 px-3">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        Kelas {cls.gradeLevel} (Fase {cls.phase})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {status === 'draft' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          Draft (Sedang Diisi)
                        </span>
                      )}
                      {status === 'review' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          Pemeriksaan Wali Kelas
                        </span>
                      )}
                      {status === 'disetujui' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-2.5 py-1 text-[11px] font-bold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                          Disetujui Kepala Sekolah
                        </span>
                      )}
                      {status === 'final_terkunci' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <LockKeyhole className="h-3 w-3 text-emerald-600" />
                          Final & Terkunci
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {fin?.finalizedBy ? (
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white">{fin.finalizedBy}</p>
                          <p className="text-[10px] text-slate-400">{fin.finalizedAt || '-'}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Belum difinalisasi</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {status === 'draft' && (
                          <button
                            onClick={() => handleStatusChange(cls.id, 'review')}
                            className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300"
                          >
                            Ajukan Review
                          </button>
                        )}

                        {status === 'review' && canApprove && (
                          <button
                            onClick={() => handleStatusChange(cls.id, 'disetujui')}
                            className="rounded-lg bg-purple-600 px-3 py-1 text-xs font-bold text-white shadow-sm hover:bg-purple-700"
                          >
                            Setujui Rapor
                          </button>
                        )}

                        {status === 'disetujui' && (
                          <button
                            onClick={() => handleStatusChange(cls.id, 'final_terkunci')}
                            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                          >
                            <LockKeyhole className="h-3 w-3" />
                            Kunci Rapor
                          </button>
                        )}

                        {status === 'final_terkunci' && canUnlock && (
                          <button
                            onClick={() => setUnlockModalClassId(cls.id)}
                            className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300"
                            title="Buka kunci untuk revisi dengan alasan resmi"
                          >
                            <Unlock className="h-3 w-3" />
                            Buka Kunci
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unlock Reason Modal */}
      {unlockModalClassId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-2xl dark:border-red-900 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-base mb-2">
              <ShieldAlert className="h-5 w-5" />
              Buka Kunci Rapor Kelas
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Pembukaan kunci rapor yang telah difinalisasi akan dicatat dalam <strong>Audit Log Sistem</strong>. Wajib menyertakan alasan pembukaan kembali untuk kepatuhan administrasi sekolah.
            </p>

            <form onSubmit={handleConfirmUnlock} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alasan Pembukaan Kunci Rapor *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Perbaikan kekeliruan input nilai asesmen sumatif PJOK atas persetujuan guru bersangkutan."
                  value={unlockReason}
                  onChange={(e) => setUnlockReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUnlockModalClassId(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-md shadow-red-600/20"
                >
                  Konfirmasi Buka Kunci
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
