import {
  StudentQuery,
  QueryCategory,
  QueryStatus,
  QueryMessage,
  QueryStatusHistoryItem,
  QueryAttachment,
  UserProfile
} from '../types';
import { firebaseDbService } from './firebaseDbService';
import { auth } from '../firebase';

export const QUERY_CATEGORIES: QueryCategory[] = [
  'Academics',
  'Examinations',
  'Attendance',
  'Fees and Payments',
  'Scholarships',
  'Certificates and Documents',
  'Library',
  'Hostel',
  'Transportation',
  'College Facilities',
  'Technical Support',
  'General Query',
  'Other'
];

export const COLLEGE_DEPARTMENTS: string[] = [
  'Computer Science & Engineering',
  'Academic Affairs Directorate',
  'Examination Cell & Controller of Exams',
  'Accounts, Fees & Scholarship Directorate',
  'Office of the Dean of Student Welfare',
  'Administrative Records & Certification Desk',
  'Central University Library',
  'Hostel & Residential Life Office',
  'Campus Transport & Bus Logistics',
  'Campus Infrastructure & Facilities Management',
  'IT Support, Network & Systems Centre',
  'General Student Grievance Committee'
];

export const QUERY_STATUSES: {
  key: QueryStatus;
  label: string;
  badgeClass: string;
  dotColor: string;
  description: string;
}[] = [
  {
    key: 'SUBMITTED',
    label: 'Submitted',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dotColor: 'bg-indigo-500',
    description: 'Query filed and awaiting review by the department coordinator.'
  },
  {
    key: 'UNDER REVIEW',
    label: 'Under Review',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    dotColor: 'bg-amber-500',
    description: 'Assigned to the relevant administrative desk for investigation.'
  },
  {
    key: 'NEEDS INFORMATION',
    label: 'Needs Information',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    dotColor: 'bg-rose-500',
    description: 'The administration requested further clarification or documents from you.'
  },
  {
    key: 'ANSWERED',
    label: 'Answered',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dotColor: 'bg-emerald-500',
    description: 'Official response provided by the administration.'
  },
  {
    key: 'CLOSED',
    label: 'Closed',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    dotColor: 'bg-slate-400',
    description: 'Inquiry resolved and closed.'
  }
];

const LOCAL_STORAGE_CACHE_KEY = 'campus_student_queries_v1';
const DRAFT_STORAGE_KEY = 'campus_student_query_draft_v1';

export interface QuerySubmissionPayload {
  title: string;
  description: string;
  category: QueryCategory;
  otherCategoryDetail?: string;
  department: string;
  attachment?: QueryAttachment;
}

export interface QueryValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const studentQueryService = {
  // Generate unique clean sequential ID e.g. QRY-2026-78421
  generateQueryId(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    return `QRY-${year}-${random}`;
  },

