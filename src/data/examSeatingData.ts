import { Examination, ExamHall, SeatingAssignment, ExamSeatingNotification } from '../types';

export const INITIAL_EXAM_HALLS: ExamHall[] = [
  {
    hallId: 'hall-204',
    building: 'Block A',
    floor: '2nd Floor',
    roomNumber: 'Room 204',
    totalSeats: 30,
    rowsCount: 5,
    colsCount: 6,
    inChargeFaculty: 'Dr. Priya Swaminathan (CS Dept)'
  },
  {
    hallId: 'hall-301',
    building: 'Central Tech Block',
    floor: '3rd Floor',
    roomNumber: 'Room 301',
    totalSeats: 40,
    rowsCount: 5,
    colsCount: 8,
    inChargeFaculty: 'Prof. K. Ramesh (Systems Group)'
  },
  {
    hallId: 'hall-102',
    building: 'Block B',
    floor: '1st Floor',
    roomNumber: 'Room 102',
    totalSeats: 24,
    rowsCount: 4,
    colsCount: 6,
    inChargeFaculty: 'Dr. Sunita Rao (Theory Group)'
  }
];

export const INITIAL_EXAMINATIONS: Examination[] = [
  {
    examId: 'exam-cs601',
    subjectCode: 'CS601',
    subject: 'Data Structures & Algorithms',
    department: 'Computer Science & Engineering',
    semester: 6,
    examDate: '2026-10-06',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    reportingTime: '09:30 AM',
    status: 'published',
    isPublished: true,
    totalCandidates: 36,
    assignedHalls: ['hall-204', 'hall-301']
  },
  {
    examId: 'exam-cs602',
    subjectCode: 'CS602',
    subject: 'Distributed Database Systems & Cloud',
    department: 'Computer Science & Engineering',
    semester: 6,
    examDate: '2026-10-09',
    startTime: '02:00 PM',
    endTime: '05:00 PM',
    reportingTime: '01:30 PM',
    status: 'published',
    isPublished: true,
    totalCandidates: 36,
    assignedHalls: ['hall-301']
  },
  {
    examId: 'exam-cs603',
    subjectCode: 'CS603',
    subject: 'Compiler Design & Formal Languages',
    department: 'Computer Science & Engineering',
    semester: 6,
    examDate: '2026-10-14',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    reportingTime: '09:30 AM',
    status: 'scheduled',
    isPublished: false,
    totalCandidates: 36,
    assignedHalls: ['hall-204']
  }
];

