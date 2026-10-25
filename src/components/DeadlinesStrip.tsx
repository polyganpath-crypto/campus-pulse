import React, { useState } from 'react';
import { Clock, AlertTriangle, ArrowRight, CheckCircle2, X } from 'lucide-react';
import { AcademicDeadline } from '../types';

interface DeadlinesStripProps {
  deadlines: AcademicDeadline[];
  onNavigateTab: (tabId: string) => void;
  onMarkComplete: (deadlineId: string) => void;
  onDismiss?: () => void;
}

export const DeadlinesStrip: React.FC<DeadlinesStripProps> = ({
  deadlines,
  onNavigateTab,
  onMarkComplete,
  onDismiss
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const pendingDeadlines = deadlines.filter((d) => d.status !== 'completed');

  if (pendingDeadlines.length === 0 || isDismissed) return null;

  return (
    <div className="bg-white/90 border-b border-slate-200/80 py-2 px-4 sm:px-6 lg:px-8 shadow-2xs backdrop-blur-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Left Indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 shrink-0">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-bold text-slate-900 font-heading">Academic Deadlines</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px] font-mono font-bold">
            {pendingDeadlines.length}
          </span>
        </div>

        {/* Scrollable list of deadlines */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {pendingDeadlines.slice(0, 3).map((dl) => {
            const isCritical = dl.urgency === 'critical';
            return (
              <div
                key={dl.id}
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50/80 hover:bg-white border border-slate-200/80 text-xs whitespace-nowrap shadow-2xs transition-colors"
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCritical ? 'bg-amber-500' : 'bg-indigo-400'}`} />
                <span className="font-medium text-slate-800 max-w-[190px] truncate">{dl.title}</span>
                <span className="text-[11px] font-mono text-slate-500">({dl.dueTime})</span>
                {dl.actionUrlTab && (
                  <button
                    id={`deadline-nav-btn-${dl.id}`}
                    onClick={() => onNavigateTab(dl.actionUrlTab!)}
                    className="p-1 hover:bg-indigo-50 rounded text-slate-400 hover:text-indigo-600 transition-colors ml-0.5 cursor-pointer"
                    title="Open task view"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
                <button
                  id={`deadline-check-btn-${dl.id}`}
                  onClick={() => onMarkComplete(dl.id)}
                  className="p-1 hover:bg-emerald-50 rounded text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                  title="Mark as done"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Action to open calendar + Dismiss */}
        <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
          <button
            id="view-full-calendar-deadlines-btn"
            onClick={() => onNavigateTab('calendar')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Academic Calendar</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              setIsDismissed(true);
              onDismiss?.();
            }}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Dismiss strip"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
