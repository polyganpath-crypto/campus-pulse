import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  Send,
  AlertTriangle,
  AlertCircle,
  FolderGit2,
  Calendar,
  MessageSquare,
  Sparkles,
  UserCheck,
  ChevronRight,
  Plus,
  ExternalLink,
  Search,
  Check,
  X,
  FileText,
  Presentation,
  FileCheck,
  Download,
  Layers,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  Building2,
  MapPin,
  Compass
} from 'lucide-react';
import { UserProfile, TabKey, PermissionRequest, PermissionRequestStatus, CampusAnnouncement } from '../../types';
import { permissionLetterService } from '../../services/permissionLetterService';
import { campusNavService } from '../../services/campusNavService';
import { firebaseDbService } from '../../services/firebaseDbService';

interface FacultyDashboardTabProps {
  currentUser: UserProfile;
  onNavigateTab: (tab: TabKey) => void;
}

interface StudentAttendanceRecord {
  id: string;
  rollNumber: string;
  name: string;
  batch: string;
  currentAttendancePercent: number;
  status: 'present' | 'absent' | 'on_duty';
}

interface StudentProjectSubmission {
  id: string;
  studentName: string;
  studentRoll: string;
  projectTitle: string;
  branch: string;
  targetPackage: string;
  currentMilestone: string;
  repoUrl: string;
  status: 'Pending Review' | 'Milestone Approved' | 'Revision Requested';
  facultyFeedback?: string;
}

interface StudentDoubtItem {
  id: string;
  studentName: string;
  studentRoll: string;
  subject: string;
  question: string;
  escalatedFromAi: boolean;
  timestamp: string;
  status: 'pending' | 'resolved';
  facultyReply?: string;
}

