import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType, logFirestoreError as baseLogFirestoreError } from '../firebaseErrors';
import {
  Examination,
  ExamHall,
  SeatingAssignment,
  ExamSeatingNotification,
  PermissionRequest,
  StudentDueRecord,
  AdminNoticeLog,
  AcademicDeadline,
  CampusEvent,
  UserProfile,
  LostFoundItem,
  CampusAnnouncement,
  StudentNotification,
  SubjectAttendance,
  SemesterResult,
  CampusLocation,
  CampusNavEvent,
  CampusAlertNotification,
  StudentQuery,
  QueryMessage,
  QueryStatus,
  QueryStatusHistoryItem
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
import { INITIAL_LOST_FOUND_ITEMS } from '../data/lostFoundData';
import {
  INITIAL_CAMPUS_ANNOUNCEMENTS,
  INITIAL_CAMPUS_LOCATIONS,
  INITIAL_CAMPUS_NAV_EVENTS,
  INITIAL_CAMPUS_ALERTS
} from '../data/campusNavigationData';

/**
 * Non-throwing Firestore error logging helper.
 * Only console.warns with structured diagnostic info and never throws an exception.
 */
export function logFirestoreError(error: unknown, op: OperationType, path: string | null): void {
  baseLogFirestoreError(error, op, path);
}

/**
 * Recursively removes keys with `undefined` values from an object,
 * because Firestore rejects any payload containing `undefined`.
 */
export function removeUndefinedFields<T>(obj: T): T {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => removeUndefinedFields(item)) as unknown as T;
  }
  if (obj instanceof Date) {
    return obj;
  }

  const cleanObj: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
        cleanObj[key] = removeUndefinedFields(value);
      } else {
        cleanObj[key] = value;
      }
    }
  }
  return cleanObj as T;
}

