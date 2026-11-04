/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ExtracurricularMember } from '../../types/index.ts';
import {
  Award,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
  Info,
  Check,
  Filter,
} from 'lucide-react';

export const ExtracurricularView: React.FC = () => {
  const {
    extracurriculars,
    extracurricularMembers,
    students,
    classes,
    activeAcademicYear,
    activeSemester,
    saveExtracurricularMember,
    bulkSaveExtracurricularMembers,
    removeExtracurricularMember,
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[4]?.id || classes[0]?.id || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Nilai ekstrakurikuler berhasil disimpan!');

  const classStudents = students.filter(s => s.currentClassId === selectedClassId && s.status === 'aktif');

  // Local state for each student row's active chosen ekskul
  // Key: studentId, Value: array of { extracurricularId, predicate, description }
  interface StudentEkskulEntry {
    extracurricularId: string;
    predicate: 'A' | 'B' | 'C' | 'D';
    description: string;
  }

  const [studentRows, setStudentRows] = useState<Record<string, StudentEkskulEntry[]>>({});

  // Sync from central store whenever class, semester, or members change
  useEffect(() => {
    const defaultWajibEkskul = extracurriculars.find(e => e.category === 'wajib') || extracurriculars[0];
    const defaultPilihanEkskul = extracurriculars.find(e => e.category === 'pilihan') || extracurriculars[1] || extracurriculars[0];

    const initialMap: Record<string, StudentEkskulEntry[]> = {};

    classStudents.forEach(student => {
      const existingMembers = extracurricularMembers.filter(
        m => m.studentId === student.id && m.semesterId === activeSemester.id
      );

      if (existingMembers.length > 0) {
        initialMap[student.id] = existingMembers.map(m => ({
          extracurricularId: m.extracurricularId,
          predicate: m.gradePredicate || 'A',
          description: m.description || 'Aktif berpartisipasi dan menunjukkan kedisiplinan yang baik.',
        }));
      } else {
        // Default to Wajib ekskul if available
        initialMap[student.id] = [
          {
            extracurricularId: defaultWajibEkskul?.id || (extracurriculars[0]?.id || ''),
            predicate: 'A',
            description: `Aktif mengikuti kegiatan ${defaultWajibEkskul?.name || 'ekstrakurikuler'} dengan penuh tanggung jawab.`,
          },
        ];
      }
    });

    setStudentRows(initialMap);
  }, [selectedClassId, activeSemester.id, extracurriculars.length]);

  // Handle changing selected ekskul for a student
  const handleChangeEkskul = (studentId: string, entryIndex: number, newEkskulId: string) => {
    const currentList = [...(studentRows[studentId] || [])];
    const targetEkskul = extracurriculars.find(e => e.id === newEkskulId);
    
    currentList[entryIndex] = {
      ...currentList[entryIndex],
      extracurricularId: newEkskulId,
      description: `Menunjukkan minat yang tinggi dan aktif dalam kegiatan ${targetEkskul?.name || 'ekstrakurikuler'}.`,
    };

    setStudentRows(prev => ({ ...prev, [studentId]: currentList }));
  };

  // Handle predicate change
  const handleChangePredicate = (studentId: string, entryIndex: number, predicate: 'A' | 'B' | 'C' | 'D') => {
    const currentList = [...(studentRows[studentId] || [])];
    const ekskul = extracurriculars.find(e => e.id === currentList[entryIndex]?.extracurricularId);
    
    let defaultDesc = currentList[entryIndex]?.description || '';
    if (predicate === 'A') {
      defaultDesc = `Sangat aktif dan berprestasi dalam kegiatan ${ekskul?.name || 'ekstrakurikuler'}.`;
    } else if (predicate === 'B') {
      defaultDesc = `Aktif mengikuti kegiatan ${ekskul?.name || 'ekstrakurikuler'} secara disiplin.`;
    } else if (predicate === 'C') {
      defaultDesc = `Cukup baik dalam berpartisipasi pada kegiatan ${ekskul?.name || 'ekstrakurikuler'}.`;
    } else {
      defaultDesc = `Perlu bimbingan dan motivasi untuk lebih aktif dalam ${ekskul?.name || 'ekstrakurikuler'}.`;
    }

    currentList[entryIndex] = {
      ...currentList[entryIndex],
      predicate,
      description: defaultDesc,
    };

    setStudentRows(prev => ({ ...prev, [studentId]: currentList }));
  };

  // Handle description change
  const handleChangeDescription = (studentId: string, entryIndex: number, description: string) => {
    const currentList = [...(studentRows[studentId] || [])];
    currentList[entryIndex] = {
      ...currentList[entryIndex],
      description,
    };
    setStudentRows(prev => ({ ...prev, [studentId]: currentList }));
  };

  // Add another ekskul choice for a student (e.g. 1 Wajib + 1 Pilihan)
  const handleAddEkskulChoice = (studentId: string) => {
    const currentList = studentRows[studentId] || [];
    const usedIds = currentList.map(e => e.extracurricularId);
    const available = extracurriculars.find(e => !usedIds.includes(e.id)) || extracurriculars[0];

    if (!available) return;

    const newEntry: StudentEkskulEntry = {
      extracurricularId: available.id,
      predicate: 'A',
      description: `Aktif mengikuti kegiatan ${available.name} dengan antusias.`,
    };

    setStudentRows(prev => ({
      ...prev,
      [studentId]: [...currentList, newEntry],
    }));
  };

  // Remove one ekskul choice for a student
  const handleRemoveEkskulChoice = (studentId: string, entryIndex: number) => {
    const currentList = studentRows[studentId] || [];
    const itemToRemove = currentList[entryIndex];
    if (itemToRemove) {
      removeExtracurricularMember(studentId, itemToRemove.extracurricularId, activeSemester.id);
    }
    const updated = currentList.filter((_, idx) => idx !== entryIndex);
    setStudentRows(prev => ({ ...prev, [studentId]: updated }));
  };

  // Save single student's ekskul records
  const handleSaveStudent = (studentId: string) => {
    const entries = studentRows[studentId] || [];
    entries.forEach(entry => {
      if (entry.extracurricularId) {
        saveExtracurricularMember({
          extracurricularId: entry.extracurricularId,
          studentId,
          academicYearId: activeAcademicYear.id,
          semesterId: activeSemester.id,
          gradePredicate: entry.predicate,
          description: entry.description,
        });
      }
    });

    setSuccessMessage('Nilai ekstrakurikuler siswa berhasil disimpan!');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Save all students' ekskul records in the class
  const handleSaveAll = () => {
    const allMembers: Omit<ExtracurricularMember, 'id'>[] = [];

    Object.entries(studentRows).forEach(([studentId, entries]) => {
      entries.forEach(entry => {
        if (entry.extracurricularId) {
          allMembers.push({
            extracurricularId: entry.extracurricularId,
            studentId,
            academicYearId: activeAcademicYear.id,
            semesterId: activeSemester.id,
            gradePredicate: entry.predicate,
            description: entry.description,
          });
        }
      });
    });

    bulkSaveExtracurricularMembers(allMembers);
    setSuccessMessage(`Berhasil menyimpan ${allMembers.length} entri nilai ekskul seluruh siswa kelas!`);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Penilaian Kegiatan Ekstrakurikuler
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pilih ekstrakurikuler yang diikuti oleh masing-masing siswa, lalu berikan predikat dan deskripsi capaian pada rapor.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
        >
          <Save className="h-4 w-4" />
          Simpan Semua Nilai Ekskul
        </button>
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

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Semester: <strong className="text-slate-800 dark:text-white">{activeSemester.semesterName}</strong> • {classStudents.length} Peserta Didik
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-100 p-3 text-xs font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          {successMessage}
        </div>
      )}

      {/* Info Notice */}
      <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-xs text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200">
        <Info className="h-4 w-4 shrink-0 text-emerald-600" />
        <span>
          Di samping nama siswa terdapat pilihan ekstrakurikuler yang diikuti. Anda dapat memilih ekskul (Wajib/Pilihan), serta menambahkan pilihan ekskul tambahan jika siswa mengikuti lebih dari satu kegiatan.
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-4 w-48">Nama Siswa</th>
                <th className="py-3 px-4 w-64">Ekskul yang Dipilih Siswa</th>
                <th className="py-3 px-3 w-28 text-center">Predikat</th>
                <th className="py-3 px-4">Deskripsi Capaian pada Rapor</th>
                <th className="py-3 px-3 w-20 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {classStudents.map((student, idx) => {
                const entries = studentRows[student.id] || [];

                return (
                  <tr key={student.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 align-top">
                    <td className="py-3 px-3 text-center text-slate-400 font-medium font-mono text-[11px]">
                      {idx + 1}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{student.fullName}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">NIS: {student.nis}</p>
                      <button
                        type="button"
                        onClick={() => handleAddEkskulChoice(student.id)}
                        className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
                        title="Tambah pilihan ekskul untuk siswa ini"
                      >
                        <Plus className="h-3 w-3" />
                        Tambah Ekskul Siswa
                      </button>
                    </td>

                    <td className="py-3 px-4" colSpan={3}>
                      <div className="space-y-3">
                        {entries.length === 0 ? (
                          <div className="text-slate-400 italic text-[11px] py-1">
                            Belum ada ekskul yang dipilih.{' '}
                            <button
                              onClick={() => handleAddEkskulChoice(student.id)}
                              className="text-emerald-600 underline font-medium"
                            >
                              Pilih Ekskul
                            </button>
                          </div>
                        ) : (
                          entries.map((entry, eIdx) => {
                            const currentEkskul = extracurriculars.find(e => e.id === entry.extracurricularId);
                            const isWajib = currentEkskul?.category === 'wajib';

                            return (
                              <div
                                key={eIdx}
                                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800"
                              >
                                {/* Ekskul Selector Beside Student Name */}
                                <div className="w-full sm:w-60">
                                  <select
                                    value={entry.extracurricularId}
                                    onChange={(e) => handleChangeEkskul(student.id, eIdx, e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                  >
                                    {extracurriculars.map(ek => (
                                      <option key={ek.id} value={ek.id}>
                                        {ek.name} [{ek.category === 'wajib' ? 'Wajib' : 'Pilihan'}]
                                      </option>
                                    ))}
                                  </select>
                                  <div className="flex items-center justify-between mt-1 text-[10px]">
                                    <span
                                      className={`inline-block px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                                        isWajib
                                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                          : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                                      }`}
                                    >
                                      {isWajib ? 'Wajib' : 'Pilihan'}
                                    </span>
                                    <span className="text-slate-400 truncate max-w-[140px]" title={currentEkskul?.coachName}>
                                      Pembina: {currentEkskul?.coachName || '-'}
                                    </span>
                                  </div>
                                </div>

                                {/* Predicate Selector */}
                                <div className="w-24">
                                  <select
                                    value={entry.predicate}
                                    onChange={(e) => handleChangePredicate(student.id, eIdx, e.target.value as any)}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-center text-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400"
                                  >
                                    <option value="A">A (Sangat Baik)</option>
                                    <option value="B">B (Baik)</option>
                                    <option value="C">C (Cukup)</option>
                                    <option value="D">D (Kurang)</option>
                                  </select>
                                </div>

                                {/* Description Input */}
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    value={entry.description}
                                    onChange={(e) => handleChangeDescription(student.id, eIdx, e.target.value)}
                                    placeholder="Deskripsi pencapaian minat dan bakat..."
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                  />
                                </div>

                                {/* Remove Button if more than 1 choice */}
                                {entries.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveEkskulChoice(student.id, eIdx)}
                                    className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400"
                                    title="Hapus ekskul ini dari siswa"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleSaveStudent(student.id)}
                        className="rounded-xl border border-emerald-200 bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 transition-all shadow-sm"
                        title="Simpan Nilai Ekskul Siswa Ini"
                      >
                        <Save className="h-4 w-4" />
                      </button>
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
