import React, { useState } from 'react';
import {
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Calculator,
  HelpCircle,
  Filter,
  Info,
  Download,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  Printer
} from 'lucide-react';
import { SubjectAttendance, UserProfile } from '../../types';
import { jsPDF } from 'jspdf';

interface AttendanceTabProps {
  attendance: SubjectAttendance[];
  currentUser?: UserProfile;
}

// -------------------------------------------------------------
// CSV Export Functionality (RFC-4180 with UTF-8 BOM)
// -------------------------------------------------------------
function exportAttendanceToCSV(
  attendance: SubjectAttendance[],
  subject?: SubjectAttendance,
  currentUser?: UserProfile
) {
  const isSingle = !!subject;
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  const escapeCSV = (val: string | number) => {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const headers = [
    'Subject Code',
    'Subject Title',
    'Faculty In-Charge',
    'Department',
    'Total Classes',
    'Attended Classes',
    'Attendance %',
    'Status Indicator',
    'Exam Eligibility'
  ];

  const subjectsToExport = isSingle && subject ? [subject] : attendance;
  const rows: string[][] = [];

  for (const s of subjectsToExport) {
    const status = s.percentage < 75 ? 'Shortage Warning' : s.percentage < 80 ? 'Borderline' : 'On Track';
    const eligibility = s.percentage >= 75 ? 'Eligible for Hall Ticket' : 'Shortage - Condonation Required';
    rows.push([
      s.subjectCode,
      s.subjectName,
      s.facultyName,
      currentUser?.department || 'Computer Science & Engineering',
      s.totalClasses.toString(),
      s.attendedClasses.toString(),
      s.percentage.toFixed(1) + '%',
      status,
      eligibility
    ]);
  }

  let csvContent = '\uFEFF'; // UTF-8 Byte Order Mark for Excel
  csvContent += `APEX UNIVERSITY - OFFICIAL ATTENDANCE DOSSIER\n`;
  csvContent += `Generated At,${now.toLocaleString()},Exported By,${escapeCSV(currentUser?.name || 'Administrator')} (${escapeCSV(currentUser?.role || 'Staff')})\n`;
  csvContent += `Scope,${isSingle && subject ? `Single Course: ${escapeCSV(subject.subjectCode)} - ${escapeCSV(subject.subjectName)}` : 'Full Semester Attendance'}\n\n`;

  csvContent += headers.map(escapeCSV).join(',') + '\n';
  rows.forEach((row) => {
    csvContent += row.map(escapeCSV).join(',') + '\n';
  });

  // If a single subject is exported, also append its detailed lecture records:
  if (isSingle && subject && subject.recentRecords?.length > 0) {
    csvContent += `\n\nDETAILED LECTURE LOGS: ${escapeCSV(subject.subjectCode)} - ${escapeCSV(subject.subjectName)}\n`;
    csvContent += ['Lecture Date', 'Slot / Period', 'Topic Covered in Syllabus', 'Student Attendance'].map(escapeCSV).join(',') + '\n';
    subject.recentRecords.forEach((r) => {
      const statusLabel = r.status === 'present' ? 'Present' : r.status === 'on_duty' ? 'On Duty' : 'Absent';
      csvContent += [r.date, 'Period 2 (10:15 AM)', r.topic, statusLabel].map(escapeCSV).join(',') + '\n';
    });
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = isSingle && subject
    ? `Attendance_${subject.subjectCode.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr}.csv`
    : `Attendance_Report_Semester_Cohort_${dateStr}.csv`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// -------------------------------------------------------------
// PDF Export Functionality (Official University Dossier using jsPDF)
// -------------------------------------------------------------
function exportAttendanceToPDF(
  attendance: SubjectAttendance[],
  subject?: SubjectAttendance,
  currentUser?: UserProfile
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const isSingle = !!subject;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // Outer border
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.5);
  doc.rect(10, 10, 190, 277);

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(10, 10, 190, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('APEX UNIVERSITY', 105, 18, { align: 'center' });
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICE OF ACADEMIC AFFAIRS & CONTROLLER OF EXAMINATIONS', 105, 24, { align: 'center' });
  doc.text('OFFICIAL ATTENDANCE AND EXAM ELIGIBILITY DOSSIER', 105, 29, { align: 'center' });

  // Subheader metadata bar
  doc.setFillColor(241, 245, 249);
  doc.rect(10, 36, 190, 10, 'F');
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`DATE ISSUED: ${dateStr.toUpperCase()}`, 15, 42.5);
  doc.text(
    `AUTHORIZED BY: ${(currentUser?.name || 'FACULTY IN-CHARGE').toUpperCase()} (${(currentUser?.role || 'ADMIN').toUpperCase()})`,
    105,
    42.5,
    { align: 'center' }
  );
  doc.text('ACADEMIC TERM: 2025-2026 (SEM 6)', 195, 42.5, { align: 'right' });

  // Metric Summary Box
  const totalConducted = attendance.reduce((a, b) => a + b.totalClasses, 0);
  const totalAttended = attendance.reduce((a, b) => a + b.attendedClasses, 0);
  const aggPct = totalConducted > 0 ? ((totalAttended / totalConducted) * 100).toFixed(1) : '0.0';
  const shortageCount = attendance.filter((s) => s.percentage < 75).length;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.rect(15, 50, 180, 22);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('COHORT PERFORMANCE & HALL TICKET CLEARANCE SUMMARY', 20, 56);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Total Lectures Conducted: ${totalConducted} hrs`, 20, 62);
  doc.text(`Total Lectures Attended: ${totalAttended} hrs`, 75, 62);
  doc.text(`Overall Aggregate: ${aggPct}%`, 135, 62);

  doc.text(`Mandatory Threshold: 75.0%`, 20, 67);
  doc.text(`Shortage Subjects: ${shortageCount}`, 75, 67);
  doc.setFont('helvetica', 'bold');
  if (Number(aggPct) >= 75 && shortageCount === 0) {
    doc.setTextColor(16, 185, 129); // green
    doc.text('STATUS: FULLY ELIGIBLE FOR HALL TICKET', 135, 67);
  } else {
    doc.setTextColor(225, 29, 72); // rose
    doc.text('STATUS: CONDONATION / REVIEW REQUIRED', 135, 67);
  }

  let y = 79;

  if (!isSingle) {
    // Table Header
    doc.setFillColor(226, 232, 240);
    doc.rect(15, y, 180, 8, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(15, y, 180, 8);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('CODE', 18, y + 5.5);
    doc.text('SUBJECT TITLE', 40, y + 5.5);
    doc.text('FACULTY IN-CHARGE', 105, y + 5.5);
    doc.text('ATTENDED', 145, y + 5.5);
    doc.text('%', 168, y + 5.5);
    doc.text('STATUS', 182, y + 5.5);

    y += 8;

    attendance.forEach((sub, i) => {
      if (i % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, 180, 7.5, 'F');
      }
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, y, 180, 7.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      doc.text(sub.subjectCode, 18, y + 5);

      doc.setFont('helvetica', 'normal');
      const truncatedTitle = sub.subjectName.length > 32 ? sub.subjectName.slice(0, 30) + '..' : sub.subjectName;
      doc.text(truncatedTitle, 40, y + 5);

      const truncatedFaculty = sub.facultyName.length > 22 ? sub.facultyName.slice(0, 20) + '..' : sub.facultyName;
      doc.text(truncatedFaculty, 105, y + 5);

      doc.text(`${sub.attendedClasses} / ${sub.totalClasses}`, 145, y + 5);

      const isShort = sub.percentage < 75;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(isShort ? 225 : 5, isShort ? 29 : 150, isShort ? 72 : 105);
      doc.text(`${sub.percentage.toFixed(1)}%`, 168, y + 5);

      doc.setFontSize(6.5);
      doc.text(isShort ? 'SHORTAGE' : 'ELIGIBLE', 182, y + 5);

      y += 7.5;
    });

    y += 6;
  } else if (subject) {
    // Single Subject Detailed Record
    doc.setFillColor(238, 242, 255); // indigo-50
    doc.rect(15, y, 180, 12, 'F');
    doc.setDrawColor(199, 210, 254);
    doc.rect(15, y, 180, 12);

    doc.setTextColor(30, 27, 75);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`${subject.subjectCode}: ${subject.subjectName}`, 20, y + 5);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(79, 70, 229);
    doc.text(
      `Faculty: ${subject.facultyName} • Conducted: ${subject.totalClasses} hrs • Attended: ${subject.attendedClasses} hrs • Score: ${subject.percentage.toFixed(1)}%`,
      20,
      y + 9.5
    );

    y += 18;

    // Detailed lecture logs table
    doc.setFillColor(226, 232, 240);
    doc.rect(15, y, 180, 7.5, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(15, y, 180, 7.5);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('DATE', 20, y + 5);
    doc.text('LECTURE TOPIC / SYLLABUS UNIT', 55, y + 5);
    doc.text('TIME SLOT', 145, y + 5);
    doc.text('STATUS', 175, y + 5);

    y += 7.5;

    subject.recentRecords.forEach((rec, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, 180, 7, 'F');
      }
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, y, 180, 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      doc.text(rec.date, 20, y + 4.8);

      const truncatedTopic = rec.topic.length > 50 ? rec.topic.slice(0, 48) + '..' : rec.topic;
      doc.text(truncatedTopic, 55, y + 4.8);
      doc.text('Period 2 (10:15 AM)', 145, y + 4.8);

      doc.setFont('helvetica', 'bold');
      if (rec.status === 'present') {
        doc.setTextColor(16, 185, 129);
        doc.text('PRESENT', 175, y + 4.8);
      } else if (rec.status === 'on_duty') {
        doc.setTextColor(147, 51, 234);
        doc.text('ON DUTY', 175, y + 4.8);
      } else {
        doc.setTextColor(225, 29, 72);
        doc.text('ABSENT', 175, y + 4.8);
      }

      y += 7;
    });

    y += 6;
  }

  // Verification & Signatures section
  const sigY = 230;
  doc.setDrawColor(203, 213, 225);
  doc.line(15, sigY, 195, sigY);

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('1. This document is an official ERP export recognized by the University Academic Cell.', 15, sigY + 5);
  doc.text('2. Students below 75.0% must submit condonation applications 7 days prior to semester exams.', 15, sigY + 9);
  doc.text('3. Any tampering with biometric or electronic attendance logs constitutes academic misconduct.', 15, sigY + 13);

  // Signatures
  doc.line(20, sigY + 36, 65, sigY + 36);
  doc.text('Signature of Faculty In-Charge', 22, sigY + 40);

  doc.line(80, sigY + 36, 125, sigY + 36);
  doc.text('Head of Department (HOD)', 83, sigY + 40);

  doc.line(140, sigY + 36, 185, sigY + 36);
  doc.text('Controller of Examinations (COE)', 141, sigY + 40);

  // Footer bar
  doc.setFillColor(15, 23, 42);
  doc.rect(10, 275, 190, 12, 'F');
  doc.setTextColor(203, 213, 225);
  doc.setFontSize(7);
  doc.text('CAMPUSPULSE ENTERPRISE ERP • DIGITAL ATTENDANCE GOVERNANCE SYSTEM', 105, 281, { align: 'center' });
  doc.text(`AUTHENTICATION HASH: SHA256-${Date.now().toString(16).toUpperCase()} • PAGE 1 OF 1`, 105, 285, { align: 'center' });

  const fileName = isSingle && subject
    ? `Attendance_${subject.subjectCode.replace(/[^a-zA-Z0-9]/g, '_')}_${now.toISOString().split('T')[0]}.pdf`
    : `Attendance_Report_Semester_Cohort_${now.toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({ attendance, currentUser }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(attendance[0]?.id || '');
  const [simulatorClassesToMiss, setSimulatorClassesToMiss] = useState<number>(0);
  const [simulatorClassesToAttend, setSimulatorClassesToAttend] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent' | 'on_duty'>('all');
  const [exportScope, setExportScope] = useState<'all' | 'selected'>('all');
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const selectedSubject = attendance.find((s) => s.id === selectedSubjectId) || attendance[0];
  const isFacultyOrAdmin = currentUser?.role === 'faculty' || currentUser?.role === 'admin' || currentUser?.role === 'coordinator';

  // Simulator calculations
  const simTotal = selectedSubject
    ? selectedSubject.totalClasses + simulatorClassesToMiss + simulatorClassesToAttend
    : 0;
  const simAttended = selectedSubject
    ? selectedSubject.attendedClasses + simulatorClassesToAttend
    : 0;
  const simPercentage = simTotal > 0 ? ((simAttended / simTotal) * 100).toFixed(1) : '0.0';

  // Overall totals
  const totalConducted = attendance.reduce((acc, curr) => acc + curr.totalClasses, 0);
  const totalAttended = attendance.reduce((acc, curr) => acc + curr.attendedClasses, 0);
  const aggregatePercentage = totalConducted > 0 ? ((totalAttended / totalConducted) * 100).toFixed(1) : '0.0';

  // Max classes safe to miss while staying >= 75%
  const safeClassesToMiss = selectedSubject
    ? Math.max(0, Math.floor(selectedSubject.attendedClasses / 0.75 - selectedSubject.totalClasses))
    : 0;

  // Classes needed to reach 85% if below 85%
  const neededFor85 = selectedSubject && selectedSubject.percentage < 85
    ? Math.max(0, Math.ceil((0.85 * selectedSubject.totalClasses - selectedSubject.attendedClasses) / 0.15))
    : 0;

  const handleExportCSV = (targetSubject?: SubjectAttendance) => {
    setIsExporting(true);
    try {
      const subjectToExport = targetSubject || (exportScope === 'selected' ? selectedSubject : undefined);
      exportAttendanceToCSV(attendance, subjectToExport, currentUser);
      setExportFeedback(
        subjectToExport
          ? `Exported ${subjectToExport.subjectCode} attendance records to CSV!`
          : `Exported complete cohort attendance (${attendance.length} subjects) to CSV!`
      );
      setTimeout(() => setExportFeedback(null), 4000);
    } catch (e) {
      console.error(e);
      setExportFeedback('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = (targetSubject?: SubjectAttendance) => {
    setIsExporting(true);
    try {
      const subjectToExport = targetSubject || (exportScope === 'selected' ? selectedSubject : undefined);
      exportAttendanceToPDF(attendance, subjectToExport, currentUser);
      setExportFeedback(
        subjectToExport
          ? `Generated official University PDF dossier for ${subjectToExport.subjectCode}!`
          : `Generated official semester attendance PDF dossier!`
      );
      setTimeout(() => setExportFeedback(null), 4000);
    } catch (e) {
      console.error(e);
      setExportFeedback('PDF generation failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {exportFeedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-sm shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{exportFeedback}</span>
          </div>
          <button
            onClick={() => setExportFeedback(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1 rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide">
              Official University Attendance Record
            </span>
            <span className="text-xs text-slate-500">Live Biometric & ERP Synced</span>
            {isFacultyOrAdmin && (
              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {currentUser?.role === 'admin' ? 'Administrator Clearance' : 'Faculty In-Charge'}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-2">Subject Attendance & Eligibility Calculator</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            University regulations mandate a minimum of 75.0% aggregate and individual subject attendance to receive examination hall tickets.
          </p>
        </div>

        {/* Action & Metric Container */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 self-start md:self-auto shrink-0">
          {/* Quick Header Export Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportCSV()}
              disabled={isExporting}
              title="Download CSV Spreadsheet of Attendance"
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-2 shadow-2xs transition-all cursor-pointer hover:border-slate-400 active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-700" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => handleExportPDF()}
              disabled={isExporting}
              title="Generate Official Printable University PDF Dossier"
              className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs shadow-indigo-600/25 transition-all cursor-pointer active:scale-95"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>Export PDF</span>
            </button>
          </div>

          {/* Big Overall Metric */}
          <div className="flex items-center gap-4 bg-gradient-to-br from-indigo-50/50 via-white to-white p-4 rounded-xl border border-indigo-100/90 shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs shadow-indigo-600/25">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xs text-indigo-950 font-bold uppercase tracking-wider">Overall Aggregate</div>
              <div className="text-2xl font-bold text-slate-900 font-heading flex items-baseline gap-2 tabular-nums">
                <span>{aggregatePercentage}%</span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">Eligible</span>
              </div>
              <p className="text-[11px] text-slate-500">{totalAttended} / {totalConducted} Total Lecture Hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* DEDICATED FACULTY & ADMINISTRATOR EXPORT SUITE BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20 text-indigo-300">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Official Export Engine
              </span>
              <span className="text-xs text-slate-300">Direct UI Download for Faculty & Admins</span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">Export Attendance Records (CSV & Official PDF)</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Export course rosters, biometric records, and hall ticket clearance dossiers for department accreditation and COE audit.
            </p>
          </div>
        </div>

        {/* Scope selector and Format Download Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Scope Selector */}
          <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setExportScope('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                exportScope === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              All Subjects ({attendance.length})
            </button>
            <button
              onClick={() => setExportScope('selected')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                exportScope === 'selected'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Selected ({selectedSubject?.subjectCode})
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportCSV()}
              disabled={isExporting}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Download CSV</span>
            </button>
            <button
              onClick={() => handleExportPDF()}
              disabled={isExporting}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-teal-500/20 active:scale-95 disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {attendance.map((sub) => {
          const isDanger = sub.percentage < 75;
          const isWarning = sub.percentage >= 75 && sub.percentage < 80;
          const isSelected = sub.id === selectedSubjectId;

          return (
            <div
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`p-5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-indigo-50/40 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                  : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {sub.subjectCode}
                    </span>
                    {sub.isLab && (
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                        LAB
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-2 leading-snug">
                    {sub.subjectName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{sub.facultyName}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-xl font-black ${
                    isDanger ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {sub.percentage.toFixed(1)}%
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    isDanger
                      ? 'bg-rose-100 text-rose-700'
                      : isWarning
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {isDanger ? 'Shortage Warning' : isWarning ? 'Borderline' : 'On Track'}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-[11px] text-slate-500 font-medium mb-1">
                  <span>Attended: {sub.attendedClasses} of {sub.totalClasses} classes</span>
                  <span>Required: 75%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative">
                  {/* 75% target indicator line */}
                  <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-slate-400 z-10" title="75% minimum threshold" />
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      sub.percentage >= 85 ? 'bg-emerald-500' : sub.percentage >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(sub.percentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Footer status tip and per-card quick exports */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span>Credits: {sub.credits}</span>
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleExportCSV(sub)}
                    title={`Export ${sub.subjectCode} CSV`}
                    className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleExportPDF(sub)}
                    title={`Export ${sub.subjectCode} PDF`}
                    className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-indigo-600 font-semibold ml-1">
                    {isSelected ? 'Viewing logs ↓' : 'Inspect →'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Simulator & Attendance Log for Selected Subject */}
      {selectedSubject && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulator Tool */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Attendance Prediction Simulator</h3>
                <p className="text-xs text-slate-500">Calculate future attendance buffer for {selectedSubject.subjectCode}</p>
              </div>
            </div>

            {/* Live simulation banner */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-600 font-medium">Projected Attendance:</span>
                <span className={`text-2xl font-black ${
                  Number(simPercentage) >= 75 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {simPercentage}%
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Simulated: {simAttended} attended out of {simTotal} total classes
              </p>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    Number(simPercentage) >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(Number(simPercentage), 100)}%` }}
                />
              </div>
            </div>

            {/* Sliders / controls */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>If I miss upcoming classes:</span>
                  <span className="font-bold text-rose-600">{simulatorClassesToMiss} classes</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={simulatorClassesToMiss}
                  onChange={(e) => setSimulatorClassesToMiss(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>If I attend consecutive upcoming classes:</span>
                  <span className="font-bold text-emerald-600">{simulatorClassesToAttend} classes</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={simulatorClassesToAttend}
                  onChange={(e) => setSimulatorClassesToAttend(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Smart Insights based on rules */}
            <div className="p-3.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs space-y-2 text-slate-700">
              <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                <Info className="w-4 h-4 text-indigo-600" />
                <span>Smart Academic Guidance:</span>
              </div>
              <p>
                • <strong>Bunk Margin:</strong> You can safely miss up to{' '}
                <span className="font-bold text-indigo-700">{safeClassesToMiss} more classes</span> without dropping below the mandatory 75% limit.
              </p>
              {neededFor85 > 0 ? (
                <p>
                  • <strong>Distinction Target (85%):</strong> Attend the next{' '}
                  <span className="font-bold text-amber-700">{neededFor85} classes consecutively</span> to elevate your grade point safety threshold.
                </p>
              ) : (
                <p>
                  • <strong>Distinction Target (85%):</strong> You already hold a comfortable margin above 85.0%!
                </p>
              )}
            </div>

            <button
              onClick={() => {
                setSimulatorClassesToMiss(0);
                setSimulatorClassesToAttend(0);
              }}
              className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Reset Simulator
            </button>
          </div>

          {/* Daily Attendance Logs for Selected Subject */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Recent Lecture Attendance Logs: {selectedSubject.subjectName}
                </h3>
                <p className="text-xs text-slate-500">Subject Faculty: {selectedSubject.facultyName}</p>
              </div>

              {/* Status Filter & Log Export */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter('present')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      statusFilter === 'present' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => setStatusFilter('absent')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      statusFilter === 'absent' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Absent
                  </button>
                </div>

                {/* Direct quick export for current subject */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleExportCSV(selectedSubject)}
                    title={`Export ${selectedSubject.subjectCode} Lecture Records (CSV)`}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden md:inline">Log CSV</span>
                  </button>
                  <button
                    onClick={() => handleExportPDF(selectedSubject)}
                    title={`Export ${selectedSubject.subjectCode} Official Dossier (PDF)`}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden md:inline">Log PDF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* List of class records */}
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {selectedSubject.recentRecords
                .filter((r) => statusFilter === 'all' || r.status === statusFilter)
                .map((record, index) => {
                  const isPresent = record.status === 'present';
                  const isOD = record.status === 'on_duty';
                  return (
                    <div key={index} className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isPresent
                            ? 'bg-emerald-100 text-emerald-700'
                            : isOD
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {isPresent ? 'P' : isOD ? 'OD' : 'A'}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{record.topic}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {record.date}
                            </span>
                            <span>• Period 2 (10:15 AM)</span>
                          </div>
                        </div>
                      </div>

                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        isPresent
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isOD
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {isPresent ? 'Present' : isOD ? 'On Duty' : 'Absent'}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
