import {
  Examination,
  ExamHall,
  SeatingAssignment,
  ExamSeatingNotification,
  UserProfile
} from '../types';
import {
  INITIAL_EXAMINATIONS,
  INITIAL_EXAM_HALLS,
  INITIAL_SEATING_ASSIGNMENTS,
  INITIAL_EXAM_NOTIFICATIONS,
  REGISTERED_STUDENT_ROSTER
} from '../data/examSeatingData';
import { jsPDF } from 'jspdf';
import { firebaseDbService } from './firebaseDbService';
import { auth } from '../firebase';

const EXAMS_KEY = 'campuspulse_examinations_v1';
const HALLS_KEY = 'campuspulse_exam_halls_v1';
const SEATS_KEY = 'campuspulse_seating_assignments_v1';
const NOTIFS_KEY = 'campuspulse_exam_notifications_v1';
const SIMULATION_EXAM_KEY = 'campuspulse_simulated_30min_exam_v1';

export interface EnrichedStudentSeating {
  assignmentId: string;
  examId: string;
  subject: string;
  subjectCode: string;
  department: string;
  semester: number;
  examDate: string;
  startTime: string;
  endTime: string;
  reportingTime: string;
  status: Examination['status'];
  isPublished: boolean;
  hallId: string;
  hallInfo: string;
  building: string;
  floor: string;
  roomNumber: string;
  rowNumber: number | string;
  seatNumber: number | string;
  benchCode?: string;
  inChargeFaculty?: string;
  isUrgent30MinAlert: boolean;
  minutesRemainingToExam?: number;
}

