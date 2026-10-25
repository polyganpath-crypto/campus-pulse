import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  MapPin,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  Send,
  Search,
  Filter,
  Download,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  FileText,
  Building2,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Info,
  Check,
  X,
  Menu,
  Compass,
  HelpCircle
} from 'lucide-react';
import { UserProfile, StudentDueRecord, AdminNoticeLog } from '../../types';
import { adminService, EnrichedStudentRecord } from '../../services/adminService';
import { examSeatingService } from '../../services/examSeatingService';
import { SystemCheckPanel } from '../admin/SystemCheckPanel';

interface AdminDashboardTabProps {
  currentUser: UserProfile;
  onNavigateTab: (tab: string) => void;
  onOpenVerticalNav?: () => void;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({
  currentUser,
  onNavigateTab,
  onOpenVerticalNav
}) => {
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'records' | 'seating' | 'duelist' | 'logs' | 'system-check'>('records');

  // Data states
  const [studentRecords, setStudentRecords] = useState<EnrichedStudentRecord[]>([]);
  const [dueList, setDueList] = useState<StudentDueRecord[]>([]);
  const [noticeLogs, setNoticeLogs] = useState<AdminNoticeLog[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [selectedDueTypeFilter, setSelectedDueTypeFilter] = useState<string>('all');
  const [dueStatusFilter, setDueStatusFilter] = useState<string>('all');

  // Modals for Dues
  const [selectedStudentForNotice, setSelectedStudentForNotice] = useState<StudentDueRecord | null>(null);
  const [customNoticeText, setCustomNoticeText] = useState<string>('');
  const [clearingDueItem, setClearingDueItem] = useState<StudentDueRecord | null>(null);
  const [receiptNumber, setReceiptNumber] = useState<string>('');

  // Feedback toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const loadAdminData = () => {
    setStudentRecords(adminService.getStudentRecords());
    setDueList(adminService.getDueList());
    setNoticeLogs(adminService.getNoticeLogs());
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleSendDueNotice = (dueId: string, customText?: string) => {
    try {
      const log = adminService.informDueIssue(dueId, customText);
      loadAdminData();
      setSelectedStudentForNotice(null);
      setCustomNoticeText('');
      setToastMessage({
        text: `⚠️ Due notice officially sent to ${log.recipientName} (${log.recipientRoll})!`,
        type: 'success'
      });
      setTimeout(() => setToastMessage(null), 4500);
    } catch (err: unknown) {
      setToastMessage({
        text: err instanceof Error ? err.message : 'Error sending due notice',
        type: 'error'
      });
    }
  };

  const handleConfirmClearDue = (dueId: string, receipt?: string) => {
    try {
      const cleared = adminService.markDueCleared(dueId, receipt);
      loadAdminData();
      setClearingDueItem(null);
      setReceiptNumber('');
      setToastMessage({
        text: `✅ ${cleared.dueType} marked cleared for ${cleared.studentName}! Hall ticket clearance granted.`,
        type: 'success'
      });
      setTimeout(() => setToastMessage(null), 4500);
    } catch (err: unknown) {
      setToastMessage({
        text: err instanceof Error ? err.message : 'Error clearing dues',
        type: 'error'
      });
    }
  };

  // Handle Inform Seating Arrangement
  const handleInformSeating = (rollNumber: string, examId = 'exam-cs601') => {
    try {
      const log = adminService.informSeatingArrangement(rollNumber, examId);
      loadAdminData();
      setToastMessage({
        text: `🔔 Exam seating notification sent to ${log.recipientName} (${log.recipientRoll})!`,
        type: 'success'
      });
      setTimeout(() => setToastMessage(null), 4500);
    } catch (err: unknown) {
      setToastMessage({
        text: err instanceof Error ? err.message : 'Error sending seating notice',
        type: 'error'
      });
    }
  };

  // Broadcast All Seating Arrangements for Exam
  const handleBroadcastAllSeating = (examId = 'exam-cs601') => {
    const count = adminService.broadcastAllSeatingArrangements(examId);
    loadAdminData();
    setToastMessage({
      text: `🚀 Broadcasted examination seating arrangement alerts to ${count} students registered in Data Structures (CS601)!`,
      type: 'success'
    });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Filtered Students Records
  const filteredRecords = studentRecords.filter((rec) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      rec.name.toLowerCase().includes(q) ||
      rec.rollNumber.toLowerCase().includes(q) ||
      rec.department.toLowerCase().includes(q) ||
      (rec.allocatedHall && rec.allocatedHall.toLowerCase().includes(q));

    const matchesDept = selectedDeptFilter === 'all' || rec.department.toLowerCase().includes(selectedDeptFilter.toLowerCase());

    return matchesSearch && matchesDept;
  });

  // Filtered Due List
  const filteredDueList = dueList.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.studentName.toLowerCase().includes(q) ||
      item.rollNumber.toLowerCase().includes(q) ||
      item.dueType.toLowerCase().includes(q) ||
      (item.remarks && item.remarks.toLowerCase().includes(q));

    const matchesDueType = selectedDueTypeFilter === 'all' || item.dueType === selectedDueTypeFilter;
    const matchesStatus = dueStatusFilter === 'all' || item.status === dueStatusFilter;

    return matchesSearch && matchesDueType && matchesStatus;
  });

