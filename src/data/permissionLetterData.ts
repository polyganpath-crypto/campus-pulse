import { PermissionRequest } from '../types';

export const INITIAL_PERMISSION_REQUESTS: PermissionRequest[] = [
  {
    requestId: 'REQ-2026-PL-101',
    studentId: 'std-2026-084',
    studentName: 'Likith E.',
    rollNumber: '22CS084',
    department: 'Computer Science & Engineering',
    year: '3rd Year (VI Semester)',
    section: 'Section A',
    recipient: 'both',
    date: '2026-09-20',
    subject: 'Permission to Attend National Smart India Hackathon Grand Finale',
    reason:
      'Shortlisted as Team Leader representing Apex University in the National Smart India Hackathon Grand Finale at IIT Bombay. The team will compete in the AI & Distributed Systems track for 36 hours continuous problem-solving.',
    startDate: '2026-10-10',
    endDate: '2026-10-14',
    additionalInformation:
      'Official invitation letter from the Ministry of Education Innovation Cell and train travel tickets have been verified with the department office.',
    letterContent: `Date: 2026-09-20

To,
Class Mentor & Head of Department
Department of Computer Science & Engineering
Apex University

Subject: Permission to Attend National Smart India Hackathon Grand Finale

Respected Sir/Madam,

I am Likith E., Roll No. 22CS084, studying 3rd Year (VI Semester), Computer Science & Engineering, Section Section A.

I kindly request permission regarding participation as Team Leader in the National Smart India Hackathon Grand Finale at IIT Bombay in the AI & Distributed Systems problem track.

I require permission from 2026-10-10 to 2026-10-14.

Official invitation letter from the Ministry of Education Innovation Cell and travel itineraries have been verified. I will coordinate with course faculty to submit any lab records prior to departure and catch up on all missed lecture topics immediately upon return.

I request you to kindly consider my request and grant me permission.

Thank you.

Yours sincerely,
Likith E.
Roll No: 22CS084
Computer Science & Engineering / Section A`,
    status: 'approved',
    mentorRemark:
      'Verified national hackathon selection credentials. Lab assignments completed in advance. Strongly recommended for on-duty clearance.',
    hodRemark:
      'Approved with official university on-duty attendance credit. Best wishes to the team representing our institution at IIT Bombay.',
    approvalHistory: [
      {
        id: 'hist-101-1',
        requestId: 'REQ-2026-PL-101',
        approverId: 'std-2026-084',
        approverName: 'Likith E.',
        approverRole: 'student',
        action: 'submitted',
        remark: 'Initial permission request submitted with national selection proof.',
        timestamp: '2026-09-20 09:30 AM'
      },
      {
        id: 'hist-101-2',
        requestId: 'REQ-2026-PL-101',
        approverId: 'fac-cs-304',
        approverName: 'Dr. Priya Swaminathan',
        approverRole: 'mentor',
        action: 'mentor_approved',
        remark:
          'Verified national hackathon selection credentials. Lab assignments completed in advance. Strongly recommended for on-duty clearance.',
        timestamp: '2026-09-20 02:15 PM'
      },
      {
        id: 'hist-101-3',
        requestId: 'REQ-2026-PL-101',
        approverId: 'hod-cs-101',
        approverName: 'Dr. K. V. Ramanathan',
        approverRole: 'hod',
        action: 'hod_approved',
        remark:
          'Approved with official university on-duty attendance credit. Best wishes to the team representing our institution at IIT Bombay.',
        timestamp: '2026-09-21 11:00 AM'
      }
    ],
    createdAt: '2026-09-20T09:30:00.000Z',
    updatedAt: '2026-09-21T11:00:00.000Z'
  },
  {
    requestId: 'REQ-2026-PL-102',
    studentId: 'std-2026-084',
    studentName: 'Likith E.',
    rollNumber: '22CS084',
    department: 'Computer Science & Engineering',
    year: '3rd Year (VI Semester)',
    section: 'Section A',
    recipient: 'both',
    date: '2026-10-02',
    subject: 'Leave for Paper Presentation at IEEE International Conference',
    reason:
      'Research paper titled "Distributed Raft Consensus with Zero-Knowledge Proofs" has been accepted for oral presentation at the 12th IEEE International Conference on Advanced Computing & Cloud Architectures (ICACCA 2026).',
    startDate: '2026-10-22',
    endDate: '2026-10-24',
    additionalInformation:
      'Registration receipt and IEEE acceptance notification attached. Co-authored under Department Research Group.',
    letterContent: `Date: 2026-10-02

To,
Class Mentor & Head of Department
Department of Computer Science & Engineering
Apex University

Subject: Leave for Paper Presentation at IEEE International Conference

Respected Sir/Madam,

I am Likith E., Roll No. 22CS084, studying 3rd Year (VI Semester), Computer Science & Engineering, Section Section A.

I kindly request permission regarding presenting our research paper "Distributed Raft Consensus with Zero-Knowledge Proofs" accepted for oral podium presentation at the 12th IEEE International Conference on Advanced Computing (ICACCA 2026).

I require permission from 2026-10-22 to 2026-10-24.

Registration receipt and IEEE acceptance notification have been verified. I will present my work on 23rd October and return on 24th October.

I request you to kindly consider my request and grant me permission.

Thank you.

Yours sincerely,
Likith E.
Roll No: 22CS084
Computer Science & Engineering / Section A`,
    status: 'pending_hod',
    mentorRemark:
      'Paper acceptance confirmed in IEEE Conference Xplore track. Mentor approval granted; forwarded to HOD for final institutional clearance.',
    approvalHistory: [
      {
        id: 'hist-102-1',
        requestId: 'REQ-2026-PL-102',
        approverId: 'std-2026-084',
        approverName: 'Likith E.',
        approverRole: 'student',
        action: 'submitted',
        remark: 'Submitted with IEEE acceptance letter.',
        timestamp: '2026-10-02 10:15 AM'
      },
      {
        id: 'hist-102-2',
        requestId: 'REQ-2026-PL-102',
        approverId: 'fac-cs-304',
        approverName: 'Dr. Priya Swaminathan',
        approverRole: 'mentor',
        action: 'mentor_approved',
        remark:
          'Paper acceptance confirmed in IEEE Conference Xplore track. Mentor approval granted; forwarded to HOD for final institutional clearance.',
        timestamp: '2026-10-02 04:30 PM'
      }
    ],
    createdAt: '2026-10-02T10:15:00.000Z',
    updatedAt: '2026-10-02T16:30:00.000Z'
  },
  {
    requestId: 'REQ-2026-PL-103',
    studentId: 'std-2026-019',
    studentName: 'Aarav Patel',
    rollNumber: '22CS019',
    department: 'Computer Science & Engineering',
    year: '3rd Year (VI Semester)',
    section: 'Section A',
    recipient: 'mentor',
    date: '2026-10-03',
    subject: 'Permission for After-Hours High-Performance Computing Lab Access',
    reason:
      'Required access to Lab LH-302 GPU workstation servers from 6:00 PM to 9:30 PM to run fine-tuning benchmarks for our capstone model.',
    startDate: '2026-10-04',
    endDate: '2026-10-06',
    additionalInformation:
      'Lab assistant Mr. Venkat has agreed to supervise the physical server rack security during this duration.',
    letterContent: `Date: 2026-10-03

To,
Class Mentor
Department of Computer Science & Engineering
Apex University

Subject: Permission for After-Hours High-Performance Computing Lab Access

Respected Sir/Madam,

I am Aarav Patel, Roll No. 22CS019, studying 3rd Year (VI Semester), Computer Science & Engineering, Section Section A.

I kindly request permission regarding after-hours access to Lab LH-302 GPU workstations between 6:00 PM and 9:30 PM for branch capstone benchmarks.

I require permission from 2026-10-04 to 2026-10-06.

Lab assistant supervision is arranged. We will ensure all equipment is powered down safely each night.

I request you to kindly consider my request and grant me permission.

Thank you.

Yours sincerely,
Aarav Patel
Roll No: 22CS019
Computer Science & Engineering / Section A`,
    status: 'pending_mentor',
    approvalHistory: [
      {
        id: 'hist-103-1',
        requestId: 'REQ-2026-PL-103',
        approverId: 'std-2026-019',
        approverName: 'Aarav Patel',
        approverRole: 'student',
        action: 'submitted',
        remark: 'Request submitted for mentor review.',
        timestamp: '2026-10-03 01:20 PM'
      }
    ],
    createdAt: '2026-10-03T13:20:00.000Z',
    updatedAt: '2026-10-03T13:20:00.000Z'
  },
  {
    requestId: 'REQ-2026-PL-104',
    studentId: 'std-2026-031',
    studentName: 'Tanya Sengupta',
    rollNumber: '22CS031',
    department: 'Computer Science & Engineering',
    year: '3rd Year (VI Semester)',
    section: 'Section A',
    recipient: 'mentor',
    date: '2026-09-24',
    subject: 'Exemption for Industrial Plant Visit',
    reason:
      'Requesting leave of absence to attend external corporate immersion visit at software technology park.',
    startDate: '2026-09-28',
    endDate: '2026-09-29',
    additionalInformation:
      'Private personal registration with tech meetup club.',
    letterContent: `Date: 2026-09-24

To,
Class Mentor
Department of Computer Science & Engineering
Apex University

Subject: Exemption for Industrial Plant Visit

Respected Sir/Madam,

I am Tanya Sengupta, Roll No. 22CS031, studying 3rd Year (VI Semester), Computer Science & Engineering, Section Section A.

I kindly request permission regarding exemption for attending an external tech company immersion visit.

I require permission from 2026-09-28 to 2026-09-29.

I request you to kindly consider my request and grant me permission.

Thank you.

Yours sincerely,
Tanya Sengupta
Roll No: 22CS031
Computer Science & Engineering / Section A`,
    status: 'rejected',
    mentorRemark:
      'Internal Midterm Examination clash on September 28th. University policy does not allow non-academic exemptions during scheduled examination sessions.',
    approvalHistory: [
      {
        id: 'hist-104-1',
        requestId: 'REQ-2026-PL-104',
        approverId: 'std-2026-031',
        approverName: 'Tanya Sengupta',
        approverRole: 'student',
        action: 'submitted',
        remark: 'Submitted request.',
        timestamp: '2026-09-24 11:00 AM'
      },
      {
        id: 'hist-104-2',
        requestId: 'REQ-2026-PL-104',
        approverId: 'fac-cs-304',
        approverName: 'Dr. Priya Swaminathan',
        approverRole: 'mentor',
        action: 'mentor_rejected',
        remark:
          'Internal Midterm Examination clash on September 28th. University policy does not allow non-academic exemptions during scheduled examination sessions.',
        timestamp: '2026-09-24 03:45 PM'
      }
    ],
    createdAt: '2026-09-24T11:00:00.000Z',
    updatedAt: '2026-09-24T15:45:00.000Z'
  }
];

