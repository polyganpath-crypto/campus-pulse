export type UserRole = 'student' | 'faculty' | 'coordinator' | 'admin';

export interface UserProfile {
  id: string;
  uid?: string;
  name: string;
  email: string;
  role: UserRole;
  rollNumber?: string;
  department: string;
  semester?: number;
  batch?: string;
  avatarUrl?: string;
  cgpa?: number;
  contactNumber?: string;
  designation?: string; // For faculty/coordinator
  cabinLocation?: string;
  year?: string;
  section?: string;
  facultyType?: 'mentor' | 'hod' | 'faculty';
  assignedClass?: string;
  createdAt?: string;
}

export interface SubjectAttendance {
  id: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  isLab: boolean;
  credits: number;
  recentRecords: {
    date: string;
    status: 'present' | 'absent' | 'on_duty';
    topic: string;
  }[];
}

export interface ExamSubjectResult {
  code: string;
  name: string;
  credits: number;
  internalMarks: number;
  maxInternal: number;
  externalMarks: number;
  maxExternal: number;
  totalMarks: number;
  maxTotal: number;
  grade: string;
  gradePoint: number;
  status: 'Pass' | 'Fail' | 'Re-eval Pending';
}

export interface SemesterResult {
  semesterNumber: number;
  academicYear: string;
  sgpa: number;
  cgpa: number;
  totalCredits: number;
  earnedCredits: number;
  declarationDate: string;
  subjects: ExamSubjectResult[];
}

export interface CampusEvent {
  id: string;
  title: string;
  category: 'Symposium' | 'Hackathon' | 'Cultural' | 'Workshop' | 'Placement Drive' | 'Sports';
  description: string;
  date: string;
  time: string;
  venue: string;
  organizer: string;
  isCampusWide: boolean;
  isUrgent: boolean;
  registeredCount: number;
  userRegistered: boolean;
  registrationDeadline?: string;
}

export interface AcademicDeadline {
  id: string;
  title: string;
  subjectOrArea: string;
  dueDate: string; // ISO or date string
  dueTime: string;
  category: 'Assignment' | 'Exam' | 'Fee Payment' | 'Documentation' | 'Placement Drive' | 'Project Milestones';
  status: 'pending' | 'submitted' | 'completed';
  urgency: 'critical' | 'moderate' | 'upcoming';
  actionUrlTab?: string;
}

export interface CalendarScheduleItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  type: 'class' | 'deadline' | 'exam' | 'study' | 'club';
  location?: string;
  subject?: string;
  description?: string;
  isPersonalStudy?: boolean;
}

export interface CollegeDocument {
  id: string;
  name: string;
  category: 'Admission' | 'Academic' | 'Verification' | 'Scholarship' | 'Placement';
  description: string;
  mandatoryFor: string;
  copiesRequired: string;
  status: 'Verified' | 'Submitted' | 'Pending' | 'Ready for Collection';
  submissionDeadline?: string;
  departmentCounter: string;
  fileHint: string;
}

export interface DocumentAppointment {
  id: string;
  studentId: string;
  documentName: string;
  counter: string;
  date: string;
  timeSlot: string;
  tokenNumber: string;
  status: 'Confirmed' | 'Completed' | 'Rescheduled';
  reminderEnabled: boolean;
  reminderNote: string;
}

export interface PlacementTopic {
  id: string;
  category: 'Data Structures' | 'System Design' | 'Algorithms' | 'DBMS & SQL' | 'Core CS' | 'HR & Behavioral';
  title: string;
  description: string;
  importance: 'High' | 'Very High' | 'Medium';
  masteryPercentage: number;
  totalQuestions: number;
  solvedQuestions: number;
  keyInterviewTips: string[];
}

export interface CompanyDrive {
  id: string;
  companyName: string;
  role: string;
  ctcPackage: string;
  eligibilityCgpa: number;
  deadline: string;
  rounds: string[];
  location: string;
  isApplied: boolean;
  userEligible: boolean;
}

export interface PlacementChatMessage {
  id: string;
  sender: 'student' | 'coordinator';
  text: string;
  timestamp: string;
  attachmentName?: string;
}

export interface FacultyMember {
  id: string;
  name: string;
  subject: string;
  department: string;
  cabin: string;
  email: string;
  officeHours: string;
  isOnline: boolean;
  avatarUrl: string;
}

