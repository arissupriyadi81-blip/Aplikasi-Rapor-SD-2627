/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { StudentAchievement } from '../../types/index.ts';
import { Trophy, Plus, Edit2, Trash2, X, Award, CheckCircle2, Search } from 'lucide-react';

export const AchievementsView: React.FC = () => {
  const { achievements, students, addAchievement, updateAchievement, deleteAchievement, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAch, setEditingAch] = useState<StudentAchievement | null>(null);

  const [formData, setFormData] = useState<Omit<StudentAchievement, 'id'>>({
    studentId: students[1]?.id || students[0]?.id || '',
    achievementName: '',
    category: 'akademik',
    level: 'kabupaten_kota',
    organizer: '',
    eventDate: '2026-10-15',
    rankOrAward: 'Juara 1',
    description: '',
    verificationStatus: 'terverifikasi',
  });

  const canManage = currentUser.role === 'admin' || currentUser.role === 'wali_kelas';

  const filtered = achievements.filter(a => {
    const std = students.find(s => s.id === a.studentId);
    return (
      a.achievementName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (std && std.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      a.organizer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleOpenAdd = () => {
    setEditingAch(null);
    setFormData({
      studentId: students[1]?.id || students[0]?.id || '',
      achievementName: '',
      category: 'akademik',
      level: 'kabupaten_kota',
      organizer: '',
      eventDate: '2026-10-15',
      rankOrAward: 'Juara 1',
      description: '',
      verificationStatus: 'terverifikasi',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (ach: StudentAchievement) => {
    setEditingAch(ach);
    setFormData({
      studentId: ach.studentId,
      achievementName: ach.achievementName,
      category: ach.category,
      level: ach.level,
      organizer: ach.organizer,
      eventDate: ach.eventDate,
      rankOrAward: ach.rankOrAward,
      description: ach.description,
      verificationStatus: ach.verificationStatus,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAch) {
      updateAchievement(editingAch.id, formData);
    } else {
      addAchievement(formData);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            Prestasi & Penghargaan Siswa
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pencatatan prestasi olimpiade sains, robotika, keagamaan, dan seni untuk dicetak pada lembar Rapor Prestasi.
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
          >
            <Plus className="h-4 w-4" />
            Tambah Prestasi
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari prestasi, nama siswa, atau penyelenggara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Nama Kompetisi / Kegiatan</th>
                <th className="py-3 px-3">Tingkat</th>
                <th className="py-3 px-3">Peringkat / Capaian</th>
                <th className="py-3 px-4">Penyelenggara</th>
                <th className="py-3 px-3 text-center">Verifikasi</th>
                {canManage && <th className="py-3 px-3 text-center w-20">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((ach, idx) => {
                const std = students.find(s => s.id === ach.studentId);

                return (
                  <tr key={ach.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 text-center text-slate-500 font-medium">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">
                      {std?.fullName || 'Siswa tidak ditemukan'}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800 dark:text-white">{ach.achievementName}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{ach.category.replace('_', ' ')} • {ach.eventDate}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300 capitalize">
                        {ach.level.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-600 dark:text-amber-400">
                      {ach.rankOrAward}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {ach.organizer}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Terverifikasi
                      </span>
                    </td>
                    {canManage && (
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(ach)}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-emerald-600"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Hapus data prestasi ini?')) {
                                deleteAchievement(ach.id);
                              }
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingAch ? 'Edit Prestasi Siswa' : 'Tambah Prestasi Siswa'}
              </h3>
              <button onClick={() => setModalOpen(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Peserta Didik *
                </label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.fullName} ({s.nis})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Kompetisi / Kegiatan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.achievementName}
                  onChange={(e) => setFormData({ ...formData, achievementName: e.target.value })}
                  placeholder="Contoh: Olimpiade Sains Nasional (OSN) IPA"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="akademik">Akademik</option>
                    <option value="non_akademik">Non-Akademik / Minat Bakat</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tingkat Perlombaan
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="sekolah">Sekolah</option>
                    <option value="kecamatan">Kecamatan</option>
                    <option value="kabupaten_kota">Kabupaten / Kota</option>
                    <option value="provinsi">Provinsi</option>
                    <option value="nasional">Nasional</option>
                    <option value="internasional">Internasional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Peringkat / Penghargaan *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.rankOrAward}
                    onChange={(e) => setFormData({ ...formData, rankOrAward: e.target.value })}
                    placeholder="Contoh: Juara 1 / Medali Emas"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Penyelenggara
                  </label>
                  <input
                    type="text"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    placeholder="Contoh: Kemendikbudristek"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Catatan tambahan mengenai prestasi ini..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Simpan Prestasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
