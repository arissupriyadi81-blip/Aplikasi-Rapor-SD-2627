/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Extracurricular, ExtracurricularCategory } from '../../types/index.ts';
import {
  Award,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  UserCheck,
  CheckCircle2,
  Users,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const ExtracurricularMasterView: React.FC = () => {
  const {
    extracurriculars,
    extracurricularMembers,
    teachers,
    addExtracurricular,
    updateExtracurricular,
    deleteExtracurricular,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | ExtracurricularCategory>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeEkskul, setActiveEkskul] = useState<Extracurricular | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    category: ExtracurricularCategory;
    coachName: string;
    isActive: boolean;
  }>({
    name: '',
    category: 'pilihan',
    coachName: '',
    isActive: true,
  });

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredEkskuls = extracurriculars.filter(e => {
    const matchCat = filterCategory === 'all' || e.category === filterCategory;
    const matchSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.coachName && e.coachName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCat && matchSearch;
  });

  const totalWajib = extracurriculars.filter(e => e.category === 'wajib').length;
  const totalPilihan = extracurriculars.filter(e => e.category === 'pilihan').length;

  const handleOpenAdd = () => {
    setActiveEkskul(null);
    setFormData({
      name: '',
      category: 'pilihan',
      coachName: '',
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (ekskul: Extracurricular) => {
    setActiveEkskul(ekskul);
    setFormData({
      name: ekskul.name,
      category: ekskul.category || 'pilihan',
      coachName: ekskul.coachName || '',
      isActive: ekskul.isActive ?? true,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (activeEkskul) {
      updateExtracurricular(activeEkskul.id, {
        name: formData.name.trim(),
        category: formData.category,
        coachName: formData.coachName.trim() || 'Pembimbing Sekolah',
        isActive: formData.isActive,
      });
      showNotification(`Ekstrakurikuler "${formData.name}" berhasil diperbarui.`);
    } else {
      addExtracurricular({
        name: formData.name.trim(),
        category: formData.category,
        coachName: formData.coachName.trim() || 'Pembimbing Sekolah',
        isActive: formData.isActive,
      });
      showNotification(`Ekstrakurikuler baru "${formData.name}" berhasil ditambahkan.`);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus ekstrakurikuler "${name}"? Data penilaian terkait juga akan dibersihkan.`)) {
      deleteExtracurricular(id);
      showNotification(`Ekstrakurikuler "${name}" telah dihapus.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Master Data Ekstrakurikuler
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pengelolaan daftar ekstrakurikuler resmi SD IAS Al-Jannah: nama kegiatan, kategori (wajib/pilihan), dan pembimbing.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
        >
          <Plus className="h-4 w-4" />
          Tambah Ekskul
        </button>
      </div>

      {notification && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-900 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          {notification}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center gap-3">
          <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Ekskul</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">{extracurriculars.length} Kegiatan</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center gap-3">
          <div className="rounded-xl bg-teal-100 p-2.5 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ekskul Wajib</p>
            <p className="text-xl font-extrabold text-teal-700 dark:text-teal-300">{totalWajib} Kegiatan</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center gap-3">
          <div className="rounded-xl bg-sky-100 p-2.5 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ekskul Pilihan</p>
            <p className="text-xl font-extrabold text-sky-700 dark:text-sky-300">{totalPilihan} Kegiatan</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama ekstrakurikuler atau pembimbing..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="all">Semua Kategori</option>
            <option value="wajib">Wajib</option>
            <option value="pilihan">Pilihan</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Menampilkan <strong className="text-slate-800 dark:text-white">{filteredEkskuls.length}</strong> kegiatan ekskul
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-4 min-w-[200px]">Nama Ekstrakurikuler</th>
                <th className="py-3 px-4 w-32 text-center">Kategori</th>
                <th className="py-3 px-4 min-w-[180px]">Nama Pembimbing</th>
                <th className="py-3 px-3 w-28 text-center">Siswa Aktif</th>
                <th className="py-3 px-3 w-24 text-center">Status</th>
                <th className="py-3 px-3 w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEkskuls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada kegiatan ekstrakurikuler yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredEkskuls.map((ekskul, idx) => {
                  const studentCount = extracurricularMembers.filter(m => m.extracurricularId === ekskul.id).length;
                  const isWajib = ekskul.category === 'wajib';

                  return (
                    <tr key={ekskul.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-xs">{ekskul.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            isWajib
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                              : 'bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800'
                          }`}
                        >
                          {isWajib ? 'Wajib' : 'Pilihan'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{ekskul.coachName || 'Pembimbing Belum Diatur'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-700 dark:text-slate-300">
                          <Users className="h-3 w-3 text-slate-400" />
                          {studentCount} Siswa
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block rounded px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          Aktif
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(ekskul)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800"
                            title="Edit Ekskul"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(ekskul.id, ekskul.name)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-800"
                            title="Hapus Ekskul"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-600" />
                {activeEkskul ? 'Edit Ekstrakurikuler' : 'Tambah Ekstrakurikuler Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Ekstrakurikuler *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Praja Muda Karana (Pramuka)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kategori Ekstrakurikuler *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ExtracurricularCategory })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="wajib">Wajib (Diikuti seluruh siswa tingkat tertentu)</option>
                  <option value="pilihan">Pilihan (Berdasarkan bakat dan minat siswa)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Pilih "Wajib" untuk kegiatan seperti Pramuka, atau "Pilihan" untuk klub minat bakat.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Pembimbing (Guru / Pelatih) *
                </label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ahmad Fauzi, S.Pd. atau Pelatih Profesional"
                    value={formData.coachName}
                    onChange={(e) => setFormData({ ...formData, coachName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                {teachers.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1 text-[10px]">
                    <span className="text-slate-400">Pilihan cepat guru:</span>
                    {teachers.slice(0, 3).map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, coachName: t.fullName })}
                        className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {t.fullName}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isActive" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Ekstrakurikuler Aktif Beroperasi pada Semester Ini
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                >
                  {activeEkskul ? 'Simpan Perubahan' : 'Tambah Ekskul'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
