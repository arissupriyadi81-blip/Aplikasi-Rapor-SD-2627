/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * E-Rapor SD AJ - Kurikulum Merdeka Business Logic & Pure Calculation Rules
 */

export interface TPItem {
  id: string;
  code: string;
  description: string;
  order: number;
}

export interface StudentScoreInput {
  studentId: string;
  formatifScores: Record<string, number | null>; // tpId -> score
  sumatifMateriScores: Record<string, number | null>; // testId -> score
  sumatifAkhirSemester: number | null;
}

export interface FinalGradeResult {
  studentId: string;
  formatifAverage: number | null;
  sumatifMateriAverage: number | null;
  sumatifAkhir: number | null;
  finalScore: number | null;
  highestAchievedTpIds: string[];
  lowestAchievedTpIds: string[];
  achievementDescription: string;
  isComplete: boolean;
}

/**
 * Calculates weighted final score and generates Kurikulum Merdeka achievement descriptions.
 * Standard formula for SD Kurikulum Merdeka:
 * - Nilai Akhir (NA) = (Rata-rata Formatif * bobotFormatif + Rata-rata Sumatif LM * bobotSumatifLM + Sumatif Akhir * bobotSAS) / totalBobot
 * Defaults: Formatif = 40%, Sumatif Materi = 40%, Sumatif Akhir Semester = 20%
 */
export function calculateKurikulumMerdekaGrade(
  studentInput: StudentScoreInput,
  tps: TPItem[],
  weights = { formatif: 40, sumatifMateri: 40, sumatifAkhir: 20 }
): FinalGradeResult {
  const { studentId, formatifScores, sumatifMateriScores, sumatifAkhirSemester } = studentInput;

  // 1. Calculate Formatif Average
  const validFormatif = Object.entries(formatifScores)
    .filter(([_, val]) => val !== null && val !== undefined && !isNaN(val) && val >= 0)
    .map(([tpId, val]) => ({ tpId, score: Number(val) }));

  const formatifAverage = validFormatif.length > 0
    ? Math.round(validFormatif.reduce((sum, item) => sum + item.score, 0) / validFormatif.length)
    : null;

  // 2. Calculate Sumatif Lingkup Materi Average
  const validSumatifMateri = Object.values(sumatifMateriScores)
    .filter((val): val is number => val !== null && val !== undefined && !isNaN(val) && val >= 0);

  const sumatifMateriAverage = validSumatifMateri.length > 0
    ? Math.round(validSumatifMateri.reduce((sum, score) => sum + score, 0) / validSumatifMateri.length)
    : null;

  // 3. Sumatif Akhir Semester
  const sumatifAkhir = (sumatifAkhirSemester !== null && sumatifAkhirSemester !== undefined && !isNaN(sumatifAkhirSemester) && sumatifAkhirSemester >= 0)
    ? Number(sumatifAkhirSemester)
    : null;

  // Check completeness: at least formatif and sumatif materi exist
  const isComplete = formatifAverage !== null && sumatifMateriAverage !== null;

  let finalScore: number | null = null;
  if (isComplete) {
    const totalWeight = weights.formatif + weights.sumatifMateri + (sumatifAkhir !== null ? weights.sumatifAkhir : 0);
    const weightedSum =
      (formatifAverage! * weights.formatif) +
      (sumatifMateriAverage! * weights.sumatifMateri) +
      (sumatifAkhir !== null ? sumatifAkhir * weights.sumatifAkhir : 0);
    
    finalScore = Math.round(weightedSum / totalWeight);
  }

  // 4. Identify highest and lowest mastered TPs for descriptive evaluation
  let highestAchievedTpIds: string[] = [];
  let lowestAchievedTpIds: string[] = [];
  let achievementDescription = 'Belum ada penilaian yang dicatat.';

  if (validFormatif.length > 0) {
    const sorted = [...validFormatif].sort((a, b) => b.score - a.score);
    const maxScore = sorted[0].score;
    const minScore = sorted[sorted.length - 1].score;

    // Highest mastered (score >= 75 and matching maxScore or top scores)
    highestAchievedTpIds = sorted.filter(item => item.score >= 75 && item.score >= maxScore - 5).map(i => i.tpId);
    
    // Lowest or needing guidance (score < 75 or lowest score when discrepancy is notable)
    lowestAchievedTpIds = sorted.filter(item => item.score < 75 || (minScore < 70 && item.score === minScore)).map(i => i.tpId);

    // Build Kurikulum Merdeka compliant sentence
    const highestTps = tps.filter(t => highestAchievedTpIds.includes(t.id));
    const lowestTps = tps.filter(t => lowestAchievedTpIds.includes(t.id));

    const parts: string[] = [];
    if (highestTps.length > 0) {
      const highestDescs = highestTps.map(t => t.description.toLowerCase()).join(' serta ');
      parts.push(`Menunjukkan penguasaan yang sangat baik dalam ${highestDescs}.`);
    } else if (finalScore !== null && finalScore >= 70) {
      parts.push(`Menunjukkan penguasaan materi yang cukup baik secara umum.`);
    }

    if (lowestTps.length > 0) {
      const lowestDescs = lowestTps.map(t => t.description.toLowerCase()).join(' serta ');
      parts.push(`Perlu bimbingan dan pendampingan lebih lanjut dalam hal ${lowestDescs}.`);
    } else {
      parts.push(`Mampu mempertahankan capaian pembelajaran dengan konsisten.`);
    }

    achievementDescription = parts.join(' ');
  }

  return {
    studentId,
    formatifAverage,
    sumatifMateriAverage,
    sumatifAkhir,
    finalScore,
    highestAchievedTpIds,
    lowestAchievedTpIds,
    achievementDescription,
    isComplete,
  };
}