export const FacultyDashboardTab: React.FC<FacultyDashboardTabProps> = ({
  currentUser,
  onNavigateTab
}) => {
  // Courses taught by faculty
  const [selectedCourse, setSelectedCourse] = useState<'CS601' | 'CS602'>('CS601');
  const [showAttendanceModal, setShowAttendanceModal] = useState<boolean>(false);
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [topicTaught, setTopicTaught] = useState<string>('Dynamic Programming & Optimal Substructure');

  // Attendance roster for modal
  const [roster, setRoster] = useState<StudentAttendanceRecord[]>([
    { id: 'st-1', rollNumber: '22CS084', name: 'Likith E.', batch: 'CSE-A', currentAttendancePercent: 90.5, status: 'present' },
    { id: 'st-2', rollNumber: '22CS019', name: 'Aarav Patel', batch: 'CSE-A', currentAttendancePercent: 88.0, status: 'present' },
    { id: 'st-3', rollNumber: '22CS031', name: 'Tanya Sengupta', batch: 'CSE-A', currentAttendancePercent: 92.3, status: 'present' },
    { id: 'st-4', rollNumber: '22CS052', name: 'Kunal Verma', batch: 'CSE-A', currentAttendancePercent: 71.4, status: 'absent' },
    { id: 'st-5', rollNumber: '22CS078', name: 'Sneha Kulkarni', batch: 'CSE-A', currentAttendancePercent: 85.0, status: 'present' },
    { id: 'st-6', rollNumber: '22CS095', name: 'Dev Sharma', batch: 'CSE-A', currentAttendancePercent: 68.2, status: 'absent' }
  ]);

  const [attendanceSavedToast, setAttendanceSavedToast] = useState<string | null>(null);

  // Student Doubt Escalations
  const [studentDoubts, setStudentDoubts] = useState<StudentDoubtItem[]>([
    {
      id: 'dbt-1',
      studentName: 'Likith E.',
      studentRoll: '22CS084',
      subject: 'CS601: Algorithms',
      question: 'Professor, how do we prove that Bellman-Ford can detect negative weight cycles in exactly V-1 relaxations, and why does an extra Vth relaxation confirm the cycle?',
      escalatedFromAi: true,
      timestamp: 'Today at 09:20 AM',
      status: 'pending'
    },
    {
      id: 'dbt-2',
      studentName: 'Aarav Patel',
      studentRoll: '22CS019',
      subject: 'CS602: Distributed DB',
      question: 'During 2-Phase Commit (2PC), if the Coordinator crashes after all participants send "Prepared" vote, how is blocking prevented in modern enterprise consensus like Raft?',
      escalatedFromAi: true,
      timestamp: 'Yesterday at 04:15 PM',
      status: 'pending'
    },
    {
      id: 'dbt-3',
      studentName: 'Tanya Sengupta',
      studentRoll: '22CS031',
      subject: 'CS601: Algorithms',
      question: 'Could you review our project k6 benchmark methodology for testing token bucket rate limiter under 10,000 requests/sec?',
      escalatedFromAi: false,
      timestamp: 'Yesterday at 02:30 PM',
      status: 'resolved',
      facultyReply: 'Great approach Tanya. Ensure you test connection pooling dropouts and simulate Redis network latency with tc netem.'
    }
  ]);

  const [replyInputMap, setReplyInputMap] = useState<{ [doubtId: string]: string }>({});

  // Student High-CTC Project Mentorship submissions
  const [projectSubmissions, setProjectSubmissions] = useState<StudentProjectSubmission[]>([
    {
      id: 'sub-1',
      studentName: 'Likith E.',
      studentRoll: '22CS084',
      projectTitle: 'High-Throughput Distributed Rate Limiter & Token-Bucket Task Queue',
      branch: 'CSE',
      targetPackage: 'Tier-1 Product (₹24 - ₹48 LPA)',
      currentMilestone: 'Milestone 2: Asynchronous Worker Pool & Heartbeats',
      repoUrl: 'https://github.com/likith/distributed-rate-limiter',
      status: 'Pending Review',
      facultyFeedback: 'Clean atomic Lua script design. Add failure injection tests for Redis broker partition.'
    },
    {
      id: 'sub-2',
      studentName: 'Aarav Patel',
      studentRoll: '22CS019',
      projectTitle: 'Enterprise Hybrid-Search RAG Platform with Cross-Encoder',
      branch: 'AI/DS',
      targetPackage: 'High-CTC Unicorn (₹26 - ₹52 LPA)',
      currentMilestone: 'Milestone 3: Semantic Redis Embedding Caching',
      repoUrl: 'https://github.com/aarav/hybrid-rag-engine',
      status: 'Milestone Approved',
      facultyFeedback: 'Excellent Ragas evaluation setup. Context precision above 91% confirmed.'
    },
    {
      id: 'sub-3',
      studentName: 'Sneha Kulkarni',
      studentRoll: '22EC055',
      projectTitle: 'Industrial IoT Edge Gateway with FreeRTOS & TLS 1.3 MQTT-SN',
      branch: 'ECE',
      targetPackage: 'Tier-1 Embedded (₹18 - ₹40 LPA)',
      currentMilestone: 'Milestone 1: Deterministic RTOS Tasks & Ring Buffer',
      repoUrl: 'https://github.com/sneha/freertos-iot-gateway',
      status: 'Pending Review'
    }
  ]);

  // Quick announcement state
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [announcements, setAnnouncements] = useState<CampusAnnouncement[]>(() =>
    campusNavService.getAnnouncements()
  );

  useEffect(() => {
    const unsub = campusNavService.subscribeAnnouncements((updated) => {
      setAnnouncements(updated);
    });
    return () => unsub();
  }, []);

  // Permission Requests Queue State (Class Mentor & HOD Approval Queue)
  const [permissionRequests, setPermissionRequests] = useState<PermissionRequest[]>([]);
  const [permFilter, setPermFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [facultyPerspective, setFacultyPerspective] = useState<'mentor' | 'hod'>(
    currentUser.facultyType === 'hod' ? 'hod' : 'mentor'
  );
  const [selectedPermRequest, setSelectedPermRequest] = useState<PermissionRequest | null>(null);
  const [approvalRemark, setApprovalRemark] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [rejectError, setRejectError] = useState<string | null>(null);

  const loadPermissionRequests = () => {
    const list = permissionLetterService.getAllRequests();
    setPermissionRequests(list);
  };

  useEffect(() => {
    loadPermissionRequests();
    const unsub = permissionLetterService.subscribeRequests(() => {
      loadPermissionRequests();
    });
    return () => unsub();
  }, [currentUser.id, facultyPerspective]);

  // Handle Mentor or HOD Approval
  const handleApprovePermission = (req: PermissionRequest) => {
    try {
      if (facultyPerspective === 'mentor') {
        const remark = approvalRemark.trim() || 'Verified student credentials and attendance record. Recommended and approved by Class Mentor.';
        const updated = permissionLetterService.mentorReview(
          req.requestId,
          'approve',
          currentUser,
          remark
        );
        loadPermissionRequests();
        setSelectedPermRequest(updated);
        setApprovalRemark('');
        setAttendanceSavedToast(
          req.recipient === 'both' || req.recipient === 'hod'
            ? `Permission request ${req.requestId} approved by Mentor & forwarded to HOD for final endorsement!`
            : `Permission request ${req.requestId} approved by Class Mentor!`
        );
      } else {
        const hodUser = {
          ...currentUser,
          id: currentUser.id || 'hod-cs-101',
          name: currentUser.name.includes('Ramanathan') ? currentUser.name : 'Dr. K. V. Ramanathan (HOD)',
          designation: 'Professor & Head of Department'
        };
        const remark = approvalRemark.trim() || 'Final official institutional endorsement granted with university on-duty attendance credit.';
        const updated = permissionLetterService.hodReview(
          req.requestId,
          'approve',
          hodUser,
          remark
        );
        loadPermissionRequests();
        setSelectedPermRequest(updated);
        setApprovalRemark('');
        setAttendanceSavedToast(`Permission request ${req.requestId} officially cleared with HOD Departmental Seal!`);
      }
      setTimeout(() => setAttendanceSavedToast(null), 4500);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error approving request');
    }
  };

  // Open Rejection Dialog (Requires Mandatory Remark!)
  const handleOpenRejectModal = (req: PermissionRequest) => {
    setSelectedPermRequest(req);
    setRejectReason('');
    setRejectError(null);
    setShowRejectModal(true);
  };

  // Confirm Rejection with mandatory remark
  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      setRejectError('A short rejection remark is strictly required before rejecting this student letter.');
      return;
    }
    if (!selectedPermRequest) return;

    try {
      if (facultyPerspective === 'mentor') {
        const updated = permissionLetterService.mentorReview(
          selectedPermRequest.requestId,
          'reject',
          currentUser,
          rejectReason.trim()
        );
        loadPermissionRequests();
        setSelectedPermRequest(updated);
        setShowRejectModal(false);
        setAttendanceSavedToast(`Permission request ${selectedPermRequest.requestId} rejected by Class Mentor.`);
      } else {
        const hodUser = {
          ...currentUser,
          id: currentUser.id || 'hod-cs-101',
          name: currentUser.name.includes('Ramanathan') ? currentUser.name : 'Dr. K. V. Ramanathan (HOD)',
          designation: 'Professor & Head of Department'
        };
        const updated = permissionLetterService.hodReview(
          selectedPermRequest.requestId,
          'reject',
          hodUser,
          rejectReason.trim()
        );
        loadPermissionRequests();
        setSelectedPermRequest(updated);
        setShowRejectModal(false);
        setAttendanceSavedToast(`Permission request ${selectedPermRequest.requestId} rejected by Head of Department.`);
      }
      setTimeout(() => setAttendanceSavedToast(null), 4500);
    } catch (err: unknown) {
      setRejectError(err instanceof Error ? err.message : 'Error rejecting request');
    }
  };

  // Filter permission requests for current view
  const visiblePermissionRequests = permissionRequests.filter((r) => {
    if (r.status === 'draft') return false;

    // Filter by tab
    if (permFilter === 'pending') {
      if (facultyPerspective === 'mentor') {
        return r.status === 'pending_mentor';
      } else {
        return r.status === 'pending_hod' || r.status === 'mentor_approved';
      }
    }
    if (permFilter === 'approved') {
      return r.status === 'approved';
    }
    if (permFilter === 'rejected') {
      return r.status === 'rejected';
    }
    return true; // 'all'
  });

  const pendingCountForMentor = permissionRequests.filter((r) => r.status === 'pending_mentor').length;
  const pendingCountForHod = permissionRequests.filter((r) => r.status === 'pending_hod' || r.status === 'mentor_approved').length;

  const handleToggleAttendanceStatus = (studentId: string, newStatus: 'present' | 'absent' | 'on_duty') => {
    setRoster((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status: newStatus } : s))
    );
  };

  // Submit attendance
  const handleSubmitAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const presentCount = roster.filter((r) => r.status === 'present').length;
    setAttendanceSavedToast(`Recorded attendance for ${selectedCourse}: ${presentCount}/${roster.length} present on ${attendanceDate}.`);
    setShowAttendanceModal(false);
    setTimeout(() => setAttendanceSavedToast(null), 4000);
  };

  // Faculty reply to student doubt
  const handleSendDoubtReply = (doubtId: string) => {
    const text = replyInputMap[doubtId]?.trim();
    if (!text) return;

    setStudentDoubts((prev) =>
      prev.map((d) =>
        d.id === doubtId
          ? {
              ...d,
              status: 'resolved',
              facultyReply: text
            }
          : d
      )
    );
    setReplyInputMap((prev) => ({ ...prev, [doubtId]: '' }));
  };

  // Faculty approve project milestone
  const handleApproveProject = (subId: string) => {
    setProjectSubmissions((prev) =>
      prev.map((p) =>
        p.id === subId ? { ...p, status: 'Milestone Approved' } : p
      )
    );
  };

  // Post announcement
  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeContent.trim()) return;

    const title = newNoticeTitle.trim();
    const description = newNoticeContent.trim();

    const created = campusNavService.addAnnouncement({
      title,
      description,
      category: 'Academic',
      priority: 'normal',
      department: currentUser.department || 'Computer Science & Engineering',
      authority: currentUser.name || 'Faculty Member',
      authorName: currentUser.name || 'Faculty Member',
      targetDepartment: currentUser.department || 'All Departments'
    });

    try {
      await firebaseDbService.createAnnouncement(created);
    } catch (err) {
      console.warn('Notice synced via service, direct create caught:', err);
    }

    setNewNoticeTitle('');
    setNewNoticeContent('');
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {attendanceSavedToast && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>{attendanceSavedToast}</span>
          </div>
          <button onClick={() => setAttendanceSavedToast(null)} className="p-1 hover:bg-white/20 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HERO BANNER: FACULTY IDENTITY & TEACHING DESK */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl border border-indigo-900/60 p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 bottom-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
              alt={currentUser.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-indigo-500/30 shadow-lg shrink-0"
            />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase tracking-wider">
                  Faculty Teaching & Mentorship Portal
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Academic Year 2025-2026
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {currentUser.name}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-y-1 gap-x-3">
                <span className="font-semibold text-white">{currentUser.designation || 'Associate Professor & Academic Head'}</span>
                <span>•</span>
                <span>{currentUser.department}</span>
                <span>•</span>
                <span>Cabin: {currentUser.cabinLocation || 'Block B, CS-304'}</span>
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => onNavigateTab('exam-seating')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-950/40 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-amber-300" />
              <span>Exam Seating Desk &amp; Halls</span>
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('faculty-permission-queue-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-900/40 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4 text-white" />
              <span>Permission Requests Queue ({pendingCountForMentor + pendingCountForHod})</span>
            </button>
            <button
              onClick={() => onNavigateTab('faculty-chat')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-white" />
              <span>Student Doubts &amp; Messaging</span>
            </button>
            <button
              onClick={() => setShowAttendanceModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Mark Today's Attendance</span>
            </button>
            <button
              onClick={() => onNavigateTab('campus-navigation')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-indigo-300" />
              <span>Campus Map &amp; Alerts</span>
            </button>
          </div>
        </div>

        {/* 5 Metric Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-800">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Active Courses</span>
              <BookOpen className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white">2 Classes</div>
            <p className="text-[11px] text-slate-400">CS601 & CS602 (140 Students)</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Class Attendance</span>
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">88.4% Avg</div>
            <p className="text-[11px] text-slate-400">2 Students &lt;75% Threshold</p>
          </div>

          <div
            onClick={() => {
              const el = document.getElementById('faculty-permission-queue-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1 cursor-pointer hover:bg-emerald-500/20 transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-emerald-300">
              <span>Permission Letters</span>
              <FileCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">
              {facultyPerspective === 'mentor' ? pendingCountForMentor : pendingCountForHod} Pending
            </div>
            <p className="text-[11px] text-emerald-200">
              {facultyPerspective === 'mentor' ? 'Class Mentor Review' : 'HOD Final Clearance'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Doubts Escalated</span>
              <MessageSquare className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white">2 Pending</div>
            <p className="text-[11px] text-slate-400">Escalated from AI Doubt Solver</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>High-CTC Projects</span>
              <Award className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-cyan-400">6 Projects</div>
            <p className="text-[11px] text-slate-400">Branch Placement Cohorts</p>
          </div>
        </div>
      </div>

      {/* STUDENT PERMISSION REQUESTS SECTION (MENTOR & HOD APPROVAL QUEUE) */}
      <div id="faculty-permission-queue-section" className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <FileCheck className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Student Permission Requests (Mentor &amp; HOD Queue)
                </h3>
                <p className="text-xs text-slate-500">
                  Review student leave, hackathon, and conference letters with strict role-based authorization.
                </p>
              </div>
            </div>
          </div>

          {/* Perspective Switcher & Filter Pills */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Mentor vs HOD Switcher */}
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setFacultyPerspective('mentor')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  facultyPerspective === 'mentor'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Class Mentor (CSE-A)</span>
                {pendingCountForMentor > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {pendingCountForMentor}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setFacultyPerspective('hod')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  facultyPerspective === 'hod'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>HOD Desk (CSE Dept)</span>
                {pendingCountForHod > 0 && (
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {pendingCountForHod}
                  </span>
                )}
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-[11px]">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setPermFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer uppercase tracking-wider text-[10px] ${
                    permFilter === tab
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab === 'all'
                    ? 'All'
                    : tab === 'pending'
                    ? `Pending (${facultyPerspective === 'mentor' ? pendingCountForMentor : pendingCountForHod})`
                    : tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current Perspective Context Banner */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-indigo-950 font-medium">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              Acting as:{' '}
              <strong className="font-bold text-slate-900">
                {facultyPerspective === 'mentor'
                  ? 'Dr. Priya Swaminathan — Assigned Class Mentor (Section CSE-A)'
                  : 'Dr. K. V. Ramanathan — Head of Department (HOD, Computer Science)'}
              </strong>{' '}
              • Access to assigned student clearance records only.
            </span>
          </div>

          <span className="text-[11px] font-mono text-indigo-700 shrink-0">
            {facultyPerspective === 'mentor' ? 'Stage 1: Mentor Endorsement' : 'Stage 2: Final Department Seal'}
          </span>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          {visiblePermissionRequests.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Class / Section</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">View / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visiblePermissionRequests.map((req) => (
                  <tr
                    key={req.requestId}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setSelectedPermRequest(req)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 whitespace-nowrap">
                      {req.requestId}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {req.studentName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {req.rollNumber}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-[11px] font-semibold text-slate-700">
                        {req.year} • {req.section}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-[220px] truncate">
                      {req.subject}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{req.date}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {req.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Approved
                        </span>
                      )}
                      {req.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                          <X className="w-3.5 h-3.5 text-rose-600" />
                          Rejected
                        </span>
                      )}
                      {req.status === 'pending_mentor' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Pending Mentor
                        </span>
                      )}
                      {(req.status === 'pending_hod' || req.status === 'mentor_approved') && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">
                          <Clock className="w-3.5 h-3.5 text-indigo-600" />
                          Pending HOD
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setSelectedPermRequest(req)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Review Letter</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10 space-y-2">
              <FileCheck className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No requests in this queue tab.</p>
              <p className="text-[11px] text-slate-400">
                {permFilter === 'pending'
                  ? 'All pending permission requests have been reviewed!'
                  : 'No records matching the selected status.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 2 COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: ACTIVE COURSES & DOUBTS (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* COURSE ATTENDANCE MANAGEMENT DESK */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Course Attendance & Lecture Roll
                </h3>
                <p className="text-xs text-slate-500">
                  Select a lecture course to inspect student attendance rates or mark daily attendance.
                </p>
              </div>

              {/* Course switch tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setSelectedCourse('CS601')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedCourse === 'CS601'
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  CS601: Algorithms
                </button>
                <button
                  onClick={() => setSelectedCourse('CS602')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedCourse === 'CS602'
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  CS602: Distributed DB
                </button>
              </div>
            </div>

            {/* Course Card Details */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {selectedCourse === 'CS601'
                      ? 'Design & Analysis of Algorithms (CS601)'
                      : 'Distributed Database Systems & Cloud (CS602)'}
                  </h4>
                  <p className="text-xs text-slate-500">Semester 6 • 4 Credits • Lecture Hall LH-204</p>
                </div>
                <button
                  onClick={() => setShowAttendanceModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Mark Lecture Attendance
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold block">TOTAL CLASSES</span>
                  <span className="text-base font-extrabold text-slate-900">42 Held</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold block">CLASS AVERAGE</span>
                  <span className="text-base font-extrabold text-emerald-600">89.4%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold block">AT RISK (&lt;75%)</span>
                  <span className="text-base font-extrabold text-rose-600">2 Students</span>
                </div>
              </div>

              {/* Low Attendance Warning Strip */}
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span><strong>Low Attendance Alert:</strong> Kunal Verma (71.4%) &amp; Dev Sharma (68.2%) need counseling before exam hall ticket lockout.</span>
                </div>
                <button
                  onClick={() => alert('Official institutional warning notice dispatched to student and parent email.')}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[10px] shrink-0 hover:bg-rose-700 cursor-pointer"
                >
                  Dispatch Notice
                </button>
              </div>
            </div>
          </div>

          {/* STUDENT DOUBT ESCALATIONS (FROM AI & DIRECT) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  Student Academic Doubts & Escalations
                </h3>
                <p className="text-xs text-slate-500">
                  Questions escalated from the AI Subject Tutor requiring professor clarification.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                {studentDoubts.filter((d) => d.status === 'pending').length} Pending Doubts
              </span>
            </div>

            <div className="space-y-3.5">
              {studentDoubts.map((doubt) => (
                <div
                  key={doubt.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{doubt.studentName}</span>
                      <span className="text-[10px] font-mono text-slate-500">({doubt.studentRoll})</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {doubt.subject}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      {doubt.escalatedFromAi && (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          From AI Tutor
                        </span>
                      )}
                      <span className="text-slate-400">{doubt.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    "{doubt.question}"
                  </p>

                  {/* If resolved */}
                  {doubt.status === 'resolved' ? (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                      <span className="font-bold flex items-center gap-1 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Your Professor Clarification:
                      </span>
                      <p className="text-slate-700 pl-4">{doubt.facultyReply}</p>
                    </div>
                  ) : (
                    /* Reply Box */
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Type expert conceptual clarification or reference lecture notes..."
                        value={replyInputMap[doubt.id] || ''}
                        onChange={(e) =>
                          setReplyInputMap({ ...replyInputMap, [doubt.id]: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendDoubtReply(doubt.id);
                        }}
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                      <button
                        onClick={() => handleSendDoubtReply(doubt.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1 shrink-0"
                      >
                        <Send className="w-3 h-3" />
                        Clarify
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACADEMIC ACTIONS & ANNOUNCEMENTS (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* FACULTY ACADEMIC ACTIONS */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Academic Coordination Quick Desk
              </h3>
              <p className="text-xs text-slate-500">
                Manage classroom schedules, hall seat assignments &amp; student permissions.
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => onNavigateTab('exam-seating')}
                className="w-full p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Exam Seating Allocation Desk</h4>
                    <p className="text-[11px] text-slate-600">Inspect hall rosters &amp; seat allotments</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('faculty-permission-queue-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Permission Requests Queue</h4>
                    <p className="text-[11px] text-slate-600">{pendingCountForMentor + pendingCountForHod} pending review</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateTab('calendar')}
                className="w-full p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Academic Schedule &amp; Timetable</h4>
                    <p className="text-[11px] text-slate-600">Semester deadlines &amp; lecture calendar</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* FACULTY ANNOUNCEMENT PUBLISHER */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Publish Academic Notice to Students
            </h3>

            <form onSubmit={handlePostNotice} className="space-y-3">
              <input
                type="text"
                placeholder="Notice Title (e.g. Lab 4 Assignment Due Date)"
                value={newNoticeTitle}
                onChange={(e) => setNewNoticeTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              <textarea
                rows={2}
                placeholder="Describe instructions, syllabus details, or submission guidelines..."
                value={newNoticeContent}
                onChange={(e) => setNewNoticeContent(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Publish to Student Dashboards
              </button>
            </form>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Recently Published Notices
              </span>
              {announcements.map((ann) => {
                const dateDisplay = ann.createdAt
                  ? new Date(ann.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : ((ann as any).date || 'Recent');
                const contentDisplay = ann.description || (ann as any).content || '';

                return (
                  <div key={ann.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span className="line-clamp-1">{ann.title}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">{dateDisplay}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{contentDisplay}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: MARK TODAY'S ATTENDANCE */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Mark Daily Lecture Attendance — {selectedCourse}
                  </h3>
                  <p className="text-xs text-indigo-200">
                    {selectedCourse === 'CS601' ? 'Design & Analysis of Algorithms' : 'Distributed Databases'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAttendance} className="p-6 space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lecture Date:</label>
                  <input
                    type="date"
                    required
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Curriculum Topic Taught:</label>
                  <input
                    type="text"
                    required
                    value={topicTaught}
                    onChange={(e) => setTopicTaught(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Student Roster Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Student Roll Roster ({roster.length} Students)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setRoster((prev) => prev.map((r) => ({ ...r, status: 'present' })))
                      }
                      className="text-[11px] font-bold text-emerald-600 hover:underline cursor-pointer"
                    >
                      Mark All Present
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {roster.map((student) => (
                    <div
                      key={student.id}
                      className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          {student.name}
                          <span className="text-[10px] font-mono text-slate-500 ml-2">
                            {student.rollNumber}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Current Rate: {student.currentAttendancePercent}%
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleAttendanceStatus(student.id, 'present')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            student.status === 'present'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleAttendanceStatus(student.id, 'absent')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            student.status === 'absent'
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleAttendanceStatus(student.id, 'on_duty')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            student.status === 'on_duty'
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          On Duty
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAttendanceModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Save &amp; Broadcast Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REVIEW STUDENT PERMISSION REQUEST & DECISION ACTIONS */}
      {selectedPermRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <FileCheck className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-300">
                      {selectedPermRequest.requestId}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedPermRequest.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : selectedPermRequest.status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {selectedPermRequest.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-0.5 line-clamp-1">
                    {selectedPermRequest.subject}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPermRequest(null);
                  setApprovalRemark('');
                }}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              {/* Student Metadata Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">STUDENT APPLICANT</span>
                  <span className="font-bold text-slate-900 block mt-0.5">{selectedPermRequest.studentName}</span>
                  <span className="text-[10px] font-mono text-slate-500">{selectedPermRequest.rollNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">BRANCH &amp; SECTION</span>
                  <span className="font-bold text-slate-900 block mt-0.5">{selectedPermRequest.section}</span>
                  <span className="text-[10px] text-slate-500 truncate block">{selectedPermRequest.year}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">REQUEST DURATION</span>
                  <span className="font-bold text-slate-900 block mt-0.5">{selectedPermRequest.startDate}</span>
                  <span className="text-[10px] text-slate-500">to {selectedPermRequest.endDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">RECIPIENT ROUTE</span>
                  <span className="font-bold text-indigo-700 block mt-0.5">
                    {selectedPermRequest.recipient === 'mentor'
                      ? 'Mentor Only'
                      : selectedPermRequest.recipient === 'hod'
                      ? 'HOD Only'
                      : 'Mentor + HOD'}
                  </span>
                  <span className="text-[10px] text-slate-500">Submitted: {selectedPermRequest.date}</span>
                </div>
              </div>

              {/* Approval History Timeline */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  Approval &amp; Endorsement Timeline
                </h4>

                <div className="space-y-3 pl-2 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-200">
                  {selectedPermRequest.approvalHistory.map((hist, i) => (
                    <div key={hist.id || i} className="relative pl-6 space-y-0.5">
                      <div className="absolute left-1.5 top-1 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-white" />
                      <div className="flex items-center justify-between font-bold text-slate-900 text-xs">
                        <span>
                          {hist.approverName} ({hist.approverRole.toUpperCase()})
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal">
                          {hist.timestamp}
                        </span>
                      </div>
                      <div className="text-[11px] text-indigo-700 font-medium">
                        Action: {hist.action.replace('_', ' ').toUpperCase()}
                      </div>
                      {hist.remark && (
                        <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 italic mt-1">
                          "{hist.remark}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Formatted Letter Body */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Official Student Letter Document:
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Department of {selectedPermRequest.department}
                  </span>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner">
                  {selectedPermRequest.letterContent}
                </div>
              </div>

              {/* ACTIVE DECISION CONTROLS FOR MENTOR OR HOD */}
              {selectedPermRequest.status !== 'approved' && selectedPermRequest.status !== 'rejected' && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      {facultyPerspective === 'mentor'
                        ? 'Class Mentor Decision Panel'
                        : 'Head of Department (HOD) Final Endorsement Panel'}
                    </span>
                    <span className="text-[10px] font-mono text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      Role Authorized
                    </span>
                  </div>

                  {/* If in HOD view and mentor has already reviewed */}
                  {facultyPerspective === 'hod' && selectedPermRequest.mentorRemark && (
                    <div className="p-2.5 rounded-xl bg-white border border-amber-200 text-[11px] text-slate-700">
                      <strong className="text-amber-900 block mb-0.5">Prior Class Mentor Decision Note:</strong>
                      <span className="italic">"{selectedPermRequest.mentorRemark}"</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Faculty Endorsement Remarks (Recorded in official audit trail):
                    </label>
                    <textarea
                      rows={2}
                      placeholder={
                        facultyPerspective === 'mentor'
                          ? 'Add mentor recommendation notes, lab record clearance, or conditional remarks...'
                          : 'Add HOD official clearance notes, attendance on-duty authorization, or conditions...'
                      }
                      value={approvalRemark}
                      onChange={(e) => setApprovalRemark(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenRejectModal(selectedPermRequest)}
                      className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>Reject Request</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApprovePermission(selectedPermRequest)}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>
                        {facultyPerspective === 'mentor'
                          ? selectedPermRequest.recipient === 'both' || selectedPermRequest.recipient === 'hod'
                            ? 'Approve & Escalate to HOD'
                            : 'Approve as Class Mentor'
                          : 'Grant Final HOD Clearance & Seal'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => permissionLetterService.downloadOfficialPdf(selectedPermRequest)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Official PDF Letter</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedPermRequest(null);
                  setApprovalRemark('');
                }}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MANDATORY REJECTION REMARK REQUIRED */}
      {showRejectModal && selectedPermRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-rose-900 to-rose-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-300" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Reject Permission Request — {selectedPermRequest.requestId}
                  </h3>
                  <p className="text-[11px] text-rose-200">
                    Mandatory rejection reason required by academic policy
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Please provide an institutional reason for rejecting <strong>{selectedPermRequest.studentName}</strong>'s permission letter (e.g., examination conflict, attendance shortage &lt;75%, lack of external verification, or policy restriction).
              </p>

              {rejectError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{rejectError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rejection Reason / Remarks <span className="text-rose-600">*</span>:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Internal Midterm Examination clash on the requested dates. Permission cannot be granted during exam weeks."
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    setRejectError(null);
                  }}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-md shadow-rose-600/30 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>Confirm Rejection</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
