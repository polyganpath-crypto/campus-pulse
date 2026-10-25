import {
  UserProfile,
  SubjectAttendance,
  SemesterResult,
  CampusEvent,
  AcademicDeadline,
  CalendarScheduleItem,
  CollegeDocument,
  DocumentAppointment,
  PlacementTopic,
  CompanyDrive,
  FacultyMember,
  SemesterFeeItem,
  FeeTransaction,
  ProjectTeam,
  ForumPost,
  AiDoubtAgent,
  CampusClub,
  ProjectIdeaPost
} from '../types';

export const INITIAL_STUDENT_USER: UserProfile = {
  id: 'std-2026-084',
  name: 'Likith E.',
  email: 'e.likith363@gmail.com',
  role: 'student',
  rollNumber: '22CS084',
  department: 'Computer Science & Engineering',
  semester: 6,
  batch: '2022 - 2026',
  cgpa: 8.92,
  contactNumber: '+91 98450 12345',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  year: '3rd Year (VI Semester)',
  section: 'Section A',
  assignedClass: 'CSE-A'
};

export const DEMO_FACULTY_USER: UserProfile = {
  id: 'fac-cs-304',
  name: 'Dr. Priya Swaminathan',
  email: 'priya.swaminathan@campus.edu',
  role: 'faculty',
  department: 'Computer Science & Engineering',
  designation: 'Associate Professor & Class Mentor (CSE-A)',
  cabinLocation: 'Block B, Cabin CS-304',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  facultyType: 'mentor',
  assignedClass: 'CSE-A'
};

export const DEMO_HOD_USER: UserProfile = {
  id: 'hod-cs-101',
  name: 'Dr. K. V. Ramanathan',
  email: 'hod.cse@campus.edu',
  role: 'faculty',
  department: 'Computer Science & Engineering',
  designation: 'Professor & Head of Department (HOD)',
  cabinLocation: 'Block B, HOD Secretariat - Cabin 101',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  facultyType: 'hod',
  assignedClass: 'ALL'
};

export const DEMO_ADMIN_USER: UserProfile = {
  id: 'admin-exam-cell-01',
  name: 'Dr. S. Narayanan',
  email: 'admin.examcell@campus.edu',
  role: 'admin',
  department: 'Examination Cell & Student Records Directorate',
  designation: 'Chief Controller of Examinations & Academic Records',
  cabinLocation: 'Academic Administrative Block - Chamber 104',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
};

export const DEMO_COORDINATOR_USER: UserProfile = {
  id: 'coord-tp-01',
  name: 'Dr. Rajesh Sharma',
  email: 'rajesh.sharma.placements@campus.edu',
  role: 'coordinator',
  department: 'Training & Placement Directorate',
  designation: 'Chief Placement & Career Officer',
  cabinLocation: 'Placement Cell, Administrative Block - Floor 2',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
};

export const INITIAL_SUBJECT_ATTENDANCE: SubjectAttendance[] = [
  {
    id: 'att-cs601',
    subjectCode: 'CS601',
    subjectName: 'Design & Analysis of Algorithms',
    facultyName: 'Dr. Priya Swaminathan',
    totalClasses: 42,
    attendedClasses: 38,
    percentage: 90.48,
    isLab: false,
    credits: 4,
    recentRecords: [
      { date: '2026-09-19', status: 'present', topic: 'Dynamic Programming - Traveling Salesperson Problem' },
      { date: '2026-09-17', status: 'present', topic: 'Branch & Bound Technique' },
      { date: '2026-09-15', status: 'absent', topic: 'NP-Completeness & Reductions' },
      { date: '2026-09-12', status: 'present', topic: 'Approximation Algorithms' }
    ]
  },
  {
    id: 'att-cs602',
    subjectCode: 'CS602',
    subjectName: 'Distributed Database Systems & Cloud',
    facultyName: 'Prof. K. Ramesh',
    totalClasses: 40,
    attendedClasses: 35,
    percentage: 87.5,
    isLab: false,
    credits: 4,
    recentRecords: [
      { date: '2026-09-20', status: 'present', topic: 'CAP Theorem & Quorum Consensus' },
      { date: '2026-09-18', status: 'present', topic: 'Two-Phase Commit Protocol (2PC)' },
      { date: '2026-09-16', status: 'present', topic: 'Distributed Sharding Strategies' }
    ]
  },
  {
    id: 'att-cs603',
    subjectCode: 'CS603',
    subjectName: 'Compiler Design & Optimization',
    facultyName: 'Dr. Sunita Rao',
    totalClasses: 36,
    attendedClasses: 28,
    percentage: 77.78,
    isLab: false,
    credits: 3,
    recentRecords: [
      { date: '2026-09-19', status: 'absent', topic: 'LR(1) and LALR Parser Construction' },
      { date: '2026-09-16', status: 'present', topic: 'Syntax-Directed Translation Schemes' },
      { date: '2026-09-14', status: 'present', topic: 'Intermediate Code Generation (TAC)' }
    ]
  },
  {
    id: 'att-cs604',
    subjectCode: 'CS604',
    subjectName: 'Computer Networks & Cybersecurity',
    facultyName: 'Prof. Vikram Mehta',
    totalClasses: 38,
    attendedClasses: 35,
    percentage: 92.11,
    isLab: false,
    credits: 3,
    recentRecords: [
      { date: '2026-09-21', status: 'present', topic: 'BGP Routing & Autonomous Systems' },
      { date: '2026-09-18', status: 'present', topic: 'TLS 1.3 Handshake Security' },
      { date: '2026-09-15', status: 'present', topic: 'TCP Congestion Control (BBR vs CUBIC)' }
    ]
  },
  {
    id: 'att-cs605',
    subjectCode: 'CS605',
    subjectName: 'Machine Learning & Neural Architectures',
    facultyName: 'Dr. Ananya Sen',
    totalClasses: 35,
    attendedClasses: 31,
    percentage: 88.57,
    isLab: false,
    credits: 4,
    recentRecords: [
      { date: '2026-09-20', status: 'present', topic: 'Transformer Attention Mechanisms (MHA)' },
      { date: '2026-09-17', status: 'present', topic: 'Backpropagation through Time' },
      { date: '2026-09-13', status: 'on_duty', topic: 'College Hackathon Representation' }
    ]
  },
  {
    id: 'att-cs608L',
    subjectCode: 'CS608L',
    subjectName: 'Cloud & Systems Engineering Laboratory',
    facultyName: 'Prof. K. Ramesh',
    totalClasses: 14,
    attendedClasses: 14,
    percentage: 100.0,
    isLab: true,
    credits: 2,
    recentRecords: [
      { date: '2026-09-19', status: 'present', topic: 'Kubernetes Pod Autoscaling & Ingress' },
      { date: '2026-09-12', status: 'present', topic: 'Docker Multi-stage Builds & Helm' }
    ]
  }
];

