import React, { useState, useEffect, useMemo } from 'react';
import {
  HelpCircle,
  PlusCircle,
  Inbox,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Building2,
  Tag,
  Paperclip,
  Eye,
  ShieldCheck,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Layers,
  ArrowRight,
  FileQuestion
} from 'lucide-react';
import {
  StudentQuery,
  UserProfile,
  QueryCategory,
  QueryStatus
} from '../../types';
import {
  studentQueryService,
  QUERY_CATEGORIES,
  QUERY_STATUSES
} from '../../services/studentQueryService';
import { StudentQuerySubmissionForm } from '../queries/StudentQuerySubmissionForm';
import { QueryDetailView } from '../queries/QueryDetailView';
import { AdminQueryManagementView } from '../queries/AdminQueryManagementView';

interface StudentQueriesTabProps {
  currentUser: UserProfile;
  initialQueryId?: string;
  onNavigateTab?: (tab: string) => void;
}

export const StudentQueriesTab: React.FC<StudentQueriesTabProps> = ({
  currentUser,
  initialQueryId
}) => {
  const isStaff = currentUser.role === 'admin' || currentUser.role === 'faculty' || currentUser.role === 'coordinator';

  // Active view: 'list' | 'submit' | 'detail' | 'admin'
  const [activeView, setActiveView] = useState<'list' | 'submit' | 'detail' | 'admin'>(() => {
    if (initialQueryId) return 'detail';
    return 'list';
  });

  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(initialQueryId || null);

  // Student's own queries
  const [myQueries, setMyQueries] = useState<StudentQuery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filters for student list
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Pagination for student list
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  // Real-time Firestore subscription for student queries
  useEffect(() => {
    const studentUid = currentUser.id || currentUser.uid;
    if (!studentUid) return;

    setLoading(true);
    const unsub = studentQueryService.subscribeStudentQueries(studentUid, (list) => {
      setMyQueries(list);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser.id, currentUser.uid]);

  // Filtered queries
  const filteredMyQueries = useMemo(() => {
    return myQueries.filter((q) => {
      const term = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !term ||
        q.queryId.toLowerCase().includes(term) ||
        q.title.toLowerCase().includes(term) ||
        q.description.toLowerCase().includes(term);

      const matchesCat = selectedCategory === 'all' || q.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || q.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [myQueries, searchQuery, selectedCategory, selectedStatus]);

  // Paginated queries
  const totalPages = Math.ceil(filteredMyQueries.length / pageSize) || 1;
  const paginatedMyQueries = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredMyQueries.slice(startIndex, startIndex + pageSize);
  }, [filteredMyQueries, currentPage]);

  const handleOpenDetail = (queryId: string) => {
    setSelectedQueryId(queryId);
    setActiveView('detail');
  };

  const handleCreatedSuccess = (newQuery: StudentQuery) => {
    setSelectedQueryId(newQuery.queryId);
    setActiveView('detail');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & View Switcher */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span>Student Query Portal</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300 border border-white/10">
                Official Campus Helpdesk
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Student Queries &amp; Support Hub
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Submit inquiries, request academic clearances, verify scholarship documents, or seek departmental assistance. All tickets persist securely in Cloud Firestore with official administrative review tracking.
            </p>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                setActiveView('submit');
                setSelectedQueryId(null);
              }}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md shadow-indigo-900/50 transition-all cursor-pointer flex items-center gap-2 active:scale-98"
            >
              <PlusCircle className="w-4 h-4 text-indigo-200" />
              <span>Submit New Query</span>
            </button>

            <button
              onClick={() => {
                setActiveView('list');
                setSelectedQueryId(null);
              }}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all cursor-pointer flex items-center gap-2"
            >
              <Inbox className="w-4 h-4 text-indigo-300" />
              <span>My Queries ({myQueries.length})</span>
            </button>

            {isStaff && (
              <button
                onClick={() => {
                  setActiveView('admin');
                  setSelectedQueryId(null);
                }}
                className="px-4 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 font-bold text-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>Staff Management Desk</span>
              </button>
            )}
          </div>
        </div>

        {/* View Selection Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-slate-800">
          <button
            onClick={() => {
              setActiveView('list');
              setSelectedQueryId(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'list'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>My Submitted Queries ({myQueries.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveView('submit');
              setSelectedQueryId(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'submit'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Query Submission Form</span>
          </button>

          {isStaff && (
            <button
              onClick={() => {
                setActiveView('admin');
                setSelectedQueryId(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'admin'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Management Desk</span>
            </button>
          )}

          {activeView === 'detail' && selectedQueryId && (
            <span className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold flex items-center gap-1 border border-indigo-400/20 ml-auto">
              <span>Viewing Ticket: {selectedQueryId}</span>
            </span>
          )}
        </div>
      </div>

      {/* VIEW 1: SUBMIT NEW QUERY */}
      {activeView === 'submit' && (
        <StudentQuerySubmissionForm
          currentUser={currentUser}
          onSuccess={handleCreatedSuccess}
          onCancel={() => setActiveView('list')}
        />
      )}

      {/* VIEW 2: QUERY DETAIL PAGE */}
      {activeView === 'detail' && selectedQueryId && (
        <QueryDetailView
          queryId={selectedQueryId}
          currentUser={currentUser}
          onBack={() => {
            setActiveView('list');
            setSelectedQueryId(null);
          }}
          onQueryUpdated={(updated) => {
            setMyQueries((prev) =>
              prev.map((q) => (q.id === updated.id || q.queryId === updated.queryId ? updated : q))
            );
          }}
        />
      )}

      {/* VIEW 3: ADMIN QUERY MANAGEMENT */}
      {activeView === 'admin' && isStaff && (
        <AdminQueryManagementView
          currentUser={currentUser}
          onSelectQuery={handleOpenDetail}
        />
      )}

      {/* VIEW 4: MY QUERIES DASHBOARD */}
      {activeView === 'list' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by Query ID or Title keyword..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white focus:outline-hidden"
                >
                  <option value="all">All Categories</option>
                  {QUERY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white focus:outline-hidden"
                >
                  <option value="all">All Statuses</option>
                  {QUERY_STATUSES.map((st) => (
                    <option key={st.key} value={st.key}>
                      {st.label}
                    </option>
                  ))}
                </select>

                {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedStatus('all');
                      setCurrentPage(1);
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    title="Reset filters"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setSelectedStatus('all'); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  selectedStatus === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({myQueries.length})
              </button>

              {QUERY_STATUSES.map((st) => {
                const count = myQueries.filter((q) => q.status === st.key).length;
                return (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => { setSelectedStatus(st.key); setCurrentPage(1); }}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      selectedStatus === st.key
                        ? 'bg-indigo-600 text-white'
                        : `${st.badgeClass} hover:opacity-90`
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dotColor}`} />
                    <span>{st.label} ({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Empty State when student has 0 queries at all */}
          {myQueries.length === 0 && !loading && (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
                <HelpCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  No Submitted Queries Yet
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Have questions about examinations, attendance records, scholarship verification, or hostel facilities? File your first query now to get answers directly from college administration.
                </p>
              </div>
              <button
                onClick={() => setActiveView('submit')}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer inline-flex items-center gap-2 active:scale-98"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Your First Query</span>
              </button>
            </div>
          )}

          {/* Empty State when filters yield 0 results */}
          {myQueries.length > 0 && paginatedMyQueries.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-slate-900">No Matching Queries</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No tickets match the current filter or search keyword.
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                  setCurrentPage(1);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>
          )}

          {/* Query Cards List */}
          {paginatedMyQueries.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedMyQueries.map((item) => {
                const statusMeta = QUERY_STATUSES.find((s) => s.key === item.status) || QUERY_STATUSES[0];
                const hasAdminReplied = !!item.latestResponse;

                return (
                  <div
                    key={item.id || item.queryId}
                    onClick={() => handleOpenDetail(item.id || item.queryId)}
                    className="bg-white hover:bg-slate-50/80 rounded-3xl border border-slate-200 p-5 sm:p-6 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      {/* Card Top: Query ID & Status */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                          {item.queryId}
                        </span>

                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border flex items-center gap-1.5 ${statusMeta.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotColor}`} />
                          <span>{statusMeta.label}</span>
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {item.title}
                      </h3>

                      {/* Description snippet */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Latest Admin Response Box if available */}
                      {hasAdminReplied && (
                        <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 space-y-1">
                          <span className="font-bold text-[10px] uppercase tracking-wider text-indigo-700 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            <span>Latest Administrator Response</span>
                          </span>
                          <p className="text-xs text-indigo-900 line-clamp-2 italic">
                            "{item.latestResponse}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Card Footer: Metadata & Open action */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2 truncate">
                        <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate font-medium">{item.category}</span>
                        <span>•</span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <span className="font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 shrink-0">
                        <span>View Ticket</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex items-center justify-between text-xs">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-colors ${
                  currentPage === 1
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-700 hover:bg-slate-100 cursor-pointer'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1 font-bold">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-colors ${
                  currentPage === totalPages
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-700 hover:bg-slate-100 cursor-pointer'
                }`}
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
