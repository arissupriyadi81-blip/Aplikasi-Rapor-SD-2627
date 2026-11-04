/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Student } from '../../types/index.ts';
import {
  GraduationCap,
  Plus,
  Search,
  Download,
  Upload,
  Edit2,
  Trash2,
  Eye,
  X,
  User,
  MapPin,
  Phone,
  FileSpreadsheet,
} from 'lucide-react';
import { StudentExcelModal } from './StudentExcelModal.tsx';

export const StudentsView: React.FC = () => {
  const { students, classes, addStudent, updateStudent, deleteStudent, importStudents, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);

  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    nis: '',
    nisn: '',
    fullName: '',
    gender: 'L',
    birthPlace: 'Jakarta',
    birthDate: '2015-01-01',
    religion: 'Islam',
    parentFather: '',
    fatherJob: '',
    fatherEducation: '',
    parentMother: '',
    motherJob: '',
    motherEducation: '',
    guardianName: '',
    guardianJob: '',
    guardianRelation: '',
    parentPhone: '',
    address: '',
    admissionYear: '2022',
    status: 'aktif',
    currentClassId: classes[4]?.id || classes[0]?.id || '',
    rollNumber: 1,
  });

  const canManage = currentUser.role === 'admin' || currentUser.role === 'wali_kelas';

  // Filter logic
  const filteredStudents = students.filter(s => {
    const matchClass = selectedClassId === 'all' || s.currentClassId === selectedClassId;
    const matchSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nis.includes(searchTerm) ||
      s.nisn.includes(searchTerm);
    return matchClass && matchSearch;
  });

  const handleOpenAdd = () => {
    setActiveStudent(null);
    setFormData({
      nis: `2223${String(students.length + 1).padStart(4, '0')}`,
      nisn: `015849${String(students.length + 1).padStart(4, '0')}`,
      fullName: '',
      gender: 'L',
      birthPlace: 'Jakarta',
      birthDate: '2015-05-10',
      religion: 'Islam',
      parentFather: '',
      fatherJob: '',
      fatherEducation: '',
      parentMother: '',
      motherJob: '',
      motherEducation: '',
      guardianName: '',
      guardianJob: '',
      guardianRelation: '',
      parentPhone: '',
      address: '',
      admissionYear: '2022',
      status: 'aktif',
      currentClassId: selectedClassId !== 'all' ? selectedClassId : (classes[4]?.id || classes[0]?.id),
      rollNumber: filteredStudents.length + 1,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (s: Student) => {
    setActiveStudent(s);
    setFormData({
      nis: s.nis,
      nisn: s.nisn,
      fullName: s.fullName,
      gender: s.gender,
      birthPlace: s.birthPlace,
      birthDate: s.birthDate,
      religion: s.religion,
      parentFather: s.parentFather || '',
      fatherJob: s.fatherJob || '',
      fatherEducation: s.fatherEducation || '',
      parentMother: s.parentMother || '',
      motherJob: s.motherJob || '',
      motherEducation: s.motherEducation || '',
      guardianName: s.guardianName || '',
      guardianJob: s.guardianJob || '',
      guardianRelation: s.guardianRelation || '',
      parentPhone: s.parentPhone || '',
      address: s.address || '',
      admissionYear: s.admissionYear,
      status: s.status,
      currentClassId: s.currentClassId,
      rollNumber: s.rollNumber || 1,
    });
    setModalOpen(true);
  };

  const handleOpenDetail = (s: Student) => {
    setActiveStudent(s);
    setDetailModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeStudent) {
      updateStudent(activeStudent.id, formData);
    } else {
      addStudent(formData);
    }
    setModalOpen(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['No', 'NIS', 'NISN', 'Nama Lengkap', 'L/P', 'Tempat Lahir', 'Tanggal Lahir', 'Kelas', 'Nama Ayah', 'Nama Ibu', 'No HP Ortu', 'Alamat'];
    const rows = filteredStudents.map((s, idx) => {
      const cls = classes.find(c => c.id === s.currentClassId)?.className || '-';
      return [
        idx + 1,
        `"${s.nis}"`,
        `"${s.nisn}"`,
        `"${s.fullName}"`,
        s.gender,
        `"${s.birthPlace}"`,
        s.birthDate,
        `"${cls}"`,
        `"${s.parentFather}"`,
        `"${s.parentMother}"`,
        `"${s.parentPhone}"`,
        `"${s.address.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Data_Siswa_SD_IAS_AlJannah_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Manajemen Data Peserta Didik
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Database biodata siswa, riwayat rombongan belajar, NISN, dan informasi wali murid.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setExcelModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 shadow-sm hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 transition-all"
            title="Upload Data Siswa & Orang Tua format Excel (.xlsx)"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Upload Excel (Siswa & Ortu)</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
            title="Ekspor Data Siswa ke CSV"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>

          {canManage && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
            >
              <Plus className="h-4 w-4" />
              Tambah Siswa
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama siswa, NIS, atau NISN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="all">Semua Rombel / Kelas</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.className}</option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Menampilkan <strong className="text-slate-800 dark:text-white">{filteredStudents.length}</strong> siswa
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Nama Lengkap Siswa</th>
                <th className="py-3.5 px-4">NIS / NISN</th>
                <th className="py-3.5 px-4">L/P</th>
                <th className="py-3.5 px-4">Kelas</th>
                <th className="py-3.5 px-4">Orang Tua / Wali</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map((s, index) => {
                const cls = classes.find(c => c.id === s.currentClassId);

                return (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-500 font-medium">{index + 1}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800 dark:text-white">{s.fullName}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Lahir: {s.birthPlace}, {s.birthDate}
                      </p>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      <div>NIS: <span className="font-semibold">{s.nis}</span></div>
                      <div>NISN: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{s.nisn}</span></div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                        s.gender === 'L' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300'
                      }`}>
                        {s.gender === 'L' ? 'L' : 'P'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {cls?.className || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      <p className="font-medium text-slate-800 dark:text-white">{s.parentFather || s.parentMother || '-'}</p>
                      <p className="text-[10px] text-slate-400">{s.parentPhone || '-'}</p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 capitalize">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenDetail(s)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800"
                          title="Lihat Detail Biodata Siswa"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {canManage && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(s)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 dark:text-slate-400 dark:hover:bg-slate-800"
                              title="Edit Data Siswa"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Yakin ingin mengarsipkan / menghapus siswa ${s.fullName}? Riwayat nilai sebelumnya tetap tersimpan.`)) {
                                  deleteStudent(s.id);
                                }
                              }}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/50"
                              title="Hapus / Arsipkan"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
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

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {activeStudent ? 'Edit Biodata Siswa' : 'Tambah Peserta Didik Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    NIS (Nomor Induk Sekolah) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    NISN (Nomor Induk Siswa Nasional) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Peserta Didik *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Nama sesuai akta kelahiran"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
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
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rombel / Kelas Aktif *
                  </label>
                  <select
                    value={formData.currentClassId}
                    onChange={(e) => setFormData({ ...formData, currentClassId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.className}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Agama
                  </label>
                  <input
                    type="text"
                    value={formData.religion}
                    onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Data Ayah */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-2">
                  Data Ayah Kandung
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="col-span-3 sm:col-span-1">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Ayah
                    </label>
                    <input
                      type="text"
                      value={formData.parentFather}
                      onChange={(e) => setFormData({ ...formData, parentFather: e.target.value })}
                      placeholder="Nama lengkap ayah"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Pekerjaan Ayah
                    </label>
                    <input
                      type="text"
                      value={formData.fatherJob || ''}
                      onChange={(e) => setFormData({ ...formData, fatherJob: e.target.value })}
                      placeholder="Contoh: PNS, Wiraswasta"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Pendidikan Terakhir
                    </label>
                    <input
                      type="text"
                      value={formData.fatherEducation || ''}
                      onChange={(e) => setFormData({ ...formData, fatherEducation: e.target.value })}
                      placeholder="Contoh: S1, S2, SMA"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Data Ibu */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                <span className="text-[11px] font-bold text-pink-700 dark:text-pink-400 uppercase tracking-wider block mb-2">
                  Data Ibu Kandung
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="col-span-3 sm:col-span-1">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Ibu
                    </label>
                    <input
                      type="text"
                      value={formData.parentMother}
                      onChange={(e) => setFormData({ ...formData, parentMother: e.target.value })}
                      placeholder="Nama lengkap ibu"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Pekerjaan Ibu
                    </label>
                    <input
                      type="text"
                      value={formData.motherJob || ''}
                      onChange={(e) => setFormData({ ...formData, motherJob: e.target.value })}
                      placeholder="Contoh: Dokter, Guru, IRT"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Pendidikan Terakhir
                    </label>
                    <input
                      type="text"
                      value={formData.motherEducation || ''}
                      onChange={(e) => setFormData({ ...formData, motherEducation: e.target.value })}
                      placeholder="Contoh: S1, D3, SMA"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Data Wali (Opsional) */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Data Wali Siswa (Opsional)
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Wali
                    </label>
                    <input
                      type="text"
                      value={formData.guardianName || ''}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      placeholder="Nama wali siswa"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Pekerjaan Wali
                    </label>
                    <input
                      type="text"
                      value={formData.guardianJob || ''}
                      onChange={(e) => setFormData({ ...formData, guardianJob: e.target.value })}
                      placeholder="Pekerjaan wali"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Hubungan Keluarga
                    </label>
                    <input
                      type="text"
                      value={formData.guardianRelation || ''}
                      onChange={(e) => setFormData({ ...formData, guardianRelation: e.target.value })}
                      placeholder="Contoh: Paman, Kakek"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor HP Orang Tua / WhatsApp *
                </label>
                <input
                  type="text"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  placeholder="0812..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Tempat Tinggal
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Alamat lengkap domisili siswa"
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
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModalOpen && activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-600" />
                Biodata Lengkap Siswa
              </h3>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-xl bg-emerald-50 p-3.5 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
                <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  {activeStudent.fullName}
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                  NIS: {activeStudent.nis} • NISN: {activeStudent.nisn}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40">
                  <span className="text-[10px] text-slate-400 uppercase">Jenis Kelamin</span>
                  <p className="font-semibold text-slate-800 dark:text-white mt-0.5">
                    {activeStudent.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40">
                  <span className="text-[10px] text-slate-400 uppercase">Tempat, Tgl Lahir</span>
                  <p className="font-semibold text-slate-800 dark:text-white mt-0.5">
                    {activeStudent.birthPlace}, {activeStudent.birthDate}
                  </p>
                </div>
              </div>

              {/* Detail Orang Tua */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Ayah Kandung</span>
                  <p className="font-semibold text-slate-800 dark:text-white mt-1">
                    {activeStudent.parentFather || '-'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pekerjaan: {activeStudent.fatherJob || '-'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Pendidikan: {activeStudent.fatherEducation || '-'}
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40">
                  <span className="text-[10px] font-bold text-pink-700 dark:text-pink-400 uppercase">Ibu Kandung</span>
                  <p className="font-semibold text-slate-800 dark:text-white mt-1">
                    {activeStudent.parentMother || '-'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pekerjaan: {activeStudent.motherJob || '-'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Pendidikan: {activeStudent.motherEducation || '-'}
                  </p>
                </div>
              </div>

              {activeStudent.guardianName && (
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40">
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Wali Siswa</span>
                  <p className="font-semibold text-slate-800 dark:text-white mt-1">
                    {activeStudent.guardianName} ({activeStudent.guardianRelation || 'Wali'})
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pekerjaan: {activeStudent.guardianJob || '-'}
                  </p>
                </div>
              )}

              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase">Kontak & Alamat</span>
                <p className="text-slate-700 dark:text-slate-300">
                  WhatsApp: <strong>{activeStudent.parentPhone || '-'}</strong>
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  Alamat: {activeStudent.address}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40">
                <span className="text-[10px] text-slate-400 uppercase">Alamat Rumah</span>
                <p className="text-slate-700 dark:text-slate-300 mt-1">
                  {activeStudent.address}
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Import Excel Siswa & Ortu */}
      <StudentExcelModal
        isOpen={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        defaultClassId={selectedClassId}
      />
    </div>
  );
};
