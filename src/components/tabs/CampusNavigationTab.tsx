import React, { useState, useMemo, useEffect } from 'react';
import {
  CampusLocation,
  CampusAnnouncement,
  CampusNavEvent,
  CampusAlertNotification,
  UserProfile,
  CampusLocationCategory,
  CampusAnnouncementCategory,
  CampusAnnouncementPriority
} from '../../types';
import {
  campusNavService,
  NavigationRoute
} from '../../services/campusNavService';
import { InteractiveCampusMap } from '../campus/InteractiveCampusMap';
import {
  MapPin,
  Compass,
  Bell,
  Calendar,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building,
  Navigation,
  ExternalLink,
  Filter,
  ShieldCheck,
  Megaphone,
  Layers,
  Sparkles,
  ChevronRight,
  Info,
  X,
  Send,
  FileText,
  Phone,
  Bookmark
} from 'lucide-react';

interface CampusNavigationTabProps {
  currentUser: UserProfile;
  initialSubTab?: 'map' | 'locations' | 'announcements' | 'events' | 'alerts' | 'search';
  onNavigateTab?: (tab: string) => void;
}

export const CampusNavigationTab: React.FC<CampusNavigationTabProps> = ({
  currentUser,
  initialSubTab = 'map',
  onNavigateTab
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'map' | 'locations' | 'announcements' | 'events' | 'alerts' | 'search'>(
    initialSubTab
  );

  // Core Data States loaded from campusNavService
  const [locations, setLocations] = useState<CampusLocation[]>(() => campusNavService.getLocations());
  const [announcements, setAnnouncements] = useState<CampusAnnouncement[]>(() => campusNavService.getAnnouncements());
  const [events, setEvents] = useState<CampusNavEvent[]>(() => campusNavService.getEvents());
  const [alerts, setAlerts] = useState<CampusAlertNotification[]>(() => campusNavService.getAlerts());

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLocationCategory, setSelectedLocationCategory] = useState<string>('All');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('All');
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);
  const [selectedAnnouncementCategory, setSelectedAnnouncementCategory] = useState<string>('All');
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('All');
  const [mapTargetLocationId, setMapTargetLocationId] = useState<string | null>(null);

  // Direction Modal / Route Preview State
  const [viewingDirectionsRoute, setViewingDirectionsRoute] = useState<NavigationRoute | null>(null);

  // Admin Management Modals
  const [showAddAnnouncementModal, setShowAddAnnouncementModal] = useState<boolean>(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<CampusAnnouncement | null>(null);

  const [showAddLocationModal, setShowAddLocationModal] = useState<boolean>(false);
  const [editingLocation, setEditingLocation] = useState<CampusLocation | null>(null);

  const [showAddEventModal, setShowAddEventModal] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<CampusNavEvent | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canManage = campusNavService.canManageContent(currentUser);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync state if initialSubTab prop changes
  useEffect(() => {
    if (initialSubTab) setActiveSubTab(initialSubTab);
  }, [initialSubTab]);

  // Live Firestore subscription for announcements, locations, events, alerts
  useEffect(() => {
    const unsubAnnouncements = campusNavService.subscribeAnnouncements((updated) => {
      setAnnouncements(updated);
    });
    const unsubLocations = campusNavService.subscribeLocations((updated) => {
      setLocations(updated);
    });
    const unsubEvents = campusNavService.subscribeEvents((updated) => {
      setEvents(updated);
    });
    const unsubAlerts = campusNavService.subscribeAlerts((updated) => {
      setAlerts(updated);
    });
    return () => {
      unsubAnnouncements();
      unsubLocations();
      unsubEvents();
      unsubAlerts();
    };
  }, []);

  // Unread alerts count
  const unreadAlertsCount = useMemo(() => alerts.filter((a) => !a.isRead).length, [alerts]);

  // Filtered Locations
  const filteredLocations = useMemo(() => {
    let result = locations;
    if (selectedLocationCategory !== 'All') {
      result = result.filter((l) => l.category === selectedLocationCategory);
    }
    if (selectedInstitution !== 'All') {
      result = result.filter((l) =>
        (l.institutionName || '').toLowerCase().includes(selectedInstitution.toLowerCase())
      );
    }
    if (onlyVerified) {
      result = result.filter((l) => l.coordinatesVerified);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          (l.building && l.building.toLowerCase().includes(q)) ||
          (l.buildingName && l.buildingName.toLowerCase().includes(q)) ||
          (l.roomNumber && l.roomNumber.toLowerCase().includes(q)) ||
          l.category.toLowerCase().includes(q) ||
          (l.departmentName && l.departmentName.toLowerCase().includes(q)) ||
          (l.searchKeywords && l.searchKeywords.some((k) => k.toLowerCase().includes(q))) ||
          (l.landmarks && l.landmarks.toLowerCase().includes(q))
      );
    }
    return result;
  }, [locations, selectedLocationCategory, selectedInstitution, onlyVerified, searchQuery]);

  // Filtered Announcements
  const filteredAnnouncements = useMemo(() => {
    let result = announcements;
    if (selectedAnnouncementCategory !== 'All') {
      result = result.filter((a) => a.category === selectedAnnouncementCategory);
    }
    if (searchQuery.trim() && activeSubTab === 'announcements') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.department.toLowerCase().includes(q) ||
          a.authority.toLowerCase().includes(q)
      );
    }
    return result;
  }, [announcements, selectedAnnouncementCategory, searchQuery, activeSubTab]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    let result = events;
    if (selectedEventFilter !== 'All') {
      result = result.filter((e) => e.category === selectedEventFilter);
    }
    if (searchQuery.trim() && activeSubTab === 'events') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.organizer.toLowerCase().includes(q)
      );
    }
    return result;
  }, [events, selectedEventFilter, searchQuery, activeSubTab]);

  // Global search multi-results
  const searchResults = useMemo(() => {
    return campusNavService.searchAll(searchQuery, currentUser.department || 'CSE');
  }, [searchQuery, currentUser.department]);

  // Action: Launch interactive Google map with directions
  const handleGetDirectionsTo = (location: CampusLocation) => {
    setMapTargetLocationId(location.id);
    setActiveSubTab('map');
    showToast(`Navigating to ${location.name}...`);
  };

  const handleOpenOnMap = (locationId: string) => {
    setMapTargetLocationId(locationId);
    setActiveSubTab('map');
  };

  // Admin Announcement Handlers
  const handleSaveAnnouncement = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as CampusAnnouncementCategory;
    const priority = formData.get('priority') as CampusAnnouncementPriority;
    const department = (formData.get('department') as string) || currentUser.department || 'All Departments';
    const authority = (formData.get('authority') as string) || currentUser.name;
    const targetDepartment = (formData.get('targetDepartment') as string) || 'All';
    const attachmentUrl = formData.get('attachmentUrl') as string;

    if (editingAnnouncement) {
      campusNavService.updateAnnouncement(editingAnnouncement.id, {
        title,
        description,
        category,
        priority,
        department,
        authority,
        targetDepartment,
        attachmentUrl
      });
      showToast('Announcement updated successfully!');
    } else {
      campusNavService.addAnnouncement({
        title,
        description,
        category,
        priority,
        department,
        authority,
        targetDepartment,
        attachmentUrl
      });
      showToast('Official announcement published to campus feed!');
    }

    setAnnouncements(campusNavService.getAnnouncements());
    setAlerts(campusNavService.getAlerts());
    setShowAddAnnouncementModal(false);
    setEditingAnnouncement(null);
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (confirm('Are you sure you want to delete this campus announcement?')) {
      campusNavService.deleteAnnouncement(id);
      setAnnouncements(campusNavService.getAnnouncements());
      showToast('Announcement removed.');
    }
  };

  // Admin Location Handlers
  const handleSaveLocation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const category = formData.get('category') as CampusLocationCategory;
    const institutionName = (formData.get('institutionName') as string) || 'Guru Nanak Institutions';
    const building = formData.get('building') as string;
    const floor = formData.get('floor') as string;
    const roomNumber = formData.get('roomNumber') as string;
    const description = formData.get('description') as string;
    const landmarks = formData.get('landmarks') as string;
    const timings = formData.get('timings') as string;
    const inCharge = formData.get('inCharge') as string;
    const contactNumber = formData.get('contactNumber') as string;
    const latStr = formData.get('latitude') as string;
    const lngStr = formData.get('longitude') as string;
    const coordinatesVerified = formData.get('coordinatesVerified') === 'true';
    const verificationSource = (formData.get('verificationSource') as string) || 'Admin Verified';

    const latitude = latStr ? parseFloat(latStr) : 17.16126;
    const longitude = lngStr ? parseFloat(lngStr) : 78.658515;

    if (editingLocation) {
      campusNavService.updateLocation(editingLocation.id, {
        name,
        category,
        institutionName,
        building,
        buildingName: building,
        floor,
        roomNumber,
        description,
        landmarks,
        timings,
        inCharge,
        contactNumber,
        latitude,
        longitude,
        coordinates: { x: editingLocation.coordinates?.x ?? 50, y: editingLocation.coordinates?.y ?? 50, lat: latitude, lng: longitude },
        coordinatesVerified,
        verificationSource,
        navigationEnabled: true
      });
      // Also sync to backend API
      fetch(`/api/campus-locations/${editingLocation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          institutionName,
          building,
          floor,
          roomNumber,
          description,
          landmarks,
          timings,
          inCharge,
          contactNumber,
          latitude,
          longitude,
          coordinatesVerified
        })
      }).catch((err) => console.warn('Failed to sync update to server:', err));

      showToast('Campus location updated with GPS coordinates!');
    } else {
      const created = campusNavService.addLocation({
        name,
        category,
        institutionName,
        building,
        buildingName: building,
        floor,
        roomNumber,
        description,
        landmarks,
        latitude,
        longitude,
        coordinates: { x: 50, y: 50, lat: latitude, lng: longitude },
        coordinatesVerified,
        verificationSource,
        navigationEnabled: true,
        timings,
        inCharge,
        contactNumber,
        isPopular: true
      });

      // Also sync to backend API
      fetch('/api/campus-locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created)
      }).catch((err) => console.warn('Failed to sync new location to server:', err));

      showToast('New campus location registered with verified GPS coordinates!');
    }

    setLocations(campusNavService.getLocations());
    setShowAddLocationModal(false);
    setEditingLocation(null);
  };

  const handleSeedDataset = async () => {
    if (confirm('Sync all 65+ verified Guru Nanak Institutions campus buildings and coordinates to database?')) {
      await campusNavService.seedLocationsOnServer();
      setLocations(campusNavService.getLocations());
      showToast('Verified GNI campus dataset synchronized successfully!');
    }
  };

  const handleDeleteLocation = (id: string) => {
    if (confirm('Are you sure you want to delete this campus location?')) {
      campusNavService.deleteLocation(id);
      setLocations(campusNavService.getLocations());
      showToast('Location deleted.');
    }
  };

  // Event RSVP / Registration Toggle
  const handleToggleEventRsvp = (eventId: string) => {
    campusNavService.toggleEventRegistration(eventId);
    setEvents(campusNavService.getEvents());
    showToast('Event registration status updated!');
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert Feedback */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-indigo-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Main Feature Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
              Centralized Campus Hub
            </span>
            <span className="text-xs text-slate-500">Real-time Navigation &amp; Bulletin</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-2 flex items-center gap-2">
            <Compass className="w-6 h-6 text-indigo-600" />
            <span>Campus Navigation &amp; Smart Announcements</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Quickly locate classrooms, labs, offices, and seminar halls across campus. Stay informed with prioritized academic announcements, emergency schedule shifts, and upcoming college events.
          </p>
        </div>

        {/* Global Search Bar in Header */}
        <div className="w-full md:w-96 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim().length > 0 && activeSubTab !== 'search') {
                  setActiveSubTab('search');
                }
              }}
              placeholder="Search any place across Guru Nanak Institutions..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-all shadow-2xs font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Search Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 no-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 shrink-0">Try:</span>
            {[
              'Library',
              'CSE Department',
              'AI & ML Laboratory',
              'Examination Block',
              'Food Court',
              'Hostel',
              'Gate 1',
              'Sports Ground'
            ].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSearchQuery(tag);
                  setActiveSubTab('search');
                }}
                className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200">
        <button
          id="subtab-map-btn"
          onClick={() => setActiveSubTab('map')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'map'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <span>🗺️</span>
          <span>Campus Map</span>
        </button>

        <button
          id="subtab-locations-btn"
          onClick={() => setActiveSubTab('locations')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'locations'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <span>📍</span>
          <span>Find a Location ({locations.length})</span>
        </button>

        <button
          id="subtab-announcements-btn"
          onClick={() => setActiveSubTab('announcements')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'announcements'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <span>📢</span>
          <span>Announcements ({announcements.length})</span>
        </button>

        <button
          id="subtab-events-btn"
          onClick={() => setActiveSubTab('events')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'events'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <span>📅</span>
          <span>Campus Events ({events.length})</span>
        </button>

        <button
          id="subtab-alerts-btn"
          onClick={() => setActiveSubTab('alerts')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'alerts'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <span>🔔</span>
          <span>Alerts</span>
          {unreadAlertsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold animate-pulse">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        <button
          id="subtab-search-btn"
          onClick={() => setActiveSubTab('search')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'search'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <span>🔎</span>
          <span>Global Search</span>
        </button>

        {/* Staff/Admin Quick Action Trigger */}
        {canManage && (
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => {
                setEditingAnnouncement(null);
                setShowAddAnnouncementModal(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Post Announcement</span>
            </button>
            <button
              onClick={() => {
                setEditingLocation(null);
                setShowAddLocationModal(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Location</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SUBSECTION 1: 🗺️ INTERACTIVE CAMPUS MAP                                  */}
      {/* ========================================================================= */}
      {activeSubTab === 'map' && (
        <InteractiveCampusMap
          locations={locations}
          selectedLocationId={mapTargetLocationId}
          onSelectLocation={(loc) => setMapTargetLocationId(loc.id)}
        />
      )}

      {/* ========================================================================= */}
      {/* SUBSECTION 2: 📍 FIND A LOCATION DIRECTORY                                 */}
      {/* ========================================================================= */}
      {activeSubTab === 'locations' && (
        <div className="space-y-4">
          {/* Controls Bar: Category Pills + Institution Dropdown + Admin Actions */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Institution Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 shrink-0">Institution:</span>
                <select
                  value={selectedInstitution}
                  onChange={(e) => setSelectedInstitution(e.target.value)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All Institutions (Campus-Wide)</option>
                  <option value="Guru Nanak Institutions Technical Campus">GNITC (Autonomous)</option>
                  <option value="Guru Nanak Institute of Technology">GNIT</option>
                  <option value="School of Pharmacy">School of Pharmacy (GNIP)</option>
                  <option value="Management Studies">School of Management (MBA)</option>
                </select>
              </div>

              {/* Verified Only Toggle & Admin Seed Button */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyVerified}
                    onChange={(e) => setOnlyVerified(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span>Verified GPS Only</span>
                </label>

                {canManage && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSeedDataset}
                      className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Reload verified 65+ campus locations into persistent database"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Sync GNI Data</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingLocation(null);
                        setShowAddLocationModal(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Location</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-xs no-scrollbar border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Category:
              </span>
              {[
                'All',
                'Academic Block',
                'Classroom',
                'Laboratory',
                'Department Office',
                'Library',
                'Examination Cell',
                'Auditorium',
                'Canteen',
                'Hostel',
                'Parking',
                'Main Gate',
                'Medical Room',
                'Placement Cell',
                'Sports Ground'
              ].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedLocationCategory(category)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedLocationCategory === category
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Location Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLocations.map((loc) => (
              <div
                key={loc.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {loc.category}
                    </span>
                    {canManage && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingLocation(loc);
                            setShowAddLocationModal(true);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-indigo-600"
                          title="Edit Location"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLocation(loc.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600"
                          title="Delete Location"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-2 group-hover:text-indigo-600 transition-colors">
                    {loc.name}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-indigo-500" />
                      {loc.building}
                    </span>
                    <span>•</span>
                    <span>{loc.floor}</span>
                    {loc.roomNumber && (
                      <>
                        <span>•</span>
                        <span className="font-mono font-bold text-slate-700">Room {loc.roomNumber}</span>
                      </>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                    {loc.description}
                  </p>

                  {/* Nearby Landmark Callout */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-0.5">
                    <span className="font-bold text-indigo-700 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-indigo-600" />
                      Nearby:
                    </span>
                    <p className="text-slate-600">{loc.landmarks}</p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenOnMap(loc.id)}
                    className="text-xs font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>View on Map</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleGetDirectionsTo(loc)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-200 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBSECTION 3: 📢 SMART ANNOUNCEMENTS FEED                                 */}
      {/* ========================================================================= */}
      {activeSubTab === 'announcements' && (
        <div className="space-y-4">
          {/* Category Filter Pills & Admin Post Button */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              {[
                'All',
                'Examination',
                'Academic',
                'Placements',
                'Department',
                'Events',
                'Important Alerts',
                'General'
              ].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedAnnouncementCategory(category)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedAnnouncementCategory === category
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {canManage && (
              <button
                onClick={() => {
                  setEditingAnnouncement(null);
                  setShowAddAnnouncementModal(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Publish Announcement</span>
              </button>
            )}
          </div>

          {/* Announcements List */}
          <div className="space-y-3.5">
            {filteredAnnouncements.map((ann) => {
              const isUrgent = ann.priority === 'urgent';
              const isImportant = ann.priority === 'important';

              return (
                <div
                  key={ann.id}
                  className={`rounded-2xl p-5 border transition-all ${
                    isUrgent
                      ? 'bg-gradient-to-r from-rose-50/90 via-white to-amber-50/50 border-rose-300 shadow-sm'
                      : isImportant
                      ? 'bg-white border-amber-300 shadow-2xs'
                      : 'bg-white border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Priority Badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            isUrgent
                              ? 'bg-rose-600 text-white animate-pulse'
                              : isImportant
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {ann.priority} Priority
                        </span>

                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {ann.category}
                        </span>

                        {ann.targetDepartment && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Target: {ann.targetDepartment}
                          </span>
                        )}

                        <span className="text-[11px] text-slate-400">
                          {new Date(ann.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {ann.title}
                      </h3>

                      <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">
                        {ann.description}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                        <span className="font-semibold text-slate-700">Issued by: {ann.authority}</span>
                        <span>•</span>
                        <span>{ann.department}</span>
                      </div>
                    </div>

                    {/* Actions and Attachment Link */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0">
                      {ann.attachmentUrl && (
                        <button
                          onClick={() => {
                            if (ann.attachmentUrl?.startsWith('#')) {
                              const tab = ann.attachmentUrl.replace('#', '');
                              if (onNavigateTab) onNavigateTab(tab);
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        >
                          <span>{ann.attachmentLabel || 'Open Relevant Link'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}

                      {canManage && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingAnnouncement(ann);
                              setShowAddAnnouncementModal(true);
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 text-xs font-semibold"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 text-xs font-semibold"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBSECTION 4: 📅 CAMPUS EVENTS DIRECTORY                                  */}
      {/* ========================================================================= */}
      {activeSubTab === 'events' && (
        <div className="space-y-4">
          {/* Category Filter Pills */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              {['All', 'Technical', 'Academic', 'Sports', 'Cultural', 'Clubs'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedEventFilter(filter)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedEventFilter === filter
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {canManage && (
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setShowAddEventModal(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Campus Event</span>
              </button>
            )}
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((evt) => {
              const isRegistered = evt.registrationStatus === 'registered';

              return (
                <div
                  key={evt.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {evt.category}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        {evt.time}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">{evt.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{evt.description}</p>

                    <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{evt.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 pt-0.5">
                        Organized by: <span className="font-semibold text-slate-700">{evt.organizer}</span>
                      </div>
                    </div>
                  </div>

                  {/* Event Actions & RSVP */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    {evt.locationId ? (
                      <button
                        onClick={() => handleOpenOnMap(evt.locationId!)}
                        className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Map Venue</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">{evt.registeredCount} Registered</span>
                    )}

                    <button
                      onClick={() => handleToggleEventRsvp(evt.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                        isRegistered
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                      }`}
                    >
                      {isRegistered ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Registered</span>
                        </>
                      ) : (
                        <span>Register Now</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBSECTION 5: 🔔 ALERTS & NOTIFICATIONS                                   */}
      {/* ========================================================================= */}
      {activeSubTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-rose-600" />
                <span>Urgent Campus Notices &amp; Real-time Alerts</span>
              </h3>
              <p className="text-xs text-slate-500">Live notifications for classroom reassignments, emergency cancellations, and exam hall updates.</p>
            </div>
            <button
              onClick={() => {
                campusNavService.markAllAlertsAsRead();
                setAlerts(campusNavService.getAlerts());
                showToast('All alerts marked as read.');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
            >
              Mark all as read
            </button>
          </div>

          <div className="space-y-3">
            {alerts.map((alt) => (
              <div
                key={alt.id}
                onClick={() => {
                  campusNavService.markAlertAsRead(alt.id);
                  setAlerts(campusNavService.getAlerts());
                }}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                  !alt.isRead
                    ? 'bg-rose-50/70 border-rose-300 shadow-xs'
                    : 'bg-white border-slate-200 opacity-80 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    alt.type === 'exam_change'
                      ? 'bg-purple-100 text-purple-700'
                      : alt.type === 'emergency'
                      ? 'bg-rose-100 text-rose-700'
                      : alt.type === 'deadline'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span>{alt.title}</span>
                      {!alt.isRead && (
                        <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
                      )}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {new Date(alt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{alt.message}</p>

                  {alt.actionLocationId && (
                    <div className="pt-1.5 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenOnMap(alt.actionLocationId!);
                        }}
                        className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>Locate on Campus Map</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBSECTION 6: 🔎 GLOBAL SEARCH VIEW                                       */}
      {/* ========================================================================= */}
      {activeSubTab === 'search' && (
        <div className="space-y-6">
          <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-indigo-950">
                Global Search Results for: "{searchQuery || 'All Campus Records'}"
              </h3>
              <p className="text-[11px] text-indigo-800">
                Found {searchResults.locations.length} locations, {searchResults.announcements.length} announcements, and {searchResults.events.length} events.
              </p>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-3 py-1 rounded-lg bg-indigo-200 text-indigo-900 font-bold text-xs hover:bg-indigo-300"
              >
                Clear Query
              </button>
            )}
          </div>

          {/* 1. Locations matching search */}
          {searchResults.locations.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>Matching Campus Locations ({searchResults.locations.length})</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchResults.locations.map((loc) => (
                  <div key={loc.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {loc.category}
                    </span>
                    <h5 className="text-sm font-bold text-slate-900">{loc.name}</h5>
                    <p className="text-xs text-slate-500">
                      {loc.building} • {loc.floor} • Room {loc.roomNumber || 'N/A'}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2">{loc.landmarks}</p>
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                      <button
                        onClick={() => handleOpenOnMap(loc.id)}
                        className="text-xs font-bold text-indigo-600 hover:underline"
                      >
                        View on Map →
                      </button>
                      <button
                        onClick={() => handleGetDirectionsTo(loc)}
                        className="text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center gap-1"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Directions</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Announcements matching search */}
          {searchResults.announcements.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-amber-600" />
                <span>Matching Announcements ({searchResults.announcements.length})</span>
              </h4>
              <div className="space-y-2.5">
                {searchResults.announcements.map((ann) => (
                  <div key={ann.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                        {ann.priority.toUpperCase()}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{ann.title}</span>
                    </div>
                    <p className="text-xs text-slate-600">{ann.description}</p>
                    <div className="text-[10px] text-slate-400">
                      Issued by: {ann.authority} • {ann.department}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Events matching search */}
          {searchResults.events.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Matching Campus Events ({searchResults.events.length})</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {searchResults.events.map((evt) => (
                  <div key={evt.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                      {evt.category}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900">{evt.title}</h5>
                    <p className="text-xs text-slate-500">
                      {evt.date} at {evt.time} • {evt.venue}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty search */}
          {searchResults.locations.length === 0 &&
            searchResults.announcements.length === 0 &&
            searchResults.events.length === 0 && (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2 text-slate-500">
                <Search className="w-8 h-8 mx-auto text-slate-400 opacity-50" />
                <h4 className="text-sm font-bold text-slate-800">No matching campus records found</h4>
                <p className="text-xs max-w-sm mx-auto">
                  Try searching with terms like "AI Lab", "204", "CSE", "Library", "Exam", or "Placement".
                </p>
              </div>
            )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* POPUP MODAL: STEP-BY-STEP DIRECTIONS MODAL                                 */}
      {/* ========================================================================= */}
      {viewingDirectionsRoute && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Walking Directions Guide</h3>
                  <p className="text-[11px] text-indigo-300">
                    To: {viewingDirectionsRoute.toLocation.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingDirectionsRoute(null)}
                className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                  <span className="text-[10px] text-indigo-600 uppercase font-bold block">Estimated Time</span>
                  <span className="text-lg font-black text-indigo-950">~{viewingDirectionsRoute.estimatedMinutes} Mins</span>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                  <span className="text-[10px] text-indigo-600 uppercase font-bold block">Walking Distance</span>
                  <span className="text-lg font-black text-indigo-950">~{viewingDirectionsRoute.distanceMeters} Meters</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1">
                <p>
                  <strong>Destination Room:</strong> {viewingDirectionsRoute.toLocation.building}, {viewingDirectionsRoute.toLocation.floor}
                  {viewingDirectionsRoute.toLocation.roomNumber ? ` (Room ${viewingDirectionsRoute.toLocation.roomNumber})` : ''}
                </p>
                <p className="text-[11px] text-slate-500">
                  <strong>Nearby Anchor:</strong> {viewingDirectionsRoute.toLocation.landmarks}
                </p>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {viewingDirectionsRoute.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900">{step.instruction}</p>
                      {step.landmark && <p className="text-[11px] text-indigo-700 italic">💡 {step.landmark}</p>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setViewingDirectionsRoute(null);
                    setActiveSubTab('map');
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Show on Interactive 2D Map</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN MODAL 1: POST / EDIT ANNOUNCEMENT                                    */}
      {/* ========================================================================= */}
      {showAddAnnouncementModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-indigo-800 to-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-indigo-300" />
                <span>{editingAnnouncement ? 'Edit Official Announcement' : 'Publish New Campus Announcement'}</span>
              </h3>
              <button
                onClick={() => setShowAddAnnouncementModal(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Announcement Title:</label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editingAnnouncement?.title || ''}
                  placeholder="e.g. 🔴 Urgent: Exam Hall Reassigned for CS601 Tomorrow"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category:</label>
                  <select
                    name="category"
                    defaultValue={editingAnnouncement?.category || 'Academic'}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="General">General</option>
                    <option value="Academic">Academic</option>
                    <option value="Examination">Examination</option>
                    <option value="Events">Events</option>
                    <option value="Placements">Placements</option>
                    <option value="Department">Department</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Important Alerts">Important Alerts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority Level:</label>
                  <select
                    name="priority"
                    defaultValue={editingAnnouncement?.priority || 'normal'}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent (Broadcasts Alerts)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Full Notice Body:</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  defaultValue={editingAnnouncement?.description || ''}
                  placeholder="Enter detailed notice, instructions for students, timings, hall numbers, and required documentation..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Department:</label>
                  <input
                    type="text"
                    name="targetDepartment"
                    defaultValue={editingAnnouncement?.targetDepartment || 'All Departments'}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Issuing Authority:</label>
                  <input
                    type="text"
                    name="authority"
                    defaultValue={editingAnnouncement?.authority || currentUser.name}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Optional In-App Action / Tab Link:</label>
                <input
                  type="text"
                  name="attachmentUrl"
                  defaultValue={editingAnnouncement?.attachmentUrl || ''}
                  placeholder="e.g. #exam-seating or #placements"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAnnouncementModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md cursor-pointer"
                >
                  {editingAnnouncement ? 'Save Changes' : 'Broadcast Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN MODAL 2: ADD / EDIT LOCATION                                        */}
      {/* ========================================================================= */}
      {showAddLocationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-indigo-800 to-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-300" />
                <span>{editingLocation ? 'Edit Campus Location' : 'Register New Campus Location'}</span>
              </h3>
              <button
                onClick={() => setShowAddLocationModal(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Location Name:</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingLocation?.name || ''}
                  placeholder="e.g. AI & Machine Learning Lab"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category:</label>
                  <select
                    name="category"
                    defaultValue={editingLocation?.category || 'Laboratory'}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  >
                    {[
                      'Academic Block',
                      'Classroom',
                      'Laboratory',
                      'Department Office',
                      'Library',
                      'Examination Cell',
                      'Auditorium',
                      'Canteen',
                      'Hostel',
                      'Parking',
                      'Main Gate',
                      'Medical Room',
                      'Placement Cell',
                      'Sports Ground'
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Institution:</label>
                  <select
                    name="institutionName"
                    defaultValue={editingLocation?.institutionName || 'Guru Nanak Institutions Technical Campus (Autonomous)'}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  >
                    <option value="Guru Nanak Institutions">Guru Nanak Institutions (Central)</option>
                    <option value="Guru Nanak Institutions Technical Campus (Autonomous)">GNITC (Autonomous)</option>
                    <option value="Guru Nanak Institute of Technology">GNIT</option>
                    <option value="Guru Nanak School of Pharmacy">School of Pharmacy (GNIP)</option>
                    <option value="School of Management Studies">School of Management Studies (SMS)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Building / Block Name:</label>
                  <input
                    type="text"
                    name="building"
                    required
                    defaultValue={editingLocation?.building || 'GNITC Block 1'}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Floor Level:</label>
                  <input
                    type="text"
                    name="floor"
                    required
                    defaultValue={editingLocation?.floor || 'Ground Floor'}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Room Number (Optional):</label>
                  <input
                    type="text"
                    name="roomNumber"
                    defaultValue={editingLocation?.roomNumber || ''}
                    placeholder="e.g. 204"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Operating Hours / Timings:</label>
                  <input
                    type="text"
                    name="timings"
                    defaultValue={editingLocation?.timings || '08:30 AM - 05:30 PM'}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Verified GPS Coordinates */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    <span>GPS Coordinates (Latitude & Longitude)</span>
                  </label>
                  <label className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                    <input
                      type="checkbox"
                      name="coordinatesVerified"
                      value="true"
                      defaultChecked={editingLocation?.coordinatesVerified ?? true}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Verified</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="number"
                      step="0.000001"
                      name="latitude"
                      id="loc-lat-input"
                      required
                      defaultValue={editingLocation?.latitude ?? 17.16126}
                      placeholder="Latitude (e.g. 17.16126)"
                      className="w-full p-2 rounded-xl border border-slate-300 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="0.000001"
                      name="longitude"
                      id="loc-lng-input"
                      required
                      defaultValue={editingLocation?.longitude ?? 78.658515}
                      placeholder="Longitude (e.g. 78.658515)"
                      className="w-full p-2 rounded-xl border border-slate-300 text-xs bg-white"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-slate-500 font-bold">Presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const latEl = document.getElementById('loc-lat-input') as HTMLInputElement;
                      const lngEl = document.getElementById('loc-lng-input') as HTMLInputElement;
                      if (latEl && lngEl) {
                        latEl.value = '17.15952';
                        lngEl.value = '78.65685';
                      }
                    }}
                    className="px-2 py-0.5 rounded bg-white hover:bg-indigo-50 border border-slate-200 text-[10px] text-slate-700 font-semibold cursor-pointer"
                  >
                    Gate 1 (Main Arch)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const latEl = document.getElementById('loc-lat-input') as HTMLInputElement;
                      const lngEl = document.getElementById('loc-lng-input') as HTMLInputElement;
                      if (latEl && lngEl) {
                        latEl.value = '17.16155';
                        lngEl.value = '78.65825';
                      }
                    }}
                    className="px-2 py-0.5 rounded bg-white hover:bg-indigo-50 border border-slate-200 text-[10px] text-slate-700 font-semibold cursor-pointer"
                  >
                    GNITC Block 1
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const latEl = document.getElementById('loc-lat-input') as HTMLInputElement;
                      const lngEl = document.getElementById('loc-lng-input') as HTMLInputElement;
                      if (latEl && lngEl) {
                        latEl.value = '17.16075';
                        lngEl.value = '78.65940';
                      }
                    }}
                    className="px-2 py-0.5 rounded bg-white hover:bg-indigo-50 border border-slate-200 text-[10px] text-slate-700 font-semibold cursor-pointer"
                  >
                    GNIT Main Block
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nearby Landmarks (For Walking Navigation):</label>
                <input
                  type="text"
                  name="landmarks"
                  required
                  defaultValue={editingLocation?.landmarks || ''}
                  placeholder="e.g. Adjacent to Central Library, right wing entrance"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">In-Charge / Faculty:</label>
                  <input
                    type="text"
                    name="inCharge"
                    defaultValue={editingLocation?.inCharge || ''}
                    placeholder="e.g. Lab In-Charge, CSE"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Hotline:</label>
                  <input
                    type="text"
                    name="contactNumber"
                    defaultValue={editingLocation?.contactNumber || '+91 8414 202120'}
                    placeholder="e.g. +91 8414 202120"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description:</label>
                <textarea
                  name="description"
                  required
                  rows={2}
                  defaultValue={editingLocation?.description || ''}
                  placeholder="Detailed description of facility, laboratories, or services..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddLocationModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md cursor-pointer"
                >
                  {editingLocation ? 'Save Location' : 'Register Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
