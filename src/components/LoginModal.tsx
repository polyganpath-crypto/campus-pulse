import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  KeyRound,
  GraduationCap,
  BookOpen,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  UserPlus,
  LogIn,
  RotateCcw,
  Loader2,
  Building,
  Hash
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  AuthError
} from 'firebase/auth';
import { auth } from '../firebase';
import { firebaseDbService } from '../services/firebaseDbService';

const DEMO_ACCOUNTS: Record<
  string,
  {
    pass: string;
    role: 'student' | 'faculty' | 'admin';
    name: string;
    department: string;
    designation?: string;
    cabinLocation?: string;
    rollNumber?: string;
    semester?: number;
    section?: string;
    assignedClass?: string;
  }
> = {
  'student@campus.edu': {
    pass: 'student@123',
    role: 'student',
    name: 'Likith E.',
    department: 'Computer Science & Engineering',
    rollNumber: '22CS084',
    semester: 6,
    section: 'Section A'
  },
  'faculty@campus.edu': {
    pass: 'faculty@123',
    role: 'faculty',
    name: 'Dr. Priya Swaminathan',
    department: 'Computer Science & Engineering',
    designation: 'Associate Professor & Class Mentor',
    cabinLocation: 'Cabin #204, Tech Tower',
    assignedClass: 'CSE-A'
  },
  'admin.examcell@campus.edu': {
    pass: 'admin@123',
    role: 'admin',
    name: 'Dr. S. Narayanan',
    department: 'Examination Cell & Student Records Directorate',
    designation: 'Chief Controller of Examinations & Academic Records',
    cabinLocation: 'Academic Administrative Block - Chamber 104'
  }
};

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  initialRole?: UserRole;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialRole = 'student'
}) => {
  // Mode: 'signin' | 'signup' | 'forgot-password'
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot-password'>('signin');

  // Role
  const [selectedRole, setSelectedRole] = useState<'student' | 'faculty' | 'admin'>(
    initialRole === 'admin' ? 'admin' : initialRole === 'faculty' ? 'faculty' : 'student'
  );

  // Common Form Fields
  const [email, setEmail] = useState<string>('student@campus.edu');
  const [password, setPassword] = useState<string>('student@123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Sign Up Specific Fields
  const [fullName, setFullName] = useState<string>('Likith E.');
  const [rollNumber, setRollNumber] = useState<string>('22CS084');
  const [department, setDepartment] = useState<string>('Computer Science & Engineering');
  const [semester, setSemester] = useState<number>(6);
  const [section, setSection] = useState<string>('Section A');
  const [designation, setDesignation] = useState<string>('Associate Professor & Mentor');
  const [cabinLocation, setCabinLocation] = useState<string>('Cabin #204, Tech Tower');

  // Forgot password field
  const [resetEmail, setResetEmail] = useState<string>('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // Status & Feedback
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Handle redirect result when component mounts (in case of redirect auth fallback)
  useEffect(() => {
    let isMounted = true;
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user && isMounted) {
          const fbUser = result.user;
          let profile: UserProfile | null = null;
          try {
            profile = await firebaseDbService.getUserProfile(fbUser.uid);
          } catch (profileErr) {
            console.warn('Could not read existing profile after redirect:', profileErr);
          }
          if (!profile) {
            const emailVal = fbUser.email?.toLowerCase() || '';
            const isAdmin = selectedRole === 'admin' || emailVal.includes('admin') || emailVal === 'kotlasaikarthik81@gmail.com' || emailVal === 'polyganpath@gmail.com';
            const isFaculty = selectedRole === 'faculty' || emailVal.includes('faculty') || emailVal.includes('priya') || emailVal.includes('hod');
            profile = {
              id: fbUser.uid,
              uid: fbUser.uid,
              name: fbUser.displayName || 'CampusPulse User',
              email: fbUser.email || '',
              role: isAdmin ? 'admin' : isFaculty ? 'faculty' : 'student',
              department: isAdmin
                ? 'Examination Cell & Student Records Directorate'
                : 'Computer Science & Engineering',
              avatarUrl: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
              year: '3rd Year (VI Semester)',
              section: 'Section A',
              createdAt: new Date().toISOString(),
              ...(isAdmin
                ? {
                    designation: 'Chief Controller of Examinations & Academic Records',
                    cabinLocation: 'Academic Administrative Block - Chamber 104'
                  }
                : isFaculty
                ? {
                    designation: 'Associate Professor & Class Mentor',
                    cabinLocation: 'Cabin #204, Tech Tower'
                  }
                : {
                    rollNumber: '22CS084',
                    semester: 6,
                    section: 'Section A'
                  })
            };
            try {
              await firebaseDbService.saveUserProfile(profile);
            } catch (saveErr) {
              console.warn('Could not save user profile after redirect sign-in:', saveErr);
            }
          }
          if (rememberMe) {
            try {
              localStorage.setItem('campus_user_session', JSON.stringify(profile));
            } catch {
              // ignore
            }
          }
          onLoginSuccess(profile);
          onClose();
        }
      })
      .catch((err) => {
        console.error('getRedirectResult error in LoginModal:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isOpen) return null;

  // Format Firebase Auth errors into friendly explanations
  const parseAuthError = (err: unknown): string => {
    if (!err) return 'An unexpected error occurred.';
    const authError = err as AuthError;
    const code = authError?.code || '';
    const rawMsg = authError?.message || String(err);

    // Always log the full error code and message for debugging
    console.error(`Firebase Auth error [${code}]:`, rawMsg, err);

    // If it's a JSON string from Firestore error handler, extract message without returning false success
    if (rawMsg.trim().startsWith('{') && rawMsg.includes('"error":')) {
      try {
        const parsed = JSON.parse(rawMsg);
        if (parsed.error && typeof parsed.error === 'string') {
          return parsed.error;
        }
      } catch {
        // ignore
      }
    }

    switch (code) {
      case 'auth/operation-not-allowed':
        return 'Email/Password sign-in is not enabled in Firebase Console. Enable it under Authentication > Sign-in method.';
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized. Add it under Firebase Authentication > Settings > Authorized domains.';
      case 'auth/popup-blocked':
      case 'auth/cancelled-popup-request':
        return 'Popup was blocked. Allow popups or open the app in a new tab.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact the campus administrator.';
      case 'auth/invalid-api-key':
        return 'Invalid API key. Please check your Firebase configuration.';
      case 'auth/internal-error':
        return 'An internal authentication error occurred. Please try again.';
      case 'auth/invalid-email':
        return 'Please provide a valid institutional email address.';
      case 'auth/user-not-found':
        return 'No account exists with this email. Please click "Create Account" above to register.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password. Please verify your credentials or reset your password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please switch to Sign In.';
      case 'auth/weak-password':
        return 'The password is too weak. Please choose at least 6 characters.';
      case 'auth/too-many-requests':
        return 'Access temporarily blocked due to multiple failed login attempts. Please try again in a few moments.';
      case 'auth/network-request-failed':
        return 'Network connection error. Please check your internet connectivity.';
      case 'auth/popup-closed-by-user':
        return 'Google Sign-In popup was closed before completing.';
      default:
        return authError.message || 'Authentication error. Please check your credentials.';
    }
  };

  const handleRoleSelect = (role: 'student' | 'faculty' | 'admin') => {
    setSelectedRole(role);
    setError(null);
    // Only update role-specific template fields for sign-up, do NOT overwrite the user's custom email and password
    if (role === 'student') {
      if (!fullName || fullName === 'Dr. Priya Swaminathan' || fullName === 'Dr. S. Narayanan') {
        setFullName('Likith E.');
      }
      setRollNumber('22CS084');
      setDepartment('Computer Science & Engineering');
    } else if (role === 'faculty') {
      if (!fullName || fullName === 'Likith E.' || fullName === 'Dr. S. Narayanan') {
        setFullName('Dr. Priya Swaminathan');
      }
      setDesignation('Associate Professor & Class Mentor');
      setDepartment('Computer Science & Engineering');
      setCabinLocation('Cabin #204, Tech Tower');
    } else {
      if (!fullName || fullName === 'Likith E.' || fullName === 'Dr. Priya Swaminathan') {
        setFullName('Dr. S. Narayanan');
      }
      setDesignation('Chief Controller of Examinations & Academic Records');
      setDepartment('Examination Cell & Student Records Directorate');
      setCabinLocation('Academic Administrative Block - Chamber 104');
    }
  };

  // Helper to explicitly fill demo credentials upon user request
  const handleQuickFillDemo = (role: 'student' | 'faculty' | 'admin') => {
    setSelectedRole(role);
    setError(null);
    if (role === 'student') {
      setEmail('student@campus.edu');
      setPassword('student@123');
      setFullName('Likith E.');
      setRollNumber('22CS084');
      setDepartment('Computer Science & Engineering');
    } else if (role === 'faculty') {
      setEmail('faculty@campus.edu');
      setPassword('faculty@123');
      setFullName('Dr. Priya Swaminathan');
      setDesignation('Associate Professor & Class Mentor');
      setDepartment('Computer Science & Engineering');
      setCabinLocation('Cabin #204, Tech Tower');
    } else {
      setEmail('admin.examcell@campus.edu');
      setPassword('admin@123');
      setFullName('Dr. S. Narayanan');
      setDesignation('Chief Controller of Examinations & Academic Records');
      setDepartment('Examination Cell & Student Records Directorate');
      setCabinLocation('Academic Administrative Block - Chamber 104');
    }
  };

  // Convert roll number or shorthand to valid email if student entered PRN
  const sanitizeEmailInput = (raw: string): string => {
    const trimmed = raw.trim().toLowerCase();
    if (trimmed.includes('@')) {
      return trimmed;
    }
    // If entered roll number like 22CS084
    return `${trimmed}@campus.edu`;
  };

  // 1. Email & Password Sign In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const targetEmail = sanitizeEmailInput(email);
    const targetPassword = password.trim();

    if (!targetEmail) {
      setError('Please enter your institutional email address.');
      setLoading(false);
      return;
    }

    if (!targetPassword) {
      setError('Please enter your account password.');
      setLoading(false);
      return;
    }

    try {
      let fbUser;
      try {
        const userCred = await signInWithEmailAndPassword(auth, targetEmail, targetPassword);
        fbUser = userCred.user;
      } catch (signInErr: any) {
        const errCode = signInErr?.code;
        const demoConfig = DEMO_ACCOUNTS[targetEmail];

        // Requirement 3: If error is auth/user-not-found or auth/invalid-credential
        // AND email is one of the demo accounts with its demo password,
        // automatically call createUserWithEmailAndPassword with the same credentials,
        // save the profile with the matching role, and then sign the user in.
        if (
          (errCode === 'auth/user-not-found' || errCode === 'auth/invalid-credential') &&
          demoConfig &&
          demoConfig.pass === targetPassword
        ) {
          console.warn(
            `Demo account ${targetEmail} not found in Firebase Auth; auto-creating with demo credentials...`
          );
          try {
            const createCred = await createUserWithEmailAndPassword(auth, targetEmail, targetPassword);
            fbUser = createCred.user;
            await updateProfile(fbUser, { displayName: demoConfig.name }).catch((updateErr) => {
              console.warn('Could not update demo user displayName in Firebase Auth:', updateErr);
            });
          } catch (createErr) {
            console.error('Failed to auto-create demo account:', createErr);
            throw createErr;
          }
        } else {
          throw signInErr;
        }
      }

      // Check Firestore profile
      let profile: UserProfile | null = null;
      try {
        profile = await firebaseDbService.getUserProfile(fbUser.uid);
      } catch (profileErr) {
        console.warn('Could not read existing profile from Firestore:', profileErr);
      }

      if (!profile) {
        const demoConfig = DEMO_ACCOUNTS[targetEmail];
        const isAdmin =
          (demoConfig && demoConfig.role === 'admin') ||
          selectedRole === 'admin' ||
          targetEmail.includes('admin') ||
          targetEmail === 'kotlasaikarthik81@gmail.com' ||
          targetEmail === 'polyganpath@gmail.com';
        const isFaculty =
          (demoConfig && demoConfig.role === 'faculty') ||
          selectedRole === 'faculty' ||
          targetEmail.includes('faculty') ||
          targetEmail.includes('priya') ||
          targetEmail.includes('hod');
        const role: UserRole = isAdmin ? 'admin' : isFaculty ? 'faculty' : 'student';

        profile = {
          id: fbUser.uid,
          uid: fbUser.uid,
          name: demoConfig?.name || fbUser.displayName || fullName || targetEmail.split('@')[0],
          email: targetEmail,
          role,
          department: demoConfig?.department || (isAdmin ? 'Examination Cell & Student Records Directorate' : department),
          avatarUrl:
            fbUser.photoURL ||
            (isAdmin
              ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
              : isFaculty
              ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
              : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'),
          year: '3rd Year (VI Semester)',
          section: demoConfig?.section || section || 'Section A',
          createdAt: new Date().toISOString(),
          ...(isAdmin
            ? {
                designation: demoConfig?.designation || 'Chief Controller of Examinations & Academic Records',
                cabinLocation: demoConfig?.cabinLocation || 'Academic Administrative Block - Chamber 104'
              }
            : isFaculty
            ? {
                designation: demoConfig?.designation || (designation ? designation : 'Associate Professor & Class Mentor'),
                cabinLocation: demoConfig?.cabinLocation || (cabinLocation ? cabinLocation : 'Cabin #204, Tech Tower'),
                assignedClass: demoConfig?.assignedClass || 'CSE-A'
              }
            : {
                rollNumber: demoConfig?.rollNumber || rollNumber || '22CS084',
                semester: demoConfig?.semester || semester || 6,
                section: demoConfig?.section || section || 'Section A'
              })
        };

        // Requirement 6: A Firestore error must not block login!
        try {
          await firebaseDbService.saveUserProfile(profile);
        } catch (saveErr) {
          console.warn('Could not save user profile to Firestore (continuing with local profile):', saveErr);
        }
      }

      setSuccessToast(`Welcome back, ${profile.name}! Signed in successfully.`);

      if (rememberMe) {
        try {
          localStorage.setItem('campus_user_session', JSON.stringify(profile));
        } catch {
          // ignore
        }
      }

      setTimeout(() => {
        setLoading(false);
        onLoginSuccess(profile!);
        onClose();
      }, 500);
    } catch (err) {
      setLoading(false);
      setError(parseAuthError(err));
    }
  };

  // 2. Email & Password Sign Up (Registration)
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const targetEmail = sanitizeEmailInput(email);
    const targetPassword = password.trim();

    if (!fullName.trim()) {
      setError('Please provide your full institutional name.');
      setLoading(false);
      return;
    }

    if (!targetEmail) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (targetPassword.length < 6) {
      setError('Password must contain at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, targetEmail, targetPassword);
      const fbUser = userCred.user;

      await updateProfile(fbUser, {
        displayName: fullName.trim()
      }).catch((updateErr) => {
        console.warn('Could not update Auth displayName:', updateErr);
      });

      const isAdmin = selectedRole === 'admin' || targetEmail.includes('admin') || targetEmail === 'kotlasaikarthik81@gmail.com' || targetEmail === 'polyganpath@gmail.com';
      const isFaculty = selectedRole === 'faculty' || targetEmail.includes('faculty') || targetEmail.includes('priya') || targetEmail.includes('hod');

      const newProfile: UserProfile = {
        id: fbUser.uid,
        uid: fbUser.uid,
        name: fullName.trim(),
        email: targetEmail,
        role: isAdmin ? 'admin' : isFaculty ? 'faculty' : 'student',
        department: selectedRole === 'admin' ? 'Examination Cell & Student Records Directorate' : department,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        year: '3rd Year (VI Semester)',
        section: section || 'Section A',
        createdAt: new Date().toISOString(),
        ...(isAdmin
          ? {
              designation: 'Chief Controller of Examinations & Academic Records',
              cabinLocation: 'Academic Administrative Block - Chamber 104'
            }
          : isFaculty
          ? {
              ...(designation ? { designation } : { designation: 'Associate Professor & Mentor' }),
              ...(cabinLocation ? { cabinLocation } : { cabinLocation: 'Cabin #204, Tech Tower' })
            }
          : {
              rollNumber: rollNumber.trim().toUpperCase() || '22CS084',
              semester: semester || 6,
              section: section || 'Section A',
              batch: '2022-2026'
            })
      };

      try {
        await firebaseDbService.saveUserProfile(newProfile);
      } catch (saveErr) {
        console.warn('Could not save new user profile to Firestore (continuing with local profile):', saveErr);
      }

      setSuccessToast(`Account created successfully for ${newProfile.name}! Logging you in...`);

      if (rememberMe) {
        try {
          localStorage.setItem('campus_user_session', JSON.stringify(newProfile));
        } catch {
          // ignore
        }
      }

      setTimeout(() => {
        setLoading(false);
        onLoginSuccess(newProfile);
        onClose();
      }, 500);
    } catch (err) {
      setLoading(false);
      setError(parseAuthError(err));
    }
  };

  // 3. Password Reset
  const handleSendPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSuccessMessage(null);
    setLoading(true);

    const targetEmail = sanitizeEmailInput(resetEmail || email);
    if (!targetEmail) {
      setError('Please provide your registered email address.');
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setLoading(false);
      setResetSuccessMessage(`A password reset link has been dispatched to ${targetEmail}. Please check your inbox.`);
    } catch (err) {
      setLoading(false);
      setError(parseAuthError(err));
    }
  };

  // 4. Google SSO
  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      let fbUser;
      try {
        const result = await signInWithPopup(auth, provider);
        fbUser = result.user;
      } catch (popupErr: any) {
        if (
          popupErr?.code === 'auth/popup-blocked' ||
          popupErr?.code === 'auth/cancelled-popup-request'
        ) {
          console.warn('Google Sign-In popup was blocked. Falling back to signInWithRedirect...', popupErr);
          await signInWithRedirect(auth, provider);
          return;
        }
        throw popupErr;
      }

      const emailVal = fbUser.email?.toLowerCase() || '';
      const isAdmin = selectedRole === 'admin' || emailVal.includes('admin') || emailVal === 'kotlasaikarthik81@gmail.com' || emailVal === 'polyganpath@gmail.com';
      const isFaculty = selectedRole === 'faculty' || emailVal.includes('faculty') || emailVal.includes('priya') || emailVal.includes('hod');

      let profile: UserProfile | null = null;
      try {
        profile = await firebaseDbService.getUserProfile(fbUser.uid);
      } catch (profileErr) {
        console.warn('Could not read existing profile after Google sign-in:', profileErr);
      }

      if (!profile) {
        profile = {
          id: fbUser.uid,
          uid: fbUser.uid,
          name: fbUser.displayName || 'CampusPulse User',
          email: fbUser.email || '',
          role: isAdmin ? 'admin' : isFaculty ? 'faculty' : 'student',
          department: isAdmin
            ? 'Examination Cell & Student Records Directorate'
            : 'Computer Science & Engineering',
          avatarUrl: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
          year: '3rd Year (VI Semester)',
          section: 'Section A',
          createdAt: new Date().toISOString(),
          ...(isAdmin
            ? {
                designation: 'Chief Controller of Examinations & Academic Records',
                cabinLocation: 'Academic Administrative Block - Chamber 104'
              }
            : isFaculty
            ? {
                designation: 'Associate Professor & Class Mentor',
                cabinLocation: 'Cabin #204, Tech Tower'
              }
            : {
                rollNumber: '22CS084',
                semester: 6,
                section: 'Section A'
              })
        };

        try {
          await firebaseDbService.saveUserProfile(profile);
        } catch (saveErr) {
          console.warn('Could not save Google user profile to Firestore (continuing with local profile):', saveErr);
        }
      }

      setSuccessToast(`Authenticated via Google as ${profile.name}!`);

      if (rememberMe) {
        try {
          localStorage.setItem('campus_user_session', JSON.stringify(profile));
        } catch {
          // ignore
        }
      }

      setTimeout(() => {
        setLoading(false);
        onLoginSuccess(profile!);
        onClose();
      }, 500);
    } catch (err: unknown) {
      setLoading(false);
      setError(parseAuthError(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Firebase Authentication
                </span>
                <span className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Email/Password Enabled
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                {authMode === 'signin'
                  ? 'Sign In to CampusPulse'
                  : authMode === 'signup'
                  ? 'Create New Campus Account'
                  : 'Reset Account Password'}
              </h2>
            </div>
          </div>

          <p className="text-xs text-indigo-200">
            {authMode === 'signin'
              ? 'Enter your institutional email & password to access academic portals.'
              : authMode === 'signup'
              ? 'Register with your student, faculty, or administrative credentials.'
              : 'Enter your email to receive a secure password reset link.'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="mt-4 flex rounded-xl bg-white/10 p-1 border border-white/10 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMode === 'signin' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-200 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMode === 'signup' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-200 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Feedback Banners */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {successToast && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successToast}</span>
            </div>
          )}

          {resetSuccessMessage && (
            <div className="p-3.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
              <span>{resetSuccessMessage}</span>
            </div>
          )}

          {/* Role Selection Picker (for Sign In & Sign Up) */}
          {authMode !== 'forgot-password' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Select Portal Account Role:
              </label>

              <div className="grid grid-cols-3 gap-2">
                {/* Student */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('student')}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedRole === 'student'
                      ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-950'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-1.5 rounded-lg ${
                      selectedRole === 'student' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      <GraduationCap className="w-3.5 h-3.5" />
                    </div>
                    {selectedRole === 'student' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                  </div>
                  <div className="mt-2 text-xs font-bold">Student</div>
                </button>

                {/* Faculty */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('faculty')}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedRole === 'faculty'
                      ? 'bg-amber-50 border-amber-600 ring-2 ring-amber-500/20 text-amber-950'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-1.5 rounded-lg ${
                      selectedRole === 'faculty' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    {selectedRole === 'faculty' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                  </div>
                  <div className="mt-2 text-xs font-bold">Faculty</div>
                </button>

                {/* Admin */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('admin')}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedRole === 'admin'
                      ? 'bg-purple-50 border-purple-600 ring-2 ring-purple-500/20 text-purple-950'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-1.5 rounded-lg ${
                      selectedRole === 'admin' ? 'bg-purple-700 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    {selectedRole === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                  </div>
                  <div className="mt-2 text-xs font-bold">Admin</div>
                </button>
              </div>

              {/* Quick Fill Demo Helper (explicitly separated so users know they can enter their own credentials) */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-medium text-slate-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Demo Quick Fill:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickFillDemo('student')}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 transition-colors text-[10px] font-semibold cursor-pointer"
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFillDemo('faculty')}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200 transition-colors text-[10px] font-semibold cursor-pointer"
                  >
                    Faculty
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFillDemo('admin')}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 transition-colors text-[10px] font-semibold cursor-pointer"
                  >
                    Admin
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 1. SIGN IN FORM                                           */}
          {/* ========================================================= */}
          {authMode === 'signin' && (
            <form onSubmit={handleEmailSignIn} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address or Roll Number:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    placeholder="e.g. student@campus.edu or 22CS084"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Password:</label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setAuthMode('forgot-password');
                      setError(null);
                    }}
                    className="text-[11px] text-indigo-600 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-indigo-600 rounded"
                  />
                  <span>Remember this terminal</span>
                </label>

                <span className="flex items-center gap-1 text-emerald-600 text-[11px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Firebase Secured
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In with Email &amp; Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* 2. SIGN UP FORM (CREATE ACCOUNT)                          */}
          {/* ========================================================= */}
          {authMode === 'signup' && (
            <form onSubmit={handleEmailSignUp} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    placeholder="e.g. Likith E. or Dr. Priya Swaminathan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Institutional Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    placeholder="e.g. likith.e@campus.edu or student@campus.edu"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Create Password (minimum 6 characters) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Student Specific Fields */}
              {selectedRole === 'student' && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Roll Number / PRN *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                        <Hash className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        className="w-full pl-8 text-xs p-2 rounded-xl border border-slate-300 uppercase"
                        placeholder="22CS084"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Semester *
                    </label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(Number(e.target.value))}
                      className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Department */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Department / Branch *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Building className="w-3.5 h-3.5" />
                  </div>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-8 text-xs p-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Computer Science & Engineering">Computer Science &amp; Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics &amp; Communication</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Electrical & Electronics">Electrical &amp; Electronics</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                </div>
              </div>

              {/* Faculty Specific Fields */}
              {selectedRole === 'faculty' && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Designation *
                    </label>
                    <input
                      type="text"
                      required
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-300"
                      placeholder="Associate Professor"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Cabin Location
                    </label>
                    <input
                      type="text"
                      value={cabinLocation}
                      onChange={(e) => setCabinLocation(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-300"
                      placeholder="Cabin #204"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account in Firebase Auth...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account &amp; Enter Portal</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* 3. FORGOT PASSWORD FLOW                                   */}
          {/* ========================================================= */}
          {authMode === 'forgot-password' && (
            <form onSubmit={handleSendPasswordReset} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enter Your Registered Email:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-9 text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    placeholder="student@campus.edu"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending link...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      <span>Send Reset Link</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setError(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center my-1">
            <div className="flex-1 border-t border-slate-200" />
            <span className="px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">or</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Google Sign In SSO */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-xs cursor-pointer hover:border-indigo-400 disabled:opacity-70"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google (SSO)</span>
          </button>

          {/* Quick Demo Autofill Bar */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Quick Fill Credentials:
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  handleRoleSelect('student');
                }}
                className="p-2 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 text-left cursor-pointer transition-colors"
              >
                <div className="font-bold text-slate-900 text-[11px]">🎓 Student</div>
                <div className="text-[10px] text-indigo-700 font-semibold truncate">student@campus.edu</div>
                <div className="text-[9px] text-slate-400 font-mono">student@123</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  handleRoleSelect('faculty');
                }}
                className="p-2 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 text-left cursor-pointer transition-colors"
              >
                <div className="font-bold text-slate-900 text-[11px]">🏛️ Faculty</div>
                <div className="text-[10px] text-amber-800 font-semibold truncate">faculty@campus.edu</div>
                <div className="text-[9px] text-slate-400 font-mono">faculty@123</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  handleRoleSelect('admin');
                }}
                className="p-2 rounded-xl bg-white hover:bg-purple-50 border border-slate-200 text-left cursor-pointer transition-colors"
              >
                <div className="font-bold text-slate-900 text-[11px]">🛡️ Exam Cell</div>
                <div className="text-[10px] text-purple-800 font-semibold truncate">admin.examcell@campus.edu</div>
                <div className="text-[9px] text-slate-400 font-mono">admin@123</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