/**
 * Calculates rank for a cohort of students.
 * Incomplete students or students with no score are placed at the bottom without skewing ranks.
 */
export interface StudentRankItem {
  studentId: string;
  studentName: string;
  totalScore: number;
  averageScore: number;
  rank: number;
  completedSubjectsCount: number;
  totalSubjectsCount: number;
  isComplete: boolean;
}

export function calculateCohortRanking(
  students: { id: string; name: string }[],
  subjectScoresByStudent: Record<string, { [subjectId: string]: number | null }>,
  subjectIds: string[]
): StudentRankItem[] {
  const result: StudentRankItem[] = students.map(student => {
    const scores = subjectScoresByStudent[student.id] || {};
    let sum = 0;
    let count = 0;

    subjectIds.forEach(subId => {
      const s = scores[subId];
      if (s !== null && s !== undefined && !isNaN(s) && s >= 0) {
        sum += s;
        count++;
      }
    });

    const isComplete = count === subjectIds.length && subjectIds.length > 0;
    const averageScore = count > 0 ? parseFloat((sum / count).toFixed(2)) : 0;

    return {
      studentId: student.id,
      studentName: student.name,
      totalScore: sum,
      averageScore,
      rank: 0,
      completedSubjectsCount: count,
      totalSubjectsCount: subjectIds.length,
      isComplete,
    };
  });

  // Sort by completed first, then average score descending, then totalScore descending
  result.sort((a, b) => {
    if (a.isComplete !== b.isComplete) {
      return a.isComplete ? -1 : 1;
    }
    if (b.averageScore !== a.averageScore) {
      return b.averageScore - a.averageScore;
    }
    return b.totalScore - a.totalScore;
  });

  // Assign standard competition ranking (1, 2, 2, 4...)
  let currentRank = 1;
  for (let i = 0; i < result.length; i++) {
    if (i > 0 && result[i].averageScore === result[i - 1].averageScore && result[i].isComplete === result[i - 1].isComplete) {
      result[i].rank = result[i - 1].rank;
    } else {
      result[i].rank = currentRank;
    }
    currentRank++;
  }

  return result;
}

/**
 * Validates attendance inputs ensuring non-negative integers.
 */
export function validateAttendance(sakit: number, izin: number, alpa: number): { valid: boolean; total: number; message?: string } {
  if (sakit < 0 || izin < 0 || alpa < 0) {
    return { valid: false, total: 0, message: 'Jumlah kehadiran tidak boleh bernilai negatif.' };
  }
  const total = Number(sakit) + Number(izin) + Number(alpa);
  return { valid: true, total };
}

