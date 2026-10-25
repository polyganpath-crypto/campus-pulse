import React, { useState } from 'react';
import {
  Award,
  Download,
  FileCheck,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Printer,
  ChevronDown,
  X,
  FileText
} from 'lucide-react';
import { SemesterResult } from '../../types';

interface ResultsTabProps {
  results: SemesterResult[];
}

export const ResultsTab: React.FC<ResultsTabProps> = ({ results }) => {
  const [selectedSemNumber, setSelectedSemNumber] = useState<number>(results[0]?.semesterNumber || 6);
  const [showTranscriptModal, setShowTranscriptModal] = useState<boolean>(false);
  const [showReevalModal, setShowReevalModal] = useState<boolean>(false);
  const [reevalSubject, setReevalSubject] = useState<string>('');
  const [reevalSuccess, setReevalSuccess] = useState<string | null>(null);

  const currentSem = results.find((r) => r.semesterNumber === selectedSemNumber) || results[0];

  const handleApplyReeval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reevalSubject) return;
    setReevalSuccess(`Re-evaluation request for ${reevalSubject} successfully logged! Scrutiny tracking token: REV-2026-${Math.floor(1000 + Math.random() * 9000)}. Results will update within 7 working days.`);
    setTimeout(() => {
      setShowReevalModal(false);
      setReevalSuccess(null);
    }, 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wide">
              Official University Examination Records
            </span>
            <span className="text-xs text-slate-500">Controller of Examinations (CoE)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-2">Exam Results, CGPA & Academic Transcripts</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Semester grade point average (SGPA), Cumulative GPA (CGPA), individual course credit points, and paper re-evaluation desk.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
          <button
            id="apply-reeval-btn"
            onClick={() => setShowReevalModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer border border-slate-200 flex items-center gap-1.5"
          >
            <FileCheck className="w-4 h-4 text-slate-600" />
            <span>Apply for Re-evaluation</span>
          </button>
          <button
            id="download-transcript-btn"
            onClick={() => setShowTranscriptModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Official Marksheet</span>
          </button>
        </div>
      </div>

      {/* Semester Selector & Top Score Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Semester Selection Tab Pill */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
            Select Semester Term:
          </label>
          <div className="flex flex-col gap-1.5">
            {results.map((res) => (
              <button
                key={res.semesterNumber}
                onClick={() => setSelectedSemNumber(res.semesterNumber)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  res.semesterNumber === selectedSemNumber
                    ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>Semester {res.semesterNumber}</span>
                <span className={`text-[11px] font-mono ${res.semesterNumber === selectedSemNumber ? 'text-indigo-100' : 'text-slate-500'}`}>
                  SGPA: {res.sgpa}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-3 text-[11px] text-slate-400 font-medium">
            Declared: {currentSem.declarationDate}
          </div>
        </div>

        {/* CGPA Card */}
        <div className="bg-gradient-to-br from-violet-50/40 via-white to-white rounded-2xl border border-violet-100/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider text-violet-950">Cumulative CGPA</span>
            <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-heading mt-2 flex items-baseline gap-2 tabular-nums">
            <span>{currentSem.cgpa}</span>
            <span className="text-xs font-normal text-slate-500">/ 10.0 scale</span>
          </div>
          <div className="mt-2 text-xs text-violet-800 font-medium">
            Performance: <strong className="font-bold">First Class with Distinction</strong>
          </div>
        </div>

        {/* SGPA Card */}
        <div className="bg-gradient-to-br from-indigo-50/40 via-white to-white rounded-2xl border border-indigo-100/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider text-indigo-950">Semester {currentSem.semesterNumber} SGPA</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-heading mt-2 flex items-baseline gap-2 tabular-nums">
            <span>{currentSem.sgpa}</span>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">Top 5%</span>
          </div>
          <div className="mt-2 text-xs text-indigo-800 font-medium">
            Class Standing: <strong className="font-bold">Rank #4 of 120</strong>
          </div>
        </div>

        {/* Credits Earned Card */}
        <div className="bg-gradient-to-br from-cyan-50/40 via-white to-white rounded-2xl border border-cyan-100/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider text-cyan-950">Total Credits</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-heading mt-2 flex items-baseline gap-2 tabular-nums">
            <span>{currentSem.earnedCredits}</span>
            <span className="text-xs font-normal text-slate-500">/ {currentSem.totalCredits} Credits</span>
          </div>
          <div className="mt-2 text-xs text-cyan-800 font-medium">
            Academic Status: <strong className="font-bold text-emerald-700">All Courses Cleared</strong>
          </div>
        </div>
      </div>

      {/* Course-Wise Grade Sheet Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Grade Card — Semester {currentSem.semesterNumber} ({currentSem.academicYear})
            </h3>
            <p className="text-xs text-slate-500">Grading System: Relative Standard Curve with Letter Grade scale</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200">
            Result Status: PASS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Course Code</th>
                <th className="py-3 px-4">Course Title</th>
                <th className="py-3 px-3 text-center">Credits</th>
                <th className="py-3 px-3 text-center">Internal (50)</th>
                <th className="py-3 px-3 text-center">External (50)</th>
                <th className="py-3 px-3 text-center">Total (100)</th>
                <th className="py-3 px-3 text-center">Grade</th>
                <th className="py-3 px-3 text-center">Grade Point</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {currentSem.subjects.map((sub) => (
                <tr key={sub.code} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">{sub.code}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-900">{sub.name}</td>
                  <td className="py-3.5 px-3 text-center font-medium">{sub.credits}</td>
                  <td className="py-3.5 px-3 text-center font-mono">{sub.internalMarks}</td>
                  <td className="py-3.5 px-3 text-center font-mono">{sub.externalMarks}</td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-900">{sub.totalMarks}</td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded font-semibold text-xs bg-slate-100 text-slate-800 border border-slate-200">
                      {sub.grade}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center font-semibold text-slate-900">{sub.gradePoint}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded font-medium text-[10px] uppercase bg-slate-100 text-slate-700 border border-slate-200">
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Grade Reference Legend */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
          <span className="font-bold text-slate-700">Grade Key:</span>
          <span><strong>O</strong>: Outstanding (10)</span>
          <span><strong>A+</strong>: Excellent (9)</span>
          <span><strong>A</strong>: Very Good (8)</span>
          <span><strong>B+</strong>: Good (7)</span>
          <span><strong>B</strong>: Above Average (6)</span>
          <span><strong>F</strong>: Re-appear (0)</span>
        </div>
      </div>

      {/* Printable Official Transcript Modal */}
      {showTranscriptModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Official Academic Transcript & Marksheet</h3>
              </div>
              <button
                onClick={() => setShowTranscriptModal(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto font-sans" id="printable-transcript">
              <div className="text-center pb-4 border-b border-slate-300">
                <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
                  Apex University of Engineering & Technology
                </h2>
                <p className="text-xs text-slate-500">Office of the Controller of Examinations</p>
                <div className="inline-block mt-2 px-3 py-1 rounded bg-slate-100 text-xs font-bold text-slate-800 border border-slate-200">
                  PROVISIONAL STATEMENT OF GRADES
                </div>
              </div>

              {/* Student Metadata */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div><span className="text-slate-500">Candidate Name:</span> <strong className="text-slate-900">Likith E.</strong></div>
                <div><span className="text-slate-500">Roll Number:</span> <strong className="text-slate-900 font-mono">22CS084</strong></div>
                <div><span className="text-slate-500">Department:</span> <strong className="text-slate-900">Computer Science & Engineering</strong></div>
                <div><span className="text-slate-500">Semester:</span> <strong className="text-slate-900">Semester 6</strong></div>
                <div><span className="text-slate-500">Semester SGPA:</span> <strong className="text-indigo-600">{currentSem.sgpa}</strong></div>
                <div><span className="text-slate-500">Cumulative CGPA:</span> <strong className="text-indigo-600">{currentSem.cgpa}</strong></div>
              </div>

              {/* Courses */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold">
                    <tr>
                      <th className="p-2">Code</th>
                      <th className="p-2">Subject Name</th>
                      <th className="p-2 text-center">Credits</th>
                      <th className="p-2 text-center">Marks</th>
                      <th className="p-2 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentSem.subjects.map((s) => (
                      <tr key={s.code}>
                        <td className="p-2 font-mono">{s.code}</td>
                        <td className="p-2 font-medium">{s.name}</td>
                        <td className="p-2 text-center">{s.credits}</td>
                        <td className="p-2 text-center">{s.totalMarks}/100</td>
                        <td className="p-2 text-center font-bold">{s.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-4 border-t border-slate-200">
                <span>System Verified Digital Document</span>
                <span>Verification QR Hash: 2026-CS84-V491</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save as PDF</span>
              </button>
              <button
                onClick={() => setShowTranscriptModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply for Re-evaluation Modal */}
      {showReevalModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Apply for Examination Re-Evaluation</h3>
              </div>
              <button
                onClick={() => setShowReevalModal(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyReeval} className="p-6 space-y-4">
              {reevalSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>{reevalSuccess}</div>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-500">
                    Students can apply for paper re-totaling and external scrutiny within 15 days of result declaration. Re-evaluation fee of ₹500 per subject is charged to your semester fee ledger.
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Select Subject for Scrutiny:
                    </label>
                    <select
                      required
                      value={reevalSubject}
                      onChange={(e) => setReevalSubject(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="">-- Choose Subject --</option>
                      {currentSem.subjects.map((s) => (
                        <option key={s.code} value={`${s.code} - ${s.name}`}>
                          {s.code} - {s.name} (Current Grade: {s.grade}, Total: {s.totalMarks})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Reason / Justification for Review:
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Question 4(b) on dynamic programming optimization was answered correctly with derivation..."
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                    ⚠️ Note: If re-evaluated marks increase by ≥5%, original grade will be revised and a fresh marksheet re-issued.
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowReevalModal(false)}
                      className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm cursor-pointer"
                    >
                      Submit Scrutiny Request
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
