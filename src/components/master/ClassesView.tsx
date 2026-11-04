/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ClassGroup, Phase } from '../../types/index.ts';
import { DoorOpen, Plus, Users, Edit2, Trash2, X, CheckCircle2 } from 'lucide-react';

export const ClassesView: React.FC = () => {
  const { classes, teachers, students, addClass, updateClass, deleteClass, currentUser, activeAcademicYear } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassGroup | null>(null);

  const [formData, setFormData] = useState<Omit<ClassGroup, 'id'>>({
    academicYearId: activeAcademicYear.id,
    className: '',
    gradeLevel: 1,
    phase: 'A',
    homeroomTeacherId: teachers[0]?.id || '',
    capacity: 28,
    isActive: true,
  });

  const canManage = currentUser.role === 'admin';

  const handleOpenAdd = () => {
    setEditingClass(null);
    setFormData({
      academicYearId: activeAcademicYear.id,
      className: '',
      gradeLevel: 1,
      phase: 'A',
      homeroomTeacherId: teachers[0]?.id || '',
      capacity: 30,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (cls: ClassGroup) => {
    setEditingClass(cls);
    setFormData({
      academicYearId: cls.academicYearId,
      className: cls.className,
      gradeLevel: cls.gradeLevel,
      phase: cls.phase,
      homeroomTeacherId: cls.homeroomTeacherId,
      capacity: cls.capacity,
      isActive: cls.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      updateClass(editingClass.id, formData);
    } else {
      addClass(formData);
    }
    setModalOpen(false);
  };

  const getPhaseFromGrade = (grade: number): Phase => {
    if (grade <= 2) return 'A';
    if (grade <= 4) return 'B';
    return 'C';
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <DoorOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Manajemen Rombongan Belajar (Kelas)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Daftar kelas tingkat 1 sampai 6, penetapan wali kelas, dan pemetaan Fase Kurikulum Merdeka.
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
          >
            <Plus className="h-4 w-4" />
            Tambah Kelas Baru
          </button>
        )}
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => {
          const homeroom = teachers.find(t => t.id === cls.homeroomTeacherId);
          const studentCount = students.filter(s => s.currentClassId === cls.id).length;
          const isCapacityFull = studentCount >= cls.capacity;

          return (
            <div
              key={cls.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    FASE {cls.phase} • TINGKAT {cls.gradeLevel}
                  </span>
                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(cls)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800"
                        title="Edit Kelas"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus kelas ${cls.className}?`)) {
                            deleteClass(cls.id);
                          }
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
                        title="Hapus Kelas"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                  {cls.className}
                </h3>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400">Wali Kelas:</span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {homeroom?.fullName || 'Belum Ditetapkan'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400">Jumlah Siswa:</span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {studentCount} / {cls.capacity} Siswa
                    </span>
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isCapacityFull ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (studentCount / cls.capacity) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-3 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Tahun Ajaran {activeAcademicYear.yearName}</span>
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="h-3 w-3" /> Aktif
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingClass ? 'Edit Rombel' : 'Tambah Rombel Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Kelas & Rombel *
                </label>
                <input
                  type="text"
                  required
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  placeholder="Contoh: 5A - Ibnu Battuta"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tingkat Kelas (1-6)
                  </label>
                  <select
                    value={formData.gradeLevel}
                    onChange={(e) => {
                      const grade = Number(e.target.value);
                      setFormData({
                        ...formData,
                        gradeLevel: grade,
                        phase: getPhaseFromGrade(grade),
                      });
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map(g => (
                      <option key={g} value={g}>Kelas {g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fase Kurikulum
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`Fase ${formData.phase}`}
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Wali Kelas *
                </label>
                <select
                  value={formData.homeroomTeacherId}
                  onChange={(e) => setFormData({ ...formData, homeroomTeacherId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">-- Pilih Guru Wali Kelas --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.fullName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kapasitas Maksimal Siswa
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700"
                >
                  Simpan Rombel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
