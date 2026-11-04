/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { calculateCohortRanking } from '../../utils/rules.ts';
import {
  TableProperties,
  Download,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export const LegerRankingView: React.FC = () => {
  const {
    classes,
    subjects,
    students,
    assessments,
    attendances,
    activeAcademicYear,
    activeSemester,
    currentUser,
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[4]?.id || classes[0]?.id || '');
  const [showRanking, setShowRanking] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'name' | 'rank'>('rank');

  const currentClass = classes.find(c => c.id === selectedClassId);
  const classStudents = students.filter(s => s.currentClassId === selectedClassId && s.status === 'aktif');
  const activeSubjects = subjects.filter(s => s.isActive);

  // Build subject score map for all students in this class
  const subjectScoresByStudent: Record<string, Record<string, number | null>> = {};
  classStudents.forEach(s => {
    subjectScoresByStudent[s.id] = {};
    activeSubjects.forEach(sub => {
      const assess = assessments.find(
        a =>
          a.classId === selectedClassId &&
          a.subjectId === sub.id &&
          a.studentId === s.id &&
          a.semesterId === activeSemester.id
      );
      subjectScoresByStudent[s.id][sub.id] = assess?.finalScore ?? null;
    });
  });

  // Calculate ranks
  const rankedItems = calculateCohortRanking(
    classStudents.map(s => ({ id: s.id, name: s.fullName })),
    subjectScoresByStudent,
    activeSubjects.map(s => s.id)
  );

  // Sorting
  const sortedStudents = [...classStudents].sort((a, b) => {
    if (sortBy === 'name') {
      return a.fullName.localeCompare(b.fullName);
    }
    const rankA = rankedItems.find(r => r.studentId === a.id)?.rank ?? 999;
    const rankB = rankedItems.find(r => r.studentId === b.id)?.rank ?? 999;
    return rankA - rankB;
  });

  // Export Leger to CSV
  const handleExportCSV = () => {
    const headers = [
      'No',
      'NIS',
      'NISN',
      'Nama Siswa',
      ...activeSubjects.map(s => s.subjectCode),
      'Total Nilai',
      'Rata-rata',
      ...(showRanking ? ['Peringkat'] : []),
      'Sakit',
      'Izin',
      'Alpa',
      'Status Kelengkapan',
    ];

    const rows = sortedStudents.map((s, idx) => {
      const rankInfo = rankedItems.find(r => r.studentId === s.id);
      const att = attendances.find(a => a.studentId === s.id && a.semesterId === activeSemester.id);
      const subScores = activeSubjects.map(sub => {
        const val = subjectScoresByStudent[s.id]?.[sub.id];
        return val !== null && val !== undefined ? String(val) : '-';
      });

      return [
        idx + 1,
        `"${s.nis}"`,
        `"${s.nisn}"`,
        `"${s.fullName}"`,
        ...subScores,
        rankInfo?.totalScore || 0,
        rankInfo?.averageScore || 0,
        ...(showRanking ? [rankInfo?.rank || '-'] : []),
        att?.sakit || 0,
        att?.izin || 0,
        att?.alpa || 0,
        rankInfo?.isComplete ? 'Lengkap' : 'Belum Lengkap',
      ].join(',');
    });

    const csv = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encoded = encodeURI(csv);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `Leger_Nilai_${currentClass?.className.replace(/\s+/g, '_')}_${activeSemester.semesterName.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <TableProperties className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Buku Leger Nilai & Ranking Siswa
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Rekapitulasi seluruh nilai mata pelajaran, rata-rata kelas, kehadiran, dan pemeringkatan opsional sekolah.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle ranking visibility */}
          <button
            onClick={() => setShowRanking(!showRanking)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
              showRanking
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {showRanking ? <ToggleRight className="h-4 w-4 text-emerald-600" /> : <ToggleLeft className="h-4 w-4" />}
            <span>Ranking: {showRanking ? 'Aktif' : 'Nonaktif'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Ekspor Leger CSV</span>
          </button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih Rombel / Kelas:</span>
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

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Urutkan:</span>
          <button
            onClick={() => setSortBy('rank')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              sortBy === 'rank' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Peringkat Nilai
          </button>
          <button
            onClick={() => setSortBy('name')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              sortBy === 'name' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Nama Siswa (A-Z)
          </button>
        </div>
      </div>

      {/* Leger Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/90 font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-200">
                {showRanking && (
                  <th className="py-3 px-3 w-14 text-center bg-amber-100/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-r border-slate-200 dark:border-slate-800">
                    Rank
                  </th>
                )}
                <th className="py-3 px-3 w-10 text-center border-r border-slate-200 dark:border-slate-800">No</th>
                <th className="py-3 px-4 min-w-[180px] border-r border-slate-200 dark:border-slate-800">Nama Siswa</th>
                
                {/* Subject Columns */}
                {activeSubjects.map(s => (
                  <th key={s.id} className="py-3 px-2 w-16 text-center border-r border-slate-200 dark:border-slate-800" title={s.subjectName}>
                    {s.subjectCode}
                  </th>
                ))}

                <th className="py-3 px-3 w-20 text-center bg-emerald-50 dark:bg-emerald-950/40 border-r border-slate-200 dark:border-slate-800 text-emerald-800 dark:text-emerald-300">
                  Total
                </th>
                <th className="py-3 px-3 w-20 text-center bg-emerald-50 dark:bg-emerald-950/40 border-r border-slate-200 dark:border-slate-800 text-emerald-800 dark:text-emerald-300">
                  Rata-rata
                </th>

                {/* Attendance Summary */}
                <th className="py-3 px-2 w-10 text-center bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300">S</th>
                <th className="py-3 px-2 w-10 text-center bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300">I</th>
                <th className="py-3 px-2 w-10 text-center bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border-r border-slate-200 dark:border-slate-800">A</th>

                <th className="py-3 px-3 text-center w-28">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedStudents.map((s, idx) => {
                const rankInfo = rankedItems.find(r => r.studentId === s.id);
                const att = attendances.find(a => a.studentId === s.id && a.semesterId === activeSemester.id);

                return (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    {showRanking && (
                      <td className="py-2.5 px-3 text-center font-bold text-amber-700 dark:text-amber-300 bg-amber-50/40 dark:bg-amber-950/20 border-r border-slate-200 dark:border-slate-800">
                        {rankInfo?.isComplete ? `#${rankInfo.rank}` : '-'}
                      </td>
                    )}
                    <td className="py-2.5 px-3 text-center text-slate-500 font-medium border-r border-slate-200 dark:border-slate-800">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-white border-r border-slate-200 dark:border-slate-800">
                      {s.fullName}
                    </td>

                    {/* Subject final scores */}
                    {activeSubjects.map(sub => {
                      const score = subjectScoresByStudent[s.id]?.[sub.id];
                      return (
                        <td key={sub.id} className="py-2.5 px-2 text-center font-mono font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">
                          {score !== null && score !== undefined ? (
                            <span className={score >= 75 ? 'text-slate-800 dark:text-white' : 'text-amber-600 font-bold'}>
                              {score}
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600 font-normal">-</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Total & Average */}
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/20 border-r border-slate-200 dark:border-slate-800">
                      {rankInfo?.totalScore || 0}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-extrabold text-emerald-800 dark:text-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/30 border-r border-slate-200 dark:border-slate-800">
                      {rankInfo?.averageScore || 0}
                    </td>

                    {/* Attendance */}
                    <td className="py-2.5 px-2 text-center text-slate-600 dark:text-slate-300">{att?.sakit || 0}</td>
                    <td className="py-2.5 px-2 text-center text-slate-600 dark:text-slate-300">{att?.izin || 0}</td>
                    <td className="py-2.5 px-2 text-center text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">{att?.alpa || 0}</td>

                    {/* Completeness */}
                    <td className="py-2.5 px-3 text-center">
                      {rankInfo?.isComplete ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" /> Lengkap
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          <AlertCircle className="h-3 w-3" /> Belum Lengkap
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