export interface FacultyChatMessage {
  id: string;
  facultyId: string;
  sender: 'student' | 'faculty';
  text: string;
  timestamp: string;
  doubtSubject?: string;
  codeSnippet?: string;
}

export interface SemesterFeeItem {
  semester: number;
  academicYear: string;
  tuitionFee: number;
  labFee: number;
  libraryFee: number;
  amenitiesFee: number;
  examFee: number;
  totalFee: number;
  paidAmount: number;
  dueBalance: number;
  dueDate: string;
  status: 'Fully Paid' | 'Partial' | 'Overdue' | 'Due Soon';
}

export interface FeeTransaction {
  id: string;
  receiptNumber: string;
  semester: number;
  amount: number;
  paymentDate: string;
  paymentMode: 'Net Banking' | 'UPI' | 'Debit Card' | 'Credit Card';
  transactionRef: string;
  status: 'Success';
}

export interface ProjectTeam {
  id: string;
  title: string;
  clubName: string;
  description: string;
  techStack: string[];
  leaderName: string;
  membersCount: number;
  maxMembers: number;
  openRoles: string[];
  isUserMember: boolean;
}

export interface ForumPost {
  id: string;
  authorName: string;
  authorRoll: string;
  title: string;
  content: string;
  tags: string[];
  category: 'Web Dev' | 'AI & ML' | 'Competitive Coding' | 'Placements' | 'Projects';
  upvotes: number;
  hasUpvoted: boolean;
  createdAt: string;
  replies: {
    id: string;
    authorName: string;
    content: string;
    createdAt: string;
  }[];
  resourceLink?: string;
}

export interface AiDoubtAgent {
  id: string;
  name: string;
  specialty: string;
  subject: string;
  avatarEmoji: string;
  description: string;
  recommendedPrompts: string[];
}

export interface CampusClub {
  id: string;
  name: string;
  category: string;
  badgeEmoji: string;
  description: string;
  membersCount: number;
  facultyCoordinator: string;
  upcomingActivity: string;
  isJoined: boolean;
}

export interface ProjectIdeaPost {
  id: string;
  authorName: string;
  authorRoll: string;
  authorAvatar: string;
  title: string;
  description: string;
  tags: string[];
  rolesNeeded: string[];
  upvotes: number;
  hasUpvoted: boolean;
  commentsCount: number;
  createdAt: string;
}

export interface DiscussionReply {
  id: string;
  authorName: string;
  authorRoll: string;
  authorBadge: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  upvotes: number;
  hasUpvoted?: boolean;
}

export interface StudentDiscussionPost {
  id: string;
  authorName: string;
  authorRoll: string;
  authorBadge: string;
  authorAvatar: string;
  category: 'market-projects' | 'topics-to-cover' | 'internship-guide' | 'resume-vetting';
  title: string;
  content: string;
  tags: string[];
  upvotes: number;
  hasUpvoted: boolean;
  bookmarked: boolean;
  replies: DiscussionReply[];
  createdAt: string;
  isPinned?: boolean;
}

export interface MarketProjectGuide {
  id: string;
  title: string;
  roleTarget: string; // e.g. "Backend SDE Intern", "Fullstack Engineer", "AI/ML Intern"
  hiringRating: number; // e.g. 9.8 / 10
  whyRecruitersLoveIt: string;
  bannedClichésToAvoid: string; // e.g. "Avoid basic clone without real concurrency or auth"
  architectureCore: string[];
  suggestedTechStack: string[];
  keyResumeBullets: string[];
  targetCompanies: string[];
}

export interface TopicRequirementSection {
  id: string;
  category: string;
  importance: 'Essential' | 'High-Yield' | 'Differentiator';
  estimatedPrepTime: string;
  description: string;
  topics: {
    name: string;
    description: string;
    askedBy: string[]; // e.g. ["Amazon", "Google", "Goldman Sachs"]
    proficiencyRequired: 'Conceptual' | 'Hands-on Coding' | 'System Scale';
  }[];
}

export interface GroupPoll {
  id: string;
  question: string;
  totalVotes: number;
  userVotedOptionId?: string;
  options: {
    id: string;
    label: string;
    votes: number;
  }[];
}

export type EngineeringBranchId =
  | 'ALL'
  | 'CSE_IT'
  | 'AIML_DS'
  | 'ECE_EMBEDDED'
  | 'EEE_SMART'
  | 'MECH_ROBOTICS'
  | 'CIVIL_GIS';