  // Validate form inputs
  validateQuery(payload: Partial<QuerySubmissionPayload>): QueryValidationResult {
    const errors: Record<string, string> = {};

    if (!payload.title || !payload.title.trim()) {
      errors.title = 'Query title is required.';
    } else if (payload.title.trim().length < 5) {
      errors.title = 'Query title must be at least 5 characters long.';
    } else if (payload.title.trim().length > 150) {
      errors.title = 'Query title cannot exceed 150 characters.';
    }

    if (!payload.description || !payload.description.trim()) {
      errors.description = 'Detailed question description is required.';
    } else if (payload.description.trim().length < 15) {
      errors.description = 'Please provide more details (at least 15 characters).';
    } else if (payload.description.trim().length > 3000) {
      errors.description = 'Detailed description cannot exceed 3,000 characters.';
    }

    if (!payload.category) {
      errors.category = 'Please select an appropriate query category.';
    } else if (payload.category === 'Other' && (!payload.otherCategoryDetail || !payload.otherCategoryDetail.trim())) {
      errors.otherCategoryDetail = 'Please specify your inquiry topic.';
    }

    if (!payload.department || !payload.department.trim()) {
      errors.department = 'Please select the relevant college department.';
    }

    if (payload.attachment) {
      const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.docx', '.doc'];
      const fileNameLower = payload.attachment.name.toLowerCase();
      const hasValidExt = allowedExtensions.some((ext) => fileNameLower.endsWith(ext));

      if (!hasValidExt) {
        errors.attachment = 'Attachment must be a PDF, PNG, JPG, or DOCX document.';
      } else if (payload.attachment.size > 5 * 1024 * 1024) {
        errors.attachment = 'Attachment file size exceeds the 5MB limit.';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Draft management to protect students from lost work
  saveDraft(draft: Partial<QuerySubmissionPayload>): void {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // ignore
    }
  },

  getDraft(): Partial<QuerySubmissionPayload> | null {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },

  clearDraft(): void {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // ignore
    }
  },

  // Submit new query
  async submitQuery(payload: QuerySubmissionPayload, student: UserProfile): Promise<StudentQuery> {
    const validation = this.validateQuery(payload);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      throw new Error(firstError || 'Validation failed');
    }

    const currentUid = auth.currentUser?.uid || student.id || student.uid;
    if (!currentUid) {
      throw new Error('Authentication required. Please sign in to submit a query.');
    }

    const queryId = this.generateQueryId();
    const nowIso = new Date().toISOString();

    const initialHistory: QueryStatusHistoryItem = {
      id: `hist-${Date.now()}`,
      status: 'SUBMITTED',
      changedByUid: currentUid,
      changedByName: student.name || 'Student',
      changedByRole: 'student',
      timestamp: nowIso,
      note: 'Query submitted by student.'
    };

    const initialMessage: QueryMessage = {
      id: `msg-${Date.now()}`,
      queryId,
      senderUid: currentUid,
      senderName: student.name || 'Student',
      senderRole: 'student',
      message: payload.description.trim(),
      attachment: payload.attachment,
      createdAt: nowIso
    };

    const record: StudentQuery = {
      id: queryId,
      queryId,
      studentUid: currentUid,
      studentName: student.name || 'Student',
      studentEmail: student.email || auth.currentUser?.email || 'student@campus.edu',
      studentRollNumber: student.rollNumber || '22CS084',
      title: payload.title.trim(),
      description: payload.description.trim(),
      category: payload.category,
      otherCategoryDetail: payload.otherCategoryDetail?.trim(),
      department: payload.department,
      status: 'SUBMITTED',
      attachment: payload.attachment,
      createdAt: nowIso,
      updatedAt: nowIso,
      statusHistory: [initialHistory],
      messages: [initialMessage]
    };

    // Save directly to Firestore
    await firebaseDbService.createStudentQuery(record);

    // Update local cache
    this.updateLocalCache(record);

    // Clear form draft upon successful database save
    this.clearDraft();

    return record;
  },

  // Student replying / sending message
  async sendReply(
    queryId: string,
    messageText: string,
    sender: UserProfile,
    attachment?: QueryAttachment
  ): Promise<void> {
    if (!messageText.trim() && !attachment) {
      throw new Error('Message cannot be empty.');
    }

    const currentUid = auth.currentUser?.uid || sender.id || sender.uid;
    if (!currentUid) {
      throw new Error('Authentication required.');
    }

    const nowIso = new Date().toISOString();
    const isStaff = sender.role === 'admin' || sender.role === 'faculty' || sender.role === 'coordinator';

    const newMessage: QueryMessage = {
      id: `msg-${Date.now()}`,
      queryId,
      senderUid: currentUid,
      senderName: sender.name || (isStaff ? 'Administrator' : 'Student'),
      senderRole: isStaff ? 'admin' : 'student',
      message: messageText.trim(),
      attachment,
      createdAt: nowIso
    };

    // If student replied while in 'NEEDS INFORMATION', move back to 'UNDER REVIEW'
    let optionalStatus: QueryStatus | undefined = undefined;
    let optionalHistory: QueryStatusHistoryItem | undefined = undefined;

    if (!isStaff) {
      const existing = await firebaseDbService.getStudentQueryById(queryId);
      if (existing && existing.status === 'NEEDS INFORMATION') {
        optionalStatus = 'UNDER REVIEW';
        optionalHistory = {
          id: `hist-${Date.now()}`,
          status: 'UNDER REVIEW',
          changedByUid: currentUid,
          changedByName: sender.name,
          changedByRole: 'student',
          timestamp: nowIso,
          note: 'Student provided clarification / requested information.'
        };
      }
    }

    await firebaseDbService.addMessageToStudentQuery(queryId, newMessage, optionalStatus, optionalHistory);
  },

  // Admin responding to query
  async adminRespond(
    queryId: string,
    responseText: string,
    newStatus: QueryStatus,
    adminUser: UserProfile,
    attachment?: QueryAttachment
  ): Promise<void> {
    if (!responseText.trim()) {
      throw new Error('Response text cannot be empty.');
    }

    const currentUid = auth.currentUser?.uid || adminUser.id || adminUser.uid || 'admin';
    const nowIso = new Date().toISOString();

    const responseMsg: QueryMessage = {
      id: `msg-${Date.now()}`,
      queryId,
      senderUid: currentUid,
      senderName: adminUser.name || 'University Administrator',
      senderRole: 'admin',
      message: responseText.trim(),
      attachment,
      createdAt: nowIso
    };

    const statusHistory: QueryStatusHistoryItem = {
      id: `hist-${Date.now()}`,
      status: newStatus,
      changedByUid: currentUid,
      changedByName: adminUser.name || 'Administrator',
      changedByRole: 'admin',
      timestamp: nowIso,
      note: `Administrator response dispatched. Status set to ${newStatus}.`
    };

    await firebaseDbService.addMessageToStudentQuery(queryId, responseMsg, newStatus, statusHistory);
  },

