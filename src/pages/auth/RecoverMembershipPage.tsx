import SimpleAuthPage from './SimpleAuthPage';
import { Hash } from 'lucide-react';

export default function RecoverMembershipPage() {
  return (
    <SimpleAuthPage
      eyebrow="Recover Membership Number"
      title="Lost your member number?"
      subtitle="Verify your identity with the email and SSN on file. We will email your member number to you."
      field="email"
      fieldLabel="Email on file"
      fieldPlaceholder="you@example.com"
      fieldLeftIcon={Hash}
      primaryAction="Verify & recover"
      doneTitle="On its way"
      doneBody="If the email matches an account, we will send your member number within 5 minutes."
    />
  );
}
