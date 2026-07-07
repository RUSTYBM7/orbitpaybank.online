import SimpleAuthPage from './SimpleAuthPage';
import { Mail } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <SimpleAuthPage
      eyebrow="Verify Email"
      title="Confirm your email address"
      subtitle="We sent a 6-digit code to your email. Enter it below to verify."
      field="email"
      fieldLabel="Email address"
      fieldPlaceholder="you@example.com"
      fieldLeftIcon={Mail}
      primaryAction="Verify email"
      doneTitle="Email verified"
      doneBody="Your email address is confirmed. You can now use it to recover your account and receive security alerts."
      otp
    />
  );
}
