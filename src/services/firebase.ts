import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  sendEmailVerification, 
  updateProfile
} from 'firebase/auth';

import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ReportItem } from '../data/androidMockData';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test Firestore Connection on Boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('DGMS Mine Safety DSS: Firestore client is offline or initializing.');
    }
  }
}
testConnection();

// Error Handling Infrastructure conforming to Eight Pillars
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// User Profile Interface
export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  createdAt: string;
  lastLoginAt: string;
  emailVerified: boolean;
  role?: string;
  designation?: string;
  miningZone?: string;
}

// ======================== AUTHENTICATION SERVICES ========================

/**
 * Register a new Mining Safety Officer / Engineer
 */
export async function registerUser(fullName: string, email: string, password: string): Promise<UserProfile> {
  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const user = userCredential.user;

  // Update Auth Profile Display Name
  await updateProfile(user, { displayName: fullName.trim() });

  // Send statutory email verification
  try {
    await sendEmailVerification(user);
  } catch (e) {
    console.warn('Could not send verification email immediately:', e);
  }

  const nowIso = new Date().toISOString();
  const profileData: UserProfile = {
    uid: user.uid,
    fullName: fullName.trim(),
    email: user.email || email.trim(),
    createdAt: nowIso,
    lastLoginAt: nowIso,
    emailVerified: user.emailVerified,
    role: 'Safety Officer',
    designation: 'Statutory Mining Safety Inspector',
    miningZone: 'Eastern Coalfields / DGMS Zone 1'
  };

  // Create isolated profile in Firestore under users/{uid}
  const userDocRef = doc(db, 'users', user.uid);
  try {
    await setDoc(userDocRef, profileData);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
  }

  return profileData;
}

/**
 * Log in an existing Mining Safety Officer
 */
export async function loginUser(email: string, password: string): Promise<UserProfile> {
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const user = userCredential.user;

  const nowIso = new Date().toISOString();
  const userDocRef = doc(db, 'users', user.uid);

  // Retrieve or create profile
  let profile: UserProfile;
  try {
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      profile = docSnap.data() as UserProfile;
      // Update lastLoginAt & emailVerified
      await updateDoc(userDocRef, {
        lastLoginAt: nowIso,
        emailVerified: user.emailVerified
      });
      profile.lastLoginAt = nowIso;
      profile.emailVerified = user.emailVerified;
    } else {
      // Create missing profile gracefully
      profile = {
        uid: user.uid,
        fullName: user.displayName || email.split('@')[0],
        email: user.email || email,
        createdAt: nowIso,
        lastLoginAt: nowIso,
        emailVerified: user.emailVerified,
        role: 'Safety Officer',
        designation: 'Mining Safety Engineer',
        miningZone: 'DGMS Regional Inspection Unit'
      };
      await setDoc(userDocRef, profile);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
  }

  return profile;
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Resend email verification
 */
export async function resendVerificationEmail(): Promise<void> {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  } else {
    throw new Error('No authenticated user session found.');
  }
}

