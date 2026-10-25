import React, { useState, useEffect } from 'react';
import {
  MOCK_STUDENT_USER,
  MOCK_FACULTY_USER,
  INITIAL_CAMPUS_EVENTS,
  INITIAL_DEADLINES,
  INITIAL_SEMESTER_RESULTS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_DOCUMENT_APPOINTMENTS
} from './data/mockData';
import { UserProfile, UserRole, TabKey, CampusEvent, AcademicDeadline, ExamSeatingNotification } from './types';
import { Navbar } from './components/Navbar';
import { EventNotificationBanner } from './components/EventNotificationBanner';
import { DeadlinesStrip } from './components/DeadlinesStrip';
import { LoginModal } from './components/LoginModal';
import { Exam30MinNotificationBanner } from './components/Exam30MinNotificationBanner';
import { examSeatingService } from './services/examSeatingService';
import { firebaseDbService } from './services/firebaseDbService';
import { auth } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// Tab Views
import { DashboardTab } from './components/tabs/DashboardTab';
import { FacultyDashboardTab } from './components/tabs/FacultyDashboardTab';
import { AttendanceTab } from './components/tabs/AttendanceTab';
import { ResultsTab } from './components/tabs/ResultsTab';
import { FacultyChatTab } from './components/tabs/FacultyChatTab';
import { CalendarTab } from './components/tabs/CalendarTab';
import { DocumentationTab } from './components/tabs/DocumentationTab';
import { PermissionLetterTab } from './components/tabs/PermissionLetterTab';
import { ExamSeatingTab } from './components/tabs/ExamSeatingTab';
import { CampusNavigationTab } from './components/tabs/CampusNavigationTab';
import { LostFoundTab } from './components/tabs/LostFoundTab';
import { AdminDashboardTab } from './components/tabs/AdminDashboardTab';
import { StudentQueriesTab } from './components/tabs/StudentQueriesTab';
import { VerticalNavigationDrawer } from './components/VerticalNavigationDrawer';
import { useFirebase } from './context/FirebaseContext';

import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  Users,
  Megaphone,
  X,
  ExternalLink
} from 'lucide-react';

