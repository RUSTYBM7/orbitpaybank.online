import { useEffect, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { seedData } from '@/services/mockData';
import LandingPage from '@/pages/LandingPage';
import BrightLandingPage from '@/pages/BrightLandingPage';
import UserApp from '@/pages/UserApp';
import AdminApp from '@/pages/admin/AdminApp';
import NotFound from '@/pages/NotFound';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingScreen from '@/components/LoadingScreen';
import PublicLayout from '@/components/public/PublicLayout';
// Public sub-pages — lazy-loaded for code splitting. Each route lives
// in its own chunk so the initial bundle stays small.
import { lazy } from 'react';
const PersonalBankingPage = lazy(() => import('@/pages/public/PersonalBankingPage'));
const BusinessBankingPage = lazy(() => import('@/pages/public/BusinessBankingPage'));
const LoansPage = lazy(() => import('@/pages/public/LoansPage'));
const CreditCardsPage = lazy(() => import('@/pages/public/CreditCardsPage'));
const InvestmentsPage = lazy(() => import('@/pages/public/InvestmentsPage'));
const DigitalBankingPage = lazy(() => import('@/pages/public/DigitalBankingPage'));
const SecurityCenterPage = lazy(() => import('@/pages/public/SecurityCenterPage'));
const EducationPage = lazy(() => import('@/pages/public/EducationPage'));
const AboutPage = lazy(() => import('@/pages/public/AboutPage'));
const RatesPage = lazy(() => import('@/pages/public/RatesPage'));
const FeesPage = lazy(() => import('@/pages/public/FeesPage'));
const FAQPage = lazy(() => import('@/pages/public/FAQPage'));
const ContactPage = lazy(() => import('@/pages/public/ContactPage'));
const CareersPage = lazy(() => import('@/pages/public/CareersPage'));
const NewsPage = lazy(() => import('@/pages/public/NewsPage'));
const AccessibilityPage = lazy(() => import('@/pages/public/AccessibilityPage'));
const PrivacyPage = lazy(() => import('@/pages/public/PrivacyPage'));
const TermsPage = lazy(() => import('@/pages/public/TermsPage'));
const CookiesPage = lazy(() => import('@/pages/public/CookiesPage'));
const IntegrationsPage = lazy(() => import('@/pages/public/IntegrationsPage'));

// Auth pages — lazy
const AuthHubPage = lazy(() => import('@/pages/auth/AuthHubPage'));
const SignInPage = lazy(() => import('@/pages/auth/SignInPage'));
const SignUpPage = lazy(() => import('@/pages/auth/SignUpPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const ForgotUsernamePage = lazy(() => import('@/pages/auth/ForgotUsernamePage'));
const RecoverMembershipPage = lazy(() => import('@/pages/auth/RecoverMembershipPage'));
const RecoverOnlineIdPage = lazy(() => import('@/pages/auth/RecoverOnlineIdPage'));
const UnlockAccountPage = lazy(() => import('@/pages/auth/UnlockAccountPage'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'));
const VerifyPhonePage = lazy(() => import('@/pages/auth/VerifyPhonePage'));
const VerifyAuthenticatorPage = lazy(() => import('@/pages/auth/VerifyAuthenticatorPage'));
const MfaSetupPage = lazy(() => import('@/pages/auth/MfaSetupPage'));
const PasskeySetupPage = lazy(() => import('@/pages/auth/PasskeySetupPage'));
const TrustedDevicesPage = lazy(() => import('@/pages/auth/TrustedDevicesPage'));
const LoginHistoryPage = lazy(() => import('@/pages/auth/LoginHistoryPage'));
const SecurityAlertsPage = lazy(() => import('@/pages/auth/SecurityAlertsPage'));
const RecoveryCodesPage = lazy(() => import('@/pages/auth/RecoveryCodesPage'));
const SecurityQuestionsPage = lazy(() => import('@/pages/auth/SecurityQuestionsPage'));
const LockedAccountPage = lazy(() => import('@/pages/auth/LockedAccountPage'));
const LogoutConfirmPage = lazy(() => import('@/pages/auth/LogoutConfirmPage'));

// Enrollment + onboarding — lazy
const EnrollHubPage = lazy(() => import('@/pages/enroll/EnrollHubPage'));
const EnrollProductPage = lazy(() => import('@/pages/enroll/EnrollProductPage'));
const CardServicesPage = lazy(() => import('@/pages/enroll/CardServicesPage'));
const OnboardWizard = lazy(() => import('@/components/onboard/OnboardWizard'));

// Applicant dashboard — lazy
const ApplicantDashboardPage = lazy(() => import('@/pages/applicant/ApplicantDashboardPage'));

// Support pages — lazy
const ChatSupportPage = lazy(() => import('@/pages/support/ChatSupportPage'));
const AISupportPage = lazy(() => import('@/pages/support/AISupportPage'));
const TicketSupportPage = lazy(() => import('@/pages/support/TicketSupportPage'));

function App() {
  useEffect(() => {
    try {
      seedData();
    } catch (e) {
      // Seed failures shouldn't block the app
    }

    document.title = 'OrbitPay Credit Union — Banking at your orbit';
    const setMeta = (name: string, content: string) => {
      let m = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!m) { m = document.createElement('meta'); m.name = name; document.head.appendChild(m); }
      m.content = content;
    };
    const setOg = (property: string, content: string) => {
      let m = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!m) { m = document.createElement('meta'); m.setAttribute('property', property); document.head.appendChild(m); }
      m.content = content;
    };
    setMeta('description', 'OrbitPay Credit Union — Multi-currency banking, instant global transfers, AI-powered money management.');
    setMeta('theme-color', '#10b981');
    setMeta('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
    setOg('og:title', 'OrbitPay Credit Union');
    setOg('og:description', 'Banking that moves at your orbit.');
    setOg('og:type', 'website');
    setOg('og:url', 'https://orbitpaybank.online');
    setOg('og:image', 'https://orbitpaybank.online/og-image.png');
  }, []);

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Home (Velobank-style template) wrapped in PublicLayout for footer */}
          <Route path="/" element={<PublicLayout><BrightLandingPage /></PublicLayout>} />
          <Route path="/landing-old" element={<LandingPage />} />

          {/* Auth — old routes now redirect to the new auth ecosystem */}
          <Route path="/login" element={<Navigate to="/auth/sign-in" replace />} />
          <Route path="/signup" element={<Navigate to="/auth/sign-up" replace />} />
          <Route path="/sign-in" element={<Navigate to="/auth/sign-in" replace />} />
          <Route path="/sign-up" element={<Navigate to="/auth/sign-up" replace />} />
          <Route path="/forgot-password" element={<Navigate to="/auth/forgot-password" replace />} />

          {/* Member app */}
          <Route path="/app/*" element={<UserApp />} />

          {/* Admin */}
          <Route path="/admin/*" element={<AdminApp />} />

          {/* Public sub-pages — all wrapped in PublicLayout for consistent nav + footer */}
          <Route path="/personal" element={<PublicLayout><PersonalBankingPage /></PublicLayout>} />
          <Route path="/business" element={<PublicLayout><BusinessBankingPage /></PublicLayout>} />
          <Route path="/loans" element={<PublicLayout><LoansPage /></PublicLayout>} />
          <Route path="/cards" element={<PublicLayout><CreditCardsPage /></PublicLayout>} />
          <Route path="/investments" element={<PublicLayout><InvestmentsPage /></PublicLayout>} />
          <Route path="/digital" element={<PublicLayout><DigitalBankingPage /></PublicLayout>} />
          <Route path="/security" element={<PublicLayout><SecurityCenterPage /></PublicLayout>} />
          <Route path="/education" element={<PublicLayout><EducationPage /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
          <Route path="/rates" element={<PublicLayout><RatesPage /></PublicLayout>} />
          <Route path="/fees" element={<PublicLayout><FeesPage /></PublicLayout>} />
          <Route path="/faq" element={<PublicLayout><FAQPage /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
          <Route path="/careers" element={<PublicLayout><CareersPage /></PublicLayout>} />
          <Route path="/news" element={<PublicLayout><NewsPage /></PublicLayout>} />
          <Route path="/accessibility" element={<PublicLayout><AccessibilityPage /></PublicLayout>} />
          <Route path="/privacy" element={<PublicLayout><PrivacyPage /></PublicLayout>} />
          <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />
          <Route path="/cookies" element={<PublicLayout><CookiesPage /></PublicLayout>} />

          {/* Auth suite — full public auth ecosystem */}
          <Route path="/auth" element={<AuthHubPage />} />
          <Route path="/auth/sign-in" element={<SignInPage />} />
          <Route path="/auth/sign-up" element={<SignUpPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/forgot-username" element={<ForgotUsernamePage />} />
          <Route path="/auth/recover-membership" element={<RecoverMembershipPage />} />
          <Route path="/auth/recover-online-id" element={<RecoverOnlineIdPage />} />
          <Route path="/auth/unlock-account" element={<UnlockAccountPage />} />
          <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
          <Route path="/auth/verify-phone" element={<VerifyPhonePage />} />
          <Route path="/auth/verify-authenticator" element={<VerifyAuthenticatorPage />} />
          <Route path="/auth/mfa-setup" element={<MfaSetupPage />} />
          <Route path="/auth/passkey-setup" element={<PasskeySetupPage />} />
          <Route path="/auth/trusted-devices" element={<TrustedDevicesPage />} />
          <Route path="/auth/login-history" element={<LoginHistoryPage />} />
          <Route path="/auth/security-alerts" element={<SecurityAlertsPage />} />
          <Route path="/auth/recovery-codes" element={<RecoveryCodesPage />} />
          <Route path="/auth/security-questions" element={<SecurityQuestionsPage />} />
          <Route path="/auth/locked-account" element={<LockedAccountPage />} />
          <Route path="/auth/logout-confirmation" element={<LogoutConfirmPage />} />

          {/* Enrollment + onboarding wizard */}
          <Route path="/enroll" element={<EnrollHubPage />} />
          <Route path="/enroll/:productId" element={<EnrollProductPage />} />
          <Route path="/enroll/cards/services" element={<CardServicesPage />} />
          <Route path="/onboard" element={<OnboardWizard />} />

          {/* Applicant dashboard */}
          <Route path="/applicant" element={<ApplicantDashboardPage />} />
          <Route path="/applicant/dashboard" element={<ApplicantDashboardPage />} />

          {/* Support pages */}
          <Route path="/support/chat" element={<ChatSupportPage />} />
          <Route path="/support/ai" element={<AISupportPage />} />
          <Route path="/support/ticket" element={<TicketSupportPage />} />
          <Route path="/support" element={<ChatSupportPage />} />

          {/* Integrations */}
          <Route path="/integrations" element={<IntegrationsPage />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
