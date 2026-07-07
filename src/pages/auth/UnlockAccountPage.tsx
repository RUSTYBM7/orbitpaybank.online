import SimpleAuthPage from './SimpleAuthPage';
import { Lock } from 'lucide-react';

export default function UnlockAccountPage() {
  return (
    <SimpleAuthPage
      eyebrow="Unlock Account"
      title="Account temporarily locked"
      subtitle="We lock accounts after several failed sign-in attempts to protect you. Verify your identity to unlock now."
      field="email"
      fieldLabel="Email or username"
      fieldPlaceholder="you@example.com"
      fieldLeftIcon={Lock}
      primaryAction="Send unlock link"
      doneTitle="Unlock link sent"
      doneBody="Open the link on a trusted device to unlock your account. The link expires in 30 minutes."
    />
  );
}