export const INITIAL_SEMESTER_RESULTS: SemesterResult[] = [
  {
    semesterNumber: 6,
    academicYear: '2025 - 2026',
    sgpa: 9.12,
    cgpa: 8.92,
    totalCredits: 22,
    earnedCredits: 22,
    declarationDate: 'September 10, 2026 (Mid-Term Provisional)',
    subjects: [
      { code: 'CS601', name: 'Design & Analysis of Algorithms', credits: 4, internalMarks: 48, maxInternal: 50, externalMarks: 46, maxExternal: 50, totalMarks: 94, maxTotal: 100, grade: 'O', gradePoint: 10, status: 'Pass' },
      { code: 'CS602', name: 'Distributed Database Systems', credits: 4, internalMarks: 46, maxInternal: 50, externalMarks: 45, maxExternal: 50, totalMarks: 91, maxTotal: 100, grade: 'O', gradePoint: 10, status: 'Pass' },
      { code: 'CS603', name: 'Compiler Design', credits: 3, internalMarks: 42, maxInternal: 50, externalMarks: 41, maxExternal: 50, totalMarks: 83, maxTotal: 100, grade: 'A+', gradePoint: 9, status: 'Pass' },
      { code: 'CS604', name: 'Computer Networks & Security', credits: 3, internalMarks: 44, maxInternal: 50, externalMarks: 45, maxExternal: 50, totalMarks: 89, maxTotal: 100, grade: 'A+', gradePoint: 9, status: 'Pass' },
      { code: 'CS605', name: 'Machine Learning', credits: 4, internalMarks: 47, maxInternal: 50, externalMarks: 44, maxExternal: 50, totalMarks: 91, maxTotal: 100, grade: 'O', gradePoint: 10, status: 'Pass' },
      { code: 'CS608L', name: 'Cloud Engineering Lab', credits: 2, internalMarks: 49, maxInternal: 50, externalMarks: 48, maxExternal: 50, totalMarks: 97, maxTotal: 100, grade: 'O', gradePoint: 10, status: 'Pass' },
      { code: 'CS609P', name: 'Mini Project & Capstone Phase 1', credits: 2, internalMarks: 45, maxInternal: 50, externalMarks: 46, maxExternal: 50, totalMarks: 91, maxTotal: 100, grade: 'O', gradePoint: 10, status: 'Pass' }
    ]
  },
  {
    semesterNumber: 5,
    academicYear: '2025 - 2026 (Odd)',
    sgpa: 8.85,
    cgpa: 8.88,
    totalCredits: 23,
    earnedCredits: 23,
    declarationDate: 'January 28, 2026',
    subjects: [
      { code: 'CS501', name: 'Operating Systems & System Calls', credits: 4, internalMarks: 44, maxInternal: 50, externalMarks: 43, maxExternal: 50, totalMarks: 87, maxTotal: 100, grade: 'A+', gradePoint: 9, status: 'Pass' },
      { code: 'CS502', name: 'Database Management Systems', credits: 4, internalMarks: 48, maxInternal: 50, externalMarks: 47, maxExternal: 50, totalMarks: 95, maxTotal: 100, grade: 'O', gradePoint: 10, status: 'Pass' },
      { code: 'CS503', name: 'Theory of Computation & Automata', credits: 4, internalMarks: 41, maxInternal: 50, externalMarks: 42, maxExternal: 50, totalMarks: 83, maxTotal: 100, grade: 'A+', gradePoint: 9, status: 'Pass' },
      { code: 'CS504', name: 'Web Technologies & Frameworks', credits: 3, internalMarks: 46, maxInternal: 50, externalMarks: 45, maxExternal: 50, totalMarks: 91, maxTotal: 100, grade: 'O', gradePoint: 10, status: 'Pass' },
      { code: 'CS508L', name: 'Operating Systems & DBMS Lab', credits: 2, internalMarks: 48, maxInternal: 50, externalMarks: 48, maxExternal: 50, totalMarks: 96, maxTotal: 100, grade: 'O', gradePoint: 10, status: 'Pass' }
    ]
  }
];

