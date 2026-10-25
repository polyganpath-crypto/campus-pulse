import {
  CampusLocation,
  CampusAnnouncement,
  CampusNavEvent,
  CampusAlertNotification,
  UserProfile
} from '../types';
import {
  INITIAL_CAMPUS_LOCATIONS,
  INITIAL_CAMPUS_ANNOUNCEMENTS,
  INITIAL_CAMPUS_NAV_EVENTS,
  INITIAL_CAMPUS_ALERTS
} from '../data/campusNavigationData';
import { firebaseDbService } from './firebaseDbService';
import { auth } from '../firebase';

const LOCATIONS_KEY = 'campuspulse_locations_v1';
const ANNOUNCEMENTS_KEY = 'campuspulse_announcements_v1';
const EVENTS_KEY = 'campuspulse_events_v1';
const ALERTS_KEY = 'campuspulse_alerts_v1';

export interface RouteStep {
  instruction: string;
  landmark?: string;
  floorChange?: string;
  approxMinutes: number;
}

export interface NavigationRoute {
  fromLocation: CampusLocation;
  toLocation: CampusLocation;
  distanceMeters: number;
  estimatedMinutes: number;
  steps: RouteStep[];
}

export const campusNavService = {
  // 1. LOCATIONS
  getLocations(): CampusLocation[] {
    try {
      const stored = localStorage.getItem(LOCATIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse campus locations from localStorage:', e);
    }
    try {
      localStorage.setItem(LOCATIONS_KEY, JSON.stringify(INITIAL_CAMPUS_LOCATIONS));
    } catch {}
    return INITIAL_CAMPUS_LOCATIONS;
  },

  saveLocations(locations: CampusLocation[]): void {
    try {
      localStorage.setItem(LOCATIONS_KEY, JSON.stringify(locations));
    } catch (e) {
      console.error('Failed to save locations:', e);
    }
  },

  subscribeLocations(onData: (locations: CampusLocation[]) => void): () => void {
    return firebaseDbService.subscribeCampusLocations((items) => {
      this.saveLocations(items);
      onData(items);
    });
  },

  addLocation(location: Omit<CampusLocation, 'id'>): CampusLocation {
    const locations = this.getLocations();
    const newLoc: CampusLocation = {
      ...location,
      id: `loc-${Date.now()}`
    };
    locations.unshift(newLoc);
    this.saveLocations(locations);

    if (auth.currentUser) {
      firebaseDbService.createCampusLocation(newLoc).catch((err) => {
        console.warn('Failed to save location to Firestore:', err);
      });
    }

    return newLoc;
  },

  updateLocation(id: string, updates: Partial<CampusLocation>): CampusLocation {
    const locations = this.getLocations();
    const idx = locations.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error('Location not found');
    locations[idx] = { ...locations[idx], ...updates };
    this.saveLocations(locations);

    if (auth.currentUser) {
      firebaseDbService.updateCampusLocation(id, updates).catch((err) => {
        console.warn('Failed to update location in Firestore:', err);
      });
    }

    return locations[idx];
  },

  deleteLocation(id: string): void {
    const locations = this.getLocations();
    const filtered = locations.filter((l) => l.id !== id);
    this.saveLocations(filtered);

    if (auth.currentUser) {
      firebaseDbService.deleteCampusLocation(id).catch((err) => {
        console.warn('Failed to delete location in Firestore:', err);
      });
    }
  },

  // 2. ANNOUNCEMENTS
  getAnnouncements(): CampusAnnouncement[] {
    try {
      const stored = localStorage.getItem(ANNOUNCEMENTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse announcements from localStorage:', e);
    }
    try {
      localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(INITIAL_CAMPUS_ANNOUNCEMENTS));
    } catch {}
    return INITIAL_CAMPUS_ANNOUNCEMENTS;
  },

  saveAnnouncements(announcements: CampusAnnouncement[]): void {
    try {
      localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
    } catch (e) {
      console.error('Failed to save announcements:', e);
    }
  },

  subscribeAnnouncements(onData: (announcements: CampusAnnouncement[]) => void): () => void {
    return firebaseDbService.subscribeAnnouncements((items) => {
      this.saveAnnouncements(items);
      onData(items);
    });
  },

  addAnnouncement(announcement: Omit<CampusAnnouncement, 'id' | 'createdAt'>): CampusAnnouncement {
    const announcements = this.getAnnouncements();
    const curUid = auth.currentUser?.uid || 'admin';
    const curName = auth.currentUser?.displayName || 'Campus Administration';
    const newAnn: CampusAnnouncement = {
      ...announcement,
      id: `ann-${Date.now()}`,
      authorId: curUid,
      authorName: curName,
      createdAt: new Date().toISOString()
    };
    announcements.unshift(newAnn);
    this.saveAnnouncements(announcements);

    // Sync to Firestore
    if (auth.currentUser) {
      firebaseDbService.createAnnouncement(newAnn).catch((err) => {
        console.warn('Failed to save announcement to Firestore:', err);
      });
    }

    // If urgent, also spawn an alert notification
    if (announcement.priority === 'urgent') {
      this.addAlert({
        title: announcement.title.replace(/^[🔴📢\s]+/, ''),
        message: announcement.description.slice(0, 140) + '...',
        type: announcement.category === 'Examination' ? 'exam_change' : 'emergency',
        isRead: false,
        targetDepartment: announcement.targetDepartment
      });
    }

    return newAnn;
  },

  updateAnnouncement(id: string, updates: Partial<CampusAnnouncement>): CampusAnnouncement {
    const announcements = this.getAnnouncements();
    const idx = announcements.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Announcement not found');
    announcements[idx] = { ...announcements[idx], ...updates };
    this.saveAnnouncements(announcements);

    if (auth.currentUser) {
      firebaseDbService.updateAnnouncement(id, updates).catch((err) => {
        console.warn('Failed to update announcement in Firestore:', err);
      });
    }

    return announcements[idx];
  },

  deleteAnnouncement(id: string): void {
    const announcements = this.getAnnouncements();
    const filtered = announcements.filter((a) => a.id !== id);
    this.saveAnnouncements(filtered);

    if (auth.currentUser) {
      firebaseDbService.deleteAnnouncement(id).catch((err) => {
        console.warn('Failed to delete announcement in Firestore:', err);
      });
    }
  },

  // 3. EVENTS
  getEvents(): CampusNavEvent[] {
    try {
      const stored = localStorage.getItem(EVENTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse events from localStorage:', e);
    }
    try {
      localStorage.setItem(EVENTS_KEY, JSON.stringify(INITIAL_CAMPUS_NAV_EVENTS));
    } catch {}
    return INITIAL_CAMPUS_NAV_EVENTS;
  },

  saveEvents(events: CampusNavEvent[]): void {
    try {
      localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    } catch (e) {
      console.error('Failed to save events:', e);
    }
  },

  subscribeEvents(onData: (events: CampusNavEvent[]) => void): () => void {
    return firebaseDbService.subscribeCampusNavEvents((items) => {
      this.saveEvents(items);
      onData(items);
    });
  },

  addEvent(event: Omit<CampusNavEvent, 'id' | 'registeredCount'>): CampusNavEvent {
    const events = this.getEvents();
    const newEvt: CampusNavEvent = {
      ...event,
      id: `evt-nav-${Date.now()}`,
      registeredCount: 0
    };
    events.unshift(newEvt);
    this.saveEvents(events);

    if (auth.currentUser) {
      firebaseDbService.createCampusNavEvent(newEvt).catch((err) => {
        console.warn('Failed to save nav event to Firestore:', err);
      });
    }

    return newEvt;
  },

  updateEvent(id: string, updates: Partial<CampusNavEvent>): CampusNavEvent {
    const events = this.getEvents();
    const idx = events.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Event not found');
    events[idx] = { ...events[idx], ...updates };
    this.saveEvents(events);

    if (auth.currentUser) {
      firebaseDbService.updateCampusNavEvent(id, updates).catch((err) => {
        console.warn('Failed to update nav event in Firestore:', err);
      });
    }

    return events[idx];
  },

  deleteEvent(id: string): void {
    const events = this.getEvents();
    const filtered = events.filter((e) => e.id !== id);
    this.saveEvents(filtered);

    if (auth.currentUser) {
      firebaseDbService.deleteCampusNavEvent(id).catch((err) => {
        console.warn('Failed to delete nav event in Firestore:', err);
      });
    }
  },

  toggleEventRegistration(eventId: string): CampusNavEvent {
    const events = this.getEvents();
    const idx = events.findIndex((e) => e.id === eventId);
    if (idx === -1) throw new Error('Event not found');
    const isReg = events[idx].registrationStatus === 'registered';
    events[idx] = {
      ...events[idx],
      registrationStatus: isReg ? 'open' : 'registered',
      registeredCount: isReg ? Math.max(0, events[idx].registeredCount - 1) : events[idx].registeredCount + 1
    };
    this.saveEvents(events);

    if (auth.currentUser) {
      firebaseDbService.updateCampusNavEvent(eventId, {
        registrationStatus: events[idx].registrationStatus,
        registeredCount: events[idx].registeredCount
      }).catch((err) => {
        console.warn('Failed to sync event registration to Firestore:', err);
      });
    }

    return events[idx];
  },

  // 4. ALERTS
  getAlerts(): CampusAlertNotification[] {
    try {
      const stored = localStorage.getItem(ALERTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse alerts from localStorage:', e);
    }
    try {
      localStorage.setItem(ALERTS_KEY, JSON.stringify(INITIAL_CAMPUS_ALERTS));
    } catch {}
    return INITIAL_CAMPUS_ALERTS;
  },

  saveAlerts(alerts: CampusAlertNotification[]): void {
    try {
      localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
    } catch (e) {
      console.error('Failed to save alerts:', e);
    }
  },

  subscribeAlerts(onData: (alerts: CampusAlertNotification[]) => void): () => void {
    return firebaseDbService.subscribeCampusAlerts((items) => {
      this.saveAlerts(items);
      onData(items);
    });
  },

  addAlert(alert: Omit<CampusAlertNotification, 'id' | 'createdAt'>): CampusAlertNotification {
    const alerts = this.getAlerts();
    const newAlt: CampusAlertNotification = {
      ...alert,
      id: `alt-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    alerts.unshift(newAlt);
    this.saveAlerts(alerts);

    if (auth.currentUser) {
      firebaseDbService.createCampusAlert(newAlt).catch((err) => {
        console.warn('Failed to save alert to Firestore:', err);
      });
    }

    return newAlt;
  },

  markAlertAsRead(id: string): void {
    const alerts = this.getAlerts();
    const updated = alerts.map((a) => (a.id === id ? { ...a, isRead: true } : a));
    this.saveAlerts(updated);

    if (auth.currentUser) {
      firebaseDbService.updateCampusAlert(id, { isRead: true }).catch((err) => {
        console.warn('Failed to mark alert as read in Firestore:', err);
      });
    }
  },

  markAllAlertsAsRead(): void {
    const alerts = this.getAlerts();
    const updated = alerts.map((a) => ({ ...a, isRead: true }));
    this.saveAlerts(updated);

    if (auth.currentUser) {
      alerts.forEach((alt) => {
        if (!alt.isRead) {
          firebaseDbService.updateCampusAlert(alt.id, { isRead: true }).catch(() => {});
        }
      });
    }
  },

  deleteAlert(id: string): void {
    const alerts = this.getAlerts();
    const filtered = alerts.filter((a) => a.id !== id);
    this.saveAlerts(filtered);

    if (auth.currentUser) {
      firebaseDbService.deleteCampusAlert(id).catch((err) => {
        console.warn('Failed to delete alert in Firestore:', err);
      });
    }
  },

  // 5. NAVIGATION / STEP-BY-STEP DIRECTIONS CALCULATOR
  generateDirections(
    fromIdOrLoc: string | CampusLocation,
    toIdOrLoc: string | CampusLocation
  ): NavigationRoute | null {
    const locations = this.getLocations();
    const fromLoc: CampusLocation | undefined =
      typeof fromIdOrLoc === 'string'
        ? locations.find((l) => l.id === fromIdOrLoc)
        : fromIdOrLoc;
    const toLoc: CampusLocation | undefined =
      typeof toIdOrLoc === 'string'
        ? locations.find((l) => l.id === toIdOrLoc)
        : toIdOrLoc;

    if (!fromLoc || !toLoc) return null;

    let distanceMeters = 50;

    // High accuracy GPS Haversine calculation if coordinates are present
    if (
      fromLoc.latitude !== undefined &&
      fromLoc.longitude !== undefined &&
      toLoc.latitude !== undefined &&
      toLoc.longitude !== undefined
    ) {
      const R = 6371000;
      const dLat = (toLoc.latitude - fromLoc.latitude) * (Math.PI / 180);
      const dLon = (toLoc.longitude - fromLoc.longitude) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(fromLoc.latitude * (Math.PI / 180)) *
          Math.cos(toLoc.latitude * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const direct = Math.round(R * c);
      // Campus pedestrian pathway factor (1.25x direct line)
      distanceMeters = Math.max(25, Math.round(direct * 1.25));
    } else {
      // Fallback: Calculate Euclidean distance in percentage units
      const fx = fromLoc.coordinates?.x ?? 50;
      const fy = fromLoc.coordinates?.y ?? 50;
      const tx = toLoc.coordinates?.x ?? 50;
      const ty = toLoc.coordinates?.y ?? 50;
      const dx = tx - fx;
      const dy = ty - fy;
      const euclidean = Math.sqrt(dx * dx + dy * dy);
      distanceMeters = Math.max(30, Math.round(euclidean * 5.2));
    }

    // Walking speed ~75m/min (4.5 km/h)
    const estimatedMinutes = Math.max(1, Math.ceil(distanceMeters / 75));

    const steps: RouteStep[] = [];

    // Step 1: Start at origin
    steps.push({
      instruction: `Depart from ${fromLoc.name} (${fromLoc.building || fromLoc.buildingName || 'Campus Ground'}, ${fromLoc.floor || 'Ground Level'}).`,
      landmark: fromLoc.landmarks,
      approxMinutes: 1
    });

    // Step 2: Exit building / traverse quadrangle if different buildings
    if (fromLoc.building !== toLoc.building) {
      steps.push({
        instruction: `Head out along the tree-lined pedestrian avenue toward ${toLoc.building || toLoc.buildingName || 'Destination Complex'}.`,
        landmark: 'Central Campus Promenade & Fountain Quadrangle',
        approxMinutes: Math.max(1, Math.floor(estimatedMinutes * 0.5))
      });

      steps.push({
        instruction: `Enter ${toLoc.building || toLoc.buildingName || 'Target Block'} via the main entrance portico.`,
        landmark: `Look for official directory board for ${toLoc.building || toLoc.name}`,
        approxMinutes: 1
      });
    }

    // Step 3: Vertical floor movement if destination is above ground
    if (toLoc.floor && toLoc.floor !== 'Ground Floor' && toLoc.floor !== 'Ground Level' && toLoc.floor !== 'Outdoor Grounds') {
      steps.push({
        instruction: `Take the central staircase or elevator up to ${toLoc.floor}.`,
        floorChange: toLoc.floor,
        approxMinutes: 1
      });
    }

    // Step 4: Final destination pinpoint
    steps.push({
      instruction: `Follow the corridor signage to ${toLoc.name}${toLoc.roomNumber ? ` (Room ${toLoc.roomNumber})` : ''}.`,
      landmark: toLoc.landmarks,
      approxMinutes: 1
    });

    return {
      fromLocation: fromLoc,
      toLocation: toLoc,
      distanceMeters,
      estimatedMinutes,
      steps
    };
  },

  // Asynchronous REST API helpers
  async fetchLocationsFromApi(params?: { q?: string; category?: string; institution?: string }): Promise<CampusLocation[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.q) searchParams.set('q', params.q);
      if (params?.category) searchParams.set('category', params.category);
      if (params?.institution) searchParams.set('institution', params.institution);

      const res = await fetch(`/api/campus-locations?${searchParams.toString()}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data.locations) && data.locations.length > 0) {
        this.saveLocations(data.locations);
        return data.locations;
      }
    } catch (err) {
      console.warn('Fallback to local storage locations:', err);
    }
    return this.getLocations();
  },

  async seedLocationsOnServer(): Promise<number> {
    try {
      const res = await fetch('/api/campus-locations/seed', { method: 'POST' });
      const data = await res.json();
      return data.count || 0;
    } catch (e) {
      console.error('Failed to seed locations on server:', e);
      return 0;
    }
  },

  // 6. GLOBAL SEARCH ENGINE
  searchAll(query: string, studentDepartment: string = 'CSE') {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        locations: [],
        announcements: [],
        events: []
      };
    }

    const locations = this.getLocations().filter((loc) => {
      return (
        loc.name.toLowerCase().includes(q) ||
        ((loc.building || loc.buildingName || '').toLowerCase().includes(q)) ||
        (loc.roomNumber && loc.roomNumber.toLowerCase().includes(q)) ||
        loc.category.toLowerCase().includes(q) ||
        loc.description.toLowerCase().includes(q) ||
        ((loc.landmarks || '').toLowerCase().includes(q))
      );
    });

    const announcements = this.getAnnouncements().filter((ann) => {
      return (
        ann.title.toLowerCase().includes(q) ||
        ann.description.toLowerCase().includes(q) ||
        ann.category.toLowerCase().includes(q) ||
        ann.department.toLowerCase().includes(q) ||
        ann.authority.toLowerCase().includes(q)
      );
    });

    const events = this.getEvents().filter((evt) => {
      return (
        evt.title.toLowerCase().includes(q) ||
        evt.description.toLowerCase().includes(q) ||
        evt.venue.toLowerCase().includes(q) ||
        evt.organizer.toLowerCase().includes(q) ||
        evt.category.toLowerCase().includes(q)
      );
    });

    return {
      locations,
      announcements,
      events
    };
  },

  // 7. ROLE PERMISSION CHECK
  canManageContent(user?: UserProfile | null): boolean {
    if (!user) return false;
    return user.role === 'admin' || user.role === 'faculty' || user.facultyType === 'hod' || user.role === 'coordinator';
  }
};