/**
 * Indonesian date formatting (e.g. "29 Oktober 2026")
 */
export function formatIndonesianDate(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * 8 Fokus Dimensi Profil Lulusan Kokurikuler
 */
export const KOKURIKULER_DIMENSIONS = [
  'Keimanan dan Ketakwaan Terhadap Tuhan',
  'Kewargaan',
  'Penalaran Kritis',
  'Kreativitas',
  'Kolaborasi',
  'Kemandirian',
  'Kesehatan',
  'Komunikasi'
] as const;

export type KokurikulerDimension = typeof KOKURIKULER_DIMENSIONS[number];

/**
 * Nilai Asesmen Kokurikuler (SB, B, C, K)
 */
export type KokurikulerGrade = 'SB' | 'B' | 'C' | 'K';

export const KOKURIKULER_GRADES: Record<KokurikulerGrade, { label: string; badgeClass: string; desc: string }> = {
  SB: {
    label: 'Sangat Baik',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
    desc: 'Peserta didik sangat aktif, konsisten, dan menunjukkan inisiatif tinggi serta keteladanan.'
  },
  B: {
    label: 'Baik',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300',
    desc: 'Peserta didik telah mencapai kriteria yang diharapkan dengan pemahaman dan keterlibatan yang mantap.'
  },
  C: {
    label: 'Cukup',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
    desc: 'Peserta didik mulai menunjukkan keterlibatan namun masih memerlukan pembiasaan dan dorongan.'
  },
  K: {
    label: 'Kurang',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300',
    desc: 'Peserta didik masih memerlukan pendampingan intensif dan bimbingan berkelanjutan.'
  },
};

/**
 * Otomatis menghasilkan catatan guru untuk asesmen kokurikuler
 */
export function generateCocurricularTeacherNote(
  studentName: string,
  dimension: string,
  theme: string,
  activityName: string,
  grade: KokurikulerGrade
): string {
  const shortName = studentName ? studentName.split(' ')[0] : 'Peserta didik';

  switch (grade) {
    case 'SB':
      return `Ananda ${shortName} menunjukkan capaian Sangat Baik dalam dimensi ${dimension} pada kegiatan tema "${theme}" (${activityName}). Sangat antusias, kreatif, berinisiatif tinggi, dan senantiasa menjadi teladan positif bagi teman sebayanya.`;
    case 'B':
      return `Ananda ${shortName} menunjukkan capaian Baik dalam dimensi ${dimension} pada kegiatan tema "${theme}" (${activityName}). Mampu bekerja sama dengan tertib, bertanggung jawab, dan menyelesaikan tahapan aktivitas secara optimal.`;
    case 'C':
      return `Ananda ${shortName} menunjukkan capaian Cukup dalam dimensi ${dimension} pada kegiatan tema "${theme}" (${activityName}). Mulai aktif berkontribusi, namun masih memerlukan dorongan dan pembiasaan agar lebih percaya diri.`;
    case 'K':
      return `Ananda ${shortName} masih memerlukan bimbingan intensif dan pendampingan berkelanjutan dalam dimensi ${dimension} pada kegiatan tema "${theme}" (${activityName}) agar dapat lebih berpartisipasi aktif.`;
    default:
      return `Menyelesaikan aktivitas kokurikuler dengan keikutsertaan yang baik.`;
  }
}

/**
 * Mengambil tanggal pembagian rapor sesuai semester aktif (Semester 1 atau Semester 2)
 */
export function getReportDateForSemester(
  profile: { reportDateSem1?: string; reportDateSem2?: string; reportDate?: string },
  semesterNumber: 1 | 2
): string {
  if (semesterNumber === 1) {
    return profile.reportDateSem1 || profile.reportDate || '2026-12-19';
  }
  return profile.reportDateSem2 || profile.reportDate || '2027-06-25';
}

/**
 * Format label kategori ekstrakurikuler (Wajib atau Pilihan)
 */
export function getExtracurricularCategoryLabel(category: 'wajib' | 'pilihan'): string {
  return category === 'wajib' ? 'Wajib' : 'Pilihan';
}