export const INITIAL_CAMPUS_EVENTS: CampusEvent[] = [
  {
    id: 'evt-01',
    title: 'HackSphere 2026 - 36-Hour National Collegiate Hackathon',
    category: 'Hackathon',
    description: 'Join 500+ student developers across India to build AI, Web3, and sustainability solutions. Cash prize pool ₹8,00,000 + Fast-track interview rounds with Google & Atlassian.',
    date: 'October 10-12, 2026',
    time: '09:00 AM onwards',
    venue: 'Convention Hall & Innovation Centre, North Block',
    organizer: 'Dept. of CSE & Google Developer Student Club (GDSC)',
    isCampusWide: true,
    isUrgent: true,
    registeredCount: 420,
    userRegistered: true,
    registrationDeadline: 'September 28, 2026'
  },
  {
    id: 'evt-02',
    title: 'Global Tech Leadership Talk: Scalable Distributed Systems at Scale',
    category: 'Workshop',
    description: 'Keynote by Vice President of Engineering, Google Cloud. Deep dive into planetary-scale storage, Spanner transactions, and site reliability engineering.',
    date: 'September 25, 2026',
    time: '02:30 PM - 04:30 PM',
    venue: 'Main Auditorium (Room A-101)',
    organizer: 'Academic Senate & T&P Cell',
    isCampusWide: true,
    isUrgent: false,
    registeredCount: 310,
    userRegistered: false,
    registrationDeadline: 'September 24, 2026'
  },
  {
    id: 'evt-03',
    title: 'Vibrance 2026 - Annual Inter-University Cultural & Tech Fest',
    category: 'Cultural',
    description: 'Battle of the bands, pro-nites, robotics arena, coding duels, gaming tournaments and 40+ competitions with universities across the region.',
    date: 'November 4-6, 2026',
    time: '10:00 AM - 10:00 PM',
    venue: 'Central Campus Grounds & Amphitheatre',
    organizer: 'Student Affairs Council',
    isCampusWide: true,
    isUrgent: false,
    registeredCount: 1250,
    userRegistered: false
  },
  {
    id: 'evt-04',
    title: 'Amazon & Microsoft Pre-Placement Orientation & Resume Clinic',
    category: 'Placement Drive',
    description: 'Direct interaction with university recruitment heads. Resume screening criteria, mock technical design rounds, and compensation tier walkthroughs.',
    date: 'September 27, 2026',
    time: '11:00 AM - 01:00 PM',
    venue: 'Seminar Hall 3 & Virtual Livestream',
    organizer: 'Training & Placement Directorate',
    isCampusWide: true,
    isUrgent: true,
    registeredCount: 280,
    userRegistered: true,
    registrationDeadline: 'September 26, 2026'
  }
];

export const INITIAL_DEADLINES: AcademicDeadline[] = [
  {
    id: 'dl-01',
    title: 'CS601: Assignment 4 - Raft Consensus Simulator Implementation',
    subjectOrArea: 'Algorithms & Distributed Systems',
    dueDate: '2026-09-22',
    dueTime: '11:59 PM (Tomorrow)',
    category: 'Assignment',
    status: 'pending',
    urgency: 'critical',
    actionUrlTab: 'calendar'
  },
  {
    id: 'dl-02',
    title: 'Semester 6 Tuition Fee - 2nd Installment Balance (₹25,000)',
    subjectOrArea: 'Finance Office',
    dueDate: '2026-09-28',
    dueTime: '05:00 PM',
    category: 'Fee Payment',
    status: 'pending',
    urgency: 'critical',
    actionUrlTab: 'fees'
  },
  {
    id: 'dl-03',
    title: 'Submit 6th Sem Internship NOC & Bonafide at Admin Counter 3',
    subjectOrArea: 'Documentation Cell',
    dueDate: '2026-09-24',
    dueTime: '03:30 PM',
    category: 'Documentation',
    status: 'pending',
    urgency: 'critical',
    actionUrlTab: 'documentation'
  },
  {
    id: 'dl-04',
    title: 'Google SDE-1 Campus Drive Resume & Profile Verification',
    subjectOrArea: 'Placements Directorate',
    dueDate: '2026-09-26',
    dueTime: '06:00 PM',
    category: 'Placement Drive',
    status: 'pending',
    urgency: 'moderate',
    actionUrlTab: 'placements'
  },
  {
    id: 'dl-05',
    title: 'Compiler Design Lab Exercise 5: LALR(1) Parsing Table in C++/Python',
    subjectOrArea: 'Compiler Design (CS603)',
    dueDate: '2026-09-30',
    dueTime: '04:00 PM',
    category: 'Assignment',
    status: 'pending',
    urgency: 'upcoming',
    actionUrlTab: 'calendar'
  }
];

export const INITIAL_CALENDAR_ITEMS: CalendarScheduleItem[] = [
  { id: 'cal-1', title: 'CS601 Lecture: Dynamic Programming', date: '2026-09-21', startTime: '09:00 AM', endTime: '10:00 AM', type: 'class', location: 'Hall CS-301', subject: 'Algorithms' },
  { id: 'cal-2', title: 'CS602 Lecture: CAP Theorem & Quorums', date: '2026-09-21', startTime: '10:15 AM', endTime: '11:15 AM', type: 'class', location: 'Hall CS-205', subject: 'Distributed DB' },
  { id: 'cal-3', title: 'Documentation Counter Appointment: Bonafide Token #B-14', date: '2026-09-22', startTime: '11:30 AM', endTime: '12:00 PM', type: 'deadline', location: 'Admin Block Counter 3' },
  { id: 'cal-4', title: 'CS601 Assignment 4 Submission Due', date: '2026-09-22', startTime: '11:59 PM', endTime: '11:59 PM', type: 'deadline', subject: 'CS601' },
  { id: 'cal-5', title: 'Self-Study: Graph Algorithms & LeetCode Hard', date: '2026-09-23', startTime: '06:00 PM', endTime: '08:00 PM', type: 'study', location: 'Library Study Pod 4', isPersonalStudy: true },
  { id: 'cal-6', title: 'Documentation Cell Slot: Internship NOC Stamp', date: '2026-09-24', startTime: '02:00 PM', endTime: '02:30 PM', type: 'deadline', location: 'Student Affairs Counter 2' },
  { id: 'cal-7', title: 'Global Tech Keynote: Google Cloud Principal Eng', date: '2026-09-25', startTime: '02:30 PM', endTime: '04:30 PM', type: 'club', location: 'Main Auditorium' },
  { id: 'cal-8', title: 'Amazon Pre-Placement Resume Clinic', date: '2026-09-27', startTime: '11:00 AM', endTime: '01:00 PM', type: 'deadline', location: 'Seminar Hall 3' },
  { id: 'cal-9', title: 'Semester 6 Tuition Installment Final Due Date', date: '2026-09-28', startTime: '05:00 PM', endTime: '05:00 PM', type: 'deadline' }
];

