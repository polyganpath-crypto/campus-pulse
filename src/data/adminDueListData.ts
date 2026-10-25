import { StudentDueRecord, AdminNoticeLog } from '../types';

export const INITIAL_STUDENT_DUES: StudentDueRecord[] = [
  {
    dueId: 'due-084-fee',
    studentId: 'std-2026-084',
    studentName: 'Likith E.',
    rollNumber: '22CS084',
    department: 'Computer Science & Engineering',
    section: 'Section A',
    dueType: 'Tuition Fee',
    amountDue: 25000,
    dueDate: '2026-09-28',
    status: 'pending',
    hallTicketEligible: false,
    remarks: 'Semester 6 2nd Installment pending (₹25,000). Clear before exam hall pass issuance.',
    lastNoticeSentAt: '2026-09-30T10:15:00.000Z'
  },
  {
    dueId: 'due-019-lib',
    studentId: 'std-2026-019',
    studentName: 'Aarav Patel',
    rollNumber: '22CS019',
    department: 'Computer Science & Engineering',
    section: 'Section A',
    dueType: 'Library Fine',
    amountDue: 250,
    dueDate: '2026-10-02',
    status: 'pending',
    hallTicketEligible: false,
    remarks: '2 Overdue books: "Database System Concepts (Silberschatz)". Return to Central Library.',
    lastNoticeSentAt: '2026-10-01T14:30:00.000Z'
  },
  {
    dueId: 'due-031-lab',
    studentId: 'std-2026-031',
    studentName: 'Tanya Sengupta',
    rollNumber: '22CS031',
    department: 'Computer Science & Engineering',
    section: 'Section A',
    dueType: 'Lab Clearance',
    amountDue: 850,
    dueDate: '2026-10-05',
    status: 'pending',
    hallTicketEligible: false,
    remarks: 'Breakage receipt required from Hardware Systems Lab In-Charge.',
    lastNoticeSentAt: '2026-10-02T09:00:00.000Z'
  },
  {
    dueId: 'due-052-att',
    studentId: 'std-2026-052',
    studentName: 'Kunal Verma',
    rollNumber: '22CS052',
    department: 'Computer Science & Engineering',
    section: 'Section A',
    dueType: 'Attendance Shortage',
    amountDue: 0,
    dueDate: '2026-10-04',
    status: 'pending',
    hallTicketEligible: false,
    remarks: 'Attendance at 71.2% (< 75% norm). Medical condonation application required from HOD.'
  },
  {
    dueId: 'due-078-hos',
    studentId: 'std-2026-078',
    studentName: 'Sneha Kulkarni',
    rollNumber: '22CS078',
    department: 'Computer Science & Engineering',
    section: 'Section A',
    dueType: 'Hostel / Mess',
    amountDue: 4500,
    dueDate: '2026-10-03',
    status: 'pending',
    hallTicketEligible: false,
    remarks: 'Block 4 Mess catering balance for August & September.',
    lastNoticeSentAt: '2026-09-29T11:00:00.000Z'
  },
  {
    dueId: 'due-095-fee',
    studentId: 'std-2026-095',
    studentName: 'Dev Sharma',
    rollNumber: '22CS095',
    department: 'Computer Science & Engineering',
    section: 'Section A',
    dueType: 'Tuition Fee',
    amountDue: 20000,
    dueDate: '2026-10-01',
    status: 'pending',
    hallTicketEligible: false,
    remarks: 'Semester tuition balance. Scholarship reimbursement pending verification.'
  },
  {
    dueId: 'due-012-clr',
    studentId: 'std-2026-012',
    studentName: 'Arjun Verma',
    rollNumber: '22CS012',
    department: 'Computer Science & Engineering',
    section: 'Section B',
    dueType: 'Tuition Fee',
    amountDue: 0,
    dueDate: '2026-09-20',
    status: 'cleared',
    hallTicketEligible: true,
    remarks: 'Fully paid and cleared. Receipt #REC-2026-8941.'
  },
  {
    dueId: 'due-044-lib',
    studentId: 'std-2026-044',
    studentName: 'Rohan Mehra',
    rollNumber: '22CS044',
    department: 'Computer Science & Engineering',
    section: 'Section B',
    dueType: 'Library Fine',
    amountDue: 150,
    dueDate: '2026-10-06',
    status: 'pending',
    hallTicketEligible: false,
    remarks: 'Late fee for "Algorithm Design (Kleinberg)".'
  },
  {
    dueId: 'due-067-clr',
    studentId: 'std-2026-067',
    studentName: 'Kavya Rao',
    rollNumber: '22CS067',
    department: 'Computer Science & Engineering',
    section: 'Section B',
    dueType: 'Tuition Fee',
    amountDue: 0,
    dueDate: '2026-09-18',
    status: 'cleared',
    hallTicketEligible: true,
    remarks: 'Cleared. Examination Hall Pass Released.'
  }
];

export const INITIAL_ADMIN_NOTICE_LOGS: AdminNoticeLog[] = [
  {
    id: 'log-001',
    recipientRoll: '22CS084',
    recipientName: 'Likith E.',
    noticeType: 'seating_arrangement',
    subject: 'Exam Seating Arrangement Notification: CS601',
    details: 'Allocated to Block A – Room 204, Row 4, Seat 12 for Data Structures & Algorithms.',
    sentAt: '2026-10-03T16:00:00.000Z',
    status: 'delivered'
  },
  {
    id: 'log-002',
    recipientRoll: '22CS084',
    recipientName: 'Likith E.',
    noticeType: 'due_issue',
    subject: 'Academic Fee Due Notice: ₹25,000 Pending',
    details: 'Pending balance for Semester 6 (₹25,000). Clear dues to guarantee examination hall entry.',
    sentAt: '2026-10-03T16:05:00.000Z',
    status: 'delivered'
  },
  {
    id: 'log-003',
    recipientRoll: '22CS019',
    recipientName: 'Aarav Patel',
    noticeType: 'seating_arrangement',
    subject: 'Exam Seating Arrangement Notification: CS601',
    details: 'Allocated to Block A – Room 204, Row 1, Seat 3.',
    sentAt: '2026-10-03T16:00:00.000Z',
    status: 'delivered'
  }
];
