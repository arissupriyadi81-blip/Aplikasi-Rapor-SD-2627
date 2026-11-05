/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { formatIndonesianDate, KOKURIKULER_GRADES } from '../../utils/rules.ts';
import { KokurikulerGrade } from '../../types/index.ts';
import { getStandaloneReportCss } from '../../utils/printReportStyles.ts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Printer,
  X,
  FileText,
  CheckCircle2,
  Download,
  Eye,
  Sliders,
  Sparkles,
  FileDown,
  ExternalLink,
  Loader2,
} from 'lucide-react';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({ isOpen, onClose }) => {
  const {
    schoolProfile,
    classes,
    subjects,
    students,
    teachers,
    assessments,
    cocurricularActivities,
    cocurricularRubrics,
    cocurricularAssessments,
    extracurriculars,
    extracurricularMembers,
    attendances,
    homeroomNotes,
    achievements,
    activeAcademicYear,
    activeSemester,
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[4]?.id || classes[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [documentType, setDocumentType] = useState<'all' | 'cover' | 'identitas' | 'dinas' | 'prestasi'>('all');
  const [includeSignatures, setIncludeSignatures] = useState<boolean>(true);
  const [paperSize, setPaperSize] = useState<'f4' | 'legal' | 'a4'>('f4');

  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfProgress, setPdfProgress] = useState<string | null>(null);
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentClass = classes.find(c => c.id === selectedClassId);
  const classStudents = students.filter(s => s.currentClassId === selectedClassId && s.status === 'aktif');
  const printStudents = selectedStudentId === 'all'
    ? classStudents
    : classStudents.filter(s => s.id === selectedStudentId);

  const homeroomTeacher = teachers.find(t => t.id === currentClass?.homeroomTeacherId);
  const activeSubjects = subjects.filter(s => s.isActive);

  // Konfigurasi ukuran kertas standar: F4 (Folio 215x330mm) & Legal (216x356mm) agar halaman rapor tidak terpotong
  const PAPER_CONFIG: Record<'f4' | 'legal' | 'a4', { widthMm: number; heightMm: number; label: string; name: string; cssSize: string; minHeightClass: string; maxWidthClass: string }> = {
    f4: {
      widthMm: 215,
      heightMm: 330,
      label: 'F4_Folio',
      name: 'F4 / Folio (215 × 330 mm)',
      cssSize: '215mm 330mm',
      minHeightClass: 'min-h-[330mm]',
      maxWidthClass: 'max-w-[215mm]',
    },
    legal: {
      widthMm: 216,
      heightMm: 356,
      label: 'Legal',
      name: 'Legal (216 × 356 mm)',
      cssSize: 'legal',
      minHeightClass: 'min-h-[356mm]',
      maxWidthClass: 'max-w-[216mm]',
    },
    a4: {
      widthMm: 210,
      heightMm: 297,
      label: 'A4',
      name: 'A4 (210 × 297 mm)',
      cssSize: 'A4',
      minHeightClass: 'min-h-[297mm]',
      maxWidthClass: 'max-w-[210mm]',
    },
  };

  const currentPaper = PAPER_CONFIG[paperSize];

  // Helper untuk mengekstrak seluruh CSS rules aktif agar tab cetak & html2canvas 100% styled di production (seperti Vercel)
  const getActiveInlinedCss = (): string => {
    let inlined = '';
    try {
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          inlined += rules.map(r => r.cssText).join('\n') + '\n';
        } catch {
          // Abaikan jika ada cross-origin style restriction
        }
      }
    } catch {
      // Abaikan jika tidak diizinkan
    }
    return inlined;
  };

  // Fungsi 1: Unduh langsung dokumen sebagai berkas PDF (.pdf) dengan kertas F4 / Legal
  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      setPdfProgress(`Menyiapkan lembar rapor format ${currentPaper.name}...`);

      const container = document.getElementById('report-printable-area');
      if (!container) {
        throw new Error('Area dokumen tidak ditemukan');
      }

      const pageElements = container.querySelectorAll<HTMLElement>('[data-report-page="true"]');
      const pagesToProcess = pageElements.length > 0 ? Array.from(pageElements) : [container];

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [currentPaper.widthMm, currentPaper.heightMm],
        compress: true,
      });

      const standaloneCss = getStandaloneReportCss(currentPaper.cssSize);
      const activeInlinedCss = getActiveInlinedCss();

      for (let i = 0; i < pagesToProcess.length; i++) {
        const pageEl = pagesToProcess[i];
        setPdfProgress(`Memproses halaman ${i + 1} dari ${pagesToProcess.length} (${currentPaper.label})...`);

        const canvas = await html2canvas(pageEl, {
          scale: 1.8,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 1200,
          onclone: (clonedDoc, clonedEl) => {
            // Hilangkan dark mode di canvas agar hasil cetak selalu berlatar belakang putih bersih
            clonedDoc.documentElement.classList.remove('dark');
            clonedDoc.body.style.backgroundColor = '#ffffff';
            clonedEl.style.backgroundColor = '#ffffff';
            clonedEl.style.color = '#0f172a';

            // Sisipkan standalone CSS murni ke header cloned doc
            const standaloneStyle = clonedDoc.createElement('style');
            standaloneStyle.id = 'html2canvas-standalone-styles';
            standaloneStyle.textContent = standaloneCss;
            clonedDoc.head.appendChild(standaloneStyle);

            if (activeInlinedCss) {
              const inlinedStyle = clonedDoc.createElement('style');
              inlinedStyle.id = 'html2canvas-inlined-styles';
              inlinedStyle.textContent = activeInlinedCss;
              clonedDoc.head.appendChild(inlinedStyle);
            }
          },
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        if (i > 0) {
          pdf.addPage([currentPaper.widthMm, currentPaper.heightMm], 'p');
        }
        
        // Margin otomatis sebesar 0.5 inci (12.7 mm) agar hasil unduh rapi dan proporsional
        const marginMm = 12.7; // 0.5 inci
        const maxPrintW = currentPaper.widthMm - (marginMm * 2);
        const maxPrintH = currentPaper.heightMm - (marginMm * 2);

        let printW = maxPrintW;
        let printH = printW * (canvas.height / canvas.width);

        if (printH > maxPrintH) {
          printH = maxPrintH;
          printW = printH * (canvas.width / canvas.height);
        }

        const posX = marginMm + (maxPrintW - printW) / 2;
        const posY = marginMm;

        pdf.addImage(imgData, 'JPEG', posX, posY, printW, printH, undefined, 'FAST');
      }

      setPdfProgress('Menyimpan berkas PDF...');
      const studentLabel = selectedStudentId === 'all'
        ? `Kelas_${currentClass?.className?.replace(/\s+/g, '_') || 'Semua'}`
        : `${printStudents[0]?.fullName?.replace(/\s+/g, '_') || 'Siswa'}`;
      const fileName = `Rapor_SD_AlJannah_${studentLabel}_Sem_${activeSemester.semesterNumber}_${currentPaper.label}.pdf`;

      pdf.save(fileName);
      setDownloadMessage(`Berkas PDF "${fileName}" (${currentPaper.name}) berhasil diunduh tanpa terpotong!`);
      setTimeout(() => setDownloadMessage(null), 6000);
    } catch (err) {
      console.error('Gagal membuat PDF langsung via html2canvas:', err);
      setPdfProgress('Mengalihkan ke Dialog Cetak / Simpan PDF...');
      // Fallback ke tab baru dengan styling 100% lengkap
      handleOpenPrintWindow();
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress(null);
    }
  };

  // Fungsi 2: Membuka window / tab cetak mandiri di luar sandbox iframe dengan kertas F4 / Legal & margin otomatis 0.5 inci
  const handleOpenPrintWindow = () => {
    const printableContent = document.getElementById('report-printable-area');
    if (!printableContent) return;

    // 1. Kumpulkan link stylesheet dengan URL absolut untuk resolve di domain produksi (Vercel)
    const absoluteStyleLinks = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
      .map(link => `<link rel="stylesheet" href="${link.href}">`)
      .join('\n');

    // 2. Kumpulkan rules CSS aktif langsung dari DOM
    const activeInlinedCss = getActiveInlinedCss();

    // 3. Ambil standalone CSS yang menjamin semua tabel, kop, border, & layout ter-style 100%
    const standaloneCss = getStandaloneReportCss(currentPaper.cssSize);

    const studentTitle = selectedStudentId === 'all'
      ? `Semua Siswa ${currentClass?.className || ''}`
      : (printStudents[0]?.fullName || 'Siswa');

    const htmlDoc = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <base href="${window.location.origin}/">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cetak Rapor - ${studentTitle} - SD IAS Al-Jannah (${currentPaper.label})</title>
        ${absoluteStyleLinks}
        ${activeInlinedCss ? `<style id="inlined-app-styles">${activeInlinedCss}</style>` : ''}
        <style id="standalone-report-styles">${standaloneCss}</style>
      </head>
      <body>
        <div class="no-print-toolbar">
          <div>
            <h4>Dokumen Siap Cetak / Simpan PDF (${currentPaper.name})</h4>
            <p>Ukuran kertas ${currentPaper.name} dengan margin 0.5 inci terpasang agar halaman tidak terpotong. Gunakan tombol di samping atau tekan Ctrl+P / Cmd+P.</p>
          </div>
          <button class="print-btn-action" onclick="window.print()">
            🖨️ Munculkan Dialog Print / Simpan PDF
          </button>
        </div>
        <div class="print-container">
          ${printableContent.innerHTML}
        </div>
        <script>
          window.addEventListener('load', function() {
            setTimeout(function() {
              window.print();
            }, 600);
          });
        </script>
      </body>
      </html>
    `;

    // Gunakan window.open('', '_blank') dan document.write agar mewarisi origin host Vercel (bukan blob terisolasi)
    const printTab = window.open('', '_blank');
    if (printTab) {
      printTab.document.open();
      printTab.document.write(htmlDoc);
      printTab.document.close();
    } else {
      // Fallback jika browser memblokir popup
      const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.click();
    }
  };

  const handleTriggerPrint = () => {
    // Di desktop/iframe, handleOpenPrintWindow membuka tab bebas-sandbox yang pasti memunculkan dialog print OS
    handleOpenPrintWindow();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="flex flex-col h-[95vh] w-full max-w-5xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 print:border-none print:shadow-none print:h-auto print:w-full print:rounded-none">
        
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 px-5 py-3.5 dark:border-slate-800 print:hidden shrink-0 gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Printer className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Pratinjau & Cetak Rapor Digital Kurikulum Merdeka
              </h3>
              <p className="text-[11px] text-slate-500">
                Format resmi Standar SD IAS Al-Jannah • Kertas {currentPaper.name} • Margin 0.5 Inci
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tombol Unduh PDF Native Langsung */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 transition-all"
              title={`Unduh file dokumen PDF ukuran ${currentPaper.name} dengan margin otomatis 0.5 inci langsung ke perangkat Anda`}
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{pdfProgress || 'Membuat PDF...'}</span>
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4" />
                  <span>Unduh File PDF ({currentPaper.label})</span>
                </>
              )}
            </button>

            {/* Tombol Buka Tab Cetak Mandiri yang memicu Dialog Print OS */}
            <button
              onClick={handleOpenPrintWindow}
              className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
              title={`Buka lembar cetak di tab baru dengan ukuran ${currentPaper.name} & margin 0.5 inci untuk dialog printer / Save to PDF`}
            >
              <ExternalLink className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Dialog Print (Tab Baru)</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Notifikasi Status Unduh jika selesai */}
        {downloadMessage && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 px-5 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{downloadMessage}</span>
            </div>
            <button onClick={() => setDownloadMessage(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold">
              Tutup
            </button>
          </div>
        )}

        {/* Filter Configuration Bar (Hidden during print) */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-2.5 dark:border-slate-800 dark:bg-slate-800/50 print:hidden text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Rombel:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.className}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Siswa:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="all">Seluruh Siswa Satu Kelas ({classStudents.length} Siswa)</option>
              {classStudents.map(s => (
                <option key={s.id} value={s.id}>{s.fullName} ({s.nis})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Ukuran Kertas:</span>
            <select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value as 'f4' | 'legal' | 'a4')}
              className="rounded-lg border border-emerald-300 bg-emerald-50/60 text-emerald-900 font-bold px-2.5 py-1 text-xs focus:outline-none dark:border-emerald-700 dark:bg-slate-800 dark:text-emerald-300"
              title="Pilih ukuran kertas agar halaman tidak terpotong"
            >
              <option value="f4">F4 / Folio (215 × 330 mm) - Standar Sekolah Indonesia [Disarankan]</option>
              <option value="legal">Legal (216 × 356 mm) - Format Ekstra Panjang</option>
              <option value="a4">A4 (210 × 297 mm)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Jenis Dokumen:</span>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as any)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="all">Semua Lembar (Sampul, Identitas Siswa, Nilai Dinas, Prestasi)</option>
              <option value="cover">Hanya Sampul / Kover Rapor</option>
              <option value="identitas">Hanya Lembar Identitas Peserta Didik</option>
              <option value="dinas">Hanya Lembar Nilai Rapor Dinas</option>
              <option value="prestasi">Hanya Lembar Catatan Prestasi</option>
            </select>
          </div>

          <label className="flex items-center gap-1.5 ml-auto font-medium text-slate-600 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={includeSignatures}
              onChange={(e) => setIncludeSignatures(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            Sertakan Kolom Tanda Tangan
          </label>
        </div>

        {/* Document Render Area with Print Simulation */}
        <div className="flex-1 overflow-y-auto bg-slate-200/60 p-4 sm:p-8 dark:bg-slate-950/80 print:bg-white print:p-0 print:overflow-visible">
          <div id="report-printable-area" className={`${currentPaper.maxWidthClass} mx-auto space-y-12 print:space-y-0 print:max-w-none`}>
            {printStudents.map((student, studentIndex) => {
              const studentAssessments = activeSubjects.map(sub => {
                const a = assessments.find(
                  ass =>
                    ass.classId === selectedClassId &&
                    ass.subjectId === sub.id &&
                    ass.studentId === student.id &&
                    ass.semesterId === activeSemester.id
                );
                return {
                  subject: sub,
                  finalScore: a?.finalScore ?? null,
                  desc: a?.achievementDesc || 'Menunjukkan pemahaman terhadap tujuan pembelajaran materi ini.',
                };
              });

              const att = attendances.find(a => a.studentId === student.id && a.semesterId === activeSemester.id);
              const note = homeroomNotes.find(n => n.studentId === student.id && n.semesterId === activeSemester.id);
              const studentEkskul = extracurricularMembers.filter(
                m => m.studentId === student.id && m.semesterId === activeSemester.id
              );
              const studentAchs = achievements.filter(
                a => a.studentId === student.id && a.verificationStatus === 'terverifikasi'
              );

              // Tanggal pembagian rapor berdasarkan semester aktif (Semester 1 atau Semester 2)
              const activeReportDate = activeSemester.semesterNumber === 1
                ? (schoolProfile.reportDateSem1 || schoolProfile.reportDate || '2026-12-19')
                : (schoolProfile.reportDateSem2 || schoolProfile.reportDate || '2027-06-25');

              return (
                <div key={student.id} className="space-y-10 print:space-y-0">
                  {/* ============================================================ */}
                  {/* DOCUMENT 1: COVER / SAMPUL RAPOR */}
                  {/* ============================================================ */}
                  {(documentType === 'all' || documentType === 'cover') && (
                    <div data-report-page="true" className={`bg-white text-slate-900 p-12 sm:p-16 shadow-lg rounded-xl print:shadow-none print:rounded-none print:p-0 ${currentPaper.minHeightClass} flex flex-col justify-between border border-slate-300 print:border-none print:break-after-page`}>
                      {/* Top Header Cover */}
                      <div className="text-center space-y-4">
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-bold shadow-md print:border print:border-slate-800">
                          <span className="text-3xl tracking-widest font-cinzel">AJ</span>
                        </div>
                        <div>
                          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-900 font-cinzel">
                            RAPOR PESERTA DIDIK
                          </h1>
                          <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-slate-800 mt-1">
                            SEKOLAH DASAR (SD)
                          </h2>
                          <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mt-0.5">
                            KURIKULUM MERDEKA
                          </p>
                        </div>
                      </div>

                      {/* Middle Student Box */}
                      <div className="my-10 max-w-md mx-auto w-full border-2 border-slate-800 p-6 rounded-xl text-center space-y-3 bg-slate-50/50 print:bg-transparent">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                          Nama Peserta Didik:
                        </p>
                        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 uppercase">
                          {student.fullName}
                        </h3>
                        <div className="pt-2 border-t border-slate-300 space-y-1 text-xs">
                          <p className="font-mono">NIS: <strong className="text-slate-900">{student.nis}</strong></p>
                          <p className="font-mono">NISN: <strong className="text-slate-900">{student.nisn}</strong></p>
                          <p className="font-semibold text-emerald-800">
                            Kelas: {currentClass?.className} (Fase {currentClass?.phase})
                          </p>
                        </div>
                      </div>

                      {/* Bottom School Identity */}
                      <div className="text-center space-y-2 text-xs">
                        <h4 className="text-sm font-bold uppercase text-slate-900">
                          {schoolProfile.schoolName}
                        </h4>
                        <p className="text-slate-600 font-medium">
                          NPSN: {schoolProfile.npsn} • NSS: {schoolProfile.nss}
                        </p>
                        <p className="text-slate-600 max-w-md mx-auto">
                          {schoolProfile.address}, {schoolProfile.district}, {schoolProfile.regency}
                        </p>
                        <p className="text-slate-500 font-semibold pt-4">
                          KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ============================================================ */}
                  {/* DOCUMENT 2: IDENTITAS PESERTA DIDIK (KETERANGAN DIRI)        */}
                  {/* ============================================================ */}
                  {(documentType === 'all' || documentType === 'identitas') && (
                    <div data-report-page="true" className={`bg-white text-slate-900 p-8 sm:p-12 shadow-lg rounded-xl print:shadow-none print:rounded-none print:p-0 ${currentPaper.minHeightClass} border border-slate-300 print:border-none print:break-after-page flex flex-col justify-between`}>
                      <div className="space-y-6">
                        {/* Title Header */}
                        <div className="text-center border-b-2 border-slate-900 pb-3">
                          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                            BUKU LAPORAN HASIL BELAJAR PESERTA DIDIK
                          </h2>
                          <h1 className="text-lg font-black uppercase tracking-wide text-slate-900 mt-0.5">
                            KETERANGAN TENTANG DIRI PESERTA DIDIK
                          </h1>
                          <p className="text-xs text-slate-500 uppercase mt-0.5">
                            {schoolProfile.schoolName} • TAHUN PELAJARAN {activeAcademicYear.yearName}
                          </p>
                        </div>

                        {/* Numbered Identity Table / Form Rows */}
                        <div className="space-y-2.5 text-xs text-slate-900">
                          <div className="flex items-start">
                            <span className="w-8 font-semibold">1.</span>
                            <span className="w-56 font-medium">Nama Peserta Didik (Lengkap)</span>
                            <span className="w-4">:</span>
                            <span className="flex-1 font-bold uppercase">{student.fullName}</span>
                          </div>

                          <div className="flex items-start">
                            <span className="w-8 font-semibold">2.</span>
                            <span className="w-56 font-medium">Nomor Induk Siswa (NIS)</span>
                            <span className="w-4">:</span>
                            <span className="flex-1 font-mono font-semibold">{student.nis}</span>
                          </div>

                          <div className="flex items-start">
                            <span className="w-8 font-semibold">3.</span>
                            <span className="w-56 font-medium">Nomor Induk Siswa Nasional (NISN)</span>
                            <span className="w-4">:</span>
                            <span className="flex-1 font-mono font-semibold">{student.nisn}</span>
                          </div>

                          <div className="flex items-start">
                            <span className="w-8 font-semibold">4.</span>
                            <span className="w-56 font-medium">Tempat, Tanggal Lahir</span>
                            <span className="w-4">:</span>
                            <span className="flex-1 font-medium">{student.birthPlace}, {formatIndonesianDate(student.birthDate)}</span>
                          </div>

                          <div className="flex items-start">
                            <span className="w-8 font-semibold">5.</span>
                            <span className="w-56 font-medium">Jenis Kelamin</span>
                            <span className="w-4">:</span>
                            <span className="flex-1 font-medium">{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                          </div>

                          <div className="flex items-start">
                            <span className="w-8 font-semibold">6.</span>
                            <span className="w-56 font-medium">Agama</span>
                            <span className="w-4">:</span>
                            <span className="flex-1 font-medium">{student.religion || 'Islam'}</span>
                          </div>

                          <div className="flex items-start">
                            <span className="w-8 font-semibold">7.</span>
                            <span className="w-56 font-medium">Pendidikan Sebelumnya</span>
                            <span className="w-4">:</span>
                            <span className="flex-1 font-medium">TK / PAUD Al-Jannah</span>
                          </div>

                          <div className="flex items-start">
                            <span className="w-8 font-semibold">8.</span>
                            <span className="w-56 font-medium">Alamat Peserta Didik</span>
                            <span className="w-4">:</span>
                            <span className="flex-1 font-medium">{student.address || '-'}</span>
                          </div>

                          <div className="flex items-start">
                            <span className="w-8 font-semibold">9.</span>
                            <span className="w-56 font-medium">Nama Orang Tua Kandung</span>
                            <span className="w-4">:</span>
                            <div className="flex-1 space-y-1">
                              <div className="flex">
                                <span className="w-24 text-slate-600">a. Ayah</span>
                                <span className="w-3">:</span>
                                <span className="font-semibold">{student.parentFather || '-'}</span>
                              </div>
                              <div className="flex">
                                <span className="w-24 text-slate-600">b. Ibu</span>
                                <span className="w-3">:</span>
                                <span className="font-semibold">{student.parentMother || '-'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <span className="w-8 font-semibold">10.</span>
                            <span className="w-56 font-medium">Pekerjaan Orang Tua</span>
                            <span className="w-4">:</span>
                            <div className="flex-1 space-y-1">
                              <div className="flex">
                                <span className="w-24 text-slate-600">a. Ayah</span>
                                <span className="w-3">:</span>
                                <span>{student.fatherJob || '-'}</span>
                              </div>
                              <div className="flex">
                                <span className="w-24 text-slate-600">b. Ibu</span>
                                <span className="w-3">:</span>
                                <span>{student.motherJob || '-'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <span className="w-8 font-semibold">11.</span>
                            <span className="w-56 font-medium">Pendidikan Terakhir Orang Tua</span>
                            <span className="w-4">:</span>
                            <div className="flex-1 space-y-1">
                              <div className="flex">
                                <span className="w-24 text-slate-600">a. Ayah</span>
                                <span className="w-3">:</span>
                                <span>{student.fatherEducation || '-'}</span>
                              </div>
                              <div className="flex">
                                <span className="w-24 text-slate-600">b. Ibu</span>
                                <span className="w-3">:</span>
                                <span>{student.motherEducation || '-'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <span className="w-8 font-semibold">12.</span>
                            <span className="w-56 font-medium">Alamat Orang Tua / Kontak</span>
                            <span className="w-4">:</span>
                            <div className="flex-1 space-y-1">
                              <div className="flex">
                                <span className="w-24 text-slate-600">a. Alamat</span>
                                <span className="w-3">:</span>
                                <span>{student.address || '-'}</span>
                              </div>
                              <div className="flex">
                                <span className="w-24 text-slate-600">b. Telepon/WA</span>
                                <span className="w-3">:</span>
                                <span className="font-mono font-medium">{student.parentPhone || '-'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <span className="w-8 font-semibold">13.</span>
                            <span className="w-56 font-medium">Wali Peserta Didik (Bila Ada)</span>
                            <span className="w-4">:</span>
                            <div className="flex-1 space-y-1">
                              <div className="flex">
                                <span className="w-24 text-slate-600">a. Nama</span>
                                <span className="w-3">:</span>
                                <span>{student.guardianName || '-'}</span>
                              </div>
                              <div className="flex">
                                <span className="w-24 text-slate-600">b. Pekerjaan</span>
                                <span className="w-3">:</span>
                                <span>{student.guardianJob || '-'}</span>
                              </div>
                              <div className="flex">
                                <span className="w-24 text-slate-600">c. Hubungan</span>
                                <span className="w-3">:</span>
                                <span>{student.guardianRelation || '-'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Photo Box & Principal Signature */}
                      <div className="pt-8 mt-6 border-t border-slate-300">
                        <div className="flex justify-between items-end text-xs">
                          {/* 3x4 Photo Container */}
                          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-400 w-28 h-36 rounded bg-slate-50 text-slate-400 text-center p-2">
                            <span className="text-[10px] font-semibold">Pasfoto Siswa</span>
                            <span className="text-xs font-bold mt-1">3 x 4 cm</span>
                          </div>

                          {/* Headmaster Signature */}
                          <div className="text-center w-64 space-y-16">
                            <p>
                              {schoolProfile.reportPlace}, {formatIndonesianDate(activeReportDate)}<br />
                              Kepala SD IAS Al-Jannah,
                            </p>
                            <div>
                              <p className="font-bold underline text-slate-900 text-sm">
                                {schoolProfile.headmasterName}
                              </p>
                              <p className="text-[11px] text-slate-600">
                                NIP. {schoolProfile.headmasterNip || '-'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ============================================================ */}
                  {/* DOCUMENT 3: RAPOR DINAS KURIKULUM MERDEKA */}
                  {/* ============================================================ */}
                  {(documentType === 'all' || documentType === 'dinas') && (
                    <div data-report-page="true" className={`bg-white text-slate-900 p-8 sm:p-12 shadow-lg rounded-xl print:shadow-none print:rounded-none print:p-0 ${currentPaper.minHeightClass} border border-slate-300 print:border-none print:break-after-page space-y-6`}>
                      
                      {/* Dinas Header & Identity Grid */}
                      <div className="border-b-2 border-slate-900 pb-3">
                        <div className="text-center mb-3">
                          <h2 className="text-base font-extrabold uppercase tracking-wide">
                            LAPORAN HASIL BELAJAR (RAPOR)
                          </h2>
                          <p className="text-xs font-semibold uppercase text-slate-600">
                            SEKOLAH DASAR IAS AL-JANNAH • TAHUN PELAJARAN {activeAcademicYear.yearName}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                          <div className="flex">
                            <span className="w-28 text-slate-600">Nama Siswa</span>
                            <span className="font-bold">: {student.fullName}</span>
                          </div>
                          <div className="flex">
                            <span className="w-28 text-slate-600">Kelas</span>
                            <span className="font-bold">: {currentClass?.className}</span>
                          </div>
                          <div className="flex">
                            <span className="w-28 text-slate-600">NIS / NISN</span>
                            <span className="font-mono">: {student.nis} / {student.nisn}</span>
                          </div>
                          <div className="flex">
                            <span className="w-28 text-slate-600">Fase</span>
                            <span className="font-bold">: Fase {currentClass?.phase}</span>
                          </div>
                          <div className="flex">
                            <span className="w-28 text-slate-600">Nama Sekolah</span>
                            <span>: {schoolProfile.schoolName}</span>
                          </div>
                          <div className="flex">
                            <span className="w-28 text-slate-600">Semester</span>
                            <span>: {activeSemester.semesterName}</span>
                          </div>
                          <div className="flex">
                            <span className="w-28 text-slate-600">Alamat Sekolah</span>
                            <span className="truncate">: {schoolProfile.address}</span>
                          </div>
                          <div className="flex">
                            <span className="w-28 text-slate-600">Tahun Ajaran</span>
                            <span className="font-semibold">: {activeAcademicYear.yearName}</span>
                          </div>
                        </div>
                      </div>

                      {/* Section A: Tabel Nilai Mata Pelajaran & Deskripsi Capaian */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                          A. Nilai Capaian Mata Pelajaran
                        </h4>
                        <table className="w-full text-left border-collapse border border-slate-800 text-xs">
                          <thead>
                            <tr className="bg-slate-100 font-bold border-b border-slate-800 text-slate-900">
                              <th className="border border-slate-800 p-2 w-8 text-center">No</th>
                              <th className="border border-slate-800 p-2 min-w-[150px]">Mata Pelajaran</th>
                              <th className="border border-slate-800 p-2 w-16 text-center">Nilai Akhir</th>
                              <th className="border border-slate-800 p-2">Capaian Kompetensi & Deskripsi Pembelajaran</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentAssessments.map((item, idx) => (
                              <tr key={item.subject.id} className="border-b border-slate-800">
                                <td className="border border-slate-800 p-2 text-center font-medium">{idx + 1}</td>
                                <td className="border border-slate-800 p-2 font-semibold">{item.subject.subjectName}</td>
                                <td className="border border-slate-800 p-2 text-center font-mono font-bold">
                                  {item.finalScore !== null ? item.finalScore : '-'}
                                </td>
                                <td className="border border-slate-800 p-2 text-[11px] leading-relaxed">
                                  {item.desc}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Section B: Kokurikuler (Hanya Catatan Kokurikuler) */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                          B. Kokurikuler
                        </h4>
                        <table className="w-full text-left border-collapse border border-slate-800 text-xs">
                          <thead>
                            <tr className="bg-slate-100 font-bold border-b border-slate-800">
                              <th className="border border-slate-800 p-2 w-8 text-center">No</th>
                              <th className="border border-slate-800 p-2">Catatan Kokurikuler</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cocurricularRubrics.map((rubric, rIdx) => {
                              const assess = cocurricularAssessments.find(
                                a => a.studentId === student.id && a.rubricId === rubric.id && a.semesterId === activeSemester.id
                              );
                              const grade: KokurikulerGrade = assess?.grade || 'B';
                              const gradeInfo = KOKURIKULER_GRADES[grade] || KOKURIKULER_GRADES.B;
                              const teacherNote = assess?.teacherNote || `Menunjukkan capaian ${gradeInfo.label} dalam aktivitas ${rubric.activityForm}.`;

                              return (
                                <tr key={rubric.id} className="border-b border-slate-800">
                                  <td className="border border-slate-800 p-2 text-center font-medium w-8">{rIdx + 1}</td>
                                  <td className="border border-slate-800 p-2 text-[11px] leading-relaxed text-slate-800">
                                    {teacherNote}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Section C: Ekstrakurikuler */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                          C. Kegiatan Ekstrakurikuler
                        </h4>
                        <table className="w-full text-left border-collapse border border-slate-800 text-xs">
                          <thead>
                            <tr className="bg-slate-100 font-bold border-b border-slate-800">
                              <th className="border border-slate-800 p-2 w-8 text-center">No</th>
                              <th className="border border-slate-800 p-2 min-w-[140px]">Kegiatan Ekstrakurikuler</th>
                              <th className="border border-slate-800 p-2 w-20 text-center">Predikat</th>
                              <th className="border border-slate-800 p-2">Keterangan Capaian</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentEkskul.length > 0 ? (
                              studentEkskul.map((em, idx) => {
                                const eks = extracurriculars.find(e => e.id === em.extracurricularId);
                                return (
                                  <tr key={em.id} className="border-b border-slate-800">
                                    <td className="border border-slate-800 p-2 text-center">{idx + 1}</td>
                                    <td className="border border-slate-800 p-2 font-semibold">{eks?.name}</td>
                                    <td className="border border-slate-800 p-2 text-center font-bold">{em.gradePredicate}</td>
                                    <td className="border border-slate-800 p-2 text-[11px]">{em.description}</td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={4} className="border border-slate-800 p-2 text-center text-slate-500 italic">
                                  Tidak mengambil kegiatan ekstrakurikuler pada semester ini.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Section D: Kehadiran & Catatan Wali Kelas */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Attendance box */}
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                            D. Ketidakhadiran
                          </h4>
                          <table className="w-full border-collapse border border-slate-800 text-xs">
                            <tbody>
                              <tr className="border-b border-slate-800">
                                <td className="border border-slate-800 p-2">Sakit</td>
                                <td className="border border-slate-800 p-2 text-center font-mono font-bold w-14">
                                  {att?.sakit || 0} hari
                                </td>
                              </tr>
                              <tr className="border-b border-slate-800">
                                <td className="border border-slate-800 p-2">Izin</td>
                                <td className="border border-slate-800 p-2 text-center font-mono font-bold w-14">
                                  {att?.izin || 0} hari
                                </td>
                              </tr>
                              <tr>
                                <td className="border border-slate-800 p-2">Tanpa Keterangan</td>
                                <td className="border border-slate-800 p-2 text-center font-mono font-bold w-14">
                                  {att?.alpa || 0} hari
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Homeroom Note box */}
                        <div className="sm:col-span-2 space-y-1.5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                            E. Catatan Wali Kelas
                          </h4>
                          <div className="border border-slate-800 p-3 text-xs leading-relaxed rounded min-h-[92px] space-y-1">
                            <p>{note?.noteLearning || 'Menunjukkan perkembangan akademis yang memuaskan.'}</p>
                            <p>{note?.noteAttitude || 'Berakhlak mulia dan santun terhadap guru serta rekan sejawat.'}</p>
                            <p className="font-semibold text-slate-800">{note?.noteRecommendation || 'Pertahankan semangat belajar ananda.'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Signatures Block */}
                      {includeSignatures && (
                        <div className="pt-8 border-t border-slate-300">
                          <div className="flex justify-between items-start text-xs">
                            <div className="text-center w-52 space-y-16">
                              <p>Mengetahui,<br />Orang Tua / Wali Murid,</p>
                              <div className="border-b border-slate-800 w-44 mx-auto" />
                            </div>

                            <div className="text-center w-52 space-y-16">
                              <p>
                                {schoolProfile.reportPlace}, {formatIndonesianDate(activeReportDate)}<br />
                                Wali Kelas,
                              </p>
                              <div>
                                <p className="font-bold underline text-slate-900">
                                  {homeroomTeacher?.fullName || 'Siti Rahmawati, S.Pd.I'}
                                </p>
                                <p className="text-[11px] text-slate-600">
                                  NIP. {homeroomTeacher?.nip || '198807122010012008'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="text-center mt-6 space-y-16">
                            <p>Mengetahui,<br />Kepala SD IAS Al-Jannah,</p>
                            <div>
                              <p className="font-bold underline text-slate-900">
                                {schoolProfile.headmasterName}
                              </p>
                              <p className="text-[11px] text-slate-600">
                                NIP. {schoolProfile.headmasterNip || '-'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ============================================================ */}
                  {/* DOCUMENT 3: RAPOR PRESTASI (JIKA ADA PRESTASI) */}
                  {/* ============================================================ */}
                  {(documentType === 'all' || documentType === 'prestasi') && (
                    <div data-report-page="true" className={`bg-white text-slate-900 p-8 sm:p-12 shadow-lg rounded-xl print:shadow-none print:rounded-none print:p-0 ${currentPaper.minHeightClass} border border-slate-300 print:border-none print:break-after-page space-y-6`}>
                      <div className="text-center border-b-2 border-slate-900 pb-3">
                        <h2 className="text-base font-extrabold uppercase tracking-wide">
                          LEMBAR CATATAN PRESTASI SISWA
                        </h2>
                        <p className="text-xs font-semibold text-slate-600 uppercase">
                          SD IAS AL-JANNAH • TAHUN PELAJARAN {activeAcademicYear.yearName}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs border border-slate-800 p-3 rounded">
                        <div>Nama Siswa: <strong>{student.fullName}</strong></div>
                        <div>Kelas: <strong>{currentClass?.className}</strong></div>
                        <div>NIS / NISN: <strong>{student.nis} / {student.nisn}</strong></div>
                        <div>Semester: <strong>{activeSemester.semesterName}</strong></div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                          Daftar Prestasi & Penghargaan Terverifikasi
                        </h4>
                        <table className="w-full text-left border-collapse border border-slate-800 text-xs">
                          <thead>
                            <tr className="bg-slate-100 font-bold border-b border-slate-800">
                              <th className="border border-slate-800 p-2 w-8 text-center">No</th>
                              <th className="border border-slate-800 p-2 min-w-[160px]">Nama Lomba / Kejuaraan</th>
                              <th className="border border-slate-800 p-2 w-28">Tingkat</th>
                              <th className="border border-slate-800 p-2 w-28">Peringkat</th>
                              <th className="border border-slate-800 p-2">Penyelenggara & Tanggal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentAchs.length > 0 ? (
                              studentAchs.map((ach, idx) => (
                                <tr key={ach.id} className="border-b border-slate-800">
                                  <td className="border border-slate-800 p-2 text-center">{idx + 1}</td>
                                  <td className="border border-slate-800 p-2 font-bold">{ach.achievementName}</td>
                                  <td className="border border-slate-800 p-2 capitalize">{ach.level.replace('_', ' ')}</td>
                                  <td className="border border-slate-800 p-2 font-semibold text-emerald-800">{ach.rankOrAward}</td>
                                  <td className="border border-slate-800 p-2 text-[11px]">
                                    {ach.organizer} ({ach.eventDate})
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="border border-slate-800 p-4 text-center text-slate-500 italic">
                                  Tidak ada catatan prestasi lomba luar sekolah pada semester ini.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {includeSignatures && (
                        <div className="pt-12 flex justify-end text-xs">
                          <div className="text-center w-56 space-y-16">
                            <p>
                              {schoolProfile.reportPlace}, {formatIndonesianDate(activeReportDate)}<br />
                              Kepala SD IAS Al-Jannah,
                            </p>
                            <div>
                              <p className="font-bold underline text-slate-900">
                                {schoolProfile.headmasterName}
                              </p>
                              <p className="text-[11px] text-slate-600">
                                NIP. {schoolProfile.headmasterNip || '-'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
