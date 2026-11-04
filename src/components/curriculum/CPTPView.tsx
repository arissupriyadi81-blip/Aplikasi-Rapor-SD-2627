/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { LearningOutcomeCP, LearningObjectiveTP, Phase } from '../../types/index.ts';
import { Compass, Plus, Edit2, Trash2, X, Filter, BookOpen } from 'lucide-react';

export const CPTPView: React.FC = () => {
  const { cps, tps, subjects, activeAcademicYear, addCP, updateCP, deleteCP, addTP, updateTP, deleteTP, currentUser } = useApp();

  const [selectedPhase, setSelectedPhase] = useState<Phase>('C');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[4]?.id || subjects[0]?.id || '');
  const [cpModalOpen, setCpModalOpen] = useState(false);
  const [tpModalOpen, setTpModalOpen] = useState(false);

  const [editingCP, setEditingCP] = useState<LearningOutcomeCP | null>(null);
  const [editingTP, setEditingTP] = useState<LearningObjectiveTP | null>(null);

  const [cpFormData, setCpFormData] = useState<Omit<LearningOutcomeCP, 'id'>>({
    academicYearId: activeAcademicYear.id,
    phase: selectedPhase,
    subjectId: selectedSubjectId,
    element: '',
    cpDescription: '',
    curriculumVersion: 'Kurikulum Merdeka Kemendikbudristek',
    isActive: true,
  });

  const [tpFormData, setTpFormData] = useState<Omit<LearningObjectiveTP, 'id'>>({
    cpId: '',
    tpCode: '',
    tpDescription: '',
    tpOrder: 1,
    semester: 1,
    weight: 1,
    isActive: true,
  });

  const canEdit = currentUser.role === 'admin' || currentUser.role === 'guru_mapel';

  // Filtered CP for current subject and phase
  const filteredCPs = cps.filter(c => c.phase === selectedPhase && c.subjectId === selectedSubjectId);
  const activeCP = filteredCPs[0] || null;

  // TPs under active CP
  const currentTPs = activeCP ? tps.filter(t => t.cpId === activeCP.id) : [];

  const handleOpenAddCP = () => {
    setEditingCP(null);
    setCpFormData({
      academicYearId: activeAcademicYear.id,
      phase: selectedPhase,
      subjectId: selectedSubjectId,
      element: '',
      cpDescription: '',
      curriculumVersion: 'Kurikulum Merdeka 2024/2026',
      isActive: true,
    });
    setCpModalOpen(true);
  };

  const handleOpenEditCP = (cp: LearningOutcomeCP) => {
    setEditingCP(cp);
    setCpFormData({
      academicYearId: cp.academicYearId,
      phase: cp.phase,
      subjectId: cp.subjectId,
      element: cp.element,
      cpDescription: cp.cpDescription,
      curriculumVersion: cp.curriculumVersion,
      isActive: cp.isActive,
    });
    setCpModalOpen(true);
  };

  const handleOpenAddTP = () => {
    if (!activeCP) return;
    setEditingTP(null);
    setTpFormData({
      cpId: activeCP.id,
      tpCode: `TP ${selectedPhase === 'A' ? '1' : selectedPhase === 'B' ? '3' : '5'}.${currentTPs.length + 1}`,
      tpDescription: '',
      tpOrder: currentTPs.length + 1,
      semester: 1,
      weight: 1,
      isActive: true,
    });
    setTpModalOpen(true);
  };

  const handleOpenEditTP = (tp: LearningObjectiveTP) => {
    setEditingTP(tp);
    setTpFormData({
      cpId: tp.cpId,
      tpCode: tp.tpCode,
      tpDescription: tp.tpDescription,
      tpOrder: tp.tpOrder,
      semester: tp.semester,
      weight: tp.weight,
      isActive: tp.isActive,
    });
    setTpModalOpen(true);
  };

  const handleSaveCP = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCP) {
      updateCP(editingCP.id, cpFormData);
    } else {
      addCP(cpFormData);
    }
    setCpModalOpen(false);
  };

  const handleSaveTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTP) {
      updateTP(editingTP.id, tpFormData);
    } else {
      addTP(tpFormData);
    }
    setTpModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Capaian Pembelajaran (CP) & Tujuan Pembelajaran (TP)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pengelolaan CP per fase kurikulum dan pemetaan TP yang digunakan pada deskripsi capaian rapor.
          </p>
        </div>
      </div>

      {/* Filter Bar: Phase and Subject */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih Fase:</span>
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {(['A', 'B', 'C'] as Phase[]).map((phase) => (
              <button
                key={phase}
                onClick={() => setSelectedPhase(phase)}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  selectedPhase === phase
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Fase {phase} ({phase === 'A' ? 'Kelas 1-2' : phase === 'B' ? 'Kelas 3-4' : 'Kelas 5-6'})
              </button>
            ))}
          </div>
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Mata Pelajaran:</span>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.subjectCode} - {s.subjectName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Capaian Pembelajaran (CP) Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div>
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              CAPAIAN PEMBELAJARAN (CP)
            </span>
            <h3 className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
              Elemen: {activeCP ? activeCP.element : 'Belum Ada CP Didaftarkan'}
            </h3>
          </div>

          {canEdit && (
            <div>
              {activeCP ? (
                <button
                  onClick={() => handleOpenEditCP(activeCP)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Edit2 className="h-3 w-3 text-slate-500" />
                  Edit CP
                </button>
              ) : (
                <button
                  onClick={handleOpenAddCP}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Tambah CP untuk Fase Ini
                </button>
              )}
            </div>
          )}
        </div>

        {activeCP ? (
          <div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {activeCP.cpDescription}
            </p>
            <p className="mt-2 text-[10px] text-slate-400">
              Versi: {activeCP.curriculumVersion} • Tahun Ajaran: {activeAcademicYear.yearName}
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-2">
            Belum ada Capaian Pembelajaran untuk kombinasi Fase {selectedPhase} dan mata pelajaran ini. Silakan tambahkan CP terlebih dahulu.
          </p>
        )}
      </div>

      {/* Tujuan Pembelajaran (TP) Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Tujuan Pembelajaran (TP) yang Diturunkan dari CP
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              TP ini digunakan guru saat mengisi nilai formatif dan menjadi rujukan kalimat deskripsi capaian rapor.
            </p>
          </div>

          {canEdit && activeCP && (
            <button
              onClick={handleOpenAddTP}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah TP Baru
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                <th className="py-3 px-3 w-16 text-center">Kode</th>
                <th className="py-3 px-4">Deskripsi Tujuan Pembelajaran (TP)</th>
                <th className="py-3 px-3 text-center w-24">Semester</th>
                <th className="py-3 px-3 text-center w-20">Bobot</th>
                {canEdit && <th className="py-3 px-3 text-center w-20">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentTPs.length > 0 ? (
                currentTPs.map((tp) => (
                  <tr key={tp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {tp.tpCode}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                      {tp.tpDescription}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        Semester {tp.semester}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-semibold text-slate-600 dark:text-slate-400">
                      {tp.weight}
                    </td>
                    {canEdit && (
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditTP(tp)}
                            className="rounded-lg p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                            title="Edit TP"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus tujuan pembelajaran ${tp.tpCode}?`)) {
                                deleteTP(tp.id);
                              }
                            }}
                            className="rounded-lg p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                            title="Hapus TP"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                    Belum ada Tujuan Pembelajaran (TP) yang dicatat. Silakan klik tombol "Tambah TP Baru".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CP Modal */}
      {cpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingCP ? 'Edit Capaian Pembelajaran' : 'Tambah Capaian Pembelajaran (CP)'}
              </h3>
              <button onClick={() => setCpModalOpen(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSaveCP} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Elemen CP *
                </label>
                <input
                  type="text"
                  required
                  value={cpFormData.element}
                  onChange={(e) => setCpFormData({ ...cpFormData, element: e.target.value })}
                  placeholder="Contoh: Pemahaman IPAS (Sains & Sosial)"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi Capaian Pembelajaran *
                </label>
                <textarea
                  rows={4}
                  required
                  value={cpFormData.cpDescription}
                  onChange={(e) => setCpFormData({ ...cpFormData, cpDescription: e.target.value })}
                  placeholder="Tuliskan rumusan CP resmi Kurikulum Merdeka..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCpModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Simpan CP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TP Modal */}
      {tpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingTP ? 'Edit Tujuan Pembelajaran' : 'Tambah Tujuan Pembelajaran (TP)'}
              </h3>
              <button onClick={() => setTpModalOpen(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSaveTP} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kode TP *
                  </label>
                  <input
                    type="text"
                    required
                    value={tpFormData.tpCode}
                    onChange={(e) => setTpFormData({ ...tpFormData, tpCode: e.target.value })}
                    placeholder="Contoh: TP 5.1"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Semester
                  </label>
                  <select
                    value={tpFormData.semester}
                    onChange={(e) => setTpFormData({ ...tpFormData, semester: Number(e.target.value) as 1 | 2 })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value={1}>Semester 1 (Ganjil)</option>
                    <option value={2}>Semester 2 (Genap)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi Tujuan Pembelajaran *
                </label>
                <textarea
                  rows={3}
                  required
                  value={tpFormData.tpDescription}
                  onChange={(e) => setTpFormData({ ...tpFormData, tpDescription: e.target.value })}
                  placeholder="Contoh: Mengidentifikasi organ pernapasan dan pencernaan manusia beserta fungsinya"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setTpModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Simpan TP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
