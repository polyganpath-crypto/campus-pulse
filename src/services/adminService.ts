import { StudentDueRecord, AdminNoticeLog } from '../types';
import { INITIAL_STUDENT_DUES, INITIAL_ADMIN_NOTICE_LOGS } from '../data/adminDueListData';
import { REGISTERED_STUDENT_ROSTER } from '../data/examSeatingData';
import { examSeatingService } from './examSeatingService';
import { firebaseDbService } from './firebaseDbService';
import { auth } from '../firebase';

const DUES_KEY = 'campuspulse_admin_dues_inr_v2';
const LOGS_KEY = 'campuspulse_admin_notice_logs_inr_v2';

export interface EnrichedStudentRecord {
  studentId: string;
  name: string;
  rollNumber: string;
  department: string;
  section: string;
  semester: number;
  attendancePercentage: number;
  cgpa: number;
  duesCount: number;
  totalDuesAmount: number;
  isHallTicketCleared: boolean;
  assignedSeatInfo?: string;
  allocatedHall?: string;
  allocatedSeat?: number | string;
}

export const adminService = {
  getDueList(): StudentDueRecord[] {
    try {
      const stored = localStorage.getItem(DUES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse dues from localStorage:', e);
    }
    try {
      localStorage.setItem(DUES_KEY, JSON.stringify(INITIAL_STUDENT_DUES));
    } catch {}
    return INITIAL_STUDENT_DUES;
  },

  saveDueList(dues: StudentDueRecord[]): void {
    try {
      localStorage.setItem(DUES_KEY, JSON.stringify(dues));
      if (auth.currentUser) {
        for (const due of dues) {
          firebaseDbService.updateStudentDue(due.dueId, due).catch(() => {});
        }
      }
    } catch (e) {
      console.error('Failed to save dues:', e);
    }
  },

  getNoticeLogs(): AdminNoticeLog[] {
    try {
      const stored = localStorage.getItem(LOGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse logs from localStorage:', e);
    }
    try {
      localStorage.setItem(LOGS_KEY, JSON.stringify(INITIAL_ADMIN_NOTICE_LOGS));
    } catch {}
    return INITIAL_ADMIN_NOTICE_LOGS;
  },

  saveNoticeLogs(logs: AdminNoticeLog[]): void {
    try {
      localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
      if (auth.currentUser) {
        for (const log of logs) {
          firebaseDbService.addAdminNotice(log).catch(() => {});
        }
      }
    } catch (e) {
      console.error('Failed to save logs:', e);
    }
  },

  // 1. Inform Due Issue directly to student
  informDueIssue(dueId: string, customNote?: string): AdminNoticeLog {
    const dues = this.getDueList();
    const idx = dues.findIndex((d) => d.dueId === dueId);
    if (idx === -1) throw new Error('Due record not found');

    const due = dues[idx];
    const now = new Date().toISOString();

    // Update due with last notice sent timestamp
    dues[idx] = {
      ...due,
      lastNoticeSentAt: now
    };
    this.saveDueList(dues);

    // Create dispatched notice log
    const subject = `⚠️ Important Due Notice: ${due.dueType} Pending (₹${due.amountDue.toLocaleString('en-IN')})`;
    const details =
      customNote ||
      `Official Notice from Examination & Accounts Directorate: You have an outstanding ${due.dueType} balance of ₹${due.amountDue.toLocaleString('en-IN')} due on ${due.dueDate}. Please clear dues at the Finance counter to ensure your examination hall ticket remains valid. (${due.remarks || 'No remarks'})`;

    const newLog: AdminNoticeLog = {
      id: `log-${Date.now()}-${due.rollNumber}`,
      recipientRoll: due.rollNumber,
      recipientName: due.studentName,
      noticeType: 'due_issue',
      subject,
      details,
      sentAt: now,
      status: 'delivered'
    };

    const logs = this.getNoticeLogs();
    logs.unshift(newLog);
    this.saveNoticeLogs(logs);

    return newLog;
  },

  // 2. Mark Due Cleared & Release Hall Ticket
  markDueCleared(dueId: string, receiptNumber?: string): StudentDueRecord {
    const dues = this.getDueList();
    const idx = dues.findIndex((d) => d.dueId === dueId);
    if (idx === -1) throw new Error('Due record not found');

    const due = dues[idx];
    const receipt = receiptNumber || `REC-${Date.now().toString().slice(-5)}`;

    const updated: StudentDueRecord = {
      ...due,
      amountDue: 0,
      status: 'cleared',
      hallTicketEligible: true,
      remarks: `Dues cleared in full. Official Institutional Receipt #${receipt}. Hall ticket clearance granted.`
    };

    dues[idx] = updated;
    this.saveDueList(dues);

    // Also log clearance notice
    const newLog: AdminNoticeLog = {
      id: `log-clr-${Date.now()}`,
      recipientRoll: due.rollNumber,
      recipientName: due.studentName,
      noticeType: 'clearance_alert',
      subject: `✓ Dues Cleared & Hall Pass Validated (${due.dueType})`,
      details: `Your ${due.dueType} has been verified and cleared by the Administration Cell. Receipt #${receipt}. Your Examination Hall Ticket is now completely active.`,
      sentAt: new Date().toISOString(),
      status: 'delivered'
    };

    const logs = this.getNoticeLogs();
    logs.unshift(newLog);
    this.saveNoticeLogs(logs);

    return updated;
  },

  // 3. Inform Student Regarding Seating Arrangement
  informSeatingArrangement(rollNumber: string, examId: string): AdminNoticeLog {
    const assignments = examSeatingService.getSeatingAssignments();
    const exams = examSeatingService.getExaminations();
    const halls = examSeatingService.getExamHalls();

    const assignment = assignments.find(
      (a) => a.rollNumber.toLowerCase() === rollNumber.toLowerCase() && a.examId === examId
    );

    const exam = exams.find((e) => e.examId === examId);

    if (!assignment || !exam) {
      throw new Error(`Seating arrangement for Roll ${rollNumber} on exam ${examId} not found`);
    }

    const hall = halls.find((h) => h.hallId === assignment.hallId);
    const hallInfo = hall ? `${hall.building} – ${hall.roomNumber}` : 'Block A – Room 204';
    const now = new Date().toISOString();

    const subject = `🔔 Exam Seating Notice: ${exam.subjectCode} - ${exam.subject}`;
    const details = `Official Examination Cell Notification: You are allocated to ${hallInfo} (Seat #${assignment.seatNumber}, Row ${assignment.rowNumber}) for ${exam.subject} on ${exam.examDate} starting at ${exam.startTime}. Mandatory reporting time is ${exam.reportingTime}.`;

    const newLog: AdminNoticeLog = {
      id: `log-seat-${Date.now()}-${rollNumber}`,
      recipientRoll: rollNumber,
      recipientName: assignment.studentName,
      noticeType: 'seating_arrangement',
      subject,
      details,
      sentAt: now,
      status: 'delivered'
    };

    const logs = this.getNoticeLogs();
    logs.unshift(newLog);
    this.saveNoticeLogs(logs);

    return newLog;
  },

  // 4. Broadcast Seating Arrangements to all students registered in the exam
  broadcastAllSeatingArrangements(examId: string): number {
    const assignments = examSeatingService.getSeatingAssignments().filter((a) => a.examId === examId);
    let count = 0;

    for (const a of assignments) {
      try {
        this.informSeatingArrangement(a.rollNumber, examId);
        count++;
      } catch {
        // continue
      }
    }

    return count;
  },

  // 5. Get Comprehensive Student Records Database
  getStudentRecords(): EnrichedStudentRecord[] {
    const dues = this.getDueList();
    const assignments = examSeatingService.getSeatingAssignments();
    const halls = examSeatingService.getExamHalls();

    return REGISTERED_STUDENT_ROSTER.map((student, idx) => {
      // Find dues for this student
      const studentDues = dues.filter((d) => d.rollNumber.toLowerCase() === student.rollNumber.toLowerCase());
      const pendingDues = studentDues.filter((d) => d.status === 'pending');
      const totalPendingAmount = pendingDues.reduce((acc, curr) => acc + curr.amountDue, 0);

      // Find seating
      const seatAssignment = assignments.find(
        (a) => a.rollNumber.toLowerCase() === student.rollNumber.toLowerCase()
      );

      let allocatedHallName = undefined;
      if (seatAssignment) {
        const h = halls.find((hall) => hall.hallId === seatAssignment.hallId);
        allocatedHallName = h ? `${h.building} - ${h.roomNumber}` : 'Block A – Room 204';
      }

      // Mock GPA and attendance variations based on index
      const attendancePercentages = [90.5, 87.2, 84.6, 71.2, 88.0, 92.4, 86.5, 79.8, 89.1];
      const cgpas = [8.92, 8.45, 9.15, 7.82, 8.64, 9.40, 8.20, 8.11, 8.75];

      const attendancePercentage = attendancePercentages[idx % attendancePercentages.length];
      const cgpa = cgpas[idx % cgpas.length];

      // Hall ticket is eligible if attendance >= 75% AND no critical dues
      const isHallTicketCleared = attendancePercentage >= 75 && totalPendingAmount === 0;

      return {
        studentId: student.studentId,
        name: student.name,
        rollNumber: student.rollNumber,
        department: student.department,
        section: student.section,
        semester: 6,
        attendancePercentage,
        cgpa,
        duesCount: pendingDues.length,
        totalDuesAmount: totalPendingAmount,
        isHallTicketCleared,
        assignedSeatInfo: seatAssignment
          ? `${allocatedHallName} (Row ${seatAssignment.rowNumber}, Seat ${seatAssignment.seatNumber})`
          : 'Pending Allocation',
        allocatedHall: allocatedHallName,
        allocatedSeat: seatAssignment?.seatNumber
      };
    });
  }
};
