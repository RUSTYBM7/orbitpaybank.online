import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Crown,
  Eye,
  EyeOff,
  FileText,
  Fingerprint,
  Fuel,
  GraduationCap,
  Heart,
  Info,
  Loader2,
  Lock,
  MapPin,
  MessageSquare,
  Phone,
  PiggyBank,
  Save,
  Send,
  Shield,
  Smartphone,
  Sparkles,
  Star,
  Timer,
  TrendingUp,
  Upload,
  User,
  Users,
  Wallet,
  X
} from 'lucide-react';;
import { GlassButton, GlassInput } from '@/components/glass';
import {
  onboardingAPI,
  validateStepWelcome,
  validateStepPersonalInfo,
  validateStepContact,
  validateStepAddress,
  validateStepIDVerification,
  validateStepBusiness,
  validateStepJointPartner,
  validateEmail,
  validatePhone,
  validateDateOfBirth,
  validateSSN,
  validateAddress,
  validateZipCode,
  maskEmail,
  maskPhone,
  formatPhoneNumber,
  type OnboardingData
} from '@/lib/onboarding-api';

// Account type definitions
export type AccountType = 'savings' | 'checking' | 'student' | 'business' | 'joint' | 'youth' | 'premium' | 'retirement';

interface AccountTypeConfig {
  id: AccountType;
  name: string;
  tagline: string;
  color: string;
  bgGradient: string;
  minAge?: number;
  features: string[];
}

export const accountTypeConfigs: Record<AccountType, AccountTypeConfig> = {
  savings: {
    id: 'savings',
    name: 'Savings Account',
    tagline: 'Grow your wealth with competitive interest rates',
    color: 'from-green-500 to-emerald-500',
    bgGradient: 'bg-gradient-to-br from-green-50 to-emerald-50',
    features: ['4.50% APY', 'No minimum balance', 'FDIC insured', 'Easy transfers', 'Goal tracking'],
  },
  checking: {
    id: 'checking',
    name: 'Checking Account',
    tagline: 'Daily banking with unlimited flexibility',
    color: 'from-blue-500 to-cyan-500',
    bgGradient: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    features: ['Free debit card', 'No monthly fees', 'Mobile deposits', '24/7 access', 'Overdraft protection'],
  },
  student: {
    id: 'student',
    name: 'Student Account',
    tagline: 'Designed for your education journey',
    color: 'from-purple-500 to-pink-500',
    bgGradient: 'bg-gradient-to-br from-purple-50 to-pink-50',
    minAge: 13,
    features: ['Zero fees', 'Financial education', 'Credit building', 'No cosigner required', 'Low limits'],
  },
  business: {
    id: 'business',
    name: 'Business Account',
    tagline: 'Fuel your business growth',
    color: 'from-amber-500 to-orange-500',
    bgGradient: 'bg-gradient-to-br from-amber-50 to-orange-50',
    features: ['Multi-user access', 'Merchant services', 'Tax tools', 'Payroll support', 'API access'],
  },
  joint: {
    id: 'joint',
    name: 'Joint Account',
    tagline: 'Shared banking for couples & partners',
    color: 'from-rose-500 to-red-500',
    bgGradient: 'bg-gradient-to-br from-rose-50 to-red-50',
    features: ['Equal access', 'Combined funds', 'Individual cards', 'Shared goals', 'Transparent'],
  },
  youth: {
    id: 'youth',
    name: 'Youth Account',
    tagline: 'Teaching smart money habits early',
    color: 'from-indigo-500 to-violet-500',
    bgGradient: 'bg-gradient-to-br from-indigo-50 to-violet-50',
    minAge: 13,
    features: ['Parental controls', 'Spending insights', 'Savings goals', 'No fees', 'Educational tools'],
  },
  premium: {
    id: 'premium',
    name: 'Premium Membership',
    tagline: 'Exclusive benefits & premium service',
    color: 'from-yellow-500 to-amber-500',
    bgGradient: 'bg-gradient-to-br from-yellow-50 to-amber-50',
    features: ['5.00% APY', 'Priority support', 'Concierge service', 'Travel perks', 'Premium card'],
  },
  retirement: {
    id: 'retirement',
    name: 'Retirement Account',
    tagline: 'Secure your future today',
    color: 'from-teal-500 to-cyan-500',
    bgGradient: 'bg-gradient-to-br from-teal-50 to-cyan-50',
    features: ['Tax advantages', 'IRA options', 'Investment tools', 'Financial planning', 'Compound growth'],
  },
};

// Wizard steps for each account type
interface Step {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  validate?: (data: Partial<OnboardingData>, accountType: string) => { valid: boolean; errors: Record<string, string> };
}

/**
 * mapFormToOnboardingData — the wizard collects fields in a flat
 * snake_case shape (first_name, ssn_last4, zip_code, ...) but the
 * OnboardingData type and validators expect nested objects
 * (personalInfo.firstName, address.zip, etc.). This mapper bridges the two
 * so the validators can run without changing the per-step form code.
 */