// Quick permission reason presets to enable 1-2 minute completion for students!
export const QUICK_PERMISSION_PRESETS = [
  {
    label: '🏆 Hackathon / Coding Competition',
    subject: 'Permission to Participate in National Hackathon / Coding Duel',
    reason:
      'Selected to represent the college in an inter-university 36-hour hackathon competition. Will build project and pitch to industry judges.',
    daysCount: 3,
    recipient: 'both' as const
  },
  {
    label: '📄 Research Paper Presentation',
    subject: 'Permission to Present Technical Research Paper at Conference',
    reason:
      'Our research paper has been peer-reviewed and accepted for oral podium presentation at an accredited IEEE/Springer international conference.',
    daysCount: 3,
    recipient: 'both' as const
  },
  {
    label: '🏥 Medical Leave / Health Recovery',
    subject: 'Permission for Medical Leave & Health Recovery',
    reason:
      'Suffering from acute fever / medical indisposition and advised complete rest by medical practitioner. Doctor certificate attached.',
    daysCount: 2,
    recipient: 'mentor' as const
  },
  {
    label: '💼 Placement Drive / Interview',
    subject: 'On-Duty Permission for Placement Technical Interview',
    reason:
      'Shortlisted for in-person campus recruitment technical rounds and bar-raiser assessment by university placement cell.',
    daysCount: 1,
    recipient: 'mentor' as const
  },
  {
    label: '🔬 After-Hours Lab / Server Access',
    subject: 'Permission for Extended Lab & High-Compute Workstation Access',
    reason:
      'Need after-hours access to department computing facility to train capstone AI models and run cluster load-testing benchmarks.',
    daysCount: 2,
    recipient: 'mentor' as const
  },
  {
    label: '🏠 Urgent Family Emergency',
    subject: 'Permission for Urgent Family Leave of Absence',
    reason:
      'Unavoidable urgent family matter requiring travel to home town. Will catch up on missed coursework immediately upon return.',
    daysCount: 3,
    recipient: 'mentor' as const
  }
];