  // Metrics
  const totalStudentsCount = studentRecords.length;
  const seatingAllocatedCount = studentRecords.filter((s) => s.allocatedHall).length;
  const clearedStudentsCount = studentRecords.filter((s) => s.isHallTicketCleared).length;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl text-white font-bold text-xs flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-2 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600'
              : toastMessage.type === 'error'
              ? 'bg-rose-600'
              : 'bg-indigo-600'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-200" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-white/20 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HERO BANNER: ADMIN PORTAL IDENTITY & CLEARANCE HUB */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl border border-slate-800 p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-60 bottom-0 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={
                currentUser.avatarUrl ||
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
              }
              alt={currentUser.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-slate-700 shadow-xl shrink-0"
            />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Admin &amp; Examination Cell Portal</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Academic Year 2025-2026
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {currentUser.name}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-y-1 gap-x-3 font-medium">
                <span className="font-bold text-white">
                  {currentUser.designation || 'Chief Controller of Examinations & Academic Records'}
                </span>
                <span>•</span>
                <span>{currentUser.department || 'Examination Cell & Student Affairs'}</span>
                <span>•</span>
                <span>Office: Admin Chamber 104</span>
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => setActiveAdminSubTab('system-check')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition-all cursor-pointer flex items-center gap-2"
              title="Test read access to all collections and verify Firestore connection"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              <span>System Check Panel</span>
            </button>

            <button
              onClick={() => onNavigateTab('exam-seating')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-xs shadow-md shadow-amber-950/40 transition-all cursor-pointer flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-slate-950" />
              <span>Exam Seating Master Desk</span>
            </button>

            <button
              onClick={() => handleBroadcastAllSeating('exam-cs601')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-900/40 transition-all cursor-pointer flex items-center gap-2"
              title="Broadcast seating alert to all registered students"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Seating Notices</span>
            </button>

            {onOpenVerticalNav && (
              <button
                onClick={onOpenVerticalNav}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all cursor-pointer flex items-center gap-2"
              >
                <Menu className="w-4 h-4 text-indigo-300" />
                <span>Vertical Drawer (Gmail Style)</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-800">
          <div
            onClick={() => setActiveAdminSubTab('records')}
            className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Student Roster</span>
              <Users className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white mt-1.5 flex items-baseline gap-1.5">
              <span>{totalStudentsCount}</span>
              <span className="text-xs font-normal text-indigo-300">Enrolled</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">CS Dept • Sem 6 Cohort</p>
          </div>

          <div
            onClick={() => setActiveAdminSubTab('seating')}
            className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Seating Allocated</span>
              <MapPin className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white mt-1.5 flex items-baseline gap-1.5">
              <span>{seatingAllocatedCount} / {totalStudentsCount}</span>
              <span className="text-xs font-normal text-amber-300">100% Assigned</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Halls: Block A (204) &amp; Central (301)</p>
          </div>

          <div
            onClick={() => setActiveAdminSubTab('seating')}
            className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Active Exam Centers</span>
              <Building2 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white mt-1.5 flex items-baseline gap-1.5">
              <span>2 Halls</span>
              <span className="text-xs font-normal text-amber-300">Monitored</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Room 204 (18) • Room 301 (18)</p>
          </div>

          <div
            onClick={() => setActiveAdminSubTab('records')}
            className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Hall Pass Clearance</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white mt-1.5 flex items-baseline gap-1.5">
              <span>{clearedStudentsCount} / {totalStudentsCount}</span>
              <span className="text-xs font-normal text-emerald-400">Valid</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Verified &amp; Attendance ≥75%</p>
          </div>
        </div>
      </div>

      {/* ADMIN WORKSPACE SUB-NAVIGATION TABS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveAdminSubTab('records')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeAdminSubTab === 'records'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Academic Records ({studentRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminSubTab('seating')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeAdminSubTab === 'seating'
              ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Seating Arrangement Informer</span>
        </button>

        <button
          onClick={() => setActiveAdminSubTab('logs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeAdminSubTab === 'logs'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Dispatched Notices Ledger ({noticeLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminSubTab('system-check')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeAdminSubTab === 'system-check'
              ? 'bg-emerald-600 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>System Check (Collections &amp; Rules)</span>
        </button>

        <button
          onClick={() => onNavigateTab('student-queries')}
          className="ml-auto px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          title="Open Student Queries Management Portal"
        >
          <HelpCircle className="w-4 h-4 text-indigo-200" />
          <span>Student Queries Management →</span>
        </button>

        <button
          onClick={() => onNavigateTab('campus-navigation')}
          className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-2xs"
          title="Open Campus Navigation, Map & Smart Announcements"
        >
          <Compass className="w-4 h-4 text-indigo-600" />
          <span>Campus Map Hub →</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. STUDENT ACADEMIC RECORDS DATABASE VIEW                                 */}
      {/* ========================================================================= */}
      {activeAdminSubTab === 'records' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>Student Academic Records &amp; Clearance Status</span>
              </h3>
              <p className="text-xs text-slate-500">
                Official university student register with attendance verification, CGPA, seat allocations, and clearance status.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search Roll No, Name, Hall..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden w-64"
                />
              </div>

              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
              >
                <option value="all">All Departments</option>
                <option value="Computer Science">Computer Science &amp; Eng</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Roll Number</th>
                  <th className="py-3 px-3">Class &amp; Dept</th>
                  <th className="py-3 px-3">Attendance</th>
                  <th className="py-3 px-3">CGPA</th>
                  <th className="py-3 px-3">Assigned Exam Seat</th>
                  <th className="py-3 px-3">Due Status</th>
                  <th className="py-3 px-3">Hall Pass Clearance</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((student) => {
                  const isAttendanceShortage = student.attendancePercentage < 75;
                  const hasPendingDues = student.totalDuesAmount > 0;

                  return (
                    <tr key={student.studentId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">{student.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {student.studentId}</div>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-indigo-700">{student.rollNumber}</td>
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-800">Sem {student.semester} • {student.section}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{student.department}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            isAttendanceShortage
                              ? 'bg-rose-100 text-rose-800'
                              : student.attendancePercentage >= 85
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {student.attendancePercentage}%
                        </span>
                        {isAttendanceShortage && (
                          <span className="block text-[9px] text-rose-600 font-semibold mt-0.5">Shortage</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-800">{student.cgpa}</td>
                      <td className="py-3.5 px-3">
                        {student.allocatedHall ? (
                          <div>
                            <span className="font-bold text-slate-900">{student.allocatedHall}</span>
                            <span className="block text-[10px] text-amber-800 font-bold bg-amber-50 px-1.5 py-0.2 rounded w-fit mt-0.5">
                              Seat #{student.allocatedSeat}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        {hasPendingDues ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[11px]">
                            ₹{student.totalDuesAmount.toLocaleString('en-IN')} Due
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                            Cleared (₹0)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        {student.isHallTicketCleared ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Pass Released
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg">
                            <X className="w-3 h-3 text-rose-600" />
                            Blocked ({hasPendingDues ? 'Dues' : 'Attendance'})
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleInformSeating(student.rollNumber)}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Inform Exam Seating to this student"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>Inform Seat</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DUE LIST & DEFAULTERS ("DUELIST ISSUES") VIEW                           */}
      {/* ========================================================================= */}
      {activeAdminSubTab === 'duelist' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 text-rose-900 border border-rose-200">
                  Duelist Management &amp; Notice Dispatcher
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  {filteredDueList.length} Defaulters Listed
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mt-1 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Student Due List &amp; Clearance Issues</span>
              </h3>
              <p className="text-xs text-slate-500">
                Inspect unpaid tuition fees, library fines, lab breakages, and hostel dues. Inform defaulters and issue hall ticket clearance.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={dueStatusFilter}
                onChange={(e) => setDueStatusFilter(e.target.value as 'all' | 'pending' | 'cleared')}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-bold"
              >
                <option value="pending">Pending Dues Only</option>
                <option value="cleared">Cleared Records</option>
                <option value="all">All Records</option>
              </select>

              <select
                value={selectedDueTypeFilter}
                onChange={(e) => setSelectedDueTypeFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
              >
                <option value="all">All Due Categories</option>
                <option value="Tuition Fee">Tuition Fee</option>
                <option value="Library Fine">Library Fine</option>
                <option value="Lab Clearance">Lab Clearance</option>
                <option value="Hostel / Mess">Hostel / Mess</option>
                <option value="Attendance Shortage">Attendance Shortage</option>
              </select>
            </div>
          </div>

          {/* Due List Table */}
          <div className="overflow-x-auto">
            {filteredDueList.length > 0 ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Roll Number</th>
                    <th className="py-3 px-3">Due Category</th>
                    <th className="py-3 px-3">Amount Due</th>
                    <th className="py-3 px-3">Due Date</th>
                    <th className="py-3 px-3">Clearance Status</th>
                    <th className="py-3 px-3">Remarks / Particulars</th>
                    <th className="py-3 px-3 text-right">Inform &amp; Clearance Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDueList.map((item) => {
                    const isPending = item.status === 'pending';

                    return (
                      <tr key={item.dueId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-900">{item.studentName}</div>
                          <div className="text-[10px] text-slate-400">{item.section}</div>
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-indigo-700">{item.rollNumber}</td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              item.dueType === 'Tuition Fee'
                                ? 'bg-rose-100 text-rose-800'
                                : item.dueType === 'Library Fine'
                                ? 'bg-amber-100 text-amber-800'
                                : item.dueType === 'Attendance Shortage'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {item.dueType}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-extrabold text-slate-900">
                          {item.amountDue > 0 ? `₹${item.amountDue.toLocaleString('en-IN')}` : 'N/A (Attendance)'}
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">{item.dueDate}</td>
                        <td className="py-3.5 px-3">
                          {isPending ? (
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 font-extrabold text-[10px]">
                              ⚠️ Clearance Blocked
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                              ✓ Cleared
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 max-w-[220px]">
                          <p className="text-[11px] text-slate-600 truncate" title={item.remarks}>
                            {item.remarks || 'No notes attached'}
                          </p>
                          {item.lastNoticeSentAt && (
                            <span className="text-[9px] text-indigo-600 font-semibold block mt-0.5">
                              Notice sent: {item.lastNoticeSentAt.split('T')[0]}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedStudentForNotice(item);
                                    setCustomNoticeText(
                                      `Official Notice: You have a pending ${item.dueType} balance of ₹${item.amountDue.toLocaleString('en-IN')} due on ${item.dueDate}. Clear at Finance Counter to release your Examination Hall Pass.`
                                    );
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                                  title="Inform Due Issue to this student"
                                >
                                  <Send className="w-3 h-3 text-rose-600" />
                                  <span>Inform Due Issue</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setClearingDueItem(item);
                                    setReceiptNumber(`REC-${Date.now().toString().slice(-5)}`);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                                  title="Mark Dues Cleared & Issue Hall Ticket"
                                >
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Clear Due</span>
                                </button>
                              </>
                            )}

                            {!isPending && (
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                                Hall Pass Issued
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-10 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-800">No outstanding due list defaulters under this filter!</p>
                <p className="text-[11px] text-slate-400">All student records are verified and eligible.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. EXAM SEATING INFORMER & ARRANGEMENTS VIEW                              */}
      {/* ========================================================================= */}
      {activeAdminSubTab === 'seating' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                <span>Examination Seating Arrangement &amp; Student Informer</span>
              </h3>
              <p className="text-xs text-slate-500">
                Informs students regarding their hall number, row, and seat allocation with 30-minute exam timing rules.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleBroadcastAllSeating('exam-cs601')}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Broadcast Seating Notices (CS601)</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('exam-seating')}
                className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Full Seating Desk</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Exam CS601 Spotlight */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  CS601
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  ✓ Published &amp; Allocated
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">Data Structures &amp; Algorithms</h4>
              <p className="text-xs text-slate-600">
                📅 2026-10-06 • 10:00 AM – 01:00 PM • Reporting: 09:30 AM
              </p>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>Assigned: Block A – Room 204 &amp; Central Block – Room 301</span>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-slate-200 text-xs">
                <span className="font-bold text-slate-700">36 Candidates Seated</span>
                <button
                  onClick={() => handleBroadcastAllSeating('exam-cs601')}
                  className="text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Send Seating Alerts</span>
                </button>
              </div>
            </div>

            {/* Exam CS602 Spotlight */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  CS602
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  ✓ Published &amp; Allocated
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">Distributed Database Systems &amp; Cloud</h4>
              <p className="text-xs text-slate-600">
                📅 2026-10-09 • 02:00 PM – 05:00 PM • Reporting: 01:30 PM
              </p>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>Assigned: Central Tech Block – Room 301</span>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-slate-200 text-xs">
                <span className="font-bold text-slate-700">36 Candidates Seated</span>
                <button
                  onClick={() => handleBroadcastAllSeating('exam-cs602')}
                  className="text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Send Seating Alerts</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DISPATCHED NOTICES & ACTION LOG LEDGER                                  */}
      {/* ========================================================================= */}
      {activeAdminSubTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span>Administrative Notice Dispatch Log</span>
              </h3>
              <p className="text-xs text-slate-500">
                Official delivery ledger of seating arrangement notices and duelist issue warnings sent to student IDs.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
              {noticeLogs.length} Total Dispatches
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {noticeLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        log.noticeType === 'due_issue'
                          ? 'bg-rose-100 text-rose-800'
                          : log.noticeType === 'clearance_alert'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {log.noticeType === 'due_issue'
                        ? 'Due Notice'
                        : log.noticeType === 'clearance_alert'
                        ? 'Clearance Issued'
                        : 'Seating Arrangement'}
                    </span>
                    <strong className="text-slate-900">{log.recipientName}</strong>
                    <span className="font-mono text-indigo-700 font-bold">({log.recipientRoll})</span>
                  </div>
                  <h5 className="font-bold text-slate-800">{log.subject}</h5>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{log.details}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                    {new Date(log.sentAt).toLocaleDateString()}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Delivered to Student ID
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SYSTEM CHECK / FIRESTORE RULES INSPECTOR                                */}
      {/* ========================================================================= */}
      {activeAdminSubTab === 'system-check' && (
        <SystemCheckPanel currentUser={currentUser} />
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: INFORM DUE ISSUE TO STUDENT                                      */}
      {/* ========================================================================= */}
      {selectedStudentForNotice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-rose-900 to-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-300" />
                <span>Inform Due Issue to {selectedStudentForNotice.studentName}</span>
              </h3>
              <button
                onClick={() => setSelectedStudentForNotice(null)}
                className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendDueNotice(selectedStudentForNotice.dueId, customNoticeText);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-slate-700">
                <p>
                  <strong>Recipient:</strong> {selectedStudentForNotice.studentName} (Roll: {selectedStudentForNotice.rollNumber})
                </p>
                <p>
                  <strong>Due Category:</strong> {selectedStudentForNotice.dueType} •{' '}
                  <span className="font-extrabold text-rose-700">₹{selectedStudentForNotice.amountDue.toLocaleString('en-IN')}</span>
                </p>
                <p>
                  <strong>Due Deadline:</strong> {selectedStudentForNotice.dueDate}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Official Warning / Notice Message:
                </label>
                <textarea
                  rows={4}
                  required
                  value={customNoticeText}
                  onChange={(e) => setCustomNoticeText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForNotice(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Due Notice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CLEAR DUE & ISSUE HALL TICKET                                     */}
      {/* ========================================================================= */}
      {clearingDueItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-emerald-800 to-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Clear Dues &amp; Release Hall Ticket</span>
              </h3>
              <button
                onClick={() => setClearingDueItem(null)}
                className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirmClearDue(clearingDueItem.dueId, receiptNumber);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <p>
                  <strong>Student:</strong> {clearingDueItem.studentName} ({clearingDueItem.rollNumber})
                </p>
                <p>
                  <strong>Clearing:</strong> {clearingDueItem.dueType} (₹{clearingDueItem.amountDue.toLocaleString('en-IN')})
                </p>
                <p className="text-[11px] text-emerald-700">
                  This will mark the student's due balance as ₹0 and release their official Examination Hall Ticket.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Finance / Clearance Receipt Number:
                </label>
                <input
                  type="text"
                  required
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  placeholder="e.g. REC-2026-8941"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setClearingDueItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Clearance &amp; Release Pass</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