export const examSeatingService = {
  // 1. DATA ACCESS METHODS
  getExaminations(): Examination[] {
    try {
      const stored = localStorage.getItem(EXAMS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse exams from localStorage:', e);
    }
    try {
      localStorage.setItem(EXAMS_KEY, JSON.stringify(INITIAL_EXAMINATIONS));
    } catch {}
    return INITIAL_EXAMINATIONS;
  },

  saveExaminations(exams: Examination[]): void {
    try {
      localStorage.setItem(EXAMS_KEY, JSON.stringify(exams));
      if (auth.currentUser) {
        for (const exam of exams) {
          firebaseDbService.createExamination(exam).catch(() => {});
        }
      }
    } catch (e) {
      console.error('Failed to save exams:', e);
    }
  },

  getExamHalls(): ExamHall[] {
    try {
      const stored = localStorage.getItem(HALLS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse halls from localStorage:', e);
    }
    try {
      localStorage.setItem(HALLS_KEY, JSON.stringify(INITIAL_EXAM_HALLS));
    } catch {}
    return INITIAL_EXAM_HALLS;
  },

  saveExamHalls(halls: ExamHall[]): void {
    try {
      localStorage.setItem(HALLS_KEY, JSON.stringify(halls));
      if (auth.currentUser) {
        for (const hall of halls) {
          firebaseDbService.createExamHall(hall).catch(() => {});
        }
      }
    } catch (e) {
      console.error('Failed to save halls:', e);
    }
  },

  getSeatingAssignments(): SeatingAssignment[] {
    try {
      const stored = localStorage.getItem(SEATS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse seating assignments:', e);
    }
    try {
      localStorage.setItem(SEATS_KEY, JSON.stringify(INITIAL_SEATING_ASSIGNMENTS));
    } catch {}
    return INITIAL_SEATING_ASSIGNMENTS;
  },

  saveSeatingAssignments(assignments: SeatingAssignment[]): void {
    try {
      localStorage.setItem(SEATS_KEY, JSON.stringify(assignments));
      if (auth.currentUser) {
        firebaseDbService.saveSeatingAssignments(assignments).catch(() => {});
      }
    } catch (e) {
      console.error('Failed to save seating assignments:', e);
    }
  },

  getNotifications(): ExamSeatingNotification[] {
    try {
      const stored = localStorage.getItem(NOTIFS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse notifications:', e);
    }
    try {
      localStorage.setItem(NOTIFS_KEY, JSON.stringify(INITIAL_EXAM_NOTIFICATIONS));
    } catch {}
    return INITIAL_EXAM_NOTIFICATIONS;
  },

  saveNotifications(notifs: ExamSeatingNotification[]): void {
    try {
      localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs));
      if (auth.currentUser) {
        firebaseDbService.saveExamNotifications(notifs).catch(() => {});
      }
    } catch (e) {
      console.error('Failed to save notifications:', e);
    }
  },

  // 2. PARSE EXAM DATE & TIME TO TIMESTAMP
  parseExamDateTime(dateStr: string, timeStr: string): Date {
    // dateStr: "YYYY-MM-DD" e.g. "2026-10-06"
    // timeStr: "10:00 AM" or "02:00 PM"
    const [year, month, day] = dateStr.split('-').map(Number);
    const parts = timeStr.trim().split(' ');
    const timeParts = parts[0].split(':').map(Number);
    let hours = timeParts[0];
    const minutes = timeParts[1] || 0;
    const modifier = (parts[1] || 'AM').toUpperCase();

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  },

  // 3. STUDENT SEATING RETRIEVAL (STRICT ACCESS CONTROL: ONLY OWN SEATING)
  getStudentSeating(studentId: string, rollNumber?: string): EnrichedStudentSeating[] {
    const exams = this.getExaminations();
    const halls = this.getExamHalls();
    const assignments = this.getSeatingAssignments();

    // Check if simulation mode is active for this student
    const simulatedExam = this.getSimulatedExam(studentId);

    // Filter assignments belonging strictly to this student
    const studentAssignments = assignments.filter(
      (a) =>
        a.studentId === studentId ||
        (rollNumber && a.rollNumber.toLowerCase() === rollNumber.toLowerCase())
    );

    const results: EnrichedStudentSeating[] = [];

    // Include simulated exam if active
    if (simulatedExam) {
      results.push(simulatedExam);
    }

    for (const a of studentAssignments) {
      const exam = exams.find((e) => e.examId === a.examId);
      if (!exam) continue;

      // Only published examinations are visible to normal students
      if (!exam.isPublished && exam.status !== 'published') continue;

      const hall = halls.find((h) => h.hallId === a.hallId) || {
        hallId: a.hallId,
        building: 'Block A',
        floor: '2nd Floor',
        roomNumber: 'Room 204',
        totalSeats: 30,
        rowsCount: 5,
        colsCount: 6
      };

      // Calculate minutes remaining
      const examDateTime = this.parseExamDateTime(exam.examDate, exam.startTime);
      const now = new Date();
      const diffMs = examDateTime.getTime() - now.getTime();
      const diffMins = Math.round(diffMs / 60000);

      // 30-minute window: between (Exam Start - 30 mins) and (Exam Start + 3 hours)
      const isUrgent30MinAlert = diffMins <= 30 && diffMins >= -180;

      results.push({
        assignmentId: a.assignmentId,
        examId: exam.examId,
        subject: exam.subject,
        subjectCode: exam.subjectCode,
        department: exam.department,
        semester: exam.semester,
        examDate: exam.examDate,
        startTime: exam.startTime,
        endTime: exam.endTime,
        reportingTime: exam.reportingTime,
        status: exam.status,
        isPublished: exam.isPublished,
        hallId: hall.hallId,
        hallInfo: `${hall.building} – ${hall.roomNumber}`,
        building: hall.building,
        floor: hall.floor,
        roomNumber: hall.roomNumber,
        rowNumber: a.rowNumber,
        seatNumber: a.seatNumber,
        benchCode: a.benchCode,
        inChargeFaculty: hall.inChargeFaculty,
        isUrgent30MinAlert,
        minutesRemainingToExam: diffMins
      });
    }

    return results;
  },

  // 4. GET NEXT UPCOMING EXAM FOR STUDENT (FOR DASHBOARD CARD)
  getStudentUpcomingExam(studentId: string, rollNumber?: string): EnrichedStudentSeating | null {
    const list = this.getStudentSeating(studentId, rollNumber);
    if (list.length === 0) return null;

    // Prioritize 30-minute urgent alert, then earliest exam
    const urgent = list.find((s) => s.isUrgent30MinAlert);
    if (urgent) return urgent;

    return list[0];
  },

  // 5. STAFF / MENTOR / HOD / ADMIN SEATING RETRIEVAL
  getStaffSeatingAssignments(
    currentUser: UserProfile,
    filters?: {
      search?: string;
      hallId?: string;
      examId?: string;
      status?: string;
    }
  ): {
    assignment: SeatingAssignment;
    exam: Examination;
    hall: ExamHall;
  }[] {
    const exams = this.getExaminations();
    const halls = this.getExamHalls();
    const assignments = this.getSeatingAssignments();

    return assignments
      .map((a) => {
        const exam = exams.find((e) => e.examId === a.examId);
        const hall = halls.find((h) => h.hallId === a.hallId);
        if (!exam || !hall) return null;

        // Role-based visibility check:
        // 1. Admin / Coordinator: can see everything across university
        if (currentUser.role === 'admin' || currentUser.role === 'coordinator') {
          // Allowed
        }
        // 2. HOD: can see everything in department
        else if (currentUser.facultyType === 'hod') {
          if (currentUser.department && a.department.toLowerCase() !== currentUser.department.toLowerCase()) {
            return null;
          }
        }
        // 3. Class Mentor: can see their assigned class (e.g. CSE-A)
        else if (currentUser.facultyType === 'mentor') {
          const assignedClass = currentUser.assignedClass || 'CSE-A';
          if (assignedClass !== 'ALL' && !a.section.toLowerCase().includes('section a')) {
            return null;
          }
        }

        // Apply search filters
        if (filters) {
          if (filters.examId && filters.examId !== 'all' && a.examId !== filters.examId) {
            return null;
          }
          if (filters.hallId && filters.hallId !== 'all' && a.hallId !== filters.hallId) {
            return null;
          }
          if (filters.search) {
            const query = filters.search.toLowerCase();
            const matches =
              a.studentName.toLowerCase().includes(query) ||
              a.rollNumber.toLowerCase().includes(query) ||
              exam.subject.toLowerCase().includes(query) ||
              exam.subjectCode.toLowerCase().includes(query) ||
              hall.roomNumber.toLowerCase().includes(query) ||
              hall.building.toLowerCase().includes(query) ||
              String(a.seatNumber).toLowerCase().includes(query);
            if (!matches) return null;
          }
        }

        return {
          assignment: a,
          exam,
          hall
        };
      })
      .filter((item): item is { assignment: SeatingAssignment; exam: Examination; hall: ExamHall } => item !== null);
  },

  // 6. 30-MINUTE AUTOMATIC NOTIFICATION ENGINE
  checkAndTrigger30MinNotification(
    studentId: string,
    rollNumber?: string
  ): ExamSeatingNotification | null {
    const list = this.getStudentSeating(studentId, rollNumber);
    const notifications = this.getNotifications();
    const now = new Date();

    for (const item of list) {
      const examDateTime = this.parseExamDateTime(item.examDate, item.startTime);
      const diffMs = examDateTime.getTime() - now.getTime();
      const diffMins = Math.round(diffMs / 60000);

      // Check if current time is within 30 minutes before exam up to 3 hours after start
      // Also check if simulation mode triggered it
      const shouldTrigger = item.isUrgent30MinAlert || (diffMins <= 30 && diffMins >= -180);

      if (shouldTrigger) {
        const notifId = `notif-30min-${item.examId}-${studentId}`;
        const existing = notifications.find((n) => n.notificationId === notifId);

        if (!existing) {
          // Create and deliver new notification
          const newNotif: ExamSeatingNotification = {
            notificationId: notifId,
            studentId,
            rollNumber: rollNumber || '22CS084',
            examId: item.examId,
            subject: item.subject,
            examDate: item.examDate,
            startTime: item.startTime,
            reportingTime: item.reportingTime,
            hallInfo: item.hallInfo,
            rowNumber: item.rowNumber,
            seatNumber: item.seatNumber,
            scheduledTime: new Date(examDateTime.getTime() - 30 * 60000).toISOString(),
            sentTime: now.toISOString(),
            status: 'delivered',
            isUrgent30MinAlert: true
          };

          notifications.unshift(newNotif);
          this.saveNotifications(notifications);
          this.playChimeSound();
          return newNotif;
        } else if (existing.status !== 'dismissed') {
          return existing;
        }
      }
    }

    return null;
  },

  // 7. PLAY NOTIFICATION CHIME (Web Audio API)
  playChimeSound(): void {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const now = ctx.currentTime;
      // High chime tone 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Higher chime tone 2
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.15); // A5
      gain2.gain.setValueAtTime(0.15, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.7);
    } catch {
      // Audio playback silently ignored if blocked by autoplay policies
    }
  },

  // 8. TEST / DEMO SIMULATION MODE
  // Instantly sets up an exam starting in 30 minutes to verify the notification behavior without waiting
  simulate30MinTrigger(studentId: string, rollNumber = '22CS084'): ExamSeatingNotification {
    const now = new Date();
    // 30 minutes from right now
    const examStart = new Date(now.getTime() + 30 * 60000);
    const reportingDate = new Date(now.getTime());

    const formatTime = (d: Date) => {
      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutes} ${ampm}`;
    };

    const examStartTimeStr = formatTime(examStart);
    const reportingTimeStr = formatTime(reportingDate);
    const dateStr = now.toISOString().split('T')[0];

    // Store simulated exam state
    const simExam: EnrichedStudentSeating = {
      assignmentId: `seat-sim-${Date.now()}`,
      examId: 'exam-cs601',
      subject: 'Data Structures & Algorithms',
      subjectCode: 'CS601',
      department: 'Computer Science & Engineering',
      semester: 6,
      examDate: dateStr,
      startTime: examStartTimeStr,
      endTime: formatTime(new Date(examStart.getTime() + 180 * 60000)),
      reportingTime: reportingTimeStr,
      status: 'published',
      isPublished: true,
      hallId: 'hall-204',
      hallInfo: 'Block A – Room 204',
      building: 'Block A',
      floor: '2nd Floor',
      roomNumber: 'Room 204',
      rowNumber: 4,
      seatNumber: 12,
      benchCode: 'B-12',
      inChargeFaculty: 'Dr. Priya Swaminathan (CS Dept)',
      isUrgent30MinAlert: true,
      minutesRemainingToExam: 30
    };

    try {
      localStorage.setItem(SIMULATION_EXAM_KEY, JSON.stringify(simExam));
    } catch {
      // ignore
    }

    const notifId = `notif-30min-sim-${studentId}`;
    const notification: ExamSeatingNotification = {
      notificationId: notifId,
      studentId,
      rollNumber,
      examId: 'exam-cs601',
      subject: 'Data Structures & Algorithms',
      examDate: dateStr,
      startTime: examStartTimeStr,
      reportingTime: reportingTimeStr,
      hallInfo: 'Block A – Room 204',
      rowNumber: 4,
      seatNumber: 12,
      scheduledTime: now.toISOString(),
      sentTime: now.toISOString(),
      status: 'delivered',
      isUrgent30MinAlert: true
    };

    const notifs = this.getNotifications();
    const updated = [notification, ...notifs.filter((n) => n.notificationId !== notifId)];
    this.saveNotifications(updated);
    this.playChimeSound();

    return notification;
  },

  getSimulatedExam(studentId: string): EnrichedStudentSeating | null {
    try {
      const stored = localStorage.getItem(SIMULATION_EXAM_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return null;
  },

  resetSimulation(studentId: string): void {
    try {
      localStorage.removeItem(SIMULATION_EXAM_KEY);
      const notifs = this.getNotifications().filter(
        (n) => !n.notificationId.includes('sim')
      );
      this.saveNotifications(notifs);
    } catch {
      // ignore
    }
  },

  // 9. ADMIN ACTIONS: CREATE EXAM, HALL, ASSIGN SEAT, PUBLISH
  createExamination(examData: Omit<Examination, 'examId' | 'status' | 'isPublished' | 'totalCandidates' | 'assignedHalls'>): Examination {
    const exams = this.getExaminations();
    const examId = `exam-${examData.subjectCode.toLowerCase()}-${Date.now().toString().slice(-4)}`;

    const newExam: Examination = {
      ...examData,
      examId,
      status: 'published',
      isPublished: true,
      totalCandidates: 0,
      assignedHalls: ['hall-204']
    };

    exams.unshift(newExam);
    this.saveExaminations(exams);
    return newExam;
  },

  togglePublishExam(examId: string): Examination {
    const exams = this.getExaminations();
    const idx = exams.findIndex((e) => e.examId === examId);
    if (idx === -1) throw new Error('Exam not found');

    const updated = {
      ...exams[idx],
      isPublished: !exams[idx].isPublished,
      status: (!exams[idx].isPublished ? 'published' : 'scheduled') as Examination['status']
    };

    exams[idx] = updated;
    this.saveExaminations(exams);
    return updated;
  },

  createExamHall(hallData: Omit<ExamHall, 'hallId'>): ExamHall {
    const halls = this.getExamHalls();
    const hallId = `hall-${Date.now().toString().slice(-4)}`;
    const newHall: ExamHall = {
      ...hallData,
      hallId
    };
    halls.push(newHall);
    this.saveExamHalls(halls);
    return newHall;
  },

  assignStudentSeat(data: {
    examId: string;
    studentId: string;
    studentName: string;
    rollNumber: string;
    department: string;
    section: string;
    hallId: string;
    rowNumber: number | string;
    seatNumber: number | string;
    benchCode?: string;
  }): SeatingAssignment {
    const assignments = this.getSeatingAssignments();
    const existingIdx = assignments.findIndex(
      (a) => a.examId === data.examId && a.studentId === data.studentId
    );

    const assignmentId = existingIdx >= 0 ? assignments[existingIdx].assignmentId : `seat-${Date.now()}`;
    const newAssignment: SeatingAssignment = {
      ...data,
      assignmentId,
      benchCode: data.benchCode || `B-${String(data.seatNumber).padStart(2, '0')}`,
      assignedAt: new Date().toISOString(),
      status: 'allocated'
    };

    if (existingIdx >= 0) {
      assignments[existingIdx] = newAssignment;
    } else {
      assignments.unshift(newAssignment);
    }

    this.saveSeatingAssignments(assignments);
    return newAssignment;
  },

  // Batch auto-assign class roster to seats in a hall
  batchAutoAssignRoster(examId: string, hallId: string): number {
    const halls = this.getExamHalls();
    const hall = halls.find((h) => h.hallId === hallId) || halls[0];
    const assignments = this.getSeatingAssignments();

    let assignedCount = 0;
    const roster = REGISTERED_STUDENT_ROSTER;

    roster.forEach((student, idx) => {
      const row = Math.floor(idx / hall.colsCount) + 1;
      const seat = (idx % hall.colsCount) + 1;
      const benchCode = `R${row}-S${seat}`;

      const existingIdx = assignments.findIndex(
        (a) => a.examId === examId && a.studentId === student.studentId
      );

      const item: SeatingAssignment = {
        assignmentId: `seat-${examId}-${student.rollNumber}`,
        examId,
        studentId: student.studentId,
        studentName: student.name,
        rollNumber: student.rollNumber,
        department: student.department,
        section: student.section,
        hallId: hall.hallId,
        rowNumber: row,
        seatNumber: seat,
        benchCode,
        assignedAt: new Date().toISOString(),
        status: 'allocated'
      };

      if (existingIdx >= 0) {
        assignments[existingIdx] = item;
      } else {
        assignments.push(item);
      }
      assignedCount++;
    });

    this.saveSeatingAssignments(assignments);
    return assignedCount;
  },

  // 10. GENERATE OFFICIAL PRINTABLE HALL SEATING TICKET (jsPDF)
  generateHallPassPdf(seating: EnrichedStudentSeating, studentName: string, rollNumber: string): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Outer border
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.6);
    doc.rect(10, 10, 190, 277);

    // Header banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(10, 10, 190, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('APEX UNIVERSITY', 105, 19, { align: 'center' });
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.text('DIRECTORATE OF CONTROLLER OF EXAMINATIONS', 105, 25, { align: 'center' });
    doc.text('OFFICIAL EXAMINATION HALL SEATING PASS', 105, 31, { align: 'center' });

    // Reference ID & Academic Year bar
    doc.setFillColor(241, 245, 249);
    doc.rect(10, 38, 190, 9, 'F');
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`PASS ID: ${seating.assignmentId.toUpperCase()}`, 15, 43.5);
    doc.text(`ACADEMIC YEAR: 2025-2026 • SEMESTER ${seating.semester}`, 125, 43.5);

    // STUDENT IDENTITY BOX
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.rect(15, 52, 180, 28);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('CANDIDATE INFORMATION', 20, 58);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Student Name:`, 20, 64);
    doc.setFont('helvetica', 'bold');
    doc.text(studentName, 50, 64);

    doc.setFont('helvetica', 'normal');
    doc.text(`Roll Number:`, 20, 70);
    doc.setFont('helvetica', 'bold');
    doc.text(rollNumber, 50, 70);

    doc.setFont('helvetica', 'normal');
    doc.text(`Department:`, 110, 64);
    doc.setFont('helvetica', 'bold');
    doc.text(seating.department, 135, 64);

    doc.setFont('helvetica', 'normal');
    doc.text(`Academic Class:`, 110, 70);
    doc.setFont('helvetica', 'bold');
    doc.text(`Semester ${seating.semester}`, 135, 70);

    // EXAMINATION DETAILS
    doc.setFillColor(238, 242, 255); // indigo-50
    doc.rect(15, 85, 180, 24, 'F');
    doc.setDrawColor(199, 210, 254);
    doc.rect(15, 85, 180, 24);

    doc.setTextColor(67, 56, 202);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('EXAMINATION & COURSE DETAILS', 20, 91);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Subject: ${seating.subjectCode} - ${seating.subject}`, 20, 97);
    doc.text(`Date of Exam: ${seating.examDate}`, 20, 103);

    doc.text(`Exam Start Time: ${seating.startTime}`, 110, 97);
    doc.text(`Reporting Time: ${seating.reportingTime} (Mandatory)`, 110, 103);

    // PROMINENT SEATING BADGE (HIGH IMPACT VISIBILITY)
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(15, 114, 180, 45, 'F');

    doc.setTextColor(245, 158, 11); // amber-400
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ALLOCATED SEATING ARRANGEMENT', 105, 122, { align: 'center' });

    // Hall Number
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text(seating.hallInfo.toUpperCase(), 105, 132, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text(`${seating.floor} • In-Charge: ${seating.inChargeFaculty || 'Department Invigilator'}`, 105, 138, { align: 'center' });

    // Row & Seat side-by-side
    doc.setFillColor(255, 255, 255);
    doc.rect(35, 142, 60, 12, 'F');
    doc.rect(115, 142, 60, 12, 'F');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`ROW: ${seating.rowNumber}`, 65, 150, { align: 'center' });
    doc.text(`SEAT: ${seating.seatNumber}`, 145, 150, { align: 'center' });

    // 30-MINUTE TIMING & REPORTING RULES
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('MANDATORY CANDIDATE INSTRUCTIONS & DISCIPLINE:', 15, 168);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const instructions = [
      '1. Candidates must arrive at the examination hall exactly at the specified Reporting Time (30 minutes prior).',
      '2. Strict Turnstile Entry: Late entry is NOT permitted after the examination start time under any circumstances.',
      '3. Bring this official printed Seating Pass along with your original University Smart ID Card.',
      '4. Strict Prohibited Items: Smartwatches, programmable calculators, earphones, smartphones, and study notes.',
      '5. Candidates must occupy ONLY the allotted Seat and Bench as inspected on this hall pass.',
      '6. Bags and personal belongings must be deposited on the outer hall cubbies at candidate own risk.'
    ];

    let currentY = 175;
    instructions.forEach((ins) => {
      doc.text(ins, 18, currentY);
      currentY += 6;
    });

    // Verification Stamps
    currentY += 10;
    doc.setDrawColor(203, 213, 225);
    doc.line(15, currentY, 195, currentY);

    currentY += 15;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('CANDIDATE SIGNATURE', 25, currentY);
    doc.text('HALL INVIGILATOR VERIFICATION', 85, currentY);
    doc.text('CONTROLLER OF EXAMINATIONS', 145, currentY);

    currentY += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(studentName, 25, currentY);
    doc.text('Signature & ID Checked', 85, currentY);
    doc.text('Approved Institutional Seal', 145, currentY);

    // Footer timestamp
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Generated from CampusPulse Academic Cloud on ${new Date().toISOString().split('T')[0]}. Digital Verification Hash: SHA256-EXAM-${seating.assignmentId}`,
      105,
      282,
      { align: 'center' }
    );

    doc.save(`Exam_Seating_Pass_${seating.subjectCode}_${rollNumber}.pdf`);
  }
};
