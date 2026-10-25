import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Bell,
  Plus,
  Info,
  Download,
  X,
  Sparkles,
  Upload,
  Loader2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { CollegeDocument, DocumentAppointment } from '../../types';
import { INITIAL_COLLEGE_DOCUMENTS, INITIAL_DOCUMENT_APPOINTMENTS } from '../../data/mockData';
import { firebaseStorageService } from '../../services/firebaseStorageService';

export interface CloudDocument {
  id: string;
  name: string;
  docType: string;
  fileSize: string;
  downloadUrl: string;
  storagePath: string;
  uploadedAt: string;
  status: 'Verified in Cloud' | 'Pending Review';
}

const INITIAL_CLOUD_DOCS: CloudDocument[] = [
  {
    id: 'cdoc-1',
    name: 'Internship_NOC_Application_2026.pdf',
    docType: 'Internship NOC',
    fileSize: '412 KB',
    downloadUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800',
    storagePath: 'student-documents/internship_noc/sample.pdf',
    uploadedAt: 'Today, 09:40 AM',
    status: 'Verified in Cloud'
  },
  {
    id: 'cdoc-2',
    name: 'Sem5_Marksheet_Attested_Copy.pdf',
    docType: 'Marksheet Verification',
    fileSize: '1.2 MB',
    downloadUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
    storagePath: 'student-documents/marksheet/sample.pdf',
    uploadedAt: 'Yesterday, 04:15 PM',
    status: 'Verified in Cloud'
  }
];

