import React, { useState, useEffect } from 'react';
import {
  FileText,
  Send,
  Save,
  RotateCcw,
  Undo2,
  Redo2,
  Eye,
  Edit3,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Download,
  Calendar,
  User,
  Building2,
  Sparkles,
  HelpCircle,
  FileCheck,
  ChevronRight,
  Info,
  Layers,
  ArrowRight,
  Bold,
  Italic,
  List,
  Upload,
  Loader2,
  Paperclip,
  Check
} from 'lucide-react';
import { firebaseStorageService } from '../../services/firebaseStorageService';
import {
  UserProfile,
  PermissionRequest,
  PermissionRecipient,
  PermissionRequestStatus
} from '../../types';
import {
  permissionLetterService
} from '../../services/permissionLetterService';
import {
  QUICK_PERMISSION_PRESETS
} from '../../data/permissionLetterData';

interface PermissionLetterTabProps {
  currentUser: UserProfile;
  onNavigateTab?: (tab: string) => void;
}

export const PermissionLetterTab: React.FC<PermissionLetterTabProps> = ({
  currentUser,
  onNavigateTab
}) => {
  // Mode: 'editor' | 'preview'
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');

  // Today's date YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const threeDaysLaterStr = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

  // Form Fields - Minimal & Auto-populated from student profile
  const [date, setDate] = useState<string>(todayStr);
  const [recipient, setRecipient] = useState<PermissionRecipient>('both');
  const [subject, setSubject] = useState<string>('Permission to Attend National Hackathon / Coding Duel');
  const [reason, setReason] = useState<string>(
    'Selected to represent the college in an inter-university 36-hour hackathon competition. Will build project and pitch to industry judges.'
  );
  const [startDate, setStartDate] = useState<string>(tomorrowStr);
  const [endDate, setEndDate] = useState<string>(threeDaysLaterStr);
  const [additionalInformation, setAdditionalInformation] = useState<string>(
    'Official invitation letter from the organizers and travel itineraries have been verified.'
  );

  // Student Profile details (Auto-filled)
  const studentName = currentUser.name || 'Likith E.';
  const rollNumber = currentUser.rollNumber || '22CS084';
  const department = currentUser.department || 'Computer Science & Engineering';
  const year = currentUser.year || `Year ${Math.ceil((currentUser.semester || 6) / 2)} (Sem ${currentUser.semester || 6})`;
  const section = currentUser.section || 'Section A';

  // Live Letter Content (Synchronized with form or directly editable)
  const [letterContent, setLetterContent] = useState<string>('');
  const [activeDraftId, setActiveDraftId] = useState<string | undefined>(undefined);

  // Undo / Redo history for notepad
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Attachment upload to Firebase Storage
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [isUploadingAttachment, setIsUploadingAttachment] = useState<boolean>(false);
  const [attachmentProgress, setAttachmentProgress] = useState<number>(0);

  // Requests History List
  const [myRequests, setMyRequests] = useState<PermissionRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'draft'>('all');

  // Submit Confirmation Modal
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);

  // Detail Modal for viewing a submitted request
  const [selectedRequest, setSelectedRequest] = useState<PermissionRequest | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info' | 'error';
    requestId?: string;
  } | null>(null);

  // Synchronize the template letter content when form inputs change
  const refreshLetterFromInputs = () => {
    const text = permissionLetterService.generateLetterTemplate({
      date,
      recipient,
      studentName,
      rollNumber,
      department,
      year,
      section,
      subject,
      reason,
      startDate,
      endDate,
      additionalInformation
    });
    setLetterContent(text);
    pushToHistory(text);
  };

  // Push state to undo/redo history
  const pushToHistory = (newText: string) => {
    setHistory((prev) => {
      const upToCurrent = prev.slice(0, historyIndex + 1);
      return [...upToCurrent, newText];
    });
    setHistoryIndex((prev) => prev + 1);
  };

  const handleLetterChange = (newText: string) => {
    setLetterContent(newText);
    pushToHistory(newText);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setLetterContent(history[prevIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setLetterContent(history[nextIdx]);
    }
  };

  // Load requests on mount & live Firestore sync
  useEffect(() => {
    loadStudentRequests();
    const unsub = permissionLetterService.subscribeRequests(() => {
      loadStudentRequests();
    });
    return () => unsub();
  }, [currentUser.id, currentUser.rollNumber]);

  useEffect(() => {
    // Initialize letter content
    const initialText = permissionLetterService.generateLetterTemplate({
      date,
      recipient,
      studentName,
      rollNumber,
      department,
      year,
      section,
      subject,
      reason,
      startDate,
      endDate,
      additionalInformation
    });
    setLetterContent(initialText);
    setHistory([initialText]);
    setHistoryIndex(0);
  }, [currentUser.id]);

  const loadStudentRequests = () => {
    const reqs = permissionLetterService.getStudentRequests(currentUser.id, currentUser.rollNumber);
    setMyRequests(reqs);
  };

  // Quick preset apply
  const handleApplyPreset = (preset: typeof QUICK_PERMISSION_PRESETS[0]) => {
    setSubject(preset.subject);
    setReason(preset.reason);
    setRecipient(preset.recipient);

    const start = new Date(Date.now() + 86400000);
    const end = new Date(Date.now() + preset.daysCount * 86400000);
    const sStr = start.toISOString().split('T')[0];
    const eStr = end.toISOString().split('T')[0];
    setStartDate(sStr);
    setEndDate(eStr);

    const generated = permissionLetterService.generateLetterTemplate({
      date,
      recipient: preset.recipient,
      studentName,
      rollNumber,
      department,
      year,
      section,
      subject: preset.subject,
      reason: preset.reason,
      startDate: sStr,
      endDate: eStr,
      additionalInformation
    });
    setLetterContent(generated);
    pushToHistory(generated);

    setToastMessage({
      text: `Preset applied: ${preset.label}. Feel free to fine-tune before submitting.`,
      type: 'info'
    });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Save draft
  const handleSaveDraft = () => {
    try {
      const saved = permissionLetterService.submitOrSaveRequest(
        {
          studentId: currentUser.id,
          studentName,
          rollNumber,
          department,
          year,
          section,
          recipient,
          date,
          subject: subject.trim() || 'Untitled Permission Request',
          reason: reason.trim() || 'Not specified',
          startDate,
          endDate,
          additionalInformation,
          letterContent,
          status: 'draft'
        },
        true,
        activeDraftId
      );
      setActiveDraftId(saved.requestId);
      loadStudentRequests();
      setToastMessage({
        text: `Draft saved successfully! (Ref: ${saved.requestId})`,
        type: 'success',
        requestId: saved.requestId
      });
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving draft';
      setToastMessage({ text: msg, type: 'error' });
    }
  };

  // Trigger submission confirmation
  const handleOpenSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setToastMessage({ text: 'Please enter a subject for the permission letter.', type: 'error' });
      return;
    }
    if (!reason.trim()) {
      setToastMessage({ text: 'Please enter the reason for permission.', type: 'error' });
      return;
    }
    if (!startDate || !endDate) {
      setToastMessage({ text: 'Please specify the start and end dates.', type: 'error' });
      return;
    }
    setShowSubmitModal(true);
  };

  // Confirm and submit request
  const handleConfirmSubmit = () => {
    try {
      const submitted = permissionLetterService.submitOrSaveRequest(
        {
          studentId: currentUser.id,
          studentName,
          rollNumber,
          department,
          year,
          section,
          recipient,
          date,
          subject,
          reason,
          startDate,
          endDate,
          additionalInformation,
          letterContent,
          status: recipient === 'hod' ? 'pending_hod' : 'pending_mentor'
        },
        false,
        activeDraftId
      );

      setShowSubmitModal(false);
      setActiveDraftId(undefined);
      loadStudentRequests();
      setSelectedRequest(submitted);

      setToastMessage({
        text: `Permission Request ${submitted.requestId} submitted successfully to ${
          recipient === 'mentor'
            ? 'Class Mentor'
            : recipient === 'hod'
            ? 'Head of Department'
            : 'Class Mentor & HOD'
        }!`,
        type: 'success',
        requestId: submitted.requestId
      });

      // Reset form to defaults
      setSubject('');
      setReason('');
      setAdditionalInformation('');
      refreshLetterFromInputs();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error submitting request';
      setToastMessage({ text: msg, type: 'error' });
    }
  };

  // Continue editing a draft
  const handleEditDraft = (draft: PermissionRequest) => {
    setActiveDraftId(draft.requestId);
    setDate(draft.date);
    setRecipient(draft.recipient);
    setSubject(draft.subject);
    setReason(draft.reason);
    setStartDate(draft.startDate);
    setEndDate(draft.endDate);
    setAdditionalInformation(draft.additionalInformation || '');
    setLetterContent(draft.letterContent);
    setViewMode('editor');
    setSelectedRequest(null);
  };

  // Filtered requests
  const filteredRequests = myRequests.filter((r) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'draft') return r.status === 'draft';
    if (statusFilter === 'approved') return r.status === 'approved';
    if (statusFilter === 'rejected') return r.status === 'rejected';
    if (statusFilter === 'pending') {
      return (
        r.status === 'pending_mentor' ||
        r.status === 'pending_hod' ||
        r.status === 'mentor_approved'
      );
    }
    return true;
  });

  const getStatusBadge = (status: PermissionRequestStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Rejected
          </span>
        );
      case 'pending_hod':
      case 'mentor_approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            Mentor Approved • Pending HOD
          </span>
        );
      case 'pending_mentor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending Mentor Review
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            Draft
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white'
              : toastMessage.type === 'info'
              ? 'bg-indigo-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-white shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-white/20 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl border border-indigo-900/60 p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1">
                <FileSignatureIcon className="w-3.5 h-3.5 text-indigo-300" />
                Digital Permission Letter Module
              </span>
              <span className="text-xs text-slate-400 font-mono">1-2 Minute Express Workflow</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Instant Academic Permission Letter
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Create, customize, and submit formal permission requests to your <strong className="text-white">Class Mentor</strong> and <strong className="text-white">Head of Department (HOD)</strong>. Pre-filled with your verified student profile, roll number, department, and section.
            </p>
          </div>

          {/* Quick Stats on student's requests */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 text-center min-w-[90px]">
              <span className="text-[10px] text-slate-400 block font-semibold">TOTAL FILED</span>
              <span className="text-2xl font-black text-white">{myRequests.length}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-center min-w-[90px]">
              <span className="text-[10px] text-emerald-300 block font-semibold">APPROVED</span>
              <span className="text-2xl font-black text-emerald-400">
                {myRequests.filter((r) => r.status === 'approved').length}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-center min-w-[90px]">
              <span className="text-[10px] text-amber-300 block font-semibold">IN REVIEW</span>
              <span className="text-2xl font-black text-amber-400">
                {
                  myRequests.filter(
                    (r) =>
                      r.status === 'pending_mentor' ||
                      r.status === 'pending_hod' ||
                      r.status === 'mentor_approved'
                  ).length
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Interface: Left is Form/Presets, Right is Notepad Editor & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Presets (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Quick-Fill Reason Presets */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Quick-Fill Common Letter Presets
              </h3>
              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                1-Click Setup
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Click any chip below to instantly populate reason, dates, recipient, and official phrasing:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUICK_PERMISSION_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/70 text-left transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-950 flex items-center justify-between">
                    <span>{preset.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5 line-clamp-1">
                    {preset.recipient === 'both' ? 'Mentor + HOD' : 'Mentor Clearance'} • {preset.daysCount} Days
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Minimal Form Fields Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-indigo-600" />
                  Letter Parameters
                </h3>
                <p className="text-[11px] text-slate-500">
                  Profile data is pre-locked. Edit only what is necessary.
                </p>
              </div>
              <button
                type="button"
                onClick={refreshLetterFromInputs}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                title="Regenerate letter template from current fields"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Sync to Notepad</span>
              </button>
            </div>

            <form onSubmit={handleOpenSubmitModal} className="space-y-4 text-xs">
              {/* Auto-filled Student Profile Card */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Auto-Filled Student Credentials:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Student Name:</span>
                    <span className="font-bold text-slate-900">{studentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Roll Number:</span>
                    <span className="font-bold text-slate-900 font-mono">{rollNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Department / Branch:</span>
                    <span className="font-semibold text-slate-800 truncate block">{department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Year &amp; Section:</span>
                    <span className="font-semibold text-slate-800">{year} • {section}</span>
                  </div>
                </div>
              </div>

              {/* Date & Recipient */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date of Request:
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                    }}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    To (Recipient):
                  </label>
                  <select
                    value={recipient}
                    onChange={(e) => {
                      setRecipient(e.target.value as PermissionRecipient);
                    }}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
                  >
                    <option value="mentor">Class Mentor (Dr. Priya Swaminathan)</option>
                    <option value="hod">Head of Department (Dr. K. V. Ramanathan)</option>
                    <option value="both">Class Mentor &amp; HOD (Hierarchical)</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subject of Permission:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Permission to Attend National Hackathon"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
                />
              </div>

              {/* Reason for Permission */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Permission (Main Statement):
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Clearly state the academic, medical, or event reason..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden leading-relaxed"
                />
              </div>

              {/* Date Range: Permission From & Until */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Permission From:
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Permission Until:
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Additional Information (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Additional Information / Enclosures:</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Attached invitation letter, team roster, or medical certificate details..."
                  value={additionalInformation}
                  onChange={(e) => setAdditionalInformation(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Upload Supporting Enclosure (Firebase Storage) */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Upload Supporting Proof / Certificate (Cloud Storage)</span>
                  </label>
                  <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    Firebase Storage
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs inline-flex items-center gap-1.5">
                    {isUploadingAttachment ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                    <span>{isUploadingAttachment ? `Uploading (${attachmentProgress}%)...` : 'Choose Enclosure'}</span>
                    <input
                      type="file"
                      accept=".pdf,image/*,.docx"
                      disabled={isUploadingAttachment}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploadingAttachment(true);
                        setAttachmentProgress(10);
                        try {
                          const res = await firebaseStorageService.uploadPermissionAttachment(file, (p) => setAttachmentProgress(p));
                          setAttachmentUrl(res.downloadUrl);
                          setAttachmentName(file.name);
                          setIsUploadingAttachment(false);
                          setAdditionalInformation((prev) =>
                            prev ? `${prev}\n[Attached: ${file.name} - ${res.downloadUrl}]` : `[Attached: ${file.name} - ${res.downloadUrl}]`
                          );
                          setToastMessage({
                            text: `Attached "${file.name}" to request via Firebase Storage!`,
                            type: 'success'
                          });
                        } catch (err) {
                          console.error('Attachment upload failed:', err);
                          setIsUploadingAttachment(false);
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  {attachmentName && (
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 truncate max-w-[200px]">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      {attachmentName}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Save className="w-4 h-4 text-slate-500" />
                  <span>Save Draft</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode(viewMode === 'editor' ? 'preview' : 'editor')}
                  className="py-2.5 px-3 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-indigo-600" />
                  <span>{viewMode === 'editor' ? 'Preview' : 'Edit'}</span>
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Notepad Editor & Official Letterhead Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Notepad Header Bar with View Switcher & Undo/Redo */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('editor')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'editor'
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Notepad Editor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'preview'
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Official Letterhead Preview</span>
                </button>
              </div>

              {activeDraftId && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Editing: {activeDraftId}
                </span>
              )}
            </div>

            {/* Editor Tools */}
            {viewMode === 'editor' && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  title="Undo"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  title="Redo"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-slate-200 mx-1" />
                <button
                  type="button"
                  onClick={refreshLetterFromInputs}
                  className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  title="Reset letter text to standard template"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Template</span>
                </button>
              </div>
            )}
          </div>

          {/* VIEW: NOTEPAD EDITOR */}
          {viewMode === 'editor' ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col min-h-[520px]">
              {/* Notepad Yellowish / Clean Header */}
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="font-semibold text-slate-700 ml-2">
                    Permission_Letter_Draft.txt
                  </span>
                </div>
                <span>{letterContent.length} characters</span>
              </div>

              {/* Editable Notepad Area */}
              <div className="p-6 flex-1 flex flex-col relative bg-white">
                <textarea
                  value={letterContent}
                  onChange={(e) => handleLetterChange(e.target.value)}
                  className="w-full flex-1 min-h-[460px] text-xs sm:text-sm font-mono text-slate-800 focus:outline-hidden resize-none leading-relaxed p-2"
                  placeholder="Permission letter content appears here..."
                />
              </div>

              {/* Bottom Quick Action Bar */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500">
                  Tip: You can edit any part of the letter freely above before submitting.
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('preview')}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Letter</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenSubmitModal}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Proceed to Submit</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* VIEW: OFFICIAL LETTERHEAD PREVIEW */
            <div className="bg-white rounded-3xl border border-slate-300 shadow-md p-8 sm:p-10 space-y-6 relative overflow-hidden min-h-[520px]">
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                <Building2 className="w-96 h-96 text-slate-900" />
              </div>

              {/* University Letterhead Header */}
              <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                    🏛️
                  </span>
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">
                    Apex University of Technology
                  </h2>
                </div>
                <p className="text-[11px] font-semibold tracking-wider text-slate-600 uppercase">
                  Department of {department}
                </p>
                <p className="text-[10px] text-slate-400">
                  Campus Academic Clearance &amp; Student Mentorship Office • Institutional Portal
                </p>
              </div>

              {/* Reference Bar */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-mono py-1 border-b border-slate-100">
                <span>REF: {activeDraftId || 'REQ-2026-PL-PREVIEW'}</span>
                <span>DATE: {date}</span>
              </div>

              {/* Letter Body Preview */}
              <div className="text-xs sm:text-sm text-slate-800 font-sans leading-relaxed whitespace-pre-wrap space-y-3">
                {letterContent}
              </div>

              {/* Official Seal / Signature Placeholder Box */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-4 text-center text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-semibold">STUDENT APPLICANT</span>
                  <div className="font-bold text-slate-900 mt-2">{studentName}</div>
                  <div className="text-[10px] font-mono text-slate-500">{rollNumber}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-semibold">CLASS MENTOR</span>
                  <div className="font-semibold text-slate-700 mt-2">Dr. Priya Swaminathan</div>
                  <div className="text-[10px] text-amber-600 font-bold">Awaiting Submission</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 block font-semibold">HOD ENDORSEMENT</span>
                  <div className="font-semibold text-slate-700 mt-2">Dr. K. V. Ramanathan</div>
                  <div className="text-[10px] text-slate-400">Department Seal</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setViewMode('editor')}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Back to Edit</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Draft</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenSubmitModal}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit to Faculty</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* STUDENT REQUEST HISTORY SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              My Permission Requests History
            </h2>
            <p className="text-xs text-slate-500">
              Track real-time approval stages, mentor reviews, and official departmental remarks.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            {(['all', 'pending', 'approved', 'rejected', 'draft'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer uppercase tracking-wider text-[10px] ${
                  statusFilter === filter
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {filter === 'all' ? 'All Requests' : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          {filteredRequests.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Permission Duration</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr
                    key={req.requestId}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setSelectedRequest(req)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 whitespace-nowrap">
                      {req.requestId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{req.date}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-[240px] truncate">
                      {req.subject}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {req.startDate} → {req.endDate}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {req.recipient === 'mentor'
                          ? 'Class Mentor'
                          : req.recipient === 'hod'
                          ? 'HOD'
                          : 'Mentor + HOD'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(req.status)}</td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedRequest(req)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          View Letter
                        </button>
                        {req.status === 'draft' && (
                          <button
                            type="button"
                            onClick={() => handleEditDraft(req)}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                        )}
                        {req.status === 'approved' && (
                          <button
                            type="button"
                            onClick={() => permissionLetterService.downloadOfficialPdf(req)}
                            className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 cursor-pointer"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">No Permission Letters Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {statusFilter === 'all'
                  ? 'You have not submitted any permission letters yet. Use the editor above to create one in under 2 minutes.'
                  : `No permission letters matching status filter: "${statusFilter}".`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CONFIRMATION SUBMIT MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3">
                <Send className="w-6 h-6 text-indigo-300" />
              </div>
              <h3 className="text-lg font-bold text-white">Confirm Permission Submission</h3>
              <p className="text-xs text-indigo-200 mt-1">
                Are you sure you want to submit this permission request?
              </p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">SUBJECT</span>
                  <span className="font-bold text-slate-900">{subject}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">RECIPIENT</span>
                    <span className="font-semibold text-slate-800">
                      {recipient === 'mentor'
                        ? 'Class Mentor'
                        : recipient === 'hod'
                        ? 'HOD'
                        : 'Mentor & HOD'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">DURATION</span>
                    <span className="font-semibold text-slate-800">
                      {startDate} → {endDate}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Once submitted, a unique <strong className="text-slate-800">Permission Request ID</strong> will be generated. Your assigned Class Mentor will receive a real-time notification on their faculty teaching dashboard to review and approve.
              </p>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel / Edit
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Yes, Submit Request</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL: VIEW COMPLETE LETTER & TIMELINE */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-300">
                      {selectedRequest.requestId}
                    </span>
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                  <h3 className="text-sm font-bold text-white mt-0.5 line-clamp-1">
                    {selectedRequest.subject}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              {/* Approval History Timeline */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  Approval &amp; Endorsement History
                </h4>

                <div className="space-y-3 pl-2 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {selectedRequest.approvalHistory.map((hist, i) => (
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
                        Action:{' '}
                        {hist.action.replace('_', ' ').toUpperCase()}
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

              {/* Complete Formatted Letter Text */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Official Letter Content:
                </span>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {selectedRequest.letterContent}
                </div>
              </div>

              {/* Remarks highlight */}
              {(selectedRequest.mentorRemark || selectedRequest.hodRemark) && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  {selectedRequest.mentorRemark && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-0.5">
                      <div className="font-bold text-[11px] text-amber-900">
                        Class Mentor Decision Note:
                      </div>
                      <p className="text-xs italic">"{selectedRequest.mentorRemark}"</p>
                    </div>
                  )}
                  {selectedRequest.hodRemark && (
                    <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950 space-y-0.5">
                      <div className="font-bold text-[11px] text-indigo-900">
                        Head of Department (HOD) Endorsement Note:
                      </div>
                      <p className="text-xs italic">"{selectedRequest.hodRemark}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] text-slate-400 font-mono">
                Student Access: Read-only status
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => permissionLetterService.downloadOfficialPdf(selectedRequest)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Letter</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function FileSignatureIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 19.5v.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8.5L20 7.5V13" />
      <path d="M14 2v6h6" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  );
}