export const INITIAL_COLLEGE_DOCUMENTS: CollegeDocument[] = [
  {
    id: 'doc-01',
    name: '10th & 12th Standard Original Marksheets',
    category: 'Admission',
    description: 'Original board certificates and 2 sets of self-attested photocopies for university record audit.',
    mandatoryFor: 'Semester 1-8 Enrollment and Degree Clearance',
    copiesRequired: 'Original + 2 Attested Copies',
    status: 'Verified',
    departmentCounter: 'Admin Block - Counter 1',
    fileHint: 'Keep laminated original safe. Verification stamp is in ERP.'
  },
  {
    id: 'doc-02',
    name: 'Consolidated Grade Sheet (Semesters 1 to 5)',
    category: 'Academic',
    description: 'Certified transcript issued by Controller of Examinations showing all cleared credits and current CGPA.',
    mandatoryFor: 'Placement Company Drives & Higher Studies Verification',
    copiesRequired: '1 Official Sealed Copy',
    status: 'Submitted',
    departmentCounter: 'Examination Wing - Counter 4',
    fileHint: 'Digital attested PDF available in Exam Results tab.'
  },
  {
    id: 'doc-03',
    name: 'Internship No-Objection Certificate (NOC) & Offer Letter',
    category: 'Placement',
    description: 'Approval document from Department Head authorizing 8th semester 6-month industry internship.',
    mandatoryFor: 'Corporate Internship Onboarding & Attendance Exemption',
    copiesRequired: 'Company Offer Letter copy + Signed NOC Form',
    status: 'Pending',
    submissionDeadline: 'September 24, 2026',
    departmentCounter: 'Admin Block - Counter 3',
    fileHint: 'Requires HOD signature + Placement Coordinator stamp.'
  },
  {
    id: 'doc-04',
    name: 'Bonafide Student Certificate & Study Undertaking',
    category: 'Academic',
    description: 'Official letter confirming active student status for passport, bank education loan, and external hackathons.',
    mandatoryFor: 'Education Loan Subsidy & National Competitions',
    copiesRequired: 'Original Issued Document',
    status: 'Ready for Collection',
    submissionDeadline: 'September 23, 2026',
    departmentCounter: 'Student Affairs - Counter 2',
    fileHint: 'Generated on official university letterhead with hologram seal.'
  },
  {
    id: 'doc-05',
    name: 'Tuition Fee Payment Clearance Receipt (Sem 6)',
    category: 'Scholarship',
    description: 'Payment receipt acknowledgement verifying full or installment fee clearance for semester hall ticket.',
    mandatoryFor: 'End-Semester Exam Hall Ticket Hall Pass',
    copiesRequired: 'Printed Transaction Acknowledgment',
    status: 'Pending',
    submissionDeadline: 'September 28, 2026',
    departmentCounter: 'Accounts Directorate - Counter 5',
    fileHint: 'Can pay directly via Fee portal to instantly mark cleared.'
  },
  {
    id: 'doc-06',
    name: 'College Smart ID Card & Campus Transit RFID Pass',
    category: 'Verification',
    description: 'Re-validation hologram sticker for the current academic session 2025-2026.',
    mandatoryFor: 'Library Access, Turnstile Gate Entry & Bus Route Access',
    copiesRequired: 'Physical Smart Card',
    status: 'Pending',
    submissionDeadline: 'October 05, 2026',
    departmentCounter: 'Security & Transit Desk - Ground Floor',
    fileHint: 'Takes 2 minutes at the counter once queue token is called.'
  }
];

export const INITIAL_DOCUMENT_APPOINTMENTS: DocumentAppointment[] = [
  {
    id: 'app-01',
    studentId: 'std-2026-084',
    documentName: 'Bonafide Student Certificate Collection',
    counter: 'Student Affairs - Counter 2',
    date: '2026-09-22',
    timeSlot: '11:30 AM - 12:00 PM',
    tokenNumber: 'DOC-B14',
    status: 'Confirmed',
    reminderEnabled: true,
    reminderNote: 'Bring original college ID card and fee receipt.'
  }
];

