import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeSupabaseUrl,
  hasDataChanged,
  mapStudentFromDb,
  mapStudentToDb,
  mapTeacherFromDb,
  mapTeacherToDb,
  mapSchoolProfileFromDb,
  mapSchoolProfileToDb,
  mapAssessmentFromDb,
  mapAssessmentToDb,
  mapCocurricularRubricFromDb,
  mapCocurricularRubricToDb,
} from './supabase';
import { ClassGroup, Student, Teacher, SchoolProfile, StudentAssessment, CocurricularRubric } from '../types/index';

test('normalizeSupabaseUrl strips /rest/v1 and trailing slashes', () => {
  assert.equal(normalizeSupabaseUrl('https://abc.supabase.co/rest/v1/'), 'https://abc.supabase.co');
  assert.equal(normalizeSupabaseUrl('https://abc.supabase.co/rest/v1'), 'https://abc.supabase.co');
  assert.equal(normalizeSupabaseUrl('  https://abc.supabase.co/// '), 'https://abc.supabase.co');
  assert.equal(normalizeSupabaseUrl(''), '');
});

test('hasDataChanged returns false for structurally equal clones and true when fields differ', () => {
  const a = { id: 'sch-1', schoolName: 'SD IAS Al-Jannah', nested: { arr: [1, 2] } };
  const b = { id: 'sch-1', schoolName: 'SD IAS Al-Jannah', nested: { arr: [1, 2] } };
  const c = { id: 'sch-1', schoolName: 'SD IAS Al-Jannah Baru', nested: { arr: [1, 2] } };
  assert.equal(hasDataChanged(a, b), false);
  assert.equal(hasDataChanged(a, c), true);
  assert.equal(hasDataChanged([{ id: '1' }], [{ id: '1' }]), false);
  assert.equal(hasDataChanged([{ id: '1' }], [{ id: '2' }]), true);
});

test('mapStudentToDb derives current_grade from classes and maps empty currentClassId to null', () => {
  const classes: ClassGroup[] = [
    {
      id: 'cls-1-air',
      className: '1 Air',
      gradeLevel: 1,
      phase: 'A',
      academicYearId: 'ay-2026',
      homeroomTeacherId: '',
      capacity: 28,
      isActive: true,
    },
    {
      id: 'cls-3-bumi',
      className: '3 Bumi',
      gradeLevel: 3,
      phase: 'B',
      academicYearId: 'ay-2026',
      homeroomTeacherId: '',
      capacity: 28,
      isActive: true,
    },
  ];

  const student: Student = {
    id: 'std-1',
    nis: '1001',
    nisn: '0011223344',
    fullName: 'Ahmad Zaki',
    gender: 'L',
    birthPlace: 'Depok',
    birthDate: '2019-04-12',
    religion: 'Islam',
    currentClassId: 'cls-1-air',
    address: 'Jl. Jambore No. 4',
    parentFather: 'Budi',
    parentMother: 'Siti',
    parentPhone: '08123456789',
    admissionYear: '2026',
    status: 'aktif',
  };

  const dbRow = mapStudentToDb(student, classes);
  assert.equal(dbRow.current_class_id, 'cls-1-air');
  assert.equal(dbRow.current_grade, 1);

  const orphanRow = mapStudentToDb({ ...student, currentClassId: '' }, classes);
  assert.equal(orphanRow.current_class_id, null);
  assert.equal(orphanRow.current_grade, 5);

  const backToClient = mapStudentFromDb(dbRow);
  assert.equal(backToClient.fullName, 'Ahmad Zaki');
  assert.equal(backToClient.currentClassId, 'cls-1-air');
  assert.equal(backToClient.admissionYear, '2026');
});

