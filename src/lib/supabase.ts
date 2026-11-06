/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import {
  SchoolProfile,
  AcademicYear,
  Semester,
  Teacher,
  ClassGroup,
  Student,
  Subject,
  StudentAssessment,
  Extracurricular,
  ExtracurricularMember,
  CocurricularActivity,
  CocurricularRubric,
  CocurricularAssessment,
  StudentAttendance,
  HomeroomNote,
  StudentAchievement,
  AuditLog,
} from '../types/index.ts';

const STORAGE_KEY_SUPABASE = 'erapor_sd_aj_supabase_config';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Mendapatkan konfigurasi Supabase saat ini (dari localStorage atau env vars)
 */
export const getSupabaseConfig = (): SupabaseConfig => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://wexcmfzhtfhdfpqlsyac.supabase.co';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_qciJ8BN3834AY3zxClV3ow_SlUw9ptb';

  try {
    const saved = localStorage.getItem(STORAGE_KEY_SUPABASE);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        url: parsed.url || envUrl,
        anonKey: parsed.anonKey || envKey,
      };
    }
  } catch {
    // Abaikan error parsing
  }

  return {
    url: envUrl,
    anonKey: envKey,
  };
};

/**
 * Menyimpan konfigurasi Supabase ke penyimpanan lokal
 */
export const saveSupabaseConfig = (config: SupabaseConfig): void => {
  localStorage.setItem(STORAGE_KEY_SUPABASE, JSON.stringify(config));
  cachedClient = null;
};

let cachedClient: SupabaseClient | null = null;

/**
 * Menginisialisasi atau mengambil instans Supabase Client
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  if (cachedClient) return cachedClient;

  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey || !url.startsWith('http')) {
    return null;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    return cachedClient;
  } catch (err) {
    console.error('Gagal membuat client Supabase:', err);
    return null;
  }
};

/**
 * Menguji koneksi aktif ke Supabase
 */