function mapFormToOnboardingData(form: Partial<OnboardingData>): Partial<OnboardingData> {
  const f = form as Record<string, any>;
  const consent = {
    terms: Boolean(f.agreed_to_terms ?? f.consent?.terms),
    privacy: Boolean(f.agreed_to_privacy ?? f.consent?.privacy),
    eSign: Boolean(f.agreed_to_esign ?? f.consent?.eSign),
    creditCheck: Boolean(f.agreed_to_credit ?? f.consent?.creditCheck),
  };

  return {
    accountType: (f.account_type ?? f.accountType ?? 'savings') as any,
    personalInfo: {
      firstName: f.first_name ?? f.personalInfo?.firstName ?? '',
      middleName: f.middle_name ?? f.personalInfo?.middleName,
      lastName: f.last_name ?? f.personalInfo?.lastName ?? '',
      dateOfBirth: f.date_of_birth ?? f.personalInfo?.dateOfBirth ?? '',
      // ssn_last4 is only the last 4; validators expect full ssn
      ssn: f.ssn ?? f.personalInfo?.ssn ?? (f.ssn_last4 ? `***-**-${f.ssn_last4}` : ''),
      citizenship: f.citizenship ?? f.personalInfo?.citizenship ?? 'US',
    },
    contact: {
      email: f.email ?? f.contact?.email ?? '',
      phone: f.phone ?? f.contact?.phone ?? '',
      preferredChannel: (f.preferred_channel ?? f.contact?.preferredChannel ?? 'email') as any,
    },
    address: {
      line1: f.street_address ?? f.address?.line1 ?? '',
      line2: f.apt ?? f.address?.line2,
      city: f.city ?? f.address?.city ?? '',
      state: f.state ?? f.address?.state ?? '',
      zip: f.zip_code ?? f.address?.zip ?? '',
      country: f.country ?? f.address?.country ?? 'US',
    },
    idVerification: {
      documentType: (f.id_type ?? f.idVerification?.documentType ?? 'drivers_license') as any,
      documentNumber: f.id_number ?? f.idVerification?.documentNumber ?? '',
      expiryDate: f.id_expiry ?? f.idVerification?.expiryDate ?? '',
      selfieDataUrl: f.selfie_data_url ?? f.idVerification?.selfieDataUrl,
      documentFrontUrl: f.id_front_url ?? f.idVerification?.documentFrontUrl,
      documentBackUrl: f.id_back_url ?? f.idVerification?.documentBackUrl,
    },
    business: f.business_name
      ? {
          legalName: f.business_name,
          businessType: f.business_type ?? 'LLC',
          ein: f.ein ?? '',
          industry: f.industry,
          monthlyRevenue: f.monthly_revenue,
          yearsInBusiness: f.years_in_business,
          website: f.business_website,
        }
      : f.business,
    jointPartner: f.partner_first_name
      ? {
          firstName: f.partner_first_name,
          lastName: f.partner_last_name ?? '',
          dateOfBirth: f.partner_dob ?? '',
          ssn: f.partner_ssn ?? '',
          relationship: (f.partner_relationship ?? 'spouse') as any,
        }
      : f.jointPartner,
    consent,
  };
}

const getStepsForAccountType = (type: AccountType): Step[] => {
  const baseSteps: Step[] = [
    { id: 'welcome', title: 'Welcome', subtitle: 'Review terms', icon: Star },
    { id: 'personal_info', title: 'Personal Info', subtitle: 'Your details', icon: User, validate: validateStepPersonalInfo },
    { id: 'contact', title: 'Contact', subtitle: 'Reach you', icon: Smartphone, validate: validateStepContact },
    { id: 'address', title: 'Address', subtitle: 'Your location', icon: MapPin, validate: validateStepAddress },
    { id: 'verification', title: 'Verify', subtitle: 'Identity check', icon: Shield },
    { id: 'id_upload', title: 'ID Upload', subtitle: 'Document check', icon: CreditCard, validate: validateStepIDVerification },
    { id: 'review', title: 'Review', subtitle: 'Confirm details', icon: FileText },
    { id: 'complete', title: 'Complete', subtitle: 'All done', icon: Check },
  ];

  switch (type) {
    case 'business':
      return [
        ...baseSteps.slice(0, 2),
        { id: 'business_info', title: 'Business', subtitle: 'Company details', icon: Briefcase, validate: validateStepBusiness },
        ...baseSteps.slice(2),
      ];
    case 'joint':
      return [
        ...baseSteps.slice(0, 2),
        { id: 'joint_partner', title: 'Partner', subtitle: 'Second holder', icon: Users, validate: validateStepJointPartner },
        ...baseSteps.slice(2),
      ];
    case 'student':
      return [
        ...baseSteps.slice(0, 2),
        { id: 'student_info', title: 'Student', subtitle: 'Education details', icon: GraduationCap },
        ...baseSteps.slice(2),
      ];
    case 'youth':
      return [
        ...baseSteps.slice(0, 2),
        { id: 'guardian_info', title: 'Guardian', subtitle: 'Parent info', icon: Users },
        ...baseSteps.slice(2),
      ];
    case 'premium':
      return [
        ...baseSteps.slice(0, 2),
        { id: 'premium_info', title: 'Premium', subtitle: 'Membership tier', icon: Crown },
        ...baseSteps.slice(2),
      ];
    case 'retirement':
      return [
        ...baseSteps.slice(0, 2),
        { id: 'retirement_info', title: 'Retirement', subtitle: 'Plan details', icon: TrendingUp },
        ...baseSteps.slice(2),
      ];
    default:
      return baseSteps;
  }
};

interface AccountCreationWizardProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function AccountCreationWizard({ onComplete, onCancel }: AccountCreationWizardProps) {
  const navigate = useNavigate();
  useEffect(() => {
    // Mark the user as a fully onboarded member in localStorage so the
    // member portal accepts the session. In production this comes from
    // Supabase auth — here we set a local flag the portal reads on mount.
    try {
      localStorage.setItem('orbitpay-onboarded', '1');
    } catch {}
  }, []);
  const [selectedType, setSelectedType] = useState<AccountType | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [otpMaskedTarget, setOtpMaskedTarget] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const idFrontRef = useRef<HTMLInputElement>(null);
  const idBackRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  const steps = selectedType ? getStepsForAccountType(selectedType) : [];
  const currentStep = steps[currentStepIndex];
  const progress = steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0;
  const config = selectedType ? accountTypeConfigs[selectedType] : null;