export const firebaseDbService = {
  // -------------------------------------------------------------
  // Seed initial data into Firestore if collections are empty
  // -------------------------------------------------------------
  async initAndSeedDatabase(): Promise<void> {
    if (!auth.currentUser) {
      return;
    }

    const email = auth.currentUser.email?.toLowerCase() || '';
    const isAdmin =
      email === 'kotlasaikarthik81@gmail.com' ||
      email === 'polyganpath@gmail.com' ||
      email.includes('admin') ||
      email.includes('narayanan');

    try {
      // 1. Seed examinations (Admin authority)
      if (isAdmin) {
        const examsSnap = await getDocs(collection(db, 'examinations')).catch((err) => {
          logFirestoreError(err, OperationType.LIST, 'examinations');
          return null;
        });
        if (examsSnap && examsSnap.empty) {
          const batch = writeBatch(db);
          for (const exam of INITIAL_EXAMINATIONS) {
            batch.set(doc(db, 'examinations', exam.examId), removeUndefinedFields(exam));
          }
          await batch.commit().catch((err) => {
            logFirestoreError(err, OperationType.WRITE, 'examinations');
          });
        }

        // 2. Seed exam halls
        const hallsSnap = await getDocs(collection(db, 'exam_halls')).catch((err) => {
          logFirestoreError(err, OperationType.LIST, 'exam_halls');
          return null;
        });
        if (hallsSnap && hallsSnap.empty) {
          const batch = writeBatch(db);
          for (const hall of INITIAL_EXAM_HALLS) {
            batch.set(doc(db, 'exam_halls', hall.hallId), removeUndefinedFields(hall));
          }
          await batch.commit().catch((err) => {
            logFirestoreError(err, OperationType.WRITE, 'exam_halls');
          });
        }

        // 3. Seed seating assignments
        const seatsSnap = await getDocs(collection(db, 'seating_assignments')).catch((err) => {
          logFirestoreError(err, OperationType.LIST, 'seating_assignments');
          return null;
        });
        if (seatsSnap && seatsSnap.empty) {
          const batch = writeBatch(db);
          for (const seat of INITIAL_SEATING_ASSIGNMENTS) {
            batch.set(doc(db, 'seating_assignments', seat.assignmentId), removeUndefinedFields(seat));
          }
          await batch.commit().catch((err) => {
            logFirestoreError(err, OperationType.WRITE, 'seating_assignments');
          });
        }

        // 4. Seed exam notifications
        const notifsSnap = await getDocs(collection(db, 'exam_notifications')).catch((err) => {
          logFirestoreError(err, OperationType.LIST, 'exam_notifications');
          return null;
        });
        if (notifsSnap && notifsSnap.empty) {
          const batch = writeBatch(db);
          for (const notif of INITIAL_EXAM_NOTIFICATIONS) {
            batch.set(doc(db, 'exam_notifications', notif.notificationId), removeUndefinedFields(notif));
          }
          await batch.commit().catch((err) => {
            logFirestoreError(err, OperationType.WRITE, 'exam_notifications');
          });
        }

        // 5. Seed student dues
        const duesSnap = await getDocs(collection(db, 'student_dues')).catch((err) => {
          logFirestoreError(err, OperationType.LIST, 'student_dues');
          return null;
        });
        if (duesSnap && duesSnap.empty) {
          const batch = writeBatch(db);
          for (const due of INITIAL_STUDENT_DUES) {
            batch.set(doc(db, 'student_dues', due.dueId), removeUndefinedFields(due));
          }
          await batch.commit().catch((err) => {
            logFirestoreError(err, OperationType.WRITE, 'student_dues');
          });
        }

        // 6. Seed admin notices
        const noticesSnap = await getDocs(collection(db, 'admin_notices')).catch((err) => {
          logFirestoreError(err, OperationType.LIST, 'admin_notices');
          return null;
        });
        if (noticesSnap && noticesSnap.empty) {
          const batch = writeBatch(db);
          for (const notice of INITIAL_ADMIN_NOTICE_LOGS) {
            batch.set(doc(db, 'admin_notices', notice.id), removeUndefinedFields(notice));
          }
          await batch.commit().catch((err) => {
            logFirestoreError(err, OperationType.WRITE, 'admin_notices');
          });
        }

        // 7. Seed campus events
        const eventsSnap = await getDocs(collection(db, 'campus_events')).catch((err) => {
          logFirestoreError(err, OperationType.LIST, 'campus_events');
          return null;
        });
        if (eventsSnap && eventsSnap.empty) {
          const batch = writeBatch(db);
          for (const event of INITIAL_CAMPUS_EVENTS) {
            batch.set(doc(db, 'campus_events', event.id), removeUndefinedFields(event));
          }
          await batch.commit().catch((err) => {
            logFirestoreError(err, OperationType.WRITE, 'campus_events');
          });
        }
      }

      // 8. Seed academic deadlines
      const deadlinesSnap = await getDocs(collection(db, 'academic_deadlines')).catch((err) => {
        logFirestoreError(err, OperationType.LIST, 'academic_deadlines');
        return null;
      });
      if (deadlinesSnap && deadlinesSnap.empty && isAdmin) {
        const batch = writeBatch(db);
        for (const deadline of INITIAL_DEADLINES) {
          batch.set(doc(db, 'academic_deadlines', deadline.id), removeUndefinedFields(deadline));
        }
        await batch.commit().catch((err) => {
          logFirestoreError(err, OperationType.WRITE, 'academic_deadlines');
        });
      }

      // 9. Seed announcements
      const annSnap = await getDocs(collection(db, 'announcements')).catch((err) => {
        logFirestoreError(err, OperationType.LIST, 'announcements');
        return null;
      });
      if (annSnap && annSnap.empty && (isAdmin || email.includes('faculty'))) {
        const batch = writeBatch(db);
        for (const item of INITIAL_CAMPUS_ANNOUNCEMENTS) {
          const annRecord = {
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            authorId: item.authorId || auth.currentUser.uid,
            authorName: item.authorName || item.authority || 'Academic Administration',
            createdAt: item.createdAt || new Date().toISOString(),
            priority: item.priority || 'normal',
            expiresAt: item.expiresAt || item.expiryDate || new Date(Date.now() + 86400000 * 30).toISOString(),
            department: item.department || 'General',
            authority: item.authority || 'Campus Administration',
            targetDepartment: item.targetDepartment || 'All',
            targetYear: item.targetYear || 'All'
          };
          batch.set(doc(db, 'announcements', item.id), removeUndefinedFields(annRecord));
        }
        await batch.commit().catch((err) => {
          logFirestoreError(err, OperationType.WRITE, 'announcements');
        });
      }

      // 10. Seed lost & found items into lostItems and lostFoundItems
      const lostSnap = await getDocs(collection(db, 'lostItems')).catch((err) => {
        logFirestoreError(err, OperationType.LIST, 'lostItems');
        return null;
      });
      if (lostSnap && lostSnap.empty) {
        const batch = writeBatch(db);
        for (const item of INITIAL_LOST_FOUND_ITEMS) {
          const lfRecord = {
            id: item.id,
            type: item.type,
            title: item.itemName,
            itemName: item.itemName,
            description: item.description,
            category: item.category,
            location: item.location,
            date: item.date,
            time: item.time,
            imageUrl: item.imageUrl || '',
            status: item.status,
            userId: item.studentId || auth.currentUser.uid,
            studentId: item.studentId || auth.currentUser.uid,
            userName: item.reportedBy || 'Student',
            reportedBy: item.reportedBy || 'Student',
            createdAt: item.createdAt || new Date().toISOString(),
            claimStatus: item.claimStatus || 'none',
            contactPreference: item.contactPreference || 'CampusPulse portal'
          };
          batch.set(doc(db, 'lostItems', item.id), removeUndefinedFields(lfRecord));
          batch.set(doc(db, 'lostFoundItems', item.id), removeUndefinedFields(lfRecord));
        }
        await batch.commit().catch((err) => {
          logFirestoreError(err, OperationType.WRITE, 'lostItems');
        });
      }

      // 11. Seed permission requests
      const permsSnap = await getDocs(collection(db, 'permission_requests')).catch((err) => {
        logFirestoreError(err, OperationType.LIST, 'permission_requests');
        return null;
      });
      if (permsSnap && permsSnap.empty) {
        const batch = writeBatch(db);
        for (const perm of INITIAL_PERMISSION_REQUESTS) {
          const permData = {
            ...perm,
            id: perm.requestId,
            destination: perm.destination || perm.subject,
            fromDate: perm.fromDate || perm.startDate,
            toDate: perm.toDate || perm.endDate
          };
          batch.set(doc(db, 'permission_requests', perm.requestId), removeUndefinedFields(permData));
          batch.set(doc(db, 'permissions', perm.requestId), removeUndefinedFields(permData));
        }
        await batch.commit().catch((err) => {
          logFirestoreError(err, OperationType.WRITE, 'permission_requests');
        });
      }

      // 12. Seed attendance records for current user
      const attSnap = await getDocs(collection(db, 'attendance')).catch((err) => {
        logFirestoreError(err, OperationType.LIST, 'attendance');
        return null;
      });
      if (attSnap && attSnap.empty) {
        const batch = writeBatch(db);
        const curUid = auth.currentUser.uid;
        for (const att of INITIAL_SUBJECT_ATTENDANCE) {
          const attDoc = {
            id: `${curUid}_${att.subjectCode}`,
            studentId: curUid,
            subject: att.subjectName,
            subjectCode: att.subjectCode,
            facultyName: att.facultyName,
            totalClasses: att.totalClasses,
            attendedClasses: att.attendedClasses,
            percentage: Number(((att.attendedClasses / att.totalClasses) * 100).toFixed(2)),
            isLab: att.isLab || false,
            credits: att.credits || 3,
            recentRecords: att.recentRecords || []
          };
          batch.set(doc(db, 'attendance', attDoc.id), removeUndefinedFields(attDoc));
        }
        await batch.commit().catch((err) => {
          logFirestoreError(err, OperationType.WRITE, 'attendance');
        });
      }

      // 13. Seed results records for current user
      const resSnap = await getDocs(collection(db, 'results')).catch((err) => {
        logFirestoreError(err, OperationType.LIST, 'results');
        return null;
      });
      if (resSnap && resSnap.empty) {
        const batch = writeBatch(db);
        const curUid = auth.currentUser.uid;
        for (const sem of INITIAL_SEMESTER_RESULTS) {
          const semDoc = {
            id: `${curUid}_sem${sem.semesterNumber}`,
            studentId: curUid,
            semester: sem.semesterNumber,
            academicYear: sem.academicYear,
            sgpa: sem.sgpa,
            SGPA: sem.sgpa,
            cgpa: sem.cgpa,
            totalCredits: sem.totalCredits,
            earnedCredits: sem.earnedCredits,
            declarationDate: sem.declarationDate,
            subjects: sem.subjects
          };
          batch.set(doc(db, 'results', semDoc.id), removeUndefinedFields(semDoc));
        }
        await batch.commit().catch((err) => {
          logFirestoreError(err, OperationType.WRITE, 'results');
        });
      }

      // 14. Seed direct notifications for current user
      const notifSnap = await getDocs(collection(db, 'notifications')).catch((err) => {
        logFirestoreError(err, OperationType.LIST, 'notifications');
        return null;
      });
      if (notifSnap && notifSnap.empty) {
        const batch = writeBatch(db);
        const curUid = auth.currentUser.uid;
        const initialDirectNotifs: StudentNotification[] = [
          {
            id: `notif-${curUid}-1`,
            userId: curUid,
            title: 'Welcome to CampusPulse Full-Stack Portal',
            message: 'Your authenticated profile is synced with cloud Firestore and Firebase Security Rules.',
            type: 'system',
            read: false,
            isRead: false,
            createdAt: new Date().toISOString(),
            actionUrlTab: 'dashboard'
          },
          {
            id: `notif-${curUid}-2`,
            userId: curUid,
            title: 'Upcoming Midterm Exam Room Allocation',
            message: 'Seating arrangements for CS601 have been scheduled. Check your Exam Seating map 30 minutes before commencement.',
            type: 'exam_change',
            read: false,
            isRead: false,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            actionUrlTab: 'exam-seating'
          }
        ];
        for (const n of initialDirectNotifs) {
          batch.set(doc(db, 'notifications', n.id), removeUndefinedFields(n));
        }
        await batch.commit().catch((err) => {
          logFirestoreError(err, OperationType.WRITE, 'notifications');
        });
      }

      // 15. Seed campus locations
      const locSnap = await getDocs(collection(db, 'campus_locations')).catch((err) => {
        logFirestoreError(err, OperationType.LIST, 'campus_locations');
        return null;
      });
      if (locSnap && locSnap.empty && (isAdmin || email.includes('faculty'))) {
        const batch = writeBatch(db);
        for (const loc of INITIAL_CAMPUS_LOCATIONS) {
          batch.set(doc(db, 'campus_locations', loc.id), removeUndefinedFields(loc));
        }
        await batch.commit().catch((err) => {
          logFirestoreError(err, OperationType.WRITE, 'campus_locations');
        });
      }

      // 16. Seed campus nav events
      const navEvtSnap = await getDocs(collection(db, 'campus_nav_events')).catch((err) => {
        logFirestoreError(err, OperationType.LIST, 'campus_nav_events');
        return null;
      });
      if (navEvtSnap && navEvtSnap.empty && (isAdmin || email.includes('faculty'))) {
        const batch = writeBatch(db);
        for (const evt of INITIAL_CAMPUS_NAV_EVENTS) {
          batch.set(doc(db, 'campus_nav_events', evt.id), removeUndefinedFields(evt));
        }
        await batch.commit().catch((err) => {
          logFirestoreError(err, OperationType.WRITE, 'campus_nav_events');
        });
      }

      // 17. Seed campus alerts
      const alertsSnap = await getDocs(collection(db, 'campus_alerts')).catch((err) => {
        logFirestoreError(err, OperationType.LIST, 'campus_alerts');
        return null;
      });
      if (alertsSnap && alertsSnap.empty && (isAdmin || email.includes('faculty'))) {
        const batch = writeBatch(db);
        for (const alt of INITIAL_CAMPUS_ALERTS) {
          batch.set(doc(db, 'campus_alerts', alt.id), removeUndefinedFields(alt));
        }
        await batch.commit().catch((err) => {
          logFirestoreError(err, OperationType.WRITE, 'campus_alerts');
        });
      }
    } catch (e) {
      console.warn('Database seeding checked:', e);
    }
  },

  // -------------------------------------------------------------
  // USER PROFILES
  // -------------------------------------------------------------
  async saveUserProfile(user: UserProfile): Promise<void> {
    if (!auth.currentUser) return;
    const uid = user.id || auth.currentUser.uid;
    const path = `users/${uid}`;
    try {
      const userPayload = {
        ...user,
        uid: uid,
        id: uid,
        name: user.name || auth.currentUser.displayName || 'Campus User',
        email: user.email || auth.currentUser.email || '',
        role: user.role || 'student',
        department: user.department || 'Computer Science & Engineering',
        year: user.year || '3rd Year (VI Semester)',
        section: user.section || 'Section A',
        createdAt: user.createdAt || new Date().toISOString()
      };
      const cleanData = removeUndefinedFields(userPayload);
      await setDoc(doc(db, 'users', uid), cleanData, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!auth.currentUser) return null;
    const path = `users/${userId}`;
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      return snap.exists() ? (snap.data() as UserProfile) : null;
    } catch (error) {
      logFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  // -------------------------------------------------------------
  // EXAMINATIONS
  // -------------------------------------------------------------
  subscribeExaminations(onData: (exams: Examination[]) => void): () => void {
    const path = 'examinations';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: Examination[] = [];
        snapshot.forEach((d) => list.push(d.data() as Examination));
        onData(list);
      },
      (error) => {
        logFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  async createExamination(exam: Examination): Promise<void> {
    const path = `examinations/${exam.examId}`;
    try {
      await setDoc(doc(db, 'examinations', exam.examId), removeUndefinedFields(exam));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateExamination(examId: string, updates: Partial<Examination>): Promise<void> {
    const path = `examinations/${examId}`;
    try {
      await updateDoc(doc(db, 'examinations', examId), removeUndefinedFields(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // -------------------------------------------------------------
  // EXAM HALLS
  // -------------------------------------------------------------
  subscribeExamHalls(onData: (halls: ExamHall[]) => void): () => void {
    const path = 'exam_halls';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: ExamHall[] = [];
        snapshot.forEach((d) => list.push(d.data() as ExamHall));
        onData(list);
      },
      (error) => {
        logFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  async createExamHall(hall: ExamHall): Promise<void> {
    const path = `exam_halls/${hall.hallId}`;
    try {
      await setDoc(doc(db, 'exam_halls', hall.hallId), removeUndefinedFields(hall));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  // -------------------------------------------------------------
  // SEATING ASSIGNMENTS
  // -------------------------------------------------------------
  subscribeSeatingAssignments(onData: (assignments: SeatingAssignment[]) => void): () => void {
    const path = 'seating_assignments';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: SeatingAssignment[] = [];
        snapshot.forEach((d) => list.push(d.data() as SeatingAssignment));
        onData(list);
      },
      (error) => {
        logFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  async saveSeatingAssignments(assignments: SeatingAssignment[]): Promise<void> {
    const batch = writeBatch(db);
    for (const item of assignments) {
      batch.set(doc(db, 'seating_assignments', item.assignmentId), removeUndefinedFields(item));
    }
    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'seating_assignments');
    }
  },

  async updateSeatingAssignment(assignmentId: string, updates: Partial<SeatingAssignment>): Promise<void> {
    const path = `seating_assignments/${assignmentId}`;
    try {
      await updateDoc(doc(db, 'seating_assignments', assignmentId), removeUndefinedFields(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // -------------------------------------------------------------
  // EXAM NOTIFICATIONS
  // -------------------------------------------------------------
  subscribeExamNotifications(onData: (notifs: ExamSeatingNotification[]) => void): () => void {
    const path = 'exam_notifications';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: ExamSeatingNotification[] = [];
        snapshot.forEach((d) => list.push(d.data() as ExamSeatingNotification));
        onData(list);
      },
      (error) => {
        logFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  async saveExamNotifications(notifs: ExamSeatingNotification[]): Promise<void> {
    const batch = writeBatch(db);
    for (const notif of notifs) {
      batch.set(doc(db, 'exam_notifications', notif.notificationId), removeUndefinedFields(notif));
    }
    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'exam_notifications');
    }
  },

  async updateNotificationStatus(
    notificationId: string,
    status: ExamSeatingNotification['status']
  ): Promise<void> {
    const path = `exam_notifications/${notificationId}`;
    try {
      await updateDoc(doc(db, 'exam_notifications', notificationId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // -------------------------------------------------------------
  // PERMISSION REQUESTS (permissions & permission_requests collections)
  // -------------------------------------------------------------
  subscribePermissionRequests(onData: (requests: PermissionRequest[]) => void): () => void {
    const user = auth.currentUser;
    const isStaff = user && (
      user.email === 'polyganpath@gmail.com' ||
      user.email === 'kotlasaikarthik81@gmail.com' ||
      user.email === 'admin.examcell@campus.edu' ||
      (user.email && (
        user.email.includes('admin') ||
        user.email.includes('faculty') ||
        user.email.includes('hod') ||
        user.email.includes('priya')
      ))
    );

    // If student, query by studentId to comply with Firestore ABAC security rule
    const q = isStaff || !user
      ? collection(db, 'permissions')
      : query(collection(db, 'permissions'), where('studentId', '==', user.uid));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: PermissionRequest[] = [];
        snapshot.forEach((d) => list.push(d.data() as PermissionRequest));
        onData(list);
      },
      (error) => {
        logFirestoreError(error, OperationType.GET, 'permissions');
      }
    );
  },

  async createPermissionRequest(request: PermissionRequest): Promise<void> {
    const id = request.requestId || request.id || `req-${Date.now()}`;
    const studentId = request.studentId || auth.currentUser?.uid || 'student';
    const destination = request.destination || request.subject || 'Campus Event';
    const fromDate = request.fromDate || request.startDate || new Date().toISOString().split('T')[0];
    const toDate = request.toDate || request.endDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const createdAt = request.createdAt || new Date().toISOString();

    const record: PermissionRequest = {
      ...request,
      id,
      requestId: id,
      studentId,
      destination,
      fromDate,
      toDate,
      createdAt,
      status: request.status || 'pending_mentor'
    };

    const clean = removeUndefinedFields(record);
    try {
      await setDoc(doc(db, 'permissions', id), clean);
      await setDoc(doc(db, 'permission_requests', id), clean).catch(() => {});
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `permissions/${id}`);
    }
  },

  async updatePermissionRequest(requestId: string, updates: Partial<PermissionRequest>): Promise<void> {
    const cleanUpdates = removeUndefinedFields({
      ...updates,
      updatedAt: new Date().toISOString()
    });
    try {
      await updateDoc(doc(db, 'permissions', requestId), cleanUpdates);
      await updateDoc(doc(db, 'permission_requests', requestId), cleanUpdates).catch(() => {});
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `permissions/${requestId}`);
    }
  },

  async deletePermissionRequest(requestId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'permissions', requestId));
      await deleteDoc(doc(db, 'permission_requests', requestId)).catch(() => {});
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `permissions/${requestId}`);
    }
  },

  // -------------------------------------------------------------
  // STUDENT DUES (DUELIST)
  // -------------------------------------------------------------
  subscribeStudentDues(onData: (dues: StudentDueRecord[]) => void): () => void {
    const path = 'student_dues';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: StudentDueRecord[] = [];
        snapshot.forEach((d) => list.push(d.data() as StudentDueRecord));
        onData(list);
      },
      (error) => {
        logFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  async updateStudentDue(dueId: string, updates: Partial<StudentDueRecord>): Promise<void> {
    const path = `student_dues/${dueId}`;
    try {
      await updateDoc(doc(db, 'student_dues', dueId), removeUndefinedFields(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // -------------------------------------------------------------
  // ADMIN NOTICES
  // -------------------------------------------------------------
  subscribeAdminNotices(onData: (notices: AdminNoticeLog[]) => void): () => void {
    const path = 'admin_notices';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: AdminNoticeLog[] = [];
        snapshot.forEach((d) => list.push(d.data() as AdminNoticeLog));
        onData(list);
      },
      (error) => {
        logFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  async addAdminNotice(notice: AdminNoticeLog): Promise<void> {
    const path = `admin_notices/${notice.id}`;
    try {
      await setDoc(doc(db, 'admin_notices', notice.id), removeUndefinedFields(notice));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  // -------------------------------------------------------------
  // ACADEMIC DEADLINES
  // -------------------------------------------------------------
  subscribeAcademicDeadlines(onData: (deadlines: AcademicDeadline[]) => void): () => void {
    const path = 'academic_deadlines';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: AcademicDeadline[] = [];
        snapshot.forEach((d) => list.push(d.data() as AcademicDeadline));
        onData(list);
      },
      (error) => {
        logFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  async updateDeadline(deadlineId: string, updates: Partial<AcademicDeadline>): Promise<void> {
    if (!auth.currentUser) return;
    const path = `academic_deadlines/${deadlineId}`;
    try {
      await updateDoc(doc(db, 'academic_deadlines', deadlineId), removeUndefinedFields(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // -------------------------------------------------------------
  // CAMPUS EVENTS
  // -------------------------------------------------------------
  subscribeCampusEvents(onData: (events: CampusEvent[]) => void): () => void {
    const path = 'campus_events';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: CampusEvent[] = [];
        snapshot.forEach((d) => list.push(d.data() as CampusEvent));
        onData(list);
      },
      (error) => {
        logFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  async updateCampusEvent(eventId: string, updates: Partial<CampusEvent>): Promise<void> {
    if (!auth.currentUser) return;
    const path = `campus_events/${eventId}`;
    try {
      await updateDoc(doc(db, 'campus_events', eventId), removeUndefinedFields(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // -------------------------------------------------------------
  // LOST & FOUND ITEMS
  // -------------------------------------------------------------
  subscribeLostFoundItems(onData: (items: LostFoundItem[]) => void): () => void {
    const path = 'lostFoundItems';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: LostFoundItem[] = [];
        snapshot.forEach((d) => list.push(d.data() as LostFoundItem));
        onData(list);
      },
      (error) => {
        logFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  async addLostFoundItem(item: LostFoundItem): Promise<void> {
    const path = `lostFoundItems/${item.id}`;
    try {
      await setDoc(doc(db, 'lostFoundItems', item.id), removeUndefinedFields(item));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateLostFoundItem(itemId: string, updates: Partial<LostFoundItem>): Promise<void> {
    const path = `lostFoundItems/${itemId}`;
    try {
      await updateDoc(doc(db, 'lostFoundItems', itemId), removeUndefinedFields(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteLostFoundItem(itemId: string): Promise<void> {
    const path = `lostFoundItems/${itemId}`;
    try {
      await deleteDoc(doc(db, 'lostFoundItems', itemId));
      await deleteDoc(doc(db, 'lostItems', itemId)).catch(() => {});
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // -------------------------------------------------------------
  // ANNOUNCEMENTS
  // -------------------------------------------------------------
  subscribeAnnouncements(onData: (announcements: CampusAnnouncement[]) => void): () => void {
    const path = 'announcements';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: CampusAnnouncement[] = [];
        snapshot.forEach((d) => list.push(d.data() as CampusAnnouncement));
        onData(list);
      },
      (error) => {
        logFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  async createAnnouncement(announcement: CampusAnnouncement): Promise<void> {
    const id = announcement.id || `ann-${Date.now()}`;
    const path = `announcements/${id}`;
    const authorId = auth.currentUser?.uid || 'admin';
    const authorName = auth.currentUser?.displayName || 'Campus Administration';
    const record: CampusAnnouncement = {
      ...announcement,
      id,
      authorId: announcement.authorId || authorId,
      authorName: announcement.authorName || authorName,
      createdAt: announcement.createdAt || new Date().toISOString(),
      priority: announcement.priority || 'normal',
      expiresAt: announcement.expiresAt || announcement.expiryDate || new Date(Date.now() + 86400000 * 30).toISOString()
    };
    try {
      await setDoc(doc(db, 'announcements', id), removeUndefinedFields(record));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateAnnouncement(announcementId: string, updates: Partial<CampusAnnouncement>): Promise<void> {
    const path = `announcements/${announcementId}`;
    try {
      await updateDoc(doc(db, 'announcements', announcementId), removeUndefinedFields(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteAnnouncement(announcementId: string): Promise<void> {
    const path = `announcements/${announcementId}`;
    try {
      await deleteDoc(doc(db, 'announcements', announcementId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // -------------------------------------------------------------
  // LOST ITEMS (Dual collection sync with lostItems and lostFoundItems)
  // -------------------------------------------------------------
  subscribeLostItems(onData: (items: LostFoundItem[]) => void): () => void {
    const path = 'lostItems';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: LostFoundItem[] = [];
        snapshot.forEach((d) => list.push(d.data() as LostFoundItem));
        onData(list);
      },
      (error) => {
        logFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  async createLostItem(item: LostFoundItem): Promise<void> {
    const id = item.id || `lf-${Date.now()}`;
    const now = new Date().toISOString();
    const curUid = auth.currentUser?.uid || 'guest';
    const curName = auth.currentUser?.displayName || 'Student';

    const itemRecord: LostFoundItem = {
      ...item,
      id,
      title: item.title || item.itemName,
      itemName: item.itemName || item.title || 'Untitled Item',
      userId: item.userId || item.studentId || curUid,
      studentId: item.studentId || curUid,
      userName: item.userName || item.reportedBy || curName,
      reportedBy: item.reportedBy || item.userName || curName,
      createdAt: item.createdAt || now,
      updatedAt: now
    };

    const clean = removeUndefinedFields(itemRecord);
    try {
      await setDoc(doc(db, 'lostItems', id), clean);
      await setDoc(doc(db, 'lostFoundItems', id), clean).catch(() => {});
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `lostItems/${id}`);
    }
  },

  async updateLostItem(itemId: string, updates: Partial<LostFoundItem>): Promise<void> {
    const path = `lostItems/${itemId}`;
    const now = new Date().toISOString();
    const cleanUpdates = removeUndefinedFields({ ...updates, updatedAt: now });
    try {
      await updateDoc(doc(db, 'lostItems', itemId), cleanUpdates);
      await updateDoc(doc(db, 'lostFoundItems', itemId), cleanUpdates).catch(() => {});
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteLostItem(itemId: string): Promise<void> {
    const path = `lostItems/${itemId}`;
    try {
      await deleteDoc(doc(db, 'lostItems', itemId));
      await deleteDoc(doc(db, 'lostFoundItems', itemId)).catch(() => {});
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // -------------------------------------------------------------
  // ATTENDANCE
  // -------------------------------------------------------------
  subscribeAttendance(studentId: string, onData: (records: SubjectAttendance[]) => void): () => void {
    const path = 'attendance';
    const q = query(collection(db, path), where('studentId', '==', studentId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: SubjectAttendance[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          // Map to SubjectAttendance shape
          const att: SubjectAttendance = {
            id: d.id,
            subjectCode: data.subjectCode || d.id.split('_')[1] || 'SUBJ',
            subjectName: data.subject || data.subjectName || 'Subject',
            facultyName: data.facultyName || 'Department Faculty',
            totalClasses: Number(data.totalClasses || 40),
            attendedClasses: Number(data.attendedClasses || 35),
            percentage: data.percentage !== undefined
              ? Number(data.percentage)
              : Number(((data.attendedClasses / data.totalClasses) * 100).toFixed(2)),
            isLab: Boolean(data.isLab),
            credits: Number(data.credits || 3),
            recentRecords: data.recentRecords || []
          };
          list.push(att);
        });
        onData(list);
      },
      (error) => {
        logFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  async getAttendance(studentId: string): Promise<SubjectAttendance[]> {
    const path = 'attendance';
    try {
      const q = query(collection(db, path), where('studentId', '==', studentId));
      const snap = await getDocs(q).catch((error) => {
        logFirestoreError(error, OperationType.LIST, path);
        return null;
      });
      if (!snap) return INITIAL_SUBJECT_ATTENDANCE;
      const list: SubjectAttendance[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          subjectCode: data.subjectCode || 'SUBJ',
          subjectName: data.subject || data.subjectName || 'Subject',
          facultyName: data.facultyName || 'Faculty',
          totalClasses: Number(data.totalClasses || 40),
          attendedClasses: Number(data.attendedClasses || 35),
          percentage: Number(data.percentage || ((data.attendedClasses / data.totalClasses) * 100).toFixed(2)),
          isLab: Boolean(data.isLab),
          credits: Number(data.credits || 3),
          recentRecords: data.recentRecords || []
        });
      });
      return list;
    } catch (error) {
      logFirestoreError(error, OperationType.LIST, path);
      return INITIAL_SUBJECT_ATTENDANCE;
    }
  },

  async saveAttendance(studentId: string, records: SubjectAttendance[]): Promise<void> {
    const batch = writeBatch(db);
    for (const r of records) {
      const docId = `${studentId}_${r.subjectCode}`;
      const recordData = {
        id: docId,
        studentId,
        subject: r.subjectName,
        subjectCode: r.subjectCode,
        facultyName: r.facultyName,
        totalClasses: r.totalClasses,
        attendedClasses: r.attendedClasses,
        percentage: Number(((r.attendedClasses / r.totalClasses) * 100).toFixed(2)),
        isLab: r.isLab || false,
        credits: r.credits || 3,
        recentRecords: r.recentRecords || []
      };
      batch.set(doc(db, 'attendance', docId), removeUndefinedFields(recordData));
    }
    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'attendance');
    }
  },

  async updateAttendanceItem(recordId: string, updates: Partial<SubjectAttendance>): Promise<void> {
    const path = `attendance/${recordId}`;
    try {
      await updateDoc(doc(db, 'attendance', recordId), removeUndefinedFields(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // -------------------------------------------------------------
  // RESULTS
  // -------------------------------------------------------------
  subscribeResults(studentId: string, onData: (results: SemesterResult[]) => void): () => void {
    const path = 'results';
    const q = query(collection(db, path), where('studentId', '==', studentId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: SemesterResult[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          list.push({
            semesterNumber: data.semester || data.semesterNumber || 6,
            academicYear: data.academicYear || '2025 - 2026',
            sgpa: Number(data.sgpa || data.SGPA || 9.0),
            cgpa: Number(data.cgpa || 8.9),
            totalCredits: Number(data.totalCredits || 22),
            earnedCredits: Number(data.earnedCredits || 22),
            declarationDate: data.declarationDate || 'Recent Session',
            subjects: data.subjects || []
          });
        });
        list.sort((a, b) => b.semesterNumber - a.semesterNumber);
        onData(list);
      },
      (error) => {
        logFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  async getResults(studentId: string): Promise<SemesterResult[]> {
    const path = 'results';
    try {
      const q = query(collection(db, path), where('studentId', '==', studentId));
      const snap = await getDocs(q).catch((error) => {
        logFirestoreError(error, OperationType.LIST, path);
        return null;
      });
      if (!snap) return INITIAL_SEMESTER_RESULTS;
      const list: SemesterResult[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          semesterNumber: data.semester || data.semesterNumber || 6,
          academicYear: data.academicYear || '2025 - 2026',
          sgpa: Number(data.sgpa || data.SGPA || 9.0),
          cgpa: Number(data.cgpa || 8.9),
          totalCredits: Number(data.totalCredits || 22),
          earnedCredits: Number(data.earnedCredits || 22),
          declarationDate: data.declarationDate || 'Recent Session',
          subjects: data.subjects || []
        });
      });
      list.sort((a, b) => b.semesterNumber - a.semesterNumber);
      return list;
    } catch (error) {
      logFirestoreError(error, OperationType.LIST, path);
      return INITIAL_SEMESTER_RESULTS;
    }
  },

  async saveResults(studentId: string, results: SemesterResult[]): Promise<void> {
    const batch = writeBatch(db);
    for (const res of results) {
      const docId = `${studentId}_sem${res.semesterNumber}`;
      const resDoc = {
        id: docId,
        studentId,
        semester: res.semesterNumber,
        academicYear: res.academicYear,
        sgpa: res.sgpa,
        SGPA: res.sgpa,
        cgpa: res.cgpa,
        totalCredits: res.totalCredits,
        earnedCredits: res.earnedCredits,
        declarationDate: res.declarationDate,
        subjects: res.subjects
      };
      batch.set(doc(db, 'results', docId), removeUndefinedFields(resDoc));
    }
    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'results');
    }
  },

  // -------------------------------------------------------------
  // NOTIFICATIONS (Direct student notifications)
  // -------------------------------------------------------------
  subscribeNotifications(userId: string, onData: (notifs: StudentNotification[]) => void): () => void {
    const path = 'notifications';
    const q = query(collection(db, path), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: StudentNotification[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            userId: data.userId,
            title: data.title,
            message: data.message,
            type: data.type || 'info',
            read: Boolean(data.read || data.isRead),
            isRead: Boolean(data.read || data.isRead),
            createdAt: data.createdAt || new Date().toISOString(),
            actionUrlTab: data.actionUrlTab
          });
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onData(list);
      },
      (error) => {
        logFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  async createNotification(notif: StudentNotification): Promise<void> {
    const id = notif.id || `notif-${Date.now()}`;
    const path = `notifications/${id}`;
    const payload = {
      ...notif,
      id,
      read: false,
      isRead: false,
      createdAt: notif.createdAt || new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'notifications', id), removeUndefinedFields(payload));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async markNotificationRead(notificationId: string): Promise<void> {
    const path = `notifications/${notificationId}`;
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        isRead: true
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteNotification(notificationId: string): Promise<void> {
    const path = `notifications/${notificationId}`;
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // -------------------------------------------------------------
  // CAMPUS LOCATIONS
  // -------------------------------------------------------------
  subscribeCampusLocations(onData: (locations: CampusLocation[]) => void): () => void {
    const path = 'campus_locations';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: CampusLocation[] = [];
        snapshot.forEach((d) => list.push(d.data() as CampusLocation));
        onData(list);
      },
      (error) => {
        logFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  async createCampusLocation(location: CampusLocation): Promise<void> {
    const path = `campus_locations/${location.id}`;
    try {
      await setDoc(doc(db, 'campus_locations', location.id), removeUndefinedFields(location));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateCampusLocation(locationId: string, updates: Partial<CampusLocation>): Promise<void> {
    const path = `campus_locations/${locationId}`;
    try {
      await updateDoc(doc(db, 'campus_locations', locationId), removeUndefinedFields(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteCampusLocation(locationId: string): Promise<void> {
    const path = `campus_locations/${locationId}`;
    try {
      await deleteDoc(doc(db, 'campus_locations', locationId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // -------------------------------------------------------------
  // CAMPUS NAV EVENTS
  // -------------------------------------------------------------
  subscribeCampusNavEvents(onData: (events: CampusNavEvent[]) => void): () => void {
    const path = 'campus_nav_events';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: CampusNavEvent[] = [];
        snapshot.forEach((d) => list.push(d.data() as CampusNavEvent));
        onData(list);
      },
      (error) => {
        logFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  async createCampusNavEvent(event: CampusNavEvent): Promise<void> {
    const path = `campus_nav_events/${event.id}`;
    try {
      await setDoc(doc(db, 'campus_nav_events', event.id), removeUndefinedFields(event));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateCampusNavEvent(eventId: string, updates: Partial<CampusNavEvent>): Promise<void> {
    const path = `campus_nav_events/${eventId}`;
    try {
      await updateDoc(doc(db, 'campus_nav_events', eventId), removeUndefinedFields(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteCampusNavEvent(eventId: string): Promise<void> {
    const path = `campus_nav_events/${eventId}`;
    try {
      await deleteDoc(doc(db, 'campus_nav_events', eventId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // -------------------------------------------------------------
  // CAMPUS ALERTS
  // -------------------------------------------------------------
  subscribeCampusAlerts(onData: (alerts: CampusAlertNotification[]) => void): () => void {
    const path = 'campus_alerts';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: CampusAlertNotification[] = [];
        snapshot.forEach((d) => list.push(d.data() as CampusAlertNotification));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onData(list);
      },
      (error) => {
        logFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  async createCampusAlert(alert: CampusAlertNotification): Promise<void> {
    const path = `campus_alerts/${alert.id}`;
    try {
      await setDoc(doc(db, 'campus_alerts', alert.id), removeUndefinedFields(alert));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateCampusAlert(alertId: string, updates: Partial<CampusAlertNotification>): Promise<void> {
    const path = `campus_alerts/${alertId}`;
    try {
      await updateDoc(doc(db, 'campus_alerts', alertId), removeUndefinedFields(updates));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteCampusAlert(alertId: string): Promise<void> {
    const path = `campus_alerts/${alertId}`;
    try {
      await deleteDoc(doc(db, 'campus_alerts', alertId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Aliases for locations, nav events, alerts
  subscribeLocations(onData: (locations: CampusLocation[]) => void): () => void {
    return this.subscribeCampusLocations(onData);
  },
  async createLocation(location: CampusLocation): Promise<void> {
    return this.createCampusLocation(location);
  },
  async updateLocation(locationId: string, updates: Partial<CampusLocation>): Promise<void> {
    return this.updateCampusLocation(locationId, updates);
  },
  async deleteLocation(locationId: string): Promise<void> {
    return this.deleteCampusLocation(locationId);
  },

  subscribeNavEvents(onData: (events: CampusNavEvent[]) => void): () => void {
    return this.subscribeCampusNavEvents(onData);
  },
  async createNavEvent(event: CampusNavEvent): Promise<void> {
    return this.createCampusNavEvent(event);
  },
  async updateNavEvent(eventId: string, updates: Partial<CampusNavEvent>): Promise<void> {
    return this.updateCampusNavEvent(eventId, updates);
  },
  async deleteNavEvent(eventId: string): Promise<void> {
    return this.deleteCampusNavEvent(eventId);
  },

  subscribeAlerts(onData: (alerts: CampusAlertNotification[]) => void): () => void {
    return this.subscribeCampusAlerts(onData);
  },
  async createAlert(alert: CampusAlertNotification): Promise<void> {
    return this.createCampusAlert(alert);
  },
  async updateAlert(alertId: string, updates: Partial<CampusAlertNotification>): Promise<void> {
    return this.updateCampusAlert(alertId, updates);
  },
  async deleteAlert(alertId: string): Promise<void> {
    return this.deleteCampusAlert(alertId);
  },

  // -------------------------------------------------------------
  // STUDENT QUERY PORTAL (student_queries collection)
  // -------------------------------------------------------------
  subscribeStudentQueries(studentUid: string, onData: (queries: StudentQuery[]) => void): () => void {
    const path = 'student_queries';
    const q = query(collection(db, path), where('studentUid', '==', studentUid));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: StudentQuery[] = [];
        snapshot.forEach((d) => list.push(d.data() as StudentQuery));
        // Sort newest first
        list.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
        onData(list);
      },
      (error) => {
        logFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  subscribeAllStudentQueriesForAdmin(onData: (queries: StudentQuery[]) => void): () => void {
    const path = 'student_queries';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: StudentQuery[] = [];
        snapshot.forEach((d) => list.push(d.data() as StudentQuery));
        list.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
        onData(list);
      },
      (error) => {
        logFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  async getStudentQueries(studentUid: string): Promise<StudentQuery[]> {
    const path = 'student_queries';
    try {
      const q = query(collection(db, path), where('studentUid', '==', studentUid));
      const snapshot = await getDocs(q);
      const list: StudentQuery[] = [];
      snapshot.forEach((d) => list.push(d.data() as StudentQuery));
      list.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  },

  async getAllStudentQueries(): Promise<StudentQuery[]> {
    const path = 'student_queries';
    try {
      const snapshot = await getDocs(collection(db, path));
      const list: StudentQuery[] = [];
      snapshot.forEach((d) => list.push(d.data() as StudentQuery));
      list.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return [];
    }
  },

  async getStudentQueryById(queryId: string): Promise<StudentQuery | null> {
    const path = `student_queries/${queryId}`;
    try {
      const snap = await getDoc(doc(db, 'student_queries', queryId));
      if (snap.exists()) {
        return snap.data() as StudentQuery;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async createStudentQuery(item: StudentQuery): Promise<void> {
    const docId = item.id || item.queryId;
    const path = `student_queries/${docId}`;
    try {
      const clean = removeUndefinedFields({
        ...item,
        id: docId,
        queryId: item.queryId || docId,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString()
      });
      await setDoc(doc(db, 'student_queries', docId), clean);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateStudentQuery(queryId: string, updates: Partial<StudentQuery>): Promise<void> {
    const path = `student_queries/${queryId}`;
    try {
      const clean = removeUndefinedFields({
        ...updates,
        updatedAt: new Date().toISOString()
      });
      await updateDoc(doc(db, 'student_queries', queryId), clean);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async addMessageToStudentQuery(
    queryId: string,
    message: QueryMessage,
    optionalStatus?: QueryStatus,
    optionalHistory?: QueryStatusHistoryItem
  ): Promise<void> {
    const path = `student_queries/${queryId}`;
    try {
      const snap = await getDoc(doc(db, 'student_queries', queryId));
      if (!snap.exists()) {
        throw new Error(`Query ${queryId} not found`);
      }
      const existing = snap.data() as StudentQuery;
      const updatedMessages = [...(existing.messages || []), message];
      const updatedHistory = optionalHistory
        ? [...(existing.statusHistory || []), optionalHistory]
        : (existing.statusHistory || []);

      const payload: Partial<StudentQuery> = {
        messages: updatedMessages,
        statusHistory: updatedHistory,
        updatedAt: new Date().toISOString()
      };

      if (message.senderRole === 'admin' || message.senderRole === 'faculty') {
        payload.latestResponse = message.message;
        payload.latestResponseAt = message.createdAt;
        payload.latestResponseBy = message.senderName;
      }

      if (optionalStatus) {
        payload.status = optionalStatus;
      }

      await updateDoc(doc(db, 'student_queries', queryId), removeUndefinedFields(payload));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteStudentQuery(queryId: string): Promise<void> {
    const path = `student_queries/${queryId}`;
    try {
      await deleteDoc(doc(db, 'student_queries', queryId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
};
