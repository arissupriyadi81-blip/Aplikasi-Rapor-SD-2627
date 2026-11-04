/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { calculateKurikulumMerdekaGrade, TPItem } from '../../utils/rules.ts';
import { StudentAssessment } from '../../types/index.ts';
import {
  ClipboardPen,
  Save,
  CheckCircle2,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  Filter,
  Check,
  FileSpreadsheet,
} from 'lucide-react';
import { AssessmentExcelModal } from './AssessmentExcelModal.tsx';

export const AssessmentInputView: React.FC = () => {
  const {
    classes,
    subjects,
    students,
    cps,
    tps,
    assessments,
    activeAcademicYear,
    activeSemester,
    bulkSaveAssessments,
    currentUser,
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[4]?.id || classes[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[4]?.id || subjects[0]?.id || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [excelModalOpen, setExcelModalOpen] = useState(false);

  // Current class and subject
  const currentClass = classes.find(c => c.id === selectedClassId);
  const currentSubject = subjects.find(s => s.id === selectedSubjectId);

  // Students in class
  const classStudents = students.filter(s => s.currentClassId === selectedClassId && s.status === 'aktif');

  // Relevant TPs for this phase & subject
  const currentCPs = cps.filter(c => c.phase === currentClass?.phase && c.subjectId === selectedSubjectId);
  const cpIds = currentCPs.map(c => c.id);
  const currentTPs = tps.filter(t => cpIds.includes(t.cpId) && t.semester === activeSemester.semesterNumber);

  // Local table state for editing
  interface RowState {
    studentId: string;
    studentName: string;
    formatif: Record<string, string>; // tpId -> string value
    sumatifMateri: Record<string, string>; // sm-1, sm-2 -> string
    sumatifAkhir: string;
    finalScore: number | null;
    achievementDesc: string;
  }

  const [tableRows, setTableRows] = useState<RowState[]>([]);

  // Synchronize local table state from assessments store when class/subject changes
  useEffect(() => {
    const rows: RowState[] = classStudents.map(student => {
      const existing = assessments.find(
        a =>
          a.classId === selectedClassId &&
          a.subjectId === selectedSubjectId &&
          a.studentId === student.id &&
          a.semesterId === activeSemester.id
      );

      const formatifMap: Record<string, string> = {};
      currentTPs.forEach(tp => {
        const val = existing?.formatifScores?.[tp.id];
        formatifMap[tp.id] = val !== undefined && val !== null ? String(val) : '';
      });

      const sumatifMateriMap: Record<string, string> = {
        'lm-1': existing?.sumatifMateriScores?.['lm-1'] !== undefined && existing?.sumatifMateriScores?.['lm-1'] !== null ? String(existing.sumatifMateriScores['lm-1']) : '',
        'lm-2': existing?.sumatifMateriScores?.['lm-2'] !== undefined && existing?.sumatifMateriScores?.['lm-2'] !== null ? String(existing.sumatifMateriScores['lm-2']) : '',
      };

      const sumatifAkhir = existing?.sumatifAkhir !== undefined && existing?.sumatifAkhir !== null ? String(existing.sumatifAkhir) : '';

      return {
        studentId: student.id,
        studentName: student.fullName,
        formatif: formatifMap,
        sumatifMateri: sumatifMateriMap,
        sumatifAkhir,
        finalScore: existing?.finalScore ?? null,
        achievementDesc: existing?.achievementDesc || '',
      };
    });

    setTableRows(rows);
  }, [selectedClassId, selectedSubjectId, activeSemester.id, currentTPs.length]);

  // Handle cell edits and recalculate live
  const handleScoreChange = (
    studentIndex: number,
    type: 'formatif' | 'sumatifMateri' | 'sumatifAkhir',
    key: string,
    value: string
  ) => {
    const updated = [...tableRows];
    const row = { ...updated[studentIndex] };

    // Sanitization: numbers only, 0-100
    if (value !== '') {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 0 || num > 100) return;
    }

    if (type === 'formatif') {
      row.formatif = { ...row.formatif, [key]: value };
    } else if (type === 'sumatifMateri') {
      row.sumatifMateri = { ...row.sumatifMateri, [key]: value };
    } else {
      row.sumatifAkhir = value;
    }

    // Convert row to calculator input
    const parsedFormatif: Record<string, number | null> = {};
    Object.entries(row.formatif).forEach(([k, v]) => {
      parsedFormatif[k] = v === '' ? null : Number(v);
    });

    const parsedSumatifMateri: Record<string, number | null> = {};
    Object.entries(row.sumatifMateri).forEach(([k, v]) => {
      parsedSumatifMateri[k] = v === '' ? null : Number(v);
    });

    const parsedSumatifAkhir = row.sumatifAkhir === '' ? null : Number(row.sumatifAkhir);

    // Calculate Kurikulum Merdeka Grade
    const tpList: TPItem[] = currentTPs.map(t => ({
      id: t.id,
      code: t.tpCode,
      description: t.tpDescription,
      order: t.tpOrder,
    }));

    const result = calculateKurikulumMerdekaGrade(
      {
        studentId: row.studentId,
        formatifScores: parsedFormatif,
        sumatifMateriScores: parsedSumatifMateri,
        sumatifAkhirSemester: parsedSumatifAkhir,
      },
      tpList
    );

    row.finalScore = result.finalScore;
    row.achievementDesc = result.achievementDescription;

    updated[studentIndex] = row;
    setTableRows(updated);
  };

  // Quick auto-populate sample scores for demonstration testing
  const handleAutoFillDemo = () => {
    const updated = tableRows.map((row, idx) => {
      const baseScore = 80 + (idx % 15);
      const formatifMap: Record<string, string> = {};
      currentTPs.forEach((tp, i) => {
        formatifMap[tp.id] = String(Math.min(98, baseScore + (i % 5)));
      });

      const sumatifMateriMap = {
        'lm-1': String(baseScore),
        'lm-2': String(baseScore + 2),
      };
      const sumatifAkhir = String(baseScore - 1);

      // Recalculate
      const parsedFormatif: Record<string, number | null> = {};
      Object.entries(formatifMap).forEach(([k, v]) => {
        parsedFormatif[k] = Number(v);
      });

      const parsedSumatifMateri = {
        'lm-1': Number(sumatifMateriMap['lm-1']),
        'lm-2': Number(sumatifMateriMap['lm-2']),
      };

      const result = calculateKurikulumMerdekaGrade(
        {
          studentId: row.studentId,
          formatifScores: parsedFormatif,
          sumatifMateriScores: parsedSumatifMateri,
          sumatifAkhirSemester: Number(sumatifAkhir),
        },
        currentTPs.map(t => ({ id: t.id, code: t.tpCode, description: t.tpDescription, order: t.tpOrder }))
      );

      return {
        ...row,
        formatif: formatifMap,
        sumatifMateri: sumatifMateriMap,
        sumatifAkhir,
        finalScore: result.finalScore,
        achievementDesc: result.achievementDescription,
      };
    });

    setTableRows(updated);
  };

  // Save all row states to central context
  const handleSaveAll = () => {
    const newAssessments: StudentAssessment[] = tableRows.map(row => {
      const parsedFormatif: Record<string, number | null> = {};
      Object.entries(row.formatif).forEach(([k, v]) => {
        parsedFormatif[k] = v === '' ? null : Number(v);
      });

      const parsedSumatifMateri: Record<string, number | null> = {};
      Object.entries(row.sumatifMateri).forEach(([k, v]) => {
        parsedSumatifMateri[k] = v === '' ? null : Number(v);
      });

      const parsedSumatifAkhir = row.sumatifAkhir === '' ? null : Number(row.sumatifAkhir);

      return {
        id: `as-${selectedClassId}-${selectedSubjectId}-${row.studentId}`,
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        studentId: row.studentId,
        academicYearId: activeAcademicYear.id,
        semesterId: activeSemester.id,
        formatifScores: parsedFormatif,
        sumatifMateriScores: parsedSumatifMateri,
        sumatifAkhir: parsedSumatifAkhir,
        formatifAvg: row.finalScore !== null ? Math.round(row.finalScore * 0.98) : null,
        sumatifMateriAvg: row.finalScore !== null ? Math.round(row.finalScore * 1.01) : null,
        finalScore: row.finalScore,
        highestTpIds: currentTPs.slice(0, 2).map(t => t.id),
        lowestTpIds: [],
        achievementDesc: row.achievementDesc,
        status: 'approved',
        updatedAt: new Date().toISOString(),
      };
    });

    bulkSaveAssessments(newAssessments);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleApplyExcelScores = (imported: {
    studentId: string;
    studentName: string;
    formatif: Record<string, string>;
    sumatifMateri: Record<string, string>;
    sumatifAkhir: string;
    finalScore: number | null;
    achievementDesc: string;
  }[]) => {
    // 1. Update in-memory table rows
    setTableRows(prev => {
      return prev.map(row => {
        const match = imported.find(imp => imp.studentId === row.studentId);
        if (match) {
          return {
            ...row,
            formatif: { ...row.formatif, ...match.formatif },
            sumatifMateri: { ...row.sumatifMateri, ...match.sumatifMateri },
            sumatifAkhir: match.sumatifAkhir,
            finalScore: match.finalScore,
            achievementDesc: match.achievementDesc,
          };
        }
        return row;
      });
    });

    // 2. Persist directly to central assessment store
    const newAssessments: StudentAssessment[] = imported.map(item => {
      const parsedFormatif: Record<string, number | null> = {};
      Object.entries(item.formatif).forEach(([k, v]) => {
        parsedFormatif[k] = v === '' ? null : Number(v);
      });

      const parsedSumatifMateri: Record<string, number | null> = {};
      Object.entries(item.sumatifMateri).forEach(([k, v]) => {
        parsedSumatifMateri[k] = v === '' ? null : Number(v);
      });

      const parsedSumatifAkhir = item.sumatifAkhir === '' ? null : Number(item.sumatifAkhir);

      return {
        id: `as-${selectedClassId}-${selectedSubjectId}-${item.studentId}`,
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        studentId: item.studentId,
        academicYearId: activeAcademicYear.id,
        semesterId: activeSemester.id,
        formatifScores: parsedFormatif,
        sumatifMateriScores: parsedSumatifMateri,
        sumatifAkhir: parsedSumatifAkhir,
        formatifAvg: item.finalScore !== null ? Math.round(item.finalScore * 0.98) : null,
        sumatifMateriAvg: item.finalScore !== null ? Math.round(item.finalScore * 1.01) : null,
        finalScore: item.finalScore,
        highestTpIds: [],
        lowestTpIds: [],
        achievementDesc: item.achievementDesc,
        status: 'approved',
        updatedAt: new Date().toISOString(),
      };
    });

    bulkSaveAssessments(newAssessments);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardPen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Input & Pengolahan Nilai Kurikulum Merdeka
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Asesmen Formatif per TP, Sumatif Lingkup Materi, dan kalkulasi otomatis deskripsi capaian pembelajaran.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setExcelModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 shadow-sm hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 transition-all"
            title="Upload atau Download Template Nilai Siswa via Excel (.xlsx)"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Import Nilai Excel</span>
          </button>

          <button
            onClick={handleAutoFillDemo}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            title="Isi cepat nilai simulasi untuk keperluan demonstrasi"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Isi Otomatis Simulasi</span>
          </button>

          <button
            onClick={handleSaveAll}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
          >
            <Save className="h-4 w-4" />
            Simpan Nilai Kelas
          </button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih Kelas:</span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.className}</option>
            ))}
          </select>
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Mata Pelajaran:</span>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.subjectCode} - {s.subjectName}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto text-xs text-slate-500 dark:text-slate-400 font-medium">
          Rombel: <strong className="text-slate-800 dark:text-white">{currentClass?.className}</strong> •{' '}
          Fase {currentClass?.phase} • {classStudents.length} Siswa
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-100 p-3 text-xs font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Nilai kelas {currentClass?.className} untuk mata pelajaran {currentSubject?.subjectName} berhasil disimpan ke database!
        </div>
      )}

      {/* TPs Reference Info Box */}
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/20 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-200 mb-1">
          <Info className="h-4 w-4 text-emerald-600" />
          Tujuan Pembelajaran (TP) yang Dinilai pada Semester Ini:
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
          {currentTPs.map(tp => (
            <div key={tp.id} className="rounded-lg bg-white p-2 border border-emerald-200/60 dark:bg-slate-800/80 dark:border-slate-700">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">{tp.tpCode}:</span>{' '}
              <span className="text-slate-700 dark:text-slate-300 text-[11px]">{tp.tpDescription}</span>
            </div>
          ))}
          {currentTPs.length === 0 && (
            <p className="text-amber-700 dark:text-amber-400 italic">
              Belum ada TP terdaftar untuk mata pelajaran ini di Fase {currentClass?.phase}. Silakan buka menu CP/TP untuk menambahkan.
            </p>
          )}
        </div>
      </div>

      {/* Main Grade Input Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/80 font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200">
                <th rowSpan={2} className="py-3 px-3 w-10 text-center border-r border-slate-200 dark:border-slate-800">No</th>
                <th rowSpan={2} className="py-3 px-4 min-w-[180px] border-r border-slate-200 dark:border-slate-800">Nama Siswa</th>
                
                {/* Formatif Columns */}
                <th colSpan={Math.max(1, currentTPs.length)} className="py-2 px-3 text-center bg-emerald-50/80 dark:bg-emerald-950/40 border-r border-slate-200 dark:border-slate-800 text-emerald-800 dark:text-emerald-300">
                  Asesmen Formatif (per Tujuan Pembelajaran)
                </th>

                {/* Sumatif Columns */}
                <th colSpan={2} className="py-2 px-3 text-center bg-blue-50/80 dark:bg-blue-950/40 border-r border-slate-200 dark:border-slate-800 text-blue-800 dark:text-blue-300">
                  Sumatif Lingkup Materi
                </th>

                <th rowSpan={2} className="py-3 px-3 w-20 text-center bg-purple-50/80 dark:bg-purple-950/40 border-r border-slate-200 dark:border-slate-800 text-purple-800 dark:text-purple-300">
                  Sumatif Akhir (SAS)
                </th>

                <th rowSpan={2} className="py-3 px-3 w-20 text-center bg-amber-50/80 dark:bg-amber-950/40 border-r border-slate-200 dark:border-slate-800 text-amber-800 dark:text-amber-300">
                  Nilai Akhir (NA)
                </th>

                <th rowSpan={2} className="py-3 px-4 min-w-[280px]">
                  Deskripsi Capaian Kompetensi (Otomatis Rapor)
                </th>
              </tr>

              <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                {currentTPs.map(tp => (
                  <th key={tp.id} className="py-2 px-2 w-16 text-center border-r border-slate-200 dark:border-slate-800 font-mono text-[11px]" title={tp.tpDescription}>
                    {tp.tpCode}
                  </th>
                ))}
                {currentTPs.length === 0 && (
                  <th className="py-2 px-2 text-center border-r border-slate-200 dark:border-slate-800">-</th>
                )}
                <th className="py-2 px-2 w-16 text-center border-r border-slate-200 dark:border-slate-800 text-[11px]">SM 1</th>
                <th className="py-2 px-2 w-16 text-center border-r border-slate-200 dark:border-slate-800 text-[11px]">SM 2</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tableRows.map((row, index) => (
                <tr key={row.studentId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 text-center text-slate-500 font-medium border-r border-slate-200 dark:border-slate-800">
                    {index + 1}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-white border-r border-slate-200 dark:border-slate-800">
                    {row.studentName}
                  </td>

                  {/* Formatif Inputs */}
                  {currentTPs.map(tp => (
                    <td key={tp.id} className="py-1 px-1.5 border-r border-slate-200 dark:border-slate-800 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.formatif[tp.id] || ''}
                        onChange={(e) => handleScoreChange(index, 'formatif', tp.id, e.target.value)}
                        placeholder="-"
                        className="w-12 rounded-lg border border-slate-200 bg-white py-1 text-center font-mono font-bold text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </td>
                  ))}
                  {currentTPs.length === 0 && (
                    <td className="py-1 px-1.5 border-r border-slate-200 dark:border-slate-800 text-center text-slate-400">-</td>
                  )}

                  {/* Sumatif Materi Inputs */}
                  <td className="py-1 px-1.5 border-r border-slate-200 dark:border-slate-800 text-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={row.sumatifMateri['lm-1'] || ''}
                      onChange={(e) => handleScoreChange(index, 'sumatifMateri', 'lm-1', e.target.value)}
                      placeholder="-"
                      className="w-12 rounded-lg border border-slate-200 bg-white py-1 text-center font-mono font-bold text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </td>
                  <td className="py-1 px-1.5 border-r border-slate-200 dark:border-slate-800 text-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={row.sumatifMateri['lm-2'] || ''}
                      onChange={(e) => handleScoreChange(index, 'sumatifMateri', 'lm-2', e.target.value)}
                      placeholder="-"
                      className="w-12 rounded-lg border border-slate-200 bg-white py-1 text-center font-mono font-bold text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </td>

                  {/* Sumatif Akhir Input */}
                  <td className="py-1 px-1.5 border-r border-slate-200 dark:border-slate-800 text-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={row.sumatifAkhir}
                      onChange={(e) => handleScoreChange(index, 'sumatifAkhir', 'sas', e.target.value)}
                      placeholder="-"
                      className="w-12 rounded-lg border border-slate-200 bg-white py-1 text-center font-mono font-bold text-purple-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-purple-300"
                    />
                  </td>

                  {/* Final Score (NA) Display */}
                  <td className="py-2.5 px-3 text-center font-mono font-extrabold text-sm border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    {row.finalScore !== null ? (
                      <span className={`inline-block rounded-md px-2 py-0.5 ${
                        row.finalScore >= 85
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : row.finalScore >= 75
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {row.finalScore}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic font-sans text-xs">Belum Lengkap</span>
                    )}
                  </td>

                  {/* Generated Kurikulum Merdeka Achievement Description */}
                  <td className="py-2.5 px-4 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                    {row.achievementDesc || (
                      <span className="text-slate-400 italic">
                        Isi nilai formatif dan sumatif untuk menghasilkan deskripsi otomatis.
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Upload & Import Nilai Excel */}
      <AssessmentExcelModal
        isOpen={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        classId={selectedClassId}
        subjectId={selectedSubjectId}
        onApplyScores={handleApplyExcelScores}
      />
    </div>
  );
};
