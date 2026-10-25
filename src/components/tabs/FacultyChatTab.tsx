import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Calendar,
  Clock,
  MapPin,
  Mail,
  UserCheck,
  CheckCircle2,
  Paperclip,
  Code2,
  X
} from 'lucide-react';
import { FacultyMember, FacultyChatMessage, UserProfile } from '../../types';
import { INITIAL_FACULTY_MEMBERS } from '../../data/mockData';

interface FacultyChatTabProps {
  currentUser: UserProfile;
  initialSelectedSubject?: string;
  initialMessageText?: string;
}

export const FacultyChatTab: React.FC<FacultyChatTabProps> = ({
  currentUser,
  initialSelectedSubject,
  initialMessageText
}) => {
  const [facultyList] = useState<FacultyMember[]>(INITIAL_FACULTY_MEMBERS);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>(facultyList[0].id);
  const [messageText, setMessageText] = useState<string>(initialMessageText || '');
  const [showAppointmentModal, setShowAppointmentModal] = useState<boolean>(false);
  const [appointmentSlot, setAppointmentSlot] = useState<string>('Tomorrow 03:30 PM');
  const [appointmentReason, setAppointmentReason] = useState<string>('');
  const [appointmentSuccess, setAppointmentSuccess] = useState<string | null>(null);

  // Initial chat threads per faculty
  const [chats, setChats] = useState<Record<string, FacultyChatMessage[]>>({
    'fac-01': [
      {
        id: 'msg-f1-1',
        facultyId: 'fac-01',
        sender: 'student',
        text: 'Good afternoon Dr. Priya, I had a doubt regarding the branch and bound formulation for the Traveling Salesperson Problem covered in Monday lecture.',
        timestamp: 'Yesterday, 02:15 PM'
      },
      {
        id: 'msg-f1-2',
        facultyId: 'fac-01',
        sender: 'faculty',
        text: 'Hello Likith! In TSP branch & bound, the key is the matrix row and column reduction lower-bounding technique. Have you reviewed the worked example on slide 24?',
        timestamp: 'Yesterday, 02:40 PM'
      }
    ],
    'fac-02': [
      {
        id: 'msg-f2-1',
        facultyId: 'fac-02',
        sender: 'faculty',
        text: 'Reminder to all Semester 6 students: Cloud Engineering Lab Exercise 4 reports are due before Thursday.',
        timestamp: 'Sep 19, 10:00 AM'
      }
    ]
  });

  // Switch to faculty matching initialSelectedSubject if passed from AI Escalation
  useEffect(() => {
    if (initialSelectedSubject) {
      const match = facultyList.find((f) =>
        f.subject.toLowerCase().includes(initialSelectedSubject.toLowerCase())
      );
      if (match) {
        setSelectedFacultyId(match.id);
      }
    }
  }, [initialSelectedSubject, facultyList]);

  useEffect(() => {
    if (initialMessageText) {
      setMessageText(initialMessageText);
    }
  }, [initialMessageText]);

  const activeFaculty = facultyList.find((f) => f.id === selectedFacultyId) || facultyList[0];
  const currentMessages = chats[activeFaculty.id] || [];

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const newMsg: FacultyChatMessage = {
      id: `msg-${Date.now()}`,
      facultyId: activeFaculty.id,
      sender: 'student',
      text: messageText,
      timestamp: 'Just now'
    };

    setChats((prev) => ({
      ...prev,
      [activeFaculty.id]: [...(prev[activeFaculty.id] || []), newMsg]
    }));

    setMessageText('');

    // Simulated faculty reply after short delay
    setTimeout(() => {
      const facultyReply: FacultyChatMessage = {
        id: `fac-reply-${Date.now()}`,
        facultyId: activeFaculty.id,
        sender: 'faculty',
        text: `Thank you for reaching out, Likith. I have noted your question regarding ${activeFaculty.subject}. Let us review this during my upcoming office hours (${activeFaculty.officeHours}) in cabin ${activeFaculty.cabin}, or I will reply with an annotated diagram shortly.`,
        timestamp: 'Just now'
      };
      setChats((prev) => ({
        ...prev,
        [activeFaculty.id]: [...(prev[activeFaculty.id] || []), facultyReply]
      }));
    }, 1200);
  };

  const handleBookConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    setAppointmentSuccess(`1-on-1 Consultation booked with ${activeFaculty.name} for ${appointmentSlot} at ${activeFaculty.cabin}! A calendar invitation has been generated.`);
    setTimeout(() => {
      setShowAppointmentModal(false);
      setAppointmentSuccess(null);
      setAppointmentReason('');
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
              Direct Faculty Communication Channel
            </span>
            <span className="text-xs text-slate-500">Official Department Messaging Desk</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-2">Subject Professors & Consultation Desk</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Directly connect with the professor teaching each subject, discuss academic doubts, book office-hour consultations, or follow up on exam evaluations.
          </p>
        </div>

        <button
          onClick={() => setShowAppointmentModal(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-1.5 self-start md:self-auto shrink-0"
        >
          <Calendar className="w-4 h-4" />
          <span>Book Office Hours Slot</span>
        </button>
      </div>

      {/* 2-Column Split: Faculty Directory on Left, Chat on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[650px]">
        {/* Left Col: Subject Faculty List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Department Faculty by Subject
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Click to open direct chat & view cabin location</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {facultyList.map((faculty) => {
              const isSelected = faculty.id === selectedFacultyId;
              const unread = chats[faculty.id]?.length || 0;

              return (
                <div
                  key={faculty.id}
                  onClick={() => setSelectedFacultyId(faculty.id)}
                  className={`p-4 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/70 border-l-4 border-l-indigo-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={faculty.avatarUrl}
                        alt={faculty.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                      {faculty.isOnline && (
                        <div
                          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"
                          title="In Office / Available"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {faculty.name}
                        </h4>
                        {faculty.isOnline && (
                          <span className="text-[10px] font-semibold text-emerald-600">Online</span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-indigo-700 truncate mt-0.5">
                        {faculty.subject}
                      </p>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-1 truncate">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {faculty.cabin}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Active Faculty Chat & Details */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          {/* Top Faculty Profile Bar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={activeFaculty.avatarUrl}
                alt={activeFaculty.name}
                className="w-11 h-11 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{activeFaculty.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                    {activeFaculty.isOnline ? 'Available in Cabin' : 'Offline'}
                  </span>
                </div>
                <p className="text-xs text-indigo-700 font-medium">{activeFaculty.subject}</p>
                <p className="text-[11px] text-slate-500 flex items-center gap-3 mt-0.5">
                  <span>📍 {activeFaculty.cabin}</span>
                  <span>⏰ Office Hours: {activeFaculty.officeHours}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAppointmentModal(true)}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Book Appointment</span>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {currentMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                <MessageSquare className="w-10 h-10 text-slate-300" />
                <p className="text-xs">No previous messages with {activeFaculty.name}.</p>
                <p className="text-[11px]">Send a doubt or question regarding {activeFaculty.subject}.</p>
              </div>
            ) : (
              currentMessages.map((msg) => {
                const isStudent = msg.sender === 'student';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isStudent ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        isStudent
                          ? 'bg-indigo-600 text-white rounded-br-none shadow-xs'
                          : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-bl-none'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1.5 text-[10px] opacity-70">
                        <span className="font-bold">
                          {isStudent ? 'You (Likith E. - 22CS084)' : activeFaculty.name}
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input Bar */}
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center gap-2">
            <input
              type="text"
              id="faculty-message-input"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Write a direct message to ${activeFaculty.name}...`}
              className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
            <button
              id="faculty-send-btn"
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Consultation Booking Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Schedule Office Hours: {activeFaculty.name}
                </h3>
              </div>
              <button
                onClick={() => setShowAppointmentModal(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookConsultation} className="p-6 space-y-4">
              {appointmentSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>{appointmentSuccess}</div>
                </div>
              ) : (
                <>
                  <div className="text-xs text-slate-600 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 space-y-1">
                    <p><strong>Faculty:</strong> {activeFaculty.name}</p>
                    <p><strong>Subject:</strong> {activeFaculty.subject}</p>
                    <p><strong>Location:</strong> {activeFaculty.cabin}</p>
                    <p><strong>Available Days:</strong> {activeFaculty.officeHours}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Choose Time Slot:
                    </label>
                    <select
                      value={appointmentSlot}
                      onChange={(e) => setAppointmentSlot(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="Tomorrow 03:00 PM - 03:30 PM">Tomorrow (03:00 PM - 03:30 PM)</option>
                      <option value="Tomorrow 03:30 PM - 04:00 PM">Tomorrow (03:30 PM - 04:00 PM)</option>
                      <option value="Friday 11:00 AM - 11:30 AM">Friday (11:00 AM - 11:30 AM)</option>
                      <option value="Friday 02:30 PM - 03:00 PM">Friday (02:30 PM - 03:00 PM)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Agenda / Topic of Doubt:
                    </label>
                    <textarea
                      rows={3}
                      value={appointmentReason}
                      onChange={(e) => setAppointmentReason(e.target.value)}
                      placeholder="e.g. Discussing project milestone 2 architecture & paper re-evaluation clarification..."
                      required
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAppointmentModal(false)}
                      className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm cursor-pointer"
                    >
                      Confirm Booking
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
