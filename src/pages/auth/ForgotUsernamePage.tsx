import SimpleAuthPage from './SimpleAuthPage';
import { Mail } from 'lucide-react';

export default function ForgotUsernamePage() {
  return (
    <SimpleAuthPage
      eyebrow="Recover Username"
      title="Forgot your username?"
      subtitle="Enter the email or phone on file. We will send you a secure link to recover your username."
      field="email"
      fieldLabel="Email or phone on file"
      fieldPlaceholder="you@example.com or +1 555 010 0000"
      fieldLeftIcon={Mail}
      primaryAction="Send recovery link"
      doneTitle="Check your inbox"
      doneBody="If an account matches, we sent a recovery link. Open it on a trusted device to see your username."
    />
  );
}
