import React from 'react';
import {
  GraduationCap,
  BookOpen,
  MapPin,
  FileCheck,
  UserCheck,
  Award,
  MessageSquare,
  Calendar,
  FileText,
  Users,
  X,
  Lock,
  ChevronRight,
  LogOut,
  Sparkles,
  ShieldCheck,
  Bell,
  SidebarClose,
  SidebarOpen,
  ExternalLink,
  AlertTriangle,
  Compass,
  Search,
  HelpCircle
} from 'lucide-react';
import { UserProfile, TabKey } from '../types';

interface VerticalNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  unreadMessagesCount: number;
  urgentDeadlinesCount: number;
  onOpenAuthModal: () => void;
  isPinnedDesktop?: boolean;
  onTogglePinDesktop?: () => void;
}

interface NavGroupItem {
  id: TabKey;
  key?: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  count?: number;
  badgeColor?: string;
  subtitle?: string;
}

interface NavGroup {
  groupTitle?: string;
  items: NavGroupItem[];
}

export const VerticalNavigationDrawer: React.FC<VerticalNavigationDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  activeTab,
  setActiveTab,
  unreadMessagesCount,
  urgentDeadlinesCount,
  onOpenAuthModal,
  isPinnedDesktop = false,
  onTogglePinDesktop
}) => {
  const isFaculty = currentUser.role === 'faculty';
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'coordinator';

  // Navigation items grouped cleanly like Gmail drawer in the screenshot
  const studentNavGroups: NavGroup[] = [
    {
      groupTitle: 'Core Modules',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard Overview',
          icon: Sparkles,
          subtitle: 'Academic Home'
        },
        {
          id: 'campus-navigation',
          label: 'Campus Navigation & Updates',
          icon: Compass,
          badge: '🗺️ Map & Alerts',
          badgeColor: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
          subtitle: 'Interactive map, rooms & alerts'
        },
        {
          id: 'exam-seating',
          label: 'Exam Seating Arrangement',
          icon: MapPin,
          badge: 'Hall 204 • Seat 12',
          badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
          subtitle: 'Active 30-min alert'
        },
        {
          id: 'permission-letter',
          label: 'Digital Permission Letter',
          icon: FileCheck,
          badge: '⚡ 1-2 Min',
          badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
          subtitle: 'Mentor & HOD Approval'
        }
      ]
    },
    {
      groupTitle: 'Academics & Learning',
      items: [
        {
          id: 'attendance',
          label: 'Attendance & Lecture Roll',
          icon: UserCheck,
          badge: '88.2%',
          badgeColor: 'bg-emerald-50 text-emerald-700',
          subtitle: 'Safe (≥75% required)'
        },
        {
          id: 'results',
          label: 'Results & GPA Tracker',
          icon: Award,
          badge: 'CGPA 8.92',
          badgeColor: 'bg-amber-50 text-amber-700',
          subtitle: 'Sem 6 Scorecard'
        },
        {
          id: 'faculty-chat',
          label: 'Faculty Connect & Doubts',
          icon: MessageSquare,
          count: unreadMessagesCount,
          subtitle: 'Direct professor messaging'
        },
        {
          id: 'calendar',
          label: 'Schedule & Deadlines',
          icon: Calendar,
          count: urgentDeadlinesCount,
          subtitle: 'Exam dates & submissions'
        }
      ]
    },
    {
      groupTitle: 'Campus Services',
      items: [
        {
          id: 'documentation',
          label: 'Documentation Clearance Desk',
          icon: FileText,
          badge: 'DOC-B14',
          badgeColor: 'bg-cyan-50 text-cyan-700',
          subtitle: 'Bonafide & certificates'
        },
        {
          id: 'lost-found',
          label: 'Campus Lost & Found',
          icon: Search,
          badge: '📦 10 Items',
          badgeColor: 'bg-amber-50 text-amber-800 border border-amber-200',
          subtitle: 'Report lost & found possessions'
        },
        {
          id: 'student-queries',
          label: 'Student Queries & Helpdesk',
          icon: HelpCircle,
          badge: '💬 Inquiries',
          badgeColor: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
          subtitle: 'Submit & track campus tickets'
        }
      ]
    }
  ];

  const facultyNavGroups: NavGroup[] = [
    {
      groupTitle: 'Teaching & Examination Hub',
      items: [
        {
          id: 'dashboard',
          label: 'Faculty Teaching Hub',
          icon: Sparkles,
          subtitle: 'Overview & classes'
        },
        {
          id: 'student-queries',
          label: 'Student Queries Desk',
          icon: HelpCircle,
          badge: '💬 Helpdesk',
          badgeColor: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
          subtitle: 'Review & respond to queries'
        },
        {
          id: 'campus-navigation',
          label: 'Campus Navigation & Updates',
          icon: Compass,
          badge: '🗺️ Map & Alerts',
          badgeColor: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
          subtitle: 'Locations, notices & events'
        },
        {
          id: 'exam-seating',
          label: 'Exam Seating Management',
          icon: MapPin,
          badge: 'Seats & Halls',
          badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
          subtitle: 'Admin, HOD & Mentor access'
        },
        {
          id: 'permission-letter',
          label: 'Permission Requests Queue',
          icon: FileCheck,
          badge: 'Pending Review',
          badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
          subtitle: 'Class mentor & HOD sign-off'
        }
      ]
    },
    {
      groupTitle: 'Classroom & Student Supervision',
      items: [
        {
          id: 'faculty-chat',
          label: 'Student Doubts & Messaging',
          icon: MessageSquare,
          count: unreadMessagesCount,
          subtitle: 'Answer student queries'
        },
        {
          id: 'attendance',
          label: 'Class Attendance Roll',
          icon: UserCheck,
          subtitle: 'Lecture marking sheet'
        },
        {
          id: 'results',
          label: 'Grade Moderation',
          icon: Award,
          subtitle: 'Continuous internal assessment'
        },
        {
          id: 'calendar',
          label: 'Academic Schedule',
          icon: Calendar,
          count: urgentDeadlinesCount,
          subtitle: 'Institutional timetable'
        }
      ]
    },
    {
      groupTitle: 'Administrative & Campus Services',
      items: [
        {
          id: 'documentation',
          label: 'Clearance & Verification Desk',
          icon: FileText,
          subtitle: 'Bonafide approvals'
        },
        {
          id: 'lost-found',
          label: 'Campus Lost & Found',
          icon: Search,
          subtitle: 'Campus directory & recovered items'
        }
      ]
    }
  ];

  const adminNavGroups: NavGroup[] = [
    {
      groupTitle: 'Core Authority & Clearance',
      items: [
        {
          id: 'dashboard',
          key: 'admin-hub',
          label: 'Admin Control Hub',
          icon: ShieldCheck,
          badge: 'Verified',
          badgeColor: 'bg-purple-100 text-purple-900 border border-purple-200',
          subtitle: 'Institutional records & clearance'
        },
        {
          id: 'exam-seating',
          key: 'admin-exam-seating',
          label: 'Exam Seating Arrangement',
          icon: MapPin,
          badge: '36 Seats',
          badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
          subtitle: 'Allocate, publish & notify'
        },
        {
          id: 'student-queries',
          key: 'admin-student-queries',
          label: 'Student Queries & Helpdesk',
          icon: HelpCircle,
          badge: '💬 Tickets',
          badgeColor: 'bg-indigo-100 text-indigo-900 border border-indigo-300',
          subtitle: 'Triage, respond & manage inquiries'
        }
      ]
    },
    {
      groupTitle: 'Student Records Jurisdiction',
      items: [
        {
          id: 'dashboard',
          key: 'admin-student-records',
          label: 'Student Records Directory',
          icon: Users,
          badge: '36 Enrolled',
          badgeColor: 'bg-indigo-50 text-indigo-700',
          subtitle: 'Attendance, CGPA & details'
        }
      ]
    }
  ];

  const currentGroups = isAdmin ? adminNavGroups : isFaculty ? facultyNavGroups : studentNavGroups;

  const handleSelectTab = (tabId: TabKey) => {
    setActiveTab(tabId);
    if (!isPinnedDesktop || window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop overlay for mobile & unpinned drawer */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Vertical Navigation Drawer / Sidebar */}
      <aside
        id="vertical-navigation-drawer"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-white border-r border-slate-200 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isPinnedDesktop ? 'lg:translate-x-0 lg:static lg:z-30 lg:shadow-none' : ''}`}
        aria-label="Vertical Portal Navigation"
      >
        {/* Drawer Header (Styled to match the Gmail screenshot with CampusPulse branding) */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div
            onClick={() => handleSelectTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* CampusPulse indigo badge logo */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105 ${
                isAdmin
                  ? 'bg-purple-700 shadow-purple-200'
                  : isFaculty
                  ? 'bg-teal-600 shadow-teal-200'
                  : 'bg-indigo-600 shadow-indigo-200'
              }`}
            >
              {isAdmin ? <ShieldCheck className="w-5 h-5" /> : isFaculty ? <BookOpen className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors font-heading">
                  Campus<span className="text-indigo-600">Pulse</span>
                </span>
                <span
                  className={`text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full border ${
                    isAdmin
                      ? 'bg-purple-100 text-purple-900 border-purple-300'
                      : isFaculty
                      ? 'bg-teal-50 text-teal-800 border-teal-200'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}
                >
                  {isAdmin ? 'Admin' : isFaculty ? 'Faculty' : 'Student'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                {currentUser.department || 'Computer Science & Engineering'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Desktop Pin / Unpin Toggle if handler provided */}
            {onTogglePinDesktop && (
              <button
                type="button"
                onClick={onTogglePinDesktop}
                title={isPinnedDesktop ? 'Unpin Sidebar (Floating Drawer)' : 'Pin Sidebar to Workspace'}
                className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {isPinnedDesktop ? <SidebarClose className="w-4 h-4" /> : <SidebarOpen className="w-4 h-4" />}
              </button>
            )}

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close Navigation Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Identity Mini Banner */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={
                currentUser.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
              }
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 font-mono truncate">
                {currentUser.rollNumber || currentUser.designation || currentUser.role}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAuthModal();
            }}
            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-white border border-slate-200 hover:border-indigo-300 px-2 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Switch User Role or Sign In"
          >
            Switch
          </button>
        </div>

        {/* Vertical Navigation Scrollable List (Styled precisely like Gmail screenshot) */}
        <div className="flex-1 overflow-y-auto py-2 no-scrollbar divide-y divide-slate-100">
          {currentGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="py-2">
              {group.groupTitle && (
                <div className="px-5 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {group.groupTitle}
                </div>
              )}

              <div className="space-y-0.5">
                {group.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const uniqueKey = item.key || `${item.id}-${item.label}-${groupIdx}-${itemIdx}`;

                  return (
                    <button
                      key={uniqueKey}
                      id={`vertical-nav-item-${item.key || item.id}-${groupIdx}-${itemIdx}`}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center justify-between py-2.5 px-4 sm:px-5 transition-all duration-150 cursor-pointer text-left ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-bold rounded-r-xl mr-3 shadow-2xs border-l-4 border-indigo-600'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-r-xl mr-3 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-indigo-600' : 'text-slate-500'
                          }`}
                        />
                        <div className="min-w-0">
                          <span className="text-xs sm:text-[13px] block truncate tracking-tight">
                            {item.label}
                          </span>
                          {item.subtitle && !isActive && (
                            <span className="text-[10px] text-slate-400 block truncate">
                              {item.subtitle}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {item.badge && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              item.badgeColor || 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}

                        {item.count !== undefined && item.count > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold shadow-xs">
                            {item.count}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Drawer Bottom Footer (Institutional Help & Credentials) */}
        <div className="p-3 bg-slate-50/80 border-t border-slate-200 shrink-0 space-y-1 text-xs">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAuthModal();
            }}
            className="w-full flex items-center justify-between p-2 rounded-xl text-slate-700 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-semibold">Student / Faculty Login</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <div className="px-2 pt-1 flex items-center justify-between text-[10px] text-slate-400">
            <span>Apex University Academic Cloud</span>
            <span>v2.6.4</span>
          </div>
        </div>
      </aside>
    </>
  );
};
