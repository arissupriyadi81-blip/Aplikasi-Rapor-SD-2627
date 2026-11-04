import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateKurikulumMerdekaGrade,
  calculateCohortRanking,
  validateAttendance,
  formatIndonesianDate,
  KOKURIKULER_DIMENSIONS,
  KOKURIKULER_GRADES,
  generateCocurricularTeacherNote,
  getReportDateForSemester,
  getExtracurricularCategoryLabel,
  TPItem,
  StudentScoreInput
} from './rules.ts';

test('calculateKurikulumMerdekaGrade computes weighted score correctly and identifies highest/lowest TPs', () => {
  const tps: TPItem[] = [
    { id: 'tp-1', code: 'TP 1.1', description: 'Memahami pecahan senilai', order: 1 },
    { id: 'tp-2', code: 'TP 1.2', description: 'Menjumlahkan bilangan desimal', order: 2 },
    { id: 'tp-3', code: 'TP 1.3', description: 'Menyelesaikan soal cerita pecahan', order: 3 },
  ];

  const input: StudentScoreInput = {
    studentId: 'std-1',
    formatifScores: {
      'tp-1': 95,
      'tp-2': 90,
      'tp-3': 60,
    },
    sumatifMateriScores: {
      'lm-1': 85,
      'lm-2': 85,
    },
    sumatifAkhirSemester: 80,
  };

  const result = calculateKurikulumMerdekaGrade(input, tps);
  assert.equal(result.isComplete, true);
  assert.ok(result.finalScore !== null && result.finalScore >= 80 && result.finalScore <= 85);
  assert.ok(result.highestAchievedTpIds.includes('tp-1'));
  assert.ok(result.lowestAchievedTpIds.includes('tp-3'));
});

test('KOKURIKULER_DIMENSIONS contains all 8 required graduate profile dimensions', () => {
  assert.equal(KOKURIKULER_DIMENSIONS.length, 8);
  assert.ok(KOKURIKULER_DIMENSIONS.includes('Keimanan dan Ketakwaan Terhadap Tuhan'));
  assert.ok(KOKURIKULER_DIMENSIONS.includes('Kewargaan'));
  assert.ok(KOKURIKULER_DIMENSIONS.includes('Penalaran Kritis'));
  assert.ok(KOKURIKULER_DIMENSIONS.includes('Kreativitas'));
  assert.ok(KOKURIKULER_DIMENSIONS.includes('Kolaborasi'));
  assert.ok(KOKURIKULER_DIMENSIONS.includes('Kemandirian'));
  assert.ok(KOKURIKULER_DIMENSIONS.includes('Kesehatan'));
  assert.ok(KOKURIKULER_DIMENSIONS.includes('Komunikasi'));
});

test('KOKURIKULER_GRADES supports SB, B, C, and K', () => {
  assert.ok(KOKURIKULER_GRADES['SB']);
  assert.ok(KOKURIKULER_GRADES['B']);
  assert.ok(KOKURIKULER_GRADES['C']);
  assert.ok(KOKURIKULER_GRADES['K']);
  assert.equal(KOKURIKULER_GRADES['SB'].label, 'Sangat Baik');
  assert.equal(KOKURIKULER_GRADES['K'].label, 'Kurang');
});

test('generateCocurricularTeacherNote generates teacher note automatically', () => {
  const noteSB = generateCocurricularTeacherNote(
    'Muhammad Rayyan',
    'Kolaborasi',
    'Gaya Hidup Berkelanjutan',
    'Kebun Kompos Organik',
    'SB'
  );
  assert.ok(noteSB.includes('Muhammad'));
  assert.ok(noteSB.includes('Kolaborasi'));
  assert.ok(noteSB.includes('Sangat Baik'));

  const noteK = generateCocurricularTeacherNote(
    'Budi Santoso',
    'Kemandirian',
    'Kewirausahaan Cilik',
    'Pameran Karya',
    'K'
  );
  assert.ok(noteK.includes('Budi'));
  assert.ok(noteK.includes('bimbingan intensif'));
});

test('getReportDateForSemester returns correct date for Semester 1 and Semester 2', () => {
  const profile = {
    reportDateSem1: '2026-12-19',
    reportDateSem2: '2027-06-25',
    reportDate: '2026-12-18',
  };

  assert.equal(getReportDateForSemester(profile, 1), '2026-12-19');
  assert.equal(getReportDateForSemester(profile, 2), '2027-06-25');
  assert.equal(formatIndonesianDate('2026-12-19'), '19 Desember 2026');
  assert.equal(formatIndonesianDate('2027-06-25'), '25 Juni 2027');
});

test('getExtracurricularCategoryLabel formats Wajib and Pilihan correctly', () => {
  assert.equal(getExtracurricularCategoryLabel('wajib'), 'Wajib');
  assert.equal(getExtracurricularCategoryLabel('pilihan'), 'Pilihan');
});

