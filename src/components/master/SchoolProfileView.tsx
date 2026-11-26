/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { SchoolProfile } from '../../types/index.ts';
import { Building2, Save, CheckCircle2, AlertCircle, RotateCcw, Calendar, MapPin, Phone, Mail, Globe, UserCheck, Image as ImageIcon } from 'lucide-react';

export const SchoolProfileView: React.FC = () => {
  const { schoolProfile, updateSchoolProfile, currentUser } = useApp();
  const [formData, setFormData] = useState<SchoolProfile>({ ...schoolProfile });
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!isDirty) {
      setFormData({ ...schoolProfile });
    }
  }, [schoolProfile, isDirty]);

  const canEdit = currentUser.role === 'admin';

  const updateField = (patch: Partial<SchoolProfile>) => {
    setFormData(prev => ({ ...prev, ...patch }));
    setIsDirty(true);
    setIsSaved(false);
    setSaveError(null);
  };

  const handleResetEdits = () => {
    setFormData({ ...schoolProfile });
    setIsDirty(false);
    setSaveError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    const res = await updateSchoolProfile(formData);
    setIsSaving(false);
    if (res && !res.success) {
      setSaveError(res.error || 'Gagal menyimpan perubahan ke Supabase.');
      return;
    }
    setIsDirty(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Profil & Pengaturan Sekolah
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Informasi identitas satuan pendidikan yang otomatis digunakan pada sampul dan lembar rapor Kurikulum Merdeka.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isDirty && (
            <button
              type="button"
              onClick={handleResetEdits}
              className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Batalkan Perubahan
            </button>
          )}
          {saveError && (
            <div className="flex items-center gap-1.5 rounded-lg bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              {saveError}
            </div>
          )}
          {isSaved && (
            <div className="flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Data profil sekolah berhasil disimpan!
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Identitas Sekolah */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-100 pb-2 dark:border-slate-800">
              Identitas Satuan Pendidikan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Satuan Pendidikan / Sekolah *
                </label>
                <input
                  type="text"
                  required
                  disabled={!canEdit}
                  value={formData.schoolName}
                  onChange={(e) => updateField({ schoolName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  NPSN (Nomor Pokok Sekolah Nasional) *
                </label>
                <input
                  type="text"
                  required
                  disabled={!canEdit}
                  value={formData.npsn}
                  onChange={(e) => updateField({ npsn: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  NSS / NDS
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.nss}
                  onChange={(e) => updateField({ nss: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Yayasan Penyelenggara
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.foundationName}
                  onChange={(e) => updateField({ foundationName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Lengkap Sekolah *
                </label>
                <textarea
                  rows={2}
                  required
                  disabled={!canEdit}
                  value={formData.address}
                  onChange={(e) => updateField({ address: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Desa / Kelurahan
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.village}
                  onChange={(e) => updateField({ village: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kecamatan
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.district}
                  onChange={(e) => updateField({ district: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kabupaten / Kota
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.regency}
                  onChange={(e) => updateField({ regency: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Provinsi
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.province}
                  onChange={(e) => updateField({ province: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Kontak & Media */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-100 pb-2 dark:border-slate-800">
              Kontak & Media Komunikasi
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor Telepon
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    disabled={!canEdit}
                    value={formData.phone}
                    onChange={(e) => updateField({ phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Resmi
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="email"
                    disabled={!canEdit}
                    value={formData.email}
                    onChange={(e) => updateField({ email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Website Sekolah
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    disabled={!canEdit}
                    value={formData.website}
                    onChange={(e) => updateField({ website: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Logo & Kepala Sekolah & Titi Mangsa */}
        <div className="space-y-6">
          {/* Logo Resmi Satuan Pendidikan */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-100 pb-2 dark:border-slate-800 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Logo Resmi Satuan Pendidikan
            </h3>

            <div className="flex items-center gap-4">
              <div className="h-20 w-20 shrink-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-white p-2 flex items-center justify-center shadow-sm">
                <img
                  src={formData.logoUrl || '/logo-aljannah-emblem.png'}
                  alt="Logo Sekolah"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-xs font-bold text-slate-800 dark:text-white">{formData.schoolName}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Logo resmi otomatis disematkan pada sampul rapor, kop lembar dinas, dan identitas aplikasi.
                </p>
                {canEdit && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => updateField({ logoUrl: '/logo-aljannah-emblem.png' })}
                      className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 underline"
                    >
                      Logo Emblem
                    </button>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={() => updateField({ logoUrl: '/logo-aljannah.png' })}
                      className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 underline"
                    >
                      Logo Lengkap
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-100 pb-2 dark:border-slate-800">
              Penandatangan Rapor
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Kepala Sekolah *
              </label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  disabled={!canEdit}
                  value={formData.headmasterName}
                  onChange={(e) => updateField({ headmasterName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NIP Kepala Sekolah
              </label>
              <input
                type="text"
                disabled={!canEdit}
                value={formData.headmasterNip}
                onChange={(e) => updateField({ headmasterNip: e.target.value })}
                placeholder="Kosongkan jika bukan ASN / GTY"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tempat Titimangsa Rapor
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.reportPlace}
                  onChange={(e) => updateField({ reportPlace: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Pembagian Rapor Semester 1 (Ganjil) *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="date"
                  required
                  disabled={!canEdit}
                  value={formData.reportDateSem1 || formData.reportDate || '2026-12-19'}
                  onChange={(e) => updateField({ reportDateSem1: e.target.value, reportDate: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Titi mangsa penandatanganan rapor semester ganjil.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Pembagian Rapor Semester 2 (Genap) *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="date"
                  required
                  disabled={!canEdit}
                  value={formData.reportDateSem2 || '2027-06-25'}
                  onChange={(e) => updateField({ reportDateSem2: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Titi mangsa penandatanganan rapor semester genap / kenaikan kelas.</p>
            </div>

            {canEdit && (
              <button
                type="submit"
                disabled={isSaving}
                className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-60 transition-all"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
              </button>
            )}

            {!canEdit && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 italic">
                * Pengaturan profil sekolah hanya dapat diubah oleh peran Administrator.
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
