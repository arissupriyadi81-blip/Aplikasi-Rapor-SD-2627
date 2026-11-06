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
  mapCocurricularAssessmentToDb,
  mapCocurricularAssessmentFromDb,
  mapAcademicYearFromDb,
  mapSemesterFromDb,
} from '../lib/supabase.ts';

export interface SupabaseSyncState {
  isConnected: boolean;
  isRealtime: boolean;
  lastSync: Date | null;
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
  addCocurricularActivity: (activity: Omit<CocurricularActivity, 'id'>, rubrics: Omit<CocurricularRubric, 'id' | 'activityId'>[]) => void;
  addCocurricularRubric: (rubric: Omit<CocurricularRubric, 'id'>) => void;
  updateCocurricularRubric: (id: string, rubric: Partial<CocurricularRubric>) => void;
  deleteCocurricularRubric: (id: string) => void;

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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    lastSync: null,
    pendingPermissions: [],
  });

  // State initialization with localStorage fallback
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

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_academic_years`);
    return saved ? JSON.parse(saved) : INITIAL_ACADEMIC_YEARS;
  });

  const [semesters, setSemesters] = useState<Semester[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_semesters`);
    return saved ? JSON.parse(saved) : INITIAL_SEMESTERS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => users[0]);

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_teachers`);
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  const [classes, setClasses] = useState<ClassGroup[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_classes`);
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_subjects`);
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [cps, setCps] = useState<LearningOutcomeCP[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_cps`);
    return saved ? JSON.parse(saved) : INITIAL_CPS;
  });

  const [tps, setTps] = useState<LearningObjectiveTP[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tps`);
    return saved ? JSON.parse(saved) : INITIAL_TPS;
  });

  const [assessments, setAssessments] = useState<StudentAssessment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_assessments`);
    return saved ? JSON.parse(saved) : INITIAL_ASSESSMENTS;
  });

  const [cocurricularActivities, setCocurricularActivities] = useState<CocurricularActivity[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_p5_activities`);
    return saved ? JSON.parse(saved) : INITIAL_COCURRICULAR_ACTIVITIES;
  });

  const [cocurricularRubrics, setCocurricularRubrics] = useState<CocurricularRubric[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_p5_rubrics`);
    return saved ? JSON.parse(saved) : INITIAL_COCURRICULAR_RUBRICS;
  });

  const [cocurricularAssessments, setCocurricularAssessments] = useState<CocurricularAssessment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_p5_assessments`);
    return saved ? JSON.parse(saved) : INITIAL_COCURRICULAR_ASSESSMENTS;
  });

  const [extracurriculars, setExtracurriculars] = useState<Extracurricular[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_ekskul`);
    return saved ? JSON.parse(saved) : INITIAL_EXTRACURRICULARS;
  });

  const [extracurricularMembers, setExtracurricularMembers] = useState<ExtracurricularMember[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_ekskul_members`);
    return saved ? JSON.parse(saved) : INITIAL_EXTRACURRICULAR_MEMBERS;
  });

  const [attendances, setAttendances] = useState<StudentAttendance[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_attendances`);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCES;
  });

  const [homeroomNotes, setHomeroomNotes] = useState<HomeroomNote[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_hr_notes`);
    return saved ? JSON.parse(saved) : INITIAL_HOMEROOM_NOTES;
  });

  const [achievements, setAchievements] = useState<StudentAchievement[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_achievements`);
    return saved ? JSON.parse(saved) : INITIAL_ACHIEVEMENTS;
  });

  const [reportFinalizations, setReportFinalizations] = useState<ReportFinalization[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_finalizations`);
    return saved ? JSON.parse(saved) : INITIAL_REPORT_FINALIZATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Keep local storage synchronized as an offline cache
  useEffect(() => {
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
  }, [
    schoolProfile, academicYears, semesters, teachers, classes, students, subjects,
    cps, tps, assessments, cocurricularActivities, cocurricularRubrics, cocurricularAssessments,
    extracurriculars, extracurricularMembers, attendances, homeroomNotes, achievements,
    reportFinalizations, auditLogs
  ]);

  // Active periods
  const activeAcademicYear = academicYears.find(y => y.isActive) || academicYears[0];
  const activeSemester = semesters.find(s => s.isActive && s.academicYearId === activeAcademicYear.id) || semesters[0];

  const setActiveAcademicYearId = (id: string) => {
    setAcademicYears(prev => prev.map(y => ({ ...y, isActive: y.id === id })));
    logAction('SWITCH_ACADEMIC_YEAR', 'academic_year', id, `Mengubah tahun pelajaran aktif ke ${id}`);
  };

  const setActiveSemesterId = (id: string) => {
    setSemesters(prev => prev.map(s => ({ ...s, isActive: s.id === id })));
    logAction('SWITCH_SEMESTER', 'semester', id, `Mengubah semester aktif ke ${id}`);
  };

  const switchUserRole = (role: UserRole) => {
    const targetUser = users.find(u => u.role === role) || users[0];
    setCurrentUser(targetUser);
    logAction('SWITCH_ROLE', 'user', targetUser.id, `Beralih peran menjadi ${role} (${targetUser.fullName})`);
  };

  const logAction = (action: string, entityType: string, entityId: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 99)]);
  };

  // ==============================================================================
  // SUPABASE DATA FETCH & REALTIME SUBSCRIPTION
  // ==============================================================================

  const refetchFromSupabase = useCallback(async () => {
    try {
      const data = await fetchAllDataFromSupabase();
      if (data.schoolProfile) {
        setSchoolProfile(data.schoolProfile);
      }
      if (data.academicYears && data.academicYears.length > 0) {
        setAcademicYears(data.academicYears);
      }
      if (data.semesters && data.semesters.length > 0) {
        setSemesters(data.semesters);
      }
      if (data.teachers && data.teachers.length > 0) {
        setTeachers(data.teachers);
      }
      if (data.subjects && data.subjects.length > 0) {
        setSubjects(data.subjects);
      }
      if (data.extracurriculars && data.extracurriculars.length > 0) {
        setExtracurriculars(data.extracurriculars);
      }
      if (data.classes && data.classes.length > 0) {
        setClasses(data.classes);
      }
      if (data.students && data.students.length > 0) {
        setStudents(data.students);
      }
      if (data.assessments && data.assessments.length > 0) {
        setAssessments(data.assessments);
      }
      if (data.attendances && data.attendances.length > 0) {
        setAttendances(data.attendances);
      }
      if (data.homeroomNotes && data.homeroomNotes.length > 0) {
        setHomeroomNotes(data.homeroomNotes);
      }
      if (data.achievements && data.achievements.length > 0) {
        setAchievements(data.achievements);
      }
      if (data.extracurricularMembers && data.extracurricularMembers.length > 0) {
        setExtracurricularMembers(data.extracurricularMembers);
      }
      if (data.cocurricularAssessments && data.cocurricularAssessments.length > 0) {
        setCocurricularAssessments(data.cocurricularAssessments);
      }

      setSupabaseSyncStatus({
        isConnected: true,
        isRealtime: true,
        lastSync: new Date(),
        pendingPermissions: data.permissionErrors,
      });

      // If classes or students in Supabase are empty, seed them so other browsers have data
      const client = getSupabaseClient();
      if (client) {
        if (!data.classes || data.classes.length === 0) {
          const rows = INITIAL_CLASSES.map(mapClassToDb);
          await client.from('classes').upsert(rows);
        }
        if (!data.students || data.students.length === 0) {
          const rows = INITIAL_STUDENTS.map(mapStudentToDb);
          await client.from('students').upsert(rows);
        }
      }
    } catch (err) {
      console.warn('Error fetching Supabase data:', err);
    }
  }, []);

  // Initial load from Supabase + start Realtime subscription
  useEffect(() => {
    refetchFromSupabase();

    // Subscribe to remote changes from all browsers
    const unsubscribe = subscribeToAllChanges((table, eventType, newRow, oldRow) => {
      setSupabaseSyncStatus(prev => ({ ...prev, lastSync: new Date() }));

      switch (table) {
        case 'students': {
          if (eventType === 'DELETE') {
            setStudents(prev => prev.filter(s => s.id !== oldRow.id));
          } else {
            const mapped = mapStudentFromDb(newRow);
            setStudents(prev => {
              const idx = prev.findIndex(s => s.id === mapped.id);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = mapped;
                return updated;
              }
              return [...prev, mapped];
            });
          }
          break;
        }

        case 'teachers': {
          if (eventType === 'DELETE') {
            setTeachers(prev => prev.filter(t => t.id !== oldRow.id));
          } else {
            const mapped = mapTeacherFromDb(newRow);
            setTeachers(prev => {
              const idx = prev.findIndex(t => t.id === mapped.id);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = mapped;
                return updated;
              }
              return [...prev, mapped];
            });
          }
          break;
        }

        case 'classes': {
          if (eventType === 'DELETE') {
            setClasses(prev => prev.filter(c => c.id !== oldRow.id));
          } else {
            const mapped = mapClassFromDb(newRow);
            setClasses(prev => {
              const idx = prev.findIndex(c => c.id === mapped.id);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = mapped;
                return updated;
              }
              return [...prev, mapped];
            });
          }
          break;
        }

        case 'subjects': {
          if (eventType === 'DELETE') {
            setSubjects(prev => prev.filter(s => s.id !== oldRow.id));
          } else {
            const mapped = mapSubjectFromDb(newRow);
            setSubjects(prev => {
              const idx = prev.findIndex(s => s.id === mapped.id);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = mapped;
                return updated;
              }
              return [...prev, mapped];
            });
          }
          break;
        }

        case 'school_profiles': {
          if (eventType !== 'DELETE') {
            const mapped = mapSchoolProfileFromDb(newRow);
            setSchoolProfile(mapped);
          }
          break;
        }

        case 'assessments': {
          if (eventType === 'DELETE') {
            setAssessments(prev => prev.filter(a => a.id !== oldRow.id));
          } else {
            const mapped = mapAssessmentFromDb(newRow);
            setAssessments(prev => {
              const idx = prev.findIndex(a => a.id === mapped.id);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = mapped;
                return updated;
              }
              return [...prev, mapped];
            });
          }
          break;
        }

        case 'extracurriculars': {
          if (eventType === 'DELETE') {
            setExtracurriculars(prev => prev.filter(e => e.id !== oldRow.id));
          } else {
            const mapped = mapExtracurricularFromDb(newRow);
            setExtracurriculars(prev => {
              const idx = prev.findIndex(e => e.id === mapped.id);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = mapped;
                return updated;
              }
              return [...prev, mapped];
            });
          }
          break;
        }

        case 'extracurricular_members': {
          if (eventType === 'DELETE') {
            setExtracurricularMembers(prev => prev.filter(m => m.id !== oldRow.id));
          } else {
            const mapped = mapExtracurricularMemberFromDb(newRow);
            setExtracurricularMembers(prev => {
              const idx = prev.findIndex(m => m.id === mapped.id);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = mapped;
                return updated;
              }
              return [...prev, mapped];
            });
          }
          break;
        }

        case 'attendances': {
          if (eventType === 'DELETE') {
            setAttendances(prev => prev.filter(a => a.id !== oldRow.id));
          } else {
            const mapped = mapAttendanceFromDb(newRow);
            setAttendances(prev => {
              const idx = prev.findIndex(a => a.id === mapped.id);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = mapped;
                return updated;
              }
              return [...prev, mapped];
            });
          }
          break;
        }

        case 'homeroom_notes': {
          if (eventType === 'DELETE') {
            setHomeroomNotes(prev => prev.filter(n => n.id !== oldRow.id));
          } else {
            const mapped = mapHomeroomNoteFromDb(newRow);
            setHomeroomNotes(prev => {
              const idx = prev.findIndex(n => n.id === mapped.id);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = mapped;
                return updated;
              }
              return [...prev, mapped];
            });
          }
          break;
        }

        case 'student_achievements': {
          if (eventType === 'DELETE') {
            setAchievements(prev => prev.filter(a => a.id !== oldRow.id));
          } else {
            const mapped = mapAchievementFromDb(newRow);
            setAchievements(prev => {
              const idx = prev.findIndex(a => a.id === mapped.id);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = mapped;
                return updated;
              }
              return [...prev, mapped];
            });
          }
          break;
        }

        case 'cocurricular_assessments': {
          if (eventType === 'DELETE') {
            setCocurricularAssessments(prev => prev.filter(c => c.id !== oldRow.id));
          } else {
            const mapped = mapCocurricularAssessmentFromDb(newRow);
            setCocurricularAssessments(prev => {
              const idx = prev.findIndex(c => c.id === mapped.id);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = mapped;
                return updated;
              }
              return [...prev, mapped];
            });
          }
          break;
        }

        default:
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [refetchFromSupabase]);

  // ==============================================================================
  // DIRECT CRUD OPERATIONS (PERSISTED DIRECTLY TO SUPABASE WITH OPTIMISTIC STATE)
  // ==============================================================================

  const updateSchoolProfile = async (profile: Partial<SchoolProfile>) => {
    const updated = { ...schoolProfile, ...profile };
    setSchoolProfile(updated);
    logAction('UPDATE_SCHOOL_PROFILE', 'school_profile', updated.id, 'Memperbarui data profil sekolah');
    await dbUpsert('school_profiles', mapSchoolProfileToDb(updated));
  };

  const addTeacher = async (teacher: Omit<Teacher, 'id'>) => {
    const newTch: Teacher = { ...teacher, id: `tch-${Date.now()}` };
    setTeachers(prev => [...prev, newTch]);
    logAction('ADD_TEACHER', 'teacher', newTch.id, `Menambahkan guru baru: ${newTch.fullName}`);
    await dbUpsert('teachers', mapTeacherToDb(newTch));
  };

  const updateTeacher = async (id: string, teacher: Partial<Teacher>) => {
    let updatedTch: Teacher | undefined;
    setTeachers(prev => prev.map(t => {
      if (t.id === id) {
        updatedTch = { ...t, ...teacher };
        return updatedTch;
      }
      return t;
    }));
    logAction('UPDATE_TEACHER', 'teacher', id, `Memperbarui data guru ${id}`);
    if (updatedTch) {
      await dbUpsert('teachers', mapTeacherToDb(updatedTch));
    }
  };

  const deleteTeacher = async (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
    logAction('DELETE_TEACHER', 'teacher', id, `Menghapus data guru ${id}`);
    await dbDelete('teachers', id);
  };

  const addClass = async (cls: Omit<ClassGroup, 'id'>) => {
    const newCls: ClassGroup = { ...cls, id: `cls-${Date.now()}` };
    setClasses(prev => [...prev, newCls]);
    logAction('ADD_CLASS', 'class', newCls.id, `Menambahkan kelas baru: ${newCls.className}`);
    await dbUpsert('classes', mapClassToDb(newCls));
  };

  const updateClass = async (id: string, cls: Partial<ClassGroup>) => {
    let updatedCls: ClassGroup | undefined;
    setClasses(prev => prev.map(c => {
      if (c.id === id) {
        updatedCls = { ...c, ...cls };
        return updatedCls;
      }
      return c;
    }));
    logAction('UPDATE_CLASS', 'class', id, `Memperbarui data kelas ${id}`);
    if (updatedCls) {
      await dbUpsert('classes', mapClassToDb(updatedCls));
    }
  };

  const deleteClass = async (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
    logAction('DELETE_CLASS', 'class', id, `Menghapus kelas ${id}`);
    await dbDelete('classes', id);
  };

  const addStudent = async (student: Omit<Student, 'id'>) => {
    const newStd: Student = { ...student, id: `std-${Date.now()}` };
    setStudents(prev => [...prev, newStd]);
    logAction('ADD_STUDENT', 'student', newStd.id, `Menambahkan siswa baru: ${newStd.fullName}`);
    await dbUpsert('students', mapStudentToDb(newStd));
  };

  const updateStudent = async (id: string, student: Partial<Student>) => {
    let updatedStd: Student | undefined;
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        updatedStd = { ...s, ...student };
        return updatedStd;
      }
      return s;
    }));
    logAction('UPDATE_STUDENT', 'student', id, `Memperbarui data siswa ${id}`);
    if (updatedStd) {
      await dbUpsert('students', mapStudentToDb(updatedStd));
    }
  };

  const deleteStudent = async (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    logAction('DELETE_STUDENT', 'student', id, `Menghapus/mengarsipkan siswa ${id}`);
    await dbDelete('students', id);
  };

  const importStudents = async (newStudents: Omit<Student, 'id'>[]) => {
    const preparedList: Student[] = [];
    setStudents(prev => {
      const copy = [...prev];
      newStudents.forEach((s, idx) => {
        const existingIdx = copy.findIndex(exist =>
          (s.nis && exist.nis.trim() === s.nis.trim()) ||
          (s.nisn && exist.nisn.trim() === s.nisn.trim())
        );
        if (existingIdx >= 0) {
          copy[existingIdx] = { ...copy[existingIdx], ...s };
          preparedList.push(copy[existingIdx]);
        } else {
          const item: Student = { ...s, id: `std-imp-${Date.now()}-${idx}` };
          copy.push(item);
          preparedList.push(item);
        }
      });
      return copy;
    });
    logAction('IMPORT_STUDENTS', 'student', 'bulk', `Mengimpor/memperbarui ${newStudents.length} data siswa`);

    const client = getSupabaseClient();
    if (client && preparedList.length > 0) {
      const rows = preparedList.map(mapStudentToDb);
      await client.from('students').upsert(rows);
    }
  };

  const addSubject = async (subj: Omit<Subject, 'id'>) => {
    const newSubj: Subject = { ...subj, id: `sbj-${Date.now()}` };
    setSubjects(prev => [...prev, newSubj]);
    logAction('ADD_SUBJECT', 'subject', newSubj.id, `Menambahkan mapel baru: ${newSubj.subjectName}`);
    await dbUpsert('subjects', mapSubjectToDb(newSubj));
  };

  const updateSubject = async (id: string, subj: Partial<Subject>) => {
    let updatedSubj: Subject | undefined;
    setSubjects(prev => prev.map(s => {
      if (s.id === id) {
        updatedSubj = { ...s, ...subj };
        return updatedSubj;
      }
      return s;
    }));
    logAction('UPDATE_SUBJECT', 'subject', id, `Memperbarui data mapel ${id}`);
    if (updatedSubj) {
      await dbUpsert('subjects', mapSubjectToDb(updatedSubj));
    }
  };

  const deleteSubject = async (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    logAction('DELETE_SUBJECT', 'subject', id, `Menghapus mapel ${id}`);
    await dbDelete('subjects', id);
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
    let targetAssessment: StudentAssessment;

    setAssessments(prev => {
      const idx = prev.findIndex(a =>
        a.classId === assessment.classId &&
        a.subjectId === assessment.subjectId &&
        a.studentId === assessment.studentId &&
        a.semesterId === assessment.semesterId
      );
      if (idx >= 0) {
        const updated = [...prev];
        targetAssessment = { ...assessment, id: prev[idx].id, updatedAt: now };
        updated[idx] = targetAssessment;
        return updated;
      } else {
        targetAssessment = { ...assessment, id: `as-${Date.now()}`, updatedAt: now };
        return [...prev, targetAssessment];
      }
    });

    logAction('SAVE_ASSESSMENT', 'student_assessment', assessment.studentId, `Menyimpan penilaian siswa ${assessment.studentId} pada mapel ${assessment.subjectId}`);
    if (targetAssessment!) {
      await dbUpsert('assessments', mapAssessmentToDb(targetAssessment!));
    }
  };

  const bulkSaveAssessments = async (newAssessments: StudentAssessment[]) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const preparedList: StudentAssessment[] = [];

    setAssessments(prev => {
      const copy = [...prev];
      newAssessments.forEach(item => {
        const idx = copy.findIndex(a =>
          a.classId === item.classId &&
          a.subjectId === item.subjectId &&
          a.studentId === item.studentId &&
          a.semesterId === item.semesterId
        );
        if (idx >= 0) {
          const updated = { ...item, updatedAt: now };
          copy[idx] = updated;
          preparedList.push(updated);
        } else {
          const created = { ...item, id: `as-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`, updatedAt: now };
          copy.push(created);
          preparedList.push(created);
        }
      });
      return copy;
    });

    logAction('BULK_SAVE_ASSESSMENTS', 'student_assessment', 'bulk', `Menyimpan massal ${newAssessments.length} rekap penilaian`);

    const client = getSupabaseClient();
    if (client && preparedList.length > 0) {
      const rows = preparedList.map(mapAssessmentToDb);
      await client.from('assessments').upsert(rows);
    }
  };

  const saveCocurricularAssessment = async (assessment: Omit<CocurricularAssessment, 'id'>) => {
    let saved: CocurricularAssessment;
    setCocurricularAssessments(prev => {
      const idx = prev.findIndex(a =>
        a.activityId === assessment.activityId &&
        a.rubricId === assessment.rubricId &&
        a.studentId === assessment.studentId &&
        a.semesterId === assessment.semesterId
      );
      if (idx >= 0) {
        const updated = [...prev];
        saved = { ...assessment, id: prev[idx].id };
        updated[idx] = saved;
        return updated;
      } else {
        saved = { ...assessment, id: `ca-${Date.now()}` };
        return [...prev, saved];
      }
    });
    logAction('SAVE_KOKURIKULER_ASSESSMENT', 'cocurricular_assessment', assessment.studentId, 'Menyimpan asesmen kokurikuler');
    if (saved!) {
      await dbUpsert('cocurricular_assessments', mapCocurricularAssessmentToDb(saved!));
    }
  };

  const addCocurricularActivity = (activity: Omit<CocurricularActivity, 'id'>, rubrics: Omit<CocurricularRubric, 'id' | 'activityId'>[]) => {
    const actId = `kokur-${Date.now()}`;
    const newAct: CocurricularActivity = { ...activity, id: actId };
    const newRubrics: CocurricularRubric[] = rubrics.map((r, i) => ({
      ...r,
      id: `rub-${Date.now()}-${i}`,
      activityId: actId,
    }));
    setCocurricularActivities(prev => [...prev, newAct]);
    setCocurricularRubrics(prev => [...prev, ...newRubrics]);
    logAction('ADD_KOKURIKULER_ACTIVITY', 'cocurricular_activity', actId, `Menambahkan kegiatan kokurikuler: ${newAct.name}`);
  };

  const addCocurricularRubric = (rubric: Omit<CocurricularRubric, 'id'>) => {
    const newRubric: CocurricularRubric = { ...rubric, id: `rub-${Date.now()}` };
    setCocurricularRubrics(prev => [...prev, newRubric]);
    logAction('ADD_KOKURIKULER_RUBRIC', 'cocurricular_rubric', newRubric.id, `Menambahkan rubrik kokurikuler: ${newRubric.dimension}`);
  };

  const updateCocurricularRubric = (id: string, rubric: Partial<CocurricularRubric>) => {
    setCocurricularRubrics(prev => prev.map(r => r.id === id ? { ...r, ...rubric } : r));
    logAction('UPDATE_KOKURIKULER_RUBRIC', 'cocurricular_rubric', id, `Memperbarui rubrik kokurikuler: ${id}`);
  };

  const deleteCocurricularRubric = (id: string) => {
    setCocurricularRubrics(prev => prev.filter(r => r.id !== id));
    setCocurricularAssessments(prev => prev.filter(a => a.rubricId !== id));
    logAction('DELETE_KOKURIKULER_RUBRIC', 'cocurricular_rubric', id, `Menghapus rubrik kokurikuler: ${id}`);
  };

  const addExtracurricular = async (ekskul: Omit<Extracurricular, 'id'>) => {
    const newEkskul: Extracurricular = { ...ekskul, id: `ekskul-${Date.now()}` };
    setExtracurriculars(prev => [...prev, newEkskul]);
    logAction('ADD_EKSKUL', 'extracurricular', newEkskul.id, `Menambahkan ekskul baru: ${newEkskul.name}`);
    await dbUpsert('extracurriculars', mapExtracurricularToDb(newEkskul));
  };

  const updateExtracurricular = async (id: string, ekskul: Partial<Extracurricular>) => {
    let updatedEks: Extracurricular | undefined;
    setExtracurriculars(prev => prev.map(e => {
      if (e.id === id) {
        updatedEks = { ...e, ...ekskul };
        return updatedEks;
      }
      return e;
    }));
    logAction('UPDATE_EKSKUL', 'extracurricular', id, `Memperbarui ekskul: ${id}`);
    if (updatedEks) {
      await dbUpsert('extracurriculars', mapExtracurricularToDb(updatedEks));
    }
  };

  const deleteExtracurricular = async (id: string) => {
    setExtracurriculars(prev => prev.filter(e => e.id !== id));
    setExtracurricularMembers(prev => prev.filter(m => m.extracurricularId !== id));
    logAction('DELETE_EKSKUL', 'extracurricular', id, `Menghapus ekskul: ${id}`);
    await dbDelete('extracurriculars', id);
  };

  const saveExtracurricularMember = async (member: Omit<ExtracurricularMember, 'id'>) => {
    let saved: ExtracurricularMember;
    setExtracurricularMembers(prev => {
      const idx = prev.findIndex(m =>
        m.extracurricularId === member.extracurricularId &&
        m.studentId === member.studentId &&
        m.semesterId === member.semesterId
      );
      if (idx >= 0) {
        const updated = [...prev];
        saved = { ...member, id: prev[idx].id };
        updated[idx] = saved;
        return updated;
      } else {
        saved = { ...member, id: `em-${Date.now()}` };
        return [...prev, saved];
      }
    });
    logAction('SAVE_EKSKUL_GRADE', 'extracurricular_member', member.studentId, 'Menyimpan nilai ekstrakurikuler siswa');
    if (saved!) {
      await dbUpsert('extracurricular_members', mapExtracurricularMemberToDb(saved!));
    }
  };

  const bulkSaveExtracurricularMembers = async (members: Omit<ExtracurricularMember, 'id'>[]) => {
    const preparedList: ExtracurricularMember[] = [];
    setExtracurricularMembers(prev => {
      const copy = [...prev];
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
      return copy;
    });
    logAction('BULK_SAVE_EKSKUL', 'extracurricular_member', 'bulk', `Menyimpan ${members.length} nilai ekstrakurikuler`);

    const client = getSupabaseClient();
    if (client && preparedList.length > 0) {
      const rows = preparedList.map(mapExtracurricularMemberToDb);
      await client.from('extracurricular_members').upsert(rows);
    }
  };

  const removeExtracurricularMember = async (studentId: string, extracurricularId: string, semesterId: string) => {
    setExtracurricularMembers(prev =>
      prev.filter(m => !(m.studentId === studentId && m.extracurricularId === extracurricularId && m.semesterId === semesterId))
    );
    logAction('REMOVE_EKSKUL_MEMBER', 'extracurricular_member', studentId, 'Menghapus pilihan ekskul siswa');

    const client = getSupabaseClient();
    if (client) {
      await client.from('extracurricular_members')
        .delete()
        .eq('student_id', studentId)
        .eq('extracurricular_id', extracurricularId)
        .eq('semester_id', semesterId);
    }
  };

  const saveAttendance = async (att: Omit<StudentAttendance, 'id'>) => {
    let saved: StudentAttendance;
    setAttendances(prev => {
      const idx = prev.findIndex(a => a.studentId === att.studentId && a.semesterId === att.semesterId);
      if (idx >= 0) {
        const updated = [...prev];
        saved = { ...att, id: prev[idx].id };
        updated[idx] = saved;
        return updated;
      } else {
        saved = { ...att, id: `att-${Date.now()}` };
        return [...prev, saved];
      }
    });
    logAction('SAVE_ATTENDANCE', 'attendance', att.studentId, 'Memperbarui kehadiran siswa');
    if (saved!) {
      await dbUpsert('attendances', mapAttendanceToDb(saved!));
    }
  };

  const bulkSaveAttendance = async (items: Omit<StudentAttendance, 'id'>[]) => {
    const preparedList: StudentAttendance[] = [];
    setAttendances(prev => {
      const copy = [...prev];
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
      return copy;
    });
    logAction('BULK_SAVE_ATTENDANCE', 'attendance', 'bulk', `Menyimpan kehadiran untuk ${items.length} siswa`);

    const client = getSupabaseClient();
    if (client && preparedList.length > 0) {
      const rows = preparedList.map(mapAttendanceToDb);
      await client.from('attendances').upsert(rows);
    }
  };

  const saveHomeroomNote = async (note: Omit<HomeroomNote, 'id'>) => {
    let saved: HomeroomNote;
    setHomeroomNotes(prev => {
      const idx = prev.findIndex(n => n.studentId === note.studentId && n.semesterId === note.semesterId);
      if (idx >= 0) {
        const updated = [...prev];
        saved = { ...note, id: prev[idx].id };
        updated[idx] = saved;
        return updated;
      } else {
        saved = { ...note, id: `hn-${Date.now()}` };
        return [...prev, saved];
      }
    });
    logAction('SAVE_HOMEROOM_NOTE', 'homeroom_note', note.studentId, 'Menyimpan catatan wali kelas');
    if (saved!) {
      await dbUpsert('homeroom_notes', mapHomeroomNoteToDb(saved!));
    }
  };

  const addAchievement = async (ach: Omit<StudentAchievement, 'id'>) => {
    const newAch: StudentAchievement = { ...ach, id: `ach-${Date.now()}` };
    setAchievements(prev => [...prev, newAch]);
    logAction('ADD_ACHIEVEMENT', 'achievement', newAch.id, `Menambahkan prestasi siswa: ${newAch.achievementName}`);
    await dbUpsert('student_achievements', mapAchievementToDb(newAch));
  };

  const updateAchievement = async (id: string, ach: Partial<StudentAchievement>) => {
    let updatedAch: StudentAchievement | undefined;
    setAchievements(prev => prev.map(a => {
      if (a.id === id) {
        updatedAch = { ...a, ...ach };
        return updatedAch;
      }
      return a;
    }));
    logAction('UPDATE_ACHIEVEMENT', 'achievement', id, `Memperbarui prestasi ${id}`);
    if (updatedAch) {
      await dbUpsert('student_achievements', mapAchievementToDb(updatedAch));
    }
  };

  const deleteAchievement = async (id: string) => {
    setAchievements(prev => prev.filter(a => a.id !== id));
    logAction('DELETE_ACHIEVEMENT', 'achievement', id, `Menghapus prestasi ${id}`);
    await dbDelete('student_achievements', id);
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
