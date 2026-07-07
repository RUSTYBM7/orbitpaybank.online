import SimpleAuthPage from './SimpleAuthPage';
import { Phone } from 'lucide-react';

export default function VerifyPhonePage() {
  return (
    <SimpleAuthPage
      eyebrow="Verify Phone"
      title="Confirm your phone number"
      subtitle="We sent a 6-digit code by SMS. Enter it below to verify your phone."
      field="phone"
      fieldLabel="Phone number"
      fieldPlaceholder="+1 555 010 0000"
      fieldLeftIcon={Phone}
      primaryAction="Verify phone"
      doneTitle="Phone verified"
      doneBody="Your phone number is confirmed. You can now use it for SMS sign-in and security alerts."
      otp
    />
  );
}
