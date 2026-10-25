import React, { useState } from 'react';
import { Megaphone, Calendar, MapPin, CheckCircle2, ChevronRight, X, Users, Bell } from 'lucide-react';
import { CampusEvent } from '../types';

interface EventNotificationBannerProps {
  events: CampusEvent[];
  onToggleRsvp: (eventId: string) => void;
  onOpenDetails: () => void;
  onDismiss?: () => void;
}

export const EventNotificationBanner: React.FC<EventNotificationBannerProps> = ({
  events,
  onToggleRsvp,
  onOpenDetails,
  onDismiss
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const urgentEvent = events.find((e) => e.isUrgent) || events[0];

  if (!urgentEvent || isDismissed) return null;

  return (
    <div className="bg-slate-900 text-slate-100 border-b border-indigo-950/60 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Left info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
              <Megaphone className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs truncate flex items-center gap-2">
              <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 border border-indigo-400/20">
                Notice
              </span>
              <span className="text-slate-500">·</span>
              <span className="font-semibold text-white truncate">{urgentEvent.title}</span>
              <span className="hidden md:inline text-slate-300 text-xs">
                — {urgentEvent.date} ({urgentEvent.time}) at {urgentEvent.venue}
              </span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              id={`rsvp-btn-${urgentEvent.id}`}
              onClick={() => onToggleRsvp(urgentEvent.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                urgentEvent.userRegistered
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs shadow-indigo-600/30'
              }`}
            >
              {urgentEvent.userRegistered ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>RSVP'd</span>
                </>
              ) : (
                <span>RSVP</span>
              )}
            </button>
            <button
              id="view-all-campus-events-btn"
              onClick={onOpenDetails}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Notices ({events.length})</span>
              <ChevronRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                setIsDismissed(true);
                onDismiss?.();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Dismiss announcement"
              aria-label="Dismiss notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CampusEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: CampusEvent[];
  onToggleRsvp: (eventId: string) => void;
}

export const CampusEventsModal: React.FC<CampusEventsModalProps> = ({
  isOpen,
  onClose,
  events,
  onToggleRsvp
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Megaphone className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Campus Notices & Announcements</h3>
              <p className="text-xs text-slate-400">Official university notices, guest lectures, and student activities</p>
            </div>
          </div>
          <button
            id="close-campus-events-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-amber-300 hover:shadow-sm transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-800 border border-amber-200">
                      {event.category}
                    </span>
                    {event.isUrgent && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-rose-100 text-rose-700">
                        Urgent / Fast Filling
                      </span>
                    )}
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {event.registeredCount} Registered
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{event.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{event.description}</p>
                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-slate-700 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      {event.date} • {event.time}
                    </span>
                    <span className="flex items-center gap-1 text-slate-700 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      {event.venue}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 self-start sm:self-center">
                  <button
                    id={`modal-rsvp-btn-${event.id}`}
                    onClick={() => onToggleRsvp(event.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      event.userRegistered
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                        : 'bg-amber-600 text-white hover:bg-amber-700 shadow-xs'
                    }`}
                  >
                    {event.userRegistered ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Registered</span>
                      </>
                    ) : (
                      <span>RSVP Now</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
