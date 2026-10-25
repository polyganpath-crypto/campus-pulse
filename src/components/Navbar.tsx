import React, { useState } from 'react';
import {
  GraduationCap,
  Bell,
  Calendar,
  FileText,
  UserCheck,
  Award,
  MessageSquare,
  Sparkles,
  LogOut,
  ChevronDown,
  Lock,
  BookOpen,
  FileCheck,
  MapPin,
  Menu,
  ShieldCheck,
  AlertTriangle,
  Compass,
  Search,
  CheckCircle2,
  Inbox,
  HelpCircle
} from 'lucide-react';
import { UserProfile, TabKey } from '../types';
import { useFirebase } from '../context/FirebaseContext';

interface NavbarProps {
  currentUser: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuthModal: () => void;
  unreadMessagesCount: number;
  urgentDeadlinesCount: number;
  campusEventsCount: number;
  onOpenEventsModal: () => void;
  onOpenVerticalNav: () => void;
  onSwitchRoleDirect?: (role: 'student' | 'faculty' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuthModal,
  unreadMessagesCount,
  urgentDeadlinesCount,
  campusEventsCount,
  onOpenEventsModal,
  onOpenVerticalNav,
  onSwitchRoleDirect
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);
  const fb = useFirebase();
  const isFaculty = currentUser.role === 'faculty';
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'coordinator';

  const navItems = isAdmin
    ? [
        { id: 'dashboard', label: 'Admin Records & Exam Hub', icon: ShieldCheck, badge: '🛡️ Admin' },
        { id: 'exam-seating', label: 'Exam Seating Management', icon: MapPin, badge: '📍 Seats & Halls', isHighlight: true },
        { id: 'student-queries', label: 'Student Queries', icon: HelpCircle, badge: '💬 Helpdesk' }
      ]
    : isFaculty
    ? [
        { id: 'dashboard', label: 'Faculty Teaching Hub', icon: Sparkles },
        { id: 'exam-seating', label: 'Exam Seating Management', icon: MapPin, badge: '📍 Seats', isHighlight: true },
        { id: 'student-queries', label: 'Student Queries', icon: HelpCircle, badge: '💬 Desk' },
        { id: 'permission-letter', label: 'Permission Letters', icon: FileCheck, badge: '⚡ Approvals' },
        { id: 'faculty-chat', label: 'Student Doubts & Messages', icon: MessageSquare, count: unreadMessagesCount },
        { id: 'attendance', label: 'Class Attendance Roll', icon: UserCheck },
        { id: 'results', label: 'Grade Moderation', icon: Award },
        { id: 'calendar', label: 'Academic Schedule', icon: Calendar, count: urgentDeadlinesCount },
        { id: 'documentation', label: 'Clearance Desk', icon: FileText },
        { id: 'campus-navigation', label: 'Campus Map & Updates', icon: Compass, badge: '🗺️ Map & Alerts' },
        { id: 'lost-found', label: 'Lost & Found', icon: Search, badge: '📦 Portal' }
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: Sparkles },
        { id: 'student-queries', label: 'Student Queries', icon: HelpCircle, badge: '💬 Inquiries', isHighlight: true },
        { id: 'campus-navigation', label: 'Campus Map & Updates', icon: Compass, badge: '🗺️ Map & Alerts' },
        { id: 'exam-seating', label: 'Exam Seating', icon: MapPin, badge: '📍 204' },
        { id: 'permission-letter', label: 'Permission Letter', icon: FileCheck, badge: '⚡ 1-2 Min' },
        { id: 'attendance', label: 'Attendance', icon: UserCheck, badge: '88.2%' },
        { id: 'results', label: 'Results & GPA', icon: Award, badge: 'CGPA 8.92' },
        { id: 'faculty-chat', label: 'Faculty Connect', icon: MessageSquare, count: unreadMessagesCount },
        { id: 'calendar', label: 'Schedule & Deadlines', icon: Calendar, count: urgentDeadlinesCount },
        { id: 'documentation', label: 'Document Desk', icon: FileText },
        { id: 'lost-found', label: 'Lost & Found', icon: Search, badge: '📦 Lost & Found' }
      ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top utility row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Hamburger menu toggle + Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="navbar-hamburger-btn"
              onClick={onOpenVerticalNav}
              className="p-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer ring-1 ring-slate-200 hover:ring-indigo-300"
              title="Open Vertical Navigation Menu (Gmail Style)"
            >
              <Menu className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800 hidden sm:inline">Menu</span>
            </button>

