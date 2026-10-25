import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  BookOpen,
  Filter,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X
} from 'lucide-react';
import { CalendarScheduleItem, AcademicDeadline } from '../../types';
import { INITIAL_CALENDAR_ITEMS } from '../../data/mockData';

interface CalendarTabProps {
  deadlines: AcademicDeadline[];
}

export const CalendarTab: React.FC<CalendarTabProps> = ({ deadlines }) => {
  const [scheduleItems, setScheduleItems] = useState<CalendarScheduleItem[]>(INITIAL_CALENDAR_ITEMS);
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-22');

  // New study item form state
  const [newTitle, setNewTitle] = useState<string>('');
  const [newType, setNewType] = useState<'study' | 'deadline' | 'class' | 'club'>('study');
  const [newDate, setNewDate] = useState<string>('2026-09-23');
  const [newStartTime, setNewStartTime] = useState<string>('06:00 PM');
  const [newEndTime, setNewEndTime] = useState<string>('08:00 PM');
  const [newLocation, setNewLocation] = useState<string>('Hostel Study Room / Library');

  // Days in September 2026 for the calendar view (Starts on Tuesday Sep 1)
  const daysInSeptember = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2026-09-${dayNum < 10 ? '0' + dayNum : dayNum}`;
    return {
      dayNumber: dayNum,
      dateString: dateStr,
      hasDeadlines: deadlines.some((d) => d.dueDate === dateStr),
      eventsCount: scheduleItems.filter((s) => s.date === dateStr).length
    };
  });

  const handleAddStudyItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const createdItem: CalendarScheduleItem = {
      id: `item-${Date.now()}`,
      title: newTitle,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      type: newType,
      location: newLocation,
      isPersonalStudy: newType === 'study'
    };

    setScheduleItems((prev) => [...prev, createdItem]);
    setShowAddModal(false);
    setNewTitle('');
  };

  const filteredItems = scheduleItems.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const selectedDateItems = scheduleItems.filter((item) => item.date === selectedDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
              Academic & Personal Planner
            </span>
            <span className="text-xs text-slate-500">Semester 6 Routine</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-2">Interactive Calendar & Study Schedule</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Track daily lecture slots, upcoming assignment deadlines, document submission counters, exam dates, and personal study routines.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-1.5 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Study Session / Task</span>
        </button>
      </div>

      {/* Main Calendar View & Daily Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-slate-900">September 2026</h3>
              <span className="text-xs text-slate-500 font-medium">Odd Semester Term</span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'deadline', label: 'Deadlines' },
                { id: 'class', label: 'Classes' },
                { id: 'study', label: 'Study Blocks' },
                { id: 'club', label: 'Club Meet' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    filterType === f.id
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider py-1 border-b border-slate-100">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Day Cells */}
          {/* Sept 1, 2026 starts on Tuesday (offset 2 empty cells for Sun, Mon) */}
          <div className="grid grid-cols-7 gap-1.5">
            <div className="h-16 sm:h-20 p-1.5 rounded-xl bg-slate-50/50 opacity-30 text-slate-400 text-xs">30</div>
            <div className="h-16 sm:h-20 p-1.5 rounded-xl bg-slate-50/50 opacity-30 text-slate-400 text-xs">31</div>

            {daysInSeptember.map((day) => {
              const isSelected = day.dateString === selectedDate;
              const isToday = day.dayNumber === 21;
              const dayEvents = filteredItems.filter((it) => it.date === day.dateString);

              return (
                <div
                  key={day.dayNumber}
                  onClick={() => setSelectedDate(day.dateString)}
                  className={`h-16 sm:h-20 p-1.5 rounded-xl border text-xs transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                      : isToday
                      ? 'bg-amber-50/40 border-amber-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                        isToday ? 'bg-amber-500 text-white' : 'text-slate-700'
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    )}
                  </div>

                  {/* Tiny chips inside cell */}
                  <div className="space-y-0.5 overflow-hidden">
                    {dayEvents.slice(0, 1).map((ev) => (
                      <div
                        key={ev.id}
                        className={`text-[9px] font-semibold truncate px-1 py-0.2 rounded ${
                          ev.type === 'deadline'
                            ? 'bg-rose-100 text-rose-700'
                            : ev.type === 'study'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 1 && (
                      <div className="text-[9px] text-slate-400 font-bold px-1">
                        +{dayEvents.length - 1} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Selected Day Agenda & Study Routines */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Agenda for {selectedDate}
                </h3>
                <p className="text-xs text-slate-500">{selectedDateItems.length} items scheduled</p>
              </div>
              <button
                onClick={() => {
                  setNewDate(selectedDate);
                  setShowAddModal(true);
                }}
                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                title="Add task on this day"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {selectedDateItems.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs">No scheduled events or deadlines on {selectedDate}.</p>
                <button
                  onClick={() => {
                    setNewDate(selectedDate);
                    setShowAddModal(true);
                  }}
                  className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                >
                  Schedule a Study Block +
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto">
                {selectedDateItems.map((item) => {
                  const isDeadline = item.type === 'deadline';
                  const isStudy = item.type === 'study';

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        isDeadline
                          ? 'bg-rose-50/70 border-rose-200'
                          : isStudy
                          ? 'bg-emerald-50/70 border-emerald-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded ${
                          isDeadline ? 'bg-rose-200 text-rose-800' : isStudy ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {item.type}
                        </span>
                        <span className="font-mono text-[11px] text-slate-600 font-semibold">
                          {item.startTime} {item.endTime !== item.startTime && `- ${item.endTime}`}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900">{item.title}</h4>
                      {item.location && (
                        <p className="text-[11px] text-slate-500">📍 {item.location}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Study Tip Footer */}
          <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-start gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>Spaced repetition tip: Review algorithms and DP problems 24 hours after lectures for maximum retention.</span>
          </div>
        </div>
      </div>

      {/* Add Study Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Add Schedule / Study Task</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudyItem} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Task Title:
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. LeetCode Graph Theory or Raft paper review..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category:
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="study">Personal Study Block</option>
                    <option value="deadline">Assignment Deadline</option>
                    <option value="class">Lecture / Lab</option>
                    <option value="club">Club Meeting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date:
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Time:
                  </label>
                  <input
                    type="text"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    placeholder="06:00 PM"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    End Time:
                  </label>
                  <input
                    type="text"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    placeholder="08:00 PM"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location / Study Pod:
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Central Library Floor 2 / Room CS-301"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
