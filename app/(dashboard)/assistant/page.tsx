import { PageHeader } from "@/components/ui/PageHeader";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { AssistantClient } from "@/features/assistant/AssistantClient";

export default function AssistantPage() {
  return (
    <>
      <PageHeader
        eyebrow="AI"
        title="Health Assistant"
        description="Ask follow-up questions after a symptom check — conversational guidance with your recent results as context."
      />

      <DisclaimerBanner>
        The assistant provides educational information only — not diagnosis or
        prescription advice. For emergencies, use Emergency SOS.
      </DisclaimerBanner>

      <AssistantClient />
    </>
  );
}