            {/* Logo & College Identity */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shadow-indigo-500/20 ring-1 ring-indigo-500/30">
                {isAdmin ? <ShieldCheck className="w-5 h-5 text-white" /> : isFaculty ? <BookOpen className="w-5 h-5 text-white" /> : <GraduationCap className="w-5 h-5 text-white" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base tracking-tight text-slate-900 font-heading">
                    Campus<span className="text-indigo-600">Pulse</span>
                  </span>
                  <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    {isAdmin ? 'Admin' : isFaculty ? 'Faculty' : 'Student'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal hidden sm:block">Smart Campus Student Assistant Platform</p>
              </div>
            </div>

            {/* Quick 3-Way Role Switcher Bar (Student | Faculty | Admin) */}
            <div className="hidden xl:flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 shadow-2xs ml-2">
              <button
                type="button"
                id="role-switch-student-btn"
                onClick={() => onSwitchRoleDirect?.('student')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  !isFaculty && !isAdmin
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to Student Portal (Likith E.)"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>

              <button
                type="button"
                id="role-switch-faculty-btn"
                onClick={() => onSwitchRoleDirect?.('faculty')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isFaculty
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to Faculty Portal (Dr. Priya)"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Faculty</span>
              </button>

              <button
                type="button"
                id="role-switch-admin-btn"
                onClick={() => onSwitchRoleDirect?.('admin')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isAdmin
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to Admin Portal (Dr. Narayanan - Exam Cell & Records)"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Right utility actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dedicated Student / Faculty / Admin Login Button */}
            <button
              id="navbar-student-faculty-login-btn"
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
              title="Login with Student, Faculty, or Admin credentials"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Sign In / Switch</span>
            </button>

            {/* Live Student Notifications from Firestore */}
            <div className="relative">
              <button
                id="navbar-student-notifications-btn"
                onClick={() => {
                  setNotificationsDropdownOpen(!notificationsDropdownOpen);
                  setProfileDropdownOpen(false);
                }}
                className="relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                title="Student Academic Notifications"
              >
                <Bell className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline text-xs font-bold">Alerts</span>
                {fb.notifications.filter((n) => !n.read && !n.isRead).length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                    {fb.notifications.filter((n) => !n.read && !n.isRead).length}
                  </span>
                )}
              </button>

              {notificationsDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl py-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Academic Notifications</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">Synced in real-time with Firestore</p>
                    </div>
                    {fb.notifications.some((n) => !n.read && !n.isRead) && (
                      <button
                        onClick={async () => {
                          for (const n of fb.notifications) {
                            if (!n.read && !n.isRead) {
                              await fb.markNotificationRead(n.id);
                            }
                          }
                        }}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {fb.notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400">
                        <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-xs font-semibold">No notifications right now</p>
                        <p className="text-[11px] text-slate-400">You're all caught up!</p>
                      </div>
                    ) : (
                      fb.notifications.map((notif) => {
                        const isUnread = !notif.read && !notif.isRead;
                        return (
                          <div
                            key={notif.id}
                            className={`p-3 text-xs transition-colors hover:bg-slate-50/80 ${
                              isUnread ? 'bg-indigo-50/30' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                {isUnread && (
                                  <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                                )}
                                <span className="font-bold text-slate-900 text-[11px]">
                                  {notif.title}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Today'}
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                              {notif.message}
                            </p>
                            <div className="flex items-center justify-between mt-2 pt-1">
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                {notif.type}
                              </span>
                              <div className="flex items-center gap-2">
                                {notif.actionUrlTab && (
                                  <button
                                    onClick={() => {
                                      setNotificationsDropdownOpen(false);
                                      setActiveTab(notif.actionUrlTab!);
                                    }}
                                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                                  >
                                    View Tab →
                                  </button>
                                )}
                                {isUnread && (
                                  <button
                                    onClick={() => fb.markNotificationRead(notif.id)}
                                    className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                                  >
                                    Mark read
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Campus Events Quick Trigger */}
            <button
              id="navbar-campus-events-btn"
              onClick={onOpenEventsModal}
              className="relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              title="Campus-Wide Event Announcements"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Events</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px] font-semibold">
                {campusEventsCount}
              </span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                id="navbar-profile-toggle-btn"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className={`flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 border transition-colors ${
                  isAdmin ? 'border-purple-300 bg-purple-50/40' : isFaculty ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200'
                }`}
              >
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                />
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    {currentUser.name}
                    <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                      isAdmin ? 'bg-purple-100 text-purple-900' : isFaculty ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {currentUser.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {currentUser.rollNumber || currentUser.designation || currentUser.department}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isAdmin ? 'bg-purple-100 text-purple-900' : isFaculty ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {isAdmin ? 'Admin / Exam Cell' : isFaculty ? 'Faculty' : 'Student'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                    {isAdmin ? (
                      <p className="text-[11px] text-purple-800 font-medium">
                        {currentUser.designation} • {currentUser.cabinLocation}
                      </p>
                    ) : isFaculty ? (
                      <p className="text-[11px] text-amber-700 font-medium">
                        {currentUser.designation} • {currentUser.cabinLocation}
                      </p>
                    ) : (
                      <div className="flex items-center gap-2 text-[11px] text-indigo-600 font-medium">
                        <span>Sem {currentUser.semester}</span>
                        <span>•</span>
                        <span>Roll: {currentUser.rollNumber}</span>
                        <span>•</span>
                        <span>CGPA: {currentUser.cgpa}</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Switch Roles directly */}
                  <div className="p-2 border-b border-slate-100 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 px-2 tracking-wider">
                      Quick Switch Persona:
                    </p>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onSwitchRoleDirect?.('student');
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-indigo-50 text-xs font-bold text-slate-700 hover:text-indigo-900 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-indigo-600" />
                        <span>Student (Likith E. - 22CS084)</span>
                      </div>
                      {!isFaculty && !isAdmin && <span className="text-[10px] text-indigo-600 font-bold">Active</span>}
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onSwitchRoleDirect?.('faculty');
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-amber-50 text-xs font-bold text-slate-700 hover:text-amber-900 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-amber-600" />
                        <span>Faculty (Dr. Priya - CSE Mentor)</span>
                      </div>
                      {isFaculty && <span className="text-[10px] text-amber-700 font-bold">Active</span>}
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onSwitchRoleDirect?.('admin');
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-purple-50 text-xs font-bold text-slate-700 hover:text-purple-900 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        <span>Admin (Dr. Narayanan - Exam Cell)</span>
                      </div>
                      {isAdmin && <span className="text-[10px] text-purple-700 font-bold">Active</span>}
                    </button>
                  </div>

                  <button
                    id="profile-switch-account-btn"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenAuthModal();
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-slate-400" />
                    Enter Custom Login Credentials
                  </button>

                  <button
                    id="profile-logout-btn"
                    onClick={async () => {
                      setProfileDropdownOpen(false);
                      try {
                        await fb.signOutFirebase();
                      } catch {
                        // ignore
                      }
                      onOpenAuthModal();
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100 mt-1 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    Sign Out / Switch Credentials
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Bar: Clean University Horizontal Tab Navigation */}
      <div className="border-t border-slate-200/80 bg-slate-50/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 py-1.5">
          {/* Scrollable primary navigation tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar min-w-0 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id as TabKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ml-0.5 ${
                      isActive ? 'bg-white text-indigo-700' : 'bg-rose-500 text-white'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick vertical drawer launcher for mobile / compact screens */}
          <button
            id="navbar-open-drawer-btn"
            onClick={onOpenVerticalNav}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors shrink-0 cursor-pointer"
            title="Open all modules menu"
          >
            <Menu className="w-3.5 h-3.5" />
            <span>All</span>
          </button>
        </div>
      </div>
    </header>
  );
};
