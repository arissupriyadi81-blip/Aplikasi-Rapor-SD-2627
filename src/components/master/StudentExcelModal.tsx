/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext.tsx';
import { Student } from '../../types/index.ts';
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Users,
} from 'lucide-react';

interface StudentExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClassId?: string;
}

export const StudentExcelModal: React.FC<StudentExcelModalProps> = ({
  isOpen,
  onClose,
  defaultClassId,
}) => {
  const { classes, students, importStudents } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsedData, setParsedData] = useState<Omit<Student, 'id'>[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  if (!isOpen) return null;

  // Generate and download template Excel
  const handleDownloadTemplate = () => {
    const templateRows = [
      {
        NIS: '22230001',
        NISN: '0158490001',
        Nama_Lengkap: 'Muhammad Al-Fatih',
        Jenis_Kelamin: 'L',
        Tempat_Lahir: 'Jakarta',
        Tanggal_Lahir: '2015-05-12',
        Agama: 'Islam',
        Kelas: '5A - Al-Farabi',
        Nama_Ayah: 'Ahmad Dahlan, S.T.',
        Pekerjaan_Ayah: 'Pegawai Swasta',
        Pendidikan_Ayah: 'S1',
        Nama_Ibu: 'Fatimah Az-Zahra, S.Pd.',
        Pekerjaan_Ibu: 'Guru',
        Pendidikan_Ibu: 'S1',
        Nama_Wali: '',
        Pekerjaan_Wali: '',
        Hubungan_Wali: '',
        No_HP_Ortu: '081234567890',
        Alamat: 'Jl. Jambore No. 15, Harjamukti, Cibubur',
        Tahun_Masuk: '2022',
      },
      {
        NIS: '22230002',
        NISN: '0158490002',
        Nama_Lengkap: 'Aisyah Humaira',
        Jenis_Kelamin: 'P',
        Tempat_Lahir: 'Depok',
        Tanggal_Lahir: '2015-08-24',
        Agama: 'Islam',
        Kelas: '5A - Al-Farabi',
        Nama_Ayah: 'H. Bambang Irawan',
        Pekerjaan_Ayah: 'Wiraswasta',
        Pendidikan_Ayah: 'S2',
        Nama_Ibu: 'Hj. Siti Aminah',
        Pekerjaan_Ibu: 'Ibu Rumah Tangga',
        Pendidikan_Ibu: 'SMA/SMK',
        Nama_Wali: '',
        Pekerjaan_Wali: '',
        Hubungan_Wali: '',
        No_HP_Ortu: '081398765432',
        Alamat: 'Komplek Permata Puri Blok B4/12, Radar Auri',
        Tahun_Masuk: '2022',
      },
      {
        NIS: '22230003',
        NISN: '0158490003',
        Nama_Lengkap: 'Khadijah Putri Wardani',
        Jenis_Kelamin: 'P',
        Tempat_Lahir: 'Jakarta Timur',
        Tanggal_Lahir: '2015-11-03',
        Agama: 'Islam',
        Kelas: '5B - Ibnu Sina',
        Nama_Ayah: 'Rahmat Hidayat',
        Pekerjaan_Ayah: 'ASN / PNS',
        Pendidikan_Ayah: 'S1',
        Nama_Ibu: 'Nur Laila',
        Pekerjaan_Ibu: 'Karyawan BUMN',
        Pendidikan_Ibu: 'S1',
        Nama_Wali: '',
        Pekerjaan_Wali: '',
        Hubungan_Wali: '',
        No_HP_Ortu: '085712345678',
        Alamat: 'Jl. Radar Auri No. 8, Cibubur, Ciracas',
        Tahun_Masuk: '2022',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateRows);

    // Set custom column widths
    worksheet['!cols'] = [
      { wch: 12 }, // NIS
      { wch: 14 }, // NISN
      { wch: 26 }, // Nama_Lengkap
      { wch: 14 }, // Jenis_Kelamin
      { wch: 16 }, // Tempat_Lahir
      { wch: 14 }, // Tanggal_Lahir
      { wch: 10 }, // Agama
      { wch: 18 }, // Kelas
      { wch: 22 }, // Nama_Ayah
      { wch: 18 }, // Pekerjaan_Ayah
      { wch: 16 }, // Pendidikan_Ayah
      { wch: 22 }, // Nama_Ibu
      { wch: 18 }, // Pekerjaan_Ibu
      { wch: 16 }, // Pendidikan_Ibu
      { wch: 18 }, // Nama_Wali
      { wch: 16 }, // Pekerjaan_Wali
      { wch: 16 }, // Hubungan_Wali
      { wch: 16 }, // No_HP_Ortu
      { wch: 35 }, // Alamat
      { wch: 12 }, // Tahun_Masuk
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_Siswa_Dan_Ortu');
    XLSX.writeFile(workbook, 'Template_Import_Siswa_SD_AJ.xlsx');
  };

  // Helper to format Excel dates
  const parseExcelDate = (val: any): string => {
    if (!val) return '2015-01-01';
    if (typeof val === 'number') {
      // Excel serial date format
      const date = new Date(Math.round((val - 25569) * 86400 * 1000));
      return date.toISOString().substring(0, 10);
    }
    const str = String(val).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
      const parts = str.split('/');
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return str || '2015-01-01';
  };

  // Process Excel File
  const processExcelFile = (file: File) => {
    setErrorMsg('');
    setSuccessMsg('');
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (!rows || rows.length === 0) {
          setErrorMsg('File Excel kosong atau tidak memiliki data baris.');
          return;
        }

        const validResults: Omit<Student, 'id'>[] = [];

        rows.forEach((row, idx) => {
          // Normalize column names
          const getValue = (...keys: string[]) => {
            for (const key of keys) {
              const matchedKey = Object.keys(row).find(
                k => k.trim().toLowerCase().replace(/[\s_-]+/g, '') === key.trim().toLowerCase().replace(/[\s_-]+/g, '')
              );
              if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== '') {
                return String(row[matchedKey]).trim();
              }
            }
            return '';
          };

          const fullName = getValue('Nama_Lengkap', 'NamaLengkap', 'Nama', 'NamaSiswa', 'Full Name');
          if (!fullName) return; // skip empty rows

          const nis = getValue('NIS', 'NomorIndukSiswa') || `2223${String(students.length + idx + 1).padStart(4, '0')}`;
          const nisn = getValue('NISN') || `015849${String(students.length + idx + 1).padStart(4, '0')}`;
          
          let gender: 'L' | 'P' = 'L';
          const genderRaw = getValue('Jenis_Kelamin', 'JenisKelamin', 'JK', 'Gender', 'L/P').toUpperCase();
          if (genderRaw.startsWith('P') || genderRaw === 'PEREMPUAN') {
            gender = 'P';
          }

          const birthPlace = getValue('Tempat_Lahir', 'TempatLahir', 'KotaLahir') || 'Jakarta';
          const birthDateRaw = row['Tanggal_Lahir'] || row['TanggalLahir'] || row['Tgl_Lahir'] || getValue('Tanggal_Lahir', 'TanggalLahir');
          const birthDate = parseExcelDate(birthDateRaw);
          const religion = getValue('Agama') || 'Islam';

          // Class matching
          const classNameRaw = getValue('Kelas', 'Rombel', 'Class');
          let classId = defaultClassId && defaultClassId !== 'all' ? defaultClassId : (classes[4]?.id || classes[0]?.id || '');
          if (classNameRaw) {
            const matchedClass = classes.find(c =>
              c.className.toLowerCase().includes(classNameRaw.toLowerCase()) ||
              c.id.toLowerCase() === classNameRaw.toLowerCase()
            );
            if (matchedClass) {
              classId = matchedClass.id;
            }
          }

          // Parent & Guardian fields
          const parentFather = getValue('Nama_Ayah', 'NamaAyah', 'Ayah', 'Father');
          const fatherJob = getValue('Pekerjaan_Ayah', 'PekerjaanAyah', 'Pekerjaan_Bapak');
          const fatherEducation = getValue('Pendidikan_Ayah', 'PendidikanAyah');

          const parentMother = getValue('Nama_Ibu', 'NamaIbu', 'Ibu', 'Mother');
          const motherJob = getValue('Pekerjaan_Ibu', 'PekerjaanIbu');
          const motherEducation = getValue('Pendidikan_Ibu', 'PendidikanIbu');

          const guardianName = getValue('Nama_Wali', 'NamaWali', 'Wali');
          const guardianJob = getValue('Pekerjaan_Wali', 'PekerjaanWali');
          const guardianRelation = getValue('Hubungan_Wali', 'HubunganWali');

          const parentPhone = getValue('No_HP_Ortu', 'NoHP', 'NoTelepon', 'No_HP', 'Nomor_HP');
          const address = getValue('Alamat', 'Alamat_Rumah', 'Address') || 'Jakarta';
          const admissionYear = getValue('Tahun_Masuk', 'TahunMasuk') || '2022';

          validResults.push({
            nis,
            nisn,
            fullName,
            gender,
            birthPlace,
            birthDate,
            religion,
            parentFather,
            fatherJob,
            fatherEducation,
            parentMother,
            motherJob,
            motherEducation,
            guardianName,
            guardianJob,
            guardianRelation,
            parentPhone,
            address,
            admissionYear,
            status: 'aktif',
            currentClassId: classId,
            rollNumber: validResults.length + 1,
          });
        });

        if (validResults.length === 0) {
          setErrorMsg('Tidak ditemukan data siswa yang valid. Pastikan kolom "Nama_Lengkap" terisi.');
          return;
        }

        setParsedData(validResults);
      } catch (err: any) {
        console.error('Error parsing excel:', err);
        setErrorMsg('Gagal membaca file Excel. Pastikan file berformat .xlsx atau .xls yang valid.');
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSaveToDatabase = () => {
    if (parsedData.length === 0) return;
    importStudents(parsedData);
    setSuccessMsg(`Berhasil mengimpor/memperbarui ${parsedData.length} data siswa dan orang tua ke dalam sistem!`);
    setTimeout(() => {
      onClose();
    }, 1500);
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
                Upload & Impor Data Siswa + Orang Tua (Format Excel)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Impor massal biodata peserta didik, data ayah, ibu, wali, serta kontak telepon via spreadsheet .xlsx.
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
              <span>Unduh Template Excel (.xlsx)</span>
            </button>
          </div>

          <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1 text-[11px]">
            <HelpCircle className="h-3.5 w-3.5 text-emerald-600" />
            <span>Format mendukung data Ayah, Ibu, Pekerjaan, Pendidikan, dan No. HP.</span>
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
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
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
              {fileName ? fileName : 'Pilih file Excel (.xlsx / .xls) atau seret ke area ini'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Sistem akan memvalidasi NIS, NISN, Biodata, dan Informasi Orang Tua secara otomatis.
            </p>
          </div>

          {/* Preview Table */}
          {parsedData.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Pratinjau Data Siap Impor ({parsedData.length} Peserta Didik)
                  </h4>
                </div>
                <span className="text-[11px] text-slate-500">
                  Data yang NIS-nya sudah ada akan diperbarui; siswa baru akan ditambahkan.
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">NIS / NISN</th>
                      <th className="py-2.5 px-3">Nama Lengkap</th>
                      <th className="py-2.5 px-3">L/P</th>
                      <th className="py-2.5 px-3">Rombel</th>
                      <th className="py-2.5 px-3">Nama Ayah & Pekerjaan</th>
                      <th className="py-2.5 px-3">Nama Ibu & Pekerjaan</th>
                      <th className="py-2.5 px-3">No. HP & Alamat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {parsedData.slice(0, 15).map((row, idx) => {
                      const cls = classes.find(c => c.id === row.currentClassId)?.className || row.currentClassId;
                      const isExisting = students.some(s => s.nis === row.nis || s.nisn === row.nisn);
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                          <td className="py-2 px-3 font-mono text-[11px]">
                            <span className="text-slate-900 dark:text-white font-bold">{row.nis}</span>
                            <span className="text-slate-400 block text-[10px]">{row.nisn}</span>
                          </td>
                          <td className="py-2 px-3">
                            <span className="font-bold text-slate-900 dark:text-white">{row.fullName}</span>
                            {isExisting && (
                              <span className="ml-1.5 inline-block text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                                Update
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              row.gender === 'L' ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' : 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300'
                            }`}>
                              {row.gender}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-400 text-[11px] font-medium">
                            {cls}
                          </td>
                          <td className="py-2 px-3 text-[11px]">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{row.parentFather || '-'}</span>
                            {row.fatherJob && <span className="block text-slate-400 text-[10px]">{row.fatherJob}</span>}
                          </td>
                          <td className="py-2 px-3 text-[11px]">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{row.parentMother || '-'}</span>
                            {row.motherJob && <span className="block text-slate-400 text-[10px]">{row.motherJob}</span>}
                          </td>
                          <td className="py-2 px-3 text-[11px] max-w-[200px] truncate">
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 block text-[10px]">{row.parentPhone || '-'}</span>
                            <span className="text-slate-500 dark:text-slate-400 truncate block text-[10px]">{row.address}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {parsedData.length > 15 && (
                <p className="text-[11px] text-slate-400 italic text-center">
                  Dan {parsedData.length - 15} data siswa lainnya...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">
            {parsedData.length > 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                ✓ {parsedData.length} data siswa terverifikasi siap disimpan
              </span>
            ) : (
              'Silakan pilih file Excel untuk memulai'
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
              onClick={handleSaveToDatabase}
              disabled={parsedData.length === 0}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Simpan ke Database ({parsedData.length} Siswa)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
