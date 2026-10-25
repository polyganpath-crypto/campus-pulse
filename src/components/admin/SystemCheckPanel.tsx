import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Database,
  AlertTriangle,
  Server,
  Lock,
  Clock,
  Info,
  Terminal,
  Activity
} from 'lucide-react';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { UserProfile } from '../../types';
import firebaseConfig from '../../../firebase-applet-config.json';

interface CollectionTestResult {
  collectionName: string;
  label: string;
  description: string;
  status: 'pending' | 'testing' | 'success' | 'error';
  docsRetrieved?: number;
  durationMs?: number;
  errorMessage?: string;
  errorCode?: string;
  timestamp?: string;
}

interface SystemCheckPanelProps {
  currentUser: UserProfile;
}

const TARGET_COLLECTIONS: { name: string; label: string; description: string }[] = [
  {
    name: 'announcements',
    label: 'Campus Announcements',
    description: 'Broadcasts, urgent campus alerts, and academic notices'
  },
  {
    name: 'lostItems',
    label: 'Lost & Found Repository',
    description: 'Reported lost and found belongings and claim logs'
  },
  {
    name: 'permissions',
    label: 'Permission Requests (OD / Gate Pass)',
    description: 'Student on-duty permissions, gate passes, mentor reviews'
  },
  {
    name: 'examinations',
    label: 'Examination Schedules',
    description: 'Midterm and semester exam timetable definitions'
  },
  {
    name: 'seating_assignments',
    label: 'Seating Arrangements',
    description: 'Student hall & desk allocations for active exams'
  },
  {
    name: 'exam_halls',
    label: 'Examination Halls Registry',
    description: 'Exam venues, bench capacity, block coordinates'
  },
  {
    name: 'campus_locations',
    label: 'Campus Locations & POIs',
    description: 'Navigation points, departments, laboratories, and amenities'
  },
  {
    name: 'student_queries',
    label: 'Student Queries & Helpdesk',
    description: 'Student inquiry tickets, official administrative responses, and status history'
  }
];