export const DocumentationTab: React.FC = () => {
  const [documents, setDocuments] = useState<CollegeDocument[]>(INITIAL_COLLEGE_DOCUMENTS);
  const [appointments, setAppointments] = useState<DocumentAppointment[]>(INITIAL_DOCUMENT_APPOINTMENTS);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Cloud Documents state (persisted in localStorage)
  const [cloudDocs, setCloudDocs] = useState<CloudDocument[]>(() => {
    try {
      const saved = localStorage.getItem('campuspulse_cloud_documents');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_CLOUD_DOCS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('campuspulse_cloud_documents', JSON.stringify(cloudDocs));
    } catch {
      // ignore
    }
  }, [cloudDocs]);

  // Upload Form state
  const [uploadDocType, setUploadDocType] = useState<string>('Internship NOC');
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadToast, setUploadToast] = useState<string | null>(null);

  // Booking form state
  const [selectedDocName, setSelectedDocName] = useState<string>('Internship No-Objection Certificate (NOC)');
  const [selectedCounter, setSelectedCounter] = useState<string>('Admin Block - Counter 3');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-23');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('11:30 AM - 12:00 PM');
  const [enableReminder, setEnableReminder] = useState<boolean>(true);
  const [bookingSuccess, setBookingSuccess] = useState<DocumentAppointment | null>(null);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUploadFile) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const res = await firebaseStorageService.uploadStudentDocument(
        selectedUploadFile,
        uploadDocType,
        (progress) => setUploadProgress(progress)
      );

      const newDoc: CloudDocument = {
        id: `cdoc-${Date.now()}`,
        name: selectedUploadFile.name,
        docType: uploadDocType,
        fileSize: `${(selectedUploadFile.size / 1024).toFixed(1)} KB`,
        downloadUrl: res.downloadUrl,
        storagePath: res.path,
        uploadedAt: 'Just now',
        status: 'Verified in Cloud'
      };

      setCloudDocs((prev) => [newDoc, ...prev]);
      setIsUploading(false);
      setShowUploadModal(false);
      setSelectedUploadFile(null);
      setUploadProgress(0);

      setUploadToast(`Document "${selectedUploadFile.name}" successfully uploaded to Firebase Storage!`);
      setTimeout(() => setUploadToast(null), 4000);
    } catch (err: unknown) {
      console.error('Document upload error:', err);
      setIsUploading(false);
      setUploadToast('Upload failed. Please try again.');
      setTimeout(() => setUploadToast(null), 4000);
    }
  };

  const handleDeleteCloudDoc = async (docId: string, storagePath: string) => {
    await firebaseStorageService.deleteFileByPath(storagePath);
    setCloudDocs((prev) => prev.filter((d) => d.id !== docId));
    setUploadToast('Document removed from cloud storage.');
    setTimeout(() => setUploadToast(null), 3000);
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const token = `DOC-${String.fromCharCode(65 + Math.floor(Math.random() * 6))}${Math.floor(10 + Math.random() * 90)}`;
    const newAppointment: DocumentAppointment = {
      id: `app-${Date.now()}`,
      studentId: 'std-2026-084',
      documentName: selectedDocName,
      counter: selectedCounter,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      tokenNumber: token,
      status: 'Confirmed',
      reminderEnabled: enableReminder,
      reminderNote: 'Bring original college ID card, photocopies, and passport size photographs.'
    };

    setAppointments((prev) => [newAppointment, ...prev]);
    setBookingSuccess(newAppointment);

    setTimeout(() => {
      setShowBookingModal(false);
      setBookingSuccess(null);
    }, 3500);
  };

  const handleToggleReminder = (appointmentId: string) => {
    setAppointments((prev) =>
      prev.map((app) =>
        app.id === appointmentId ? { ...app, reminderEnabled: !app.reminderEnabled } : app
      )
    );
  };

  const filteredDocs = documents.filter((doc) => {
    if (filterCategory === 'all') return true;
    return doc.category.toLowerCase() === filterCategory.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert Feedback */}
      {uploadToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-cyan-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="text-xs font-bold">{uploadToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 uppercase tracking-wide">
              Central Documentation &amp; Verification Cell
            </span>
            <span className="text-xs text-slate-500">Administrative Wing • Counter Floor 1</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-2">College Document Checklist &amp; Cloud Vault</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Never misplace required documents. Upload verified scans directly to Firebase Storage, review required submissions, and book dedicated counter appointment slots.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto shrink-0">
          <button
            id="upload-cloud-doc-btn"
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-2"
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Upload Document to Cloud</span>
          </button>

          <button
            id="book-doc-slot-btn"
            onClick={() => setShowBookingModal(true)}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            <span>Apply for Submission Slot</span>
          </button>
        </div>
      </div>

      {/* CLOUD DOCUMENT VAULT (FIREBASE STORAGE POWERED) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Your Cloud Document Vault</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Firebase Storage Connected
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Uploaded files are securely hosted on Google Cloud Storage for digital clearance verification.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-3.5 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto border border-cyan-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add New Cloud Scan</span>
          </button>
        </div>

        {cloudDocs.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-xs text-slate-500">
            No cloud documents uploaded yet. Click "Upload Document to Cloud" to store your marksheet or certificate scans in Firebase Storage.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {cloudDocs.map((cd) => (
              <div
                key={cd.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-cyan-300 bg-slate-50/60 hover:bg-white transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 uppercase">
                      {cd.docType}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {cd.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 mt-2 truncate" title={cd.name}>
                    {cd.name}
                  </h4>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>{cd.fileSize}</span>
                    <span>•</span>
                    <span>{cd.uploadedAt}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                  <a
                    href={cd.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-700 hover:text-cyan-800 font-bold hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download / View</span>
                    <ExternalLink className="w-3 h-3 text-cyan-500" />
                  </a>

                  <button
                    onClick={() => handleDeleteCloudDoc(cd.id, cd.storagePath)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Appointments & Automated Reminders Strip */}
      <div className="bg-gradient-to-r from-cyan-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Your Scheduled Counter Appointments</h3>
              <p className="text-xs text-slate-300">Fast-track queue token with priority counter verification</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
            {appointments.length} Active Booking{appointments.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {appointments.map((app) => (
            <div
              key={app.id}
              className="p-4 rounded-xl bg-white/10 border border-white/15 backdrop-blur-xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 truncate max-w-[220px]">
                    {app.documentName}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-cyan-400 text-slate-950">
                    Token #{app.tokenNumber}
                  </span>
                </div>
                <div className="text-xs text-slate-200 mt-2 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Location: {app.counter}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Date & Slot: {app.date} • {app.timeSlot}</span>
                  </p>
                </div>
              </div>

              {/* Automated Reminder Toggle */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleToggleReminder(app.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    app.reminderEnabled
                      ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30'
                      : 'bg-white/10 text-slate-300'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{app.reminderEnabled ? 'Reminders Active (1 Hr Prior)' : 'Reminder Paused'}</span>
                </button>
                <span className="text-[11px] text-slate-300">Status: {app.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checklist of Documents & "Don't Forget" Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-600" />
              Essential College Documents Checklist
            </h3>
            <p className="text-xs text-slate-500">
              Mandatory physical documents required by University Records, Examination Wing & Placement Cell
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs self-start sm:self-auto">
            {['all', 'Academic', 'Placement', 'Verification', 'Admission'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${
                  filterCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'all' ? 'All Docs' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Don't Forget Notice Box */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold">⚠️ "Don't Forget" Counter Requirements:</h4>
            <p>
              1. Always bring your <strong>Original College Smart ID Card</strong> for verification barcode scanning.
            </p>
            <p>
              2. For any marksheet or certificate submission, keep <strong>2 self-attested photocopies</strong> and <strong>2 recent passport-size photographs</strong>.
            </p>
            <p>
              3. For Internship NOC, ensure the <strong>Department HOD Signature</strong> is signed before presenting at Counter 3.
            </p>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const isVerified = doc.status === 'Verified';
            const isSubmitted = doc.status === 'Submitted';
            const isPending = doc.status === 'Pending';
            const isReady = doc.status === 'Ready for Collection';

            return (
              <div
                key={doc.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-cyan-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3 bg-slate-50/50"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                      {doc.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isVerified
                          ? 'bg-emerald-100 text-emerald-800'
                          : isSubmitted
                          ? 'bg-blue-100 text-blue-800'
                          : isReady
                          ? 'bg-cyan-100 text-cyan-800 animate-pulse'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 mt-2">{doc.name}</h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{doc.description}</p>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-500 pt-2 border-t border-slate-200/70">
                  <p><strong>Required Copies:</strong> {doc.copiesRequired}</p>
                  <p><strong>Department Counter:</strong> {doc.departmentCounter}</p>
                  <p className="text-indigo-700 font-medium italic">💡 {doc.fileHint}</p>
                </div>

                {isPending && (
                  <button
                    onClick={() => {
                      setSelectedDocName(doc.name);
                      setSelectedCounter(doc.departmentCounter);
                      setShowBookingModal(true);
                    }}
                    className="w-full py-2 text-xs font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-lg border border-cyan-200 transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Book Submission Slot →</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Appointment Slot Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-600" />
                <h3 className="font-bold text-slate-900 text-sm">Book Documentation Slot</h3>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookAppointment} className="p-6 space-y-4">
              {bookingSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Appointment Booked Successfully!</span>
                  </div>
                  <p>
                    Your digital token is <strong>#{bookingSuccess.tokenNumber}</strong> for {bookingSuccess.date} ({bookingSuccess.timeSlot}) at {bookingSuccess.counter}.
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Automated SMS reminder scheduled 1 hour before slot.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Document / Service Required:
                    </label>
                    <select
                      value={selectedDocName}
                      onChange={(e) => setSelectedDocName(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                    >
                      {documents.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.departmentCounter})
                        </option>
                      ))}
                      <option value="Degree Certificate Attestation">Degree Certificate Attestation</option>
                      <option value="Scholarship Undertaking Seal">Scholarship Undertaking Seal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Department Counter:
                    </label>
                    <input
                      type="text"
                      value={selectedCounter}
                      onChange={(e) => setSelectedCounter(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 focus:outline-hidden bg-slate-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Preferred Date:
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Time Window:
                      </label>
                      <select
                        value={selectedTimeSlot}
                        onChange={(e) => setSelectedTimeSlot(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                      >
                        <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                        <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM</option>
                        <option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</option>
                        <option value="03:30 PM - 04:00 PM">03:30 PM - 04:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-between text-xs text-cyan-950">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-cyan-700" />
                      <span>Enable automated SMS & Web reminders</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={enableReminder}
                      onChange={(e) => setEnableReminder(e.target.checked)}
                      className="accent-cyan-600 w-4 h-4 cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowBookingModal(false)}
                      className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors shadow-sm cursor-pointer"
                    >
                      Confirm Slot Booking
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Cloud Document Upload Modal (Firebase Storage) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Upload to Cloud Vault</h3>
                  <p className="text-[11px] text-cyan-200">Connected to Firebase Storage</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedUploadFile(null);
                  setIsUploading(false);
                }}
                className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFileUpload} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Document Category / Type *
                </label>
                <select
                  value={uploadDocType}
                  onChange={(e) => setUploadDocType(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Internship NOC">Internship No-Objection Certificate (NOC)</option>
                  <option value="Bonafide Certificate">Bonafide Certificate Application</option>
                  <option value="Marksheet Verification">Semester Marksheet Attested Copy</option>
                  <option value="ID Proof & Photographs">College Smart ID Card / Passport Scan</option>
                  <option value="Fee Clearance Receipt">Accounts Fee Clearance Challan</option>
                  <option value="Medical Certificate">Medical Fitness / Absence Proof</option>
                  <option value="Other Academic Certificate">Other Academic Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select File from Device *
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-cyan-500 rounded-2xl p-5 text-center transition-colors bg-slate-50">
                  <input
                    type="file"
                    id="cloud-file-input"
                    accept=".pdf,image/*,.doc,.docx"
                    required
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setSelectedUploadFile(file);
                    }}
                    className="hidden"
                  />
                  <label htmlFor="cloud-file-input" className="cursor-pointer block space-y-2">
                    <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-700 mx-auto flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    {selectedUploadFile ? (
                      <div>
                        <p className="font-bold text-slate-900">{selectedUploadFile.name}</p>
                        <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                          {(selectedUploadFile.size / 1024).toFixed(1)} KB • Ready to upload
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-bold text-slate-700">Click to choose a file</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">PDF, PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {isUploading && (
                <div className="space-y-1.5 p-3 rounded-xl bg-cyan-50 border border-cyan-200">
                  <div className="flex items-center justify-between text-[11px] text-cyan-900 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-600" />
                      Uploading to Firebase Storage...
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-cyan-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-600 h-full rounded-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !selectedUploadFile}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold shadow-md cursor-pointer flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload Document</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
