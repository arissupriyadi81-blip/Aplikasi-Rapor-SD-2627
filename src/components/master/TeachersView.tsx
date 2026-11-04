/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Teacher } from '../../types/index.ts';
import { Users, Plus, Search, Edit2, Trash2, CheckCircle2, X, Phone, Shield } from 'lucide-react';

export const TeachersView: React.FC = () => {
  const { teachers, classes, subjects, addTeacher, updateTeacher, deleteTeacher, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [formData, setFormData] = useState<Omit<Teacher, 'id'>>({
    fullName: '',
    nip: '',
    nuptk: '',
    nik: '',
    gender: 'L',
    phone: '',
    position: 'Guru Kelas',
    isActive: true,
    assignedHomeroomClassId: '',
    assignedSubjectIds: [],
  });

  const canManage = currentUser.role === 'admin';

  const filteredTeachers = teachers.filter(t =>
    t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.nip && t.nip.includes(searchTerm)) ||
    (t.nuptk && t.nuptk.includes(searchTerm))
  );

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({
      fullName: '',
      nip: '',
      nuptk: '',
      nik: '',
      gender: 'L',
      phone: '',
      position: 'Guru Kelas',
      isActive: true,
      assignedHomeroomClassId: '',
      assignedSubjectIds: [],
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setFormData({
      fullName: t.fullName,
      nip: t.nip || '',
      nuptk: t.nuptk || '',
      nik: t.nik || '',
      gender: t.gender,
      phone: t.phone || '',
      position: t.position || (t.assignedHomeroomClassId ? 'Wali Kelas' : 'Guru Kelas'),
      isActive: t.isActive,
      assignedHomeroomClassId: t.assignedHomeroomClassId || '',
      assignedSubjectIds: t.assignedSubjectIds || [],
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
      updateTeacher(editingTeacher.id, formData);
    } else {
      addTeacher(formData);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Manajemen Guru & Tenaga Kependidikan
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Daftar dewan asatidz / guru SD IAS Al-Jannah, wali kelas, serta pengampu mata pelajaran.
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
          >
            <Plus className="h-4 w-4" />
            Tambah Guru Baru
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama guru, NIP, atau NUPTK..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Total: {filteredTeachers.length} Guru
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Nama Lengkap & NIP/NUPTK</th>
                <th className="py-3.5 px-4">L/P</th>
                <th className="py-3.5 px-4">Penugasan Wali Kelas</th>
                <th className="py-3.5 px-4">Mapel yang Diampu</th>
                <th className="py-3.5 px-4">Jabatan</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                {canManage && <th className="py-3.5 px-4 text-center w-24">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTeachers.map((t, index) => {
                const assignedClass = classes.find(c => c.id === t.assignedHomeroomClassId);
                const assignedSubs = subjects.filter(s => t.assignedSubjectIds?.includes(s.id));

                return (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-500 font-medium">{index + 1}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800 dark:text-white">{t.fullName}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        NIP: {t.nip || '-'} • NUPTK: {t.nuptk || '-'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                        t.gender === 'L' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300'
                      }`}>
                        {t.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {assignedClass ? (
                        <span className="rounded-lg bg-emerald-50 px-2 py-1 font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {assignedClass.className}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Bukan Wali Kelas</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {assignedSubs.length > 0 ? (
                          assignedSubs.map(s => (
                            <span key={s.id} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {s.subjectCode}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {(() => {
                        const pos = t.position || (t.assignedHomeroomClassId ? 'Wali Kelas' : 'Guru Kelas');
                        const badgeStyle = {
                          'Wali Kelas': 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
                          'Guru Kelas': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
                          'Guru Bidang': 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
                          'Guru Pendamping': 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
                        }[pos] || 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

                        return (
                          <span className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-bold border ${badgeStyle}`}>
                            {pos}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        t.isActive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {t.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    {canManage && (
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(t)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 dark:text-slate-400 dark:hover:bg-slate-800"
                            title="Edit Guru"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus data guru ${t.fullName}?`)) {
                                deleteTeacher(t.id);
                              }
                            }}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/50"
                            title="Hapus Guru"
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

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru'}
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
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Contoh: Aris Supriyadi, S.Pd., M.M."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    NIP (Jika Ada)
                  </label>
                  <input
                    type="text"
                    value={formData.nip || ''}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="18 digit atau kosongkan"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    NUPTK (Jika Ada)
                  </label>
                  <input
                    type="text"
                    value={formData.nuptk || ''}
                    onChange={(e) => setFormData({ ...formData, nuptk: e.target.value })}
                    placeholder="16 digit"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jabatan Guru *
                  </label>
                  <select
                    value={formData.position || 'Guru Kelas'}
                    onChange={(e) => {
                      const newPos = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        position: newPos,
                        // If user selects Wali Kelas but no homeroom assigned, or changes away
                        assignedHomeroomClassId: newPos === 'Wali Kelas' ? prev.assignedHomeroomClassId : prev.assignedHomeroomClassId,
                      }));
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Wali Kelas">Wali Kelas</option>
                    <option value="Guru Kelas">Guru Kelas</option>
                    <option value="Guru Bidang">Guru Bidang</option>
                    <option value="Guru Pendamping">Guru Pendamping</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0812..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Penugasan Wali Kelas (Opsional)
                </label>
                <select
                  value={formData.assignedHomeroomClassId || ''}
                  onChange={(e) => setFormData({ ...formData, assignedHomeroomClassId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">-- Bukan Wali Kelas --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.className}</option>
                  ))}
                </select>
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
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
