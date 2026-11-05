/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Application Context and State Management for E-Rapor SD AJ
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
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

interface AppContextType {
  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

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
  updateSchoolProfile: (profile: Partial<SchoolProfile>) => void;

  // Teachers
  teachers: Teacher[];
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, teacher: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;

  // Classes
  classes: ClassGroup[];
  addClass: (cls: Omit<ClassGroup, 'id'>) => void;
  updateClass: (id: string, cls: Partial<ClassGroup>) => void;
  deleteClass: (id: string) => void;

  // Students
  students: Student[];
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  importStudents: (newStudents: Omit<Student, 'id'>[]) => void;

  // Subjects
  subjects: Subject[];
  addSubject: (subj: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, subj: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

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
  saveStudentAssessment: (assessment: Omit<StudentAssessment, 'id' | 'updatedAt'>) => void;
  bulkSaveAssessments: (newAssessments: StudentAssessment[]) => void;

  // Kokurikuler (Rubrik dan Asesmen)
  cocurricularActivities: CocurricularActivity[];
  cocurricularRubrics: CocurricularRubric[];
  cocurricularAssessments: CocurricularAssessment[];
  saveCocurricularAssessment: (assessment: Omit<CocurricularAssessment, 'id'>) => void;
  addCocurricularActivity: (activity: Omit<CocurricularActivity, 'id'>, rubrics: Omit<CocurricularRubric, 'id' | 'activityId'>[]) => void;
  addCocurricularRubric: (rubric: Omit<CocurricularRubric, 'id'>) => void;
  updateCocurricularRubric: (id: string, rubric: Partial<CocurricularRubric>) => void;
  deleteCocurricularRubric: (id: string) => void;

  // Extracurriculars
  extracurriculars: Extracurricular[];
  extracurricularMembers: ExtracurricularMember[];
  addExtracurricular: (ekskul: Omit<Extracurricular, 'id'>) => void;
  updateExtracurricular: (id: string, ekskul: Partial<Extracurricular>) => void;
  deleteExtracurricular: (id: string) => void;
  saveExtracurricularMember: (member: Omit<ExtracurricularMember, 'id'>) => void;
  bulkSaveExtracurricularMembers: (members: Omit<ExtracurricularMember, 'id'>[]) => void;
  removeExtracurricularMember: (studentId: string, extracurricularId: string, semesterId: string) => void;

  // Attendance
  attendances: StudentAttendance[];
  saveAttendance: (att: Omit<StudentAttendance, 'id'>) => void;
  bulkSaveAttendance: (items: Omit<StudentAttendance, 'id'>[]) => void;

  // Homeroom Notes
  homeroomNotes: HomeroomNote[];
  saveHomeroomNote: (note: Omit<HomeroomNote, 'id'>) => void;

  // Achievements
  achievements: StudentAchievement[];
  addAchievement: (ach: Omit<StudentAchievement, 'id'>) => void;
  updateAchievement: (id: string, ach: Partial<StudentAchievement>) => void;
  deleteAchievement: (id: string) => void;

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

  // Load from local storage or fallback to defaults
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
        reportDateSem1: parsed.reportDateSem1 || '2026-12-19',
        reportDateSem2: parsed.reportDateSem2 || '2027-06-25',
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
    if (!saved) return INITIAL_TEACHERS;
    try {
      const parsed: any[] = JSON.parse(saved);
      return parsed.map((t, idx) => ({
        ...t,
        position: t.position || (t.assignedHomeroomClassId ? 'Wali Kelas' : (idx % 2 === 0 ? 'Guru Kelas' : 'Guru Bidang')),
      }));
    } catch {
      return INITIAL_TEACHERS;
    }
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
    if (!saved) return INITIAL_COCURRICULAR_RUBRICS;
    try {
      const parsed: any[] = JSON.parse(saved);
      return parsed.map((r, i) => {
        const fallback = INITIAL_COCURRICULAR_RUBRICS[i % INITIAL_COCURRICULAR_RUBRICS.length] || INITIAL_COCURRICULAR_RUBRICS[0];
        return {
          id: r.id || `rubric-${i + 1}`,
          activityId: r.activityId || fallback.activityId,
          dimension: r.dimension || fallback.dimension,
          theme: r.theme || fallback.theme,
          objectives: r.objectives || r.objective || fallback.objectives,
          objective: r.objective || r.objectives || fallback.objectives,
          activityForm: r.activityForm || fallback.activityForm,
          relatedSubjects: Array.isArray(r.relatedSubjects) && r.relatedSubjects.length > 0 ? r.relatedSubjects : fallback.relatedSubjects,
          indicator: r.indicator || fallback.indicator,
        };
      });
    } catch {
      return INITIAL_COCURRICULAR_RUBRICS;
    }
  });

  const [cocurricularAssessments, setCocurricularAssessments] = useState<CocurricularAssessment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_p5_assessments`);
    if (!saved) return INITIAL_COCURRICULAR_ASSESSMENTS;
    try {
      const parsed: any[] = JSON.parse(saved);
      return parsed.map(a => ({
        ...a,
        grade: a.grade || (a.achievementLevel === 'SB' ? 'SB' : a.achievementLevel === 'BB' ? 'K' : a.achievementLevel === 'MB' ? 'C' : 'B'),
        achievementLevel: a.achievementLevel || a.grade || 'B',
        teacherNote: a.teacherNote || a.notes || 'Menunjukkan capaian pemahaman kokurikuler yang baik.',
      }));
    } catch {
      return INITIAL_COCURRICULAR_ASSESSMENTS;
    }
  });

  const [extracurriculars, setExtracurriculars] = useState<Extracurricular[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_ekskul`);
    if (!saved) return INITIAL_EXTRACURRICULARS;
    try {
      const parsed: any[] = JSON.parse(saved);
      return parsed.map((e, idx) => {
        const fallback = INITIAL_EXTRACURRICULARS[idx % INITIAL_EXTRACURRICULARS.length] || INITIAL_EXTRACURRICULARS[0];
        return {
          ...fallback,
          ...e,
          category: (e.category === 'wajib' || e.category === 'pilihan') ? e.category : fallback.category,
          coachName: e.coachName || fallback.coachName || 'Pembimbing Sekolah',
        };
      });
    } catch {
      return INITIAL_EXTRACURRICULARS;
    }
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

  // Save to localStorage when state updates
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

  // Role switching
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

  // CRUD actions
  const updateSchoolProfile = (profile: Partial<SchoolProfile>) => {
    setSchoolProfile(prev => ({ ...prev, ...profile }));
    logAction('UPDATE_SCHOOL_PROFILE', 'school_profile', schoolProfile.id, 'Memperbarui data profil sekolah');
  };

  const addTeacher = (teacher: Omit<Teacher, 'id'>) => {
    const newTch: Teacher = { ...teacher, id: `tch-${Date.now()}` };
    setTeachers(prev => [...prev, newTch]);
    logAction('ADD_TEACHER', 'teacher', newTch.id, `Menambahkan guru baru: ${newTch.fullName}`);
  };

  const updateTeacher = (id: string, teacher: Partial<Teacher>) => {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...teacher } : t));
    logAction('UPDATE_TEACHER', 'teacher', id, `Memperbarui data guru ${id}`);
  };

  const deleteTeacher = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
    logAction('DELETE_TEACHER', 'teacher', id, `Menghapus data guru ${id}`);
  };

  const addClass = (cls: Omit<ClassGroup, 'id'>) => {
    const newCls: ClassGroup = { ...cls, id: `cls-${Date.now()}` };
    setClasses(prev => [...prev, newCls]);
    logAction('ADD_CLASS', 'class', newCls.id, `Menambahkan kelas baru: ${newCls.className}`);
  };

  const updateClass = (id: string, cls: Partial<ClassGroup>) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, ...cls } : c));
    logAction('UPDATE_CLASS', 'class', id, `Memperbarui data kelas ${id}`);
  };

  const deleteClass = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
    logAction('DELETE_CLASS', 'class', id, `Menghapus kelas ${id}`);
  };

  const addStudent = (student: Omit<Student, 'id'>) => {
    const newStd: Student = { ...student, id: `std-${Date.now()}` };
    setStudents(prev => [...prev, newStd]);
    logAction('ADD_STUDENT', 'student', newStd.id, `Menambahkan siswa baru: ${newStd.fullName}`);
  };

  const updateStudent = (id: string, student: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...student } : s));
    logAction('UPDATE_STUDENT', 'student', id, `Memperbarui data siswa ${id}`);
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    logAction('DELETE_STUDENT', 'student', id, `Menghapus/mengarsipkan siswa ${id}`);
  };

  const importStudents = (newStudents: Omit<Student, 'id'>[]) => {
    setStudents(prev => {
      const copy = [...prev];
      newStudents.forEach((s, idx) => {
        const existingIdx = copy.findIndex(exist => 
          (s.nis && exist.nis.trim() === s.nis.trim()) || 
          (s.nisn && exist.nisn.trim() === s.nisn.trim())
        );
        if (existingIdx >= 0) {
          copy[existingIdx] = {
            ...copy[existingIdx],
            ...s,
          };
        } else {
          copy.push({
            ...s,
            id: `std-imp-${Date.now()}-${idx}`,
          });
        }
      });
      return copy;
    });
    logAction('IMPORT_STUDENTS', 'student', 'bulk', `Mengimpor/memperbarui ${newStudents.length} data siswa dan orang tua`);
  };

  const addSubject = (subj: Omit<Subject, 'id'>) => {
    const newSubj: Subject = { ...subj, id: `sbj-${Date.now()}` };
    setSubjects(prev => [...prev, newSubj]);
    logAction('ADD_SUBJECT', 'subject', newSubj.id, `Menambahkan mapel baru: ${newSubj.subjectName}`);
  };

  const updateSubject = (id: string, subj: Partial<Subject>) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...subj } : s));
    logAction('UPDATE_SUBJECT', 'subject', id, `Memperbarui data mapel ${id}`);
  };

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    logAction('DELETE_SUBJECT', 'subject', id, `Menghapus mapel ${id}`);
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

  const saveStudentAssessment = (assessment: Omit<StudentAssessment, 'id' | 'updatedAt'>) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setAssessments(prev => {
      const idx = prev.findIndex(a =>
        a.classId === assessment.classId &&
        a.subjectId === assessment.subjectId &&
        a.studentId === assessment.studentId &&
        a.semesterId === assessment.semesterId
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...assessment, id: prev[idx].id, updatedAt: now };
        return updated;
      } else {
        return [...prev, { ...assessment, id: `as-${Date.now()}`, updatedAt: now }];
      }
    });
    logAction('SAVE_ASSESSMENT', 'student_assessment', assessment.studentId, `Menyimpan penilaian siswa ${assessment.studentId} pada mapel ${assessment.subjectId}`);
  };

  const bulkSaveAssessments = (newAssessments: StudentAssessment[]) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
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
          copy[idx] = { ...item, updatedAt: now };
        } else {
          copy.push({ ...item, id: `as-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`, updatedAt: now });
        }
      });
      return copy;
    });
    logAction('BULK_SAVE_ASSESSMENTS', 'student_assessment', 'bulk', `Menyimpan massal ${newAssessments.length} rekap penilaian`);
  };

  const saveCocurricularAssessment = (assessment: Omit<CocurricularAssessment, 'id'>) => {
    setCocurricularAssessments(prev => {
      const idx = prev.findIndex(a =>
        a.activityId === assessment.activityId &&
        a.rubricId === assessment.rubricId &&
        a.studentId === assessment.studentId &&
        a.semesterId === assessment.semesterId
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...assessment, id: prev[idx].id };
        return updated;
      } else {
        return [...prev, { ...assessment, id: `ca-${Date.now()}` }];
      }
    });
    logAction('SAVE_KOKURIKULER_ASSESSMENT', 'cocurricular_assessment', assessment.studentId, 'Menyimpan asesmen kokurikuler');
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

  const addExtracurricular = (ekskul: Omit<Extracurricular, 'id'>) => {
    const newEkskul: Extracurricular = { ...ekskul, id: `ekskul-${Date.now()}` };
    setExtracurriculars(prev => [...prev, newEkskul]);
    logAction('ADD_EKSKUL', 'extracurricular', newEkskul.id, `Menambahkan ekskul baru: ${newEkskul.name}`);
  };

  const updateExtracurricular = (id: string, ekskul: Partial<Extracurricular>) => {
    setExtracurriculars(prev => prev.map(e => e.id === id ? { ...e, ...ekskul } : e));
    logAction('UPDATE_EKSKUL', 'extracurricular', id, `Memperbarui ekskul: ${id}`);
  };

  const deleteExtracurricular = (id: string) => {
    setExtracurriculars(prev => prev.filter(e => e.id !== id));
    setExtracurricularMembers(prev => prev.filter(m => m.extracurricularId !== id));
    logAction('DELETE_EKSKUL', 'extracurricular', id, `Menghapus ekskul: ${id}`);
  };

  const saveExtracurricularMember = (member: Omit<ExtracurricularMember, 'id'>) => {
    setExtracurricularMembers(prev => {
      const idx = prev.findIndex(m =>
        m.extracurricularId === member.extracurricularId &&
        m.studentId === member.studentId &&
        m.semesterId === member.semesterId
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...member, id: prev[idx].id };
        return updated;
      } else {
        return [...prev, { ...member, id: `em-${Date.now()}` }];
      }
    });
    logAction('SAVE_EKSKUL_GRADE', 'extracurricular_member', member.studentId, 'Menyimpan nilai ekstrakurikuler siswa');
  };

  const bulkSaveExtracurricularMembers = (members: Omit<ExtracurricularMember, 'id'>[]) => {
    setExtracurricularMembers(prev => {
      const copy = [...prev];
      members.forEach(member => {
        const idx = copy.findIndex(m =>
          m.studentId === member.studentId &&
          m.extracurricularId === member.extracurricularId &&
          m.semesterId === member.semesterId
        );
        if (idx >= 0) {
          copy[idx] = { ...member, id: copy[idx].id };
        } else {
          copy.push({ ...member, id: `em-${Date.now()}-${Math.random().toString(36).substring(2, 6)}` });
        }
      });
      return copy;
    });
    logAction('BULK_SAVE_EKSKUL', 'extracurricular_member', 'bulk', `Menyimpan ${members.length} nilai ekstrakurikuler`);
  };

  const removeExtracurricularMember = (studentId: string, extracurricularId: string, semesterId: string) => {
    setExtracurricularMembers(prev =>
      prev.filter(m => !(m.studentId === studentId && m.extracurricularId === extracurricularId && m.semesterId === semesterId))
    );
    logAction('REMOVE_EKSKUL_MEMBER', 'extracurricular_member', studentId, 'Menghapus pilihan ekskul siswa');
  };

  const saveAttendance = (att: Omit<StudentAttendance, 'id'>) => {
    setAttendances(prev => {
      const idx = prev.findIndex(a => a.studentId === att.studentId && a.semesterId === att.semesterId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...att, id: prev[idx].id };
        return updated;
      } else {
        return [...prev, { ...att, id: `att-${Date.now()}` }];
      }
    });
    logAction('SAVE_ATTENDANCE', 'attendance', att.studentId, 'Memperbarui kehadiran siswa');
  };

  const bulkSaveAttendance = (items: Omit<StudentAttendance, 'id'>[]) => {
    setAttendances(prev => {
      const copy = [...prev];
      items.forEach(item => {
        const idx = copy.findIndex(a => a.studentId === item.studentId && a.semesterId === item.semesterId);
        if (idx >= 0) {
          copy[idx] = { ...item, id: copy[idx].id };
        } else {
          copy.push({ ...item, id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}` });
        }
      });
      return copy;
    });
    logAction('BULK_SAVE_ATTENDANCE', 'attendance', 'bulk', `Menyimpan kehadiran untuk ${items.length} siswa`);
  };

  const saveHomeroomNote = (note: Omit<HomeroomNote, 'id'>) => {
    setHomeroomNotes(prev => {
      const idx = prev.findIndex(n => n.studentId === note.studentId && n.semesterId === note.semesterId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...note, id: prev[idx].id };
        return updated;
      } else {
        return [...prev, { ...note, id: `hn-${Date.now()}` }];
      }
    });
    logAction('SAVE_HOMEROOM_NOTE', 'homeroom_note', note.studentId, 'Menyimpan catatan wali kelas');
  };

  const addAchievement = (ach: Omit<StudentAchievement, 'id'>) => {
    const newAch: StudentAchievement = { ...ach, id: `ach-${Date.now()}` };
    setAchievements(prev => [...prev, newAch]);
    logAction('ADD_ACHIEVEMENT', 'achievement', newAch.id, `Menambahkan prestasi siswa: ${newAch.achievementName}`);
  };

  const updateAchievement = (id: string, ach: Partial<StudentAchievement>) => {
    setAchievements(prev => prev.map(a => a.id === id ? { ...a, ...ach } : a));
    logAction('UPDATE_ACHIEVEMENT', 'achievement', id, `Memperbarui prestasi ${id}`);
  };

  const deleteAchievement = (id: string) => {
    setAchievements(prev => prev.filter(a => a.id !== id));
    logAction('DELETE_ACHIEVEMENT', 'achievement', id, `Menghapus prestasi ${id}`);
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
    logAction('RESET_SYSTEM', 'system', 'all', 'Mengembalikan seluruh data ke pengaturan awal (pabrik/demo)');
  };

  return (
    <AppContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
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
