import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase';
import { firebaseDbService } from '../services/firebaseDbService';
import {
  UserProfile,
  UserRole,
  Examination,
  ExamHall,
  SeatingAssignment,
  ExamSeatingNotification,
  PermissionRequest,
  StudentDueRecord,
  AdminNoticeLog,
  AcademicDeadline,
  CampusEvent,
  CampusAnnouncement,
  LostFoundItem,
  StudentNotification,
  SubjectAttendance,
  SemesterResult
} from '../types';

import {
  INITIAL_EXAMINATIONS,
  INITIAL_EXAM_HALLS,
  INITIAL_SEATING_ASSIGNMENTS,
  INITIAL_EXAM_NOTIFICATIONS
} from '../data/examSeatingData';
import { INITIAL_PERMISSION_REQUESTS } from '../data/permissionLetterData';
import { INITIAL_STUDENT_DUES, INITIAL_ADMIN_NOTICE_LOGS } from '../data/adminDueListData';
import {
  INITIAL_CAMPUS_EVENTS,
  INITIAL_DEADLINES,
  INITIAL_SUBJECT_ATTENDANCE,
  INITIAL_SEMESTER_RESULTS
} from '../data/mockData';
import { INITIAL_CAMPUS_ANNOUNCEMENTS } from '../data/campusNavigationData';
import { INITIAL_LOST_FOUND_ITEMS } from '../data/lostFoundData';

interface FirebaseContextType {
  firebaseUser: FirebaseUser | null;
  authReady: boolean;
  signInWithGoogle: () => Promise<UserProfile>;
  signInWithEmail: (email: string, password: string) => Promise<UserProfile>;
  signUpWithEmail: (email: string, password: string, profileData: Partial<UserProfile>) => Promise<UserProfile>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOutFirebase: () => Promise<void>;
  examinations: Examination[];
  examHalls: ExamHall[];
  seatingAssignments: SeatingAssignment[];
  examNotifications: ExamSeatingNotification[];
  permissionRequests: PermissionRequest[];
  studentDues: StudentDueRecord[];
  adminNotices: AdminNoticeLog[];
  deadlines: AcademicDeadline[];
  campusEvents: CampusEvent[];
  announcements: CampusAnnouncement[];
  lostItems: LostFoundItem[];
  notifications: StudentNotification[];
  attendance: SubjectAttendance[];
  results: SemesterResult[];
  createAnnouncement: (ann: CampusAnnouncement) => Promise<void>;
  createLostItem: (item: LostFoundItem) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Firestore live state
  const [examinations, setExaminations] = useState<Examination[]>(INITIAL_EXAMINATIONS);
  const [examHalls, setExamHalls] = useState<ExamHall[]>(INITIAL_EXAM_HALLS);
  const [seatingAssignments, setSeatingAssignments] = useState<SeatingAssignment[]>(INITIAL_SEATING_ASSIGNMENTS);
  const [examNotifications, setExamNotifications] = useState<ExamSeatingNotification[]>(INITIAL_EXAM_NOTIFICATIONS);
  const [permissionRequests, setPermissionRequests] = useState<PermissionRequest[]>(INITIAL_PERMISSION_REQUESTS);
  const [studentDues, setStudentDues] = useState<StudentDueRecord[]>(INITIAL_STUDENT_DUES);
  const [adminNotices, setAdminNotices] = useState<AdminNoticeLog[]>(INITIAL_ADMIN_NOTICE_LOGS);
  const [deadlines, setDeadlines] = useState<AcademicDeadline[]>(INITIAL_DEADLINES);
  const [campusEvents, setCampusEvents] = useState<CampusEvent[]>(INITIAL_CAMPUS_EVENTS);
  const [announcements, setAnnouncements] = useState<CampusAnnouncement[]>(INITIAL_CAMPUS_ANNOUNCEMENTS);
  const [lostItems, setLostItems] = useState<LostFoundItem[]>(INITIAL_LOST_FOUND_ITEMS);
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [attendance, setAttendance] = useState<SubjectAttendance[]>(INITIAL_SUBJECT_ATTENDANCE);
  const [results, setResults] = useState<SemesterResult[]>(INITIAL_SEMESTER_RESULTS);

