import React, { useState, useMemo } from 'react';
import {
  LostFoundItem,
  LostFoundCategory,
  LostFoundItemType,
  LostFoundStatus,
  UserProfile
} from '../../types';
import {
  lostFoundService,
  LostFoundStats,
  SmartMatchResult
} from '../../services/lostFoundService';
import {
  Search,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Tag,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X,
  Edit2,
  Trash2,
  HelpCircle,
  ShieldCheck,
  User,
  Phone,
  Camera,
  FileText,
  Key,
  Laptop,
  CreditCard,
  Smartphone,
  BookOpen,
  Headphones,
  Check,
  RotateCcw,
  Package,
  Layers,
  Calendar,
  Upload,
  Loader2,
  CloudCheck
} from 'lucide-react';
import { firebaseStorageService } from '../../services/firebaseStorageService';

interface LostFoundTabProps {
  currentUser: UserProfile;
  initialAction?: 'browse' | 'report-lost' | 'report-found' | 'my-reports';
  onNavigateTab?: (tab: string) => void;
}

const CATEGORIES: LostFoundCategory[] = [
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

export const LostFoundTab: React.FC<LostFoundTabProps> = ({
  currentUser,
  initialAction = 'browse',
  onNavigateTab
}) => {
  const [items, setItems] = useState<LostFoundItem[]>(() => lostFoundService.getItems());
  const [viewMode, setViewMode] = useState<'browse' | 'my-reports' | 'matches'>(
    initialAction === 'my-reports' ? 'my-reports' : 'browse'
  );

  // Search & Filter state (Section 3 & 5)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Modals state
  const [showReportLostModal, setShowReportLostModal] = useState<boolean>(initialAction === 'report-lost');
  const [showReportFoundModal, setShowReportFoundModal] = useState<boolean>(initialAction === 'report-found');
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<LostFoundItem | null>(null);
  const [claimModalItem, setClaimModalItem] = useState<LostFoundItem | null>(null);
  const [editingItem, setEditingItem] = useState<LostFoundItem | null>(null);

  // Image Upload Previews for modal forms
  const [uploadedLostImagePreview, setUploadedLostImagePreview] = useState<string>('');
  const [uploadedFoundImagePreview, setUploadedFoundImagePreview] = useState<string>('');
  const [isUploadingLostImage, setIsUploadingLostImage] = useState<boolean>(false);
  const [lostImageProgress, setLostImageProgress] = useState<number>(0);
  const [isUploadingFoundImage, setIsUploadingFoundImage] = useState<boolean>(false);
  const [foundImageProgress, setFoundImageProgress] = useState<number>(0);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const studentRoll = currentUser.rollNumber || '22CS084';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  const refreshItems = () => {
    setItems(lostFoundService.getItems());
  };

  // Live Firestore subscription for lost & found items
  React.useEffect(() => {
    const unsub = lostFoundService.subscribeItems((updated) => {
      setItems(updated);
    });
    return () => unsub();
  }, []);

  // Stats calculation (Section 1)
  const stats: LostFoundStats = useMemo(() => {
    return lostFoundService.getStats(studentRoll);
  }, [items, studentRoll]);

  // Unique locations list for dropdown filter
  const campusLocationsList = useMemo(() => {
    const defaultCampusHotspots = [
      'Main Block',
      'Block A',
      'Block B',
      'Library',
      'Canteen',
      'Seminar Hall',
      'Classroom 204',
      'Computer Lab',
      'Parking Area',
      'Examination Hall'
    ];
    const itemLocations = items.map((i) => i.location);
    const combined = Array.from(new Set([...defaultCampusHotspots, ...itemLocations]));
    return combined.sort();
  }, [items]);

  // Filtered Items for Browse View (Section 5)
  const filteredBrowseItems = useMemo(() => {
    return items.filter((item) => {
      // Type filter (Lost / Found)
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      // Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      // Location filter
      if (locationFilter !== 'all') {
        const itemLoc = item.location.toLowerCase();
        const targetLoc = locationFilter.toLowerCase();
        if (!itemLoc.includes(targetLoc) && !targetLoc.includes(itemLoc)) return false;
      }
      // Date filter
      if (dateFilter && item.date !== dateFilter) return false;

      // Search query (Item name, description, location)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.itemName.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchLoc = item.location.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchLoc && !matchCat) return false;
      }
      return true;
    });
  }, [items, typeFilter, categoryFilter, statusFilter, locationFilter, dateFilter, searchQuery]);

  // My Reports (Section 10)
  const myReports = useMemo(() => {
    return items.filter((i) => i.studentId === studentRoll);
  }, [items, studentRoll]);

  // Smart Candidate Matches (Section 12)
  const candidateMatches = useMemo(() => {
    const list: SmartMatchResult[] = [];
    const lostItems = items.filter((i) => i.type === 'lost' && i.status !== 'returned');

    lostItems.forEach((lost) => {
      const matches = lostFoundService.findMatchesFor(lost);
      matches.forEach((found) => {
        list.push({
          lostItem: lost,
          foundItem: found,
          matchScore: 85,
          explanation: `Your lost ${lost.itemName.toLowerCase()} may match a ${found.itemName.toLowerCase()} reported found near ${found.location}.`
        });
      });
    });

    return list;
  }, [items]);

  // Image Upload helper connected to Firebase Storage
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isLost: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isLost) {
      setIsUploadingLostImage(true);
      setLostImageProgress(5);
    } else {
      setIsUploadingFoundImage(true);
      setFoundImageProgress(5);
    }

    try {
      const res = await firebaseStorageService.uploadLostFoundImage(file, (progress) => {
        if (isLost) setLostImageProgress(progress);
        else setFoundImageProgress(progress);
      });

      if (isLost) {
        setUploadedLostImagePreview(res.downloadUrl);
        setIsUploadingLostImage(false);
      } else {
        setUploadedFoundImagePreview(res.downloadUrl);
        setIsUploadingFoundImage(false);
      }
      showToast(`Image "${file.name}" uploaded to Firebase Storage!`);
    } catch (err) {
      console.error('Upload failed:', err);
      // Fallback preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (isLost) setUploadedLostImagePreview(reader.result);
          else setUploadedFoundImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
      if (isLost) setIsUploadingLostImage(false);
      else setIsUploadingFoundImage(false);
      showToast('Uploaded image preview saved.');
    }
  };

  // Handler: Submit Lost Item (Section 6)
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

    refreshItems();
    setShowReportLostModal(false);
    setUploadedLostImagePreview('');
    showToast('Lost item reported successfully.');

    // Smart Match notification trigger if a match is found (Section 13)
    const matches = lostFoundService.findMatchesFor(newItem);
    if (matches.length > 0) {
      setTimeout(() => {
        showToast('A possible match was found for your lost item.');
      }, 1500);
    }
  };

  // Handler: Submit Found Item (Section 7)
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
      imageUrl,
      currentKeeperLocation,
      reportedBy: currentUser.name,
      studentId: studentRoll,
      contactPreference,
      additionalDetails
    });

    refreshItems();
    setShowReportFoundModal(false);
    setUploadedFoundImagePreview('');
    showToast('Found item reported successfully.');
  };

  // Handler: Claim Request Submission (Section 9)
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

    refreshItems();
    setClaimModalItem(null);
    setSelectedItemForDetails(null);
    showToast('Your recovery request is pending verification.');
  };

  // Handler: Mark as Returned (Section 10)
  const handleMarkReturned = (itemId: string) => {
    lostFoundService.markItemAsReturned(itemId);
    refreshItems();
    if (selectedItemForDetails?.id === itemId) {
      setSelectedItemForDetails(lostFoundService.getItemById(itemId) || null);
    }
    showToast('Item marked as returned/recovered.');
  };

  // Handler: Delete Report (Section 10)
  const handleDeleteReport = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      lostFoundService.deleteReport(itemId);
      refreshItems();
      if (selectedItemForDetails?.id === itemId) setSelectedItemForDetails(null);
      showToast('Report deleted.');
    }
  };

  // Handler: Edit Report (Section 10)
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

    refreshItems();
    setEditingItem(null);
    showToast('Report updated successfully.');
  };

  // Category Icon Resolver
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

  return (
    <div className="space-y-6">
      {/* Toast Alert Feedback (Section 13) */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-indigo-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: LOST & FOUND MAIN PAGE HEADER                                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide flex items-center gap-1">
              <Search className="w-3 h-3 text-indigo-600" />
              CampusPulse Directory
            </span>
            <span className="text-xs text-slate-500">Student &amp; Faculty Assistance Wing</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2 flex items-center gap-2 font-heading">
            <span>Lost &amp; Found Portal</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Quickly trace lost campus items, verify ownership, or return found belongings to fellow students and faculty.
          </p>
        </div>

        {/* Action Buttons at top (Section 3) */}
        <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto shrink-0">
          <button
            id="page-report-lost-btn"
            onClick={() => setShowReportLostModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs shadow-indigo-600/25 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Report Lost Item</span>
          </button>

          <button
            id="page-report-found-btn"
            onClick={() => setShowReportFoundModal(true)}
            className="px-4 py-2.5 rounded-xl bg-cyan-50 hover:bg-cyan-100/80 text-cyan-900 border border-cyan-200/80 text-xs font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-700" />
            <span>Report Found Item</span>
          </button>
        </div>
      </div>

      {/* Statistics Row (Section 1) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setViewMode('my-reports')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs cursor-pointer hover:border-rose-300 transition-colors"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">My Lost Items</span>
          <div className="text-xl font-black text-rose-600 mt-1">{stats.myLostItems}</div>
          <span className="text-[10px] text-slate-500">Reported by you</span>
        </div>

        <div
          onClick={() => setViewMode('my-reports')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs cursor-pointer hover:border-emerald-300 transition-colors"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">My Found Items</span>
          <div className="text-xl font-black text-emerald-600 mt-1">{stats.myFoundItems}</div>
          <span className="text-[10px] text-slate-500">Handed in</span>
        </div>

        <div
          onClick={() => setViewMode('browse')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs cursor-pointer hover:border-amber-300 transition-colors"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Open Reports</span>
          <div className="text-xl font-black text-slate-900 mt-1">{stats.openReports}</div>
          <span className="text-[10px] text-slate-500">Your active reports</span>
        </div>

        <div
          onClick={() => setViewMode('my-reports')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs cursor-pointer hover:border-indigo-300 transition-colors"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Recovered Items</span>
          <div className="text-xl font-black text-indigo-600 mt-1">{stats.recoveredItems}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">✓ Claimed</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs col-span-2 sm:col-span-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Apex Campus Total</span>
          <div className="flex items-center gap-3 mt-1 text-xs">
            <span className="font-bold text-rose-700">{stats.totalCampusLost} Lost Open</span>
            <span>•</span>
            <span className="font-bold text-emerald-700">{stats.totalCampusFound} Found Open</span>
            {candidateMatches.length > 0 && (
              <>
                <span>•</span>
                <span className="font-extrabold text-amber-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  {candidateMatches.length} Matches
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('browse')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'browse'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Browse Lost &amp; Found ({items.length})</span>
          </button>

          <button
            onClick={() => setViewMode('my-reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'my-reports'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>My Reports ({myReports.length})</span>
          </button>

          <button
            onClick={() => setViewMode('matches')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'matches'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Smart Match Suggestions ({candidateMatches.length})</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 hidden sm:block">
          Logged in: <strong className="text-slate-800">{currentUser.name}</strong> ({studentRoll})
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. BROWSE ALL ITEMS SECTION (Section 3, 4, 5)                              */}
      {/* ========================================================================= */}
      {viewMode === 'browse' && (
        <div className="space-y-4">
          {/* Search bar & Filters (Section 3 & 5) */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search items..."
                  className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Type Filter: Lost / Found / All */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 text-xs">
                {(['all', 'lost', 'found'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all capitalize cursor-pointer ${
                      typeFilter === t
                        ? t === 'lost'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : t === 'found'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t === 'all' ? 'All Types' : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters Row: Category, Location, Status, Date (Section 3 & 5) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Category:
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Location:
                </label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs cursor-pointer"
                >
                  <option value="all">All Campus Locations</option>
                  {campusLocationsList.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Status:
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="claimed">Claimed</option>
                  <option value="returned">Returned</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Date:
                </label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full p-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                />
              </div>
            </div>

            {/* Filter Summary & Reset option */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
              <span>Showing {filteredBrowseItems.length} matching reports</span>
              {(searchQuery ||
                typeFilter !== 'all' ||
                categoryFilter !== 'all' ||
                statusFilter !== 'all' ||
                locationFilter !== 'all' ||
                dateFilter) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setTypeFilter('all');
                    setCategoryFilter('all');
                    setStatusFilter('all');
                    setLocationFilter('all');
                    setDateFilter('');
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear All Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* ITEM CARDS GRID (Section 4) */}
          {filteredBrowseItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBrowseItems.map((item) => {
                const isLost = item.type === 'lost';
                const hasMatch = item.possibleMatchIds && item.possibleMatchIds.length > 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItemForDetails(item)}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                  >
                    <div>
                      {/* Image Thumbnail with Overlay Badges */}
                      <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 mb-3">
                        <img
                          src={item.imageUrl}
                          alt={item.itemName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Lost / Found Badge */}
                        <div className="absolute top-2.5 left-2.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                              isLost ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {isLost ? 'LOST' : 'FOUND'}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="absolute top-2.5 right-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase shadow-sm ${
                              item.status === 'open'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : item.status === 'claimed'
                                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            }`}
                          >
                            {item.status.toUpperCase()}
                          </span>
                        </div>

                        {/* Possible Match badge (Section 4 & 12) */}
                        {hasMatch && item.status !== 'returned' && (
                          <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 backdrop-blur-xs text-amber-300 px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              Possible Match
                            </span>
                            <span className="text-[9px] underline">Inspect</span>
                          </div>
                        )}
                      </div>

                      {/* Category & Date */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                        <span className="flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                          {getCategoryIcon(item.category)}
                          {item.category}
                        </span>
                        <span>•</span>
                        <span className="text-[11px] text-slate-500">{item.date}</span>
                        <span>•</span>
                        <span className="text-[11px] text-slate-400">{item.time}</span>
                      </div>

                      {/* Item Name */}
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {item.itemName}
                      </h3>

                      {/* Short Description */}
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Location */}
                      <div className="mt-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    </div>

                    {/* Bottom row: Reported By & Action Button (Section 4) */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      {/* Privacy-Safe Reporter Info */}
                      <div className="text-[11px] text-slate-500">
                        Reported by: <span className="font-semibold text-slate-700">Student</span>
                      </div>

                      {/* Action Button: View Details */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItemForDetails(item);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Professional Empty State (Section 5) */
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
              <Search className="w-10 h-10 mx-auto text-slate-300" />
              <h4 className="text-base font-bold text-slate-800">No Lost &amp; Found items found.</h4>
              <p className="text-xs max-w-md mx-auto text-slate-500">
                Try changing your search or filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('all');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                  setLocationFilter('all');
                  setDateFilter('');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MY REPORTS VIEW (Section 10)                                           */}
      {/* ========================================================================= */}
      {viewMode === 'my-reports' && (
        <div className="space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                My Lost &amp; Found Reports ({studentRoll})
              </h3>
              <p className="text-xs text-slate-500">
                Manage your submitted items, edit information, or mark recovered items as returned.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowReportLostModal(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-2xs"
              >
                + Report Lost Item
              </button>
              <button
                onClick={() => setShowReportFoundModal(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-2xs"
              >
                + Report Found Item
              </button>
            </div>
          </div>

          {myReports.length > 0 ? (
            <div className="space-y-3">
              {myReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={report.imageUrl}
                      alt={report.itemName}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            report.type === 'lost' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {report.type.toUpperCase()}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{report.itemName}</h4>
                      </div>
                      <p className="text-xs text-slate-500">
                        Category: {report.category} • Location: {report.location} • Date: {report.date}
                      </p>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-slate-600 font-semibold">Current Status:</span>
                        <span
                          className={`font-bold uppercase ${
                            report.status === 'open'
                              ? 'text-amber-700'
                              : report.status === 'claimed'
                              ? 'text-blue-700'
                              : 'text-emerald-700'
                          }`}
                        >
                          {report.status}
                        </span>
                        {report.claimStatus !== 'none' && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                            Recovery request status: {report.claimStatus}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: View Details, Edit, Delete, Mark as Returned (Section 10) */}
                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0 flex-wrap">
                    <button
                      onClick={() => setSelectedItemForDetails(report)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 font-bold text-xs text-slate-700 cursor-pointer"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => setEditingItem(report)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 font-bold text-xs text-slate-700 cursor-pointer flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-rose-50 text-rose-700 font-bold text-xs cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>

                    {report.status !== 'returned' && (
                      <button
                        onClick={() => handleMarkReturned(report.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark as Returned</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
              <p>You have not submitted any Lost &amp; Found reports yet.</p>
              <p className="text-[11px] text-slate-400">
                Use the buttons above to submit a lost item or record a found item.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SMART MATCH SUGGESTIONS VIEW (Section 12)                              */}
      {/* ========================================================================= */}
      {viewMode === 'matches' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 sm:p-5 rounded-2xl space-y-1">
            <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Smart Match Automation Engine</span>
            </h3>
            <p className="text-xs text-amber-900/90 leading-relaxed">
              CampusPulse automatically compares lost and found reports using item names, categories, locations, dates, and keywords to identify possible matches.
            </p>
          </div>

          {candidateMatches.length > 0 ? (
            <div className="space-y-4">
              {candidateMatches.map(({ lostItem, foundItem, explanation }, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-3xl border border-amber-300 p-5 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Possible Match Found
                    </span>
                    <span className="text-xs text-slate-400">Match #{idx + 1}</span>
                  </div>

                  <p className="text-xs font-semibold text-slate-700 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200">
                    "{explanation}"
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Lost Card */}
                    <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-600 text-white">
                          LOST REPORT
                        </span>
                        <span className="text-[11px] text-slate-500">{lostItem.date}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{lostItem.itemName}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2">{lostItem.description}</p>
                      <p className="text-[11px] text-slate-500">📍 Location: {lostItem.location}</p>
                    </div>

                    {/* Found Card */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-600 text-white">
                          FOUND REPORT
                        </span>
                        <span className="text-[11px] text-slate-500">{foundItem.date}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{foundItem.itemName}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2">{foundItem.description}</p>
                      <p className="text-[11px] text-slate-500">📍 Location: {foundItem.location}</p>
                      {foundItem.currentKeeperLocation && (
                        <p className="text-[11px] text-emerald-900 font-semibold">
                          Deposited at: {foundItem.currentKeeperLocation}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setSelectedItemForDetails(foundItem)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      Inspect Found Item &amp; Claim →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              No matching item pairs currently flagged. Matches update automatically when new items are reported.
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ITEM DETAILS MODAL (Section 8)                                   */}
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
                  Reported on {selectedItemForDetails.date} at {selectedItemForDetails.time}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Description</span>
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
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Status</span>
                  <span className="font-bold text-indigo-700 text-xs uppercase">{selectedItemForDetails.status}</span>
                </div>
              </div>

              {selectedItemForDetails.currentKeeperLocation && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                  <strong className="block text-[11px] text-emerald-800">Where is the item currently kept:</strong>
                  <span className="font-semibold text-xs">{selectedItemForDetails.currentKeeperLocation}</span>
                </div>
              )}

              {/* Privacy-Safe Reporter Information (Section 8) */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className="text-slate-500">
                  Reported by: <strong className="text-slate-800">Student</strong> (Department of CSE)
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  Contact: {selectedItemForDetails.contactPreference}
                </span>
              </div>

              {/* Action Buttons (Section 8) */}
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
      {/* MODAL 2: CLAIM / RECOVERY VERIFICATION MODAL (Section 9)                  */}
      {/* ========================================================================= */}
      {claimModalItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-emerald-800 to-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
                <span>
                  {claimModalItem.type === 'found' ? 'This Is My Item' : 'I Found This Item'}
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
                🔒 Privacy Protected: Requester contact info is kept confidential and only shared with the department administration to verify ownership.
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
      {/* MODAL 3: REPORT LOST ITEM FORM (Section 6)                                */}
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
                    {CATEGORIES.map((c) => (
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
                  placeholder="Color, brand, distinguishing marks, unique scratches or contents..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              {/* Upload Image UI (Section 6) */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Upload Image to Firebase Storage
                  </label>
                  <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    Storage Connected
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs">
                    {isUploadingLostImage ? (
                      <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                    <span>{isUploadingLostImage ? `Uploading (${lostImageProgress}%)...` : 'Choose File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileChange(e, true)}
                      className="hidden"
                      disabled={isUploadingLostImage}
                    />
                  </label>
                  {isUploadingLostImage && (
                    <div className="flex-1 max-w-xs">
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-200"
                          style={{ width: `${lostImageProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {uploadedLostImagePreview && !isUploadingLostImage && (
                    <div className="flex items-center gap-2">
                      <img
                        src={uploadedLostImagePreview}
                        alt="Preview"
                        className="w-10 h-10 rounded-lg object-cover border border-emerald-400"
                      />
                      <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Uploaded to Storage!
                      </span>
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
      {/* MODAL 4: REPORT FOUND ITEM FORM (Section 7)                               */}
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
                    {CATEGORIES.map((c) => (
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

              {/* Upload Image UI (Section 7) */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Upload Image to Firebase Storage
                  </label>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Storage Connected
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs">
                    {isUploadingFoundImage ? (
                      <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    <span>{isUploadingFoundImage ? `Uploading (${foundImageProgress}%)...` : 'Choose File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileChange(e, false)}
                      className="hidden"
                      disabled={isUploadingFoundImage}
                    />
                  </label>
                  {isUploadingFoundImage && (
                    <div className="flex-1 max-w-xs">
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-200"
                          style={{ width: `${foundImageProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {uploadedFoundImagePreview && !isUploadingFoundImage && (
                    <div className="flex items-center gap-2">
                      <img
                        src={uploadedFoundImagePreview}
                        alt="Preview"
                        className="w-10 h-10 rounded-lg object-cover border border-emerald-400"
                      />
                      <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Uploaded to Storage!
                      </span>
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
      {/* MODAL 5: EDIT REPORT MODAL (Section 10)                                   */}
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
                  {CATEGORIES.map((c) => (
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