export interface BranchProjectItem {
  id: string;
  branch: EngineeringBranchId;
  branchLabel: string;
  title: string;
  roleTarget: string;
  packageTier: string; // e.g. "Tier-1 Product (₹24 - ₹48 LPA)"
  industryImportanceScore: number; // e.g. 9.9
  summary: string;
  industrySignificance: string; // Detailed: Why it's very important in the software industry
  whyCompaniesHireThis: string; // What recruiters & hiring managers look for
  coreBranchConcepts: string[]; // Branch fundamentals applied
  techStack: string[];
  architectureModules: string[];
  keyResumeBullets: string[];
  milestones: {
    step: number;
    title: string;
    description: string;
    deliverable: string;
  }[];
  interviewQuestions: {
    question: string;
    answerKey: string;
  }[];
  targetCompanies: string[];
  activePeersCount: number;
  sampleGithubRepo: string;
}

export interface ProjectSquadMessage {
  id: string;
  projectId: string;
  authorName: string;
  authorBranch: string;
  authorAvatar: string;
  timestamp: string;
  message: string;
  likes: number;
  hasLiked?: boolean;
}

export interface UserSelectedProject {
  projectId: string;
  selectedAt: string;
  currentMilestoneStep: number;
  completedMilestones: number[];
  repoUrl?: string;
  liveDemoUrl?: string;
  personalNotes?: string;
}

export type PresentationTheme =
  | 'academic-indigo'
  | 'university-navy'
  | 'emerald-minimal'
  | 'cyber-dark'
  | 'sunset-coral';

export type SlideLayout =
  | 'title'
  | 'bullets'
  | 'two-column'
  | 'code-architecture'
  | 'image-text'
  | 'conclusion';

export interface SlideMistake {
  id: string;
  originalText: string;
  suggestedText: string;
  reason: string;
  field: 'title' | 'subtitle' | 'bullets' | 'speakerNotes';
  bulletIndex?: number;
}

export interface PresentationSlide {
  id: string;
  layout: SlideLayout;
  title: string;
  subtitle?: string;
  bullets: string[];
  columnLeftTitle?: string;
  columnLeft?: string[];
  columnRightTitle?: string;
  columnRight?: string[];
  codeSnippet?: string;
  codeLanguage?: string;
  imageUrl?: string;
  speakerNotes: string;
  mistakes?: SlideMistake[];
}

export interface PresentationDeck {
  id: string;
  title: string;
  subject: string;
  authorName: string;
  authorRoll: string;
  theme: PresentationTheme;
  examType: 'Project Viva' | 'Technical Seminar' | 'Lab Exam Viva' | 'Midterm Presentation';
  slides: PresentationSlide[];
  lastEdited: string;
}

export interface PdfAnnotation {
  id: string;
  type: 'whiteout' | 'text' | 'highlight' | 'correction-stamp';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color?: string;
}

export interface PdfPageItem {
  id: string;
  pageNumber: number;
  name: string;
  imageUrl: string;
  rotation: number; // 0, 90, 180, 270
  annotations: PdfAnnotation[];
  note?: string;
  hasMistakeRectified?: boolean;
}

export type TabKey =
  | 'dashboard'
  | 'attendance'
  | 'results'
  | 'faculty-chat'
  | 'calendar'
  | 'documentation'
  | 'permission-letter'
  | 'exam-seating'
  | 'campus-navigation'
  | 'lost-found'
  | 'student-queries';

export interface ExamHall {
  hallId: string;
  building: string;
  floor: string;
  roomNumber: string;
  totalSeats: number;
  rowsCount: number;
  colsCount: number;
  inChargeFaculty?: string;
}

export interface Examination {
  examId: string;
  subjectCode: string;
  subject: string;
  department: string;
  semester: number;
  examDate: string; // YYYY-MM-DD
  startTime: string; // e.g. "10:00 AM"
  endTime: string; // e.g. "01:00 PM"
  reportingTime: string; // e.g. "09:30 AM"
  status: 'scheduled' | 'ongoing' | 'completed' | 'published';
  isPublished: boolean;
  totalCandidates: number;
  assignedHalls: string[];
}

export interface SeatingAssignment {
  assignmentId: string;
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
  assignedAt: string;
  status: 'allocated' | 'verified' | 'absent';
}