  // Listen to Auth State and handle redirect logins
  useEffect(() => {
    // Check if user is returning from a redirect authentication flow
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          const user = result.user;
          console.info('Redirect sign-in successful for user:', user.email);
          let existingProfile: UserProfile | null = null;
          try {
            existingProfile = await firebaseDbService.getUserProfile(user.uid);
          } catch (profileErr) {
            console.warn('Could not read existing profile after redirect:', profileErr);
          }
          if (!existingProfile) {
            const emailVal = user.email?.toLowerCase() || '';
            const isAdmin =
              emailVal.includes('admin') ||
              emailVal === 'kotlasaikarthik81@gmail.com' ||
              emailVal === 'polyganpath@gmail.com';
            const isFaculty =
              emailVal.includes('faculty') ||
              emailVal.includes('priya') ||
              emailVal.includes('hod');
            const fallbackProfile: UserProfile = {
              id: user.uid,
              name: user.displayName || user.email?.split('@')[0] || 'Campus User',
              email: user.email || '',
              role: isAdmin ? 'admin' : isFaculty ? 'faculty' : 'student',
              department: isAdmin
                ? 'Examination Cell & Student Records Directorate'
                : 'Computer Science & Engineering',
              avatarUrl: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
              year: '3rd Year (VI Semester)',
              section: 'Section A',
              createdAt: new Date().toISOString(),
              ...(isAdmin
                ? {
                    designation: 'Chief Controller of Examinations & Academic Records',
                    cabinLocation: 'Academic Administrative Block - Chamber 104'
                  }
                : isFaculty
                ? {
                    designation: 'Associate Professor & Class Mentor',
                    cabinLocation: 'Cabin #204, Tech Tower'
                  }
                : {
                    rollNumber: '22CS084',
                    semester: 6,
                    section: 'Section A'
                  })
            };
            try {
              await firebaseDbService.saveUserProfile(fallbackProfile);
            } catch (saveErr) {
              console.warn('Could not save user profile after redirect sign-in:', saveErr);
            }
          }
        }
      })
      .catch((error) => {
        console.error('getRedirectResult error on app load:', error?.code, error?.message, error);
      });

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        try {
          setFirebaseUser(user);
          // Only attempt to seed if an authenticated user session is active
          if (user) {
            try {
              await firebaseDbService.initAndSeedDatabase();
            } catch (e) {
              console.warn('Initial database seed check failed:', e);
            }
          }
        } catch (err) {
          console.warn('Auth state change handler encountered an issue:', err);
        } finally {
          // Requirement 5: make sure setAuthReady(true) is always called, even if initAndSeedDatabase throws
          setAuthReady(true);
        }
      },
      (error) => {
        console.error('onAuthStateChanged error:', error);
        setAuthReady(true);
      }
    );

    return () => unsubscribe();
  }, []);

  // Real-time Firestore Subscriptions:
  // CRITICAL: Only attach onSnapshot listeners if auth is ready and user is authenticated!
  useEffect(() => {
    if (!authReady || !firebaseUser) {
      return;
    }

    const unsubExams = firebaseDbService.subscribeExaminations(setExaminations);
    const unsubHalls = firebaseDbService.subscribeExamHalls(setExamHalls);
    const unsubSeats = firebaseDbService.subscribeSeatingAssignments(setSeatingAssignments);
    const unsubNotifs = firebaseDbService.subscribeExamNotifications(setExamNotifications);
    const unsubPerms = firebaseDbService.subscribePermissionRequests(setPermissionRequests);
    const unsubDues = firebaseDbService.subscribeStudentDues(setStudentDues);
    const unsubNotices = firebaseDbService.subscribeAdminNotices(setAdminNotices);
    const unsubDeadlines = firebaseDbService.subscribeAcademicDeadlines(setDeadlines);
    const unsubEvents = firebaseDbService.subscribeCampusEvents(setCampusEvents);
    const unsubAnnouncements = firebaseDbService.subscribeAnnouncements(setAnnouncements);
    const unsubLostItems = firebaseDbService.subscribeLostItems(setLostItems);
    const unsubNotifications = firebaseDbService.subscribeNotifications(firebaseUser.uid, setNotifications);
    const unsubAttendance = firebaseDbService.subscribeAttendance(firebaseUser.uid, setAttendance);
    const unsubResults = firebaseDbService.subscribeResults(firebaseUser.uid, setResults);

    return () => {
      unsubExams();
      unsubHalls();
      unsubSeats();
      unsubNotifs();
      unsubPerms();
      unsubDues();
      unsubNotices();
      unsubDeadlines();
      unsubEvents();
      unsubAnnouncements();
      unsubLostItems();
      unsubNotifications();
      unsubAttendance();
      unsubResults();
    };
  }, [authReady, firebaseUser]);

  const signInWithGoogle = async (): Promise<UserProfile> => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    let fbUser: FirebaseUser;
    try {
      const result = await signInWithPopup(auth, provider);
      fbUser = result.user;
    } catch (popupErr: any) {
      if (
        popupErr?.code === 'auth/popup-blocked' ||
        popupErr?.code === 'auth/cancelled-popup-request'
      ) {
        console.warn('Popup blocked, falling back to signInWithRedirect in FirebaseContext...', popupErr);
        await signInWithRedirect(auth, provider);
        return {} as UserProfile;
      }
      throw popupErr;
    }

    // Check if user has an existing profile in Firestore
    let existing: UserProfile | null = null;
    try {
      existing = await firebaseDbService.getUserProfile(fbUser.uid);
    } catch (err) {
      console.warn('Could not read user profile from Firestore:', err);
    }
    if (existing) {
      return existing;
    }

    // Self-registration is student only unless bootstrap admin email
    const email = fbUser.email?.toLowerCase() || '';
    const isAdmin =
      email === 'kotlasaikarthik81@gmail.com' ||
      email === 'polyganpath@gmail.com' ||
      email === 'admin.examcell@campus.edu';
    const isFaculty = email.includes('faculty') || email.includes('priya') || email.includes('hod');

    const newProfile: UserProfile = {
      id: fbUser.uid,
      name: fbUser.displayName || 'CampusPulse User',
      email: fbUser.email || '',
      role: isAdmin ? 'admin' : isFaculty ? 'faculty' : 'student',
      department: isAdmin
        ? 'Examination Cell & Student Records Directorate'
        : 'Computer Science & Engineering',
      avatarUrl: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      year: '3rd Year (VI Semester)',
      section: 'Section A',
      createdAt: new Date().toISOString(),
      ...(isAdmin
        ? {
            designation: 'Chief Controller of Examinations & Academic Records',
            cabinLocation: 'Academic Administrative Block - Chamber 104'
          }
        : isFaculty
        ? {
            designation: 'Associate Professor & Class Mentor',
            cabinLocation: 'Cabin #204, Tech Tower'
          }
        : {
            rollNumber: '22CS084',
            semester: 6,
            section: 'Section A'
          })
    };

    try {
      await firebaseDbService.saveUserProfile(newProfile);
    } catch (saveErr) {
      console.warn('Could not save user profile to Firestore (continuing with local profile):', saveErr);
    }
    return newProfile;
  };

  const signInWithEmail = async (email: string, password: string): Promise<UserProfile> => {
    const cleanEmail = email.trim().toLowerCase();
    const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const fbUser = result.user;

    let existing: UserProfile | null = null;
    try {
      existing = await firebaseDbService.getUserProfile(fbUser.uid);
    } catch (err) {
      console.warn('Could not read user profile from Firestore:', err);
    }
    if (existing) {
      return existing;
    }

    const isAdmin =
      cleanEmail === 'kotlasaikarthik81@gmail.com' ||
      cleanEmail === 'polyganpath@gmail.com' ||
      cleanEmail === 'admin.examcell@campus.edu' ||
      cleanEmail.includes('admin');
    const isFaculty = cleanEmail.includes('faculty') || cleanEmail.includes('priya') || cleanEmail.includes('hod');

    const profile: UserProfile = {
      id: fbUser.uid,
      name: fbUser.displayName || cleanEmail.split('@')[0],
      email: cleanEmail,
      role: isAdmin ? 'admin' : isFaculty ? 'faculty' : 'student',
      department: isAdmin
        ? 'Examination Cell & Student Records Directorate'
        : 'Computer Science & Engineering',
      avatarUrl: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      year: '3rd Year (VI Semester)',
      section: 'Section A',
      createdAt: new Date().toISOString(),
      ...(isAdmin
        ? {
            designation: 'Chief Controller of Examinations & Academic Records',
            cabinLocation: 'Academic Administrative Block - Chamber 104'
          }
        : isFaculty
        ? {
            designation: 'Associate Professor & Class Mentor',
            cabinLocation: 'Cabin #204, Tech Tower'
          }
        : {
            rollNumber: '22CS084',
            semester: 6,
            section: 'Section A'
          })
    };

    try {
      await firebaseDbService.saveUserProfile(profile);
    } catch (saveErr) {
      console.warn('Could not save user profile to Firestore (continuing with local profile):', saveErr);
    }
    return profile;
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    profileData: Partial<UserProfile>
  ): Promise<UserProfile> => {
    const cleanEmail = email.trim().toLowerCase();
    const result = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    const fbUser = result.user;

    if (profileData.name) {
      await updateProfile(fbUser, {
        displayName: profileData.name
      }).catch((e) => console.warn('Could not set displayName:', e));
    }

    const isAdmin =
      cleanEmail === 'kotlasaikarthik81@gmail.com' ||
      cleanEmail === 'polyganpath@gmail.com' ||
      cleanEmail === 'admin.examcell@campus.edu';
    const role: UserRole = isAdmin ? 'admin' : 'student';
    const newProfile: UserProfile = {
      id: fbUser.uid,
      name: profileData.name || cleanEmail.split('@')[0],
      email: cleanEmail,
      role,
      department:
        profileData.department ||
        (role === 'admin'
          ? 'Examination Cell & Student Records Directorate'
          : 'Computer Science & Engineering'),
      avatarUrl: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      year: '3rd Year (VI Semester)',
      section: 'Section A',
      createdAt: new Date().toISOString(),
      ...(role === 'admin'
        ? {
            designation: profileData.designation || 'Chief Controller of Examinations & Academic Records',
            cabinLocation: profileData.cabinLocation || 'Academic Administrative Block - Chamber 104'
          }
        : {
            rollNumber: profileData.rollNumber || '22CS084',
            semester: profileData.semester || 6,
            section: profileData.section || 'Section A',
            batch: profileData.batch || '2022-2026'
          })
    };

    try {
      await firebaseDbService.saveUserProfile(newProfile);
    } catch (saveErr) {
      console.warn('Could not save new user profile to Firestore (continuing with local profile):', saveErr);
    }
    return newProfile;
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const signOutFirebase = async (): Promise<void> => {
    await signOut(auth);
  };

  const createAnnouncement = async (ann: CampusAnnouncement): Promise<void> => {
    await firebaseDbService.createAnnouncement(ann);
  };

  const createLostItem = async (item: LostFoundItem): Promise<void> => {
    await firebaseDbService.createLostItem(item);
  };

  const markNotificationRead = async (id: string): Promise<void> => {
    await firebaseDbService.markNotificationRead(id);
  };

  const refreshData = async (): Promise<void> => {
    await firebaseDbService.initAndSeedDatabase();
  };

  return (
    <FirebaseContext.Provider
      value={{
        firebaseUser,
        authReady,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        signOutFirebase,
        examinations,
        examHalls,
        seatingAssignments,
        examNotifications,
        permissionRequests,
        studentDues,
        adminNotices,
        deadlines,
        campusEvents,
        announcements,
        lostItems,
        notifications,
        attendance,
        results,
        createAnnouncement,
        createLostItem,
        markNotificationRead,
        refreshData
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseContextType => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
