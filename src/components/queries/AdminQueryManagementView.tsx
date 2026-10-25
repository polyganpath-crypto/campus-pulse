import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Building2,
  Tag,
  Eye,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Layers,
  Inbox,
  Sparkles,
  HelpCircle,
  FileQuestion,
  Loader2
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
  COLLEGE_DEPARTMENTS,
  QUERY_STATUSES
} from '../../services/studentQueryService';

interface AdminQueryManagementViewProps {
  currentUser: UserProfile;
  onSelectQuery: (queryId: string) => void;
}

export const AdminQueryManagementView: React.FC<AdminQueryManagementViewProps> = ({
  currentUser,
  onSelectQuery
}) => {
  const [queries, setQueries] = useState<StudentQuery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters and search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  // Real-time subscription to all queries
  useEffect(() => {
    setLoading(true);
    const unsub = studentQueryService.subscribeAllQueries((data) => {
      setQueries(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    return studentQueryService.computeStats(queries);
  }, [queries]);

  // Filtered list
  const filteredQueries = useMemo(() => {
    return queries.filter((q) => {
      const term = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !term ||
        q.queryId.toLowerCase().includes(term) ||
        q.title.toLowerCase().includes(term) ||
        q.description.toLowerCase().includes(term) ||
        q.studentName.toLowerCase().includes(term) ||
        (q.studentRollNumber && q.studentRollNumber.toLowerCase().includes(term));

      const matchesCat = selectedCategory === 'all' || q.category === selectedCategory;
      const matchesDept = selectedDepartment === 'all' || q.department === selectedDepartment;
      const matchesStatus = selectedStatus === 'all' || q.status === selectedStatus;

      return matchesSearch && matchesCat && matchesDept && matchesStatus;
    });
  }, [queries, searchQuery, selectedCategory, selectedDepartment, selectedStatus]);

  // Pagination slicing
  const totalPages = Math.ceil(filteredQueries.length / pageSize) || 1;
  const paginatedQueries = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredQueries.slice(startIndex, startIndex + pageSize);
  }, [filteredQueries, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDepartment('all');
    setSelectedStatus('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* 6 Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total */}
        <div
          onClick={() => { setSelectedStatus('all'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'all'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold opacity-80">
            <span>Total Inquiries</span>
            <Inbox className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black mt-2">{stats.total}</div>
          <span className="text-[10px] opacity-75 font-medium">All collections</span>
        </div>

        {/* Submitted (New) */}
        <div
          onClick={() => { setSelectedStatus('SUBMITTED'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'SUBMITTED'
              ? 'bg-indigo-900 text-white border-indigo-900 shadow-md'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-indigo-700">
            <span className={selectedStatus === 'SUBMITTED' ? 'text-indigo-200' : 'text-indigo-700'}>New Filed</span>
            <FileQuestion className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black mt-2 text-indigo-600 dark:text-indigo-200">{stats.submitted}</div>
          <span className="text-[10px] text-slate-400 font-medium">Awaiting triage</span>
        </div>

        {/* Under Review */}
        <div
          onClick={() => { setSelectedStatus('UNDER REVIEW'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'UNDER REVIEW'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-amber-700">
            <span className={selectedStatus === 'UNDER REVIEW' ? 'text-amber-100' : 'text-amber-700'}>Under Review</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black mt-2 text-amber-600 dark:text-amber-200">{stats.underReview}</div>
          <span className="text-[10px] text-slate-400 font-medium">In investigation</span>
        </div>

        {/* Needs Information */}
        <div
          onClick={() => { setSelectedStatus('NEEDS INFORMATION'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'NEEDS INFORMATION'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-rose-700">
            <span className={selectedStatus === 'NEEDS INFORMATION' ? 'text-rose-100' : 'text-rose-700'}>Awaiting Student</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black mt-2 text-rose-600 dark:text-rose-200">{stats.needsInformation}</div>
          <span className="text-[10px] text-slate-400 font-medium">Needs information</span>
        </div>

        {/* Answered */}
        <div
          onClick={() => { setSelectedStatus('ANSWERED'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'ANSWERED'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700">
            <span className={selectedStatus === 'ANSWERED' ? 'text-emerald-100' : 'text-emerald-700'}>Answered</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black mt-2 text-emerald-600 dark:text-emerald-200">{stats.answered}</div>
          <span className="text-[10px] text-slate-400 font-medium">Response sent</span>
        </div>

        {/* Closed */}
        <div
          onClick={() => { setSelectedStatus('CLOSED'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'CLOSED'
              ? 'bg-slate-800 text-white border-slate-800 shadow-md'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
            <span className={selectedStatus === 'CLOSED' ? 'text-slate-200' : 'text-slate-700'}>Closed</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black mt-2 text-slate-700 dark:text-slate-200">{stats.closed}</div>
          <span className="text-[10px] text-slate-400 font-medium">Resolved archive</span>
        </div>
      </div>

      {/* Control Toolbar: Search & Multi-Filters */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Query ID (QRY-...), Title, Student Name, Roll No..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white focus:outline-hidden"
            >
              <option value="all">All Statuses ({queries.length})</option>
              {QUERY_STATUSES.map((st) => (
                <option key={st.key} value={st.key}>
                  {st.label}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white focus:outline-hidden max-w-[180px] truncate"
            >
              <option value="all">All Categories</option>
              {QUERY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white focus:outline-hidden max-w-[200px] truncate"
            >
              <option value="all">All Departments</option>
              {COLLEGE_DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {(searchQuery || selectedCategory !== 'all' || selectedDepartment !== 'all' || selectedStatus !== 'all') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong>{filteredQueries.length}</strong> matching student inquiry tickets (Page {currentPage} of {totalPages})
          </span>
          <span className="text-[11px] font-mono text-indigo-700">
            Real-time Firestore Sync Active
          </span>
        </div>
      </div>

      {/* Query List / Table */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-xs font-bold text-slate-600">Loading queries from Firestore database...</p>
        </div>
      ) : paginatedQueries.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-base font-extrabold text-slate-900">No Inquiries Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No queries match your current filter criteria or search query.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedQueries.map((item) => {
            const statusMeta = QUERY_STATUSES.find((s) => s.key === item.status) || QUERY_STATUSES[0];
            const hasAdminReplied = !!item.latestResponse;

            return (
              <div
                key={item.id || item.queryId}
                onClick={() => onSelectQuery(item.id || item.queryId)}
                className="bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200 p-4 sm:p-5 transition-all shadow-xs hover:shadow-md cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Info */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                      {item.queryId}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 ${statusMeta.badgeClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotColor}`} />
                      <span>{statusMeta.label}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      • {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Student: <strong>{item.studentName}</strong> {item.studentRollNumber ? `(${item.studentRollNumber})` : ''}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Dept: <strong>{item.department}</strong></span>
                    </span>
                    {item.messages && (
                      <span className="font-mono text-slate-400">
                        {item.messages.length} message{item.messages.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Response status & Open button */}
                <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                  <div className="text-right hidden sm:block">
                    {hasAdminReplied ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 block">
                        Response Dispatched
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 block">
                        Pending Response
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      Updated {new Date(item.updatedAt || item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectQuery(item.id || item.queryId);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 group-hover:bg-indigo-600 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Review &amp; Reply</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
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
  );
};
