import React from 'react';
import { Bell, MapPin, Clock, ArrowRight, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ExamSeatingNotification } from '../types';

interface Exam30MinNotificationBannerProps {
  notification: ExamSeatingNotification | null;
  onNavigateToSeating: () => void;
  onDismiss: () => void;
}

export const Exam30MinNotificationBanner: React.FC<Exam30MinNotificationBannerProps> = ({
  notification,
  onNavigateToSeating,
  onDismiss
}) => {
  if (!notification || notification.status === 'dismissed') return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 via-indigo-50/40 to-cyan-50 border-b border-amber-200/80 text-slate-900 relative z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Bell icon and Alert title */}
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-300/70 flex items-center justify-center shrink-0 text-amber-700 shadow-2xs">
              <Bell className="w-4 h-4 text-amber-600 animate-bounce" />
            </div>

            <div className="space-y-0.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 shadow-2xs">
                  ⚡ 30-Min Exam Alert
                </span>
                <span className="text-xs font-semibold text-indigo-700">
                  Starts at {notification.startTime}
                </span>
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight font-heading">
                Upcoming Examination: <span className="text-indigo-900 font-extrabold">{notification.subject}</span>
              </h4>

              <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                <span className="font-semibold text-slate-900 bg-white/80 px-1.5 py-0.5 rounded border border-slate-200/60">
                  Hall: {notification.hallInfo}
                </span>
                <span className="text-slate-300">·</span>
                <span className="bg-white/80 px-1.5 py-0.5 rounded border border-slate-200/60">
                  Row {notification.rowNumber} · Seat <strong className="text-indigo-700 font-bold">{notification.seatNumber}</strong>
                </span>
                <span className="text-slate-300">·</span>
                <span>
                  Reporting Time: <strong className="text-slate-800">{notification.reportingTime}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <button
              id="banner-view-seating-btn"
              onClick={onNavigateToSeating}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs shadow-indigo-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Seat Allocation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              id="banner-dismiss-btn"
              onClick={onDismiss}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Dismiss Alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
