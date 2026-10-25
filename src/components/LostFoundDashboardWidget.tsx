import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  ShieldCheck,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  Laptop,
  CreditCard,
  Smartphone,
  BookOpen,
  Headphones,
  Key,
  FileText,
  Tag,
  Upload,
  Eye,
  Trash2,
  Edit2,
  Check,
  X,
  Package,
  Layers,
  Calendar
} from 'lucide-react';
import {
  UserProfile,
  LostFoundItem,
  LostFoundCategory,
  LostFoundItemType,
  LostFoundStatus,
  LostFoundClaimStatus
} from '../types';
import { lostFoundService, LostFoundStats } from '../services/lostFoundService';

interface LostFoundDashboardWidgetProps {
  currentUser: UserProfile;
  onNavigateTab: (tab: string, action?: 'browse' | 'report-lost' | 'report-found' | 'my-reports') => void;
  onSelectItem?: (item: LostFoundItem) => void;
}

const ALL_CATEGORIES: LostFoundCategory[] = [
  'ID Card',
  'Mobile Phone',
  'Laptop',
  'Wallet',
  'Keys',
  'Books',
  'Bag',
  'Earphones',
  'Documents',
  'Water Bottle',
  'Calculator',
  'Other'
];

export const LostFoundDashboardWidget: React.FC<LostFoundDashboardWidgetProps> = ({
  currentUser,
  onNavigateTab
}) => {
  const studentRoll = currentUser.rollNumber || '22CS084';

  const [items, setItems] = useState<LostFoundItem[]>(() => lostFoundService.getItems());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [showReportLostModal, setShowReportLostModal] = useState<boolean>(false);
  const [showReportFoundModal, setShowReportFoundModal] = useState<boolean>(false);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<LostFoundItem | null>(null);
  const [claimModalItem, setClaimModalItem] = useState<LostFoundItem | null>(null);
  const [editingItem, setEditingItem] = useState<LostFoundItem | null>(null);

  // Image preview state for upload in forms
  const [uploadedLostImagePreview, setUploadedLostImagePreview] = useState<string>('');
  const [uploadedFoundImagePreview, setUploadedFoundImagePreview] = useState<string>('');

  const refreshData = () => {
    setItems(lostFoundService.getItems());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // 1. Statistics (Requirement 1)
  const stats: LostFoundStats = useMemo(() => {
    return lostFoundService.getStats(studentRoll);
  }, [items, studentRoll]);

  // 2. Recent reports: latest 4-6 reports, sorted newest first (Requirement 11)
  const recentReports = useMemo(() => {
    return [...items]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  }, [items]);

  // 3. My reports belonging to logged-in student (Requirement 10)
  const myReports = useMemo(() => {
    return items.filter((i) => i.studentId === studentRoll);
  }, [items, studentRoll]);

  // 4. Smart Automation: Possible match detection (Requirement 12)
  const smartMatches = useMemo(() => {
    return lostFoundService.getSmartMatchesForStudent(studentRoll);
  }, [items, studentRoll]);

  const topMatch = smartMatches.length > 0 ? smartMatches[0] : null;

  // Category Icon resolver
  const getCategoryIcon = (category: LostFoundCategory) => {
    switch (category) {
      case 'ID Card':
        return <CreditCard className="w-3.5 h-3.5" />;
      case 'Mobile Phone':
        return <Smartphone className="w-3.5 h-3.5" />;
      case 'Laptop':
        return <Laptop className="w-3.5 h-3.5" />;
      case 'Wallet':
        return <Tag className="w-3.5 h-3.5" />;
      case 'Keys':
        return <Key className="w-3.5 h-3.5" />;
      case 'Books':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'Bag':
        return <Package className="w-3.5 h-3.5" />;
      case 'Earphones':
        return <Headphones className="w-3.5 h-3.5" />;
      case 'Documents':
        return <FileText className="w-3.5 h-3.5" />;
      case 'Water Bottle':
        return <Layers className="w-3.5 h-3.5" />;
      case 'Calculator':
        return <HelpCircle className="w-3.5 h-3.5" />;
      default:
        return <Tag className="w-3.5 h-3.5" />;
    }
  };

  // Image Upload helper for FileReader preview
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, isLost: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (isLost) setUploadedLostImagePreview(reader.result);
          else setUploadedFoundImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handlers
  const handleReportLostSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const itemName = form.get('itemName') as string;
    const category = form.get('category') as LostFoundCategory;
    const description = form.get('description') as string;
    const date = form.get('date') as string;
    const time = form.get('time') as string;
    const location = form.get('location') as string;
    const imageUrl =
      uploadedLostImagePreview ||
      (form.get('imageUrl') as string) ||
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80';
    const contactPreference = (form.get('contactPreference') as string) || 'CampusPulse notification';
    const additionalDetails = form.get('additionalDetails') as string;

    const newItem = lostFoundService.addReport({
      itemName,
      type: 'lost',
      category,
      description,
      date,
      time,
      location,
      imageUrl,
      reportedBy: currentUser.name,
      studentId: studentRoll,
      contactPreference,
      additionalDetails
    });

    refreshData();
    setShowReportLostModal(false);
    setUploadedLostImagePreview('');
    showToast('Lost item reported successfully.');

    // Smart Match notification trigger if a match is found
    const matches = lostFoundService.findMatchesFor(newItem);
    if (matches.length > 0) {
      setTimeout(() => {
        showToast('A possible match was found for your lost item.');
      }, 1500);
    }
  };

  const handleReportFoundSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const itemName = form.get('itemName') as string;
    const category = form.get('category') as LostFoundCategory;
    const description = form.get('description') as string;
    const date = form.get('date') as string;
    const time = form.get('time') as string;
    const location = form.get('location') as string;
    const currentKeeperLocation = form.get('currentKeeperLocation') as string;
    const imageUrl =
      uploadedFoundImagePreview ||
      (form.get('imageUrl') as string) ||
      'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=500&auto=format&fit=crop&q=80';
    const contactPreference = (form.get('contactPreference') as string) || 'CampusPulse notification';
    const additionalDetails = form.get('additionalDetails') as string;

    lostFoundService.addReport({
      itemName,
      type: 'found',
      category,
      description,
      date,
      time,
      location,
      currentKeeperLocation,
      imageUrl,
      reportedBy: currentUser.name,
      studentId: studentRoll,
      contactPreference,
      additionalDetails
    });

    refreshData();
    setShowReportFoundModal(false);
    setUploadedFoundImagePreview('');
    showToast('Found item reported successfully.');
  };

  const handleClaimSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!claimModalItem) return;
    const form = new FormData(e.currentTarget);
    const name = form.get('name') as string;
    const rollNumber = form.get('rollNumber') as string;
    const contact = form.get('contact') as string;
    const verificationDetails = form.get('verificationDetails') as string;

    lostFoundService.submitClaim(claimModalItem.id, {
      name,
      rollNumber,
      contact,
      verificationDetails
    });

    refreshData();
    setClaimModalItem(null);
    setSelectedItemForDetails(null);
    showToast('Your recovery request is pending verification.');
  };

  const handleMarkReturned = (itemId: string) => {
    lostFoundService.markItemAsReturned(itemId);
    refreshData();
    if (selectedItemForDetails?.id === itemId) {
      setSelectedItemForDetails(lostFoundService.getItemById(itemId) || null);
    }
    showToast('Item marked as returned/recovered.');
  };

  const handleDeleteReport = (itemId: string) => {
    if (window.confirm('Are you sure you want to remove this report?')) {
      lostFoundService.deleteReport(itemId);
      refreshData();
      if (selectedItemForDetails?.id === itemId) setSelectedItemForDetails(null);
      showToast('Report deleted successfully.');
    }
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;
    const form = new FormData(e.currentTarget);
    const itemName = form.get('itemName') as string;
    const category = form.get('category') as LostFoundCategory;
    const description = form.get('description') as string;
    const location = form.get('location') as string;
    const additionalDetails = form.get('additionalDetails') as string;

    lostFoundService.updateReport(editingItem.id, {
      itemName,
      category,
      description,
      location,
      additionalDetails
    });

    refreshData();
    setEditingItem(null);
    showToast('Report updated successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-indigo-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: LOST & FOUND MAIN MODULE / CARD ON STUDENT DASHBOARD           */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5 transition-all hover:border-slate-300">
        {/* Module Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Lost &amp; Found</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                  Campus Directory
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Report lost items and find items reported on campus.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('lost-found', 'browse')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer self-start sm:self-auto px-2.5 py-1.5 rounded-lg hover:bg-indigo-50"
          >
            <span>Open Full Directory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Small Statistics Section (Requirement 1) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            onClick={() => onNavigateTab('lost-found', 'my-reports')}
            className="p-3.5 rounded-xl bg-indigo-50/40 hover:bg-indigo-50/70 border border-indigo-100/80 hover:border-indigo-300 transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-[11px] text-indigo-950">My Lost Items</span>
              <Search className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-heading mt-1 tabular-nums">
              {stats.myLostItems}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Active lost listings</p>
          </div>

          <div
            onClick={() => onNavigateTab('lost-found', 'my-reports')}
            className="p-3.5 rounded-xl bg-cyan-50/40 hover:bg-cyan-50/70 border border-cyan-100/80 hover:border-cyan-300 transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-[11px] text-cyan-950">My Found Items</span>
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-heading mt-1 tabular-nums">
              {stats.myFoundItems}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Items turned in</p>
          </div>

          <div
            onClick={() => onNavigateTab('lost-found', 'browse')}
            className="p-3.5 rounded-xl bg-amber-50/40 hover:bg-amber-50/70 border border-amber-100/80 hover:border-amber-300 transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-[11px] text-amber-950">Open Reports</span>
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-heading mt-1 tabular-nums">
              {stats.openReports}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Your open claims</p>
          </div>

          <div
            onClick={() => onNavigateTab('lost-found', 'my-reports')}
            className="p-3.5 rounded-xl bg-emerald-50/40 hover:bg-emerald-50/70 border border-emerald-100/80 hover:border-emerald-300 transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-[11px] text-emerald-950">Recovered Items</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-heading mt-1 tabular-nums">
              {stats.recoveredItems}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Safely reunited</p>
          </div>
        </div>

        {/* Three Actions (Requirement 1) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            id="dash-action-report-lost-btn"
            onClick={() => setShowReportLostModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs shadow-indigo-600/25"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>1. Report Lost Item</span>
          </button>

          <button
            id="dash-action-report-found-btn"
            onClick={() => setShowReportFoundModal(true)}
            className="px-4 py-2.5 rounded-xl bg-cyan-50 hover:bg-cyan-100/80 text-cyan-900 border border-cyan-200/80 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-700" />
            <span>2. Report Found Item</span>
          </button>

          <button
            id="dash-action-browse-btn"
            onClick={() => onNavigateTab('lost-found', 'browse')}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <Search className="w-4 h-4 text-slate-600" />
            <span>3. Browse Lost &amp; Found</span>
          </button>
        </div>

        {/* Smart Automation: Possible Match Found Banner (Requirement 12) */}
        {topMatch && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 via-amber-100/50 to-indigo-50 border border-amber-300 text-xs shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-bold mt-0.5 shadow-2xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-amber-950">Possible Match Found</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-bold text-[10px] uppercase">
                    Smart Match
                  </span>
                </div>
                <p className="text-slate-700 mt-0.5 leading-relaxed">
                  {topMatch.explanation}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedItemForDetails(topMatch.foundItem)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>View Match &amp; Claim</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 10: MY LOST & FOUND REPORTS (ON STUDENT DASHBOARD)               */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-600" />
              <span>My Lost &amp; Found Reports</span>
            </h3>
            <p className="text-xs text-slate-500">
              Only showing reports filed by your account ({studentRoll})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReportLostModal(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-medium text-xs transition-colors cursor-pointer"
            >
              + Report Lost
            </button>
            <button
              onClick={() => setShowReportFoundModal(true)}
              className="px-3 py-1.5 rounded-lg bg-white text-slate-800 hover:bg-slate-50 border border-slate-200 font-medium text-xs transition-colors cursor-pointer"
            >
              + Report Found
            </button>
          </div>
        </div>

        {myReports.length > 0 ? (
          <div className="space-y-3">
            {myReports.map((report) => {
              const isLost = report.type === 'lost';
              return (
                <div
                  key={report.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <img
                      src={report.imageUrl}
                      alt={report.itemName}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-200 text-slate-800">
                          {report.type}
                        </span>
                        <h4 className="font-semibold text-slate-900 text-xs truncate max-w-[200px] sm:max-w-md">
                          {report.itemName}
                        </h4>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium flex items-center gap-1 border border-slate-200">
                          {getCategoryIcon(report.category)}
                          <span>{report.category}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {report.location}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {report.date}
                        </span>
                        <span>•</span>
                        <span className="text-slate-600">
                          Status: <strong className="font-semibold text-slate-800">{report.status.toUpperCase()}</strong>
                        </span>
                        {report.claimStatus !== 'none' && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                            Claim: {report.claimStatus}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: View Details, Edit, Delete, Mark as Returned (Requirement 10) */}
                  <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200 w-full md:w-auto justify-end">
                    <button
                      onClick={() => setSelectedItemForDetails(report)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => setEditingItem(report)}
                      className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="p-1.5 rounded-lg border border-slate-300 hover:bg-rose-50 text-slate-600 hover:text-rose-700 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {report.status !== 'returned' && (
                      <button
                        onClick={() => handleMarkReturned(report.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark as Returned</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
            You have not submitted any Lost &amp; Found reports yet.
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 11: RECENT LOST & FOUND (ON STUDENT DASHBOARD)                    */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-700" />
              <span>Recent Lost &amp; Found</span>
            </h3>
            <p className="text-xs text-slate-500">
              Latest reported items across Apex University campus
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('lost-found', 'browse')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({items.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Latest 4-6 reports cards (compact) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentReports.map((item) => {
            const isLost = item.type === 'lost';
            const hasPossibleMatch = item.possibleMatchIds && item.possibleMatchIds.length > 0;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItemForDetails(item)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50/70 transition-all cursor-pointer group flex flex-col justify-between space-y-2.5"
              >
                <div>
                  <div className="flex items-start justify-between gap-1.5 mb-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          isLost ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                        {getCategoryIcon(item.category)}
                        <span>{item.category}</span>
                      </span>
                      {hasPossibleMatch && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold text-[9px] flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                          Match
                        </span>
                      )}
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        item.status === 'open'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : item.status === 'claimed'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {item.status === 'open' ? 'Open' : item.status === 'claimed' ? 'Claimed' : 'Returned'}
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {item.itemName}
                  </h5>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 truncate max-w-[150px]">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </span>

                  <span className="text-slate-400 text-[10px] shrink-0">{item.date}</span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItemForDetails(item);
                    }}
                    className="px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold text-[10px] transition-colors cursor-pointer"
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: REPORT LOST ITEM FORM (Requirement 6)                              */}
      {/* ========================================================================= */}
      {showReportLostModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-rose-700 to-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-300" />
                <span>Report Lost Item</span>
              </h3>
              <button
                onClick={() => {
                  setShowReportLostModal(false);
                  setUploadedLostImagePreview('');
                }}
                className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportLostSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  name="itemName"
                  required
                  placeholder="e.g. College ID Card, Black Backpack, Wireless Earbuds"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    {ALL_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date Lost *
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Approximate Time *
                  </label>
                  <input
                    type="text"
                    name="time"
                    required
                    placeholder="e.g. 10:30 AM"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Location Lost *
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    placeholder="e.g. Library, Main Block, Canteen"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  placeholder="Color, brand, distinguishing marks, contents..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              {/* Upload Image UI (Requirement 6) */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold text-slate-700">
                  Upload Image (Photo / Preview)
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileChange(e, true)}
                      className="hidden"
                    />
                  </label>
                  {uploadedLostImagePreview && (
                    <div className="flex items-center gap-2">
                      <img
                        src={uploadedLostImagePreview}
                        alt="Preview"
                        className="w-10 h-10 rounded-lg object-cover border border-emerald-400"
                      />
                      <span className="text-[11px] text-emerald-700 font-semibold">Image loaded!</span>
                    </div>
                  )}
                </div>
                <input
                  type="url"
                  name="imageUrl"
                  placeholder="Or paste an image URL..."
                  defaultValue={uploadedLostImagePreview ? '' : 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80'}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white mt-1"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Preference *
                </label>
                <select
                  name="contactPreference"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="CampusPulse notification">CampusPulse notification</option>
                  <option value="Email">Email</option>
                  <option value="Contact through college administration">Contact through college administration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Additional Details
                </label>
                <input
                  type="text"
                  name="additionalDetails"
                  placeholder="e.g. Urgent as midterms start tomorrow"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReportLostModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md cursor-pointer"
                >
                  Submit Lost Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REPORT FOUND ITEM FORM (Requirement 7)                             */}
      {/* ========================================================================= */}
      {showReportFoundModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-emerald-700 to-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
                <span>Report Found Item</span>
              </h3>
              <button
                onClick={() => {
                  setShowReportFoundModal(false);
                  setUploadedFoundImagePreview('');
                }}
                className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportFoundSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  name="itemName"
                  required
                  placeholder="e.g. Blue Water Bottle, Scientific Calculator, College ID Card"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    {ALL_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date Found *
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Time Found *
                  </label>
                  <input
                    type="text"
                    name="time"
                    required
                    placeholder="e.g. 11:30 AM"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Location Found *
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    placeholder="e.g. Canteen, Block B, Classroom 204"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Where is the item currently kept? *
                </label>
                <input
                  type="text"
                  name="currentKeeperLocation"
                  required
                  placeholder="e.g. Main Security Desk Gate 1, CSE Dept Office Counter 2, Library Helpdesk"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  placeholder="Condition, color, brand, serial or identification marks..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Upload Image UI (Requirement 7) */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold text-slate-700">
                  Upload Image
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileChange(e, false)}
                      className="hidden"
                    />
                  </label>
                  {uploadedFoundImagePreview && (
                    <div className="flex items-center gap-2">
                      <img
                        src={uploadedFoundImagePreview}
                        alt="Preview"
                        className="w-10 h-10 rounded-lg object-cover border border-emerald-400"
                      />
                      <span className="text-[11px] text-emerald-700 font-semibold">Image loaded!</span>
                    </div>
                  )}
                </div>
                <input
                  type="url"
                  name="imageUrl"
                  placeholder="Or paste an image URL..."
                  defaultValue={uploadedFoundImagePreview ? '' : 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=500&auto=format&fit=crop&q=80'}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white mt-1"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Preference *
                </label>
                <select
                  name="contactPreference"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="CampusPulse notification">CampusPulse notification</option>
                  <option value="Email">Email</option>
                  <option value="Contact through college administration">Contact through college administration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Additional Details
                </label>
                <input
                  type="text"
                  name="additionalDetails"
                  placeholder="e.g. Handed over to security guard Ramu"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReportFoundModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer"
                >
                  Submit Found Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ITEM DETAILS MODAL (Requirement 8 & 9)                             */}
      {/* ========================================================================= */}
      {selectedItemForDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="relative h-56 bg-slate-900">
              <img
                src={selectedItemForDetails.imageUrl}
                alt={selectedItemForDetails.itemName}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedItemForDetails(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    selectedItemForDetails.type === 'lost'
                      ? 'bg-rose-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {selectedItemForDetails.type.toUpperCase()}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white text-slate-800 shadow-xs">
                  {selectedItemForDetails.category}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedItemForDetails.itemName}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Date: {selectedItemForDetails.date} • Time: {selectedItemForDetails.time}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Description:</span>
                <p className="text-xs text-slate-700 leading-relaxed">{selectedItemForDetails.description}</p>
                {selectedItemForDetails.additionalDetails && (
                  <p className="text-[11px] text-slate-500 italic border-t border-slate-200/60 pt-1">
                    "{selectedItemForDetails.additionalDetails}"
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Location</span>
                  <span className="font-bold text-slate-800 text-xs">{selectedItemForDetails.location}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Current Status</span>
                  <span className="font-bold text-indigo-700 text-xs uppercase">{selectedItemForDetails.status}</span>
                </div>
              </div>

              {selectedItemForDetails.currentKeeperLocation && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                  <strong className="block text-[11px] text-emerald-800">Where this item is currently kept:</strong>
                  <span className="font-semibold text-xs">{selectedItemForDetails.currentKeeperLocation}</span>
                </div>
              )}

              {/* Privacy-Safe Reporter Information (Requirement 8) */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className="text-slate-500">
                  Reported by: <strong className="text-slate-800">Student</strong> (Department of CSE)
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  Contact: {selectedItemForDetails.contactPreference}
                </span>
              </div>

              {/* Action Buttons (Requirement 8 & 9) */}
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                {selectedItemForDetails.studentId === studentRoll ? (
                  <>
                    {selectedItemForDetails.status !== 'returned' && (
                      <button
                        onClick={() => handleMarkReturned(selectedItemForDetails.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                      >
                        Mark as Returned / Recovered
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedItemForDetails(null)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                    >
                      Close
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setClaimModalItem(selectedItemForDetails)}
                      className={`px-5 py-2 rounded-xl text-white font-bold text-xs shadow-sm cursor-pointer ${
                        selectedItemForDetails.type === 'found'
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {selectedItemForDetails.type === 'found' ? 'This Is My Item' : 'I Found This Item'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CLAIM / RECOVERY VERIFICATION FORM (Requirement 9)                */}
      {/* ========================================================================= */}
      {claimModalItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-emerald-800 to-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
                <span>
                  {claimModalItem.type === 'found' ? 'This Is My Item (Claim Verification)' : 'I Found This Item (Handover Details)'}
                </span>
              </h3>
              <button
                onClick={() => setClaimModalItem(null)}
                className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleClaimSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Target Item:</span>
                <p className="font-bold text-slate-900 text-xs">{claimModalItem.itemName}</p>
                <p className="text-[11px] text-slate-500">
                  Location: {claimModalItem.location} ({claimModalItem.date})
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={currentUser.name}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student ID *
                  </label>
                  <input
                    type="text"
                    name="rollNumber"
                    required
                    defaultValue={studentRoll}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Information *
                  </label>
                  <input
                    type="text"
                    name="contact"
                    required
                    defaultValue="+91 98450 12345"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason / Identifying Details *
                </label>
                <textarea
                  name="verificationDetails"
                  required
                  rows={3}
                  placeholder="e.g. Color, brand, unique marks, contents, approximate purchase details..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                🔒 Privacy Protected: Your private contact information is held securely and only used by administration to verify genuine ownership.
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setClaimModalItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer"
                >
                  Submit Recovery Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT REPORT FORM (Requirement 10)                                  */}
      {/* ========================================================================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-indigo-800 to-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-300" />
                <span>Edit Report: {editingItem.itemName}</span>
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Item Title:</label>
                <input
                  type="text"
                  name="itemName"
                  required
                  defaultValue={editingItem.itemName}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category:</label>
                <select
                  name="category"
                  defaultValue={editingItem.category}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  {ALL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Location:</label>
                <input
                  type="text"
                  name="location"
                  required
                  defaultValue={editingItem.location}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description:</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  defaultValue={editingItem.description}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Additional Notes:</label>
                <input
                  type="text"
                  name="additionalDetails"
                  defaultValue={editingItem.additionalDetails || ''}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