export const SystemCheckPanel: React.FC<SystemCheckPanelProps> = ({ currentUser }) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [results, setResults] = useState<CollectionTestResult[]>(() =>
    TARGET_COLLECTIONS.map((c) => ({
      collectionName: c.name,
      label: c.label,
      description: c.description,
      status: 'pending'
    }))
  );
  const [lastRunTime, setLastRunTime] = useState<string | null>(null);

  const runDiagnostics = useCallback(async () => {
    setIsRunning(true);

    const updatedResults: CollectionTestResult[] = [];

    for (const target of TARGET_COLLECTIONS) {
      const startTime = performance.now();
      try {
        const q = query(collection(db, target.name), limit(1));
        const snapshot = await getDocs(q);
        const duration = Math.round(performance.now() - startTime);

        updatedResults.push({
          collectionName: target.name,
          label: target.label,
          description: target.description,
          status: 'success',
          docsRetrieved: snapshot.size,
          durationMs: duration,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
      } catch (err: unknown) {
        const duration = Math.round(performance.now() - startTime);
        const firestoreError = err as { code?: string; message?: string };
        const msg = firestoreError?.message || (err instanceof Error ? err.message : String(err));
        const code = firestoreError?.code || 'PERMISSION_DENIED';

        updatedResults.push({
          collectionName: target.name,
          label: target.label,
          description: target.description,
          status: 'error',
          durationMs: duration,
          errorMessage: msg,
          errorCode: code,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
      }
    }

    setResults(updatedResults);
    setIsRunning(false);
    setLastRunTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, []);

  useEffect(() => {
    runDiagnostics();
  }, [runDiagnostics]);

  const successCount = results.filter((r) => r.status === 'success').length;
  const errorCount = results.filter((r) => r.status === 'error').length;
  const isAllPassing = results.length > 0 && successCount === results.length;

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Admin Diagnostics</span>
              </span>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1.5 ${
                  isAllPassing
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : errorCount > 0
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>
                  {isAllPassing
                    ? `All ${results.length} Collections Accessible (100%)`
                    : errorCount > 0
                    ? `${errorCount} Collection${errorCount > 1 ? 's' : ''} Failed`
                    : 'Testing in progress'}
                </span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Database className="w-6 h-6 text-indigo-400" />
              <span>Firestore Collection Access &amp; Rules Inspector</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Validates real read access to each database collection using the active Firestore database ID and evaluated Security Rules. Confirm that rules are deployed and permissions are granted for administrative operations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={runDiagnostics}
              disabled={isRunning}
              className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                isRunning
                  ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/50 active:scale-98'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin text-indigo-300' : ''}`} />
              <span>{isRunning ? 'Executing Read Probes...' : 'Re-test All Collections'}</span>
            </button>

            {lastRunTime && (
              <span className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>Last verified: {lastRunTime}</span>
              </span>
            )}
          </div>
        </div>

        {/* Database & Auth Metadata Pills */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              <span>Database Instance</span>
            </div>
            <div className="font-mono text-xs text-indigo-200 break-all select-all font-semibold">
              {firebaseConfig.firestoreDatabaseId || '(default)'}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Project: {firebaseConfig.projectId}</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Auth Session Identity</span>
            </div>
            <div className="font-mono text-xs text-white truncate font-semibold">
              {auth.currentUser?.email || currentUser.email || 'Not Signed In'}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 truncate">
              UID: {auth.currentUser?.uid || currentUser.id || 'N/A'}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Security Role Evaluated</span>
            </div>
            <div className="text-xs text-white font-bold flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[11px] uppercase">
                {currentUser.role}
              </span>
              <span className="text-slate-300 font-normal">
                {currentUser.role === 'admin' ? 'Root Admin Privilege' : 'Standard Privilege'}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Rules: Signed-in Read + Role-based Write
            </div>
          </div>
        </div>
      </div>

      {/* Collections Test Results Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-600" />
              <span>Collection Probe Results ({results.length} Targets)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Each row executes a direct read probe (<code className="bg-slate-200 px-1 py-0.5 rounded text-[10px] font-mono">query(collection, limit(1))</code>) against the configured Firestore database.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Overall:</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{successCount} Passed</span>
            </span>
            {errorCount > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>{errorCount} Failed</span>
              </span>
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {results.map((item) => {
            const isOk = item.status === 'success';
            const isErr = item.status === 'error';
            const isPending = item.status === 'pending' || item.status === 'testing';

            return (
              <div
                key={item.collectionName}
                className={`p-4 sm:p-5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isErr ? 'bg-rose-50/30' : isOk ? 'hover:bg-slate-50/60' : 'bg-slate-50/20'
                }`}
              >
                {/* Left: Collection Details */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      /{item.collectionName}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {item.label}
                    </span>
                    {item.durationMs !== undefined && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({item.durationMs}ms)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {item.description}
                  </p>

                  {/* Error Explanation if Failed */}
                  {isErr && (
                    <div className="mt-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-rose-700">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Read Probe Rejected • {item.errorCode}</span>
                      </div>
                      <p className="font-mono text-[11px] text-rose-800 break-all bg-white/60 p-2 rounded border border-rose-200">
                        {item.errorMessage}
                      </p>
                      <p className="text-[10px] text-rose-600">
                        Verify firestore.rules for <code className="font-mono bg-rose-100 px-1 py-0.2 rounded">/{item.collectionName}</code> and ensure the database ID in <code className="font-mono bg-rose-100 px-1 py-0.2 rounded">firebase-applet-config.json</code> matches the provisioned database.
                      </p>
                    </div>
                  )}
                </div>

                {/* Right: Status Pill & Metric */}
                <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                  {isPending && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                      <span>Probing...</span>
                    </div>
                  )}

                  {isOk && (
                    <div className="flex items-center gap-2">
                      <div className="text-right hidden sm:block">
                        <div className="text-xs font-bold text-slate-700">
                          {item.docsRetrieved && item.docsRetrieved > 0
                            ? `${item.docsRetrieved} Doc Sampled`
                            : 'Empty Collection (0 Docs)'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Read Access Granted
                        </div>
                      </div>
                      <span className="px-3 py-1.5 rounded-xl font-black text-xs bg-emerald-500 text-white shadow-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                        <span>GREEN • OK</span>
                      </span>
                    </div>
                  )}

                  {isErr && (
                    <span className="px-3 py-1.5 rounded-xl font-black text-xs bg-rose-600 text-white shadow-xs flex items-center gap-1.5 animate-pulse">
                      <XCircle className="w-4 h-4 text-rose-200" />
                      <span>RED • FAILED</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer diagnostic advice */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p>
            <span className="font-bold text-slate-900">How to interpret results:</span> A <span className="font-bold text-emerald-700">GREEN</span> status indicates that the Firestore database is reachable and that the security rules allow read access for the current session. A <span className="font-bold text-rose-700">RED</span> status indicates an error such as permission denied, database not found, or authentication timeout.
          </p>
        </div>
      </div>
    </div>
  );
};