export const INITIAL_PLACEMENT_TOPICS: PlacementTopic[] = [
  {
    id: 'topic-01',
    category: 'Data Structures',
    title: 'Graphs, Disjoint Sets (DSU) & Minimum Spanning Trees',
    description: 'BFS, DFS, Dijkstra, Bellman-Ford, Kruskal, topological sorting, and cycle detection.',
    importance: 'Very High',
    masteryPercentage: 88,
    totalQuestions: 45,
    solvedQuestions: 40,
    keyInterviewTips: [
      'Always state whether graph is directed or undirected before choosing adjacency list.',
      'Check if negative edge weights exist before defaulting to Dijkstra.',
      'For cycle detection in directed graphs, maintain 3-state visited coloring (0: unvisited, 1: visiting, 2: visited).'
    ]
  },
  {
    id: 'topic-02',
    category: 'Algorithms',
    title: 'Dynamic Programming Patterns & Memoization',
    description: '0/1 Knapsack, Longest Common Subsequence, Matrix Chain, Interval DP, and Bitmask DP.',
    importance: 'Very High',
    masteryPercentage: 74,
    totalQuestions: 50,
    solvedQuestions: 37,
    keyInterviewTips: [
      'Write recursion relation on whiteboard first before writing code.',
      'Explain space optimization from 2D matrix down to 1D rolling array for extra brownie points.',
      'Identify whether optimal substructure and overlapping subproblems both hold.'
    ]
  },
  {
    id: 'topic-03',
    category: 'System Design',
    title: 'High-Level Architecture, Caching & Message Queues',
    description: 'Load balancers, CDN, Redis cache-aside, Kafka pub/sub, database sharding, and consistency models.',
    importance: 'Very High',
    masteryPercentage: 62,
    totalQuestions: 20,
    solvedQuestions: 12,
    keyInterviewTips: [
      'Begin by scoping functional and non-functional requirements (QPS, storage scale).',
      'Do back-of-the-envelope calculations for read vs write IOPS.',
      'Explicitly discuss single points of failure (SPOF) and disaster recovery.'
    ]
  },
  {
    id: 'topic-04',
    category: 'DBMS & SQL',
    title: 'ACID Properties, Indexes (B-Tree/LSM), and Complex SQL',
    description: 'Window functions (RANK, DENSE_RANK), indexing mechanics, query execution plans, and normalization.',
    importance: 'High',
    masteryPercentage: 85,
    totalQuestions: 35,
    solvedQuestions: 30,
    keyInterviewTips: [
      'Understand why indexing columns with low cardinality (e.g. gender) is counter-productive.',
      'Master difference between WHERE and HAVING with GROUP BY.',
      'Explain isolation levels (Read Committed, Repeatable Read, Serializable) clearly.'
    ]
  },
  {
    id: 'topic-05',
    category: 'Core CS',
    title: 'Operating Systems: Threads, Deadlocks & Virtual Memory',
    description: 'Process synchronization, Mutex vs Semaphore, Paging, TLB, Page replacement algorithms.',
    importance: 'High',
    masteryPercentage: 80,
    totalQuestions: 30,
    solvedQuestions: 24,
    keyInterviewTips: [
      'State Coffman four conditions for deadlocks and prevention mechanisms.',
      'Explain context switching overhead and difference between user space vs kernel space.',
      'Understand why virtual memory avoids external fragmentation.'
    ]
  },
  {
    id: 'topic-06',
    category: 'HR & Behavioral',
    title: 'STAR Method & Culture Fit Storytelling',
    description: 'Situation, Task, Action, Result framework for leadership, conflict resolution, and technical failures.',
    importance: 'High',
    masteryPercentage: 92,
    totalQuestions: 15,
    solvedQuestions: 14,
    keyInterviewTips: [
      'Never blame teammates when discussing a project setback; focus on self-reflection and corrective actions.',
      'Quantify your results: "reduced API latency by 42%" instead of "made it faster".',
      'Prepare 2 thoughtful questions for the interviewer regarding engineering culture.'
    ]
  }
];

export const INITIAL_COMPANY_DRIVES: CompanyDrive[] = [
  {
    id: 'drv-01',
    companyName: 'Google',
    role: 'Software Development Engineer - 1 (New Grad 2026)',
    ctcPackage: '₹32.5 LPA Base + ₹25L Stocks',
    eligibilityCgpa: 8.0,
    deadline: 'September 26, 2026',
    rounds: ['Online Assessment (2 DSA)', 'Technical Phone Screen', '3 Virtual Onsite Coding', 'Googleyness & Leadership'],
    location: 'Bangalore / Hyderabad / Sunnyvale',
    isApplied: true,
    userEligible: true
  },
  {
    id: 'drv-02',
    companyName: 'Microsoft',
    role: 'Software Engineer - Cloud & AI Platforms',
    ctcPackage: '₹44 LPA CTC (incl. RSUs & Joining Bonus)',
    eligibilityCgpa: 7.5,
    deadline: 'October 02, 2026',
    rounds: ['Codility OA', 'System Design Round', 'Algorithm Round', 'AA / Director Interview'],
    location: 'Hyderabad / Noida',
    isApplied: false,
    userEligible: true
  },
  {
    id: 'drv-03',
    companyName: 'Atlassian',
    role: 'Associate Site Reliability Engineer & Developer Tools',
    ctcPackage: '₹52.8 LPA CTC',
    eligibilityCgpa: 8.5,
    deadline: 'October 08, 2026',
    rounds: ['HackerRank Coding', 'System Debugging & Linux Internals', 'Values & Craft Interview'],
    location: 'Bengaluru (Hybrid)',
    isApplied: false,
    userEligible: true
  },
  {
    id: 'drv-04',
    companyName: 'Amazon',
    role: 'Software Development Engineer Intern (6 Months)',
    ctcPackage: '₹1,10,000/month Stipend + PPO Opportunity',
    eligibilityCgpa: 7.0,
    deadline: 'September 30, 2026',
    rounds: ['AMCAT OA', 'Technical Round 1', 'Bar Raiser Round'],
    location: 'Chennai / Bangalore',
    isApplied: true,
    userEligible: true
  }
];

