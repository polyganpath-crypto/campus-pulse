import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Paperclip,
  X,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Clock,
  Sparkles,
  RotateCcw,
  Building2,
  Tag,
  Loader2,
  Info
} from 'lucide-react';
import { UserProfile, QueryCategory, QueryAttachment, StudentQuery } from '../../types';
import {
  studentQueryService,
  QUERY_CATEGORIES,
  COLLEGE_DEPARTMENTS,
  QuerySubmissionPayload
} from '../../services/studentQueryService';

interface StudentQuerySubmissionFormProps {
  currentUser: UserProfile;
  onSuccess: (newQuery: StudentQuery) => void;
  onCancel?: () => void;
}

export const StudentQuerySubmissionForm: React.FC<StudentQuerySubmissionFormProps> = ({
  currentUser,
  onSuccess,
  onCancel
}) => {
  // Form fields
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<QueryCategory>('Academics');
  const [otherCategoryDetail, setOtherCategoryDetail] = useState<string>('');
  const [department, setDepartment] = useState<string>('Academic Affairs Directorate');
  const [attachment, setAttachment] = useState<QueryAttachment | null>(null);

  // Status and feedback
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successQuery, setSuccessQuery] = useState<StudentQuery | null>(null);
  const [draftRestoredNotice, setDraftRestoredNotice] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore draft from localStorage if available
  useEffect(() => {
    const draft = studentQueryService.getDraft();
    if (draft && (draft.title || draft.description)) {
      if (draft.title) setTitle(draft.title);
      if (draft.description) setDescription(draft.description);
      if (draft.category) setCategory(draft.category);
      if (draft.otherCategoryDetail) setOtherCategoryDetail(draft.otherCategoryDetail);
      if (draft.department) setDepartment(draft.department);
      if (draft.attachment) setAttachment(draft.attachment);
      setDraftRestoredNotice(true);
      setTimeout(() => setDraftRestoredNotice(false), 5000);
    }
  }, []);

  // Auto-save draft as student types
  useEffect(() => {
    if (!successQuery) {
      studentQueryService.saveDraft({
        title,
        description,
        category,
        otherCategoryDetail,
        department,
        attachment: attachment || undefined
      });
    }
  }, [title, description, category, otherCategoryDetail, department, attachment, successQuery]);

  const handleClearDraft = () => {
    studentQueryService.clearDraft();
    setTitle('');
    setDescription('');
    setCategory('Academics');
    setOtherCategoryDetail('');
    setDepartment('Academic Affairs Directorate');
    setAttachment(null);
    setValidationErrors({});
    setSubmitError(null);
  };

  // Handle file attachment upload & Base64 encoding
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setValidationErrors((prev) => ({
        ...prev,
        attachment: 'File size exceeds 5MB limit. Please upload a smaller document.'
      }));
      return;
    }

    // Validate extension
    const allowed = ['.pdf', '.png', '.jpg', '.jpeg', '.docx', '.doc'];
    const fileNameLower = file.name.toLowerCase();
    const isAllowed = allowed.some((ext) => fileNameLower.endsWith(ext));
    if (!isAllowed) {
      setValidationErrors((prev) => ({
        ...prev,
        attachment: 'Allowed file formats: PDF, PNG, JPG, or DOCX documents.'
      }));
      return;
    }

    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next.attachment;
      return next;
    });

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        dataUrl: reader.result as string
      });
    };
    reader.onerror = () => {
      setValidationErrors((prev) => ({
        ...prev,
        attachment: 'Failed to read file. Please try again.'
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const payload: QuerySubmissionPayload = {
      title,
      description,
      category,
      otherCategoryDetail: category === 'Other' ? otherCategoryDetail : undefined,
      department,
      attachment: attachment || undefined
    };

    // Client-side validation
    const validation = studentQueryService.validateQuery(payload);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    setValidationErrors({});

    setIsSubmitting(true);

    try {
      const created = await studentQueryService.submitQuery(payload, currentUser);
      setSuccessQuery(created);
      setIsSubmitting(false);

      // Trigger success callback after showing feedback
      setTimeout(() => {
        onSuccess(created);
      }, 1800);
    } catch (err: unknown) {
      setIsSubmitting(false);
      const msg = err instanceof Error ? err.message : 'Database communication failed. Your draft has been preserved.';
      setSubmitError(msg);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Form Header */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Student Inquiry &amp; Grievance Portal</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentUser.rollNumber ? `PRN: ${currentUser.rollNumber}` : currentUser.email}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Submit a Campus Query
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              File academic questions, examination queries, fee clarifications, or service requests. Queries are reviewed and tracked directly by university authorities.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={handleClearDraft}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Reset all form fields"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Draft</span>
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/15 transition-colors cursor-pointer"
              >
                Back to Queries
              </button>
            )}
          </div>
        </div>

        {/* Draft restored notice */}
        {draftRestoredNotice && (
          <div className="mt-4 p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs flex items-center gap-2 animate-in fade-in">
            <Info className="w-4 h-4 shrink-0 text-indigo-300" />
            <span>Restored your previously saved draft automatically. You can continue editing.</span>
          </div>
        )}
      </div>

      {/* Success Notification Banner */}
      {successQuery && (
        <div className="p-6 bg-emerald-50 border-b border-emerald-200 text-emerald-900 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-emerald-900">
                Query Successfully Filed and Confirmed in Database!
              </h3>
              <p className="text-xs text-emerald-800">
                Your reference ID is <span className="font-mono font-black text-emerald-950 px-2 py-0.5 rounded bg-emerald-200/80">{successQuery.queryId}</span>. The assigned department (<span className="font-semibold">{successQuery.department}</span>) has been notified. Redirecting to tracking dashboard...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {submitError && (
        <div className="p-4 mx-6 mt-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">Submission failed:</span> {submitError}
            <span className="block text-[11px] text-rose-700 mt-0.5">Your input has been safely preserved in local draft storage.</span>
          </div>
        </div>
      )}

      {/* Query Submission Form */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {/* 1. Query Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              1. Query Title <span className="text-rose-500">*</span>
            </label>
            <span className={`text-[11px] font-mono ${title.length > 140 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
              {title.length} / 150 characters
            </span>
          </div>
          <input
            type="text"
            required
            maxLength={150}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Request for Semester VI Hall Ticket Clearance or Exam Clashing Clarification"
            className={`w-full px-4 py-3 rounded-2xl border text-xs sm:text-sm font-medium focus:outline-hidden transition-all ${
              validationErrors.title
                ? 'border-rose-300 focus:ring-2 focus:ring-rose-500 bg-rose-50/20'
                : 'border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 bg-slate-50/50 focus:bg-white'
            }`}
          />
          {validationErrors.title && (
            <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{validationErrors.title}</span>
            </p>
          )}
        </div>

        {/* 2 & 3. Category & Department Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Query Category */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-600" />
              <span>2. Query Category</span> <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as QueryCategory)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 bg-slate-50/50 focus:bg-white text-xs sm:text-sm font-medium focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden transition-all"
            >
              {QUERY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Other category text field if "Other" is chosen */}
            {category === 'Other' && (
              <div className="mt-2 space-y-1">
                <input
                  type="text"
                  required
                  value={otherCategoryDetail}
                  onChange={(e) => setOtherCategoryDetail(e.target.value)}
                  placeholder="Specify your query topic..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                {validationErrors.otherCategoryDetail && (
                  <p className="text-[11px] text-rose-600 font-medium">
                    {validationErrors.otherCategoryDetail}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Related Department */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>3. Related College Department</span> <span className="text-rose-500">*</span>
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 bg-slate-50/50 focus:bg-white text-xs sm:text-sm font-medium focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden transition-all"
            >
              {COLLEGE_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. Detailed Question */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              4. Detailed Question &amp; Inquiry Specifics <span className="text-rose-500">*</span>
            </label>
            <span className={`text-[11px] font-mono ${description.length > 2800 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
              {description.length} / 3000 characters
            </span>
          </div>
          <textarea
            required
            rows={6}
            maxLength={3000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please explain the details of your inquiry or issue clearly. Include subject names, roll numbers, dates, course codes, or prior reference numbers if applicable..."
            className={`w-full p-4 rounded-2xl border text-xs sm:text-sm font-medium focus:outline-hidden transition-all leading-relaxed ${
              validationErrors.description
                ? 'border-rose-300 focus:ring-2 focus:ring-rose-500 bg-rose-50/20'
                : 'border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 bg-slate-50/50 focus:bg-white'
            }`}
          />
          {validationErrors.description && (
            <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{validationErrors.description}</span>
            </p>
          )}
        </div>

        {/* 5. Optional Attachment Upload */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
              <span>5. Supporting Document / Attachment (Optional)</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal">PDF, PNG, JPG, or DOCX (Max 5MB)</span>
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg,.docx,.doc"
            className="hidden"
          />

          {!attachment ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-5 border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl bg-slate-50/60 hover:bg-indigo-50/40 text-center cursor-pointer transition-colors group"
            >
              <Paperclip className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 mx-auto mb-1.5 transition-colors" />
              <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-900">
                Click to attach an image, receipt, medical certificate, or PDF
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Files are validated and stored securely with your ticket.
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-indigo-950 truncate">{attachment.name}</p>
                  <p className="text-[10px] text-indigo-700 font-mono">
                    {(attachment.size / 1024).toFixed(1)} KB • {attachment.type}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveAttachment}
                className="p-1.5 rounded-lg text-indigo-600 hover:text-rose-600 hover:bg-white/80 transition-colors cursor-pointer"
                title="Remove attachment"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {validationErrors.attachment && (
            <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{validationErrors.attachment}</span>
            </p>
          )}
        </div>

        {/* Submission Metadata Notice */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>
              Timestamp: <strong>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong> • Real-time server record
            </span>
          </div>
          <div className="text-slate-500 font-mono text-[11px]">
            Security: ABAC &amp; Firestore Encrypted
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !!successQuery}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
              isSubmitting || !!successQuery
                ? 'bg-slate-400 text-white cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white shadow-indigo-600/30'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Saving to Firestore Database...</span>
              </>
            ) : successQuery ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-indigo-200" />
                <span>Submit Query to Department</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