export interface ExamSeatingNotification {
  notificationId: string;
  studentId: string;
  rollNumber: string;
  examId: string;
  subject: string;
  examDate: string;
  startTime: string;
  reportingTime: string;
  hallInfo: string;
  rowNumber: string | number;
  seatNumber: string | number;
  scheduledTime: string;
  sentTime?: string;
  status: 'scheduled' | 'delivered' | 'read' | 'dismissed';
  isUrgent30MinAlert: boolean;
}

export type PermissionRecipient = 'mentor' | 'hod' | 'both';

export type PermissionRequestStatus =
  | 'draft'
  | 'pending_mentor'
  | 'mentor_approved'
  | 'pending_hod'
  | 'approved'
  | 'rejected';

export interface ApprovalHistoryItem {
  id: string;
  requestId: string;
  approverId: string;
  approverName: string;
  approverRole: 'student' | 'mentor' | 'hod';
  action:
    | 'submitted'
    | 'saved_draft'
    | 'mentor_approved'
    | 'mentor_rejected'
    | 'hod_approved'
    | 'hod_rejected';
  remark?: string;
  timestamp: string;
}

export interface PermissionRequest {
  id?: string;
  requestId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  department: string;
  year: string;
  section: string;
  recipient: PermissionRecipient;
  date: string;
  subject: string;
  reason: string;
  destination?: string;
  fromDate?: string;
  toDate?: string;
  startDate: string;
  endDate: string;
  additionalInformation?: string;
  letterContent: string;
  status: PermissionRequestStatus;
  mentorRemark?: string;
  hodRemark?: string;
  approvalHistory: ApprovalHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentDueRecord {
  dueId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  department: string;
  section: string;
  dueType: 'Tuition Fee' | 'Library Fine' | 'Lab Clearance' | 'Hostel / Mess' | 'Attendance Shortage';
  amountDue: number;
  dueDate: string;
  status: 'pending' | 'cleared' | 'waived';
  hallTicketEligible: boolean;
  remarks?: string;
  lastNoticeSentAt?: string;
}

export interface AdminNoticeLog {
  id: string;
  recipientRoll: string;
  recipientName: string;
  noticeType: 'seating_arrangement' | 'due_issue' | 'clearance_alert';
  subject: string;
  details: string;
  sentAt: string;
  status: 'delivered' | 'read';
}

// -------------------------------------------------------------
// CAMPUS NAVIGATION & SMART ANNOUNCEMENTS TYPES
// -------------------------------------------------------------

export type CampusLocationCategory =
  | 'Academic Block'
  | 'Classroom'
  | 'Laboratory'
  | 'Department Office'
  | 'HOD Office'
  | 'Faculty Room'
  | 'Library'
  | 'Examination Cell'
  | 'Seminar Hall'
  | 'Auditorium'
  | 'Canteen'
  | 'Hostel'
  | 'Parking'
  | 'Main Gate'
  | 'Medical Room'
  | 'Placement Cell'
  | 'Administrative Office'
  | 'Sports Ground';

export interface CampusLocation {
  id: string;
  name: string;
  normalizedName?: string;
  institutionName?: string;
  buildingName?: string;
  departmentName?: string;
  category: CampusLocationCategory;
  building?: string; // backwards compatibility
  floor?: string;
  roomNumber?: string;
  description: string;
  address?: string;
  landmarks?: string;
  latitude?: number;
  longitude?: number;
  coordinates?: { x: number; y: number; lat?: number; lng?: number }; // backwards compatibility for 2d grid + lat/lng
  coordinatesVerified?: boolean;
  verificationSource?: string;
  navigationEnabled?: boolean;
  searchKeywords?: string[];
  timings?: string;
  inCharge?: string;
  contactNumber?: string;
  isPopular?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CampusLocationReport {
  id: string;
  locationId?: string;
  locationName: string;
  suggestedName?: string;
  suggestedLatitude?: number;
  suggestedLongitude?: number;
  suggestedCategory?: string;
  issueDescription: string;
  reporterUserId?: string;
  reporterName?: string;
  reporterEmail?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'rejected';
  adminNotes?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export type CampusAnnouncementCategory =
  | 'General'
  | 'Academic'
  | 'Examination'
  | 'Events'
  | 'Placements'
  | 'Department'
  | 'Emergency'
  | 'Important Alerts';

export type CampusAnnouncementPriority = 'normal' | 'important' | 'urgent';

export interface CampusAnnouncement {
  id: string;
  title: string;
  description: string;
  category: CampusAnnouncementCategory;
  priority: CampusAnnouncementPriority;
  authorId?: string;
  authorName?: string;
  expiresAt?: string;
  department: string;
  authority: string;
  createdAt: string;
  expiryDate?: string;
  targetDepartment?: string;
  targetYear?: string;
  attachmentUrl?: string;
  attachmentLabel?: string;
  isRead?: boolean;
}

export interface CampusNavEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  locationId?: string;
  organizer: string;
  category: 'Academic' | 'Cultural' | 'Technical' | 'Sports' | 'Clubs' | 'Placement';
  registrationDeadline?: string;
  registrationUrl?: string;
  registrationStatus: 'open' | 'closing_soon' | 'closed' | 'registered';
  registeredCount: number;
}

export interface CampusAlertNotification {
  id: string;
  title: string;
  message: string;
  type: 'exam_change' | 'room_change' | 'emergency' | 'closure' | 'deadline' | 'placement' | 'event_reminder';
  isRead: boolean;
  createdAt: string;
  targetDepartment?: string;
  actionUrlTab?: string;
  actionLocationId?: string;
}

// -------------------------------------------------------------
// LOST & FOUND TYPES
// -------------------------------------------------------------

export type LostFoundItemType = 'lost' | 'found';

export type LostFoundCategory =
  | 'ID Card'
  | 'Mobile Phone'
  | 'Laptop'
  | 'Wallet'
  | 'Keys'
  | 'Books'
  | 'Bag'
  | 'Earphones'
  | 'Documents'
  | 'Water Bottle'
  | 'Calculator'
  | 'Other';

export type LostFoundStatus = 'open' | 'claimed' | 'returned';
export type LostFoundClaimStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface LostFoundClaimRequest {
  id: string;
  itemId: string;
  claimantName: string;
  claimantRollNumber: string;
  claimantContact: string;
  verificationDetails: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface LostFoundItem {
  id: string;
  itemName: string;
  title?: string;
  type: LostFoundItemType;
  category: LostFoundCategory;
  description: string;
  imageUrl?: string;
  location: string;
  date: string;
  time: string;
  reportedBy: string;
  studentId: string;
  userId?: string;
  userName?: string;
  contactPreference: string;
  status: LostFoundStatus;
  claimStatus: LostFoundClaimStatus;
  currentKeeperLocation?: string; // where the item is kept e.g. "Main Security Desk Gate 1"
  additionalDetails?: string;
  claimRequests?: LostFoundClaimRequest[];
  possibleMatchIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  isRead?: boolean;
  createdAt: string;
  actionUrlTab?: string;
}

// ============================================================================
// STUDENT QUERY PORTAL DATA MODEL
// ============================================================================

export type QueryCategory =
  | 'Academics'
  | 'Examinations'
  | 'Attendance'
  | 'Fees and Payments'
  | 'Scholarships'
  | 'Certificates and Documents'
  | 'Library'
  | 'Hostel'
  | 'Transportation'
  | 'College Facilities'
  | 'Technical Support'
  | 'General Query'
  | 'Other';

export type QueryStatus =
  | 'SUBMITTED'
  | 'UNDER REVIEW'
  | 'NEEDS INFORMATION'
  | 'ANSWERED'
  | 'CLOSED';

export interface QueryAttachment {
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
}

export interface QueryMessage {
  id: string;
  queryId: string;
  senderUid: string;
  senderName: string;
  senderRole: 'student' | 'admin' | 'faculty';
  message: string;
  attachment?: QueryAttachment;
  createdAt: string;
}

export interface QueryStatusHistoryItem {
  id: string;
  status: QueryStatus;
  changedByUid: string;
  changedByName: string;
  changedByRole: 'student' | 'admin' | 'faculty';
  timestamp: string;
  note?: string;
}

export interface StudentQuery {
  id: string;
  queryId: string;
  studentUid: string;
  studentName: string;
  studentEmail: string;
  studentRollNumber?: string;
  title: string;
  description: string;
  category: QueryCategory;
  otherCategoryDetail?: string;
  department: string;
  status: QueryStatus;
  attachment?: QueryAttachment;
  assignedAdminUid?: string;
  assignedAdminName?: string;
  assignedDepartment?: string;
  latestResponse?: string;
  latestResponseAt?: string;
  latestResponseBy?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: QueryStatusHistoryItem[];
  messages: QueryMessage[];
}




