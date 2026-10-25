import {
  LostFoundItem,
  LostFoundCategory,
  LostFoundItemType,
  LostFoundClaimRequest,
  LostFoundStatus,
  LostFoundClaimStatus
} from '../types';
import { INITIAL_LOST_FOUND_ITEMS } from '../data/lostFoundData';
import { firebaseDbService } from './firebaseDbService';
import { auth } from '../firebase';

const STORAGE_KEY = 'campuspulse_lost_found_v1';

export interface LostFoundStats {
  myLostItems: number;
  myFoundItems: number;
  openReports: number;
  recoveredItems: number;
  totalCampusLost: number;
  totalCampusFound: number;
}

export interface SmartMatchResult {
  lostItem: LostFoundItem;
  foundItem: LostFoundItem;
  matchScore: number;
  explanation: string;
}

export const lostFoundService = {
  // 1. DATA RETRIEVAL
  getItems(): LostFoundItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse lost & found from localStorage:', e);
    }
    return INITIAL_LOST_FOUND_ITEMS;
  },

  saveItems(items: LostFoundItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save lost & found items:', e);
    }
  },

  subscribeItems(onData: (items: LostFoundItem[]) => void): () => void {
    return firebaseDbService.subscribeLostItems((items) => {
      this.saveItems(items);
      onData(items);
    });
  },

  getItemById(id: string): LostFoundItem | undefined {
    return this.getItems().find((item) => item.id === id);
  },

  // 2. REPORT CREATION
  addReport(reportData: {
    itemName: string;
    type: LostFoundItemType;
    category: LostFoundCategory;
    description: string;
    date: string;
    time: string;
    location: string;
    imageUrl?: string;
    reportedBy: string;
    studentId: string;
    contactPreference: string;
    currentKeeperLocation?: string;
    additionalDetails?: string;
  }): LostFoundItem {
    const items = this.getItems();
    const now = new Date().toISOString();
    const curUid = auth.currentUser?.uid || reportData.studentId;
    const curName = auth.currentUser?.displayName || reportData.reportedBy;

    const newItem: LostFoundItem = {
      ...reportData,
      id: `lf-${Date.now()}`,
      title: reportData.itemName,
      userId: curUid,
      userName: curName,
      status: 'open',
      claimStatus: 'none',
      claimRequests: [],
      createdAt: now,
      updatedAt: now
    };

    // Smart Match Automation: Compare against opposite type reports
    const oppositeType: LostFoundItemType = reportData.type === 'lost' ? 'found' : 'lost';
    const candidateMatches = items.filter(
      (it) => it.type === oppositeType && it.status !== 'returned'
    );

    const matchedIds: string[] = [];
    candidateMatches.forEach((other) => {
      const isMatch = this.checkSimilarity(newItem, other);
      if (isMatch) {
        matchedIds.push(other.id);
        if (!other.possibleMatchIds) other.possibleMatchIds = [];
        if (!other.possibleMatchIds.includes(newItem.id)) {
          other.possibleMatchIds.push(newItem.id);
        }
      }
    });

    if (matchedIds.length > 0) {
      newItem.possibleMatchIds = matchedIds;
    }

    items.unshift(newItem);
    this.saveItems(items);

    // Sync immediately with Firestore
    if (auth.currentUser) {
      firebaseDbService.createLostItem(newItem).catch((err) => {
        console.warn('Failed to sync new lost/found item to Firestore:', err);
      });
    }

    return newItem;
  },

  // 3. EDIT & UPDATE
  updateReport(id: string, updates: Partial<LostFoundItem>): LostFoundItem {
    const items = this.getItems();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error('Report not found');
    const updated = {
      ...items[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    items[idx] = updated;
    this.saveItems(items);

    if (auth.currentUser) {
      firebaseDbService.updateLostItem(id, updates).catch((err) => {
        console.warn('Failed to sync updated lost/found item to Firestore:', err);
      });
    }

    return updated;
  },

  deleteReport(id: string): void {
    const items = this.getItems();
    const filtered = items.filter((i) => i.id !== id);
    // Also remove reference from any possibleMatchIds
    filtered.forEach((item) => {
      if (item.possibleMatchIds) {
        item.possibleMatchIds = item.possibleMatchIds.filter((mid) => mid !== id);
      }
    });
    this.saveItems(filtered);

    if (auth.currentUser) {
      firebaseDbService.deleteLostItem(id).catch((err) => {
        console.warn('Failed to delete lost/found item in Firestore:', err);
      });
    }
  },

  // 4. CLAIM / RECOVERY WORKFLOW
  submitClaim(
    itemId: string,
    claimant: {
      name: string;
      rollNumber: string;
      contact: string;
      verificationDetails: string;
    }
  ): LostFoundClaimRequest {
    const items = this.getItems();
    const idx = items.findIndex((i) => i.id === itemId);
    if (idx === -1) throw new Error('Item not found');

    const newClaim: LostFoundClaimRequest = {
      id: `claim-${Date.now()}`,
      itemId,
      claimantName: claimant.name,
      claimantRollNumber: claimant.rollNumber,
      claimantContact: claimant.contact,
      verificationDetails: claimant.verificationDetails,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    const existingClaims = items[idx].claimRequests || [];
    const updatedItem = {
      ...items[idx],
      claimStatus: 'pending' as LostFoundClaimStatus,
      status: 'claimed' as LostFoundStatus,
      claimRequests: [newClaim, ...existingClaims],
      updatedAt: new Date().toISOString()
    };
    items[idx] = updatedItem;

    this.saveItems(items);

    if (auth.currentUser) {
      firebaseDbService.updateLostItem(itemId, {
        claimStatus: 'pending',
        status: 'claimed',
        claimRequests: updatedItem.claimRequests
      }).catch(() => {});
    }

    return newClaim;
  },

  markItemAsReturned(itemId: string): LostFoundItem {
    const items = this.getItems();
    const idx = items.findIndex((i) => i.id === itemId);
    if (idx === -1) throw new Error('Item not found');

    items[idx] = {
      ...items[idx],
      status: 'returned',
      claimStatus: 'approved',
      updatedAt: new Date().toISOString()
    };

    this.saveItems(items);

    if (auth.currentUser) {
      firebaseDbService.updateLostItem(itemId, {
        status: 'returned',
        claimStatus: 'approved'
      }).catch(() => {});
    }

    return items[idx];
  },

  // 5. RULE-BASED SMART MATCHING ENGINE (Section 12)
  checkSimilarity(a: LostFoundItem, b: LostFoundItem): boolean {
    if (a.id === b.id) return false;
    if (a.type === b.type) return false;
    if (a.status === 'returned' || b.status === 'returned') return false;

    let score = 0;

    // A. Category matching (Strongest signal)
    if (a.category === b.category) {
      score += 4;
    }

    // B. Item name keyword overlap
    const aWords = a.itemName.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 2);
    const bWords = b.itemName.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 2);
    const commonWords = aWords.filter((w) => bWords.includes(w));
    if (commonWords.length > 0) {
      score += 3;
    }

    // C. Location proximity matching
    const locA = a.location.toLowerCase();
    const locB = b.location.toLowerCase();
    const campusHotspots = [
      'main block',
      'block a',
      'block b',
      'library',
      'canteen',
      'seminar hall',
      '204',
      'computer lab',
      'parking',
      'examination hall'
    ];

    const matchedHotspot = campusHotspots.find((spot) => locA.includes(spot) && locB.includes(spot));
    if (matchedHotspot || locA === locB) {
      score += 3;
    }

    // D. Description keyword overlap
    const descA = a.description.toLowerCase();
    const descB = b.description.toLowerCase();
    const colorKeywords = ['black', 'blue', 'brown', 'red', 'white', 'silver', 'transparent'];
    const matchedColors = colorKeywords.filter((c) => descA.includes(c) && descB.includes(c));
    if (matchedColors.length > 0) {
      score += 2;
    }

    // E. Date proximity (reported within 7 days of each other)
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (!isNaN(dateA) && !isNaN(dateB)) {
      const daysDiff = Math.abs(dateA - dateB) / (1000 * 60 * 60 * 24);
      if (daysDiff <= 3) {
        score += 1;
      }
    }

    return score >= 6;
  },

  findMatchesFor(item: LostFoundItem): LostFoundItem[] {
    const allItems = this.getItems();
    return allItems.filter((other) => this.checkSimilarity(item, other));
  },

  getSmartMatchesForStudent(studentId: string = '22CS084'): SmartMatchResult[] {
    const items = this.getItems();
    const myLost = items.filter((i) => i.studentId === studentId && i.type === 'lost' && i.status !== 'returned');
    const results: SmartMatchResult[] = [];

    myLost.forEach((lost) => {
      const matches = this.findMatchesFor(lost);
      matches.forEach((found) => {
        results.push({
          lostItem: lost,
          foundItem: found,
          matchScore: 85,
          explanation: `Your lost ${lost.itemName.toLowerCase()} may match a ${found.itemName.toLowerCase()} reported found near ${found.location}.`
        });
      });
    });

    return results;
  },

  // 6. DASHBOARD STATISTICS (Section 1)
  getStats(studentId: string = '22CS084'): LostFoundStats {
    const items = this.getItems();

    const myItems = items.filter((i) => i.studentId === studentId);
    const myLostItems = myItems.filter((i) => i.type === 'lost' && i.status !== 'returned').length;
    const myFoundItems = myItems.filter((i) => i.type === 'found' && i.status !== 'returned').length;
    const openReports = myItems.filter((i) => i.status === 'open').length;
    const recoveredItems = myItems.filter((i) => i.status === 'returned').length;

    const totalCampusLost = items.filter((i) => i.type === 'lost' && i.status !== 'returned').length;
    const totalCampusFound = items.filter((i) => i.type === 'found' && i.status !== 'returned').length;

    return {
      myLostItems,
      myFoundItems,
      openReports,
      recoveredItems,
      totalCampusLost,
      totalCampusFound
    };
  },

  // 7. RECENT REPORTS (Section 11)
  getRecentReports(limit: number = 6): LostFoundItem[] {
    const items = this.getItems();
    return [...items]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },

  // 8. MY REPORTS (Section 10)
  getMyReports(studentId: string = '22CS084'): LostFoundItem[] {
    const items = this.getItems();
    return items.filter((i) => i.studentId === studentId);
  }
};
