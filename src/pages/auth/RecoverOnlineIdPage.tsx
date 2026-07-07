import SimpleAuthPage from './SimpleAuthPage';
import { KeyRound } from 'lucide-react';

export default function RecoverOnlineIdPage() {
  return (
    <SimpleAuthPage
      eyebrow="Recover Online Banking ID"
      title="Recover your online ID"
      subtitle="We will send a one-time link to the email on file. Open the link on this device to see your username."
      field="email"
      fieldLabel="Email on file"
      fieldPlaceholder="you@example.com"
      fieldLeftIcon={KeyRound}
      primaryAction="Send recovery link"
      doneTitle="Check your email"
      doneBody="The link is good for 15 minutes. If you do not see the email, check spam."
    />
  );
}
