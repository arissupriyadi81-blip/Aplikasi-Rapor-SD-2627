/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TypeScript definitions for E-Rapor SD AJ (IAS Al-Jannah)
 */

import { KokurikulerDimension, KokurikulerGrade } from '../utils/rules.ts';
export type { KokurikulerDimension, KokurikulerGrade };

export type UserRole = 'admin' | 'kepala_sekolah' | 'guru_mapel' | 'wali_kelas';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  email: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
}

export interface SchoolProfile {
  id: string;
  schoolName: string;
  npsn: string;
  nss: string;
  foundationName: string;
  address: string;
  village: string;
  district: string;
  regency: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
  headmasterName: string;
  headmasterNip: string;
  reportPlace: string;
  reportDateSem1: string; // YYYY-MM-DD (Semester 1 / Ganjil)
  reportDateSem2: string; // YYYY-MM-DD (Semester 2 / Genap)
  reportDate?: string; // Fallback compatibility
}

export interface AcademicYear {
  id: string;
  yearName: string; // e.g. "2026/2027"
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export interface Semester {
  id: string;
  academicYearId: string;
  semesterNumber: 1 | 2;
  semesterName: string; // "Semester Ganjil" / "Semester Genap"
  isActive: boolean;
  isInputOpen: boolean;
  isFinalized: boolean;
}

export type TeacherPosition = 'Wali Kelas' | 'Guru Kelas' | 'Guru Bidang' | 'Guru Pendamping';

export interface Teacher {
  id: string;
  userId?: string;
  nip?: string;
  nuptk?: string;
  nik?: string;
  fullName: string;
  gender: 'L' | 'P';
  phone: string;
  position: TeacherPosition | string; // Jabatan: Wali Kelas, Guru Kelas, Guru Bidang, Guru Pendamping
  employmentStatus?: 'GTY' | 'GTT' | 'PNS' | 'PPPK'; // Legacy optional
  isActive: boolean;
  assignedHomeroomClassId?: string;
  assignedSubjectIds?: string[];
}

export type Phase = 'A' | 'B' | 'C';

export interface ClassGroup {
  id: string;
  academicYearId: string;
  className: string; // e.g. "5A - Ibnu Battuta"
  gradeLevel: number; // 1 to 6
  phase: Phase;
  homeroomTeacherId: string;
  capacity: number;
  isActive: boolean;
}

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  fullName: string;
  gender: 'L' | 'P';
  birthPlace: string;
  birthDate: string;
  religion: string;
  // Data Orang Tua & Wali Lengkap
  parentFather: string;
  fatherJob?: string;
  fatherEducation?: string;
  parentMother: string;
  motherJob?: string;
  motherEducation?: string;
  guardianName?: string;
  guardianJob?: string;
  guardianRelation?: string;
  parentPhone: string;
  address: string;
  admissionYear: string;
  status: 'aktif' | 'pindah' | 'lulus' | 'keluar';
  currentClassId: string;
  rollNumber?: number;
}

export type SubjectCategory = 'wajib' | 'pilihan';

export interface Subject {
  id: string;
  subjectCode: string;
  subjectName: string;
  category: SubjectCategory; // Keterangan: Wajib atau Pilihan (menggantikan kelompok umum/agama)
  subjectGroup?: 'umum' | 'agama' | 'mulok' | 'khusus'; // Compatibility alias
  targetGradeMin: number;
  targetGradeMax: number;
  description: string;
  isActive: boolean;
}

export interface LearningOutcomeCP {
  id: string;
  academicYearId: string;
  phase: Phase;
  subjectId: string;
  element: string;
  cpDescription: string;
  curriculumVersion: string;
  isActive: boolean;
}

export interface LearningObjectiveTP {
  id: string;
  cpId: string;
  tpCode: string; // e.g. "TP 5.1"
  tpDescription: string;
  tpOrder: number;
  semester: 1 | 2;
  weight: number;
  isActive: boolean;
}

export interface StudentAssessment {
  id: string;
  classId: string;
  subjectId: string;
  studentId: string;
  academicYearId: string;
  semesterId: string;
  formatifScores: Record<string, number | null>; // tpId -> score
  sumatifMateriScores: Record<string, number | null>; // testId/scopeId -> score
  sumatifAkhir: number | null;
  formatifAvg: number | null;
  sumatifMateriAvg: number | null;
  finalScore: number | null;
  highestTpIds: string[];
  lowestTpIds: string[];
  achievementDesc: string;
  status: 'draft' | 'submitted' | 'approved' | 'final';
  updatedAt: string;
}

export type ExtracurricularCategory = 'wajib' | 'pilihan';

export interface Extracurricular {
  id: string;
  name: string;
  category: ExtracurricularCategory; // Kategori: Wajib atau Pilihan
  coachName: string; // Nama Pembimbing (Guru/Pelatih)
  coachTeacherId?: string; // Optional reference
  description?: string;
  schedule?: string;
  isActive: boolean;
}

export interface ExtracurricularMember {
  id: string;
  extracurricularId: string;
  studentId: string;
  academicYearId: string;
  semesterId: string;
  gradePredicate: 'A' | 'B' | 'C' | 'D';
  description: string;
}

// Kokurikuler (Rubrik dan Asesmen)
export interface CocurricularActivity {
  id: string;
  name: string;
  theme: string; // Tema kegiatan
  objectives: string; // Tujuan kegiatan
  activityForm: string; // Bentuk aktivitas
  relatedSubjects: string[]; // Mata pelajaran terkait
  targetPhase: Phase;
  coordinatorTeacherId: string;
  status: 'aktif' | 'selesai' | 'arsip';
}

export interface CocurricularRubric {
  id: string;
  activityId: string;
  dimension: KokurikulerDimension | string; // 8 Fokus Dimensi Profil Lulusan
  theme: string; // Tema
  objectives?: string; // Tujuan
  objective?: string; // Alias tujuan
  activityForm: string; // Bentuk aktivitas
  relatedSubjects: string[]; // Mata pelajaran terkait
  indicator?: string; // Rincian indikator
}

export interface CocurricularAssessment {
  id: string;
  activityId: string;
  rubricId: string;
  studentId: string;
  semesterId: string;
  grade?: KokurikulerGrade; // SB, B, C, K
  achievementLevel?: KokurikulerGrade; // Alias untuk grade
  teacherNote: string; // Catatan guru otomatis yang dapat disesuaikan
}

export interface StudentAttendance {
  id: string;
  studentId: string;
  classId: string;
  academicYearId: string;
  semesterId: string;
  sakit: number;
  izin: number;
  alpa: number;
  notes?: string;
}

export interface HomeroomNote {
  id: string;
  studentId: string;
  classId: string;
  academicYearId: string;
  semesterId: string;
  noteLearning: string;
  noteAttitude: string;
  noteRecommendation: string;
  status: 'draft' | 'final';
}

export interface StudentAchievement {
  id: string;
  studentId: string;
  achievementName: string;
  category: 'akademik' | 'non_akademik';
  level: 'sekolah' | 'kecamatan' | 'kabupaten_kota' | 'provinsi' | 'nasional' | 'internasional';
  organizer: string;
  eventDate: string;
  rankOrAward: string;
  description: string;
  certificateUrl?: string;
  verificationStatus: 'menunggu' | 'terverifikasi' | 'ditolak';
}

export interface ReportFinalization {
  id: string;
  classId: string;
  academicYearId: string;
  semesterId: string;
  status: 'draft' | 'review' | 'disetujui' | 'final_terkunci';
  finalizedBy?: string;
  finalizedAt?: string;
  unlockedBy?: string;
  unlockedAt?: string;
  unlockReason?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}
