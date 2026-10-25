import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Award,
  Clock,
  FileText,
  Calendar,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  FileCheck,
  MapPin,
  ChevronRight,
  Compass,
  Search,
  Megaphone,
  Plus,
  ShieldCheck,
  Package,
  HelpCircle
} from 'lucide-react';
import {
  UserProfile,
  SubjectAttendance,
  SemesterResult,
  AcademicDeadline,
  CampusEvent,
  DocumentAppointment,
  PermissionRequest,
  LostFoundItem
} from '../../types';
import { permissionLetterService } from '../../services/permissionLetterService';
import { examSeatingService, EnrichedStudentSeating } from '../../services/examSeatingService';
import { LostFoundDashboardWidget } from '../LostFoundDashboardWidget';

interface DashboardTabProps {
  currentUser: UserProfile;
  attendance: SubjectAttendance[];
  results: SemesterResult[];
  deadlines: AcademicDeadline[];
  events: CampusEvent[];
  appointments: DocumentAppointment[];
  onNavigateTab: (tabId: string) => void;
  onOpenVerticalNav?: () => void;
  onOpenLostFoundAction?: (action: 'browse' | 'report-lost' | 'report-found' | 'my-reports') => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  currentUser,
  attendance,
  results,
  deadlines,
  events,
  appointments,
  onNavigateTab,
  onOpenVerticalNav,
  onOpenLostFoundAction
}) => {
  const [permissionRequests, setPermissionRequests] = useState<PermissionRequest[]>([]);
  const [upcomingExamSeating, setUpcomingExamSeating] = useState<EnrichedStudentSeating | null>(null);

  useEffect(() => {
    const list = permissionLetterService.getStudentRequests(currentUser.id, currentUser.rollNumber);
    setPermissionRequests(list);

    const seating = examSeatingService.getStudentUpcomingExam(currentUser.id, currentUser.rollNumber);
    setUpcomingExamSeating(seating);
  }, [currentUser.id, currentUser.rollNumber]);

  // Aggregate stats
  const totalClasses = attendance.reduce((acc, curr) => acc + curr.totalClasses, 0);
  const attendedClasses = attendance.reduce((acc, curr) => acc + curr.attendedClasses, 0);
  const overallAttendance = totalClasses > 0 ? ((attendedClasses / totalClasses) * 100).toFixed(1) : '0.0';

  const currentResult = results[0];
  const pendingDeadlines = deadlines.filter((d) => d.status !== 'completed');

  return (
    <div className="space-y-6">
      {/* Student Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-normal">
              <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">Semester {currentUser.semester || 6}</span>
              <span>·</span>
              <span>{currentUser.department || 'Computer Science & Engineering'}</span>
              <span>·</span>
              <span className="font-mono text-slate-700 font-semibold">{currentUser.rollNumber || '22CS084'}</span>
              <span>·</span>
              <span>Academic Year 2025-2026</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
              Your CampusPulse command center: track live attendance, verified grades, hall ticket allocations, mentorship, and digital requests.
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              id="dash-quick-perm-letter-btn"
              onClick={() => onNavigateTab('permission-letter')}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shadow-indigo-600/25 hover:shadow-indigo-600/35"
            >
              <FileCheck className="w-3.5 h-3.5 text-white" />
              <span>Permission Letter</span>
            </button>
            <button
              id="dash-quick-student-queries-btn"
              onClick={() => onNavigateTab('student-queries')}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-indigo-200/80 shadow-2xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-700" />
              <span>Student Queries</span>
            </button>
            <button
              id="dash-quick-exam-seating-btn"
              onClick={() => onNavigateTab('exam-seating')}
              className="px-3.5 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100/80 text-cyan-900 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-cyan-200/80 shadow-2xs"
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-700" />
              <span>Exam Seating</span>
            </button>
            <button
              id="dash-quick-faculty-chat-btn"
              onClick={() => onNavigateTab('faculty-chat')}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200/90 shadow-2xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Faculty Chat</span>
            </button>
            <button
              id="dash-quick-campus-map-btn"
              onClick={() => onNavigateTab('campus-navigation')}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200/90 shadow-2xs"
            >
              <Compass className="w-3.5 h-3.5 text-slate-500" />
              <span>Campus Map</span>
            </button>
          </div>
        </div>

        {/* 4 Semantic Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-slate-100">
          <div
            onClick={() => onNavigateTab('attendance')}
            className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/40 via-white to-white hover:bg-indigo-50/70 border border-indigo-100/80 hover:border-indigo-300 transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-indigo-950">Total Attendance</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-heading mt-2 flex items-baseline gap-1.5 tabular-nums">
              <span>{overallAttendance}%</span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">Safe (≥75%)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {attendedClasses} of {totalClasses} classes attended
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('results')}
            className="p-4 rounded-xl bg-gradient-to-br from-violet-50/40 via-white to-white hover:bg-violet-50/70 border border-violet-100/80 hover:border-violet-300 transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-violet-950">Cumulative CGPA</span>
              <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-heading mt-2 flex items-baseline gap-1.5 tabular-nums">
              <span>{currentResult ? currentResult.cgpa : '8.92'}</span>
              <span className="text-[11px] font-semibold text-violet-700 bg-violet-50 px-1.5 py-0.2 rounded border border-violet-200/60">SGPA: {currentResult ? currentResult.sgpa : '9.12'}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Rank #4 of 120 in department</p>
          </div>

          <div
            onClick={() => onNavigateTab('exam-seating')}
            className="p-4 rounded-xl bg-gradient-to-br from-cyan-50/40 via-white to-white hover:bg-cyan-50/70 border border-cyan-100/80 hover:border-cyan-300 transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-cyan-950">Next Examination</span>
              <div className="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-heading mt-2 flex items-baseline gap-1.5 tabular-nums">
              <span>{upcomingExamSeating ? upcomingExamSeating.subjectCode : 'CS601'}</span>
              <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200/60">
                Seat {upcomingExamSeating?.seatNumber || '12'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              Hall: {upcomingExamSeating?.hallInfo || 'Block A, Room 204'}
            </p>
          </div>

          <div
            onClick={() => onNavigateTab('permission-letter')}
            className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/40 via-white to-white hover:bg-emerald-50/70 border border-emerald-100/80 hover:border-emerald-300 transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-emerald-950">Permission Passes</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <FileCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-heading mt-2 flex items-baseline gap-1.5 tabular-nums">
              <span>{permissionRequests.length > 0 ? `${permissionRequests.length} Active` : '0 Active'}</span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">Clearance</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Mentor &amp; HOD approvals</p>
          </div>
        </div>
      </div>

      {/* Upcoming Exam Seating Card */}
      {upcomingExamSeating && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-cyan-500 to-indigo-600" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-1">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200">
                  Upcoming Examination
                </span>
                <span className="text-xs font-mono text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                  {upcomingExamSeating.subjectCode}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 font-heading">
                {upcomingExamSeating.subject}
              </h3>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 pt-0.5">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  Date: {upcomingExamSeating.examDate}, {upcomingExamSeating.startTime}
                </span>
                <span className="flex items-center gap-1 font-semibold text-indigo-900 bg-indigo-50/70 px-2 py-0.5 rounded-md border border-indigo-100">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  Hall: {upcomingExamSeating.hallInfo}
                </span>
                <span className="flex items-center gap-1 font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  Seat: {upcomingExamSeating.seatNumber} (Row {upcomingExamSeating.rowNumber})
                </span>
                <span className="text-slate-500">
                  Reporting: <strong className="text-slate-800">{upcomingExamSeating.reportingTime}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                id="dash-view-seating-arrangement-btn"
                onClick={() => onNavigateTab('exam-seating')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shadow-indigo-600/25"
              >
                <span>View Seating Arrangement</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Lost & Found Student Widget (Preserved from Previous Version) */}
      <LostFoundDashboardWidget
        currentUser={currentUser}
        onNavigateTab={(tab, action) => (onOpenLostFoundAction ? onOpenLostFoundAction(action || 'browse') : onNavigateTab(tab))}
      />

      {/* Main 2-Column Academic Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Subject Attendance & Permission Requests */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subject Attendance Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <span>Subject Attendance Breakdown</span>
                </h3>
                <p className="text-xs text-slate-500">Minimum 75% attendance required for examination hall ticket eligibility</p>
              </div>
              <button
                id="dash-view-attendance-btn"
                onClick={() => onNavigateTab('attendance')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Full Breakdown &amp; Calculator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {attendance.map((sub, subIdx) => {
                const isWarning = sub.percentage < 80;
                return (
                  <div
                    key={`${sub.id || sub.subjectCode}-${subIdx}`}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all shadow-2xs"
                  >
                    <div className="flex items-start justify-between">
                      <div className="pr-2 min-w-0">
                        <span className="font-mono text-[10px] font-bold text-indigo-700 uppercase px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-100">
                          {sub.subjectCode}
                        </span>
                        <h4 className="text-xs font-semibold text-slate-900 mt-1 truncate">
                          {sub.subjectName}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{sub.facultyName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-sm font-bold tabular-nums ${isWarning ? 'text-amber-600' : 'text-slate-900'}`}>
                          {sub.percentage.toFixed(1)}%
                        </span>
                        <p className="text-[10px] text-slate-400 tabular-nums">{sub.attendedClasses}/{sub.totalClasses}</p>
                      </div>
                    </div>
                    {/* Modern Semantic Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isWarning ? 'bg-amber-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${Math.min(sub.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Digital Permission Requests Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 font-heading">Recent Permission Requests</h3>
              </div>
              <button
                id="dash-open-perm-letter-tab-btn"
                onClick={() => onNavigateTab('permission-letter')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1"
              >
                <span>+ Apply for Leave / Event</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {permissionRequests.length > 0 ? (
              <div className="space-y-2">
                {permissionRequests.slice(0, 3).map((req, reqIdx) => (
                  <div
                    key={`${req.requestId}-${reqIdx}`}
                    onClick={() => onNavigateTab('permission-letter')}
                    className="p-3 rounded-xl bg-slate-50/70 hover:bg-indigo-50/30 border border-slate-200/80 hover:border-indigo-200 transition-colors cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                          {req.requestId}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs font-semibold text-slate-900 truncate max-w-[280px]">
                          {req.subject}
                        </span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                        req.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : req.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {req.status === 'approved'
                          ? 'Approved'
                          : req.status === 'rejected'
                          ? 'Rejected'
                          : 'In Review'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Duration: {req.startDate} → {req.endDate} · Signatures: Class Mentor &amp; HOD
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                <p>No permission requests submitted yet.</p>
                <button
                  onClick={() => onNavigateTab('permission-letter')}
                  className="mt-2 text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                >
                  Create digital leave or duty request
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Deadlines, Notices & Documentation Counter */}
        <div className="space-y-6">
          {/* Upcoming Academic Deadlines */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Academic Deadlines</span>
              </h3>
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 font-mono">
                {pendingDeadlines.length} Due
              </span>
            </div>

            <div className="space-y-2">
              {pendingDeadlines.slice(0, 4).map((dl, dlIdx) => (
                <div
                  key={`${dl.id}-${dlIdx}`}
                  onClick={() => dl.actionUrlTab && onNavigateTab(dl.actionUrlTab)}
                  className="p-3 rounded-xl border border-slate-200/80 hover:border-indigo-200 bg-slate-50/50 hover:bg-white transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                        {dl.category}
                      </span>
                      <h4 className="text-xs font-semibold text-slate-900 group-hover:text-indigo-900 truncate">
                        {dl.title}
                      </h4>
                    </div>
                    <span className="shrink-0 text-[11px] font-mono font-medium text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200/60">
                      {dl.dueTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateTab('calendar')}
              className="w-full mt-3 py-2 text-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50/50 rounded-xl transition-colors cursor-pointer border border-dashed border-indigo-200"
            >
              View Full Academic Calendar →
            </button>
          </div>

          {/* Campus Notices & Bulletin */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-cyan-600" />
                <h3 className="text-sm font-bold text-slate-900 font-heading">Campus Notices</h3>
              </div>
              <button
                onClick={() => onNavigateTab('campus-navigation')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-0.5"
              >
                <span>All Notices</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div
                onClick={() => onNavigateTab('campus-navigation')}
                className="p-3 rounded-xl bg-slate-50/60 hover:bg-white hover:border-indigo-200 border border-slate-200/80 transition-colors cursor-pointer space-y-1 shadow-2xs"
              >
                <div className="font-semibold text-slate-900 flex items-center justify-between">
                  <span>Exam Hall Schedule Finalized</span>
                  <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.2 rounded">Tomorrow</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">CS601 allocated to Block A Room 204. Reporting at 09:30 AM.</p>
              </div>

              <div
                onClick={() => onNavigateTab('campus-navigation')}
                className="p-3 rounded-xl bg-slate-50/60 hover:bg-white hover:border-indigo-200 border border-slate-200/80 transition-colors cursor-pointer space-y-1 shadow-2xs"
              >
                <div className="font-semibold text-slate-900 flex items-center justify-between">
                  <span>Placement Drive Registration</span>
                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded">Today</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">Google SDE-1 registration closes at 06:00 PM.</p>
              </div>

              <div
                onClick={() => onNavigateTab('campus-navigation')}
                className="p-3 rounded-xl bg-slate-50/60 hover:bg-white hover:border-indigo-200 border border-slate-200/80 transition-colors cursor-pointer space-y-1 shadow-2xs"
              >
                <div className="font-semibold text-slate-900 flex items-center justify-between">
                  <span>Annual Tech Symposium</span>
                  <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.2 rounded">Oct 10</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">HackSphere 36-hour hackathon at Convention Hall.</p>
              </div>
            </div>

            {/* Frequently Visited Campus Locations */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Quick Campus Locations:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: 'AI Lab (204)', id: 'loc-ai-lab' },
                  { name: 'Central Library', id: 'loc-central-lib' },
                  { name: 'Exam Cell (112)', id: 'loc-exam-cell' },
                  { name: 'Food Court', id: 'loc-canteen' }
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => onNavigateTab('campus-navigation')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-[11px] font-semibold transition-all cursor-pointer border border-slate-200 hover:border-indigo-200"
                  >
                    📍 {chip.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Documentation Counter Desk */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Document Clearance Desk</span>
              </h3>
              <button
                onClick={() => onNavigateTab('documentation')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                Book Token
              </button>
            </div>

            {appointments.length > 0 ? (
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900">{appointments[0].documentName}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Token #{appointments[0].tokenNumber}
                  </span>
                </div>
                <div className="text-xs text-slate-500 space-y-0.5">
                  <p>📍 {appointments[0].counter}</p>
                  <p>⏰ {appointments[0].date} at {appointments[0].timeSlot}</p>
                </div>
                <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified for collection</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No active counter bookings. Apply for bonafide certificates or transcript verification.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
