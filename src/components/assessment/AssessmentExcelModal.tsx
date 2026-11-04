/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext.tsx';
import { calculateKurikulumMerdekaGrade, TPItem } from '../../utils/rules.ts';
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calculator,
} from 'lucide-react';

interface AssessmentExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  subjectId: string;
  onApplyScores: (imported: {
    studentId: string;
    studentName: string;
    formatif: Record<string, string>;
    sumatifMateri: Record<string, string>;
    sumatifAkhir: string;
    finalScore: number | null;
    achievementDesc: string;
  }[]) => void;
}

interface ParsedAssessmentRow {
  studentId: string;
  studentName: string;
  nis: string;
  formatif: Record<string, string>;
  sumatifMateri: Record<string, string>;
  sumatifAkhir: string;
  finalScore: number | null;
  achievementDesc: string;
}

export const AssessmentExcelModal: React.FC<AssessmentExcelModalProps> = ({
  isOpen,
  onClose,
  classId,
  subjectId,
  onApplyScores,
}) => {
  const { classes, subjects, students, cps, tps, assessments, activeSemester } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsedRows, setParsedRows] = useState<ParsedAssessmentRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentClass = classes.find(c => c.id === classId);
  const currentSubject = subjects.find(s => s.id === subjectId);
  const classStudents = students.filter(s => s.currentClassId === classId && s.status === 'aktif');

  const currentCPs = cps.filter(c => c.phase === currentClass?.phase && c.subjectId === subjectId);
  const cpIds = currentCPs.map(c => c.id);
  const currentTPs = tps.filter(t => cpIds.includes(t.cpId) && t.semester === activeSemester.semesterNumber);

  // Download template pre-filled with class students
  const handleDownloadTemplate = () => {
    if (!currentClass || !currentSubject) return;

    const dataRows = classStudents.map(student => {
      const existing = assessments.find(
        a =>
          a.classId === classId &&
          a.subjectId === subjectId &&
          a.studentId === student.id &&
          a.semesterId === activeSemester.id
      );

      const rowObj: Record<string, any> = {
        NIS: student.nis,
        Nama_Siswa: student.fullName,
      };

      // Add each TP column
      currentTPs.forEach((tp) => {
        const val = existing?.formatifScores?.[tp.id];
        const colKey = `Formatif_${tp.tpCode}`;
        rowObj[colKey] = val !== undefined && val !== null ? val : '';
      });

      // Sumatif Materi
      rowObj['Sumatif_Materi_1'] = existing?.sumatifMateriScores?.['lm-1'] ?? '';
      rowObj['Sumatif_Materi_2'] = existing?.sumatifMateriScores?.['lm-2'] ?? '';

      // Sumatif Akhir
      rowObj['Sumatif_Akhir_Semester'] = existing?.sumatifAkhir ?? '';

      return rowObj;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataRows);

    // Dynamic column widths
    const cols = [
      { wch: 14 }, // NIS
      { wch: 28 }, // Nama_Siswa
    ];
    currentTPs.forEach(() => cols.push({ wch: 18 }));
    cols.push({ wch: 18 }, { wch: 18 }, { wch: 22 });
    worksheet['!cols'] = cols;

    const workbook = XLSX.utils.book_new();
    const sheetName = `Nilai_${currentClass.className.replace(/[^a-zA-Z0-9]/g, '_')}`;
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.substring(0, 31));

    const outFileName = `Format_Nilai_${currentClass.className.replace(/\s+/g, '_')}_${currentSubject.subjectName.replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(workbook, outFileName);
  };

  // Process Excel File Upload
  const processExcelFile = (file: File) => {
    setErrorMsg('');
    setSuccessMsg('');
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (!rows || rows.length === 0) {
          setErrorMsg('File Excel kosong atau tidak memiliki data.');
          return;
        }

        const tpList: TPItem[] = currentTPs.map(t => ({
          id: t.id,
          code: t.tpCode,
          description: t.tpDescription,
          order: t.tpOrder,
        }));

        const results: ParsedAssessmentRow[] = [];

        rows.forEach(row => {
          // Identify student by NIS or Nama
          const rawNIS = String(row['NIS'] || row['nis'] || '').trim();
          const rawName = String(row['Nama_Siswa'] || row['Nama Siswa'] || row['Nama_Lengkap'] || row['Nama'] || '').trim();

          const student = classStudents.find(
            s => (rawNIS && s.nis.trim() === rawNIS) || (rawName && s.fullName.toLowerCase().trim() === rawName.toLowerCase())
          );

          if (!student) return;

          // Parse TP scores
          const formatifMap: Record<string, string> = {};
          const parsedFormatif: Record<string, number | null> = {};

          currentTPs.forEach(tp => {
            // Find key in row that matches tpCode e.g. Formatif_TP.1.1 or TP.1.1 or TP1
            const matchedKey = Object.keys(row).find(k => {
              const clean = k.toLowerCase().replace(/[^a-z0-9]/g, '');
              const cleanCode = tp.tpCode.toLowerCase().replace(/[^a-z0-9]/g, '');
              return clean.includes(cleanCode);
            });

            const rawVal = matchedKey ? row[matchedKey] : '';
            if (rawVal !== '' && rawVal !== undefined && rawVal !== null) {
              const num = parseInt(String(rawVal), 10);
              if (!isNaN(num) && num >= 0 && num <= 100) {
                formatifMap[tp.id] = String(num);
                parsedFormatif[tp.id] = num;
              } else {
                formatifMap[tp.id] = '';
                parsedFormatif[tp.id] = null;
              }
            } else {
              formatifMap[tp.id] = '';
              parsedFormatif[tp.id] = null;
            }
          });

          // Parse Sumatif Materi 1 & 2
          const getSumatifVal = (...searchKeys: string[]) => {
            for (const key of searchKeys) {
              const matchedKey = Object.keys(row).find(k => {
                const c1 = k.toLowerCase().replace(/[^a-z0-9]/g, '');
                const c2 = key.toLowerCase().replace(/[^a-z0-9]/g, '');
                return c1.includes(c2);
              });
              if (matchedKey && row[matchedKey] !== '' && row[matchedKey] !== undefined) {
                const num = parseInt(String(row[matchedKey]), 10);
                if (!isNaN(num) && num >= 0 && num <= 100) return String(num);
              }
            }
            return '';
          };

          const sm1 = getSumatifVal('Sumatif_Materi_1', 'Materi_1', 'LM_1', 'LM1', 'Sumatif1');
          const sm2 = getSumatifVal('Sumatif_Materi_2', 'Materi_2', 'LM_2', 'LM2', 'Sumatif2');
          const sas = getSumatifVal('Sumatif_Akhir_Semester', 'Sumatif_Akhir', 'SAS', 'PAS', 'PAT', 'Akhir');

          const sumatifMateriMap = {
            'lm-1': sm1,
            'lm-2': sm2,
          };

          const parsedSumatifMateri = {
            'lm-1': sm1 !== '' ? Number(sm1) : null,
            'lm-2': sm2 !== '' ? Number(sm2) : null,
          };
          const parsedSAS = sas !== '' ? Number(sas) : null;

          // Calculate Kurikulum Merdeka Grade
          const gradeResult = calculateKurikulumMerdekaGrade(
            {
              studentId: student.id,
              formatifScores: parsedFormatif,
              sumatifMateriScores: parsedSumatifMateri,
              sumatifAkhirSemester: parsedSAS,
            },
            tpList
          );

          results.push({
            studentId: student.id,
            studentName: student.fullName,
            nis: student.nis,
            formatif: formatifMap,
            sumatifMateri: sumatifMateriMap,
            sumatifAkhir: sas,
            finalScore: gradeResult.finalScore,
            achievementDesc: gradeResult.achievementDescription,
          });
        });

        if (results.length === 0) {
          setErrorMsg(
            'Tidak ada data siswa yang cocok dengan rombel saat ini. Pastikan kolom NIS atau Nama Siswa sesuai dengan daftar kelas.'
          );
          return;
        }

        setParsedRows(results);
      } catch (err: any) {
        console.error('Error parsing excel scores:', err);
        setErrorMsg('Gagal membaca file Excel. Pastikan format spreadsheet valid.');
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processExcelFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processExcelFile(e.dataTransfer.files[0]);
    }
  };

  const handleApply = () => {
    if (parsedRows.length === 0) return;
    onApplyScores(parsedRows);
    setSuccessMsg(`Berhasil menerapkan nilai untuk ${parsedRows.length} siswa!`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex flex-col h-[90vh] w-full max-w-5xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Upload & Impor Nilai Kurikulum Merdeka (Excel)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rombel: <strong className="text-slate-800 dark:text-slate-200">{currentClass?.className}</strong> | Mapel: <strong className="text-emerald-600 dark:text-emerald-400">{currentSubject?.subjectName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-6 py-3 dark:border-slate-800 dark:bg-slate-800/40 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Langkah 1:</span>
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shadow-sm transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Unduh Format Excel Nilai ({currentClass?.className})</span>
            </button>
          </div>

          <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1 text-[11px]">
            <HelpCircle className="h-3.5 w-3.5 text-emerald-600" />
            <span>Format otomatis memuat kolom seluruh TP aktif, Sumatif Materi, dan SAS.</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Upload Dropzone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50/50 dark:border-slate-700 dark:hover:bg-slate-800/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mb-3">
              <Upload className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">
              {fileName ? fileName : 'Pilih file Excel nilai yang telah diisi atau seret ke sini'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Sistem akan menghitung Nilai Akhir & Narasi Capaian Pembelajaran secara otomatis sesuai rumus Kurikulum Merdeka.
            </p>
          </div>

          {/* Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-emerald-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Hasil Analisis & Kalkulasi Rapor ({parsedRows.length} Siswa Terbaca)
                  </h4>
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Perhitungan bobot 50% Sumatif Materi + 50% SAS aktif
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">NIS</th>
                      <th className="py-2.5 px-3">Nama Siswa</th>
                      {currentTPs.map(t => (
                        <th key={t.id} className="py-2.5 px-2 text-center" title={t.tpDescription}>
                          {t.tpCode}
                        </th>
                      ))}
                      <th className="py-2.5 px-2 text-center">LM 1</th>
                      <th className="py-2.5 px-2 text-center">LM 2</th>
                      <th className="py-2.5 px-2 text-center">SAS</th>
                      <th className="py-2.5 px-3 text-center bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                        Nilai Akhir
                      </th>
                      <th className="py-2.5 px-3">Capaian Kompetensi (Kurikulum Merdeka)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {parsedRows.map((row, idx) => (
                      <tr key={row.studentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{row.nis}</td>
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{row.studentName}</td>
                        {currentTPs.map(t => (
                          <td key={t.id} className="py-2 px-2 text-center font-mono text-[11px]">
                            {row.formatif[t.id] || '-'}
                          </td>
                        ))}
                        <td className="py-2 px-2 text-center font-mono text-[11px]">{row.sumatifMateri['lm-1'] || '-'}</td>
                        <td className="py-2 px-2 text-center font-mono text-[11px]">{row.sumatifMateri['lm-2'] || '-'}</td>
                        <td className="py-2 px-2 text-center font-mono text-[11px]">{row.sumatifAkhir || '-'}</td>
                        <td className="py-2 px-3 text-center font-bold text-sm bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300">
                          {row.finalScore !== null ? row.finalScore : '-'}
                        </td>
                        <td className="py-2 px-3 text-[11px] text-slate-600 dark:text-slate-400 max-w-xs truncate" title={row.achievementDesc}>
                          {row.achievementDesc || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">
            {parsedRows.length > 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                ✓ Siap menerapkan nilai untuk {parsedRows.length} peserta didik
              </span>
            ) : (
              'Unduh format template atau unggah spreadsheet nilai'
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Batal
            </button>
            <button
              onClick={handleApply}
              disabled={parsedRows.length === 0}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Terapkan Nilai ({parsedRows.length} Siswa)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