export const INITIAL_SEATING_ASSIGNMENTS: SeatingAssignment[] = [
  // Exam CS601 (Data Structures & Algorithms) Assignments
  {
    assignmentId: 'seat-cs601-084',
    examId: 'exam-cs601',
    studentId: 'std-2026-084',
    studentName: 'Likith E.',
    rollNumber: '22CS084',
    department: 'Computer Science & Engineering',
    section: 'Section A',
    hallId: 'hall-204',
    rowNumber: 4,
    seatNumber: 12,
    benchCode: 'B-12',
    assignedAt: '2026-09-28T09:00:00.000Z',
    status: 'allocated'
  },
  {
    assignmentId: 'seat-cs601-019',
    examId: 'exam-cs601',
    studentId: 'std-2026-019',
    studentName: 'Aarav Patel',
    rollNumber: '22CS019',
    department: 'Computer Science & Engineering',
    section: 'Section A',
    hallId: 'hall-204',
    rowNumber: 1,
    seatNumber: 3,
    benchCode: 'B-03',
    assignedAt: '2026-09-28T09:00:00.000Z',
    status: 'allocated'
  },
  {
    assignmentId: 'seat-cs601-031',
    examId: 'exam-cs601',
    studentId: 'std-2026-031',
    studentName: 'Tanya Sengupta',
    rollNumber: '22CS031',
    department: 'Computer Science & Engineering',
    section: 'Section A',
    hallId: 'hall-204',
    rowNumber: 2,
    seatNumber: 6,
    benchCode: 'B-06',
    assignedAt: '2026-09-28T09:00:00.000Z',
    status: 'allocated'
  },
  {
    assignmentId: 'seat-cs601-052',
    examId: 'exam-cs601',
    studentId: 'std-2026-052',
    studentName: 'Kunal Verma',
    rollNumber: '22CS052',
    department: 'Computer Science & Engineering',
    section: 'Section A',
    hallId: 'hall-204',
    rowNumber: 3,
    seatNumber: 9,
    benchCode: 'B-09',
    assignedAt: '2026-09-28T09:00:00.000Z',
    status: 'allocated'
  },
  {
    assignmentId: 'seat-cs601-078',
    examId: 'exam-cs601',
    studentId: 'std-2026-078',
    studentName: 'Sneha Kulkarni',
    rollNumber: '22CS078',
    department: 'Computer Science & Engineering',
    section: 'Section A',
    hallId: 'hall-204',
    rowNumber: 4,
    seatNumber: 11,
    benchCode: 'B-11',
    assignedAt: '2026-09-28T09:00:00.000Z',
    status: 'allocated'
  },
  {
    assignmentId: 'seat-cs601-095',
    examId: 'exam-cs601',
    studentId: 'std-2026-095',
    studentName: 'Dev Sharma',
    rollNumber: '22CS095',
    department: 'Computer Science & Engineering',
    section: 'Section A',
    hallId: 'hall-204',
    rowNumber: 5,
    seatNumber: 15,
    benchCode: 'B-15',
    assignedAt: '2026-09-28T09:00:00.000Z',
    status: 'allocated'
  },

  // Exam CS602 (Distributed Database Systems) Assignments
  {
    assignmentId: 'seat-cs602-084',
    examId: 'exam-cs602',
    studentId: 'std-2026-084',
    studentName: 'Likith E.',
    rollNumber: '22CS084',
    department: 'Computer Science & Engineering',
    section: 'Section A',
    hallId: 'hall-301',
    rowNumber: 2,
    seatNumber: 7,
    benchCode: 'C-07',
    assignedAt: '2026-09-29T10:00:00.000Z',
    status: 'allocated'
  },
  {
    assignmentId: 'seat-cs602-019',
    examId: 'exam-cs602',
    studentId: 'std-2026-019',
    studentName: 'Aarav Patel',
    rollNumber: '22CS019',
    department: 'Computer Science & Engineering',
    section: 'Section A',
    hallId: 'hall-301',
    rowNumber: 3,
    seatNumber: 14,
    benchCode: 'C-14',
    assignedAt: '2026-09-29T10:00:00.000Z',
    status: 'allocated'
  }
];

export const INITIAL_EXAM_NOTIFICATIONS: ExamSeatingNotification[] = [
  {
    notificationId: 'notif-cs601-084',
    studentId: 'std-2026-084',
    rollNumber: '22CS084',
    examId: 'exam-cs601',
    subject: 'Data Structures & Algorithms',
    examDate: '2026-10-06',
    startTime: '10:00 AM',
    reportingTime: '09:30 AM',
    hallInfo: 'Block A – Room 204',
    rowNumber: 4,
    seatNumber: 12,
    scheduledTime: '2026-10-06T09:30:00.000Z', // 30 minutes before 10:00 AM
    status: 'scheduled',
    isUrgent30MinAlert: false
  }
];

// Reference students list for admin seat assignment
export const REGISTERED_STUDENT_ROSTER = [
  { studentId: 'std-2026-084', rollNumber: '22CS084', name: 'Likith E.', department: 'Computer Science & Engineering', section: 'Section A' },
  { studentId: 'std-2026-019', rollNumber: '22CS019', name: 'Aarav Patel', department: 'Computer Science & Engineering', section: 'Section A' },
  { studentId: 'std-2026-031', rollNumber: '22CS031', name: 'Tanya Sengupta', department: 'Computer Science & Engineering', section: 'Section A' },
  { studentId: 'std-2026-052', rollNumber: '22CS052', name: 'Kunal Verma', department: 'Computer Science & Engineering', section: 'Section A' },
  { studentId: 'std-2026-078', rollNumber: '22CS078', name: 'Sneha Kulkarni', department: 'Computer Science & Engineering', section: 'Section A' },
  { studentId: 'std-2026-095', rollNumber: '22CS095', name: 'Dev Sharma', department: 'Computer Science & Engineering', section: 'Section A' },
  { studentId: 'std-2026-012', rollNumber: '22CS012', name: 'Arjun Verma', department: 'Computer Science & Engineering', section: 'Section B' },
  { studentId: 'std-2026-044', rollNumber: '22CS044', name: 'Rohan Mehra', department: 'Computer Science & Engineering', section: 'Section B' },
  { studentId: 'std-2026-067', rollNumber: '22CS067', name: 'Kavya Rao', department: 'Computer Science & Engineering', section: 'Section B' }
];