  // Admin updating query status
  async updateStatus(
    queryId: string,
    newStatus: QueryStatus,
    adminUser: UserProfile,
    remark?: string
  ): Promise<void> {
    const currentUid = auth.currentUser?.uid || adminUser.id || adminUser.uid || 'admin';
    const nowIso = new Date().toISOString();

    const existing = await firebaseDbService.getStudentQueryById(queryId);
    if (!existing) {
      throw new Error('Query not found.');
    }

    const historyItem: QueryStatusHistoryItem = {
      id: `hist-${Date.now()}`,
      status: newStatus,
      changedByUid: currentUid,
      changedByName: adminUser.name,
      changedByRole: 'admin',
      timestamp: nowIso,
      note: remark?.trim() || `Status updated from ${existing.status} to ${newStatus}.`
    };

    const updatedHistory = [...(existing.statusHistory || []), historyItem];
    await firebaseDbService.updateStudentQuery(queryId, {
      status: newStatus,
      statusHistory: updatedHistory,
      updatedAt: nowIso
    });
  },

  // Admin assigning query to department / personnel
  async assignDepartment(
    queryId: string,
    department: string,
    adminUser: UserProfile,
    assignedAdminName?: string
  ): Promise<void> {
    const currentUid = auth.currentUser?.uid || adminUser.id || adminUser.uid || 'admin';
    const nowIso = new Date().toISOString();

    const existing = await firebaseDbService.getStudentQueryById(queryId);
    if (!existing) {
      throw new Error('Query not found.');
    }

    const historyItem: QueryStatusHistoryItem = {
      id: `hist-${Date.now()}`,
      status: existing.status,
      changedByUid: currentUid,
      changedByName: adminUser.name,
      changedByRole: 'admin',
      timestamp: nowIso,
      note: `Re-assigned jurisdiction to ${department}${assignedAdminName ? ` (${assignedAdminName})` : ''}.`
    };

    await firebaseDbService.updateStudentQuery(queryId, {
      department,
      assignedDepartment: department,
      assignedAdminName: assignedAdminName || adminUser.name,
      statusHistory: [...(existing.statusHistory || []), historyItem],
      updatedAt: nowIso
    });
  },

  // Local caching utilities
  updateLocalCache(item: StudentQuery): void {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
      let list: StudentQuery[] = stored ? JSON.parse(stored) : [];
      const idx = list.findIndex((q) => q.id === item.id || q.queryId === item.queryId);
      if (idx >= 0) {
        list[idx] = item;
      } else {
        list.unshift(item);
      }
      localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  },

  getCachedQueries(studentUid?: string): StudentQuery[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
      if (!stored) return [];
      const parsed: StudentQuery[] = JSON.parse(stored);
      if (studentUid) {
        return parsed.filter((q) => q.studentUid === studentUid);
      }
      return parsed;
    } catch {
      return [];
    }
  },

  // Subscriptions with cache fallback
  subscribeStudentQueries(studentUid: string, onData: (queries: StudentQuery[]) => void): () => void {
    const cached = this.getCachedQueries(studentUid);
    if (cached.length > 0) {
      onData(cached);
    }
    return firebaseDbService.subscribeStudentQueries(studentUid, (liveList) => {
      try {
        localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(liveList));
      } catch {
        // ignore
      }
      onData(liveList);
    });
  },

  subscribeAllQueries(onData: (queries: StudentQuery[]) => void): () => void {
    return firebaseDbService.subscribeAllStudentQueriesForAdmin((liveList) => {
      onData(liveList);
    });
  },

  // Compute administrative summary statistics
  computeStats(queries: StudentQuery[]) {
    return {
      total: queries.length,
      submitted: queries.filter((q) => q.status === 'SUBMITTED').length,
      underReview: queries.filter((q) => q.status === 'UNDER REVIEW').length,
      needsInformation: queries.filter((q) => q.status === 'NEEDS INFORMATION').length,
      answered: queries.filter((q) => q.status === 'ANSWERED').length,
      closed: queries.filter((q) => q.status === 'CLOSED').length
    };
  }
};
