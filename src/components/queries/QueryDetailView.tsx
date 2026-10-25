import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Building2,
  Tag,
  Paperclip,
  Send,
  ShieldCheck,
  User,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  RotateCcw,
  Info,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  Loader2,
  CornerDownRight,
  Sparkles
} from 'lucide-react';
import {
  StudentQuery,
  UserProfile,
  QueryStatus,
  QueryAttachment
} from '../../types';
import {
  studentQueryService,
  QUERY_STATUSES,
  COLLEGE_DEPARTMENTS
} from '../../services/studentQueryService';
import { firebaseDbService } from '../../services/firebaseDbService';

interface QueryDetailViewProps {
  queryId: string;
  currentUser: UserProfile;
  onBack: () => void;
  onQueryUpdated?: (updated: StudentQuery) => void;
}

export const QueryDetailView: React.FC<QueryDetailViewProps> = ({
  queryId,
  currentUser,
  onBack,
  onQueryUpdated
}) => {
  const [queryData, setQueryData] = useState<StudentQuery | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Reply state
  const [replyText, setReplyText] = useState<string>('');
  const [replyAttachment, setReplyAttachment] = useState<QueryAttachment | null>(null);
  const [isSendingReply, setIsSendingReply] = useState<boolean>(false);
  const [replySuccessToast, setReplySuccessToast] = useState<string | null>(null);

  // Admin controls state
  const [adminSelectedStatus, setAdminSelectedStatus] = useState<QueryStatus>('ANSWERED');
  const [adminAssignedDept, setAdminAssignedDept] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [statusChangeRemark, setStatusChangeRemark] = useState<string>('');
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);

  // Toggle timeline expand
  const [showFullTimeline, setShowFullTimeline] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isStaff = currentUser.role === 'admin' || currentUser.role === 'faculty' || currentUser.role === 'coordinator';

  // Load query and subscribe to updates
  useEffect(() => {
    let isMounted = true;

    const fetchQuery = async () => {
      try {
        setLoading(true);
        const data = await firebaseDbService.getStudentQueryById(queryId);
        if (isMounted) {
          if (!data) {
            setError(`Query #${queryId} could not be found.`);
          } else {
            // Security verification: ensure student only views their own query
            if (!isStaff && data.studentUid !== (currentUser.id || currentUser.uid)) {
              setError('Access denied: You are only authorized to view your own queries.');
            } else {
              setQueryData(data);
              setAdminSelectedStatus(data.status);
              setAdminAssignedDept(data.department);
            }
          }
          setLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to retrieve query details.');
          setLoading(false);
        }
      }
    };

    fetchQuery();

    // Set up real-time listener for current query
    const unsub = firebaseDbService.subscribeStudentQueries(queryData?.studentUid || currentUser.id, (queries) => {
      const match = queries.find((q) => q.id === queryId || q.queryId === queryId);
      if (match && isMounted) {
        setQueryData(match);
        setAdminSelectedStatus(match.status);
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, [queryId, currentUser.id, isStaff]);

  // Scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [queryData?.messages?.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReplyAttachment({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        dataUrl: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  // Student or staff sends message
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() && !replyAttachment) return;

    setIsSendingReply(true);
    try {
      if (isStaff) {
        await studentQueryService.adminRespond(
          queryId,
          replyText.trim(),
          adminSelectedStatus,
          currentUser,
          replyAttachment || undefined
        );
      } else {
        await studentQueryService.sendReply(
          queryId,
          replyText.trim(),
          currentUser,
          replyAttachment || undefined
        );
      }

      // Refresh data
      const refreshed = await firebaseDbService.getStudentQueryById(queryId);
      if (refreshed) {
        setQueryData(refreshed);
        if (onQueryUpdated) onQueryUpdated(refreshed);
      }

      setReplyText('');
      setReplyAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      setReplySuccessToast(isStaff ? 'Response dispatched to student successfully!' : 'Message sent successfully.');
      setTimeout(() => setReplySuccessToast(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSendingReply(false);
    }
  };

  // Admin status update action
  const handleUpdateStatusConfirm = async () => {
    setIsUpdatingStatus(true);
    try {
      await studentQueryService.updateStatus(
        queryId,
        adminSelectedStatus,
        currentUser,
        statusChangeRemark
      );

      const refreshed = await firebaseDbService.getStudentQueryById(queryId);
      if (refreshed) {
        setQueryData(refreshed);
        if (onQueryUpdated) onQueryUpdated(refreshed);
      }

      setShowStatusModal(false);
      setStatusChangeRemark('');
      setReplySuccessToast(`Query status officially changed to ${adminSelectedStatus}`);
      setTimeout(() => setReplySuccessToast(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Admin department re-assignment action
  const handleAssignDeptConfirm = async () => {
    if (!adminAssignedDept) return;
    setIsUpdatingStatus(true);
    try {
      await studentQueryService.assignDepartment(
        queryId,
        adminAssignedDept,
        currentUser
      );

      const refreshed = await firebaseDbService.getStudentQueryById(queryId);
      if (refreshed) {
        setQueryData(refreshed);
        if (onQueryUpdated) onQueryUpdated(refreshed);
      }

      setShowAssignModal(false);
      setReplySuccessToast(`Query re-assigned to ${adminAssignedDept}`);
      setTimeout(() => setReplySuccessToast(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to re-assign department');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
        <p className="text-sm font-bold text-slate-700">Loading query details from Firestore...</p>
      </div>
    );
  }

  if (error || !queryData) {
    return (
      <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center space-y-4 shadow-xs">
        <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-slate-900">Query Unavailable</h3>
          <p className="text-xs text-rose-600 max-w-md mx-auto">{error || 'Record could not be found.'}</p>
        </div>
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Queries</span>
        </button>
      </div>
    );
  }

  const currentStatusMeta = QUERY_STATUSES.find((s) => s.key === queryData.status) || QUERY_STATUSES[0];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {replySuccessToast && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>{replySuccessToast}</span>
          </div>
          <button onClick={() => setReplySuccessToast(null)} className="p-1 hover:bg-white/20 rounded">
            ✕
          </button>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Return to query list"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                  {queryData.queryId}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border flex items-center gap-1.5 ${currentStatusMeta.badgeClass}`}>
                  <span className={`w-2 h-2 rounded-full ${currentStatusMeta.dotColor}`} />
                  <span>{currentStatusMeta.label}</span>
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Filed on {new Date(queryData.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {queryData.title}
              </h1>
            </div>
          </div>

          {/* Admin Action Buttons */}
          {isStaff && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setShowStatusModal(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-200" />
                <span>Change Status</span>
              </button>
              <button
                onClick={() => setShowAssignModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Building2 className="w-4 h-4 text-slate-600" />
                <span>Assign Dept</span>
              </button>
            </div>
          )}
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Category</span>
            <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">{queryData.category}</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Jurisdiction</span>
            <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">{queryData.department}</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Submitted By</span>
            <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">{queryData.studentName} {queryData.studentRollNumber ? `(${queryData.studentRollNumber})` : ''}</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Last Updated</span>
            <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">{new Date(queryData.updatedAt || queryData.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </span>
          </div>
        </div>

        {/* Needs Information Callout if status is NEEDS INFORMATION */}
        {queryData.status === 'NEEDS INFORMATION' && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-black text-rose-900 uppercase tracking-wider">
                  Action Required: Additional Information Requested
                </h4>
                <p className="text-xs text-rose-800">
                  The administrator requested clarification or supporting documents. Please review the conversation below and post your response to resume processing.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                document.getElementById('query-reply-textarea')?.focus();
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
            >
              Provide Information Below ↓
            </button>
          </div>
        )}

        {/* Visual Workflow Steps */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
            <span>Ticket Resolution Progress</span>
            <button
              type="button"
              onClick={() => setShowFullTimeline(!showFullTimeline)}
              className="text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1"
            >
              <span>{showFullTimeline ? 'Hide History Logs' : `View Status Audit (${queryData.statusHistory?.length || 1})`}</span>
              {showFullTimeline ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {['SUBMITTED', 'UNDER REVIEW', 'ANSWERED', 'CLOSED'].map((stKey, idx) => {
              const isPastOrCurrent =
                (stKey === 'SUBMITTED') ||
                (stKey === 'UNDER REVIEW' && queryData.status !== 'SUBMITTED') ||
                (stKey === 'ANSWERED' && (queryData.status === 'ANSWERED' || queryData.status === 'CLOSED')) ||
                (stKey === 'CLOSED' && queryData.status === 'CLOSED');
              const isCurrent = queryData.status === stKey;

              return (
                <div
                  key={stKey}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isCurrent
                      ? 'bg-indigo-600 text-white border-indigo-600 font-black shadow-xs'
                      : isPastOrCurrent
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
                      : 'bg-slate-50 text-slate-400 border-slate-200/80 font-medium'
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wider">{`Step ${idx + 1}`}</div>
                  <div className="text-xs truncate">{stKey}</div>
                </div>
              );
            })}
          </div>

          {/* Audit Logs History Tray */}
          {showFullTimeline && queryData.statusHistory && queryData.statusHistory.length > 0 && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
              <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Full Status Change &amp; Jurisdiction Audit Ledger
              </h5>
              <div className="space-y-2">
                {queryData.statusHistory.map((hist, i) => (
                  <div key={hist.id || i} className="text-xs flex items-start gap-2.5 text-slate-600 border-l-2 border-indigo-500 pl-3 py-1">
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">
                      {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(hist.timestamp).toLocaleDateString()}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900">{hist.changedByName}</span>{' '}
                      <span className="text-slate-500">({hist.changedByRole})</span>:{' '}
                      <span className="font-semibold text-indigo-700">{hist.status}</span>{' '}
                      {hist.note && <span className="text-slate-600">— {hist.note}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conversation Thread & Original Question */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-extrabold text-slate-900">
              Conversation &amp; Administrative Responses ({queryData.messages?.length || 1})
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Direct Linked Thread
          </span>
        </div>

        {/* Messages List */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[600px] overflow-y-auto bg-slate-50/30">
          {queryData.messages && queryData.messages.map((msg, index) => {
            const isStudent = msg.senderRole === 'student';

            return (
              <div
                key={msg.id || index}
                className={`flex gap-3 sm:gap-4 ${isStudent ? 'justify-start' : 'justify-end'}`}
              >
                {/* Student Avatar */}
                {isStudent && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-2xl rounded-3xl p-4 sm:p-5 shadow-xs space-y-2.5 ${
                    isStudent
                      ? 'bg-white border border-slate-200 text-slate-800'
                      : 'bg-indigo-900 text-white border border-indigo-950'
                  }`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center justify-between gap-3 text-xs border-b pb-2 ${isStudent ? 'border-slate-100' : 'border-indigo-800'}">
                    <div className="flex items-center gap-2">
                      <span className={`font-black ${isStudent ? 'text-slate-900' : 'text-indigo-100'}`}>
                        {msg.senderName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isStudent
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-indigo-700 text-indigo-200 border border-indigo-500/30'
                        }`}
                      >
                        {isStudent ? 'Student' : 'Official Administration'}
                      </span>
                    </div>

                    <span className={`font-mono text-[10px] ${isStudent ? 'text-slate-400' : 'text-indigo-300'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                      {new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {/* Message Content */}
                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-normal">
                    {msg.message}
                  </div>

                  {/* Attached Document in Message */}
                  {msg.attachment && (
                    <div
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                        isStudent
                          ? 'bg-slate-50 border-slate-200 text-slate-800'
                          : 'bg-indigo-950/60 border-indigo-800 text-indigo-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Paperclip className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="font-semibold truncate">{msg.attachment.name}</span>
                        <span className="text-[10px] opacity-75">
                          ({(msg.attachment.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>

                      {msg.attachment.dataUrl && (
                        <a
                          href={msg.attachment.dataUrl}
                          download={msg.attachment.name}
                          className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>View/Download</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Admin Avatar */}
                {!isStudent && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs shadow-indigo-600/30">
                    <ShieldCheck className="w-4 h-4 text-indigo-100" />
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Box Footer */}
        {queryData.status === 'CLOSED' ? (
          <div className="p-5 bg-slate-100 border-t border-slate-200 text-center text-xs text-slate-500 font-medium">
            🔒 This inquiry has been resolved and closed. If you have an unrelated question, please submit a new query.
          </div>
        ) : (
          <form onSubmit={handleSendReply} className="p-4 sm:p-6 bg-white border-t border-slate-200 space-y-3">
            {/* Staff status selector shortcut before replying */}
            {isStaff && (
              <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Update status with this response:</span>
                </span>
                <select
                  value={adminSelectedStatus}
                  onChange={(e) => setAdminSelectedStatus(e.target.value as QueryStatus)}
                  className="px-3 py-1.5 rounded-xl border border-indigo-300 bg-white text-xs font-bold text-indigo-900 focus:outline-hidden"
                >
                  {QUERY_STATUSES.map((st) => (
                    <option key={st.key} value={st.key}>
                      {st.label} ({st.key})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="relative">
              <textarea
                id="query-reply-textarea"
                rows={3}
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={
                  isStaff
                    ? 'Type official administrative answer, resolution details, or request additional information...'
                    : queryData.status === 'NEEDS INFORMATION'
                    ? 'Provide the requested details or answers for the administration...'
                    : 'Type clarification or reply to the administration...'
                }
                className="w-full p-4 pr-12 rounded-2xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-xs sm:text-sm font-medium focus:outline-hidden transition-all"
              />
            </div>

            {/* Optional Attachment in reply */}
            {replyAttachment && (
              <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-semibold text-slate-800 truncate">{replyAttachment.name}</span>
                  <span className="text-[10px] text-slate-500">({(replyAttachment.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyAttachment(null)}
                  className="p-1 text-slate-500 hover:text-rose-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg,.docx"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Attach Document</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isSendingReply || (!replyText.trim() && !replyAttachment)}
                className={`px-6 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                  isSendingReply || (!replyText.trim() && !replyAttachment)
                    ? 'bg-slate-300 text-white cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
                }`}
              >
                {isSendingReply ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-indigo-200" />
                    <span>{isStaff ? 'Dispatch Response' : 'Send Reply'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Modal 1: Admin Change Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>Update Ticket Status</span>
            </h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">New Status</label>
              <select
                value={adminSelectedStatus}
                onChange={(e) => setAdminSelectedStatus(e.target.value as QueryStatus)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                {QUERY_STATUSES.map((st) => (
                  <option key={st.key} value={st.key}>
                    {st.label} — {st.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Administrative Log Note (Optional)</label>
              <textarea
                rows={3}
                value={statusChangeRemark}
                onChange={(e) => setStatusChangeRemark(e.target.value)}
                placeholder="Reason for status change or internal notes..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStatusConfirm}
                disabled={isUpdatingStatus}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-xs"
              >
                {isUpdatingStatus ? 'Saving...' : 'Apply Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Admin Assign Department Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <span>Assign to Department</span>
            </h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Designated Department</label>
              <select
                value={adminAssignedDept}
                onChange={(e) => setAdminAssignedDept(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                {COLLEGE_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignDeptConfirm}
                disabled={isUpdatingStatus}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-xs"
              >
                {isUpdatingStatus ? 'Assigning...' : 'Assign Department'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
