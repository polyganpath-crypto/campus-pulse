import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  User,
  Building2,
  Download,
  Bell,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Eye,
  Send,
  Users,
  Grid,
  ChevronRight,
  Info,
  FileText,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  UserProfile,
  Examination,
  ExamHall,
  SeatingAssignment,
  ExamSeatingNotification
} from '../../types';
import {
  examSeatingService,
  EnrichedStudentSeating
} from '../../services/examSeatingService';
import { REGISTERED_STUDENT_ROSTER } from '../../data/examSeatingData';

interface ExamSeatingTabProps {
  currentUser: UserProfile;
  onNavigateTab?: (tab: string) => void;
}

export const ExamSeatingTab: React.FC<ExamSeatingTabProps> = ({
  currentUser,
  onNavigateTab
}) => {
  const isStudent = currentUser.role === 'student';
  const isFacultyOrStaff = currentUser.role === 'faculty' || currentUser.role === 'coordinator' || currentUser.role === 'admin';

  // Student State
  const [studentSeatingList, setStudentSeatingList] = useState<EnrichedStudentSeating[]>([]);
  const [selectedSeating, setSelectedSeating] = useState<EnrichedStudentSeating | null>(null);

  // Staff & Admin State
  const [allExams, setAllExams] = useState<Examination[]>([]);
  const [allHalls, setAllHalls] = useState<ExamHall[]>([]);
  const [staffAssignments, setStaffAssignments] = useState<{
    assignment: SeatingAssignment;
    exam: Examination;
    hall: ExamHall;
  }[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedHallFilter, setSelectedHallFilter] = useState<string>('all');
  const [selectedExamFilter, setSelectedExamFilter] = useState<string>('all');

  // Modals
  const [showCreateExamModal, setShowCreateExamModal] = useState<boolean>(false);
  const [showCreateHallModal, setShowCreateHallModal] = useState<boolean>(false);
  const [showAssignSeatModal, setShowAssignSeatModal] = useState<boolean>(false);
  const [editingAssignment, setEditingAssignment] = useState<SeatingAssignment | null>(null);

  // Form State for Create Exam
  const [newSubject, setNewSubject] = useState<string>('Design & Analysis of Algorithms');
  const [newSubjectCode, setNewSubjectCode] = useState<string>('CS601');
  const [newExamDate, setNewExamDate] = useState<string>('2026-10-06');
  const [newStartTime, setNewStartTime] = useState<string>('10:00 AM');
  const [newEndTime, setNewEndTime] = useState<string>('01:00 PM');
  const [newReportingTime, setNewReportingTime] = useState<string>('09:30 AM');
  const [newSemester, setNewSemester] = useState<number>(6);

  // Form State for Create Hall
  const [newBuilding, setNewBuilding] = useState<string>('Block A');
  const [newFloor, setNewFloor] = useState<string>('2nd Floor');
  const [newRoomNumber, setNewRoomNumber] = useState<string>('Room 204');
  const [newTotalSeats, setNewTotalSeats] = useState<number>(30);
  const [newRows, setNewRows] = useState<number>(5);
  const [newCols, setNewCols] = useState<number>(6);

  // Form State for Assign Seat
  const [assignStudentRoll, setAssignStudentRoll] = useState<string>('22CS084');
  const [assignExamId, setAssignExamId] = useState<string>('exam-cs601');
  const [assignHallId, setAssignHallId] = useState<string>('hall-204');
  const [assignRow, setAssignRow] = useState<number>(4);
  const [assignSeat, setAssignSeat] = useState<number>(12);

  // Toast / Notification feedback
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  // Active perspective switcher for faculty/staff (Mentor vs HOD vs Admin)
  const [staffPerspective, setStaffPerspective] = useState<'mentor' | 'hod' | 'admin'>(
    currentUser.role === 'admin' || currentUser.role === 'coordinator'
      ? 'admin'
      : currentUser.facultyType === 'hod'
      ? 'hod'
      : 'mentor'
  );

  const loadData = () => {
    if (isStudent) {
      const list = examSeatingService.getStudentSeating(currentUser.id, currentUser.rollNumber);
      setStudentSeatingList(list);
      if (list.length > 0) {
        setSelectedSeating(list[0]);
      }
    } else {
      const exams = examSeatingService.getExaminations();
      const halls = examSeatingService.getExamHalls();
      setAllExams(exams);
      setAllHalls(halls);

      const effectiveUser: UserProfile = {
        ...currentUser,
        role: staffPerspective === 'admin' ? 'admin' : currentUser.role,
        facultyType: staffPerspective === 'hod' ? 'hod' : staffPerspective === 'mentor' ? 'mentor' : currentUser.facultyType
      };

      const assignments = examSeatingService.getStaffSeatingAssignments(effectiveUser, {
        search: searchQuery,
        hallId: selectedHallFilter,
        examId: selectedExamFilter
      });
      setStaffAssignments(assignments);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser.id, currentUser.role, staffPerspective, searchQuery, selectedHallFilter, selectedExamFilter]);

  // Handle Simulation Mode Trigger
  const handleTriggerSimulation = () => {
    const studentId = currentUser.id || 'std-2026-084';
    const notif = examSeatingService.simulate30MinTrigger(studentId, currentUser.rollNumber || '22CS084');
    loadData();
    setToastMessage({
      text: `🔔 30-Minute Notification Triggered! Exam starts in 30 mins: ${notif.subject} at ${notif.hallInfo} (Seat ${notif.seatNumber}).`,
      type: 'success'
    });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleResetSimulation = () => {
    examSeatingService.resetSimulation(currentUser.id || 'std-2026-084');
    loadData();
    setToastMessage({
      text: 'Simulation reset. You can trigger the 30-min test notification again anytime.',
      type: 'info'
    });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toggle Exam Publish
  const handleTogglePublish = (examId: string) => {
    try {
      const updated = examSeatingService.togglePublishExam(examId);
      loadData();
      setToastMessage({
        text: `Exam "${updated.subject}" seating arrangement is now ${updated.isPublished ? 'PUBLISHED to students' : 'UNPUBLISHED (Hidden from students)'}.`,
        type: 'success'
      });
      setTimeout(() => setToastMessage(null), 4000);
    } catch (e: unknown) {
      setToastMessage({ text: e instanceof Error ? e.message : 'Error updating exam', type: 'error' });
    }
  };

  // Batch Auto-Assign
  const handleBatchAutoAssign = (examId: string, hallId: string) => {
    const count = examSeatingService.batchAutoAssignRoster(examId, hallId);
    loadData();
    setToastMessage({
      text: `Successfully auto-allocated ${count} registered students to seat grid in selected hall!`,
      type: 'success'
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Create Exam Submit
  const handleCreateExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newSubjectCode.trim()) return;

    examSeatingService.createExamination({
      subject: newSubject.trim(),
      subjectCode: newSubjectCode.trim().toUpperCase(),
      examDate: newExamDate,
      startTime: newStartTime,
      endTime: newEndTime,
      reportingTime: newReportingTime,
      department: currentUser.department || 'Computer Science & Engineering',
      semester: newSemester
    });

    setShowCreateExamModal(false);
    loadData();
    setToastMessage({
      text: `Examination "${newSubject}" created and published successfully!`,
      type: 'success'
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Create Hall Submit
  const handleCreateHallSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    examSeatingService.createExamHall({
      building: newBuilding.trim(),
      floor: newFloor.trim(),
      roomNumber: newRoomNumber.trim(),
      totalSeats: Number(newTotalSeats),
      rowsCount: Number(newRows),
      colsCount: Number(newCols),
      inChargeFaculty: currentUser.name
    });

    setShowCreateHallModal(false);
    loadData();
    setToastMessage({
      text: `Exam Hall "${newBuilding} - ${newRoomNumber}" registered successfully!`,
      type: 'success'
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Assign Seat Submit
  const handleAssignSeatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = REGISTERED_STUDENT_ROSTER.find(
      (s) => s.rollNumber.toLowerCase() === assignStudentRoll.trim().toLowerCase()
    ) || {
      studentId: `std-${assignStudentRoll}`,
      name: `Student ${assignStudentRoll}`,
      rollNumber: assignStudentRoll.toUpperCase(),
      department: 'Computer Science & Engineering',
      section: 'Section A'
    };

    examSeatingService.assignStudentSeat({
      examId: assignExamId,
      studentId: student.studentId,
      studentName: student.name,
      rollNumber: student.rollNumber,
      department: student.department,
      section: student.section,
      hallId: assignHallId,
      rowNumber: Number(assignRow),
      seatNumber: Number(assignSeat)
    });

    setShowAssignSeatModal(false);
    loadData();
    setToastMessage({
      text: `Assigned seat #${assignSeat} (Row ${assignRow}) to ${student.name} (${student.rollNumber}).`,
      type: 'success'
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Resend 30-min notification manually
  const handleResendNotification = (item: { assignment: SeatingAssignment; exam: Examination; hall: ExamHall }) => {
    examSeatingService.simulate30MinTrigger(item.assignment.studentId, item.assignment.rollNumber);
    setToastMessage({
      text: `Notification re-sent to ${item.assignment.studentName} (${item.assignment.rollNumber}): Seat ${item.assignment.seatNumber}, ${item.hall.building} - ${item.hall.roomNumber}.`,
      type: 'success'
    });
    setTimeout(() => setToastMessage(null), 4000);
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
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
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
                <MapPin className="w-3.5 h-3.5 text-indigo-300" />
                Directorate of Controller of Examinations
              </span>
              <span className="text-xs text-slate-400 font-mono">Academic Year 2025-2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {isStudent ? 'Exam Seating Arrangement' : 'Exam Seating Management Desk'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isStudent
                ? 'Check your allocated examination hall, row, and seat number. An automated notification will alert you exactly 30 minutes prior to exam start.'
                : 'Centralized examination hall allocation, student roster assignment, visual capacity mapping, and 30-minute automated notification broadcast.'}
            </p>
          </div>

          {/* Test / Simulation Trigger Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              id="btn-simulate-30min-alert"
              onClick={handleTriggerSimulation}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-xs shadow-md shadow-amber-900/40 transition-all cursor-pointer flex items-center justify-center gap-2"
              title="Test the 30-minute notification immediately without waiting"
            >
              <Bell className="w-4 h-4 text-slate-950 animate-bounce" />
              <span>🧪 Test 30-Min Notification</span>
            </button>

            <button
              onClick={handleResetSimulation}
              className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              title="Reset simulation data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. STUDENT VIEW: PROMINENT SEATING ARRANGEMENT CARD & VISUAL HALL MAP    */}
      {/* ========================================================================= */}
      {isStudent && (
        <div className="space-y-6">
          {studentSeatingList.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Prominent Seating Card (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Examination Switcher Tabs if multiple */}
                {studentSeatingList.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {studentSeatingList.map((seating) => (
                      <button
                        key={seating.assignmentId}
                        onClick={() => setSelectedSeating(seating)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                          selectedSeating?.assignmentId === seating.assignmentId
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{seating.subjectCode}</span>
                        {seating.isUrgent30MinAlert && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {selectedSeating && (
                  <div
                    className={`bg-white rounded-3xl border transition-all shadow-md overflow-hidden ${
                      selectedSeating.isUrgent30MinAlert
                        ? 'border-amber-400 ring-4 ring-amber-400/20'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Header Banner */}
                    <div
                      className={`p-6 text-white relative ${
                        selectedSeating.isUrgent30MinAlert
                          ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600'
                          : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                          {selectedSeating.isUrgent30MinAlert
                            ? '⚡ Exam Starts in 30 Mins — Proceed to Hall'
                            : 'Official Exam Seating Arrangement'}
                        </span>
                        <span className="text-xs font-mono font-bold text-white/90">
                          Semester {selectedSeating.semester}
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
                        {selectedSeating.subject}
                      </h2>
                      <p className="text-xs text-indigo-100 font-mono">
                        Course Code: {selectedSeating.subjectCode} • {selectedSeating.department}
                      </p>
                    </div>

                    {/* PROMINENT HALL & SEAT NUMBER SECTION */}
                    <div className="p-6 sm:p-8 space-y-6">
                      <div className="text-center space-y-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                          Allocated Examination Hall
                        </span>

                        {/* Visually Prominent Hall Number */}
                        <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 inline-block w-full">
                          <div className="flex items-center justify-center gap-2 text-indigo-700 mb-1">
                            <MapPin className="w-5 h-5 text-indigo-600 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-wider">
                              {selectedSeating.floor} • {selectedSeating.building}
                            </span>
                          </div>
                          <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                            {selectedSeating.hallInfo}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Hall In-Charge: {selectedSeating.inChargeFaculty || 'Department Invigilator'}
                          </p>
                        </div>
                      </div>

                      {/* Visually Prominent Seat & Row Numbers Side-by-Side */}
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-md border border-indigo-800/40">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300 block">
                            EXAM ROW
                          </span>
                          <span className="text-4xl sm:text-5xl font-black text-white tracking-tight mt-1 block font-heading tabular-nums">
                            {selectedSeating.rowNumber}
                          </span>
                          <span className="text-[10px] text-indigo-200/80 font-mono">Row Index</span>
                        </div>

                        <div className="p-5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-md">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-100 block">
                            YOUR SEAT NUMBER
                          </span>
                          <span className="text-4xl sm:text-5xl font-black text-white tracking-tight mt-1 block font-heading tabular-nums">
                            {selectedSeating.seatNumber}
                          </span>
                          <span className="text-[10px] text-cyan-100 font-mono font-bold">
                            Bench: {selectedSeating.benchCode || `B-${selectedSeating.seatNumber}`}
                          </span>
                        </div>
                      </div>

                      {/* Clean Details Checklist (Matching prompt Section 1 format) */}
                      <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-600" />
                          <span>EXAM SEATING ARRANGEMENT DETAILS</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80">
                            <span className="text-slate-500">Student Name:</span>
                            <strong className="text-slate-900">{currentUser.name}</strong>
                          </div>

                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80">
                            <span className="text-slate-500">Roll Number:</span>
                            <strong className="text-slate-900 font-mono">{currentUser.rollNumber}</strong>
                          </div>

                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80">
                            <span className="text-slate-500">Exam Date:</span>
                            <strong className="text-slate-900">{selectedSeating.examDate}</strong>
                          </div>

                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80">
                            <span className="text-slate-500">Exam Time:</span>
                            <strong className="text-slate-900">{selectedSeating.startTime}</strong>
                          </div>

                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-200 col-span-1 sm:col-span-2">
                            <span className="text-amber-900 font-bold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              Reporting Time (Mandatory):
                            </span>
                            <strong className="text-amber-950 font-black text-sm tabular-nums">
                              {selectedSeating.reportingTime}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* PDF Hall Ticket & Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() =>
                            examSeatingService.generateHallPassPdf(
                              selectedSeating,
                              currentUser.name,
                              currentUser.rollNumber || '22CS084'
                            )
                          }
                          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs shadow-indigo-600/25 transition-all cursor-pointer flex items-center gap-2"
                        >
                          <Download className="w-4 h-4 text-white" />
                          <span>Download Printable Hall Seating Ticket (PDF)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onNavigateTab?.('calendar')}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Full Exam Calendar</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Visual Hall Layout Seat Map & Guidelines (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Visual Seat Grid */}
                {selectedSeating && (
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                        <Grid className="w-4 h-4 text-indigo-600" />
                        Visual Room Layout ({selectedSeating.hallInfo})
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400">
                        {selectedSeating.floor}
                      </span>
                    </div>

                    {/* Blackboard & Invigilator Podium Front */}
                    <div className="p-2 rounded-xl bg-slate-800 text-white text-center text-[10px] font-bold tracking-widest uppercase">
                      FRONT: BLACKBOARD &amp; INVIGILATOR DESK
                    </div>

                    {/* Graphical Seat Matrix */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                      {[1, 2, 3, 4, 5].map((rowNum) => (
                        <div key={rowNum} className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400 w-8 shrink-0">
                            Row {rowNum}
                          </span>
                          <div className="grid grid-cols-6 gap-1.5 flex-1">
                            {[1, 2, 3, 4, 5, 6].map((colNum) => {
                              const calculatedSeat = (rowNum - 1) * 6 + colNum;
                              const isMySeat =
                                Number(selectedSeating.seatNumber) === calculatedSeat ||
                                (Number(selectedSeating.rowNumber) === rowNum &&
                                  calculatedSeat === Number(selectedSeating.seatNumber));

                              return (
                                <div
                                  key={colNum}
                                  className={`h-9 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold transition-all relative ${
                                    isMySeat
                                      ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-500 shadow-md font-black animate-pulse'
                                      : 'bg-white border border-slate-200 text-slate-400'
                                  }`}
                                  title={
                                    isMySeat
                                      ? `Your Seat: #${calculatedSeat} (Row ${rowNum})`
                                      : `Seat #${calculatedSeat}`
                                  }
                                >
                                  <span>{calculatedSeat}</span>
                                  {isMySeat && (
                                    <span className="text-[7px] uppercase tracking-tighter">YOU</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {/* Legend */}
                      <div className="pt-2 flex items-center justify-center gap-4 text-[10px] text-slate-500 border-t border-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-md bg-amber-400 ring-1 ring-amber-500" />
                          <span>Your Allocated Seat</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-md bg-white border border-slate-300" />
                          <span>Standard Hall Seat</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Important Exam Day Instructions Card */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Mandatory Hall Instructions
                  </h3>
                  <ul className="text-xs text-slate-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>
                        <strong>30-Minute Turnstile Entry:</strong> Reach your hall by{' '}
                        <strong className="text-slate-900">
                          {selectedSeating?.reportingTime || '09:30 AM'}
                        </strong>
                        . Entry will strictly close 5 minutes prior to the paper start.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>
                        <strong>Required Credentials:</strong> Bring your printed Hall Pass and physical University RFID Smart ID card.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>
                        <strong>Strictly Prohibited:</strong> Smartwatches, smartphones, earphones, bags, and unauthorized programmable notes.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                No seating arrangement has been published for your upcoming examination yet.
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                The Examination Cell will publish seat and hall allocations 48 hours prior to each scheduled course examination. An automated alert will ping your account 30 minutes before exam start.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleTriggerSimulation}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Simulate Exam Now (Demo Mode)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ADMIN / EXAMINATION CELL / MENTOR / HOD MANAGEMENT DESK               */}
      {/* ========================================================================= */}
      {isFacultyOrStaff && (
        <div className="space-y-6">
          {/* Staff Perspective Switcher & Action Bar */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  Examination Cell &amp; Seating Controller Desk
                </h2>
                <p className="text-xs text-slate-500">
                  Manage examination halls, configure seat capacities, assign candidate rosters, and broadcast notifications.
                </p>
              </div>

              {/* Perspective Pills */}
              <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setStaffPerspective('admin')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    staffPerspective === 'admin'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Admin / Exam Cell
                </button>
                <button
                  type="button"
                  onClick={() => setStaffPerspective('hod')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    staffPerspective === 'hod'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  HOD (Dept View)
                </button>
                <button
                  type="button"
                  onClick={() => setStaffPerspective('mentor')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    staffPerspective === 'mentor'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Class Mentor (CSE-A)
                </button>
              </div>
            </div>

            {/* Quick Actions (Create Exam, Create Hall, Assign Seat, Auto-Assign) */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <button
                id="btn-create-exam-modal"
                onClick={() => setShowCreateExamModal(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create Examination</span>
              </button>

              <button
                id="btn-create-hall-modal"
                onClick={() => setShowCreateHallModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Exam Hall</span>
              </button>

              <button
                id="btn-assign-seat-modal"
                onClick={() => setShowAssignSeatModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <User className="w-4 h-4 text-slate-600" />
                <span>Assign Student Seat</span>
              </button>

              <button
                onClick={() => handleBatchAutoAssign('exam-cs601', 'hall-204')}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                title="Automatically allocate the entire class roster into hall seats"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Auto-Allocate Class Roster</span>
              </button>
            </div>
          </div>

          {/* Examinations List & Publication Status */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Scheduled Examinations &amp; Seating Publication Status
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {allExams.map((exam) => (
                <div
                  key={exam.examId}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-slate-500 uppercase px-1.5 py-0.5 rounded bg-white border border-slate-200">
                        {exam.subjectCode}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                        {exam.subject}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleTogglePublish(exam.examId)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                        exam.isPublished
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      }`}
                    >
                      {exam.isPublished ? '✓ Published' : 'Draft / Unpublished'}
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-0.5 font-medium">
                    <p>📅 {exam.examDate} ({exam.startTime} – {exam.endTime})</p>
                    <p>⏰ Reporting: {exam.reportingTime}</p>
                    <p>🏛️ Assigned Halls: {exam.assignedHalls.join(', ')}</p>
                  </div>

                  <div className="pt-1 flex items-center justify-between border-t border-slate-200 text-xs">
                    <span className="text-[10px] text-slate-500 font-mono">ID: {exam.examId}</span>
                    <button
                      onClick={() => handleTogglePublish(exam.examId)}
                      className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      {exam.isPublished ? 'Unpublish' : 'Publish to Students'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seating Assignments Table with Search & Filters */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Candidate Seating Roster &amp; Allocation Ledger ({staffAssignments.length} Students)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Search by Student ID, Hall, Room, or Subject
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search Roll No, Name, Hall..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                {/* Exam select */}
                <select
                  value={selectedExamFilter}
                  onChange={(e) => setSelectedExamFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  <option value="all">All Exams</option>
                  {allExams.map((ex) => (
                    <option key={ex.examId} value={ex.examId}>
                      {ex.subjectCode} - {ex.subject}
                    </option>
                  ))}
                </select>

                {/* Hall select */}
                <select
                  value={selectedHallFilter}
                  onChange={(e) => setSelectedHallFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  <option value="all">All Halls</option>
                  {allHalls.map((h) => (
                    <option key={h.hallId} value={h.hallId}>
                      {h.building} - {h.roomNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {staffAssignments.length > 0 ? (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">Student Name</th>
                      <th className="py-3 px-3">Student ID / Roll No</th>
                      <th className="py-3 px-3">Subject</th>
                      <th className="py-3 px-3">Exam Date &amp; Time</th>
                      <th className="py-3 px-3">Exam Hall</th>
                      <th className="py-3 px-3">Row</th>
                      <th className="py-3 px-3">Seat</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {staffAssignments.map(({ assignment, exam, hall }) => (
                      <tr key={assignment.assignmentId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-900">{assignment.studentName}</td>
                        <td className="py-3 px-3 font-mono font-bold text-indigo-700">{assignment.rollNumber}</td>
                        <td className="py-3 px-3 max-w-[160px] truncate">{exam.subject}</td>
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                          {exam.examDate} ({exam.startTime})
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-semibold text-slate-800">
                            {hall.building} – {hall.roomNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 block">{hall.floor}</span>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">{assignment.rowNumber}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[11px]">
                            Seat {assignment.seatNumber}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleResendNotification({ assignment, exam, hall })}
                              className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                              title="Send 30-min alert to this student"
                            >
                              <Send className="w-3 h-3" />
                              <span>Notify</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setAssignExamId(assignment.examId);
                                setAssignHallId(assignment.hallId);
                                setAssignStudentRoll(assignment.rollNumber);
                                setAssignRow(Number(assignment.rowNumber));
                                setAssignSeat(Number(assignment.seatNumber));
                                setShowAssignSeatModal(true);
                              }}
                              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
                              title="Edit Seat Assignment"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-10 space-y-2">
                  <Users className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">No candidate seating matches this filter.</p>
                  <p className="text-[11px] text-slate-400">
                    Try searching a different roll number or click "Auto-Allocate Class Roster".
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE EXAMINATION                                               */}
      {/* ========================================================================= */}
      {showCreateExamModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-300" />
                Create New Examination
              </h3>
              <button
                onClick={() => setShowCreateExamModal(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExamSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design & Analysis of Algorithms"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject Code:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS601"
                    value={newSubjectCode}
                    onChange={(e) => setNewSubjectCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Semester:</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    required
                    value={newSemester}
                    onChange={(e) => setNewSemester(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Exam Date:</label>
                <input
                  type="date"
                  required
                  value={newExamDate}
                  onChange={(e) => setNewExamDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Time:</label>
                  <input
                    type="text"
                    required
                    placeholder="10:00 AM"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Time:</label>
                  <input
                    type="text"
                    required
                    placeholder="01:00 PM"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reporting:</label>
                  <input
                    type="text"
                    required
                    placeholder="09:30 AM"
                    value={newReportingTime}
                    onChange={(e) => setNewReportingTime(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateExamModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Publish Examination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD EXAM HALL                                                    */}
      {/* ========================================================================= */}
      {showCreateHallModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-300" />
                Add Examination Hall
              </h3>
              <button
                onClick={() => setShowCreateHallModal(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateHallSubmit} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Building / Block:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Block A"
                    value={newBuilding}
                    onChange={(e) => setNewBuilding(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Floor:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2nd Floor"
                    value={newFloor}
                    onChange={(e) => setNewFloor(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Room Number:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Room 204 or LH-301"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Seats:</label>
                  <input
                    type="number"
                    min={10}
                    max={120}
                    required
                    value={newTotalSeats}
                    onChange={(e) => setNewTotalSeats(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rows:</label>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    required
                    value={newRows}
                    onChange={(e) => setNewRows(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Columns:</label>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    required
                    value={newCols}
                    onChange={(e) => setNewCols(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateHallModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
                >
                  Save Hall
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ASSIGN STUDENT TO SEAT                                           */}
      {/* ========================================================================= */}
      {showAssignSeatModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-300" />
                Assign Candidate Seat
              </h3>
              <button
                onClick={() => setShowAssignSeatModal(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignSeatSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Roll Number:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 22CS084"
                  value={assignStudentRoll}
                  onChange={(e) => setAssignStudentRoll(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Examination:</label>
                <select
                  value={assignExamId}
                  onChange={(e) => setAssignExamId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  {allExams.map((ex) => (
                    <option key={ex.examId} value={ex.examId}>
                      {ex.subjectCode} - {ex.subject} ({ex.examDate})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Examination Hall:</label>
                <select
                  value={assignHallId}
                  onChange={(e) => setAssignHallId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  {allHalls.map((h) => (
                    <option key={h.hallId} value={h.hallId}>
                      {h.building} - {h.roomNumber} ({h.floor}, {h.totalSeats} seats)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Row Number:</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={assignRow}
                    onChange={(e) => setAssignRow(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Seat Number:</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    required
                    value={assignSeat}
                    onChange={(e) => setAssignSeat(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignSeatModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Save Seat Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
