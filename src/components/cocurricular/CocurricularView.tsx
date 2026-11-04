/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { CocurricularRubric, KokurikulerGrade } from '../../types/index.ts';
import {
  KOKURIKULER_DIMENSIONS,
  KOKURIKULER_GRADES,
  generateCocurricularTeacherNote,
} from '../../utils/rules.ts';
import {
  Sparkles,
  Layers,
  ClipboardCheck,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  BookOpen,
  Info,
  X,
  Target,
  Activity,
  FileText,
  UserCheck,
  Zap,
} from 'lucide-react';

export const CocurricularView: React.FC = () => {
  const {
    cocurricularActivities,
    cocurricularRubrics,
    cocurricularAssessments,
    classes,
    students,
    subjects,
    activeSemester,
    saveCocurricularAssessment,
    addCocurricularRubric,
    updateCocurricularRubric,
    deleteCocurricularRubric,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'rubrik' | 'asesmen'>('asesmen');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[4]?.id || classes[0]?.id || '');
  const [selectedRubricId, setSelectedRubricId] = useState<string>(cocurricularRubrics[0]?.id || '');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Rubric Modal state
  const [rubricModalOpen, setRubricModalOpen] = useState(false);
  const [editingRubric, setEditingRubric] = useState<CocurricularRubric | null>(null);
  const [rubricFormData, setRubricFormData] = useState<Omit<CocurricularRubric, 'id'>>({
    activityId: cocurricularActivities[0]?.id || 'p5-1',
    dimension: 'Penalaran Kritis',
    theme: 'Gaya Hidup Berkelanjutan',
    objective: 'Mampu menganalisis limbah organik di lingkungan sekolah dan merancang solusi daur ulang kompos.',
    activityForm: 'Projek Lapangan: Pembuatan Kompos Organik',
    relatedSubjects: ['IPAS', 'Pendidikan Pancasila'],
    indicator: 'Menganalisis dan menyusun solusi masalah limbah secara mandiri dan kritis.',
  });

  const canManage = currentUser.role === 'admin' || currentUser.role === 'wali_kelas' || currentUser.role === 'guru_mapel';

  const currentClass = classes.find(c => c.id === selectedClassId);
  const classStudents = students.filter(s => s.currentClassId === selectedClassId && s.status === 'aktif');
  const activeRubric = cocurricularRubrics.find(r => r.id === selectedRubricId) || cocurricularRubrics[0];

  const handleOpenAddRubric = () => {
    setEditingRubric(null);
    setRubricFormData({
      activityId: cocurricularActivities[0]?.id || 'act-1',
      dimension: 'Keimanan dan Ketakwaan Terhadap Tuhan',
      theme: 'Kearifan Lokal & Kepedulian Lingkungan',
      objective: 'Membiasakan rasa syukur atas ciptaan Tuhan melalui pelestarian flora sekolah.',
      activityForm: 'Observasi Kebun Botani & Pembibitan Tanaman Obat',
      relatedSubjects: ['Pendidikan Agama Islam', 'IPAS'],
      indicator: 'Menunjukkan sikap peduli lingkungan sebagai wujud rasa syukur.',
    });
    setRubricModalOpen(true);
  };

  const handleOpenEditRubric = (rubric: CocurricularRubric) => {
    setEditingRubric(rubric);
    setRubricFormData({
      activityId: rubric.activityId,
      dimension: rubric.dimension,
      theme: rubric.theme,
      objective: rubric.objective,
      activityForm: rubric.activityForm,
      relatedSubjects: rubric.relatedSubjects,
      indicator: rubric.indicator,
    });
    setRubricModalOpen(true);
  };

  const handleSubmitRubric = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRubric) {
      updateCocurricularRubric(editingRubric.id, rubricFormData);
      showToast('Rubrik kokurikuler berhasil diperbarui');
    } else {
      addCocurricularRubric(rubricFormData);
      showToast('Rubrik kokurikuler baru berhasil ditambahkan');
    }
    setRubricModalOpen(false);
  };

  const showToast = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  const handleGradeSelect = (studentId: string, studentName: string, grade: KokurikulerGrade) => {
    if (!activeRubric) return;

    // Otomatis membuat catatan guru berdasarkan dimensi, tema, aktivitas dan nilai capaian
    const autoNote = generateCocurricularTeacherNote(
      studentName,
      activeRubric.dimension,
      activeRubric.theme,
      activeRubric.activityForm,
      grade
    );

    saveCocurricularAssessment({
      activityId: activeRubric.activityId,
      rubricId: activeRubric.id,
      studentId,
      semesterId: activeSemester.id,
      grade,
      teacherNote: autoNote,
    });

    showToast(`Nilai ${grade} dan catatan otomatis tersimpan untuk ${studentName}`);
  };

  const handleCustomNoteChange = (studentId: string, currentGrade: KokurikulerGrade, note: string) => {
    if (!activeRubric) return;

    saveCocurricularAssessment({
      activityId: activeRubric.activityId,
      rubricId: activeRubric.id,
      studentId,
      semesterId: activeSemester.id,
      grade: currentGrade,
      teacherNote: note,
    });
  };

  const handleBulkSetGrade = (targetGrade: KokurikulerGrade) => {
    if (!activeRubric) return;
    if (!confirm(`Terapkan nilai "${targetGrade}" (${KOKURIKULER_GRADES[targetGrade].label}) beserta catatan guru otomatis untuk seluruh siswa di kelas ${currentClass?.className}?`)) {
      return;
    }

    classStudents.forEach(student => {
      const autoNote = generateCocurricularTeacherNote(
        student.fullName,
        activeRubric.dimension,
        activeRubric.theme,
        activeRubric.activityForm,
        targetGrade
      );
      saveCocurricularAssessment({
        activityId: activeRubric.activityId,
        rubricId: activeRubric.id,
        studentId: student.id,
        semesterId: activeSemester.id,
        grade: targetGrade,
        teacherNote: autoNote,
      });
    });

    showToast(`Berhasil menerapkan nilai ${targetGrade} untuk semua siswa di kelas ${currentClass?.className}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Kokurikuler (Rubrik dan Asesmen)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pelaksanaan kegiatan kokurikuler Kurikulum Merdeka berorientasi 8 Fokus Dimensi Profil Lulusan dengan penilaian SB, B, C, K dan catatan guru otomatis.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('asesmen')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'asesmen'
                ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <ClipboardCheck className="h-4 w-4" />
            Asesmen Kokurikuler
          </button>
          <button
            onClick={() => setActiveTab('rubrik')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'rubrik'
                ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Layers className="h-4 w-4" />
            Rubrik Kokurikuler ({cocurricularRubrics.length})
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-900 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-200 transition-all">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          {saveSuccessMsg}
        </div>
      )}

      {/* ======================= TAB 1: RUBRIK KOKURIKULER ======================= */}
      {activeTab === 'rubrik' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-600" />
                Daftar Rubrik Kokurikuler & 8 Fokus Dimensi Profil Lulusan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Setiap rubrik memuat fokus dimensi, tema, tujuan pembelajaran, bentuk aktivitas, dan keterkaitan mata pelajaran.
              </p>
            </div>

            {canManage && (
              <button
                onClick={handleOpenAddRubric}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" />
                Tambah Rubrik Baru
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cocurricularRubrics.map((rubric) => (
              <div
                key={rubric.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700/60 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {rubric.dimension}
                  </span>
                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditRubric(rubric)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800"
                        title="Edit Rubrik"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus rubrik dimensi "${rubric.dimension}"? Nilai asesmen terkait juga akan dihapus.`)) {
                            deleteCocurricularRubric(rubric.id);
                            showToast('Rubrik berhasil dihapus');
                          }
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                        title="Hapus Rubrik"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tema Kegiatan</span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                    {rubric.theme}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tujuan</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">
                    {rubric.objective}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Bentuk Aktivitas</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {rubric.activityForm}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Mata Pelajaran Terkait</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(rubric.relatedSubjects || ['IPAS', 'Pendidikan Pancasila']).map((subj, idx) => (
                        <span
                          key={idx}
                          className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                        >
                          {subj}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================= TAB 2: ASESMEN KOKURIKULER ======================= */}
      {activeTab === 'asesmen' && (
        <div className="space-y-6">
          {/* Controls: Class & Rubric Filter */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih Kelas:</span>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.className}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih Rubrik:</span>
                <select
                  value={selectedRubricId}
                  onChange={(e) => setSelectedRubricId(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white max-w-xs md:max-w-md truncate"
                >
                  {cocurricularRubrics.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.dimension} — {r.theme}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Bulk Assign */}
            {canManage && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  Isi Cepat Sekelas:
                </span>
                {(['SB', 'B', 'C', 'K'] as KokurikulerGrade[]).map((grade) => (
                  <button
                    key={grade}
                    onClick={() => handleBulkSetGrade(grade)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-emerald-950"
                    title={`Isi semua ${grade}`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active Rubric Info Banner */}
          {activeRubric && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/25 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">
                    Fokus Dimensi
                  </span>
                  <span className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                    {activeRubric.dimension}
                  </span>
                </div>
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  Tema: {activeRubric.theme}
                </span>
              </div>

              <p className="text-xs text-emerald-900/80 dark:text-emerald-300/90 leading-relaxed">
                <strong>Tujuan:</strong> {activeRubric.objective}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-emerald-800/90 dark:text-emerald-400">
                <span><strong>Bentuk Aktivitas:</strong> {activeRubric.activityForm || '-'}</span>
                <span>•</span>
                <span><strong>Mapel Terkait:</strong> {(activeRubric.relatedSubjects || ['IPAS', 'Pendidikan Pancasila']).join(', ')}</span>
              </div>
            </div>
          )}

          {/* Scale Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            {(['SB', 'B', 'C', 'K'] as KokurikulerGrade[]).map((g) => {
              const info = KOKURIKULER_GRADES[g];
              return (
                <div key={g} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold border ${info.badgeClass}`}>
                      {g}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{info.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-snug">
                    {info.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Assessment Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                    <th className="py-3 px-3 w-10 text-center">No</th>
                    <th className="py-3 px-4 w-44">Nama Peserta Didik</th>
                    <th className="py-3 px-4 w-52 text-center">Predikat Nilai Kokurikuler</th>
                    <th className="py-3 px-4 min-w-[280px]">Catatan Guru (Otomatis & Real-Time)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {classStudents.map((student, idx) => {
                    const currentAssess = cocurricularAssessments.find(
                      a =>
                        a.rubricId === activeRubric?.id &&
                        a.studentId === student.id &&
                        a.semesterId === activeSemester.id
                    );
                    const currentGrade = currentAssess?.grade || 'B';
                    const currentNote = currentAssess?.teacherNote || (activeRubric ? generateCocurricularTeacherNote(
                      student.fullName,
                      activeRubric.dimension,
                      activeRubric.theme,
                      activeRubric.activityForm,
                      currentGrade
                    ) : '');

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 text-center text-slate-400 font-semibold">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          <p>{student.fullName}</p>
                          <p className="text-[10px] font-normal text-slate-400">NIS: {student.nis}</p>
                        </td>

                        {/* Interactive SB, B, C, K selection */}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {(['SB', 'B', 'C', 'K'] as KokurikulerGrade[]).map((grade) => {
                              const isSelected = currentGrade === grade;
                              return (
                                <button
                                  key={grade}
                                  onClick={() => handleGradeSelect(student.id, student.fullName, grade)}
                                  className={`rounded-lg px-2.5 py-1.5 text-xs font-black transition-all ${
                                    isSelected
                                      ? grade === 'SB'
                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-600/50'
                                        : grade === 'B'
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-600/50'
                                        : grade === 'C'
                                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-500/50'
                                        : 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-600/50'
                                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                  }`}
                                  title={`${grade} - ${KOKURIKULER_GRADES[grade].label}`}
                                >
                                  {grade}
                                </button>
                              );
                            })}
                          </div>
                        </td>

                        {/* Auto Generated Teacher Note (Editable) */}
                        <td className="py-3 px-4">
                          <textarea
                            rows={2}
                            value={currentNote}
                            onChange={(e) => handleCustomNoteChange(student.id, currentGrade, e.target.value)}
                            placeholder="Catatan guru untuk perkembangan dimensi kokurikuler..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-normal text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 leading-relaxed"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL TAMBAH/EDIT RUBRIK ======================= */}
      {rubricModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-emerald-600" />
                {editingRubric ? 'Edit Rubrik Kokurikuler' : 'Tambah Rubrik Kokurikuler'}
              </h3>
              <button
                onClick={() => setRubricModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRubric} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  8 Fokus Dimensi Profil Lulusan *
                </label>
                <select
                  value={rubricFormData.dimension}
                  onChange={(e) => setRubricFormData({ ...rubricFormData, dimension: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-emerald-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-300"
                >
                  {KOKURIKULER_DIMENSIONS.map((dim) => (
                    <option key={dim} value={dim}>{dim}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tema Kegiatan Kokurikuler *
                </label>
                <input
                  type="text"
                  required
                  value={rubricFormData.theme}
                  onChange={(e) => setRubricFormData({ ...rubricFormData, theme: e.target.value })}
                  placeholder="Contoh: Gaya Hidup Berkelanjutan, Kearifan Lokal, Kewirausahaan"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tujuan Pembelajaran / Capaian Dimensi *
                </label>
                <textarea
                  rows={2}
                  required
                  value={rubricFormData.objective}
                  onChange={(e) => setRubricFormData({ ...rubricFormData, objective: e.target.value })}
                  placeholder="Deskripsi tujuan yang ingin dicapai siswa dalam dimensi ini..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bentuk Aktivitas *
                </label>
                <input
                  type="text"
                  required
                  value={rubricFormData.activityForm}
                  onChange={(e) => setRubricFormData({ ...rubricFormData, activityForm: e.target.value })}
                  placeholder="Contoh: Projek Lapangan: Pembuatan Kompos Organik"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mata Pelajaran Terkait (Pisahkan dengan koma) *
                </label>
                <input
                  type="text"
                  required
                  value={(rubricFormData.relatedSubjects || []).join(', ')}
                  onChange={(e) => setRubricFormData({
                    ...rubricFormData,
                    relatedSubjects: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                  })}
                  placeholder="Contoh: IPAS, Pendidikan Pancasila, Seni Rupa"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setRubricModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700"
                >
                  Simpan Rubrik
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
