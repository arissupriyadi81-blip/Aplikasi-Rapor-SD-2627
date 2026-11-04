/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { MessageSquareQuote, Save, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';

export const HomeroomNotesView: React.FC = () => {
  const { classes, students, homeroomNotes, activeAcademicYear, activeSemester, saveHomeroomNote } = useApp();
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[4]?.id || classes[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const classStudents = students.filter(s => s.currentClassId === selectedClassId && s.status === 'aktif');

  useEffect(() => {
    if (classStudents.length > 0 && (!selectedStudentId || !classStudents.some(s => s.id === selectedStudentId))) {
      setSelectedStudentId(classStudents[0].id);
    }
  }, [selectedClassId, classStudents.length]);

  const activeStudent = students.find(s => s.id === selectedStudentId);
  const currentNote = homeroomNotes.find(n => n.studentId === selectedStudentId && n.semesterId === activeSemester.id);

  const [formData, setFormData] = useState({
    noteLearning: '',
    noteAttitude: '',
    noteRecommendation: '',
  });

  useEffect(() => {
    if (currentNote) {
      setFormData({
        noteLearning: currentNote.noteLearning || '',
        noteAttitude: currentNote.noteAttitude || '',
        noteRecommendation: currentNote.noteRecommendation || '',
      });
    } else {
      setFormData({
        noteLearning: `${activeStudent?.fullName || 'Peserta didik'} menunjukkan perkembangan belajar yang positif, berpartisipasi aktif dalam kegiatan proyek sains, dan menyelesaikan tugas secara konsisten.`,
        noteAttitude: 'Menunjukkan adab yang mulia, ramah, dan menjadi teladan dalam menjaga kebersihan lingkungan alam sekolah.',
        noteRecommendation: 'Pertahankan prestasi dan semangat belajarnya, serta terus asah minat bakat ananda.',
      });
    }
  }, [selectedStudentId, currentNote]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    saveHomeroomNote({
      studentId: selectedStudentId,
      classId: selectedClassId,
      academicYearId: activeAcademicYear.id,
      semesterId: activeSemester.id,
      noteLearning: formData.noteLearning,
      noteAttitude: formData.noteAttitude,
      noteRecommendation: formData.noteRecommendation,
      status: 'final',
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const applyTemplate = (type: 'sangat_baik' | 'berkembang' | 'butuh_motivasi') => {
    const name = activeStudent?.fullName || 'Ananda';
    if (type === 'sangat_baik') {
      setFormData({
        noteLearning: `${name} memiliki daya nalar analitis yang sangat luar biasa di seluruh mata pelajaran, memiliki kemandirian belajar tinggi, dan aktif memimpin kelompok belajar.`,
        noteAttitude: 'Berakhlak karimah, santun kepada guru dan menyayangi sesama teman, serta aktif menjaga keasrian kebun alam sekolah.',
        noteRecommendation: 'Pertahankan prestasi membanggakan ini. Ananda sangat berpotensi menjadi perwakilan sekolah dalam ajang olimpiade sains dan tahfidz.',
      });
    } else if (type === 'berkembang') {
      setFormData({
        noteLearning: `${name} menunjukkan peningkatan belajar yang baik sepanjang semester ini, terutama pada aspek pemahaman materi kontekstual dan kerja sama tim.`,
        noteAttitude: 'Selalu bersemangat, disiplin waktu, dan memiliki rasa peduli lingkungan yang baik.',
        noteRecommendation: 'Perbanyak latihan soal penalaran matematika dan tingkatkan fokus saat mendengarkan penjelasan ustadz/ustadzah di kelas.',
      });
    } else {
      setFormData({
        noteLearning: `${name} memiliki potensi kreatif yang tinggi pada kegiatan berbasis praktik dan seni. Diperlukan pendampingan lebih dalam ketelitian membaca teks panjang.`,
        noteAttitude: 'Ceria, mudah berteman, dan memiliki empati yang hangat terhadap teman sekelas.',
        noteRecommendation: 'Disiplin belajar di rumah perlu ditingkatkan bersama bimbingan orang tua agar pemahaman konsep materi akademis semakin kokoh.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquareQuote className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Catatan Perkembangan Wali Kelas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Refleksi perkembangan belajar, karakter sikap kebiasaan positif, dan saran konstruktif yang dicetak pada rapor.
          </p>
        </div>
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
          Catatan wali kelas untuk {activeStudent?.fullName} berhasil disimpan ke database rapor!
        </div>
      )}

      {/* Main Layout: Student list on left, Editor on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student selector sidebar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Daftar Peserta Didik ({classStudents.length})
          </h3>
          <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
            {classStudents.map((s, idx) => {
              const isSelected = s.id === selectedStudentId;
              const hasNote = homeroomNotes.some(n => n.studentId === s.id && n.semesterId === activeSemester.id);

              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedStudentId(s.id)}
                  className={`w-full text-left rounded-xl p-2.5 transition-all text-xs flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-bold shadow-sm'
                      : 'hover:bg-slate-100 text-slate-700 dark:hover:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="truncate">{idx + 1}. {s.fullName}</p>
                    <p className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                      NIS: {s.nis}
                    </p>
                  </div>
                  {hasNote && (
                    <span className={`h-2 w-2 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} title="Catatan terisi" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Note editor form */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Input Catatan Rapor</span>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                {activeStudent?.fullName}
              </h3>
            </div>

            {/* Quick Inspiration Templates */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" /> Template:
              </span>
              <button
                type="button"
                onClick={() => applyTemplate('sangat_baik')}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Sangat Baik
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('berkembang')}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Berkembang
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('butuh_motivasi')}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Perlu Dorongan
              </button>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                1. Catatan Perkembangan Belajar Akademis
              </label>
              <textarea
                rows={3}
                required
                value={formData.noteLearning}
                onChange={(e) => setFormData({ ...formData, noteLearning: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                2. Catatan Sikap, Karakter & Kebiasaan Positif
              </label>
              <textarea
                rows={3}
                required
                value={formData.noteAttitude}
                onChange={(e) => setFormData({ ...formData, noteAttitude: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                3. Saran & Rekomendasi untuk Orang Tua & Siswa
              </label>
              <textarea
                rows={3}
                required
                value={formData.noteRecommendation}
                onChange={(e) => setFormData({ ...formData, noteRecommendation: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
              >
                <Save className="h-4 w-4" />
                Simpan Catatan Siswa Ini
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
