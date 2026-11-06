-- ==============================================================================
-- DATABASE SCHEMA: E-RAPOR SD IAS AL-JANNAH
-- Rapor Digital Kurikulum Merdeka - Sekolah Dasar Islam Alam & Sains Al-Jannah
-- Dialek: PostgreSQL 15+ (Dioptimalkan Khusus untuk Supabase SQL Editor)
-- ==============================================================================
-- Petunjuk Penggunaan di Supabase:
-- 1. Buka dashboard proyek Supabase Anda (https://supabase.com/dashboard)
-- 2. Pilih menu "SQL Editor" di bilah navigasi kiri
-- 3. Klik "New query", tempel (paste) seluruh skrip ini, lalu klik tombol "RUN" (Ctrl+Enter)
-- 4. Semua tabel, relasi, RLS policy, dan data awal SD IAS Al-Jannah akan dibuat otomatis!
-- ==============================================================================

-- Aktifkan ekstensi UUID (bawaan Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Hapus tabel lama jika ada (urutan penghapusan sesuai dependensi foreign key)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS student_achievements CASCADE;
DROP TABLE IF EXISTS homeroom_notes CASCADE;
DROP TABLE IF EXISTS attendances CASCADE;
DROP TABLE IF EXISTS cocurricular_assessments CASCADE;
DROP TABLE IF EXISTS cocurricular_rubrics CASCADE;
DROP TABLE IF EXISTS cocurricular_activities CASCADE;
DROP TABLE IF EXISTS extracurricular_members CASCADE;
DROP TABLE IF EXISTS extracurriculars CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS semesters CASCADE;
DROP TABLE IF EXISTS academic_years CASCADE;
DROP TABLE IF EXISTS school_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==============================================================================
-- 1. TABEL PENGGUNA (USERS & AUTHENTICATION)
-- ==============================================================================
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('admin', 'kepala_sekolah', 'guru_mapel', 'wali_kelas')),
    email VARCHAR(100),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. TABEL PROFIL SEKOLAH (SD IAS AL-JANNAH)
-- ==============================================================================
CREATE TABLE school_profiles (
    id TEXT PRIMARY KEY DEFAULT 'sch-1',
    school_name VARCHAR(200) NOT NULL,
    npsn VARCHAR(20) NOT NULL,
    nss VARCHAR(30),
    foundation_name VARCHAR(150),
    address TEXT NOT NULL,
    village VARCHAR(100),
    district VARCHAR(100),
    regency VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(10),
    phone VARCHAR(30),
    email VARCHAR(100),
    website VARCHAR(150),
    logo_url TEXT,
    headmaster_name VARCHAR(120) NOT NULL,
    headmaster_nip VARCHAR(50),
    report_place VARCHAR(50) DEFAULT 'Jakarta Timur',
    report_date_sem1 DATE DEFAULT '2026-12-19',
    report_date_sem2 DATE DEFAULT '2027-06-25',
    report_date DATE DEFAULT '2026-12-19',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. TABEL TAHUN AJARAN & SEMESTER
-- ==============================================================================
CREATE TABLE academic_years (
    id TEXT PRIMARY KEY,
    year_name VARCHAR(20) NOT NULL UNIQUE, -- Contoh: "2026/2027"
    is_active BOOLEAN DEFAULT FALSE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE semesters (
    id TEXT PRIMARY KEY,
    academic_year_id TEXT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    semester_number SMALLINT NOT NULL CHECK (semester_number IN (1, 2)),
    semester_name VARCHAR(30) NOT NULL, -- Contoh: "Semester 1 (Ganjil)"
    is_active BOOLEAN DEFAULT FALSE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (academic_year_id, semester_number)
);

-- ==============================================================================
-- 4. TABEL DEWAN GURU & TENAGA PENDIDIK
-- ==============================================================================
CREATE TABLE teachers (
    id TEXT PRIMARY KEY,
    nip VARCHAR(30),
    full_name VARCHAR(120) NOT NULL,
    gender VARCHAR(5) CHECK (gender IN ('L', 'P')),
    role_title VARCHAR(50) NOT NULL, -- 'wali_kelas', 'guru_kelas', 'guru_bidang', 'guru_pendamping'
    education VARCHAR(50),
    phone VARCHAR(30),
    email VARCHAR(100),
    is_homeroom_teacher BOOLEAN DEFAULT FALSE,
    assigned_class_id TEXT,
    is_subject_teacher BOOLEAN DEFAULT FALSE,
    subjects_taught TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. TABEL KELAS & ROMBEL
-- ==============================================================================
CREATE TABLE classes (
    id TEXT PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL, -- Contoh: "Kelas 5A"
    grade SMALLINT NOT NULL CHECK (grade BETWEEN 1 AND 6),
    academic_year_id TEXT REFERENCES academic_years(id) ON DELETE SET NULL,
    homeroom_teacher_id TEXT REFERENCES teachers(id) ON DELETE SET NULL,
    max_capacity SMALLINT DEFAULT 30,
    room_number VARCHAR(20),
    phase VARCHAR(5) NOT NULL CHECK (phase IN ('A', 'B', 'C')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. TABEL MATA PELAJARAN (KURIKULUM MERDEKA)
-- ==============================================================================
CREATE TABLE subjects (
    id TEXT PRIMARY KEY,
    subject_code VARCHAR(20) NOT NULL UNIQUE,
    subject_name VARCHAR(100) NOT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN ('wajib', 'pilihan', 'muatan_lokal')),
    order_number SMALLINT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    kkm NUMERIC(5,2) DEFAULT 75.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. TABEL PESERTA DIDIK (SISWA)
-- ==============================================================================
CREATE TABLE students (
    id TEXT PRIMARY KEY,
    nis VARCHAR(20) NOT NULL UNIQUE,
    nisn VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(120) NOT NULL,
    gender VARCHAR(5) NOT NULL CHECK (gender IN ('L', 'P')),
    birth_place VARCHAR(80),
    birth_date DATE,
    religion VARCHAR(30) DEFAULT 'Islam',
    current_class_id TEXT REFERENCES classes(id) ON DELETE SET NULL,
    current_grade SMALLINT NOT NULL,
    address TEXT,
    parent_father VARCHAR(100),
    parent_mother VARCHAR(100),
    parent_phone VARCHAR(30),
    father_job VARCHAR(80),
    mother_job VARCHAR(80),
    father_education VARCHAR(50),
    mother_education VARCHAR(50),
    guardian_name VARCHAR(100),
    guardian_job VARCHAR(80),
    guardian_relation VARCHAR(50),
    status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'pindah', 'lulus', 'keluar')),
    entry_year VARCHAR(10),
    blood_type VARCHAR(5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. TABEL PENILAIAN MATA PELAJARAN (FORMATIF, SUMATIF, NILAI AKHIR)
-- ==============================================================================
CREATE TABLE assessments (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    semester_id TEXT NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    tp_id VARCHAR(50),
    tp_description TEXT,
    tp_score NUMERIC(5,2),
    formative_scores JSONB DEFAULT '[]'::jsonb,
    summative_scores JSONB DEFAULT '[]'::jsonb,
    final_score NUMERIC(5,2),
    highest_tp_desc TEXT,
    lowest_tp_desc TEXT,
    academic_year_id TEXT REFERENCES academic_years(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. TABEL KOKURIKULER (P5 / PROYEK PENGUATAN PROFIL PELAJAR PANCASILA)
-- ==============================================================================
CREATE TABLE cocurricular_activities (
    id TEXT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    theme VARCHAR(100) NOT NULL,
    description TEXT,
    target_dimensions TEXT[] DEFAULT '{}',
    semester_id TEXT REFERENCES semesters(id) ON DELETE CASCADE,
    academic_year_id TEXT REFERENCES academic_years(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cocurricular_rubrics (
    id TEXT PRIMARY KEY,
    activity_id TEXT NOT NULL REFERENCES cocurricular_activities(id) ON DELETE CASCADE,
    dimension VARCHAR(100) NOT NULL,
    element VARCHAR(150) NOT NULL,
    sub_element VARCHAR(200) NOT NULL,
    target_grade_level VARCHAR(50),
    activity_form TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cocurricular_assessments (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    rubric_id TEXT NOT NULL REFERENCES cocurricular_rubrics(id) ON DELETE CASCADE,
    grade VARCHAR(5) NOT NULL CHECK (grade IN ('SB', 'BSH', 'MB', 'BB')),
    teacher_note TEXT,
    semester_id TEXT NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    evaluated_by TEXT REFERENCES teachers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 10. TABEL EKSTRAKURIKULER & PENILAIAN EKSKUL SISWA
-- ==============================================================================
CREATE TABLE extracurriculars (
    id TEXT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('wajib', 'pilihan')),
    coach_name VARCHAR(120) NOT NULL,
    description TEXT,
    schedule VARCHAR(100),
    location VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE extracurricular_members (
    id TEXT PRIMARY KEY,
    extracurricular_id TEXT NOT NULL REFERENCES extracurriculars(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    semester_id TEXT NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    academic_year_id TEXT REFERENCES academic_years(id) ON DELETE CASCADE,
    join_date DATE,
    grade_predicate VARCHAR(5) DEFAULT 'A' CHECK (grade_predicate IN ('A', 'B', 'C', 'D')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 11. TABEL PRESENSI / KETIDAKHADIRAN
-- ==============================================================================
CREATE TABLE attendances (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    semester_id TEXT NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    academic_year_id TEXT REFERENCES academic_years(id) ON DELETE CASCADE,
    sakit SMALLINT DEFAULT 0,
    izin SMALLINT DEFAULT 0,
    alpa SMALLINT DEFAULT 0,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, semester_id)
);

-- ==============================================================================
-- 12. TABEL CATATAN WALI KELAS & KENAIKAN KELAS
-- ==============================================================================
CREATE TABLE homeroom_notes (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    semester_id TEXT NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    academic_year_id TEXT REFERENCES academic_years(id) ON DELETE CASCADE,
    note_learning TEXT,
    note_attitude TEXT,
    note_recommendation TEXT,
    naik_kelas BOOLEAN DEFAULT TRUE,
    kelas_tujuan VARCHAR(50),
    tanggal_kenaikan DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, semester_id)
);

-- ==============================================================================
-- 13. TABEL PRESTASI SISWA
-- ==============================================================================
CREATE TABLE student_achievements (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    achievement_name VARCHAR(200) NOT NULL,
    level VARCHAR(50) NOT NULL CHECK (level IN ('sekolah', 'kecamatan', 'kota', 'provinsi', 'nasional', 'internasional')),
    rank_or_award VARCHAR(80) NOT NULL, -- Contoh: "Juara 1", "Medali Emas"
    event_date DATE NOT NULL,
    organizer VARCHAR(150) NOT NULL,
    certificate_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 14. TABEL AUDIT LOG AKTIVITAS SISTEM
-- ==============================================================================
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT,
    user_name VARCHAR(120),
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(80) NOT NULL,
    entity_id TEXT,
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip_address VARCHAR(50)
);

-- ==============================================================================
-- 15. KONFIGURASI ROW LEVEL SECURITY (RLS) UNTUK SUPABASE
-- ==============================================================================
-- Aktifkan RLS di setiap tabel
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cocurricular_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE cocurricular_rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cocurricular_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracurriculars ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracurricular_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE homeroom_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses: Izinkan operasi penuh bagi klien dengan anon key / service key
CREATE POLICY "Public full access for users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access for school_profiles" ON school_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access for academic_years" ON academic_years FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access for semesters" ON semesters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access for teachers" ON teachers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access for classes" ON classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access for subjects" ON subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access for students" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access for assessments" ON assessments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access for cocurricular_activities" ON cocurricular_activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access for cocurricular_rubrics" ON cocurricular_rubrics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access for cocurricular_assessments" ON cocurricular_assessments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access for extracurriculars" ON extracurriculars FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access for extracurricular_members" ON extracurricular_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access for attendances" ON attendances FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access for homeroom_notes" ON homeroom_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access for student_achievements" ON student_achievements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access for audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 16. DATA AWAL (SEEDING RESMI SD IAS AL-JANNAH)
-- ==============================================================================

-- Profil Sekolah SD IAS Al-Jannah
INSERT INTO school_profiles (
    id, school_name, npsn, nss, foundation_name, address, village, district, regency, province, postal_code, phone, email, website, logo_url, headmaster_name, headmaster_nip, report_place, report_date_sem1, report_date_sem2
) VALUES (
    'sch-1',
    'SD IAS Al-Jannah (Islamic, Nature & Science School)',
    '20108390',
    '101016404001',
    'Yayasan Al-Jannah Pondok Ranggon',
    'Jl. Jambore No. 4, Harjamukti, Pondok Ranggon',
    'Harjamukti',
    'Cimanggis',
    'Depok - Jakarta Timur',
    'Jawa Barat',
    '16454',
    '(021) 8774-1234',
    'info@sekolah-aljannah.sch.id',
    'https://sekolah-aljannah.sch.id',
    '/logo-aljannah-emblem.png',
    'Aris Supriyadi, S.Pd., M.M.',
    '198105152005011004',
    'Jakarta Timur',
    '2026-12-19',
    '2027-06-25'
) ON CONFLICT (id) DO NOTHING;

-- Pengguna Utama
INSERT INTO users (id, username, password_hash, full_name, role, email) VALUES
('u-1', 'admin', 'admin123', 'Administrator E-Rapor', 'admin', 'admin@sekolah-aljannah.sch.id'),
('u-2', 'kepsek', 'kepsek123', 'Aris Supriyadi, S.Pd., M.M.', 'kepala_sekolah', 'kepsek@sekolah-aljannah.sch.id'),
('u-3', 'wali5a', 'wali123', 'Siti Rahmawati, S.Pd.I', 'wali_kelas', 'siti.rahma@sekolah-aljannah.sch.id'),
('u-4', 'gurumath', 'guru123', 'Budi Santoso, S.Pd., M.Si.', 'guru_mapel', 'budi.santoso@sekolah-aljannah.sch.id')
ON CONFLICT (id) DO NOTHING;

-- Tahun Ajaran & Semester
INSERT INTO academic_years (id, year_name, is_active, start_date, end_date) VALUES
('ay-2026', '2026/2027', TRUE, '2026-07-15', '2027-06-25')
ON CONFLICT (id) DO NOTHING;

INSERT INTO semesters (id, academic_year_id, semester_number, semester_name, is_active, start_date, end_date) VALUES
('sem-1', 'ay-2026', 1, 'Semester 1 (Ganjil)', TRUE, '2026-07-15', '2026-12-19'),
('sem-2', 'ay-2026', 2, 'Semester 2 (Genap)', FALSE, '2027-01-05', '2027-06-25')
ON CONFLICT (id) DO NOTHING;

-- Mata Pelajaran Kurikulum Merdeka
INSERT INTO subjects (id, subject_code, subject_name, category, order_number, is_active, kkm) VALUES
('sub-pai', 'PAI-01', 'Pendidikan Agama Islam & Budi Pekerti', 'wajib', 1, TRUE, 75.00),
('sub-pancasila', 'PP-02', 'Pendidikan Pancasila', 'wajib', 2, TRUE, 75.00),
('sub-indo', 'BIN-03', 'Bahasa Indonesia', 'wajib', 3, TRUE, 75.00),
('sub-math', 'MAT-04', 'Matematika', 'wajib', 4, TRUE, 75.00),
('sub-ipas', 'IPAS-05', 'Ilmu Pengetahuan Alam & Sosial (IPAS)', 'wajib', 5, TRUE, 75.00),
('sub-pjok', 'PJK-06', 'Pendidikan Jasmani, Olahraga, & Kesehatan', 'wajib', 6, TRUE, 75.00),
('sub-seni', 'SBR-07', 'Seni Rupa', 'wajib', 7, TRUE, 75.00),
('sub-inggris', 'ENG-08', 'Bahasa Inggris', 'wajib', 8, TRUE, 75.00),
('sub-sunda', 'SND-09', 'Bahasa & Sastra Sunda', 'muatan_lokal', 9, TRUE, 72.00)
ON CONFLICT (id) DO NOTHING;

-- Ekstrakurikuler Resmi SD IAS Al-Jannah
INSERT INTO extracurriculars (id, name, category, coach_name, description, schedule, location) VALUES
('eks-pramuka', 'Pramuka Siaga & Penggalang', 'wajib', 'Kak Wahyu Pratama', 'Pembentukan karakter kepanduan dan kedisiplinan berkarakter Islami.', 'Jumat, 14.00 - 15.30', 'Lapangan Utama Al-Jannah'),
('eks-tahfidz', 'Tahfidz & Tilawah Al-Qur''an', 'pilihan', 'Ustadz Ahmad Fauzi, Lc.', 'Program bimbingan menghafal Juz 30 dan 29 dengan makharijul huruf tepat.', 'Senin & Rabu, 15.30 - 17.00', 'Masjid Al-Jannah'),
('eks-robotic', 'Robotika & Coding Science', 'pilihan', 'Ir. Reza Kurniawan', 'Praktik mekanik, sensor sains, dan logika pemrograman anak.', 'Selasa, 14.00 - 15.30', 'Laboratorium Sains & Komputer'),
('eks-panahan', 'Panahan (Archery Sunnah)', 'pilihan', 'Coach Hendra Gunawan', 'Olahraga sunnah fokus, ketenangan mental, dan postur motorik.', 'Kamis, 15.30 - 17.00', 'Archery Range Nature Al-Jannah'),
('eks-futsal', 'Futsal Champion Club', 'pilihan', 'Coach Dani Suwandi', 'Teknik dasar, strategi tim, dan stamina fisik sportivitas.', 'Sabtu, 08.00 - 10.00', 'Sport Center Indoor')
ON CONFLICT (id) DO NOTHING;

-- Selesai! Skrip SQL Supabase berhasil dieksekusi 100%.