export default function App() {
  const fb = useFirebase();

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('campus_user_session');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return MOCK_STUDENT_USER;
  });
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [showEventsModal, setShowEventsModal] = useState<boolean>(false);

  const [campusEvents, setCampusEvents] = useState<CampusEvent[]>(INITIAL_CAMPUS_EVENTS);
  const [deadlines, setDeadlines] = useState<AcademicDeadline[]>(INITIAL_DEADLINES);
  const [exam30MinNotification, setExam30MinNotification] = useState<ExamSeatingNotification | null>(null);
  const [isVerticalNavOpen, setIsVerticalNavOpen] = useState<boolean>(false);
  const [isPinnedDesktop, setIsPinnedDesktop] = useState<boolean>(false);
  const [showDemoBanner, setShowDemoBanner] = useState<boolean>(false);

  // Sync state with live Firebase context if data arrives
  useEffect(() => {
    if (fb.campusEvents) {
      setCampusEvents(fb.campusEvents);
    }
  }, [fb.campusEvents]);

  useEffect(() => {
    if (fb.deadlines) {
      setDeadlines(fb.deadlines);
    }
  }, [fb.deadlines]);

  // Sync user profile when Firebase Auth user changes
  useEffect(() => {
    if (fb.firebaseUser) {
      firebaseDbService.getUserProfile(fb.firebaseUser.uid).then((prof) => {
        if (prof) {
          setCurrentUser(prof);
          try {
            localStorage.setItem('campus_user_session', JSON.stringify(prof));
          } catch {
            // ignore
          }
        } else if (fb.firebaseUser) {
          // Derive profile directly from authenticated credentials
          const email = fb.firebaseUser.email || '';
          const name = fb.firebaseUser.displayName || (email === 'admin.examcell@campus.edu' ? 'Dr. S. Narayanan' : email === 'faculty@campus.edu' ? 'Dr. Priya Swaminathan' : email.split('@')[0]) || 'Campus User';
          const isAdmin = email === 'polyganpath@gmail.com' || email === 'kotlasaikarthik81@gmail.com' || email === 'admin.examcell@campus.edu' || email.includes('admin');
          const isFaculty = email.includes('faculty') || email.includes('priya') || email.includes('hod');
          const role: UserRole = isAdmin ? 'admin' : isFaculty ? 'faculty' : 'student';
          const derivedProf: UserProfile = {
            id: fb.firebaseUser.uid,
            uid: fb.firebaseUser.uid,
            name,
            email,
            role,
            department: isAdmin
              ? 'Examination Cell & Student Records Directorate'
              : 'Computer Science & Engineering',
            year: '3rd Year (VI Semester)',
            section: 'Section A',
            createdAt: new Date().toISOString(),
            avatarUrl: fb.firebaseUser.photoURL || (isAdmin ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' : isFaculty ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'),
            ...(isAdmin
              ? {
                  designation: 'Chief Controller of Examinations & Academic Records',
                  cabinLocation: 'Academic Administrative Block - Chamber 104'
                }
              : isFaculty
              ? {
                  designation: 'Associate Professor & Class Mentor',
                  cabinLocation: 'Cabin #204, Tech Tower',
                  assignedClass: 'CSE-A'
                }
              : {
                  rollNumber: '22CS084',
                  semester: 6,
                  section: 'Section A'
                })
          };
          setCurrentUser(derivedProf);
          try {
            localStorage.setItem('campus_user_session', JSON.stringify(derivedProf));
          } catch {
            // ignore
          }
          firebaseDbService.saveUserProfile(derivedProf).catch((saveErr) => {
            console.warn('Could not persist derived profile to Firestore:', saveErr);
          });
        }
      }).catch((profileErr) => {
        console.warn('Could not retrieve user profile from Firestore, using locally built profile:', profileErr);
        if (fb.firebaseUser) {
          const email = fb.firebaseUser.email || '';
          const name = fb.firebaseUser.displayName || (email === 'admin.examcell@campus.edu' ? 'Dr. S. Narayanan' : email === 'faculty@campus.edu' ? 'Dr. Priya Swaminathan' : email.split('@')[0]) || 'Campus User';
          const isAdmin = email === 'polyganpath@gmail.com' || email === 'kotlasaikarthik81@gmail.com' || email === 'admin.examcell@campus.edu' || email.includes('admin');
          const isFaculty = email.includes('faculty') || email.includes('priya') || email.includes('hod');
          const role: UserRole = isAdmin ? 'admin' : isFaculty ? 'faculty' : 'student';
          const derivedProf: UserProfile = {
            id: fb.firebaseUser.uid,
            uid: fb.firebaseUser.uid,
            name,
            email,
            role,
            department: isAdmin
              ? 'Examination Cell & Student Records Directorate'
              : 'Computer Science & Engineering',
            year: '3rd Year (VI Semester)',
            section: 'Section A',
            createdAt: new Date().toISOString(),
            avatarUrl: fb.firebaseUser.photoURL || (isAdmin ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' : isFaculty ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'),
            ...(isAdmin
              ? {
                  designation: 'Chief Controller of Examinations & Academic Records',
                  cabinLocation: 'Academic Administrative Block - Chamber 104'
                }
              : isFaculty
              ? {
                  designation: 'Associate Professor & Class Mentor',
                  cabinLocation: 'Cabin #204, Tech Tower',
                  assignedClass: 'CSE-A'
                }
              : {
                  rollNumber: '22CS084',
                  semester: 6,
                  section: 'Section A'
                })
          };
          setCurrentUser(derivedProf);
          try {
            localStorage.setItem('campus_user_session', JSON.stringify(derivedProf));
          } catch {
            // ignore
          }
        }
      });
    }
  }, [fb.firebaseUser]);

  // Automatic 30-Minute Notification Engine (Checks on mount and every 10s)
  useEffect(() => {
    const checkNotification = () => {
      if (currentUser.role === 'student') {
        const notif = examSeatingService.checkAndTrigger30MinNotification(
          currentUser.id,
          currentUser.rollNumber
        );
        if (notif && notif.status !== 'dismissed') {
          setExam30MinNotification(notif);
        }
      } else {
        setExam30MinNotification(null);
      }
    };

    checkNotification();
    const interval = setInterval(checkNotification, 10000);
    return () => clearInterval(interval);
  }, [currentUser.id, currentUser.role, currentUser.rollNumber]);

  // Lost & Found initial action navigation
  const [lostFoundInitialAction, setLostFoundInitialAction] = useState<'browse' | 'report-lost' | 'report-found' | 'my-reports'>('browse');

  const handleOpenLostFound = (action: 'browse' | 'report-lost' | 'report-found' | 'my-reports' = 'browse') => {
    setLostFoundInitialAction(action);
    setActiveTab('lost-found');
  };

  const handleRoleChange = (newRole: UserRole) => {
    const updatedUser = {
      ...currentUser,
      role: newRole,
      name:
        newRole === 'student'
          ? 'Likith E.'
          : newRole === 'faculty'
          ? 'Dr. Priya Swaminathan'
          : 'Dr. S. Narayanan',
      department:
        newRole === 'admin'
          ? 'Examination Cell & Student Records Directorate'
          : 'Computer Science & Engineering'
    };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('campus_user_session', JSON.stringify(updatedUser));
    } catch {
      // ignore
    }
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('campus_user_session', JSON.stringify(user));
    } catch {
      // ignore
    }
    setActiveTab('dashboard');
  };

  // Direct 1-click persona switch between Student, Faculty, and Admin
  const handleSwitchRoleDirect = async (role: 'student' | 'faculty' | 'admin') => {
    setShowDemoBanner(true);

    const demoCreds = {
      admin: {
        email: 'admin.examcell@campus.edu',
        pass: 'admin@123',
        defaultUser: {
          id: 'admin-examcell-01',
          uid: 'admin-examcell-01',
          name: 'Dr. S. Narayanan',
          email: 'admin.examcell@campus.edu',
          role: 'admin' as const,
          department: 'Examination Cell & Student Records Directorate',
          designation: 'Chief Controller of Examinations & Academic Records',
          cabinLocation: 'Academic Administrative Block - Chamber 104',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
        }
      },
      faculty: {
        email: 'faculty@campus.edu',
        pass: 'faculty@123',
        defaultUser: {
          ...MOCK_FACULTY_USER,
          id: 'faculty-priya-01',
          uid: 'faculty-priya-01',
          name: 'Dr. Priya Swaminathan',
          email: 'faculty@campus.edu',
          role: 'faculty' as const,
          department: 'Computer Science & Engineering',
          designation: 'Associate Professor & Class Mentor',
          cabinLocation: 'Cabin #204, Tech Tower',
          assignedClass: 'CSE-A'
        }
      },
      student: {
        email: 'student@campus.edu',
        pass: 'student@123',
        defaultUser: {
          ...MOCK_STUDENT_USER,
          id: 'student-likith-01',
          uid: 'student-likith-01',
          name: 'Likith E.',
          rollNumber: '22CS084',
          email: 'student@campus.edu',
          role: 'student' as const,
          department: 'Computer Science & Engineering',
          year: '3rd Year (VI Semester)',
          semester: 6,
          section: 'Section A'
        }
      }
    };

    const target = demoCreds[role];
    let switchedUser: UserProfile = { ...target.defaultUser };

    try {
      if (auth.currentUser?.email !== target.email) {
        let authUser = null;
        try {
          const cred = await signInWithEmailAndPassword(auth, target.email, target.pass);
          authUser = cred.user;
        } catch (signInErr: unknown) {
          const fbErr = signInErr as { code?: string };
          if (
            fbErr.code === 'auth/user-not-found' ||
            fbErr.code === 'auth/invalid-credential' ||
            fbErr.code === 'auth/invalid-login-credentials'
          ) {
            try {
              const reg = await createUserWithEmailAndPassword(auth, target.email, target.pass);
              authUser = reg.user;
            } catch (createErr) {
              console.warn('Demo user auto-create notice:', createErr);
            }
          }
        }
        if (authUser) {
          switchedUser.id = authUser.uid;
          switchedUser.uid = authUser.uid;
        }
      } else if (auth.currentUser) {
        switchedUser.id = auth.currentUser.uid;
        switchedUser.uid = auth.currentUser.uid;
      }
    } catch (authErr) {
      console.warn('Demo switch auth notification:', authErr);
    }

    setCurrentUser(switchedUser);
    firebaseDbService.saveUserProfile(switchedUser).catch(() => {});
    try {
      localStorage.setItem('campus_user_session', JSON.stringify(switchedUser));
    } catch {
      // ignore
    }
    setActiveTab('dashboard');
  };

  // Toggle RSVP on campus events
  const handleToggleRsvp = (eventId: string) => {
    setCampusEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === eventId) {
          const updated = {
            ...ev,
            userRegistered: !ev.userRegistered,
            registeredCount: ev.userRegistered ? ev.registeredCount - 1 : ev.registeredCount + 1
          };
          firebaseDbService.updateCampusEvent(eventId, {
            userRegistered: updated.userRegistered,
            registeredCount: updated.registeredCount
          }).catch(() => {});
          return updated;
        }
        return ev;
      })
    );
  };

  // Mark academic deadline complete
  const handleMarkDeadlineComplete = (deadlineId: string) => {
    setDeadlines((prev) =>
      prev.map((d) => {
        if (d.id === deadlineId) {
          const updated = { ...d, status: 'completed' as const };
          firebaseDbService.updateDeadline(deadlineId, { status: 'completed' }).catch(() => {});
          return updated;
        }
        return d;
      })
    );
  };

  const urgentDeadlinesCount = deadlines.filter((d) => d.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={(tab) => setActiveTab(tab as TabKey)}
        onOpenAuthModal={() => setIsLoginModalOpen(true)}
        unreadMessagesCount={2}
        urgentDeadlinesCount={urgentDeadlinesCount}
        campusEventsCount={campusEvents.length}
        onOpenEventsModal={() => setShowEventsModal(true)}
        onOpenVerticalNav={() => setIsVerticalNavOpen(true)}
        onSwitchRoleDirect={handleSwitchRoleDirect}
      />

      {/* Demo Mode Notification Banner */}
      {showDemoBanner && (
        <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2 text-xs text-amber-900 flex items-center justify-between shadow-2xs z-30 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2 max-w-5xl">
            <span className="font-semibold px-2 py-0.5 rounded-full bg-amber-200/90 text-amber-900 text-[10px] uppercase tracking-wider shrink-0 font-mono">
              {currentUser.role === 'student' ? 'Student View' : currentUser.role === 'faculty' ? 'Faculty Desk' : 'Admin Authority'}
            </span>
            <p className="line-clamp-1 sm:line-clamp-none">
              <span className="font-bold">Demo mode: data is not shared</span> across external accounts. Switch personas via the quick-switch menu in the top right to verify that student submissions, faculty endorsements, and status updates reach each role in this session.
            </p>
          </div>
          <button
            onClick={() => setShowDemoBanner(false)}
            className="text-amber-700 hover:text-amber-950 font-bold px-2 py-0.5 rounded text-xs cursor-pointer shrink-0 ml-3 hover:bg-amber-100"
            title="Dismiss banner"
          >
            ✕
          </button>
        </div>
      )}

      {/* Gmail-Style Vertical Navigation Drawer / Sidebar */}
      <VerticalNavigationDrawer
        isOpen={isVerticalNavOpen}
        onClose={() => setIsVerticalNavOpen(false)}
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab as TabKey);
          setIsVerticalNavOpen(false);
        }}
        unreadMessagesCount={2}
        urgentDeadlinesCount={urgentDeadlinesCount}
        onOpenAuthModal={() => setIsLoginModalOpen(true)}
        isPinnedDesktop={isPinnedDesktop}
        onTogglePinDesktop={() => setIsPinnedDesktop((prev) => !prev)}
      />

      {/* 30-Minute Automatic Exam Seating Alert Banner */}
      {currentUser.role === 'student' && (
        <Exam30MinNotificationBanner
          notification={exam30MinNotification}
          onNavigateToSeating={() => setActiveTab('exam-seating')}
          onDismiss={() => {
            if (exam30MinNotification) {
              const notifs = examSeatingService.getNotifications();
              const updated = notifs.map((n) =>
                n.notificationId === exam30MinNotification.notificationId
                  ? { ...n, status: 'dismissed' as const }
                  : n
              );
              examSeatingService.saveNotifications(updated);
            }
            setExam30MinNotification(null);
          }}
        />
      )}

      {/* Campus-Wide Notices & Deadlines Banner (Shown quietly on Dashboard overview) */}
      {activeTab === 'dashboard' && (
        <>
          <EventNotificationBanner
            events={campusEvents}
            onToggleRsvp={handleToggleRsvp}
            onOpenDetails={() => setShowEventsModal(true)}
          />
          <DeadlinesStrip
            deadlines={deadlines}
            onNavigateTab={(tab) => setActiveTab(tab as TabKey)}
            onMarkComplete={handleMarkDeadlineComplete}
          />
        </>
      )}

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          currentUser.role === 'admin' ? (
            <AdminDashboardTab
              currentUser={currentUser}
              onNavigateTab={(tab) => setActiveTab(tab as TabKey)}
              onOpenVerticalNav={() => setIsVerticalNavOpen(true)}
            />
          ) : currentUser.role === 'faculty' ? (
            <FacultyDashboardTab
              currentUser={currentUser}
              onNavigateTab={(tab) => setActiveTab(tab as TabKey)}
            />
          ) : (
            <DashboardTab
              currentUser={currentUser}
              attendance={fb.attendance}
              results={fb.results}
              deadlines={deadlines}
              events={campusEvents}
              appointments={INITIAL_DOCUMENT_APPOINTMENTS}
              onNavigateTab={(tab) => setActiveTab(tab as TabKey)}
              onOpenVerticalNav={() => setIsVerticalNavOpen(true)}
              onOpenLostFoundAction={handleOpenLostFound}
            />
          )
        )}

        {activeTab === 'attendance' && (
          <AttendanceTab
            attendance={fb.attendance}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'results' && (
          <ResultsTab results={fb.results} />
        )}

        {activeTab === 'faculty-chat' && (
          <FacultyChatTab
            currentUser={currentUser}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarTab deadlines={deadlines} />
        )}

        {activeTab === 'documentation' && (
          <DocumentationTab />
        )}

        {activeTab === 'permission-letter' && (
          <PermissionLetterTab
            currentUser={currentUser}
            onNavigateTab={(tab) => setActiveTab(tab as TabKey)}
          />
        )}

        {activeTab === 'exam-seating' && (
          <ExamSeatingTab
            currentUser={currentUser}
            onNavigateTab={(tab) => setActiveTab(tab as TabKey)}
          />
        )}

        {activeTab === 'campus-navigation' && (
          <CampusNavigationTab
            currentUser={currentUser}
            onNavigateTab={(tab) => setActiveTab(tab as TabKey)}
          />
        )}

        {activeTab === 'lost-found' && (
          <LostFoundTab
            currentUser={currentUser}
            initialAction={lostFoundInitialAction}
            onNavigateTab={(tab) => setActiveTab(tab as TabKey)}
          />
        )}

        {activeTab === 'student-queries' && (
          <StudentQueriesTab
            currentUser={currentUser}
            onNavigateTab={(tab) => setActiveTab(tab as TabKey)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-800 font-heading">Campus<span className="text-indigo-600">Pulse</span></span>
            <span>• Smart Campus Student Assistant Platform (2025-2026)</span>
          </div>

          <div className="flex items-center flex-wrap justify-center gap-3 sm:gap-4 text-[11px]">
            <button
              onClick={() => setActiveTab('exam-seating')}
              className="hover:text-indigo-700 font-semibold text-slate-600 transition-colors cursor-pointer"
            >
              Exam Seating
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('permission-letter')}
              className="hover:text-indigo-700 font-semibold text-slate-600 transition-colors cursor-pointer"
            >
              Permission Letter
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('campus-navigation')}
              className="hover:text-indigo-700 font-semibold text-slate-600 transition-colors cursor-pointer"
            >
              Campus Map
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('lost-found')}
              className="hover:text-indigo-700 font-semibold text-slate-600 transition-colors cursor-pointer"
            >
              Lost &amp; Found
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('attendance')}
              className="hover:text-indigo-700 font-semibold text-slate-600 transition-colors cursor-pointer"
            >
              Attendance
            </button>
            <span>•</span>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
            >
              Sign In / Switch
            </button>
          </div>
        </div>
      </footer>

      {/* Secure SSO / Student & Faculty Authentication Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialRole={currentUser.role}
      />

      {/* Campus Events Detailed Modal */}
      {showEventsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Campus-Wide Events & Symposia</h3>
                  <p className="text-xs text-indigo-200">Official university notices, technical hackathons & summits</p>
                </div>
              </div>
              <button
                onClick={() => setShowEventsModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {campusEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:border-indigo-300 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                          {event.category}
                        </span>
                        {event.isUrgent && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800 animate-pulse">
                            Urgent Notice
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1.5">{event.title}</h4>
                      <p className="text-xs text-slate-600 mt-1">{event.description}</p>
                    </div>

                    <button
                      onClick={() => handleToggleRsvp(event.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        event.userRegistered
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                      }`}
                    >
                      {event.userRegistered ? 'RSVP Active ✓' : 'Register / RSVP'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      {event.date} • {event.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                      {event.venue}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      {event.registeredCount} Registered
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowEventsModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close Notice Board
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