export const testSupabaseConnection = async (
  testUrl?: string,
  testKey?: string
): Promise<{ success: boolean; message: string; tableCount?: number }> => {
  const url = testUrl || getSupabaseConfig().url;
  const anonKey = testKey || getSupabaseConfig().anonKey;

  if (!url || !anonKey) {
    return {
      success: false,
      message: 'Supabase URL dan Anon Key belum diisi.',
    };
  }

  try {
    const client = createClient(url, anonKey);
    const { data, error } = await client.from('school_profiles').select('id, school_name').limit(1);

    if (error) {
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Terkoneksi ke Supabase! Catatan: Tabel database belum dibuat. Silakan jalankan Query SQL di SQL Editor.',
          tableCount: 0,
        };
      }
      return {
        success: false,
        message: `Koneksi ditolak Supabase: ${error.message} (${error.code || 'Unauthorized'})`,
      };
    }

    return {
      success: true,
      message: `Berhasil terhubung ke Supabase! Ditemukan data sekolah: ${data?.[0]?.school_name || 'Tabel siap digunakan'}.`,
      tableCount: data ? 1 : 0,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal menghubungkan ke server: ${err?.message || 'Periksa URL proyek'}`,
    };
  }
};

// ==============================================================================
// MAPPERS: CONVERT BETWEEN POSTGRESQL (snake_case) & TYPESCRIPT (camelCase)
// ==============================================================================

export const mapSchoolProfileFromDb = (row: any): SchoolProfile => ({
  id: row.id || 'sch-1',
  schoolName: row.school_name || 'SD IAS Al-Jannah (Islamic, Nature & Science School)',
  npsn: row.npsn || '20108390',
  nss: row.nss || '-',
  foundationName: row.foundation_name || 'Yayasan Al-Jannah Pondok Ranggon',
  address: row.address || 'Jl. Jambore No. 4, Harjamukti, Pondok Ranggon',
  village: row.village || 'Harjamukti',
  district: row.district || 'Cimanggis',
  regency: row.regency || 'Depok - Jakarta Timur',
  province: row.province || 'Jawa Barat',
  postalCode: row.postal_code || '16454',
  phone: row.phone || '(021) 8774-1234',
  email: row.email || 'info@sekolah-aljannah.sch.id',
  website: row.website || 'https://sekolah-aljannah.sch.id',
  logoUrl: row.logo_url || '/logo-aljannah-emblem.png',
  headmasterName: row.headmaster_name || 'Siti Sriyati, S.Ag',
  headmasterNip: row.headmaster_nip || '198105152005011004',
  reportPlace: row.report_place || 'Depok',
  reportDateSem1: row.report_date_sem1 || '2026-12-19',
  reportDateSem2: row.report_date_sem2 || '2027-06-25',
  reportDate: row.report_date || row.report_date_sem1 || '2026-12-19',
});

export const mapSchoolProfileToDb = (sp: SchoolProfile) => ({
  id: sp.id || 'sch-1',
  school_name: sp.schoolName,
  npsn: sp.npsn,
  nss: sp.nss,
  foundation_name: sp.foundationName,
  address: sp.address,
  village: sp.village,
  district: sp.district,
  regency: sp.regency,
  province: sp.province,
  postal_code: sp.postalCode,
  phone: sp.phone,
  email: sp.email,
  website: sp.website,
  logo_url: sp.logoUrl,
  headmaster_name: sp.headmasterName,
  headmaster_nip: sp.headmasterNip,
  report_place: sp.reportPlace,
  report_date_sem1: sp.reportDateSem1,
  report_date_sem2: sp.reportDateSem2,
  report_date: sp.reportDate || sp.reportDateSem1,
});

export const mapAcademicYearFromDb = (row: any): AcademicYear => ({
  id: row.id,
  yearName: row.year_name,
  isActive: Boolean(row.is_active),
  startDate: row.start_date || '',
  endDate: row.end_date || '',
});

export const mapSemesterFromDb = (row: any): Semester => ({
  id: row.id,
  academicYearId: row.academic_year_id,
  semesterNumber: row.semester_number,
  semesterName: row.semester_name,
  isActive: Boolean(row.is_active),
  isInputOpen: true,
  isFinalized: false,
});

export const mapTeacherFromDb = (row: any): Teacher => ({
  id: row.id,
  nip: row.nip || '',
  fullName: row.full_name,
  gender: row.gender || 'L',
  phone: row.phone || '',
  position: row.role_title === 'wali_kelas' ? 'Wali Kelas' : row.role_title === 'guru_bidang' ? 'Guru Bidang' : 'Guru Kelas',
  isActive: true,
  assignedHomeroomClassId: row.assigned_class_id || undefined,
  assignedSubjectIds: Array.isArray(row.subjects_taught) ? row.subjects_taught : [],
});

export const mapTeacherToDb = (t: Teacher) => ({
  id: t.id,
  nip: t.nip || null,
  full_name: t.fullName,
  gender: t.gender,
  role_title: t.position === 'Wali Kelas' ? 'wali_kelas' : t.position === 'Guru Bidang' ? 'guru_bidang' : 'guru_kelas',
  phone: t.phone || null,
  is_homeroom_teacher: t.position === 'Wali Kelas' || Boolean(t.assignedHomeroomClassId),
  assigned_class_id: t.assignedHomeroomClassId || null,
  is_subject_teacher: (t.assignedSubjectIds && t.assignedSubjectIds.length > 0) || false,
  subjects_taught: t.assignedSubjectIds || [],
});

export const mapClassFromDb = (row: any): ClassGroup => ({
  id: row.id,
  className: row.class_name,
  gradeLevel: Number(row.grade) || 5,
  phase: row.phase || (Number(row.grade) <= 2 ? 'A' : Number(row.grade) <= 4 ? 'B' : 'C'),
  academicYearId: row.academic_year_id || 'ay-2026',
  homeroomTeacherId: row.homeroom_teacher_id || '',
  capacity: Number(row.max_capacity) || 30,
  isActive: true,
});

export const mapClassToDb = (c: ClassGroup) => ({
  id: c.id,
  class_name: c.className,
  grade: c.gradeLevel,
  phase: c.phase,
  academic_year_id: c.academicYearId || 'ay-2026',
  homeroom_teacher_id: c.homeroomTeacherId || null,
  max_capacity: c.capacity || 30,
});

export const mapSubjectFromDb = (row: any): Subject => ({
  id: row.id,
  subjectCode: row.subject_code,
  subjectName: row.subject_name,
  category: row.category === 'muatan_lokal' || row.category === 'pilihan' ? 'pilihan' : 'wajib',
  targetGradeMin: 1,
  targetGradeMax: 6,
  description: row.subject_name,
  isActive: Boolean(row.is_active ?? true),
});

export const mapSubjectToDb = (s: Subject) => ({
  id: s.id,
  subject_code: s.subjectCode,
  subject_name: s.subjectName,
  category: s.category,
  is_active: s.isActive ?? true,
});

export const mapStudentFromDb = (row: any): Student => ({
  id: row.id,
  nis: row.nis,
  nisn: row.nisn,
  fullName: row.full_name,
  gender: row.gender,
  birthPlace: row.birth_place || 'Jakarta',
  birthDate: row.birth_date || '2016-01-01',
  religion: row.religion || 'Islam',
  currentClassId: row.current_class_id || '',
  address: row.address || '',
  parentFather: row.parent_father || '',
  fatherJob: row.father_job || '',
  fatherEducation: row.father_education || '',
  parentMother: row.parent_mother || '',
  motherJob: row.mother_job || '',
  motherEducation: row.mother_education || '',
  guardianName: row.guardian_name || '',
  guardianJob: row.guardian_job || '',
  guardianRelation: row.guardian_relation || '',
  parentPhone: row.parent_phone || '',
  admissionYear: row.entry_year || '2022',
  status: row.status || 'aktif',
});

export const mapStudentToDb = (s: Student) => ({
  id: s.id,
  nis: s.nis,
  nisn: s.nisn,
  full_name: s.fullName,
  gender: s.gender,
  birth_place: s.birthPlace || null,
  birth_date: s.birthDate || null,
  religion: s.religion || 'Islam',
  current_class_id: s.currentClassId || null,
  current_grade: 5,
  address: s.address || null,
  parent_father: s.parentFather || null,
  father_job: s.fatherJob || null,
  father_education: s.fatherEducation || null,
  parent_mother: s.parentMother || null,
  mother_job: s.motherJob || null,
  mother_education: s.motherEducation || null,
  guardian_name: s.guardianName || null,
  guardian_job: s.guardianJob || null,
  guardian_relation: s.guardianRelation || null,
  parent_phone: s.parentPhone || null,
  entry_year: s.admissionYear || '2022',
  status: s.status || 'aktif',
});

export const mapAssessmentFromDb = (row: any): StudentAssessment => {
  const meta = row.formative_scores && typeof row.formative_scores === 'object' && !Array.isArray(row.formative_scores)
    ? row.formative_scores
    : {};

  return {
    id: row.id,
    studentId: row.student_id,
    subjectId: row.subject_id,
    semesterId: row.semester_id,
    academicYearId: row.academic_year_id || 'ay-2026',
    classId: meta.classId || row.class_id || '',
    formatifScores: meta.formatifScores || {},
    sumatifMateriScores: meta.sumatifMateriScores || {},
    sumatifAkhir: meta.sumatifAkhir ?? null,
    formatifAvg: meta.formatifAvg ?? null,
    sumatifMateriAvg: meta.sumatifMateriAvg ?? null,
    finalScore: row.final_score !== null && row.final_score !== undefined ? Number(row.final_score) : (meta.finalScore ?? null),
    highestTpIds: meta.highestTpIds || [],
    lowestTpIds: meta.lowestTpIds || [],
    achievementDesc: row.highest_tp_desc || meta.achievementDesc || '',
    status: meta.status || 'draft',
    updatedAt: row.updated_at || new Date().toISOString(),
  };
};

export const mapAssessmentToDb = (a: StudentAssessment) => ({
  id: a.id,
  student_id: a.studentId,
  subject_id: a.subjectId,
  semester_id: a.semesterId,
  academic_year_id: a.academicYearId || 'ay-2026',
  final_score: a.finalScore,
  highest_tp_desc: a.achievementDesc || null,
  formative_scores: {
    classId: a.classId,
    formatifScores: a.formatifScores,
    sumatifMateriScores: a.sumatifMateriScores,
    sumatifAkhir: a.sumatifAkhir,
    formatifAvg: a.formatifAvg,
    sumatifMateriAvg: a.sumatifMateriAvg,
    finalScore: a.finalScore,
    highestTpIds: a.highestTpIds,
    lowestTpIds: a.lowestTpIds,
    achievementDesc: a.achievementDesc,
    status: a.status,
  },
  summative_scores: [],
});

export const mapExtracurricularFromDb = (row: any): Extracurricular => ({
  id: row.id,
  name: row.name,
  category: row.category === 'wajib' ? 'wajib' : 'pilihan',
  coachName: row.coach_name || 'Pembimbing Sekolah',
  description: row.description || '',
  schedule: row.schedule || '',
  isActive: true,
});

export const mapExtracurricularToDb = (e: Extracurricular) => ({
  id: e.id,
  name: e.name,
  category: e.category,
  coach_name: e.coachName,
  description: e.description || null,
  schedule: e.schedule || null,
});

export const mapExtracurricularMemberFromDb = (row: any): ExtracurricularMember => ({
  id: row.id,
  extracurricularId: row.extracurricular_id,
  studentId: row.student_id,
  semesterId: row.semester_id,
  academicYearId: row.academic_year_id || 'ay-2026',
  gradePredicate: row.grade_predicate || 'A',
  description: row.description || '',
});

export const mapExtracurricularMemberToDb = (m: ExtracurricularMember) => ({
  id: m.id,
  extracurricular_id: m.extracurricularId,
  student_id: m.studentId,
  semester_id: m.semesterId,
  academic_year_id: m.academicYearId || 'ay-2026',
  grade_predicate: m.gradePredicate,
  description: m.description || null,
});

export const mapAttendanceFromDb = (row: any): StudentAttendance => ({
  id: row.id,
  studentId: row.student_id,
  classId: '',
  academicYearId: row.academic_year_id || 'ay-2026',
  semesterId: row.semester_id,
  sakit: Number(row.sakit) || 0,
  izin: Number(row.izin) || 0,
  alpa: Number(row.alpa) || 0,
  notes: row.note || '',
});

export const mapAttendanceToDb = (att: StudentAttendance) => ({
  id: att.id,
  student_id: att.studentId,
  semester_id: att.semesterId,
  academic_year_id: att.academicYearId || 'ay-2026',
  sakit: att.sakit || 0,
  izin: att.izin || 0,
  alpa: att.alpa || 0,
  note: att.notes || null,
});

export const mapHomeroomNoteFromDb = (row: any): HomeroomNote => ({
  id: row.id,
  studentId: row.student_id,
  classId: '',
  academicYearId: row.academic_year_id || 'ay-2026',
  semesterId: row.semester_id,
  noteLearning: row.note_learning || '',
  noteAttitude: row.note_attitude || '',
  noteRecommendation: row.note_recommendation || '',
  status: 'draft',
});

export const mapHomeroomNoteToDb = (n: HomeroomNote) => ({
  id: n.id,
  student_id: n.studentId,
  semester_id: n.semesterId,
  academic_year_id: n.academicYearId || 'ay-2026',
  note_learning: n.noteLearning || null,
  note_attitude: n.noteAttitude || null,
  note_recommendation: n.noteRecommendation || null,
});

export const mapAchievementFromDb = (row: any): StudentAchievement => ({
  id: row.id,
  studentId: row.student_id,
  achievementName: row.achievement_name,
  category: 'akademik',
  level: row.level || 'kota',
  organizer: row.organizer || '',
  eventDate: row.event_date || '2026-01-01',
  rankOrAward: row.rank_or_award || 'Juara 1',
  description: row.achievement_name,
  certificateUrl: row.certificate_url || undefined,
  verificationStatus: 'terverifikasi',
});

export const mapAchievementToDb = (ach: StudentAchievement) => ({
  id: ach.id,
  student_id: ach.studentId,
  achievement_name: ach.achievementName,
  level: ach.level || 'kota',
  rank_or_award: ach.rankOrAward,
  event_date: ach.eventDate || new Date().toISOString().substring(0, 10),
  organizer: ach.organizer || 'Sekolah',
  certificate_url: ach.certificateUrl || null,
});

export const mapCocurricularAssessmentFromDb = (row: any): CocurricularAssessment => ({
  id: row.id,
  studentId: row.student_id,
  rubricId: row.rubric_id,
  activityId: '',
  semesterId: row.semester_id,
  grade: row.grade,
  achievementLevel: row.grade,
  teacherNote: row.teacher_note || '',
});

export const mapCocurricularAssessmentToDb = (ca: CocurricularAssessment) => ({
  id: ca.id,
  student_id: ca.studentId,
  rubric_id: ca.rubricId,
  grade: ca.grade || ca.achievementLevel || 'B',
  teacher_note: ca.teacherNote || null,
  semester_id: ca.semesterId,
});

// ==============================================================================
// BULK LOAD ALL SUPABASE DATA ON STARTUP
// ==============================================================================

export interface LoadedSupabaseData {
  schoolProfile?: SchoolProfile;
  academicYears?: AcademicYear[];
  semesters?: Semester[];
  teachers?: Teacher[];
  classes?: ClassGroup[];
  subjects?: Subject[];
  students?: Student[];
  extracurriculars?: Extracurricular[];
  extracurricularMembers?: ExtracurricularMember[];
  assessments?: StudentAssessment[];
  attendances?: StudentAttendance[];
  homeroomNotes?: HomeroomNote[];
  achievements?: StudentAchievement[];
  cocurricularAssessments?: CocurricularAssessment[];
  permissionErrors: string[];
}

export const fetchAllDataFromSupabase = async (): Promise<LoadedSupabaseData> => {
  const client = getSupabaseClient();
  const result: LoadedSupabaseData = { permissionErrors: [] };

  if (!client) return result;

  const fetchTable = async (tableName: string, mapper: (row: any) => any) => {
    try {
      const { data, error } = await client.from(tableName).select('*');
      if (error) {
        if (error.code === '42501') {
          result.permissionErrors.push(tableName);
        }
        return null;
      }
      return (data || []).map(mapper);
    } catch {
      return null;
    }
  };

  const fetchSchoolProfile = async (): Promise<SchoolProfile | null> => {
    try {
      const { data } = await client.from('school_profiles').select('*').limit(1);
      return data?.[0] ? mapSchoolProfileFromDb(data[0]) : null;
    } catch {
      return null;
    }
  };

  const [
    schoolData,
    ayData,
    semData,
    tchData,
    clsData,
    subData,
    stdData,
    eksData,
    memData,
    asmData,
    attData,
    hnData,
    achData,
    caData,
  ] = await Promise.all([
    fetchSchoolProfile(),
    fetchTable('academic_years', mapAcademicYearFromDb),
    fetchTable('semesters', mapSemesterFromDb),
    fetchTable('teachers', mapTeacherFromDb),
    fetchTable('classes', mapClassFromDb),
    fetchTable('subjects', mapSubjectFromDb),
    fetchTable('students', mapStudentFromDb),
    fetchTable('extracurriculars', mapExtracurricularFromDb),
    fetchTable('extracurricular_members', mapExtracurricularMemberFromDb),
    fetchTable('assessments', mapAssessmentFromDb),
    fetchTable('attendances', mapAttendanceFromDb),
    fetchTable('homeroom_notes', mapHomeroomNoteFromDb),
    fetchTable('student_achievements', mapAchievementFromDb),
    fetchTable('cocurricular_assessments', mapCocurricularAssessmentFromDb),
  ]);

  if (schoolData) result.schoolProfile = schoolData;
  if (ayData && ayData.length > 0) result.academicYears = ayData;
  if (semData && semData.length > 0) result.semesters = semData;
  if (tchData && tchData.length > 0) result.teachers = tchData;
  if (clsData && clsData.length > 0) result.classes = clsData;
  if (subData && subData.length > 0) result.subjects = subData;
  if (stdData && stdData.length > 0) result.students = stdData;
  if (eksData && eksData.length > 0) result.extracurriculars = eksData;
  if (memData) result.extracurricularMembers = memData;
  if (asmData) result.assessments = asmData;
  if (attData) result.attendances = attData;
  if (hnData) result.homeroomNotes = hnData;
  if (achData) result.achievements = achData;
  if (caData) result.cocurricularAssessments = caData;

  return result;
};

// ==============================================================================
// REALTIME SUBSCRIPTION
// ==============================================================================

export type RemoteChangeCallback = (
  table: string,
  eventType: 'INSERT' | 'UPDATE' | 'DELETE',
  newRow: any,
  oldRow: any
) => void;

export const subscribeToAllChanges = (onRemoteChange: RemoteChangeCallback): (() => void) => {
  const client = getSupabaseClient();
  if (!client) return () => {};

  const channelName = `realtime-erapor-${Date.now()}`;
  const channel: RealtimeChannel = client
    .channel(channelName)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public' },
      (payload) => {
        onRemoteChange(
          payload.table,
          payload.eventType as any,
          payload.new,
          payload.old
        );
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        // Channel active
      }
    });

  return () => {
    client.removeChannel(channel);
  };
};

// ==============================================================================
// DIRECT ASYNCHRONOUS CRUD PERSISTENCE FUNCTIONS
// ==============================================================================

export const dbUpsert = async (table: string, row: any) => {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Client not configured' };
  try {
    const { error } = await client.from(table).upsert(row);
    if (error) {
      console.warn(`[Supabase CRUD] Error upserting ${table}:`, error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
};

export const dbDelete = async (table: string, id: string) => {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Client not configured' };
  try {
    const { error } = await client.from(table).delete().eq('id', id);
    if (error) {
      console.warn(`[Supabase CRUD] Error deleting from ${table}:`, error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
};

// ==============================================================================
// FULL SYNC HELPER (MENGIRIM SELURUH DATA LOKAL KE SUPABASE)
// ==============================================================================

export const syncAllDataToSupabase = async (
  appData: {
    schoolProfile: any;
    academicYears: any[];
    semesters: any[];
    teachers: any[];
    classes: any[];
    subjects: any[];
    students: any[];
    extracurriculars: any[];
    extracurricularMembers: any[];
    assessments: any[];
    attendances: any[];
    homeroomNotes: any[];
    achievements: any[];
    cocurricularActivities: any[];
    cocurricularRubrics: any[];
    cocurricularAssessments: any[];
  },
  onProgress?: (msg: string) => void
): Promise<{ success: boolean; message: string; details: string[] }> => {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase Client belum dikonfigurasi. Masukkan URL dan Anon Key terlebih dahulu.',
      details: [],
    };
  }

  const details: string[] = [];

  try {
    // 1. School Profile
    onProgress?.('Menyimpan Profil Sekolah...');
    if (appData.schoolProfile) {
      const { error } = await client.from('school_profiles').upsert(mapSchoolProfileToDb(appData.schoolProfile));
      if (error) details.push(`Profil Sekolah: ${error.message}`);
      else details.push('Profil Sekolah tersinkron.');
    }

    // 2. Academic Years
    onProgress?.('Menyimpan Tahun Ajaran...');
    if (appData.academicYears?.length) {
      const rows = appData.academicYears.map(ay => ({
        id: ay.id,
        year_name: ay.yearName,
        is_active: ay.isActive,
        start_date: ay.startDate || null,
        end_date: ay.endDate || null,
      }));
      const { error } = await client.from('academic_years').upsert(rows);
      if (error) details.push(`Tahun Ajaran: ${error.message}`);
      else details.push(`${rows.length} Tahun Ajaran tersinkron.`);
    }

    // 3. Semesters
    onProgress?.('Menyimpan Semester...');
    if (appData.semesters?.length) {
      const rows = appData.semesters.map(s => ({
        id: s.id,
        academic_year_id: s.academicYearId,
        semester_number: s.semesterNumber,
        semester_name: s.semesterName,
        is_active: s.isActive,
      }));
      const { error } = await client.from('semesters').upsert(rows);
      if (error) details.push(`Semester: ${error.message}`);
      else details.push(`${rows.length} Semester tersinkron.`);
    }

    // 4. Subjects
    onProgress?.('Menyimpan Mata Pelajaran...');
    if (appData.subjects?.length) {
      const rows = appData.subjects.map(mapSubjectToDb);
      const { error } = await client.from('subjects').upsert(rows);
      if (error) details.push(`Mata Pelajaran: ${error.message}`);
      else details.push(`${rows.length} Mata Pelajaran tersinkron.`);
    }

    // 5. Teachers
    onProgress?.('Menyimpan Data Guru...');
    if (appData.teachers?.length) {
      const rows = appData.teachers.map(mapTeacherToDb);
      const { error } = await client.from('teachers').upsert(rows);
      if (error) details.push(`Guru: ${error.message}`);
      else details.push(`${rows.length} Guru tersinkron.`);
    }

    // 6. Classes
    onProgress?.('Menyimpan Kelas...');
    if (appData.classes?.length) {
      const rows = appData.classes.map(mapClassToDb);
      const { error } = await client.from('classes').upsert(rows);
      if (error) details.push(`Kelas: ${error.message}`);
      else details.push(`${rows.length} Kelas tersinkron.`);
    }

    // 7. Students
    onProgress?.('Menyimpan Siswa...');
    if (appData.students?.length) {
      const rows = appData.students.map(mapStudentToDb);
      const { error } = await client.from('students').upsert(rows);
      if (error) details.push(`Siswa: ${error.message}`);
      else details.push(`${rows.length} Siswa tersinkron.`);
    }

    // 8. Extracurriculars
    onProgress?.('Menyimpan Ekstrakurikuler...');
    if (appData.extracurriculars?.length) {
      const rows = appData.extracurriculars.map(mapExtracurricularToDb);
      const { error } = await client.from('extracurriculars').upsert(rows);
      if (error) details.push(`Ekskul: ${error.message}`);
      else details.push(`${rows.length} Ekskul tersinkron.`);
    }

    // 9. Assessments
    onProgress?.('Menyimpan Penilaian Siswa...');
    if (appData.assessments?.length) {
      const rows = appData.assessments.map(mapAssessmentToDb);
      const { error } = await client.from('assessments').upsert(rows);
      if (error) details.push(`Penilaian: ${error.message}`);
      else details.push(`${rows.length} Penilaian tersinkron.`);
    }

    // 10. Attendances
    onProgress?.('Menyimpan Presensi Kehadiran...');
    if (appData.attendances?.length) {
      const rows = appData.attendances.map(mapAttendanceToDb);
      const { error } = await client.from('attendances').upsert(rows);
      if (error) details.push(`Presensi: ${error.message}`);
      else details.push(`${rows.length} Presensi tersinkron.`);
    }

    // 11. Homeroom Notes
    onProgress?.('Menyimpan Catatan Wali Kelas...');
    if (appData.homeroomNotes?.length) {
      const rows = appData.homeroomNotes.map(mapHomeroomNoteToDb);
      const { error } = await client.from('homeroom_notes').upsert(rows);
      if (error) details.push(`Catatan Wali: ${error.message}`);
      else details.push(`${rows.length} Catatan Wali tersinkron.`);
    }

    // 12. Achievements
    onProgress?.('Menyimpan Prestasi Siswa...');
    if (appData.achievements?.length) {
      const rows = appData.achievements.map(mapAchievementToDb);
      const { error } = await client.from('student_achievements').upsert(rows);
      if (error) details.push(`Prestasi: ${error.message}`);
      else details.push(`${rows.length} Prestasi tersinkron.`);
    }

    return {
      success: true,
      message: 'Seluruh data berhasil disinkronkan ke Supabase!',
      details,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Terjadi kendala saat sinkronisasi: ${err?.message || 'Error'}`,
      details,
    };
  }
};
