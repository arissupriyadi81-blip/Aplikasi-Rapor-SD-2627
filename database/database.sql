-- ==============================================================================
-- DATABASE SCHEMA: E-RAPOR SD AJ (IAS AL-JANNAH)
-- Rapor Digital Kurikulum Merdeka - Sekolah Dasar Islam Alam & Sains Al-Jannah
-- Versi: 1.0.0
-- Dialek: MySQL 8.0+ / MariaDB 10.5+
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS report_finalizations;
DROP TABLE IF EXISTS student_achievements;
DROP TABLE IF EXISTS homeroom_notes;
DROP TABLE IF EXISTS student_attendances;
DROP TABLE IF EXISTS cocurricular_assessments;
DROP TABLE IF EXISTS cocurricular_rubrics;
DROP TABLE IF EXISTS cocurricular_activities;
DROP TABLE IF EXISTS extracurricular_members;
DROP TABLE IF EXISTS extracurriculars;
DROP TABLE IF EXISTS student_assessments;
DROP TABLE IF EXISTS assessment_components;
DROP TABLE IF EXISTS learning_objectives_tp;
DROP TABLE IF EXISTS learning_outcomes_cp;
DROP TABLE IF EXISTS teacher_assignments;
DROP TABLE IF EXISTS class_memberships;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS semesters;
DROP TABLE IF EXISTS academic_years;
DROP TABLE IF EXISTS school_profiles;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. USERS & ROLES
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    role ENUM('admin', 'kepala_sekolah', 'guru_mapel', 'wali_kelas') NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(30),
    avatar_url VARCHAR(255),
    is_active TINYINT(1) DEFAULT 1,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. SCHOOL PROFILE (IAS Al-Jannah)