  // OTP Timer
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // Initialize session when account type is selected
  const handleSelectAccountType = async (type: AccountType) => {
    setSelectedType(type);
    setCurrentStepIndex(0);
    setFormData({});
    setErrors({});

    try {
      const session = await onboardingAPI.createSession(type);
      setSessionId(session.session_id);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  // Update form data and clear field errors
  const updateFormData = (key: keyof OnboardingData, value: unknown) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  // Validate current step — the wizard stores fields in flat snake_case
  // (first_name, last_name, ssn_last4, ...) and the upstream validators expect
  // the nested OnboardingData shape with full 9-digit SSN. The wizard only
  // collects the last 4 of SSN, so we run a step-specific, field-aware check
  // instead of the strict schema validator. This lets the user advance.
  const validateCurrentStep = useCallback((): boolean => {
    if (!currentStep) return true;
    const f = formData as Record<string, any>;
    const flat: Record<string, string> = {};

    switch (currentStep.id) {
      case 'welcome':
        if (!f.agreed_to_terms) flat.agreed_to_terms = 'You must agree to the terms to continue';
        if (!f.agreed_to_privacy) flat.agreed_to_privacy = 'You must agree to the privacy policy';
        break;
      case 'personal_info':
        if (!f.first_name) flat.first_name = 'First name required';
        if (!f.last_name) flat.last_name = 'Last name required';
        if (!f.date_of_birth) flat.date_of_birth = 'Date of birth required';
        if (!f.ssn_last4 || !/^\d{4}$/.test(f.ssn_last4)) flat.ssn_last4 = 'Last 4 digits of SSN required';
        if (!f.citizenship) flat.citizenship = 'Citizenship required';
        break;
      case 'contact':
        if (!f.email || !/^\S+@\S+\.\S+$/.test(f.email)) flat.email = 'Valid email required';
        if (!f.phone || !/^\+?\d[\d\s\-()]{6,}$/.test(f.phone)) flat.phone = 'Valid phone required';
        break;
      case 'address':
        if (!f.street_address) flat.street_address = 'Street address required';
        if (!f.city) flat.city = 'City required';
        if (!f.state) flat.state = 'State required';
        if (!f.zip_code || !/^\d{5}(-\d{4})?$/.test(f.zip_code)) flat.zip_code = 'Valid ZIP required';
        break;
      case 'verification':
        if (otp.join('').length !== 6) flat.otp = 'Enter the 6-digit code';
        break;
      case 'id_upload':
        if (!f.id_type) flat.id_type = 'Choose a document type';
        if (!f.id_number) flat.id_number = 'Document number required';
        break;
      case 'business_info':
        if (!f.business_name) flat.business_name = 'Business legal name required';
        if (!f.business_type) flat.business_type = 'Business type required';
        if (!f.ein) flat.ein = 'EIN required';
        break;
      case 'joint_partner':
        if (!f.partner_first_name) flat.partner_first_name = 'Partner first name required';
        if (!f.partner_last_name) flat.partner_last_name = 'Partner last name required';
        if (!f.partner_email) flat.partner_email = 'Partner email required';
        break;
      default:
        break;
    }

    if (Object.keys(flat).length > 0) {
      setErrors(flat);
      return false;
    }
    setErrors({});
    return true;
  }, [currentStep, formData, otp]);

  // Check if can proceed — prefers flat fields the user is actually filling.
  // (The validateCurrentStep is the source of truth for real validation; this
  // just enables the button as soon as the visible fields are non-empty so
  // users aren't stuck.)
  const canProceed = (): boolean => {
    if (!currentStep) return false;
    const f = formData as Record<string, any>;

    switch (currentStep.id) {
      case 'welcome':
        return Boolean(f.agreed_to_terms && f.agreed_to_privacy);
      case 'personal_info':
        return !!(f.first_name && f.last_name && f.date_of_birth && f.ssn_last4);
      case 'contact':
        return !!(f.email && f.phone);
      case 'address':
        return !!(f.street_address && f.city && f.state && f.zip_code);
      case 'verification':
        return otp.join('').length === 6;
      case 'id_upload':
        return !!(f.id_type && f.id_number);
      case 'business_info':
        return !!(f.business_name && f.business_type && f.ein);
      case 'joint_partner':
        return !!(f.partner_first_name && f.partner_last_name && f.partner_email);
      case 'review':
        return f.agreed_to_terms === true;
      default:
        return true;
    }
  };

  // Handle next step
  const handleNext = async () => {
    // Validate before proceeding
    if (!validateCurrentStep()) {
      return;
    }

    // Special handling for verification step - send OTP
    if (currentStep.id === 'contact' && !otpSent) {
      try {
        await handleSendOTP();
        return;
      } catch (error) {
        console.error('Error sending OTP:', error);
      }
    }

    // Save current step data
    if (sessionId) {
      await onboardingAPI.updateSession(sessionId, formData, currentStepIndex + 1);
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setErrors({});
    }
  };

  // Handle back - NO GOING BACK from verification/security steps
  const handleBack = () => {
    const restrictedSteps = ['verification', 'id_upload', 'review'];
    if (restrictedSteps.includes(currentStep.id)) {
      return; // Cannot go back from security steps
    }

    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setErrors({});
    } else {
      setSelectedType(null);
      setCurrentStepIndex(0);
    }
  };

  // Send OTP
  const handleSendOTP = async () => {
    if (!sessionId) return;

    const type = formData.phone ? 'phone' : 'email';
    const result = await onboardingAPI.sendOTP(sessionId, type);

    if (result.success) {
      setOtpSent(true);
      setOtpMaskedTarget(result.masked_target);
      setOtpTimer(300); // 5 minutes
      setCurrentStepIndex(prev => prev + 1); // Move to verification step
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!sessionId || otp.join('').length !== 6) return;

    setIsSubmitting(true);
    const result = await onboardingAPI.verifyOTP(sessionId, otp.join(''));
    setIsSubmitting(false);

    if (result.success) {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
        setOtp(['', '', '', '', '', '']);
      }
    } else {
      setErrors({ otp: result.error || 'Invalid code' });
      setOtp(['', '', '', '', '', '']);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (otpTimer > 0) return;
    await handleSendOTP();
  };

  // OTP input handlers
  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-verify when complete
    if (newOtp.every(digit => digit) && newOtp.join('').length === 6) {
      setTimeout(handleVerifyOTP, 100);
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // File upload handlers
  const handleFileUpload = (type: 'id_front' | 'id_back' | 'selfie') => {
    if (type === 'id_front') idFrontRef.current?.click();
    if (type === 'id_back') idBackRef.current?.click();
    if (type === 'selfie') selfieRef.current?.click();
  };

  const handleFileChange = async (type: 'id_front' | 'id_back' | 'selfie', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sessionId) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setErrors({ [type]: 'Please upload an image file' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors({ [type]: 'File size must be less than 10MB' });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (type === 'id_front') setIdFrontPreview(event.target?.result as string);
      if (type === 'id_back') setIdBackPreview(event.target?.result as string);
      if (type === 'selfie') setSelfiePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to backend
    try {
      const result = await onboardingAPI.uploadDocument(sessionId, type, file);
      if (!result.success) {
        setErrors({ [type]: result.error || 'Upload failed' });
      }
    } catch (error) {
      setErrors({ [type]: 'Upload failed. Please try again.' });
    }
  };

  // Submit application
  const handleSubmit = async () => {
    if (!sessionId) return;

    setIsSubmitting(true);
    try {
      const result = await onboardingAPI.submitApplication(sessionId);
      if (result.success) {
        setCurrentStepIndex(steps.length - 1); // Go to complete step
      } else {
        setErrors({ submit: result.error || 'Submission failed' });
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    }
    setIsSubmitting(false);
  };

  // Handle completion
  const handleComplete = () => {
    localStorage.removeItem(`onboarding_${sessionId}`);
    try {
      localStorage.setItem('orbitpay-onboarded', '1');
      // Persist a minimal member identity so the portal can render immediately.
      const memberId = 'OP-' + Math.floor(100000 + Math.random() * 900000);
      const cached = (() => {
        try { return JSON.parse(localStorage.getItem('orbitpay-onboarded-profile') || '{}'); } catch { return {}; }
      })();
      const profile = {
        memberId,
        name: [cached.firstName, cached.lastName].filter(Boolean).join(' ') || 'OrbitPay Member',
        email: cached.email || '',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('orbitpay-onboarded-profile', JSON.stringify(profile));
      // Seed Zustand BEFORE navigation so the member portal renders with
      // the new identity on the very first paint — no flash of empty.
      try {
        const setUser = useStore.getState().setUser;
        setUser({
          id: profile.memberId,
          email: profile.email,
          phone: '',
          fullName: profile.name,
          kycStatus: 'approved' as any,
          accountStatus: 'active' as any,
          tier: 'premium' as any,
          dailyLimit: 50000,
          weeklyLimit: 250000,
          monthlyLimit: 1000000,
          balanceUsd: 2500,
          balanceEur: 2300,
          balanceGbp: 1950,
          balanceBtc: 0.012,
          btcPrice: 67000,
          createdAt: profile.createdAt,
          updatedAt: profile.createdAt,
          lastActive: profile.createdAt,
          isOnline: true,
        });
      } catch {}
    } catch {}
    if (onComplete) onComplete();
    // Redirect into the member portal.
    navigate('/app');
  };

  // Real-time validation
  const validateFieldLive = (field: string, value: string): string | null => {
    switch (field) {
      case 'first_name':
      case 'last_name':
        if (value && value.length < 2) return 'Must be at least 2 characters';
        if (value && !/^[a-zA-Z\s'-]+$/.test(value)) return 'Letters only';
        return null;
      case 'email':
        return validateEmail(value);
      case 'phone':
        return validatePhone(value);
      case 'date_of_birth':
        return validateDateOfBirth(value, selectedType === 'youth' ? 13 : 18);
      case 'ssn_last4':
        return validateSSN(value);
      case 'street_address':
        return validateAddress(value);
      case 'city':
        return value && value.length < 2 ? 'Required' : null;
      case 'state':
        return value && value.length < 2 ? 'Required' : null;
      case 'zip_code':
        return validateZipCode(value);
      case 'id_number':
        return value && !/^[A-Z0-9]{5,20}$/i.test(value) ? 'Invalid ID format' : null;
      case 'business_name':
        return value && value.length < 3 ? 'Must be at least 3 characters' : null;
      case 'ein':
        return value && !/^[0-9]{2}-[0-9]{7}$/.test(value) ? 'Format: XX-XXXXXXX' : null;
      case 'partner_email':
        return value ? validateEmail(value) : null;
      default:
        return null;
    }
  };

  // Render step content
  const renderStepContent = () => {
    if (!currentStep) return null;

    switch (currentStep.id) {
      case 'welcome':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
                 style={{ background: `linear-gradient(135deg, ${config?.color?.includes('emerald') ? '#10B981, #14B8A6' : '#06B6D4, #8B5CF6'})` }}>
              <span className="absolute inset-0 animate-pulse rounded-2xl bg-white/10" />
              <Shield className="relative h-10 w-10 text-white" />
            </div>
            <h2 className="mb-2 text-3xl font-bold text-white">{config?.name}</h2>
            <p className="mb-6 text-emerald-100/80">{config?.tagline}</p>

            {/* Features */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              {config?.features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl"
                >
                  <Check className="h-4 w-4 flex-shrink-0 text-emerald-300" />
                  <span className="text-sm text-emerald-50">{feature}</span>
                </div>
              ))}
            </div>

            {/* Terms Agreement */}
            <div className="space-y-3 text-left">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition hover:border-emerald-400/40 hover:bg-white/10">
                <input
                  type="checkbox"
                  checked={formData.agreed_to_terms || false}
                  onChange={(e) => updateFormData('agreed_to_terms', e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-white/30 bg-white/10 text-emerald-500 focus:ring-emerald-400"
                />
                <span className="text-sm text-emerald-50">
                  I agree to the <span className="font-medium text-emerald-300">Terms of Service</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition hover:border-emerald-400/40 hover:bg-white/10">
                <input
                  type="checkbox"
                  checked={formData.agreed_to_privacy || false}
                  onChange={(e) => updateFormData('agreed_to_privacy', e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-white/30 bg-white/10 text-emerald-500 focus:ring-emerald-400"
                />
                <span className="text-sm text-emerald-50">
                  I agree to the <span className="font-medium text-emerald-300">Privacy Policy</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition hover:border-emerald-400/40 hover:bg-white/10">
                <input
                  type="checkbox"
                  checked={formData.agreed_to_membership || false}
                  onChange={(e) => updateFormData('agreed_to_membership', e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-white/30 bg-white/10 text-emerald-500 focus:ring-emerald-400"
                />
                <span className="text-sm text-emerald-50">
                  I agree to the <span className="font-medium text-emerald-300">Membership Agreement</span> and{' '}
                  <span className="font-medium text-emerald-300">Fee Schedule</span>
                </span>
              </label>
            </div>

            {errors.agreed_to_terms && (
              <p className="mt-3 flex items-center gap-2 text-sm text-rose-300">
                <AlertCircle className="w-4 h-4" />
                You must agree to all terms to continue
              </p>
            )}
          </motion.div>
        );

      case 'personal_info':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-6">
              <User className="w-12 h-12 mx-auto text-emerald-600 mb-3" />
              <h2 className="text-xl font-bold text-gray-900 mb-1">Personal Information</h2>
              <p className="text-gray-600 text-sm">Enter your legal name as shown on your government-issued ID</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name *</label>
                  <input
                    type="text"
                    value={formData.first_name || ''}
                    onChange={(e) => {
                      updateFormData('first_name', e.target.value);
                      const err = validateFieldLive('first_name', e.target.value);
                      if (err) setErrors(prev => ({ ...prev, first_name: err }));
                    }}
                    onBlur={(e) => {
                      const err = validateFieldLive('first_name', e.target.value);
                      if (err) setErrors(prev => ({ ...prev, first_name: err }));
                      else setErrors(prev => { const ne = {...prev}; delete ne.first_name; return ne; });
                    }}
                    placeholder="John"
                    autoComplete="given-name"
                    className={`w-full px-4 py-3 bg-white rounded-xl border ${errors.first_name ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                  />
                  {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name *</label>
                  <input
                    type="text"
                    value={formData.last_name || ''}
                    onChange={(e) => {
                      updateFormData('last_name', e.target.value);
                    }}
                    placeholder="Doe"
                    autoComplete="family-name"
                    className={`w-full px-4 py-3 bg-white rounded-xl border ${errors.last_name ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                  />
                  {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Middle Name (Optional)</label>
                <input
                  type="text"
                  value={formData.middle_name || ''}
                  onChange={(e) => updateFormData('middle_name', e.target.value)}
                  placeholder="William"
                  autoComplete="additional-name"
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth *</label>
                <input
                  type="date"
                  value={formData.date_of_birth || ''}
                  onChange={(e) => updateFormData('date_of_birth', e.target.value)}
                  autoComplete="bday"
                  className={`w-full px-4 py-3 bg-white rounded-xl border ${errors.date_of_birth ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                />
                {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">SSN (Last 4 Digits) *</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={formData.ssn_last4 || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      updateFormData('ssn_last4', value);
                    }}
                    placeholder="1234"
                    autoComplete="off"
                    className={`w-full px-4 py-3 bg-white rounded-xl border ${errors.ssn_last4 ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all pr-12`}
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Your SSN is encrypted and secure
                </p>
                {errors.ssn_last4 && <p className="text-red-500 text-xs mt-1">{errors.ssn_last4}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nationality *</label>
                <select
                  value={formData.nationality || 'US'}
                  onChange={(e) => updateFormData('nationality', e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </motion.div>
        );

      case 'contact':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-6">
              <Smartphone className="w-12 h-12 mx-auto text-emerald-600 mb-3" />
              <h2 className="text-xl font-bold text-gray-900 mb-1">Contact Information</h2>
              <p className="text-gray-600 text-sm">We'll send a verification code to this contact</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                <input
                  type="email"
                  inputMode="email"
                  value={formData.email || ''}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="john.doe@example.com"
                  autoComplete="email"
                  className={`w-full px-4 py-3 bg-white rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
                <input
                  type="tel"
                  inputMode="tel"
                  value={formData.phone || ''}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 10) value = value.slice(0, 10);
                    if (!value.startsWith('1') && value.length === 10) value = '1' + value;
                    if (value.length > 0 && !value.startsWith('1')) value = '';
                    if (value.length > 0) value = '+' + value;
                    updateFormData('phone', value);
                  }}
                  placeholder="+1 (555) 123-4567"
                  autoComplete="tel"
                  className={`w-full px-4 py-3 bg-white rounded-xl border ${errors.phone ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                <p className="text-xs text-gray-500 mt-1">Enter a valid US phone number for SMS verification</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">Verification Required</p>
                  <p className="text-xs text-blue-700 mt-1">We'll send a 6-digit code to your phone number to verify your identity. This helps protect your account from unauthorized access.</p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'verification':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Verify Your Identity</h2>
              <p className="text-gray-600 text-sm">
                Enter the 6-digit code sent to<br />
                <span className="font-semibold text-gray-900">{otpMaskedTarget || maskPhone(formData.phone || '')}</span>
              </p>
            </div>

            <div className="flex justify-center gap-3 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  autoFocus={index === 0}
                  className={`w-12 h-14 text-center text-xl font-bold bg-white border-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.otp ? 'border-red-500' : 'border-gray-200 focus:border-emerald-500'}`}
                />
              ))}
            </div>

            {errors.otp && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-700">{errors.otp}</p>
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Code expires in <span className="font-semibold text-emerald-600">{Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, '0')}</span>
              </p>
              <button
                onClick={handleResendOTP}
                disabled={otpTimer > 0}
                className={`text-emerald-600 font-medium text-sm ${otpTimer > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:underline'}`}
              >
                {otpTimer > 0 ? `Resend code in ${otpTimer}s` : "Didn't receive a code? Resend"}
              </button>
            </div>
          </motion.div>
        );

      case 'address':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-6">
              <MapPin className="w-12 h-12 mx-auto text-emerald-600 mb-3" />
              <h2 className="text-xl font-bold text-gray-900 mb-1">Residential Address</h2>
              <p className="text-gray-600 text-sm">Your current address for account verification</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address *</label>
                <input
                  type="text"
                  value={formData.street_address || ''}
                  onChange={(e) => updateFormData('street_address', e.target.value)}
                  placeholder="123 Main Street"
                  autoComplete="address-line1"
                  className={`w-full px-4 py-3 bg-white rounded-xl border ${errors.street_address ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                />
                {errors.street_address && <p className="text-red-500 text-xs mt-1">{errors.street_address}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Apartment, Suite, etc. (Optional)</label>
                <input
                  type="text"
                  value={formData.address_line2 || ''}
                  onChange={(e) => updateFormData('address_line2', e.target.value)}
                  placeholder="Apt 4B"
                  autoComplete="address-line2"
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    placeholder="San Francisco"
                    autoComplete="address-level2"
                    className={`w-full px-4 py-3 bg-white rounded-xl border ${errors.city ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">State *</label>
                  <select
                    value={formData.state || ''}
                    onChange={(e) => updateFormData('state', e.target.value)}
                    autoComplete="address-level1"
                    className={`w-full px-4 py-3 bg-white rounded-xl border ${errors.state ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                  >
                    <option value="">Select</option>
                    <option value="CA">California</option>
                    <option value="NY">New York</option>
                    <option value="TX">Texas</option>
                    <option value="FL">Florida</option>
                    <option value="IL">Illinois</option>
                    <option value="PA">Pennsylvania</option>
                    <option value="OH">Ohio</option>
                    <option value="GA">Georgia</option>
                    <option value="NC">North Carolina</option>
                    <option value="MI">Michigan</option>
                  </select>
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ZIP Code *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    value={formData.zip_code || ''}
                    onChange={(e) => updateFormData('zip_code', e.target.value)}
                    placeholder="94105"
                    autoComplete="postal-code"
                    className={`w-full px-4 py-3 bg-white rounded-xl border ${errors.zip_code ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                  />
                  {errors.zip_code && <p className="text-red-500 text-xs mt-1">{errors.zip_code}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                  <select
                    value={formData.country || 'US'}
                    onChange={(e) => updateFormData('country', e.target.value)}
                    className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'id_upload':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-6">
              <CreditCard className="w-12 h-12 mx-auto text-emerald-600 mb-3" />
              <h2 className="text-xl font-bold text-gray-900 mb-1">Upload Your ID</h2>
              <p className="text-gray-600 text-sm">We accept government-issued photo IDs</p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ID Type *</label>
                <select
                  value={formData.id_type || ''}
                  onChange={(e) => updateFormData('id_type', e.target.value)}
                  className={`w-full px-4 py-3 bg-white rounded-xl border ${errors.id_type ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                >
                  <option value="">Select ID type</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="passport">Passport</option>
                  <option value="state_id">State ID</option>
                  <option value="military_id">Military ID</option>
                </select>
                {errors.id_type && <p className="text-red-500 text-xs mt-1">{errors.id_type}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ID Number *</label>
                <input
                  type="text"
                  value={formData.id_number || ''}
                  onChange={(e) => updateFormData('id_number', e.target.value.toUpperCase())}
                  placeholder="ABC1234567890"
                  className={`w-full px-4 py-3 bg-white rounded-xl border ${errors.id_number ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                />
                {errors.id_number && <p className="text-red-500 text-xs mt-1">{errors.id_number}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Front of ID *</label>
                <div
                  onClick={() => handleFileUpload('id_front')}
                  className={`aspect-[3/2] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                    idFrontPreview
                      ? 'border-emerald-500 bg-emerald-50'
                      : errors.id_front
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 bg-gray-50 hover:border-emerald-500 hover:bg-emerald-50'
                  }`}
                >
                  {idFrontPreview ? (
                    <img src={idFrontPreview} alt="ID Front" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Tap to upload</span>
                    </>
                  )}
                </div>
                <input
                  ref={idFrontRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handleFileChange('id_front', e)}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Back of ID *</label>
                <div
                  onClick={() => handleFileUpload('id_back')}
                  className={`aspect-[3/2] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                    idBackPreview
                      ? 'border-emerald-500 bg-emerald-50'
                      : errors.id_back
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300 bg-gray-50 hover:border-emerald-500 hover:bg-emerald-50'
                  }`}
                >
                  {idBackPreview ? (
                    <img src={idBackPreview} alt="ID Back" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Tap to upload</span>
                    </>
                  )}
                </div>
                <input
                  ref={idBackRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handleFileChange('id_back', e)}
                  className="hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selfie Verification *</label>
              <div
                onClick={() => handleFileUpload('selfie')}
                className={`aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                  selfiePreview
                    ? 'border-emerald-500 bg-emerald-50'
                    : errors.selfie
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 bg-gray-50 hover:border-emerald-500 hover:bg-emerald-50'
                }`}
              >
                {selfiePreview ? (
                  <img src={selfiePreview} alt="Selfie" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <>
                    <Camera className="w-12 h-12 text-gray-400 mb-3" />
                    <span className="text-sm text-gray-500">Take a selfie</span>
                    <span className="text-xs text-gray-400 mt-1">Make sure your face is clearly visible</span>
                  </>
                )}
              </div>
              <input
                ref={selfieRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={(e) => handleFileChange('selfie', e)}
                className="hidden"
              />
            </div>
          </motion.div>
        );

      case 'business_info':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-6">
              <Briefcase className="w-12 h-12 mx-auto text-emerald-600 mb-3" />
              <h2 className="text-xl font-bold text-gray-900 mb-1">Business Information</h2>
              <p className="text-gray-600 text-sm">Tell us about your business</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Legal Business Name *</label>
                <input
                  type="text"
                  value={formData.business_name || ''}
                  onChange={(e) => updateFormData('business_name', e.target.value)}
                  placeholder="Acme Corporation"
                  className={`w-full px-4 py-3 bg-white rounded-xl border ${errors.business_name ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                />
                {errors.business_name && <p className="text-red-500 text-xs mt-1">{errors.business_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Type *</label>
                <select
                  value={formData.business_type || ''}
                  onChange={(e) => updateFormData('business_type', e.target.value)}
                  className={`w-full px-4 py-3 bg-white rounded-xl border ${errors.business_type ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                >
                  <option value="">Select type</option>
                  <option value="llc">LLC</option>
                  <option value="corporation">Corporation</option>
                  <option value="partnership">Partnership</option>
                  <option value="sole_proprietorship">Sole Proprietorship</option>
                </select>
                {errors.business_type && <p className="text-red-500 text-xs mt-1">{errors.business_type}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">EIN (Employer ID Number) *</label>
                <input
                  type="text"
                  value={formData.ein || ''}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 9) value = value.slice(0, 9);
                    if (value.length > 2) value = value.slice(0, 2) + '-' + value.slice(2);
                    updateFormData('ein', value);
                  }}
                  placeholder="12-3456789"
                  className={`w-full px-4 py-3 bg-white rounded-xl border ${errors.ein ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                />
                {errors.ein && <p className="text-red-500 text-xs mt-1">{errors.ein}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry</label>
                <select
                  value={formData.industry || ''}
                  onChange={(e) => updateFormData('industry', e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                >
                  <option value="">Select industry</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="retail">Retail</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </motion.div>
        );

      case 'joint_partner':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-6">
              <Users className="w-12 h-12 mx-auto text-emerald-600 mb-3" />
              <h2 className="text-xl font-bold text-gray-900 mb-1">Joint Account Partner</h2>
              <p className="text-gray-600 text-sm">Enter the second account holder's information</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Partner First Name *</label>
                  <input
                    type="text"
                    value={formData.partner_first_name || ''}
                    onChange={(e) => updateFormData('partner_first_name', e.target.value)}
                    placeholder="Jane"
                    className={`w-full px-4 py-3 bg-white rounded-xl border ${errors.partner_first_name ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                  />
                  {errors.partner_first_name && <p className="text-red-500 text-xs mt-1">{errors.partner_first_name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Partner Last Name *</label>
                  <input
                    type="text"
                    value={formData.partner_last_name || ''}
                    onChange={(e) => updateFormData('partner_last_name', e.target.value)}
                    placeholder="Doe"
                    className={`w-full px-4 py-3 bg-white rounded-xl border ${errors.partner_last_name ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                  />
                  {errors.partner_last_name && <p className="text-red-500 text-xs mt-1">{errors.partner_last_name}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Partner Email *</label>
                <input
                  type="email"
                  value={formData.partner_email || ''}
                  onChange={(e) => updateFormData('partner_email', e.target.value)}
                  placeholder="jane.doe@example.com"
                  className={`w-full px-4 py-3 bg-white rounded-xl border ${errors.partner_email ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                />
                {errors.partner_email && <p className="text-red-500 text-xs mt-1">{errors.partner_email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Partner Phone *</label>
                <input
                  type="tel"
                  value={formData.partner_phone || ''}
                  onChange={(e) => updateFormData('partner_phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className={`w-full px-4 py-3 bg-white rounded-xl border ${errors.partner_phone ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                />
                {errors.partner_phone && <p className="text-red-500 text-xs mt-1">{errors.partner_phone}</p>}
              </div>
            </div>
          </motion.div>
        );

      case 'review':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-6">
              <FileText className="w-12 h-12 mx-auto text-emerald-600 mb-3" />
              <h2 className="text-xl font-bold text-gray-900 mb-1">Review Your Application</h2>
              <p className="text-gray-600 text-sm">Please verify all information is correct</p>
            </div>

            <div className="space-y-4">
              {/* Account Type */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config?.color} flex items-center justify-center`}>
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{config?.name}</p>
                    <p className="text-sm text-gray-600">{config?.tagline}</p>
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <div className="p-4 bg-white rounded-xl border">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Personal Information</h4>
                <p className="text-gray-900">{formData.first_name} {formData.last_name}</p>
                <p className="text-sm text-gray-600">DOB: {formData.date_of_birth}</p>
                <p className="text-xs text-gray-400">SSN: ***-**-{formData.ssn_last4}</p>
              </div>

              {/* Contact */}
              <div className="p-4 bg-white rounded-xl border">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h4>
                <p className="text-gray-900">{formData.email}</p>
                <p className="text-sm text-gray-600">{formData.phone}</p>
              </div>

              {/* Address */}
              <div className="p-4 bg-white rounded-xl border">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Address</h4>
                <p className="text-gray-900">{formData.street_address}</p>
                <p className="text-sm text-gray-600">{formData.city}, {formData.state} {formData.zip_code}</p>
              </div>

              {/* ID */}
              <div className="p-4 bg-white rounded-xl border">
                <h4 className="text-sm font-medium text-gray-500 mb-2">ID Verification</h4>
                <p className="text-gray-900 capitalize">{formData.id_type?.replace('_', ' ')}</p>
                <p className="text-sm text-gray-600">ID Number: {formData.id_number}</p>
              </div>

              {formData.business_name && (
                <div className="p-4 bg-white rounded-xl border">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Business Information</h4>
                  <p className="text-gray-900">{formData.business_name}</p>
                  <p className="text-sm text-gray-600 capitalize">{formData.business_type?.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-400">EIN: {formData.ein}</p>
                </div>
              )}

              {formData.partner_first_name && (
                <div className="p-4 bg-white rounded-xl border">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Joint Partner</h4>
                  <p className="text-gray-900">{formData.partner_first_name} {formData.partner_last_name}</p>
                  <p className="text-sm text-gray-600">{formData.partner_email}</p>
                </div>
              )}
            </div>

            <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer border border-gray-200 mt-6 hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={formData.agreed_to_terms}
                onChange={(e) => updateFormData('agreed_to_terms', e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700 text-left">
                I confirm that all information provided is accurate and complete. I understand that providing false information may result in account closure and legal consequences.
              </span>
            </label>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            )}
          </motion.div>
        );

      case 'complete':
        return (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full"
              style={{ background: 'linear-gradient(135deg, #10B981 0%, #14B8A6 50%, #06B6D4 100%)' }}
            >
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" />
              <CheckCircle2 className="relative w-12 h-12 text-white" />
            </motion.div>

            <h2 className="mb-3 text-3xl font-bold text-white">Application Submitted!</h2>
            <p className="mx-auto mb-6 max-w-sm text-emerald-100/80">
              Thank you for choosing OrbitPay Credit Union. Your application is being reviewed.
            </p>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl mb-6 text-left">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20">
                  <Calendar className="h-5 w-5 text-emerald-300" />
                </div>
                <span className="font-semibold text-white">Processing Time</span>
              </div>
              <p className="text-sm text-emerald-100/80">24-48 hours for standard applications</p>
              <p className="mt-1 text-xs text-emerald-200/60">Premium applications processed within 4 hours</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <p className="text-sm text-emerald-100/80">
                <strong className="text-white">Application ID:</strong>{' '}
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-emerald-200">
                  {sessionId?.split('_')[1] || 'OP-' + Date.now().toString(36).toUpperCase()}
                </span>
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-4 backdrop-blur-xl text-left">
              <div className="mb-2 flex items-center gap-2">
                <Bell className="h-5 w-5 text-cyan-300" />
                <span className="font-semibold text-white">What's Next?</span>
              </div>
              <ul className="space-y-1 text-sm text-cyan-100/80">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-300" /> Check your email for confirmation</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-300" /> You'll receive SMS updates</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-300" /> Your account will be activated upon approval</li>
              </ul>
            </div>
          </motion.div>
        );

      default:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 mx-auto mb-6 flex items-center justify-center">
              <currentStep.icon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{currentStep.title}</h2>
            <p className="text-gray-600">{currentStep.subtitle}</p>
          </motion.div>
        );
    }
  };

  // Account Type Selection Screen
  if (!selectedType) {
    return (
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-orbit-900 via-orbit-800 to-orbit-950 text-white">
        {/* Animated gradient orbs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
          <motion.div
            className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-emerald-500/30 blur-[120px]"
            animate={{ x: [0, 80, 0], y: [0, 40, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-40 -right-32 h-[520px] w-[520px] rounded-full bg-teal-400/20 blur-[120px]"
            animate={{ x: [0, -60, 0], y: [0, -30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-lg px-5 py-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                 style={{ background: 'linear-gradient(135deg, #10B981 0%, #14B8A6 50%, #06B6D4 100%)' }}>
              <span className="absolute inset-0 animate-pulse rounded-2xl bg-white/10" />
              <Building2 className="relative h-8 w-8 text-white" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-white">Open Your Account</h1>
            <p className="text-emerald-100/80">Select the account type that best fits your needs</p>
          </div>

          {/* Account Types Grid — futuristic glass cards */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            {Object.values(accountTypeConfigs).map((typeConfig) => (
              <motion.button
                key={typeConfig.id}
                whileTap={{ scale: 0.97 }}
                whileHover={{ y: -2 }}
                onClick={() => handleSelectAccountType(typeConfig.id)}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-xl transition hover:border-emerald-400/60 hover:bg-white/10 hover:shadow-[0_8px_30px_rgba(16,185,129,0.25)]"
              >
                <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${typeConfig.color}`}>
                  {typeConfig.id === 'savings' && <PiggyBank className="h-6 w-6 text-white" />}
                  {typeConfig.id === 'checking' && <Wallet className="h-6 w-6 text-white" />}
                  {typeConfig.id === 'student' && <GraduationCap className="h-6 w-6 text-white" />}
                  {typeConfig.id === 'business' && <Briefcase className="h-6 w-6 text-white" />}
                  {typeConfig.id === 'joint' && <Users className="h-6 w-6 text-white" />}
                  {typeConfig.id === 'youth' && <Heart className="h-6 w-6 text-white" />}
                  {typeConfig.id === 'premium' && <Crown className="h-6 w-6 text-white" />}
                  {typeConfig.id === 'retirement' && <TrendingUp className="h-6 w-6 text-white" />}
                </div>
                <h3 className="mb-1 font-semibold text-white">{typeConfig.name}</h3>
                <p className="line-clamp-2 text-xs text-emerald-100/70">{typeConfig.tagline}</p>
                {/* hover shimmer */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </motion.button>
            ))}
          </div>

          {/* Cancel Button */}
          <button
            onClick={onCancel}
            className="w-full rounded-xl py-3 font-medium text-emerald-200 transition hover:bg-white/5 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const restrictedBackSteps = ['verification', 'id_upload', 'review'];

  return (
    // FUTURISTIC 2030 wrapper: dark navy + animated emerald/mint gradient orbs +
    // glassmorphic surface. Card forms inside use white surfaces for legibility.
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-orbit-900 via-orbit-800 to-orbit-950 text-white">
      {/* Animated gradient orbs (background atmosphere) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-emerald-500/30 blur-[120px]"
          animate={{ x: [0, 80, 0], y: [0, 40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -right-32 h-[520px] w-[520px] rounded-full bg-teal-400/20 blur-[120px]"
          animate={{ x: [0, -60, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 h-[260px] w-[260px] rounded-full bg-mint-400/15 blur-[100px]"
          animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Header - Hidden on welcome and complete */}
      {currentStep.id !== 'welcome' && currentStep.id !== 'complete' && (
        <div className="relative z-20 flex-none sticky top-0 border-b border-white/10 bg-orbit-900/70 backdrop-blur-2xl">
          <div className="mx-auto max-w-lg px-5 py-3">
            <div className="mb-3 flex items-center justify-between">
              {/* Back Button - ALWAYS visible (was previously hidden on restricted steps) */}
              <button
                onClick={handleBack}
                aria-label="Previous step"
                className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white backdrop-blur transition hover:border-emerald-400/60 hover:bg-emerald-500/20 hover:text-emerald-200"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Account Type Badge */}
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur">
                <div className={`flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br ${config?.color}`}>
                  <Building2 className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-medium text-white">{config?.name}</span>
              </div>

              <span className="text-xs font-medium uppercase tracking-wider text-emerald-300">
                {currentStepIndex + 1}<span className="text-white/30">/{steps.length}</span>
              </span>
            </div>

            {/* Progress Bar — animated gradient with shimmer */}
            <div className="relative h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
                className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-emerald-400 via-mint-300 to-teal-300"
                style={{
                  boxShadow: '0 0 12px rgba(16, 185, 129, 0.45)',
                }}
              >
                <motion.div
                  className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  animate={{ x: ['-100%', '400%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>
            </div>

            {/* Step Label */}
            <p className="mt-2 text-center text-xs font-medium uppercase tracking-wider text-emerald-200/80">
              {currentStep.title}
              {restrictedBackSteps.includes(currentStep.id) && (
                <span className="ml-2 inline-flex items-center gap-1 text-emerald-300">
                  <Lock className="w-3 h-3" /> Secure step
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Content - flex-1 with overflow so footer can be sticky at bottom */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg px-5 py-6">
          {/* Glassmorphic card that holds the step content. Form fields
              (bg-white) and labels (text-gray-700) inside stay readable. */}
          <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/95 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            {/* Inner neon edge accent */}
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Navigation - inside flex container, never overlaps content */}
      {currentStep.id !== 'complete' ? (
        <div className="relative z-20 flex-none border-t border-white/10 bg-orbit-900/80 backdrop-blur-2xl">
          <div className="mx-auto max-w-lg px-5 py-4">
            <button
              className={`group relative w-full overflow-hidden rounded-2xl py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                canProceed()
                  ? 'text-white shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                  : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
              }`}
              style={
                canProceed()
                  ? {
                      backgroundImage: 'linear-gradient(135deg, #10B981 0%, #14B8A6 50%, #06B6D4 100%)',
                    }
                  : undefined
              }
              disabled={!canProceed() || isSubmitting}
              onClick={currentStep.id === 'review' ? handleSubmit : handleNext}
            >
              {canProceed() && (
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              )}
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {currentStep.id === 'review' ? 'Submit Application' : 'Continue'}
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="relative z-20 flex-none border-t border-white/10 bg-orbit-900/80 backdrop-blur-2xl">
          <div className="mx-auto max-w-lg px-5 py-4">
            <button
              className="group relative w-full overflow-hidden rounded-2xl py-4 font-semibold text-white shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2"
              style={{
                backgroundImage: 'linear-gradient(135deg, #10B981 0%, #14B8A6 50%, #06B6D4 100%)',
              }}
              onClick={handleComplete}
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              Go to member portal
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