test('mapTeacherFromDb and mapTeacherToDb handle Guru Pendamping and subjects array', () => {
  const teacher: Teacher = {
    id: 'tch-99',
    nip: '',
    fullName: 'Ustadzah Aisyah',
    gender: 'P',
    phone: '081999',
    position: 'Guru Pendamping',
    isActive: true,
    assignedHomeroomClassId: 'cls-1-air',
    assignedSubjectIds: ['sub-1', 'sub-2'],
  };

  const dbRow = mapTeacherToDb(teacher);
  assert.equal(dbRow.role_title, 'guru_pendamping');
  assert.equal(dbRow.assigned_class_id, 'cls-1-air');
  assert.equal(dbRow.is_homeroom_teacher, true);
  assert.deepEqual(dbRow.subjects_taught, ['sub-1', 'sub-2']);

  const mapped = mapTeacherFromDb(dbRow);
  assert.equal(mapped.position, 'Guru Pendamping');
  assert.equal(mapped.assignedHomeroomClassId, 'cls-1-air');
  assert.deepEqual(mapped.assignedSubjectIds, ['sub-1', 'sub-2']);
});

test('mapSchoolProfileFromDb preserves dash NPSN, Depok regency, and intentionally empty strings from Supabase', () => {
  const row = {
    id: 'sch-1',
    school_name: 'SD IAS Al-Jannah (Islamic, Nature & Science School)',
    npsn: '-',
    nss: '-',
    foundation_name: '',
    website: '',
    regency: 'Depok',
    headmaster_name: 'Siti Sriyati, S.Ag',
    headmaster_nip: '',
  };

  const profile: SchoolProfile = mapSchoolProfileFromDb(row);
  assert.equal(profile.npsn, '-');
  assert.equal(profile.foundationName, '');
  assert.equal(profile.website, '');
  assert.equal(profile.regency, 'Depok');
  assert.equal(profile.headmasterName, 'Siti Sriyati, S.Ag');

  const roundTrip = mapSchoolProfileToDb(profile);
  assert.equal(roundTrip.npsn, '-');
  assert.equal(roundTrip.foundation_name, '');
  assert.equal(roundTrip.website, '');
  assert.equal(roundTrip.regency, 'Depok');
});

test('mapAssessmentToDb and mapAssessmentFromDb preserve formativeScores and finalScore', () => {
  const assessment: StudentAssessment = {
    id: 'as-cls-sub-std',
    classId: 'cls-1-air',
    subjectId: 'sub-mtk',
    studentId: 'std-1',
    academicYearId: 'ay-2026',
    semesterId: 'sem-1',
    formatifScores: { 'tp-1': 90, 'tp-2': 85 },
    sumatifMateriScores: { 'lm-1': 88 },
    sumatifAkhir: 92,
    formatifAvg: 88,
    sumatifMateriAvg: 88,
    finalScore: 89,
    highestTpIds: ['tp-1'],
    lowestTpIds: [],
    achievementDesc: 'Menguasai bilangan cacah dengan baik.',
    status: 'approved',
    updatedAt: '2026-11-25T10:00:00.000Z',
  };

  const dbRow = mapAssessmentToDb(assessment);
  assert.equal(dbRow.final_score, 89);
  assert.equal(dbRow.formative_scores.classId, 'cls-1-air');

  const restored = mapAssessmentFromDb(dbRow);
  assert.equal(restored.finalScore, 89);
  assert.equal(restored.classId, 'cls-1-air');
  assert.equal(restored.formatifScores['tp-1'], 90);
  assert.equal(restored.achievementDesc, 'Menguasai bilangan cacah dengan baik.');
});

test('mapCocurricularRubricToDb and mapCocurricularRubricFromDb round-trip relatedSubjects and activityForm', () => {
  const rubric: CocurricularRubric = {
    id: 'rub-1',
    activityId: 'act-1',
    dimension: 'Penalaran Kritis',
    theme: 'Gaya Hidup Berkelanjutan',
    objective: 'Mengelola sampah organik menjadi kompos.',
    activityForm: 'Proyek Kompos',
    relatedSubjects: ['IPAS', 'Matematika'],
    indicator: 'Menganalisis proses dekomposisi.',
  };

  const dbRow = mapCocurricularRubricToDb(rubric);
  assert.equal(dbRow.target_grade_level, 'IPAS, Matematika');
  assert.equal(dbRow.activity_form, 'Proyek Kompos');

  const restored = mapCocurricularRubricFromDb(dbRow);
  assert.deepEqual(restored.relatedSubjects, ['IPAS', 'Matematika']);
  assert.equal(restored.activityForm, 'Proyek Kompos');
  assert.equal(restored.theme, 'Gaya Hidup Berkelanjutan');
});