CREATE TABLE school_profiles (
    id VARCHAR(36) PRIMARY KEY,
    school_name VARCHAR(150) NOT NULL,
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
    logo_url VARCHAR(255),
    headmaster_name VARCHAR(120) NOT NULL,
    headmaster_nip VARCHAR(50),
    report_place VARCHAR(50) DEFAULT 'Jakarta Timur',
    report_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. ACADEMIC YEARS & SEMESTERS
CREATE TABLE academic_years (
    id VARCHAR(36) PRIMARY KEY,
    year_name VARCHAR(20) NOT NULL UNIQUE, -- e.g. "2026/2027"
    is_active TINYINT(1) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE semesters (
    id VARCHAR(36) PRIMARY KEY,
    academic_year_id VARCHAR(36) NOT NULL,
    semester_number TINYINT NOT NULL, -- 1 = Ganjil, 2 = Genap
    semester_name VARCHAR(20) NOT NULL,
    is_active TINYINT(1) DEFAULT 0,
    is_input_open TINYINT(1) DEFAULT 1,
    is_finalized TINYINT(1) DEFAULT 0,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    UNIQUE KEY uq_year_semester (academic_year_id, semester_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TEACHERS
CREATE TABLE teachers (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE,
    nip VARCHAR(30),
    nuptk VARCHAR(30),
    nik VARCHAR(30),
    full_name VARCHAR(120) NOT NULL,
    title_prefix VARCHAR(20),
    title_suffix VARCHAR(20),
    gender ENUM('L', 'P') NOT NULL,
    birth_place VARCHAR(100),
    birth_date DATE,
    address TEXT,
    phone VARCHAR(30),
    employment_status ENUM('GTY', 'GTT', 'PNS', 'PPPK') DEFAULT 'GTY',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_teacher_nip (nip)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. CLASSES (Rombel)
CREATE TABLE classes (
    id VARCHAR(36) PRIMARY KEY,
    academic_year_id VARCHAR(36) NOT NULL,
    class_name VARCHAR(50) NOT NULL, -- e.g. "1A - Al-Farabi"
    grade_level TINYINT NOT NULL, -- 1 to 6
    phase ENUM('A', 'B', 'C') NOT NULL, -- A: 1-2, B: 3-4, C: 5-6
    homeroom_teacher_id VARCHAR(36),
    capacity INT DEFAULT 30,
    is_active TINYINT(1) DEFAULT 1,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    FOREIGN KEY (homeroom_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    UNIQUE KEY uq_class_year (academic_year_id, class_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. STUDENTS
CREATE TABLE students (
    id VARCHAR(36) PRIMARY KEY,
    nis VARCHAR(20) NOT NULL UNIQUE,
    nisn VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(120) NOT NULL,
    gender ENUM('L', 'P') NOT NULL,
    birth_place VARCHAR(100),
    birth_date DATE,
    religion VARCHAR(30) DEFAULT 'Islam',
    parent_father VARCHAR(120),
    father_job VARCHAR(100),
    father_education VARCHAR(50),
    parent_mother VARCHAR(120),
    mother_job VARCHAR(100),
    mother_education VARCHAR(50),
    guardian_name VARCHAR(120),
    guardian_job VARCHAR(100),
    guardian_relation VARCHAR(50),
    parent_phone VARCHAR(30),
    address TEXT,
    admission_year VARCHAR(10),
    status ENUM('aktif', 'pindah', 'lulus', 'keluar') DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_student_nis (nis),
    INDEX idx_student_nisn (nisn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. CLASS MEMBERSHIPS
CREATE TABLE class_memberships (
    id VARCHAR(36) PRIMARY KEY,
    class_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    academic_year_id VARCHAR(36) NOT NULL,
    roll_number INT,
    status ENUM('aktif', 'pindah', 'nonaktif') DEFAULT 'aktif',
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    UNIQUE KEY uq_student_year_class (academic_year_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. SUBJECTS
CREATE TABLE subjects (
    id VARCHAR(36) PRIMARY KEY,
    subject_code VARCHAR(20) NOT NULL UNIQUE,
    subject_name VARCHAR(100) NOT NULL,
    category ENUM('wajib', 'pilihan') DEFAULT 'wajib',
    target_grade_min TINYINT DEFAULT 1,
    target_grade_max TINYINT DEFAULT 6,
    description TEXT,
    is_active TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. TEACHER ASSIGNMENTS
CREATE TABLE teacher_assignments (
    id VARCHAR(36) PRIMARY KEY,
    teacher_id VARCHAR(36) NOT NULL,
    class_id VARCHAR(36) NOT NULL,
    subject_id VARCHAR(36) NOT NULL,
    academic_year_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    UNIQUE KEY uq_assign (academic_year_id, class_id, subject_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. CP & TP (Kurikulum Merdeka)
CREATE TABLE learning_outcomes_cp (
    id VARCHAR(36) PRIMARY KEY,
    academic_year_id VARCHAR(36) NOT NULL,
    phase ENUM('A', 'B', 'C') NOT NULL,
    subject_id VARCHAR(36) NOT NULL,
    element VARCHAR(100) NOT NULL,
    cp_description TEXT NOT NULL,
    curriculum_version VARCHAR(50) DEFAULT 'Kurikulum Merdeka 2024/2026',
    is_active TINYINT(1) DEFAULT 1,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE learning_objectives_tp (
    id VARCHAR(36) PRIMARY KEY,
    cp_id VARCHAR(36) NOT NULL,
    tp_code VARCHAR(20) NOT NULL,
    tp_description TEXT NOT NULL,
    tp_order INT DEFAULT 1,
    semester TINYINT NOT NULL,
    weight DECIMAL(5,2) DEFAULT 1.00,
    is_active TINYINT(1) DEFAULT 1,
    FOREIGN KEY (cp_id) REFERENCES learning_outcomes_cp(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. ASSESSMENTS
CREATE TABLE student_assessments (
    id VARCHAR(36) PRIMARY KEY,
    class_id VARCHAR(36) NOT NULL,
    subject_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    academic_year_id VARCHAR(36) NOT NULL,
    semester_id VARCHAR(36) NOT NULL,
    formatif_scores JSON, -- Map of TP ID to Score
    sumatif_materi_scores JSON, -- Map of Test ID to Score
    formatif_avg DECIMAL(5,2),
    sumatif_materi_avg DECIMAL(5,2),
    sumatif_akhir DECIMAL(5,2),
    final_score DECIMAL(5,2),
    highest_tp_ids JSON,
    lowest_tp_ids JSON,
    achievement_desc TEXT,
    status ENUM('draft', 'submitted', 'approved', 'final') DEFAULT 'draft',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
    UNIQUE KEY uq_std_subj_sem (semester_id, class_id, subject_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. EXTRACURRICULAR
CREATE TABLE extracurriculars (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    coach_teacher_id VARCHAR(36),
    schedule VARCHAR(100),
    is_active TINYINT(1) DEFAULT 1,
    FOREIGN KEY (coach_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE extracurricular_members (
    id VARCHAR(36) PRIMARY KEY,
    extracurricular_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    academic_year_id VARCHAR(36) NOT NULL,
    semester_id VARCHAR(36) NOT NULL,
    grade_predicate ENUM('A', 'B', 'C', 'D') DEFAULT 'A',
    description TEXT,
    FOREIGN KEY (extracurricular_id) REFERENCES extracurriculars(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. KOKURIKULER (RUBRIK DAN ASESMEN)
CREATE TABLE cocurricular_activities (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    theme VARCHAR(100) NOT NULL, -- e.g. Gaya Hidup Berkelanjutan
    focus TEXT,
    objectives TEXT,
    period VARCHAR(50),
    target_phase ENUM('A', 'B', 'C'),
    coordinator_teacher_id VARCHAR(36),
    status ENUM('aktif', 'selesai', 'arsip') DEFAULT 'aktif',
    FOREIGN KEY (coordinator_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cocurricular_rubrics (
    id VARCHAR(36) PRIMARY KEY,
    activity_id VARCHAR(36) NOT NULL,
    dimension ENUM('Keimanan dan Ketakwaan Terhadap Tuhan', 'Kewargaan', 'Penalaran Kritis', 'Kreativitas', 'Kolaborasi', 'Kemandirian', 'Kesehatan', 'Komunikasi') NOT NULL,
    theme VARCHAR(150) NOT NULL,
    objective TEXT NOT NULL,
    activity_form VARCHAR(255) NOT NULL,
    related_subjects TEXT, -- JSON or comma separated subjects
    indicator TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES cocurricular_activities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cocurricular_assessments (
    id VARCHAR(36) PRIMARY KEY,
    activity_id VARCHAR(36) NOT NULL,
    rubric_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    semester_id VARCHAR(36) NOT NULL,
    grade ENUM('SB', 'B', 'C', 'K') NOT NULL DEFAULT 'B',
    teacher_note TEXT, -- Catatan guru otomatis atau kustomisasi
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES cocurricular_activities(id) ON DELETE CASCADE,
    FOREIGN KEY (rubric_id) REFERENCES cocurricular_rubrics(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
    UNIQUE KEY uq_kokurikuler_assess (rubric_id, student_id, semester_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. ATTENDANCE & HOMEROOM NOTES
CREATE TABLE student_attendances (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    class_id VARCHAR(36) NOT NULL,
    academic_year_id VARCHAR(36) NOT NULL,
    semester_id VARCHAR(36) NOT NULL,
    sakit INT DEFAULT 0,
    izin INT DEFAULT 0,
    alpa INT DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
    UNIQUE KEY uq_attend (student_id, semester_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE homeroom_notes (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    class_id VARCHAR(36) NOT NULL,
    academic_year_id VARCHAR(36) NOT NULL,
    semester_id VARCHAR(36) NOT NULL,
    note_learning TEXT,
    note_attitude TEXT,
    note_recommendation TEXT,
    status ENUM('draft', 'final') DEFAULT 'draft',
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
    UNIQUE KEY uq_hr_note (student_id, semester_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. ACHIEVEMENTS
CREATE TABLE student_achievements (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    achievement_name VARCHAR(150) NOT NULL,
    category ENUM('akademik', 'non_akademik') DEFAULT 'akademik',
    level ENUM('sekolah', 'kecamatan', 'kabupaten_kota', 'provinsi', 'nasional', 'internasional') DEFAULT 'kabupaten_kota',
    organizer VARCHAR(120),
    event_date DATE,
    rank_or_award VARCHAR(80),
    description TEXT,
    certificate_url VARCHAR(255),
    verification_status ENUM('menunggu', 'terverifikasi', 'ditolak') DEFAULT 'terverifikasi',
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. REPORT FINALIZATION & AUDIT LOGS
CREATE TABLE report_finalizations (
    id VARCHAR(36) PRIMARY KEY,
    class_id VARCHAR(36) NOT NULL,
    academic_year_id VARCHAR(36) NOT NULL,
    semester_id VARCHAR(36) NOT NULL,
    status ENUM('draft', 'review', 'disetujui', 'final_terkunci') DEFAULT 'draft',
    finalized_by VARCHAR(36),
    finalized_at DATETIME,
    unlocked_by VARCHAR(36),
    unlocked_at DATETIME,
    unlock_reason TEXT,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
    UNIQUE KEY uq_fin (class_id, semester_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    action VARCHAR(80) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(50),
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- INITIAL SEED DATA (SD IAS AL-JANNAH)
-- ==============================================================================

-- 1. School Profile
INSERT INTO school_profiles (id, school_name, npsn, nss, foundation_name, address, village, district, regency, province, postal_code, phone, email, website, logo_url, headmaster_name, headmaster_nip, report_place, report_date)
VALUES (
    'sch-1',
    'SD IAS Al-Jannah (Islamic, Nature & Science School)',
    '20108390',
    '101016404001',
    'Yayasan Al-Jannah Pondok Ranggon',
    'Jl. Jambore No.4, Harjamukti, Kec. Cimanggis / Pondok Ranggon',
    'Harjamukti',
    'Cimanggis',
    'Depok - Jakarta Timur',
    'Jawa Barat / DKI Jakarta',
    '16454',
    '(021) 8774-1234',
    'info@sekolah-aljannah.sch.id',
    'https://sekolah-aljannah.sch.id',
    'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=200&q=80',
    'Aris Supriyadi, S.Pd., M.M.',
    '198105152005011004',
    'Jakarta Timur',
    '2026-12-18'
);

-- 2. Academic Year & Semesters
INSERT INTO academic_years (id, year_name, is_active, start_date, end_date)
VALUES ('ay-2026', '2026/2027', 1, '2026-07-15', '2027-06-25');

INSERT INTO semesters (id, academic_year_id, semester_number, semester_name, is_active, is_input_open, is_finalized)
VALUES 
('sem-1', 'ay-2026', 1, 'Semester Ganjil', 1, 1, 0),
('sem-2', 'ay-2026', 2, 'Semester Genap', 0, 0, 0);

-- 3. Users (Default pass: password123, hash generated using password_hash('password123', PASSWORD_BCRYPT))
INSERT INTO users (id, username, password_hash, full_name, role, email, phone, is_active)
VALUES
('usr-admin', 'admin', '$2y$10$wT8KjK42o.1jX1L3V7s8uef4nUqN4ZJ/Uvj3wK1zH7I8XyG1U3V2q', 'Administrator E-Rapor SD AJ', 'admin', 'admin@sekolah-aljannah.sch.id', '081299887766', 1),
('usr-kepsek', 'kepsek', '$2y$10$wT8KjK42o.1jX1L3V7s8uef4nUqN4ZJ/Uvj3wK1zH7I8XyG1U3V2q', 'Aris Supriyadi, S.Pd., M.M.', 'kepala_sekolah', 'kepsek@sekolah-aljannah.sch.id', '081311223344', 1),
('usr-wali5a', 'wali.5a', '$2y$10$wT8KjK42o.1jX1L3V7s8uef4nUqN4ZJ/Uvj3wK1zH7I8XyG1U3V2q', 'Siti Rahmawati, S.Pd.I', 'wali_kelas', 'siti.rahmawati@sekolah-aljannah.sch.id', '081522334455', 1),
('usr-gurumapel', 'guru.ipa', '$2y$10$wT8KjK42o.1jX1L3V7s8uef4nUqN4ZJ/Uvj3wK1zH7I8XyG1U3V2q', 'Bambang Hermawan, M.Pd.', 'guru_mapel', 'bambang.hermawan@sekolah-aljannah.sch.id', '081833445566', 1);

-- 4. Teachers
INSERT INTO teachers (id, user_id, nip, nuptk, full_name, title_prefix, title_suffix, gender, phone, employment_status, is_active)
VALUES
('tch-1', 'usr-kepsek', '198105152005011004', '8765432109876543', 'Aris Supriyadi, S.Pd., M.M.', '', 'S.Pd., M.M.', 'L', '081311223344', 'GTY', 1),
('tch-2', 'usr-wali5a', '198807122010012008', '9876543210987654', 'Siti Rahmawati, S.Pd.I', '', 'S.Pd.I', 'P', '081522334455', 'GTY', 1),
('tch-3', 'usr-gurumapel', '198503202008011006', '7654321098765432', 'Bambang Hermawan, M.Pd.', '', 'M.Pd.', 'L', '081833445566', 'GTY', 1),
('tch-4', NULL, '199204182015012012', '6543210987654321', 'Aisyah Putri, S.Pd.', '', 'S.Pd.', 'P', '081744556677', 'GTY', 1);

-- 5. Classes
INSERT INTO classes (id, academic_year_id, class_name, grade_level, phase, homeroom_teacher_id, capacity, is_active)
VALUES
('cls-1a', 'ay-2026', '1A - Al-Farabi', 1, 'A', 'tch-4', 28, 1),
('cls-2a', 'ay-2026', '2A - Ibnu Sina', 2, 'A', 'tch-4', 28, 1),
('cls-3a', 'ay-2026', '3A - Al-Khawarizmi', 3, 'B', 'tch-3', 30, 1),
('cls-4a', 'ay-2026', '4A - Al-Biruni', 4, 'B', 'tch-3', 30, 1),
('cls-5a', 'ay-2026', '5A - Ibnu Battuta', 5, 'C', 'tch-2', 30, 1),
('cls-6a', 'ay-2026', '6A - Al-Jazari', 6, 'C', 'tch-1', 30, 1);

-- 6. Subjects
INSERT INTO subjects (id, subject_code, subject_name, subject_group, target_grade_min, target_grade_max, description, is_active)
VALUES
('sbj-pai', 'PAIBP', 'Pendidikan Agama Islam & Budi Pekerti', 'agama', 1, 6, 'Pendidikan akidah, ibadah, akhlak, dan Al-Quran', 1),
('sbj-pancasila', 'PP', 'Pendidikan Pancasila', 'umum', 1, 6, 'Pendidikan kewarganegaraan & nilai-nilai luhur Pancasila', 1),
('sbj-bindo', 'BIND', 'Bahasa Indonesia', 'umum', 1, 6, 'Literasi bahasa, menyimak, membaca, dan menulis kreatif', 1),
('sbj-mat', 'MAT', 'Matematika', 'umum', 1, 6, 'Bilangan, aljabar, geometri, pengukuran, analisis data', 1),
('sbj-ipas', 'IPAS', 'Ilmu Pengetahuan Alam dan Sosial (IPAS)', 'umum', 3, 6, 'Sains alam, ekosistem, sains sosial, dan sejarah lokal', 1),
('sbj-bing', 'BING', 'Bahasa Inggris', 'umum', 1, 6, 'English communication & global literacy', 1),
('sbj-seni', 'SRUPA', 'Seni Rupa & Kreativitas', 'umum', 1, 6, 'Eksplorasi visual dan ekspresi artistik', 1),
('sbj-pjok', 'PJOK', 'Pendidikan Jasmani, Olahraga & Kesehatan', 'umum', 1, 6, 'Kebugaran jasmani, gerak dasar, dan pola hidup sehat', 1),
('sbj-aljannah', 'ECO', 'Al-Jannah Nature & Science (PLH)', 'khusus', 1, 6, 'Muatan khas sekolah alam, lingkungan hidup, dan sains aplikatif', 1);