/**
 * Sign out user and clear state
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Fetch current user profile
 */
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const userDocRef = doc(db, 'users', uid);
  try {
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${uid}`);
  }
}

/**
 * Update user profile document in Firestore
 */
export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  const userDocRef = doc(db, 'users', uid);
  try {
    await updateDoc(userDocRef, updates);
    if (updates.fullName && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: updates.fullName });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
  }
}

/**
 * Retrieve active Firebase ID Token to send in HTTP Authorization headers
 */
export async function getCurrentUserIdToken(): Promise<string | null> {
  if (!auth.currentUser) return null;
  try {
    return await auth.currentUser.getIdToken(false);
  } catch (err) {
    console.error('Error fetching Firebase ID Token:', err);
    return null;
  }
}

// ======================== FIRESTORE REPORT STORAGE ========================

/**
 * Persist an incident analysis record into users/{userId}/reports/{reportId}
 */
export async function saveUserReport(userId: string, report: ReportItem): Promise<void> {
  const reportPath = `users/${userId}/reports/${report.id}`;
  const reportDocRef = doc(db, 'users', userId, 'reports', report.id);

  const payload = {
    reportId: report.id,
    userId: userId,
    reportName: report.title,
    sourceType: report.sourceType || 'manual_text',
    originalFileName: report.fileName || report.documentMetadata?.filename || '',
    documentFormat: report.documentMetadata?.file_format || (report.fileName?.endsWith('.pdf') ? 'PDF' : report.fileName?.endsWith('.docx') ? 'DOCX' : 'MANUAL'),
    createdAt: report.timestamp || new Date().toISOString(),
    riskScore: report.riskScore,
    safetyStatus: report.safetyStatus,
    statutoryForm: report.statutoryForm || (report.riskScore >= 70 ? 'Form IV-A' : report.riskScore >= 35 ? 'Form J' : 'Form K'),
    hazardCount: report.hazardCount,
    detectedHazards: report.hazards.map((h) => h.name),
    alerts: report.alerts || [],
    recommendations: report.recommendations || [],
    location: report.mineLocation || 'Underground Seam 3',
    documentMetadata: report.documentMetadata || null,
  };

  try {
    await setDoc(reportDocRef, payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, reportPath);
  }
}

/**
 * Retrieve all reports for the authenticated user, ordered by date descending
 */
export async function getUserReports(userId: string): Promise<ReportItem[]> {
  const reportsColRef = collection(db, 'users', userId, 'reports');
  const reportsQuery = query(reportsColRef, orderBy('createdAt', 'desc'));

  try {
    const snap = await getDocs(reportsQuery);
    const reports: ReportItem[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      
      // Map stored Firestore report back to ReportItem
      const item: ReportItem = {
        id: data.reportId || docSnap.id,
        title: data.reportName || 'Mining Incident Report',
        date: formatReportDate(data.createdAt),
        timestamp: data.createdAt,
        mineLocation: data.location || 'Underground Seam 3',
        shift: 'Active Surveillance Shift',
        safetyStatus: (data.safetyStatus as any) || 'LOW',
        riskScore: Number(data.riskScore) || 0,
        statutoryForm: (data.statutoryForm as any) || (Number(data.riskScore) >= 70 ? 'Form IV-A' : Number(data.riskScore) >= 35 ? 'Form J' : 'Form K'),
        hazardCount: Number(data.hazardCount) || 0,
        summary: `Stored statutory safety evaluation for ${data.reportName || 'Mining Incident'}.`,
        reportText: '',
        hazards: (data.detectedHazards || []).map((name: string, idx: number) => ({
          id: `h_${idx}`,
          name: name,
          categoryCode: 'CMR-2017',
          icon: '⚠️',
          shortDescription: `Statutory hazard category detected under DGMS regulations.`,
          severity: data.riskScore >= 70 ? 'CRITICAL' : data.riskScore >= 35 ? 'DANGER' : 'WARNING',
          consequences: ['Potential statutory non-compliance or occupational hazard.'],
          safetyPrecautions: ['Adhere strictly to DGMS guidelines.'],
          recommendations: [`Follow standard safety operating procedure for ${name}.`],
          matchedKeyword: name
        })),
        alerts: data.alerts || [],
        recommendations: data.recommendations || [],
        sourceType: data.sourceType || 'manual_text',
        fileName: data.originalFileName || undefined,
        documentMetadata: data.documentMetadata || undefined
      };

      reports.push(item);
    });

    return reports;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `users/${userId}/reports`);
  }
}


/**
 * Delete a report belonging to the authenticated user
 */
export async function deleteUserReport(userId: string, reportId: string): Promise<void> {
  const reportPath = `users/${userId}/reports/${reportId}`;
  const reportDocRef = doc(db, 'users', userId, 'reports', reportId);

  try {
    await deleteDoc(reportDocRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, reportPath);
  }
}

function formatReportDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
}
