import { PermissionRequest, ApprovalHistoryItem, UserProfile } from '../types';
import { INITIAL_PERMISSION_REQUESTS } from '../data/permissionLetterData';
import { jsPDF } from 'jspdf';
import { firebaseDbService } from './firebaseDbService';
import { auth } from '../firebase';

const STORAGE_KEY = 'campus_permission_requests_v1';

export const permissionLetterService = {
  // Fetch all requests from localStorage or seed
  getAllRequests(): PermissionRequest[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to read permission requests from localStorage:', err);
    }
    return INITIAL_PERMISSION_REQUESTS;
  },

  // Save full collection
  saveAllRequests(requests: PermissionRequest[], targetRequest?: PermissionRequest): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
      // Only write the one request that was just created or updated,
      // and only if request.studentId === auth.currentUser.uid
      if (auth.currentUser && targetRequest && targetRequest.studentId === auth.currentUser.uid) {
        const payload: PermissionRequest = {
          ...targetRequest,
          destination: targetRequest.destination || targetRequest.subject,
          fromDate: targetRequest.fromDate || targetRequest.startDate,
          toDate: targetRequest.toDate || targetRequest.endDate
        };
        firebaseDbService.createPermissionRequest(payload).catch((err) => {
          console.warn('Failed to sync permission request to Firestore:', err);
        });
      } else if (auth.currentUser && targetRequest && targetRequest.requestId) {
        // When faculty or admin reviews and approves/rejects, update the existing request
        firebaseDbService.updatePermissionRequest(targetRequest.requestId, targetRequest).catch((err) => {
          console.warn('Failed to sync permission review update to Firestore:', err);
        });
      }
    } catch (err) {
      console.error('Failed to save permission requests to localStorage:', err);
    }
  },

  subscribeRequests(onData: (requests: PermissionRequest[]) => void): () => void {
    return firebaseDbService.subscribePermissionRequests((items) => {
      if (items && items.length > 0) {
        try {
          const currentAll = this.getAllRequests();
          const itemMap = new Map<string, PermissionRequest>();
          for (const r of currentAll) {
            const key = r.requestId || r.id || `req-${Math.random()}`;
            itemMap.set(key, r);
          }
          for (const item of items) {
            const key = item.requestId || item.id || `req-${Math.random()}`;
            itemMap.set(key, item);
          }
          const merged = Array.from(itemMap.values());
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          onData(merged);
          return;
        } catch (e) {
          console.warn('Failed to merge permission requests:', e);
        }
      }
      onData(this.getAllRequests());
    });
  },

  // Get requests for a specific student
  getStudentRequests(studentId: string, rollNumber?: string): PermissionRequest[] {
    const all = this.getAllRequests();
    return all.filter(
      (r) =>
        r.studentId === studentId ||
        (rollNumber && r.rollNumber.toLowerCase() === rollNumber.toLowerCase())
    );
  },

  // Get requests for Class Mentor
  // Mentor sees requests from their assigned section / class (e.g. "Section A" or "CSE-A")
  getMentorRequests(mentorUser: UserProfile): PermissionRequest[] {
    const all = this.getAllRequests();
    const assignedClass = mentorUser.assignedClass; // e.g. "CSE-A"
    return all.filter((r) => {
      // Exclude drafts
      if (r.status === 'draft') return false;

      // Filter by department
      if (
        mentorUser.department &&
        r.department.toLowerCase() !== mentorUser.department.toLowerCase()
      ) {
        return false;
      }

      // Filter by assigned section if set
      if (assignedClass && assignedClass !== 'ALL') {
        const sectionMatch =
          r.section.toLowerCase().includes('section a') ||
          assignedClass.toLowerCase().includes('cse-a');
        return sectionMatch;
      }

      return true;
    });
  },

  // Get requests for HOD
  // HOD sees requests under their department that require HOD approval or have been reviewed by Mentor
  getHodRequests(hodUser: UserProfile): PermissionRequest[] {
    const all = this.getAllRequests();
    return all.filter((r) => {
      if (r.status === 'draft') return false;
      // Filter by department
      if (
        hodUser.department &&
        r.department.toLowerCase() !== hodUser.department.toLowerCase()
      ) {
        return false;
      }
      return true;
    });
  },

  // Generate clean sequential ID
  generateRequestId(): string {
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `REQ-${year}-PL-${randomSuffix}`;
  },

  // Format letter template text dynamically
  generateLetterTemplate(params: {
    date: string;
    recipient: 'mentor' | 'hod' | 'both';
    studentName: string;
    rollNumber: string;
    department: string;
    year: string;
    section: string;
    subject: string;
    reason: string;
    startDate: string;
    endDate: string;
    additionalInformation?: string;
  }): string {
    const recipientTitle =
      params.recipient === 'mentor'
        ? 'The Class Mentor'
        : params.recipient === 'hod'
        ? 'The Head of Department (HOD)'
        : 'The Class Mentor & Head of Department';

    let content = `Date: ${params.date}

To,
${recipientTitle}
Department of ${params.department}
Apex University

Subject: ${params.subject || '[Subject of Permission Request]'}

Respected Sir/Madam,

I am ${params.studentName || '[Student Name]'}, Roll No. ${params.rollNumber || '[Roll Number]'}, studying ${params.year || '[Year]'}, ${params.department || '[Branch]'}, Section ${params.section || '[Section]'}.

I kindly request permission regarding ${params.reason || '[Reason for Permission]'}.

I require permission from ${params.startDate || '[Start Date]'} to ${params.endDate || '[End Date]'}.`;

    if (params.additionalInformation && params.additionalInformation.trim()) {
      content += `\n\nAdditional Details: ${params.additionalInformation.trim()}`;
    }

    content += `\n\nI request you to kindly consider my request and grant me permission.\n\nThank you.\n\nYours sincerely,\n${params.studentName || '[Student Name]'}\nRoll No: ${params.rollNumber || '[Roll Number]'}\n${params.department || '[Branch]'} / ${params.section || '[Section]'}`;

    return content;
  },

  // Submit or save draft
  submitOrSaveRequest(
    requestData: Omit<PermissionRequest, 'requestId' | 'createdAt' | 'updatedAt' | 'approvalHistory'>,
    isDraft: boolean,
    existingRequestId?: string
  ): PermissionRequest {
    const all = this.getAllRequests();
    const now = new Date();
    const timestampStr = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    let finalRequestId = existingRequestId || this.generateRequestId();

    const status: PermissionRequest['status'] = isDraft
      ? 'draft'
      : requestData.recipient === 'hod'
      ? 'pending_hod'
      : 'pending_mentor';

    const historyItem: ApprovalHistoryItem = {
      id: `hist-${Date.now()}`,
      requestId: finalRequestId,
      approverId: requestData.studentId,
      approverName: requestData.studentName,
      approverRole: 'student',
      action: isDraft ? 'saved_draft' : 'submitted',
      remark: isDraft ? 'Letter saved as draft' : 'Letter submitted for review',
      timestamp: timestampStr
    };

    const existingIndex = all.findIndex((r) => r.requestId === finalRequestId);

    let updatedRequest: PermissionRequest;

    if (existingIndex >= 0) {
      const prev = all[existingIndex];
      updatedRequest = {
        ...prev,
        ...requestData,
        requestId: finalRequestId,
        status,
        updatedAt: now.toISOString(),
        approvalHistory: [...prev.approvalHistory, historyItem]
      };
      all[existingIndex] = updatedRequest;
    } else {
      updatedRequest = {
        ...requestData,
        requestId: finalRequestId,
        status,
        approvalHistory: [historyItem],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };
      all.unshift(updatedRequest);
    }

    this.saveAllRequests(all, updatedRequest);
    return updatedRequest;
  },

  // Mentor Review Action (Approve or Reject)
  mentorReview(
    requestId: string,
    action: 'approve' | 'reject',
    mentorUser: UserProfile,
    remark: string
  ): PermissionRequest {
    const all = this.getAllRequests();
    const index = all.findIndex((r) => r.requestId === requestId);
    if (index === -1) {
      throw new Error(`Permission request with ID ${requestId} not found.`);
    }

    const current = all[index];
    const now = new Date();
    const timestampStr = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    let newStatus: PermissionRequest['status'];

    if (action === 'reject') {
      newStatus = 'rejected';
    } else {
      // If student requested 'both' or 'hod', escalate to HOD
      if (current.recipient === 'both' || current.recipient === 'hod') {
        newStatus = 'pending_hod';
      } else {
        newStatus = 'approved';
      }
    }

    const historyItem: ApprovalHistoryItem = {
      id: `hist-${Date.now()}`,
      requestId,
      approverId: mentorUser.id,
      approverName: mentorUser.name,
      approverRole: 'mentor',
      action: action === 'approve' ? 'mentor_approved' : 'mentor_rejected',
      remark: remark.trim() || (action === 'approve' ? 'Recommended and approved by Class Mentor.' : 'Rejected by Class Mentor.'),
      timestamp: timestampStr
    };

    const updated: PermissionRequest = {
      ...current,
      status: newStatus,
      mentorRemark: remark.trim() || (action === 'approve' ? 'Approved by Class Mentor.' : 'Rejected by Class Mentor.'),
      approvalHistory: [...current.approvalHistory, historyItem],
      updatedAt: now.toISOString()
    };

    all[index] = updated;
    this.saveAllRequests(all, updated);
    return updated;
  },

  // HOD Review Action (Approve or Reject)
  hodReview(
    requestId: string,
    action: 'approve' | 'reject',
    hodUser: UserProfile,
    remark: string
  ): PermissionRequest {
    const all = this.getAllRequests();
    const index = all.findIndex((r) => r.requestId === requestId);
    if (index === -1) {
      throw new Error(`Permission request with ID ${requestId} not found.`);
    }

    const current = all[index];
    const now = new Date();
    const timestampStr = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newStatus: PermissionRequest['status'] = action === 'approve' ? 'approved' : 'rejected';

    const historyItem: ApprovalHistoryItem = {
      id: `hist-${Date.now()}`,
      requestId,
      approverId: hodUser.id,
      approverName: hodUser.name,
      approverRole: 'hod',
      action: action === 'approve' ? 'hod_approved' : 'hod_rejected',
      remark: remark.trim() || (action === 'approve' ? 'Final approval granted by Head of Department.' : 'Rejected by Head of Department.'),
      timestamp: timestampStr
    };

    const updated: PermissionRequest = {
      ...current,
      status: newStatus,
      hodRemark: remark.trim() || (action === 'approve' ? 'Final approval granted by HOD.' : 'Rejected by HOD.'),
      approvalHistory: [...current.approvalHistory, historyItem],
      updatedAt: now.toISOString()
    };

    all[index] = updated;
    this.saveAllRequests(all, updated);
    return updated;
  },

  // Export letter as official PDF document
  downloadOfficialPdf(request: PermissionRequest): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Outer border & header
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, 190, 277);

    // University Letterhead
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(10, 10, 190, 25, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('APEX UNIVERSITY', 105, 18, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL ACADEMIC STUDENT PERMISSION RECORD', 105, 24, { align: 'center' });
    doc.text('Department of ' + request.department, 105, 29, { align: 'center' });

    // Request ID & Date bar
    doc.setFillColor(241, 245, 249);
    doc.rect(10, 35, 190, 10, 'F');
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`REQUEST ID: ${request.requestId}`, 15, 41.5);
    doc.text(`SUBMISSION DATE: ${request.date}`, 140, 41.5);

    // Status Banner
    let statusText = 'PENDING REVIEW';
    let statusColor: [number, number, number] = [217, 119, 6]; // amber
    if (request.status === 'approved') {
      statusText = 'OFFICIALLY APPROVED';
      statusColor = [5, 150, 105]; // emerald
    } else if (request.status === 'rejected') {
      statusText = 'REQUEST REJECTED';
      statusColor = [225, 29, 72]; // rose
    } else if (request.status === 'pending_hod') {
      statusText = 'MENTOR APPROVED • PENDING HOD CLEARANCE';
      statusColor = [79, 70, 229]; // indigo
    }

    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.rect(15, 49, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`STATUS: ${statusText}`, 105, 54.5, { align: 'center' });

    // Letter Content Body
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);

    const splitLines = doc.splitTextToSize(request.letterContent, 175);
    doc.text(splitLines, 18, 67);

    // Remarks Section
    let currentY = 195;
    doc.setDrawColor(203, 213, 225);
    doc.line(15, currentY, 195, currentY);
    currentY += 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('OFFICIAL FACULTY & HOD DECISIONS / REMARKS:', 18, currentY);
    currentY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    if (request.mentorRemark) {
      doc.setFont('helvetica', 'bold');
      doc.text('Class Mentor Remark: ', 18, currentY);
      doc.setFont('helvetica', 'italic');
      doc.text(`"${request.mentorRemark}"`, 55, currentY);
      currentY += 6;
    }

    if (request.hodRemark) {
      doc.setFont('helvetica', 'bold');
      doc.text('Head of Dept (HOD) Remark: ', 18, currentY);
      doc.setFont('helvetica', 'italic');
      doc.text(`"${request.hodRemark}"`, 65, currentY);
      currentY += 6;
    }

    // Signatures & Stamp Box
    currentY = 245;
    doc.setDrawColor(226, 232, 240);
    doc.line(15, currentY, 195, currentY);
    currentY += 12;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('STUDENT SIGNATURE', 25, currentY);
    doc.text('CLASS MENTOR ENDORSEMENT', 85, currentY);
    doc.text('HEAD OF DEPARTMENT (SEAL)', 145, currentY);

    currentY += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(request.studentName, 25, currentY);
    doc.text(request.status !== 'rejected' && request.status !== 'pending_mentor' && request.status !== 'draft' ? '✓ Verified & Cleared' : 'Pending Verification', 85, currentY);
    doc.text(request.status === 'approved' ? '✓ Approved with Seal' : 'Pending HOD Action', 145, currentY);

    // Footer info
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Digitally generated from Apex University Academic Portal on ${new Date().toISOString().split('T')[0]}. Verification Hash: SHA256-${request.requestId.replace(/-/g, '')}`,
      105,
      282,
      { align: 'center' }
    );

    doc.save(`Permission_Letter_${request.requestId}_${request.rollNumber}.pdf`);
  }
};