export const INITIAL_FACULTY_MEMBERS: FacultyMember[] = [
  {
    id: 'fac-01',
    name: 'Dr. Priya Swaminathan',
    subject: 'Design & Analysis of Algorithms (CS601)',
    department: 'Computer Science & Engineering',
    cabin: 'Block B, Cabin CS-304',
    email: 'priya.swaminathan@campus.edu',
    officeHours: 'Mon, Wed, Fri: 03:00 PM - 05:00 PM',
    isOnline: true,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'fac-02',
    name: 'Prof. K. Ramesh',
    subject: 'Distributed Database Systems & Cloud (CS602)',
    department: 'Computer Science & Engineering',
    cabin: 'Block B, Cabin CS-210',
    email: 'ramesh.k@campus.edu',
    officeHours: 'Tue, Thu: 02:00 PM - 04:30 PM',
    isOnline: true,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'fac-03',
    name: 'Dr. Sunita Rao',
    subject: 'Compiler Design & Formal Languages (CS603)',
    department: 'Computer Science & Engineering',
    cabin: 'Block B, Cabin CS-312',
    email: 'sunita.rao@campus.edu',
    officeHours: 'Mon, Thu: 11:30 AM - 01:00 PM',
    isOnline: false,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'fac-04',
    name: 'Prof. Vikram Mehta',
    subject: 'Computer Networks & Cybersecurity (CS604)',
    department: 'Computer Science & Engineering',
    cabin: 'Block B, Cabin CS-408',
    email: 'vikram.mehta@campus.edu',
    officeHours: 'Wed, Fri: 01:30 PM - 03:30 PM',
    isOnline: true,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'fac-05',
    name: 'Dr. Ananya Sen',
    subject: 'Machine Learning & Neural Architectures (CS605)',
    department: 'Artificial Intelligence & Data Science',
    cabin: 'Innovation Block, Cabin AI-102',
    email: 'ananya.sen@campus.edu',
    officeHours: 'Tue, Fri: 10:00 AM - 12:30 PM',
    isOnline: true,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_SEMESTER_FEES: SemesterFeeItem[] = [
  {
    semester: 6,
    academicYear: '2025 - 2026 (Current)',
    tuitionFee: 55000,
    labFee: 8000,
    libraryFee: 4000,
    amenitiesFee: 4000,
    examFee: 4000,
    totalFee: 75000,
    paidAmount: 50000,
    dueBalance: 25000,
    dueDate: 'September 28, 2026',
    status: 'Due Soon'
  },
  {
    semester: 5,
    academicYear: '2025 - 2026 (Odd)',
    tuitionFee: 55000,
    labFee: 8000,
    libraryFee: 4000,
    amenitiesFee: 4000,
    examFee: 4000,
    totalFee: 75000,
    paidAmount: 75000,
    dueBalance: 0,
    dueDate: 'September 15, 2025',
    status: 'Fully Paid'
  },
  {
    semester: 4,
    academicYear: '2024 - 2025 (Even)',
    tuitionFee: 52000,
    labFee: 7000,
    libraryFee: 3500,
    amenitiesFee: 3500,
    examFee: 4000,
    totalFee: 70000,
    paidAmount: 70000,
    dueBalance: 0,
    dueDate: 'January 20, 2025',
    status: 'Fully Paid'
  }
];

export const INITIAL_FEE_TRANSACTIONS: FeeTransaction[] = [
  {
    id: 'tx-001',
    receiptNumber: 'REC-2026-SEM6-A1',
    semester: 6,
    amount: 50000,
    paymentDate: 'July 14, 2026',
    paymentMode: 'Net Banking',
    transactionRef: 'NB-HDFC-992384102',
    status: 'Success'
  },
  {
    id: 'tx-002',
    receiptNumber: 'REC-2025-SEM5-F1',
    semester: 5,
    amount: 75000,
    paymentDate: 'August 22, 2025',
    paymentMode: 'UPI',
    transactionRef: 'UPI-23849103958',
    status: 'Success'
  },
  {
    id: 'tx-003',
    receiptNumber: 'REC-2025-SEM4-F1',
    semester: 4,
    amount: 70000,
    paymentDate: 'January 10, 2025',
    paymentMode: 'Debit Card',
    transactionRef: 'DC-SBIN-84729103',
    status: 'Success'
  }
];

export const INITIAL_PROJECT_TEAMS: ProjectTeam[] = [
  {
    id: 'team-01',
    title: 'AeroPulse: Autonomous Campus Drone Delivery & Navigation',
    clubName: 'Robotics & Automation Society',
    description: 'Building an autonomous quadcopter using ROS2, ArduPilot, and computer vision for rapid medical kit and urgent parcel delivery across campus quadrangles.',
    techStack: ['ROS2', 'C++', 'Python', 'OpenCV', 'YOLOv8', 'PX4 Autopilot'],
    leaderName: 'Likith E. (Roll 22CS084)',
    membersCount: 3,
    maxMembers: 5,
    openRoles: ['Embedded C++ Systems Engineer', 'Flight Control & PID Tuning Specialist'],
    isUserMember: true
  },
  {
    id: 'team-02',
    title: 'BlockVerify: Zero-Knowledge Academic Credential Registry',
    clubName: 'Blockchain & Web3 Guild',
    description: 'Verifiable credentials for transcripts and degree verification using zk-SNARKs and Ethereum Layer 2 to eliminate forged marksheets forever.',
    techStack: ['Solidity', 'Circom', 'Rust', 'Next.js', 'Ethers.js'],
    leaderName: 'Arjun Verma (Roll 22CS012)',
    membersCount: 4,
    maxMembers: 5,
    openRoles: ['Frontend TypeScript / Tailwind Dev'],
    isUserMember: false
  },
  {
    id: 'team-03',
    title: 'NeuroScreen: Low-Cost Early Retinopathy Detection Mobile App',
    clubName: 'AI & Data Science Club',
    description: 'Edge-AI model running on mobile smartphones to inspect fundus photography and assist rural primary healthcare workers.',
    techStack: ['PyTorch', 'TensorFlow Lite', 'React Native', 'FastAPI'],
    leaderName: 'Sneha Patel (Roll 22CS105)',
    membersCount: 2,
    maxMembers: 4,
    openRoles: ['PyTorch Model Quantization Specialist', 'Mobile App UI Developer'],
    isUserMember: false
  },
  {
    id: 'team-04',
    title: 'EcoGrid: Campus Smart Energy & HVAC IoT Optimizer',
    clubName: 'Green Tech & IoT Alliance',
    description: 'Real-time ESP32 power monitoring nodes installed in lecture halls with predictive shutoff when room occupancy drops to zero.',
    techStack: ['ESP32', 'MQTT', 'InfluxDB', 'Grafana', 'Go'],
    leaderName: 'Rohit Kulkarni (Roll 22EC042)',
    membersCount: 3,
    maxMembers: 4,
    openRoles: ['Firmware Developer (MicroPython/C)'],
    isUserMember: false
  }
];

export const INITIAL_FORUM_POSTS: ForumPost[] = [
  {
    id: 'post-01',
    authorName: 'Likith E.',
    authorRoll: '22CS084',
    title: 'Comprehensive Guide: Demystifying Raft Consensus Algorithm & Leader Election',
    content: 'For everyone working on CS601 Assignment 4: the trickiest part is handling split votes during leader election. Make sure to randomize your election timeout between 150ms and 300ms. If you observe two nodes continually resetting each other, verify that term comparison happens before accepting RequestVote RPCs! Here is the state machine diagram and GitHub template I put together.',
    tags: ['Algorithms', 'Distributed Systems', 'CS601', 'Assignment Help'],
    category: 'Projects',
    upvotes: 28,
    hasUpvoted: true,
    createdAt: 'Yesterday, 04:30 PM',
    resourceLink: 'https://github.com/likith/raft-consensus-simulator-template',
    replies: [
      {
        id: 'rep-01',
        authorName: 'Aditi Nair (22CS009)',
        content: 'This saved me hours of debugging! The randomized election timeout fixed the infinite split-vote deadlock in my test cases.',
        createdAt: 'Yesterday, 07:15 PM'
      },
      {
        id: 'rep-02',
        authorName: 'Prof. K. Ramesh (Faculty)',
        content: 'Commendable initiative, Likith. Students should also pay attention to log matching invariants described in Section 5.3 of the Ongaro paper.',
        createdAt: 'Today, 08:45 AM'
      }
    ]
  },
  {
    id: 'post-02',
    authorName: 'Kavya Rao',
    authorRoll: '22CS067',
    title: 'Google SDE-1 2026 Campus Drive: My Round 1 Experience & Common Questions',
    content: 'Just finished the technical assessment! Two coding problems: Problem 1 was standard Dijkstra on an airline routing grid with fuel limits. Problem 2 was dynamic programming with interval scheduling. Advice: Don’t overcomplicate early—code the clean O(N log N) solution first and run custom test cases with single-node graphs.',
    tags: ['Google', 'Placements', 'DSA', 'Interview Prep'],
    category: 'Placements',
    upvotes: 45,
    hasUpvoted: false,
    createdAt: '2 days ago',
    resourceLink: 'https://leetcode.com/discuss/interview-experience/google-campus-2026',
    replies: [
      {
        id: 'rep-03',
        authorName: 'Dr. Rajesh Sharma (Placement Head)',
        content: 'Great breakdown Kavya! The T&P cell is hosting mock round 2 slots tomorrow afternoon for all shortlisted candidates.',
        createdAt: '1 day ago'
      }
    ]
  },
  {
    id: 'post-03',
    authorName: 'Manoj Kumar',
    authorRoll: '22CS091',
    title: 'Curated Open Source Resource: Best Visualizers for Compiler Syntax Trees & LALR Parsers',
    content: 'Struggling with LR(1) and LALR(1) item sets in Dr. Sunita’s class? Here is an open-source visualizer that generates DFA state diagrams and action/goto tables directly from context-free grammar strings.',
    tags: ['Compiler Design', 'CS603', 'Study Resources'],
    category: 'Web Dev',
    upvotes: 19,
    hasUpvoted: false,
    createdAt: '3 days ago',
    resourceLink: 'https://cyberzhg.github.io/toolbox/grammar',
    replies: []
  }
];

export const AI_DOUBT_AGENTS: AiDoubtAgent[] = [
  {
    id: 'algo-bot',
    name: 'AlgoBot (DSA & Discrete Math)',
    specialty: 'Advanced Algorithms, Graphs, DP & Asymptotics',
    subject: 'Design & Analysis of Algorithms',
    avatarEmoji: '🧠',
    description: 'Expert in Big-O analysis, dynamic programming state transitions, shortest paths, and complex proofs.',
    recommendedPrompts: [
      'Explain difference between Dijkstra and Bellman-Ford algorithms with negative edges.',
      'How do I derive the time complexity of Strassen Matrix Multiplication using Master Theorem?',
      'Walk me through the 0/1 Knapsack problem with dynamic programming and space optimization.'
    ]
  },
  {
    id: 'db-expert',
    name: 'DataSense AI (Databases & Cloud)',
    specialty: 'Distributed Databases, Transactions & SQL Optimization',
    subject: 'Distributed Database Systems',
    avatarEmoji: '🗄️',
    description: 'Specialist in ACID guarantees, Two-Phase Commit (2PC), B-Tree vs LSM trees, and query optimization.',
    recommendedPrompts: [
      'Explain the CAP theorem and PACELC with real-world examples like Cassandra and CockroachDB.',
      'How does Multi-Version Concurrency Control (MVCC) prevent dirty reads without locking?',
      'Write a SQL query using window functions to calculate the 3-day moving average of student scores.'
    ]
  },
  {
    id: 'sys-master',
    name: 'SysMaster AI (OS & Networks)',
    specialty: 'Operating Systems, Concurrency & Protocols',
    subject: 'Computer Networks & OS',
    avatarEmoji: '⚙️',
    description: 'Master in mutexes, condition variables, TCP congestion window algorithms, and memory paging.',
    recommendedPrompts: [
      'Why does TCP slow start double the congestion window every RTT instead of linear increments?',
      'Explain how the Translation Lookaside Buffer (TLB) speeds up virtual address translation.',
      'How does the Banker algorithm detect and avoid deadlocks?'
    ]
  },
  {
    id: 'compiler-ai',
    name: 'ParserAI (Compiler Construction)',
    specialty: 'Lexical Analysis, LALR Parsers & Code Gen',
    subject: 'Compiler Design',
    avatarEmoji: '📐',
    description: 'Focuses on First & Follow sets, shift-reduce conflicts in Yacc/Bison, and three-address code.',
    recommendedPrompts: [
      'How to compute FIRST and FOLLOW sets for a left-recursive grammar?',
      'What causes a Shift-Reduce conflict in an LR(0) parsing table?',
      'Explain common subexpression elimination in basic blocks.'
    ]
  },
  {
    id: 'placement-ai',
    name: 'CareerPrep AI (Technical Interviews)',
    specialty: 'Coding Rounds, System Design & Behavioral STAR',
    subject: 'Placements & Technical Interviews',
    avatarEmoji: '💼',
    description: 'Trained on FAANG/Tier-1 campus interview patterns, system design scaling, and HR STAR stories.',
    recommendedPrompts: [
      'Design a scalable URL shortener like TinyURL handling 50,000 QPS with analytics.',
      'Review my STAR answer for: "Tell me about a time you had a technical disagreement with a team member."',
      'What are the most common Edge Cases to ask an interviewer before solving an Array problem?'
    ]
  }
];

// Aliases for unified imports
export const MOCK_STUDENT_USER = INITIAL_STUDENT_USER;
export const MOCK_FACULTY_USER = DEMO_FACULTY_USER;
export const MOCK_HOD_USER = DEMO_HOD_USER;
export const MOCK_ADMIN_USER = DEMO_ADMIN_USER;
export const MOCK_COORDINATOR_USER = DEMO_COORDINATOR_USER;
export const INITIAL_ATTENDANCE_RECORDS = INITIAL_SUBJECT_ATTENDANCE;

export const INITIAL_CLUBS: CampusClub[] = [
  {
    id: 'club-gdsc',
    name: 'Google Developer Student Club (GDSC)',
    category: 'Software & Cloud',
    badgeEmoji: '⚡',
    description: 'Premier university developer chapter focused on modern cloud architectures, Android, and Gemini generative AI applications.',
    membersCount: 184,
    facultyCoordinator: 'Dr. Priya Swaminathan (CS Dept)',
    upcomingActivity: 'Cloud Architecture Hands-on Sprint - Sep 25th',
    isJoined: true
  },
  {
    id: 'club-robotics',
    name: 'Autonomous Robotics & Systems Guild',
    category: 'Hardware & AI',
    badgeEmoji: '🤖',
    description: 'Hardware prototyping, ROS2 autonomous navigation, drone telemetry, and competitive international robowars team.',
    membersCount: 92,
    facultyCoordinator: 'Prof. K. Ramesh (ECE/CS)',
    upcomingActivity: 'PX4 Quadcopter Autonomous Flight Trials - Sep 28th',
    isJoined: false
  },
  {
    id: 'club-cybersec',
    name: 'Ethical Hacking & Cybersecurity Syndicate',
    category: 'Infosec & Defense',
    badgeEmoji: '🛡️',
    description: 'Capture The Flag (CTF) training, vulnerability disclosure, binary exploitation, and zero-day defense protocols.',
    membersCount: 110,
    facultyCoordinator: 'Prof. Vikram Mehta (Networks Lab)',
    upcomingActivity: 'Inter-College Live Attack & Defense CTF - Oct 3rd',
    isJoined: true
  },
  {
    id: 'club-cp',
    name: 'Competitive Programming & Algorithms Chapter',
    category: 'Algorithms & ICPC',
    badgeEmoji: '🏆',
    description: 'Intensive problem-solving sessions in Graph theory, DP, and segment trees for ICPC and Global Coding Olympiads.',
    membersCount: 145,
    facultyCoordinator: 'Dr. Sunita Rao (Theory Group)',
    upcomingActivity: 'Weekly 2-Hour LeetCode Speed contest - Every Friday 7 PM',
    isJoined: false
  }
];

export const INITIAL_IDEAS: ProjectIdeaPost[] = [
  {
    id: 'idea-01',
    authorName: 'Likith E.',
    authorRoll: '22CS084',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    title: 'Distributed Real-Time Raft Consensus Simulator with Failure Injection',
    description: 'Building an interactive multi-node visualization tool demonstrating split-vote leader election, log replication invariants, and dynamic cluster membership changes.',
    tags: ['Distributed Systems', 'Go', 'React', 'WebSocket'],
    rolesNeeded: ['Frontend Canvas Architect', 'Go Network Protocols Engineer'],
    upvotes: 34,
    hasUpvoted: true,
    commentsCount: 6,
    createdAt: 'Yesterday'
  },
  {
    id: 'idea-02',
    authorName: 'Aarav Patel',
    authorRoll: '22CS019',
    authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    title: 'Smart Campus Multimodal Navigation & Crowdsourced Transit Tracker',
    description: 'Real-time GPS tracking for campus shuttle buses with pedestrian AR pathfinding inside university multi-floor buildings using Bluetooth beacons.',
    tags: ['Flutter', 'OpenStreetMap', 'FastAPI', 'BLE'],
    rolesNeeded: ['Flutter Mobile Dev', 'Backend Microservices Engineer'],
    upvotes: 27,
    hasUpvoted: false,
    commentsCount: 4,
    createdAt: '2 days ago'
  },
  {
    id: 'idea-03',
    authorName: 'Sneha Kulkarni',
    authorRoll: '22EC055',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    title: 'Smart Campus HVAC & Energy Optimization using ESP32 & Deep RL',
    description: 'Hardware sensors deployed across 20 classrooms to throttle AC compressors and lighting based on real-time acoustic & thermal occupancy estimations.',
    tags: ['IoT', 'Reinforcement Learning', 'ESP32', 'TimescaleDB'],
    rolesNeeded: ['Embedded Firmware Engineer', 'PyTorch RL Researcher'],
    upvotes: 42,
    hasUpvoted: false,
    commentsCount: 9,
    createdAt: '3 days ago'
  }
];

