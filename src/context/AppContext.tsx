/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Application Context and State Management for E-Rapor SD AJ
 * Fully integrated with Supabase PostgreSQL Database & Realtime Subscriptions
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  User,
  UserRole,
  SchoolProfile,
  AcademicYear,
  Semester,
  Teacher,
  ClassGroup,
  Student,
  Subject,
  LearningOutcomeCP,
  LearningObjectiveTP,
  StudentAssessment,
  Extracurricular,
  ExtracurricularMember,
  CocurricularActivity,
  CocurricularRubric,
  CocurricularAssessment,
  StudentAttendance,
  HomeroomNote,
  StudentAchievement,
  ReportFinalization,
  AuditLog,
} from '../types/index.ts';
import {
  INITIAL_SCHOOL_PROFILE,
  INITIAL_ACADEMIC_YEARS,
  INITIAL_SEMESTERS,
  INITIAL_USERS,
  INITIAL_TEACHERS,
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_STUDENTS,
  INITIAL_CPS,
  INITIAL_TPS,
  INITIAL_ASSESSMENTS,
  INITIAL_COCURRICULAR_ACTIVITIES,
  INITIAL_COCURRICULAR_RUBRICS,
  INITIAL_COCURRICULAR_ASSESSMENTS,
  INITIAL_EXTRACURRICULARS,
  INITIAL_EXTRACURRICULAR_MEMBERS,
  INITIAL_ATTENDANCES,
  INITIAL_HOMEROOM_NOTES,
  INITIAL_ACHIEVEMENTS,
  INITIAL_REPORT_FINALIZATIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData.ts';
import {
  getSupabaseClient,
  fetchAllDataFromSupabase,
  subscribeToAllChanges,
  dbUpsert,
  dbDelete,
  mapSchoolProfileToDb,
  mapSchoolProfileFromDb,
  mapTeacherToDb,
  mapTeacherFromDb,
  mapClassToDb,
  mapClassFromDb,
  mapStudentToDb,
  mapStudentFromDb,
  mapSubjectToDb,
  mapSubjectFromDb,
  mapAssessmentToDb,
  mapAssessmentFromDb,
  mapExtracurricularToDb,
  mapExtracurricularFromDb,
  mapExtracurricularMemberToDb,
  mapExtracurricularMemberFromDb,
  mapAttendanceToDb,
  mapAttendanceFromDb,
  mapHomeroomNoteToDb,
  mapHomeroomNoteFromDb,
  mapAchievementToDb,
  mapAchievementFromDb,
  mapCocurricularActivityToDb,
  mapCocurricularActivityFromDb,
  mapCocurricularRubricToDb,
  mapCocurricularRubricFromDb,
  mapCocurricularAssessmentToDb,
  mapCocurricularAssessmentFromDb,
  mapAcademicYearFromDb,
  mapSemesterFromDb,
  mapAuditLogFromDb,
} from '../lib/supabase.ts';

export interface SupabaseSyncState {
  isConnected: boolean;
  isRealtime: boolean;
  isLoading: boolean;
  lastSync: Date | null;
  lastError: string | null;
  pendingPermissions: string[];
}

interface AppContextType {
  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Supabase Realtime & Sync Status
  supabaseSyncStatus: SupabaseSyncState;
  refetchFromSupabase: () => Promise<void>;

  // Active User / Role
  currentUser: User;
  switchUserRole: (role: UserRole) => void;
  setCurrentUser: (user: User) => void;

  // Period
  academicYears: AcademicYear[];
  activeAcademicYear: AcademicYear;
  setActiveAcademicYearId: (id: string) => void;
  semesters: Semester[];
  activeSemester: Semester;
  setActiveSemesterId: (id: string) => void;

  // Navigation / Views
  currentView: string;
  setCurrentView: (view: string) => void;

  // School Profile
  schoolProfile: SchoolProfile;
  updateSchoolProfile: (profile: Partial<SchoolProfile>) => Promise<void>;

  // Teachers
  teachers: Teacher[];
  addTeacher: (teacher: Omit<Teacher, 'id'>) => Promise<void>;
  updateTeacher: (id: string, teacher: Partial<Teacher>) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;

  // Classes
  classes: ClassGroup[];
  addClass: (cls: Omit<ClassGroup, 'id'>) => Promise<void>;
  updateClass: (id: string, cls: Partial<ClassGroup>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;

  // Students
  students: Student[];
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (id: string, student: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  importStudents: (newStudents: Omit<Student, 'id'>[]) => Promise<void>;

  // Subjects
  subjects: Subject[];
  addSubject: (subj: Omit<Subject, 'id'>) => Promise<void>;
  updateSubject: (id: string, subj: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;

  // CP & TP
  cps: LearningOutcomeCP[];
  tps: LearningObjectiveTP[];
  addCP: (cp: Omit<LearningOutcomeCP, 'id'>) => void;
  updateCP: (id: string, cp: Partial<LearningOutcomeCP>) => void;
  deleteCP: (id: string) => void;
  addTP: (tp: Omit<LearningObjectiveTP, 'id'>) => void;
  updateTP: (id: string, tp: Partial<LearningObjectiveTP>) => void;
  deleteTP: (id: string) => void;

  // Assessments
  assessments: StudentAssessment[];
  saveStudentAssessment: (assessment: Omit<StudentAssessment, 'id' | 'updatedAt'>) => Promise<void>;
  bulkSaveAssessments: (newAssessments: StudentAssessment[]) => Promise<void>;

  // Kokurikuler (Rubrik dan Asesmen)
  cocurricularActivities: CocurricularActivity[];
  cocurricularRubrics: CocurricularRubric[];
  cocurricularAssessments: CocurricularAssessment[];
  saveCocurricularAssessment: (assessment: Omit<CocurricularAssessment, 'id'>) => Promise<void>;
  addCocurricularActivity: (activity: Omit<CocurricularActivity, 'id'>, rubrics: Omit<CocurricularRubric, 'id' | 'activityId'>[]) => Promise<void>;
  addCocurricularRubric: (rubric: Omit<CocurricularRubric, 'id'>) => Promise<void>;
  updateCocurricularRubric: (id: string, rubric: Partial<CocurricularRubric>) => Promise<void>;
  deleteCocurricularRubric: (id: string) => Promise<void>;

  // Extracurriculars
  extracurriculars: Extracurricular[];
  extracurricularMembers: ExtracurricularMember[];
  addExtracurricular: (ekskul: Omit<Extracurricular, 'id'>) => Promise<void>;
  updateExtracurricular: (id: string, ekskul: Partial<Extracurricular>) => Promise<void>;
  deleteExtracurricular: (id: string) => Promise<void>;
  saveExtracurricularMember: (member: Omit<ExtracurricularMember, 'id'>) => Promise<void>;
  bulkSaveExtracurricularMembers: (members: Omit<ExtracurricularMember, 'id'>[]) => Promise<void>;
  removeExtracurricularMember: (studentId: string, extracurricularId: string, semesterId: string) => Promise<void>;

  // Attendance
  attendances: StudentAttendance[];
  saveAttendance: (att: Omit<StudentAttendance, 'id'>) => Promise<void>;
  bulkSaveAttendance: (items: Omit<StudentAttendance, 'id'>[]) => Promise<void>;

  // Homeroom Notes
  homeroomNotes: HomeroomNote[];
  saveHomeroomNote: (note: Omit<HomeroomNote, 'id'>) => Promise<void>;

  // Achievements
  achievements: StudentAchievement[];
  addAchievement: (ach: Omit<StudentAchievement, 'id'>) => Promise<void>;
  updateAchievement: (id: string, ach: Partial<StudentAchievement>) => Promise<void>;
  deleteAchievement: (id: string) => Promise<void>;

  // Finalization
  reportFinalizations: ReportFinalization[];
  updateFinalizationStatus: (classId: string, status: ReportFinalization['status'], reason?: string) => void;

  // Audit Logs
  auditLogs: AuditLog[];
  logAction: (action: string, entityType: string, entityId: string, details: string) => void;

  // System
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'erapor_sd_aj_state_v1';

const safeReadStorage = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore storage read error
  }
  return fallback;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const hasSupabaseConfigured = Boolean(getSupabaseClient());

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('erapor_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('erapor_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('erapor_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Active view
  const [currentView, setCurrentView] = useState<string>('dashboard');

  // Supabase Realtime and Sync Status
  const [supabaseSyncStatus, setSupabaseSyncStatus] = useState<SupabaseSyncState>({
    isConnected: false,
    isRealtime: false,
    isLoading: hasSupabaseConfigured,
    lastSync: null,
    lastError: null,
    pendingPermissions: [],
  });

  // State initialization: use localStorage cache if present; when Supabase is configured and
  // no cache exists yet, start transactional/master lists empty until Supabase responds so
  // deleted dummy students/grades are never flashed.
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_school`);
    if (!saved) return INITIAL_SCHOOL_PROFILE;
    try {
      const parsed = JSON.parse(saved);
      const logoUrl = (!parsed.logoUrl || parsed.logoUrl.includes('unsplash.com'))
        ? '/logo-aljannah-emblem.png'
        : parsed.logoUrl;
      return {
        ...INITIAL_SCHOOL_PROFILE,
        ...parsed,
        logoUrl,
      };
    } catch {
      return INITIAL_SCHOOL_PROFILE;
    }
  });

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(() =>
    safeReadStorage(`${STORAGE_KEY}_academic_years`, INITIAL_ACADEMIC_YEARS)
  );

  const [semesters, setSemesters] = useState<Semester[]>(() =>
    safeReadStorage(`${STORAGE_KEY}_semesters`, INITIAL_SEMESTERS)
  );

  const [users, setUsers] = useState<User[]>(() =>
    safeReadStorage(`${STORAGE_KEY}_users`, INITIAL_USERS)
  );

  const [currentUser, setCurrentUser] = useState<User>(() => users[0]);

  const [teachers, setTeachers] = useState<Teacher[]>(() =>
    safeReadStorage(`${STORAGE_KEY}_teachers`, hasSupabaseConfigured ? [] : INITIAL_TEACHERS)
  );

  const [classes, setClasses] = useState<ClassGroup[]>(() =>
    safeReadStorage(`${STORAGE_KEY}_classes`, hasSupabaseConfigured ? [] : INITIAL_CLASSES)
  );

  const [students, setStudents] = useState<Student[]>(() =>
    safeReadStorage(`${STORAGE_KEY}_students`, hasSupabaseConfigured ? [] : INITIAL_STUDENTS)
  );

  const [subjects, setSubjects] = useState<Subject[]>(() =>
    safeReadStorage(`${STORAGE_KEY}_subjects`, hasSupabaseConfigured ? [] : INITIAL_SUBJECTS)
  );

  const [cps, setCps] = useState<LearningOutcomeCP[]>(() =>
    safeReadStorage(`${STORAGE_KEY}_cps`, INITIAL_CPS)
  );

  const [tps, setTps] = useState<LearningObjectiveTP[]>(() =>
    safeReadStorage(`${STORAGE_KEY}_tps`, INITIAL_TPS)
  );

  const [assessments, setAssessments] = useState<StudentAssessment[]>(() =>
    safeReadStorage(`${STORAGE_KEY}_assessments`, hasSupabaseConfigured ? [] : INITIAL_ASSESSMENTS)
  );

  const [cocurricularActivities, setCocurricularActivities] = useState<CocurricularActivity[]>(() =>
    safeReadStorage(`${STORAGE_KEY}_p5_activities`, INITIAL_COCURRICULAR_ACTIVITIES)
  );

  const [cocurricularRubrics, setCocurricularRubrics] = useState<CocurricularRubric[]>(() =>
    safeReadStorage(`${STORAGE_KEY}_p5_rubrics`, INITIAL_COCURRICULAR_RUBRICS)
  );

  const [cocurricularAssessments, setCocurricularAssessments] = useState<CocurricularAssessment[]>(() =>
    safeReadStorage(`${STORAGE_KEY}_p5_assessments`, hasSupabaseConfigured ? [] : INITIAL_COCURRICULAR_ASSESSMENTS)
  );

  const [extracurriculars, setExtracurriculars] = useState<Extracurricular[]>(() =>
    safeReadStorage(`${STORAGE_KEY}_ekskul`, hasSupabaseConfigured ? [] : INITIAL_EXTRACURRICULARS)
  );

  const [extracurricularMembers, setExtracurricularMembers] = useState<ExtracurricularMember[]>(() =>
    safeReadStorage(`${STORAGE_KEY}_ekskul_members`, hasSupabaseConfigured ? [] : INITIAL_EXTRACURRICULAR_MEMBERS)
  );

  const [attendances, setAttendances] = useState<StudentAttendance[]>(() =>
    safeReadStorage(`${STORAGE_KEY}_attendances`, hasSupabaseConfigured ? [] : INITIAL_ATTENDANCES)
  );

  const [homeroomNotes, setHomeroomNotes] = useState<HomeroomNote[]>(() =>
    safeReadStorage(`${STORAGE_KEY}_hr_notes`, hasSupabaseConfigured ? [] : INITIAL_HOMEROOM_NOTES)
  );

  const [achievements, setAchievements] = useState<StudentAchievement[]>(() =>
    safeReadStorage(`${STORAGE_KEY}_achievements`, hasSupabaseConfigured ? [] : INITIAL_ACHIEVEMENTS)
  );

  const [reportFinalizations, setReportFinalizations] = useState<ReportFinalization[]>(() =>
    safeReadStorage(`${STORAGE_KEY}_finalizations`, INITIAL_REPORT_FINALIZATIONS)
  );

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    safeReadStorage(`${STORAGE_KEY}_audit`, INITIAL_AUDIT_LOGS)
  );

  // Refs to guarantee synchronous access to latest state in async CRUD handlers (avoids React 19 setState batching bug)
  const schoolProfileRef = useRef(schoolProfile); schoolProfileRef.current = schoolProfile;
  const academicYearsRef = useRef(academicYears); academicYearsRef.current = academicYears;
  const semestersRef = useRef(semesters); semestersRef.current = semesters;
  const teachersRef = useRef(teachers); teachersRef.current = teachers;
  const classesRef = useRef(classes); classesRef.current = classes;
  const studentsRef = useRef(students); studentsRef.current = students;
  const subjectsRef = useRef(subjects); subjectsRef.current = subjects;
  const assessmentsRef = useRef(assessments); assessmentsRef.current = assessments;
  const cocurricularActivitiesRef = useRef(cocurricularActivities); cocurricularActivitiesRef.current = cocurricularActivities;
  const cocurricularRubricsRef = useRef(cocurricularRubrics); cocurricularRubricsRef.current = cocurricularRubrics;
  const cocurricularAssessmentsRef = useRef(cocurricularAssessments); cocurricularAssessmentsRef.current = cocurricularAssessments;
  const extracurricularsRef = useRef(extracurriculars); extracurricularsRef.current = extracurriculars;
  const extracurricularMembersRef = useRef(extracurricularMembers); extracurricularMembersRef.current = extracurricularMembers;
  const attendancesRef = useRef(attendances); attendancesRef.current = attendances;
  const homeroomNotesRef = useRef(homeroomNotes); homeroomNotesRef.current = homeroomNotes;
  const achievementsRef = useRef(achievements); achievementsRef.current = achievements;
  const currentUserRef = useRef(currentUser); currentUserRef.current = currentUser;

  const hasHydratedSupabaseRef = useRef(false);
  const lastRefetchTimeRef = useRef(0);

  // Keep local storage synchronized as an offline cache (only after initial hydration or when offline)
  useEffect(() => {
    if (hasSupabaseConfigured && !hasHydratedSupabaseRef.current) return;
    try {
      localStorage.setItem(`${STORAGE_KEY}_school`, JSON.stringify(schoolProfile));
      localStorage.setItem(`${STORAGE_KEY}_academic_years`, JSON.stringify(academicYears));
      localStorage.setItem(`${STORAGE_KEY}_semesters`, JSON.stringify(semesters));
      localStorage.setItem(`${STORAGE_KEY}_teachers`, JSON.stringify(teachers));
      localStorage.setItem(`${STORAGE_KEY}_classes`, JSON.stringify(classes));
      localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(students));
      localStorage.setItem(`${STORAGE_KEY}_subjects`, JSON.stringify(subjects));
      localStorage.setItem(`${STORAGE_KEY}_cps`, JSON.stringify(cps));
      localStorage.setItem(`${STORAGE_KEY}_tps`, JSON.stringify(tps));
      localStorage.setItem(`${STORAGE_KEY}_assessments`, JSON.stringify(assessments));
      localStorage.setItem(`${STORAGE_KEY}_p5_activities`, JSON.stringify(cocurricularActivities));
      localStorage.setItem(`${STORAGE_KEY}_p5_rubrics`, JSON.stringify(cocurricularRubrics));
      localStorage.setItem(`${STORAGE_KEY}_p5_assessments`, JSON.stringify(cocurricularAssessments));
      localStorage.setItem(`${STORAGE_KEY}_ekskul`, JSON.stringify(extracurriculars));
      localStorage.setItem(`${STORAGE_KEY}_ekskul_members`, JSON.stringify(extracurricularMembers));
      localStorage.setItem(`${STORAGE_KEY}_attendances`, JSON.stringify(attendances));
      localStorage.setItem(`${STORAGE_KEY}_hr_notes`, JSON.stringify(homeroomNotes));
      localStorage.setItem(`${STORAGE_KEY}_achievements`, JSON.stringify(achievements));
      localStorage.setItem(`${STORAGE_KEY}_finalizations`, JSON.stringify(reportFinalizations));
      localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
    } catch {
      // ignore quota errors
    }
  }, [
    hasSupabaseConfigured,
    schoolProfile, academicYears, semesters, teachers, classes, students, subjects,
    cps, tps, assessments, cocurricularActivities, cocurricularRubrics, cocurricularAssessments,
    extracurriculars, extracurricularMembers, attendances, homeroomNotes, achievements,
    reportFinalizations, auditLogs
  ]);

  // Active periods
  const activeAcademicYear = academicYears.find(y => y.isActive) || academicYears[0] || INITIAL_ACADEMIC_YEARS[0];
  const activeSemester = semesters.find(s => s.isActive && s.academicYearId === activeAcademicYear.id) || semesters[0] || INITIAL_SEMESTERS[0];

  const logAction = useCallback((action: string, entityType: string, entityId: string, details: string) => {
    const user = currentUserRef.current;
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      userName: user.fullName,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 99)]);
  }, []);

  const setActiveAcademicYearId = async (id: string) => {
    const nextYears = academicYearsRef.current.map(y => ({ ...y, isActive: y.id === id }));
    academicYearsRef.current = nextYears;
    setAcademicYears(nextYears);
    logAction('SWITCH_ACADEMIC_YEAR', 'academic_year', id, `Mengubah tahun pelajaran aktif ke ${id}`);
    const client = getSupabaseClient();
    if (client) {
      await Promise.all(
        nextYears.map(y => client.from('academic_years').update({ is_active: y.isActive }).eq('id', y.id))
      );
    }
  };

  const setActiveSemesterId = async (id: string) => {
    const nextSemesters = semestersRef.current.map(s => ({ ...s, isActive: s.id === id }));
    semestersRef.current = nextSemesters;
    setSemesters(nextSemesters);
    logAction('SWITCH_SEMESTER', 'semester', id, `Mengubah semester aktif ke ${id}`);
    const client = getSupabaseClient();
    if (client) {
      await Promise.all(
        nextSemesters.map(s => client.from('semesters').update({ is_active: s.isActive }).eq('id', s.id))
      );
    }
  };

  const switchUserRole = (role: UserRole) => {
    const targetUser = users.find(u => u.role === role) || users[0];
    setCurrentUser(targetUser);
    logAction('SWITCH_ROLE', 'user', targetUser.id, `Beralih peran menjadi ${role} (${targetUser.fullName})`);
  };

  // ==============================================================================
  // SUPABASE DATA FETCH & REALTIME SUBSCRIPTION
  // ==============================================================================

  const refetchFromSupabase = useCallback(async () => {
    const client = getSupabaseClient();
    if (!client) {
      setSupabaseSyncStatus(prev => ({ ...prev, isConnected: false, isLoading: false }));
      return;
    }

    lastRefetchTimeRef.current = Date.now();
    try {
      const data = await fetchAllDataFromSupabase();

      if (!data.hasSuccess) {
        // Offline / unreachable: fall back to mock data only if state is completely empty
        if (teachersRef.current.length === 0) setTeachers(INITIAL_TEACHERS);
        if (classesRef.current.length === 0) setClasses(INITIAL_CLASSES);
        if (subjectsRef.current.length === 0) setSubjects(INITIAL_SUBJECTS);
        if (extracurricularsRef.current.length === 0) setExtracurriculars(INITIAL_EXTRACURRICULARS);
        setSupabaseSyncStatus(prev => ({
          ...prev,
          isConnected: false,
          isLoading: false,
          lastError: 'Tidak dapat menjangkau server Supabase.',
        }));
        return;
      }

      hasHydratedSupabaseRef.current = true;

      if (data.schoolProfile) {
        schoolProfileRef.current = data.schoolProfile;
        setSchoolProfile(data.schoolProfile);
      }
      if (data.academicYears) {
        academicYearsRef.current = data.academicYears;
        setAcademicYears(data.academicYears);
      }
      if (data.semesters) {
        semestersRef.current = data.semesters;
        setSemesters(data.semesters);
      }
      if (data.teachers !== undefined) {
        teachersRef.current = data.teachers;
        setTeachers(data.teachers);
      }
      if (data.classes !== undefined) {
        classesRef.current = data.classes;
        setClasses(data.classes);
      }
      if (data.subjects !== undefined) {
        subjectsRef.current = data.subjects;
        setSubjects(data.subjects);
      }
      if (data.students !== undefined) {
        studentsRef.current = data.students;
        setStudents(data.students);
      }
      if (data.extracurriculars !== undefined) {
        extracurricularsRef.current = data.extracurriculars;
        setExtracurriculars(data.extracurriculars);
      }
      if (data.extracurricularMembers !== undefined) {
        extracurricularMembersRef.current = data.extracurricularMembers;
        setExtracurricularMembers(data.extracurricularMembers);
      }
      if (data.assessments !== undefined) {
        assessmentsRef.current = data.assessments;
        setAssessments(data.assessments);
      }
      if (data.attendances !== undefined) {
        attendancesRef.current = data.attendances;
        setAttendances(data.attendances);
      }
      if (data.homeroomNotes !== undefined) {
        homeroomNotesRef.current = data.homeroomNotes;
        setHomeroomNotes(data.homeroomNotes);
      }
      if (data.achievements !== undefined) {
        achievementsRef.current = data.achievements;
        setAchievements(data.achievements);
      }
      if (data.cocurricularActivities) {
        cocurricularActivitiesRef.current = data.cocurricularActivities;
        setCocurricularActivities(data.cocurricularActivities);
      }
      if (data.cocurricularRubrics) {
        cocurricularRubricsRef.current = data.cocurricularRubrics;
        setCocurricularRubrics(data.cocurricularRubrics);
      }
      if (data.cocurricularAssessments !== undefined) {
        cocurricularAssessmentsRef.current = data.cocurricularAssessments;
        setCocurricularAssessments(data.cocurricularAssessments);
      }
      if (data.auditLogs) {
        setAuditLogs(data.auditLogs);
      }

      setSupabaseSyncStatus(prev => ({
        ...prev,
        isConnected: true,
        isLoading: false,
        lastSync: new Date(),
        lastError: null,
        pendingPermissions: data.permissionErrors,
      }));
    } catch (err: any) {
      console.warn('Error fetching Supabase data:', err);
      setSupabaseSyncStatus(prev => ({
        ...prev,
        isConnected: false,
        isLoading: false,
        lastError: err?.message || 'Gagal memuat data Supabase.',
      }));
    }
  }, []);

  // Initial load, Realtime subscription, and Tab-Focus / Periodic Auto-Sync
  useEffect(() => {
    refetchFromSupabase();

    const upsertItem = <T extends { id: string }>(
      setter: React.Dispatch<React.SetStateAction<T[]>>,
      ref: React.MutableRefObject<T[]>,
      mapped: T
    ) => {
      setter(prev => {
        const idx = prev.findIndex(item => item.id === mapped.id);
        const next = idx >= 0
          ? prev.map((item, i) => (i === idx ? mapped : item))
          : [...prev, mapped];
        ref.current = next;
        return next;
      });
    };

    const removeItem = <T extends { id: string }>(
      setter: React.Dispatch<React.SetStateAction<T[]>>,
      ref: React.MutableRefObject<T[]>,
      id?: string
    ) => {
      if (!id) {
        refetchFromSupabase();
        return;
      }
      setter(prev => {
        const next = prev.filter(item => item.id !== id);
        ref.current = next;
        return next;
      });
    };

    const unsubscribe = subscribeToAllChanges(
      (table, eventType, newRow, oldRow) => {
        setSupabaseSyncStatus(prev => ({
          ...prev,
          isConnected: true,
          isRealtime: true,
          lastSync: new Date(),
        }));

        switch (table) {
          case 'students':
            if (eventType === 'DELETE') removeItem(setStudents, studentsRef, oldRow?.id);
            else upsertItem(setStudents, studentsRef, mapStudentFromDb(newRow));
            break;

          case 'teachers':
            if (eventType === 'DELETE') removeItem(setTeachers, teachersRef, oldRow?.id);
            else upsertItem(setTeachers, teachersRef, mapTeacherFromDb(newRow));
            break;

          case 'classes':
            if (eventType === 'DELETE') removeItem(setClasses, classesRef, oldRow?.id);
            else upsertItem(setClasses, classesRef, mapClassFromDb(newRow));
            break;

          case 'subjects':
            if (eventType === 'DELETE') removeItem(setSubjects, subjectsRef, oldRow?.id);
            else upsertItem(setSubjects, subjectsRef, mapSubjectFromDb(newRow));
            break;

          case 'academic_years':
            if (eventType === 'DELETE') removeItem(setAcademicYears, academicYearsRef, oldRow?.id);
            else upsertItem(setAcademicYears, academicYearsRef, mapAcademicYearFromDb(newRow));
            break;

          case 'semesters':
            if (eventType === 'DELETE') removeItem(setSemesters, semestersRef, oldRow?.id);
            else upsertItem(setSemesters, semestersRef, mapSemesterFromDb(newRow));
            break;

          case 'school_profiles':
            if (eventType !== 'DELETE' && newRow) {
              const mapped = mapSchoolProfileFromDb(newRow);
              schoolProfileRef.current = mapped;
              setSchoolProfile(mapped);
            }
            break;

          case 'assessments':
            if (eventType === 'DELETE') removeItem(setAssessments, assessmentsRef, oldRow?.id);
            else upsertItem(setAssessments, assessmentsRef, mapAssessmentFromDb(newRow));
            break;

          case 'extracurriculars':
            if (eventType === 'DELETE') removeItem(setExtracurriculars, extracurricularsRef, oldRow?.id);
            else upsertItem(setExtracurriculars, extracurricularsRef, mapExtracurricularFromDb(newRow));
            break;

          case 'extracurricular_members':
            if (eventType === 'DELETE') removeItem(setExtracurricularMembers, extracurricularMembersRef, oldRow?.id);
            else upsertItem(setExtracurricularMembers, extracurricularMembersRef, mapExtracurricularMemberFromDb(newRow));
            break;

          case 'attendances':
            if (eventType === 'DELETE') removeItem(setAttendances, attendancesRef, oldRow?.id);
            else upsertItem(setAttendances, attendancesRef, mapAttendanceFromDb(newRow));
            break;

          case 'homeroom_notes':
            if (eventType === 'DELETE') removeItem(setHomeroomNotes, homeroomNotesRef, oldRow?.id);
            else upsertItem(setHomeroomNotes, homeroomNotesRef, mapHomeroomNoteFromDb(newRow));
            break;

          case 'student_achievements':
            if (eventType === 'DELETE') removeItem(setAchievements, achievementsRef, oldRow?.id);
            else upsertItem(setAchievements, achievementsRef, mapAchievementFromDb(newRow));
            break;

          case 'cocurricular_activities':
            if (eventType === 'DELETE') removeItem(setCocurricularActivities, cocurricularActivitiesRef, oldRow?.id);
            else upsertItem(setCocurricularActivities, cocurricularActivitiesRef, mapCocurricularActivityFromDb(newRow));
            break;

          case 'cocurricular_rubrics':
            if (eventType === 'DELETE') removeItem(setCocurricularRubrics, cocurricularRubricsRef, oldRow?.id);
            else upsertItem(setCocurricularRubrics, cocurricularRubricsRef, mapCocurricularRubricFromDb(newRow));
            break;

          case 'cocurricular_assessments':
            if (eventType === 'DELETE') removeItem(setCocurricularAssessments, cocurricularAssessmentsRef, oldRow?.id);
            else upsertItem(setCocurricularAssessments, cocurricularAssessmentsRef, mapCocurricularAssessmentFromDb(newRow));
            break;

          case 'audit_logs':
            if (eventType === 'INSERT' && newRow) {
              const mapped = mapAuditLogFromDb(newRow);
              setAuditLogs(prev => [mapped, ...prev.filter(l => l.id !== mapped.id).slice(0, 99)]);
            }
            break;

          default:
            break;
        }
      },
      (status) => {
        setSupabaseSyncStatus(prev => ({
          ...prev,
          isRealtime: status === 'SUBSCRIBED',
        }));
      }
    );

    // Re-sync automatically when user switches back to this tab/window after editing Supabase Dashboard
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'hidden') return;
      if (Date.now() - lastRefetchTimeRef.current > 3000) {
        refetchFromSupabase();
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    // Periodic fallback polling every 25s in case any WebSocket event was missed
    const pollInterval = window.setInterval(() => {
      if (document.visibilityState !== 'hidden') {
        refetchFromSupabase();
      }
    }, 25000);

    return () => {
      unsubscribe();
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.clearInterval(pollInterval);
    };
  }, [refetchFromSupabase]);

  // Helper to record write failures clearly
  const reportWriteResult = (res: { success: boolean; error?: string }) => {
    if (!res.success && res.error) {
      setSupabaseSyncStatus(prev => ({ ...prev, lastError: res.error || null }));
    } else if (res.success) {
      setSupabaseSyncStatus(prev => ({ ...prev, lastSync: new Date(), lastError: null }));
    }
  };

  // ==============================================================================
  // DIRECT CRUD OPERATIONS (SYNCHRONOUS REF COMPUTATION + SUPABASE PERSISTENCE)
  // ==============================================================================

  const updateSchoolProfile = async (profile: Partial<SchoolProfile>) => {
    const updated = { ...schoolProfileRef.current, ...profile };
    schoolProfileRef.current = updated;
    setSchoolProfile(updated);
    logAction('UPDATE_SCHOOL_PROFILE', 'school_profile', updated.id, 'Memperbarui data profil sekolah');
    const res = await dbUpsert('school_profiles', mapSchoolProfileToDb(updated));
    reportWriteResult(res);
  };

  const addTeacher = async (teacher: Omit<Teacher, 'id'>) => {
    const newTch: Teacher = { ...teacher, id: `tch-${Date.now()}` };
    const next = [...teachersRef.current, newTch];
    teachersRef.current = next;
    setTeachers(next);
    logAction('ADD_TEACHER', 'teacher', newTch.id, `Menambahkan guru baru: ${newTch.fullName}`);
    const res = await dbUpsert('teachers', mapTeacherToDb(newTch));
    reportWriteResult(res);
  };

  const updateTeacher = async (id: string, teacher: Partial<Teacher>) => {
    const existing = teachersRef.current.find(t => t.id === id);
    if (!existing) return;
    const updatedTch: Teacher = { ...existing, ...teacher };
    const next = teachersRef.current.map(t => (t.id === id ? updatedTch : t));
    teachersRef.current = next;
    setTeachers(next);
    logAction('UPDATE_TEACHER', 'teacher', id, `Memperbarui data guru ${updatedTch.fullName}`);
    const res = await dbUpsert('teachers', mapTeacherToDb(updatedTch));
    reportWriteResult(res);
  };

  const deleteTeacher = async (id: string) => {
    const next = teachersRef.current.filter(t => t.id !== id);
    teachersRef.current = next;
    setTeachers(next);
    logAction('DELETE_TEACHER', 'teacher', id, `Menghapus data guru ${id}`);
    const res = await dbDelete('teachers', id);
    reportWriteResult(res);
  };

  const addClass = async (cls: Omit<ClassGroup, 'id'>) => {
    const newCls: ClassGroup = { ...cls, id: `cls-${Date.now()}` };
    const next = [...classesRef.current, newCls];
    classesRef.current = next;
    setClasses(next);
    logAction('ADD_CLASS', 'class', newCls.id, `Menambahkan kelas baru: ${newCls.className}`);
    const res = await dbUpsert('classes', mapClassToDb(newCls));
    reportWriteResult(res);
  };

  const updateClass = async (id: string, cls: Partial<ClassGroup>) => {
    const existing = classesRef.current.find(c => c.id === id);
    if (!existing) return;
    const updatedCls: ClassGroup = { ...existing, ...cls };
    const next = classesRef.current.map(c => (c.id === id ? updatedCls : c));
    classesRef.current = next;
    setClasses(next);
    logAction('UPDATE_CLASS', 'class', id, `Memperbarui data kelas ${updatedCls.className}`);
    const res = await dbUpsert('classes', mapClassToDb(updatedCls));
    reportWriteResult(res);
  };

  const deleteClass = async (id: string) => {
    const next = classesRef.current.filter(c => c.id !== id);
    classesRef.current = next;
    setClasses(next);
    logAction('DELETE_CLASS', 'class', id, `Menghapus kelas ${id}`);
    const res = await dbDelete('classes', id);
    reportWriteResult(res);
  };

  const addStudent = async (student: Omit<Student, 'id'>) => {
    const newStd: Student = { ...student, id: `std-${Date.now()}` };
    const next = [...studentsRef.current, newStd];
    studentsRef.current = next;
    setStudents(next);
    logAction('ADD_STUDENT', 'student', newStd.id, `Menambahkan siswa baru: ${newStd.fullName}`);
    const res = await dbUpsert('students', mapStudentToDb(newStd, classesRef.current));
    reportWriteResult(res);
  };

  const updateStudent = async (id: string, student: Partial<Student>) => {
    const existing = studentsRef.current.find(s => s.id === id);
    if (!existing) return;
    const updatedStd: Student = { ...existing, ...student };
    const next = studentsRef.current.map(s => (s.id === id ? updatedStd : s));
    studentsRef.current = next;
    setStudents(next);
    logAction('UPDATE_STUDENT', 'student', id, `Memperbarui data siswa ${updatedStd.fullName}`);
    const res = await dbUpsert('students', mapStudentToDb(updatedStd, classesRef.current));
    reportWriteResult(res);
  };

  const deleteStudent = async (id: string) => {
    const next = studentsRef.current.filter(s => s.id !== id);
    studentsRef.current = next;
    setStudents(next);
    logAction('DELETE_STUDENT', 'student', id, `Menghapus/mengarsipkan siswa ${id}`);
    const res = await dbDelete('students', id);
    reportWriteResult(res);
  };

  const importStudents = async (newStudents: Omit<Student, 'id'>[]) => {
    const copy = [...studentsRef.current];
    const preparedList: Student[] = [];

    newStudents.forEach((s, idx) => {
      const existingIdx = copy.findIndex(exist =>
        (s.nis && exist.nis.trim() === s.nis.trim()) ||
        (s.nisn && exist.nisn.trim() === s.nisn.trim())
      );
      if (existingIdx >= 0) {
        const merged = { ...copy[existingIdx], ...s };
        copy[existingIdx] = merged;
        preparedList.push(merged);
      } else {
        const item: Student = { ...s, id: `std-imp-${Date.now()}-${idx}` };
        copy.push(item);
        preparedList.push(item);
      }
    });

    studentsRef.current = copy;
    setStudents(copy);
    logAction('IMPORT_STUDENTS', 'student', 'bulk', `Mengimpor/memperbarui ${newStudents.length} data siswa`);

    const client = getSupabaseClient();
    if (client && preparedList.length > 0) {
      const rows = preparedList.map(s => mapStudentToDb(s, classesRef.current));
      const { error } = await client.from('students').upsert(rows);
      reportWriteResult({ success: !error, error: error?.message });
    }
  };

  const addSubject = async (subj: Omit<Subject, 'id'>) => {
    const newSubj: Subject = { ...subj, id: `sbj-${Date.now()}` };
    const next = [...subjectsRef.current, newSubj];
    subjectsRef.current = next;
    setSubjects(next);
    logAction('ADD_SUBJECT', 'subject', newSubj.id, `Menambahkan mapel baru: ${newSubj.subjectName}`);
    const res = await dbUpsert('subjects', mapSubjectToDb(newSubj));
    reportWriteResult(res);
  };

  const updateSubject = async (id: string, subj: Partial<Subject>) => {
    const existing = subjectsRef.current.find(s => s.id === id);
    if (!existing) return;
    const updatedSubj: Subject = { ...existing, ...subj };
    const next = subjectsRef.current.map(s => (s.id === id ? updatedSubj : s));
    subjectsRef.current = next;
    setSubjects(next);
    logAction('UPDATE_SUBJECT', 'subject', id, `Memperbarui data mapel ${updatedSubj.subjectName}`);
    const res = await dbUpsert('subjects', mapSubjectToDb(updatedSubj));
    reportWriteResult(res);
  };

  const deleteSubject = async (id: string) => {
    const next = subjectsRef.current.filter(s => s.id !== id);
    subjectsRef.current = next;
    setSubjects(next);
    logAction('DELETE_SUBJECT', 'subject', id, `Menghapus mapel ${id}`);
    const res = await dbDelete('subjects', id);
    reportWriteResult(res);
  };

  const addCP = (cp: Omit<LearningOutcomeCP, 'id'>) => {
    const newCp: LearningOutcomeCP = { ...cp, id: `cp-${Date.now()}` };
    setCps(prev => [...prev, newCp]);
    logAction('ADD_CP', 'cp', newCp.id, `Menambahkan Capaian Pembelajaran baru (${newCp.element})`);
  };

  const updateCP = (id: string, cp: Partial<LearningOutcomeCP>) => {
    setCps(prev => prev.map(c => c.id === id ? { ...c, ...cp } : c));
    logAction('UPDATE_CP', 'cp', id, `Memperbarui Capaian Pembelajaran ${id}`);
  };

  const deleteCP = (id: string) => {
    setCps(prev => prev.filter(c => c.id !== id));
    setTps(prev => prev.filter(t => t.cpId !== id));
    logAction('DELETE_CP', 'cp', id, `Menghapus Capaian Pembelajaran ${id}`);
  };

  const addTP = (tp: Omit<LearningObjectiveTP, 'id'>) => {
    const newTp: LearningObjectiveTP = { ...tp, id: `tp-${Date.now()}` };
    setTps(prev => [...prev, newTp]);
    logAction('ADD_TP', 'tp', newTp.id, `Menambahkan Tujuan Pembelajaran (${newTp.tpCode})`);
  };

  const updateTP = (id: string, tp: Partial<LearningObjectiveTP>) => {
    setTps(prev => prev.map(t => t.id === id ? { ...t, ...tp } : t));
    logAction('UPDATE_TP', 'tp', id, `Memperbarui Tujuan Pembelajaran ${id}`);
  };

  const deleteTP = (id: string) => {
    setTps(prev => prev.filter(t => t.id !== id));
    logAction('DELETE_TP', 'tp', id, `Menghapus Tujuan Pembelajaran ${id}`);
  };

  const saveStudentAssessment = async (assessment: Omit<StudentAssessment, 'id' | 'updatedAt'>) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const copy = [...assessmentsRef.current];
    const idx = copy.findIndex(a =>
      a.classId === assessment.classId &&
      a.subjectId === assessment.subjectId &&
      a.studentId === assessment.studentId &&
      a.semesterId === assessment.semesterId
    );
    const targetAssessment: StudentAssessment = idx >= 0
      ? { ...assessment, id: copy[idx].id, updatedAt: now }
      : { ...assessment, id: `as-${Date.now()}`, updatedAt: now };

    if (idx >= 0) copy[idx] = targetAssessment;
    else copy.push(targetAssessment);

    assessmentsRef.current = copy;
    setAssessments(copy);
    logAction('SAVE_ASSESSMENT', 'student_assessment', assessment.studentId, `Menyimpan penilaian siswa ${assessment.studentId} pada mapel ${assessment.subjectId}`);
    const res = await dbUpsert('assessments', mapAssessmentToDb(targetAssessment));
    reportWriteResult(res);
  };

  const bulkSaveAssessments = async (newAssessments: StudentAssessment[]) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const copy = [...assessmentsRef.current];
    const preparedList: StudentAssessment[] = [];

    newAssessments.forEach(item => {
      const idx = copy.findIndex(a =>
        a.classId === item.classId &&
        a.subjectId === item.subjectId &&
        a.studentId === item.studentId &&
        a.semesterId === item.semesterId
      );
      if (idx >= 0) {
        const updated = { ...item, id: copy[idx].id, updatedAt: now };
        copy[idx] = updated;
        preparedList.push(updated);
      } else {
        const created = { ...item, id: item.id || `as-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`, updatedAt: now };
        copy.push(created);
        preparedList.push(created);
      }
    });

    assessmentsRef.current = copy;
    setAssessments(copy);
    logAction('BULK_SAVE_ASSESSMENTS', 'student_assessment', 'bulk', `Menyimpan massal ${newAssessments.length} rekap penilaian`);

    const client = getSupabaseClient();
    if (client && preparedList.length > 0) {
      const rows = preparedList.map(mapAssessmentToDb);
      const { error } = await client.from('assessments').upsert(rows);
      reportWriteResult({ success: !error, error: error?.message });
    }
  };

  const saveCocurricularAssessment = async (assessment: Omit<CocurricularAssessment, 'id'>) => {
    const copy = [...cocurricularAssessmentsRef.current];
    const idx = copy.findIndex(a =>
      a.activityId === assessment.activityId &&
      a.rubricId === assessment.rubricId &&
      a.studentId === assessment.studentId &&
      a.semesterId === assessment.semesterId
    );
    const saved: CocurricularAssessment = idx >= 0
      ? { ...assessment, id: copy[idx].id }
      : { ...assessment, id: `ca-${Date.now()}` };

    if (idx >= 0) copy[idx] = saved;
    else copy.push(saved);

    cocurricularAssessmentsRef.current = copy;
    setCocurricularAssessments(copy);
    logAction('SAVE_KOKURIKULER_ASSESSMENT', 'cocurricular_assessment', assessment.studentId, 'Menyimpan asesmen kokurikuler');
    const res = await dbUpsert('cocurricular_assessments', mapCocurricularAssessmentToDb(saved));
    reportWriteResult(res);
  };

  const addCocurricularActivity = async (activity: Omit<CocurricularActivity, 'id'>, rubrics: Omit<CocurricularRubric, 'id' | 'activityId'>[]) => {
    const actId = `kokur-${Date.now()}`;
    const newAct: CocurricularActivity = { ...activity, id: actId };
    const newRubrics: CocurricularRubric[] = rubrics.map((r, i) => ({
      ...r,
      id: `rub-${Date.now()}-${i}`,
      activityId: actId,
    }));

    const nextActs = [...cocurricularActivitiesRef.current, newAct];
    const nextRubs = [...cocurricularRubricsRef.current, ...newRubrics];
    cocurricularActivitiesRef.current = nextActs;
    cocurricularRubricsRef.current = nextRubs;
    setCocurricularActivities(nextActs);
    setCocurricularRubrics(nextRubs);

    logAction('ADD_KOKURIKULER_ACTIVITY', 'cocurricular_activity', actId, `Menambahkan kegiatan kokurikuler: ${newAct.name}`);
    await dbUpsert('cocurricular_activities', mapCocurricularActivityToDb(newAct));
    const client = getSupabaseClient();
    if (client && newRubrics.length > 0) {
      await client.from('cocurricular_rubrics').upsert(newRubrics.map(mapCocurricularRubricToDb));
    }
  };

  const addCocurricularRubric = async (rubric: Omit<CocurricularRubric, 'id'>) => {
    const newRubric: CocurricularRubric = { ...rubric, id: `rub-${Date.now()}` };
    const next = [...cocurricularRubricsRef.current, newRubric];
    cocurricularRubricsRef.current = next;
    setCocurricularRubrics(next);
    logAction('ADD_KOKURIKULER_RUBRIC', 'cocurricular_rubric', newRubric.id, `Menambahkan rubrik kokurikuler: ${newRubric.dimension}`);

    // Ensure parent activity exists in Supabase first
    const parentAct = cocurricularActivitiesRef.current.find(a => a.id === newRubric.activityId);
    if (parentAct) {
      await dbUpsert('cocurricular_activities', mapCocurricularActivityToDb(parentAct));
    }
    const res = await dbUpsert('cocurricular_rubrics', mapCocurricularRubricToDb(newRubric));
    reportWriteResult(res);
  };

  const updateCocurricularRubric = async (id: string, rubric: Partial<CocurricularRubric>) => {
    const existing = cocurricularRubricsRef.current.find(r => r.id === id);
    if (!existing) return;
    const updated: CocurricularRubric = { ...existing, ...rubric };
    const next = cocurricularRubricsRef.current.map(r => (r.id === id ? updated : r));
    cocurricularRubricsRef.current = next;
    setCocurricularRubrics(next);
    logAction('UPDATE_KOKURIKULER_RUBRIC', 'cocurricular_rubric', id, `Memperbarui rubrik kokurikuler: ${id}`);
    const res = await dbUpsert('cocurricular_rubrics', mapCocurricularRubricToDb(updated));
    reportWriteResult(res);
  };

  const deleteCocurricularRubric = async (id: string) => {
    const nextRubrics = cocurricularRubricsRef.current.filter(r => r.id !== id);
    const nextAssm = cocurricularAssessmentsRef.current.filter(a => a.rubricId !== id);
    cocurricularRubricsRef.current = nextRubrics;
    cocurricularAssessmentsRef.current = nextAssm;
    setCocurricularRubrics(nextRubrics);
    setCocurricularAssessments(nextAssm);
    logAction('DELETE_KOKURIKULER_RUBRIC', 'cocurricular_rubric', id, `Menghapus rubrik kokurikuler: ${id}`);
    const res = await dbDelete('cocurricular_rubrics', id);
    reportWriteResult(res);
  };

  const addExtracurricular = async (ekskul: Omit<Extracurricular, 'id'>) => {
    const newEkskul: Extracurricular = { ...ekskul, id: `ekskul-${Date.now()}` };
    const next = [...extracurricularsRef.current, newEkskul];
    extracurricularsRef.current = next;
    setExtracurriculars(next);
    logAction('ADD_EKSKUL', 'extracurricular', newEkskul.id, `Menambahkan ekskul baru: ${newEkskul.name}`);
    const res = await dbUpsert('extracurriculars', mapExtracurricularToDb(newEkskul));
    reportWriteResult(res);
  };

  const updateExtracurricular = async (id: string, ekskul: Partial<Extracurricular>) => {
    const existing = extracurricularsRef.current.find(e => e.id === id);
    if (!existing) return;
    const updatedEks: Extracurricular = { ...existing, ...ekskul };
    const next = extracurricularsRef.current.map(e => (e.id === id ? updatedEks : e));
    extracurricularsRef.current = next;
    setExtracurriculars(next);
    logAction('UPDATE_EKSKUL', 'extracurricular', id, `Memperbarui ekskul: ${updatedEks.name}`);
    const res = await dbUpsert('extracurriculars', mapExtracurricularToDb(updatedEks));
    reportWriteResult(res);
  };

  const deleteExtracurricular = async (id: string) => {
    const nextEks = extracurricularsRef.current.filter(e => e.id !== id);
    const nextMem = extracurricularMembersRef.current.filter(m => m.extracurricularId !== id);
    extracurricularsRef.current = nextEks;
    extracurricularMembersRef.current = nextMem;
    setExtracurriculars(nextEks);
    setExtracurricularMembers(nextMem);
    logAction('DELETE_EKSKUL', 'extracurricular', id, `Menghapus ekskul: ${id}`);
    const res = await dbDelete('extracurriculars', id);
    reportWriteResult(res);
  };

  const saveExtracurricularMember = async (member: Omit<ExtracurricularMember, 'id'>) => {
    const copy = [...extracurricularMembersRef.current];
    const idx = copy.findIndex(m =>
      m.extracurricularId === member.extracurricularId &&
      m.studentId === member.studentId &&
      m.semesterId === member.semesterId
    );
    const saved: ExtracurricularMember = idx >= 0
      ? { ...member, id: copy[idx].id }
      : { ...member, id: `em-${Date.now()}` };

    if (idx >= 0) copy[idx] = saved;
    else copy.push(saved);

    extracurricularMembersRef.current = copy;
    setExtracurricularMembers(copy);
    logAction('SAVE_EKSKUL_GRADE', 'extracurricular_member', member.studentId, 'Menyimpan nilai ekstrakurikuler siswa');
    const res = await dbUpsert('extracurricular_members', mapExtracurricularMemberToDb(saved));
    reportWriteResult(res);
  };

  const bulkSaveExtracurricularMembers = async (members: Omit<ExtracurricularMember, 'id'>[]) => {
    const copy = [...extracurricularMembersRef.current];
    const preparedList: ExtracurricularMember[] = [];

    members.forEach(member => {
      const idx = copy.findIndex(m =>
        m.studentId === member.studentId &&
        m.extracurricularId === member.extracurricularId &&
        m.semesterId === member.semesterId
      );
      if (idx >= 0) {
        const item = { ...member, id: copy[idx].id };
        copy[idx] = item;
        preparedList.push(item);
      } else {
        const item = { ...member, id: `em-${Date.now()}-${Math.random().toString(36).substring(2, 6)}` };
        copy.push(item);
        preparedList.push(item);
      }
    });

    extracurricularMembersRef.current = copy;
    setExtracurricularMembers(copy);
    logAction('BULK_SAVE_EKSKUL', 'extracurricular_member', 'bulk', `Menyimpan ${members.length} nilai ekstrakurikuler`);

    const client = getSupabaseClient();
    if (client && preparedList.length > 0) {
      const rows = preparedList.map(mapExtracurricularMemberToDb);
      const { error } = await client.from('extracurricular_members').upsert(rows);
      reportWriteResult({ success: !error, error: error?.message });
    }
  };

  const removeExtracurricularMember = async (studentId: string, extracurricularId: string, semesterId: string) => {
    const next = extracurricularMembersRef.current.filter(
      m => !(m.studentId === studentId && m.extracurricularId === extracurricularId && m.semesterId === semesterId)
    );
    extracurricularMembersRef.current = next;
    setExtracurricularMembers(next);
    logAction('REMOVE_EKSKUL_MEMBER', 'extracurricular_member', studentId, 'Menghapus pilihan ekskul siswa');

    const client = getSupabaseClient();
    if (client) {
      const { error } = await client.from('extracurricular_members')
        .delete()
        .eq('student_id', studentId)
        .eq('extracurricular_id', extracurricularId)
        .eq('semester_id', semesterId);
      reportWriteResult({ success: !error, error: error?.message });
    }
  };

  const saveAttendance = async (att: Omit<StudentAttendance, 'id'>) => {
    const copy = [...attendancesRef.current];
    const idx = copy.findIndex(a => a.studentId === att.studentId && a.semesterId === att.semesterId);
    const saved: StudentAttendance = idx >= 0
      ? { ...att, id: copy[idx].id }
      : { ...att, id: `att-${Date.now()}` };

    if (idx >= 0) copy[idx] = saved;
    else copy.push(saved);

    attendancesRef.current = copy;
    setAttendances(copy);
    logAction('SAVE_ATTENDANCE', 'attendance', att.studentId, 'Memperbarui kehadiran siswa');
    const res = await dbUpsert('attendances', mapAttendanceToDb(saved));
    reportWriteResult(res);
  };

  const bulkSaveAttendance = async (items: Omit<StudentAttendance, 'id'>[]) => {
    const copy = [...attendancesRef.current];
    const preparedList: StudentAttendance[] = [];

    items.forEach(item => {
      const idx = copy.findIndex(a => a.studentId === item.studentId && a.semesterId === item.semesterId);
      if (idx >= 0) {
        const updated = { ...item, id: copy[idx].id };
        copy[idx] = updated;
        preparedList.push(updated);
      } else {
        const updated = { ...item, id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}` };
        copy.push(updated);
        preparedList.push(updated);
      }
    });

    attendancesRef.current = copy;
    setAttendances(copy);
    logAction('BULK_SAVE_ATTENDANCE', 'attendance', 'bulk', `Menyimpan kehadiran untuk ${items.length} siswa`);

    const client = getSupabaseClient();
    if (client && preparedList.length > 0) {
      const rows = preparedList.map(mapAttendanceToDb);
      const { error } = await client.from('attendances').upsert(rows);
      reportWriteResult({ success: !error, error: error?.message });
    }
  };

  const saveHomeroomNote = async (note: Omit<HomeroomNote, 'id'>) => {
    const copy = [...homeroomNotesRef.current];
    const idx = copy.findIndex(n => n.studentId === note.studentId && n.semesterId === note.semesterId);
    const saved: HomeroomNote = idx >= 0
      ? { ...note, id: copy[idx].id }
      : { ...note, id: `hn-${Date.now()}` };

    if (idx >= 0) copy[idx] = saved;
    else copy.push(saved);

    homeroomNotesRef.current = copy;
    setHomeroomNotes(copy);
    logAction('SAVE_HOMEROOM_NOTE', 'homeroom_note', note.studentId, 'Menyimpan catatan wali kelas');
    const res = await dbUpsert('homeroom_notes', mapHomeroomNoteToDb(saved));
    reportWriteResult(res);
  };

  const addAchievement = async (ach: Omit<StudentAchievement, 'id'>) => {
    const newAch: StudentAchievement = { ...ach, id: `ach-${Date.now()}` };
    const next = [...achievementsRef.current, newAch];
    achievementsRef.current = next;
    setAchievements(next);
    logAction('ADD_ACHIEVEMENT', 'achievement', newAch.id, `Menambahkan prestasi siswa: ${newAch.achievementName}`);
    const res = await dbUpsert('student_achievements', mapAchievementToDb(newAch));
    reportWriteResult(res);
  };

  const updateAchievement = async (id: string, ach: Partial<StudentAchievement>) => {
    const existing = achievementsRef.current.find(a => a.id === id);
    if (!existing) return;
    const updatedAch: StudentAchievement = { ...existing, ...ach };
    const next = achievementsRef.current.map(a => (a.id === id ? updatedAch : a));
    achievementsRef.current = next;
    setAchievements(next);
    logAction('UPDATE_ACHIEVEMENT', 'achievement', id, `Memperbarui prestasi ${id}`);
    const res = await dbUpsert('student_achievements', mapAchievementToDb(updatedAch));
    reportWriteResult(res);
  };

  const deleteAchievement = async (id: string) => {
    const next = achievementsRef.current.filter(a => a.id !== id);
    achievementsRef.current = next;
    setAchievements(next);
    logAction('DELETE_ACHIEVEMENT', 'achievement', id, `Menghapus prestasi ${id}`);
    const res = await dbDelete('student_achievements', id);
    reportWriteResult(res);
  };

  const updateFinalizationStatus = (classId: string, status: ReportFinalization['status'], reason?: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setReportFinalizations(prev => {
      const idx = prev.findIndex(f => f.classId === classId && f.semesterId === activeSemester.id);
      if (idx >= 0) {
        const updated = [...prev];
        const existing = updated[idx];
        updated[idx] = {
          ...existing,
          status,
          ...(status === 'final_terkunci' ? { finalizedBy: currentUser.fullName, finalizedAt: now } : {}),
          ...(status === 'draft' && reason ? { unlockedBy: currentUser.fullName, unlockedAt: now, unlockReason: reason } : {}),
        };
        return updated;
      } else {
        return [...prev, {
          id: `rf-${Date.now()}`,
          classId,
          academicYearId: activeAcademicYear.id,
          semesterId: activeSemester.id,
          status,
          ...(status === 'final_terkunci' ? { finalizedBy: currentUser.fullName, finalizedAt: now } : {}),
        }];
      }
    });
    logAction('UPDATE_FINALIZATION', 'report_finalization', classId, `Mengubah status rapor kelas ${classId} menjadi '${status}' ${reason ? `(Alasan: ${reason})` : ''}`);
  };

  const resetAllData = () => {
    localStorage.clear();
    setSchoolProfile(INITIAL_SCHOOL_PROFILE);
    setAcademicYears(INITIAL_ACADEMIC_YEARS);
    setSemesters(INITIAL_SEMESTERS);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setTeachers(INITIAL_TEACHERS);
    setClasses(INITIAL_CLASSES);
    setStudents(INITIAL_STUDENTS);
    setSubjects(INITIAL_SUBJECTS);
    setCps(INITIAL_CPS);
    setTps(INITIAL_TPS);
    setAssessments(INITIAL_ASSESSMENTS);
    setCocurricularActivities(INITIAL_COCURRICULAR_ACTIVITIES);
    setCocurricularRubrics(INITIAL_COCURRICULAR_RUBRICS);
    setCocurricularAssessments(INITIAL_COCURRICULAR_ASSESSMENTS);
    setExtracurriculars(INITIAL_EXTRACURRICULARS);
    setExtracurricularMembers(INITIAL_EXTRACURRICULAR_MEMBERS);
    setAttendances(INITIAL_ATTENDANCES);
    setHomeroomNotes(INITIAL_HOMEROOM_NOTES);
    setAchievements(INITIAL_ACHIEVEMENTS);
    setReportFinalizations(INITIAL_REPORT_FINALIZATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    logAction('RESET_SYSTEM', 'system', 'all', 'Mengembalikan seluruh data ke pengaturan awal');
  };

  return (
    <AppContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        supabaseSyncStatus,
        refetchFromSupabase,
        currentUser,
        switchUserRole,
        setCurrentUser,
        academicYears,
        activeAcademicYear,
        setActiveAcademicYearId,
        semesters,
        activeSemester,
        setActiveSemesterId,
        currentView,
        setCurrentView,
        schoolProfile,
        updateSchoolProfile,
        teachers,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        classes,
        addClass,
        updateClass,
        deleteClass,
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        importStudents,
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        cps,
        tps,
        addCP,
        updateCP,
        deleteCP,
        addTP,
        updateTP,
        deleteTP,
        assessments,
        saveStudentAssessment,
        bulkSaveAssessments,
        cocurricularActivities,
        cocurricularRubrics,
        cocurricularAssessments,
        saveCocurricularAssessment,
        addCocurricularActivity,
        addCocurricularRubric,
        updateCocurricularRubric,
        deleteCocurricularRubric,
        extracurriculars,
        extracurricularMembers,
        addExtracurricular,
        updateExtracurricular,
        deleteExtracurricular,
        saveExtracurricularMember,
        bulkSaveExtracurricularMembers,
        removeExtracurricularMember,
        attendances,
        saveAttendance,
        bulkSaveAttendance,
        homeroomNotes,
        saveHomeroomNote,
        achievements,
        addAchievement,
        updateAchievement,
        deleteAchievement,
        reportFinalizations,
        updateFinalizationStatus,
        auditLogs,
        logAction,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
