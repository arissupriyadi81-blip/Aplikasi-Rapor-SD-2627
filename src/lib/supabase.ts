/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_SUPABASE = 'erapor_sd_aj_supabase_config';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Mendapatkan konfigurasi Supabase saat ini (dari localStorage atau env vars)
 */
export const getSupabaseConfig = (): SupabaseConfig => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

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
  // Reset cache client agar memakai config baru
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
    // Coba query tabel school_profiles atau users
    const { data, error } = await client.from('school_profiles').select('id, school_name').limit(1);

    if (error) {
      // Jika error 42P01 (relation does not exist), berarti koneksi berhasil namun query SQL belum dijalankan
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

/**
 * Helper untuk menyinkronkan seluruh state lokal aplikasi ke tabel-tabel Supabase
 */
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
      const sp = appData.schoolProfile;
      const { error } = await client.from('school_profiles').upsert({
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
        report_date: sp.reportDate,
      });
      if (error) details.push(`Gagal simpan Profil: ${error.message}`);
      else details.push('Profil Sekolah tersinkron.');
    }

    // 2. Academic Years
    onProgress?.('Menyimpan Tahun Ajaran...');
    if (appData.academicYears?.length) {
      const rows = appData.academicYears.map(ay => ({
        id: ay.id,
        year_name: ay.yearName,
        is_active: ay.isActive,
        start_date: ay.startDate,
        end_date: ay.endDate,
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
        start_date: s.startDate,
        end_date: s.endDate,
      }));
      const { error } = await client.from('semesters').upsert(rows);
      if (error) details.push(`Semester: ${error.message}`);
      else details.push(`${rows.length} Semester tersinkron.`);
    }

    // 4. Subjects
    onProgress?.('Menyimpan Mata Pelajaran...');
    if (appData.subjects?.length) {
      const rows = appData.subjects.map(sub => ({
        id: sub.id,
        subject_code: sub.subjectCode,
        subject_name: sub.subjectName,
        category: sub.category,
        order_number: sub.orderNumber,
        is_active: sub.isActive,
        kkm: sub.kkm,
      }));
      const { error } = await client.from('subjects').upsert(rows);
      if (error) details.push(`Mata Pelajaran: ${error.message}`);
      else details.push(`${rows.length} Mata Pelajaran tersinkron.`);
    }

    // 5. Teachers
    onProgress?.('Menyimpan Data Guru...');
    if (appData.teachers?.length) {
      const rows = appData.teachers.map(t => ({
        id: t.id,
        nip: t.nip,
        full_name: t.fullName,
        gender: t.gender,
        role_title: t.roleTitle || 'guru_kelas',
        education: t.education,
        phone: t.phone,
        email: t.email,
        is_homeroom_teacher: t.isHomeroomTeacher,
        assigned_class_id: t.assignedClassId,
        is_subject_teacher: t.isSubjectTeacher,
        subjects_taught: t.subjectsTaught || [],
      }));
      const { error } = await client.from('teachers').upsert(rows);
      if (error) details.push(`Guru: ${error.message}`);
      else details.push(`${rows.length} Guru tersinkron.`);
    }

    // 6. Classes
    onProgress?.('Menyimpan Kelas...');
    if (appData.classes?.length) {
      const rows = appData.classes.map(c => ({
        id: c.id,
        class_name: c.className,
        grade: c.grade,
        academic_year_id: c.academicYearId,
        homeroom_teacher_id: c.homeroomTeacherId,
        max_capacity: c.maxCapacity,
        room_number: c.roomNumber,
        phase: c.phase,
      }));
      const { error } = await client.from('classes').upsert(rows);
      if (error) details.push(`Kelas: ${error.message}`);
      else details.push(`${rows.length} Kelas tersinkron.`);
    }

    // 7. Students
    onProgress?.('Menyimpan Siswa...');
    if (appData.students?.length) {
      const rows = appData.students.map(s => ({
        id: s.id,
        nis: s.nis,
        nisn: s.nisn,
        full_name: s.fullName,
        gender: s.gender,
        birth_place: s.birthPlace,
        birth_date: s.birthDate,
        religion: s.religion,
        current_class_id: s.currentClassId,
        current_grade: s.currentGrade,
        address: s.address,
        parent_father: s.parentFather,
        parent_mother: s.parentMother,
        parent_phone: s.parentPhone,
        father_job: s.fatherJob,
        mother_job: s.motherJob,
        father_education: s.fatherEducation,
        mother_education: s.motherEducation,
        guardian_name: s.guardianName,
        guardian_job: s.guardianJob,
        guardian_relation: s.guardianRelation,
        status: s.status,
        entry_year: s.entryYear,
        blood_type: s.bloodType,
      }));
      const { error } = await client.from('students').upsert(rows);
      if (error) details.push(`Siswa: ${error.message}`);
      else details.push(`${rows.length} Siswa tersinkron.`);
    }

    // 8. Extracurriculars
    onProgress?.('Menyimpan Ekstrakurikuler...');
    if (appData.extracurriculars?.length) {
      const rows = appData.extracurriculars.map(e => ({
        id: e.id,
        name: e.name,
        category: e.category,
        coach_name: e.coachName,
        description: e.description,
        schedule: e.schedule,
        location: e.location,
      }));
      const { error } = await client.from('extracurriculars').upsert(rows);
      if (error) details.push(`Ekskul: ${error.message}`);
      else details.push(`${rows.length} Ekskul tersinkron.`);
    }

    return {
      success: true,
      message: 'Seluruh data lokal berhasil disinkronkan ke Supabase!',
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
