import SimpleAuthPage from './SimpleAuthPage';
import { Hash } from 'lucide-react';

export default function VerifyAuthenticatorPage() {
  return (
    <SimpleAuthPage
      eyebrow="Verify Authenticator"
      title="Connect your authenticator"
      subtitle="Open your authenticator app and enter the 6-digit code for OrbitPay to complete setup."
      field="username"
      fieldLabel="Username"
      fieldPlaceholder="your.username"
      fieldLeftIcon={Hash}
      primaryAction="Verify code"
      doneTitle="Authenticator connected"
      doneBody="Your authenticator app is now a sign-in method. Codes refresh every 30 seconds."
      otp
    />
  );
}
