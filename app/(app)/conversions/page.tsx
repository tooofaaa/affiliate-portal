import ConversionsContent from "@/components/features/conversions/ConversionsContent";
import { getMyConversions } from "@/lib/actions/affiliate";

export default async function ConversionsPage() {
  const { data: conversions, error } = await getMyConversions();

  return (
    <ConversionsContent
      conversions={conversions}
      error={error ?? null}
    />
  );
}
