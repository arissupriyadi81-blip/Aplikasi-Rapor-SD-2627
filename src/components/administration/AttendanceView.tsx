/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { validateAttendance } from '../../utils/rules.ts';
import { CalendarCheck2, Save, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { classes, students, attendances, activeAcademicYear, activeSemester, bulkSaveAttendance } = useApp();
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[4]?.id || classes[0]?.id || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const classStudents = students.filter(s => s.currentClassId === selectedClassId && s.status === 'aktif');

  interface AttendanceRow {
    studentId: string;
    studentName: string;
    sakit: number;
    izin: number;
    alpa: number;
    notes: string;
  }

  const [rows, setRows] = useState<AttendanceRow[]>([]);

  useEffect(() => {
    const list: AttendanceRow[] = classStudents.map(s => {
      const existing = attendances.find(a => a.studentId === s.id && a.semesterId === activeSemester.id);
      return {
        studentId: s.id,
        studentName: s.fullName,
        sakit: existing ? existing.sakit : 0,
        izin: existing ? existing.izin : 0,
        alpa: existing ? existing.alpa : 0,
        notes: existing?.notes || '',
      };
    });
    setRows(list);
  }, [selectedClassId, activeSemester.id]);

  const handleChange = (idx: number, field: 'sakit' | 'izin' | 'alpa' | 'notes', val: any) => {
    const updated = [...rows];
    if (field === 'notes') {
      updated[idx].notes = val;
    } else {
      const num = parseInt(val, 10);
      updated[idx][field] = isNaN(num) ? 0 : Math.max(0, num);
    }
    setRows(updated);
  };

  const handleSaveAll = () => {
    for (const r of rows) {
      const val = validateAttendance(r.sakit, r.izin, r.alpa);
      if (!val.valid) {
        setErrorMessage(val.message || 'Data kehadiran tidak valid.');
        return;
      }
    }
    setErrorMessage('');

    bulkSaveAttendance(
      rows.map(r => ({
        studentId: r.studentId,
        classId: selectedClassId,
        academicYearId: activeAcademicYear.id,
        semesterId: activeSemester.id,
        sakit: r.sakit,
        izin: r.izin,
        alpa: r.alpa,
        notes: r.notes,
      }))
    );

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Rekap Kehadiran Peserta Didik
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pencatatan akumulasi hari Sakit, Izin, dan Tanpa Keterangan (Alpa) dalam satu semester.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
        >
          <Save className="h-4 w-4" />
          Simpan Kehadiran Kelas
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
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

      {saveSuccess && (
        <div className="flex items-center gap-1.5 rounded-xl bg-emerald-100 p-3 text-xs font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Rekap kehadiran kelas berhasil disimpan ke database!
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-1.5 rounded-xl bg-red-100 p-3 text-xs font-bold text-red-900 dark:bg-red-950 dark:text-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          {errorMessage}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-4 min-w-[200px]">Nama Lengkap Siswa</th>
                <th className="py-3 px-3 w-28 text-center bg-blue-50/60 dark:bg-blue-950/30">Sakit (Hari)</th>
                <th className="py-3 px-3 w-28 text-center bg-amber-50/60 dark:bg-amber-950/30">Izin (Hari)</th>
                <th className="py-3 px-3 w-28 text-center bg-red-50/60 dark:bg-red-950/30">Alpa / Tanpa Ket.</th>
                <th className="py-3 px-3 w-24 text-center font-bold">Total Absen</th>
                <th className="py-3 px-4">Keterangan Khusus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((row, idx) => {
                const total = row.sakit + row.izin + row.alpa;

                return (
                  <tr key={row.studentId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 text-center text-slate-500 font-medium">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">
                      {row.studentName}
                    </td>
                    <td className="py-2 px-3 text-center bg-blue-50/30 dark:bg-blue-950/10">
                      <input
                        type="number"
                        min="0"
                        value={row.sakit}
                        onChange={(e) => handleChange(idx, 'sakit', e.target.value)}
                        className="w-16 rounded-lg border border-slate-200 bg-white py-1 text-center font-mono font-bold text-blue-700 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-blue-300"
                      />
                    </td>
                    <td className="py-2 px-3 text-center bg-amber-50/30 dark:bg-amber-950/10">
                      <input
                        type="number"
                        min="0"
                        value={row.izin}
                        onChange={(e) => handleChange(idx, 'izin', e.target.value)}
                        className="w-16 rounded-lg border border-slate-200 bg-white py-1 text-center font-mono font-bold text-amber-700 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-amber-300"
                      />
                    </td>
                    <td className="py-2 px-3 text-center bg-red-50/30 dark:bg-red-950/10">
                      <input
                        type="number"
                        min="0"
                        value={row.alpa}
                        onChange={(e) => handleChange(idx, 'alpa', e.target.value)}
                        className="w-16 rounded-lg border border-slate-200 bg-white py-1 text-center font-mono font-bold text-red-700 focus:border-red-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-red-300"
                      />
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                      {total === 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400">Nihil (100%)</span>
                      ) : (
                        `${total} Hari`
                      )}
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        placeholder="Contoh: Surat dokter terlampir"
                        value={row.notes}
                        onChange={(e) => handleChange(idx, 'notes', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
  );
};
