import SupportContent from "@/components/features/support/SupportContent";
import { getMyTickets } from "@/lib/actions/affiliate";

export default async function SupportPage() {
  const { data: tickets } = await getMyTickets();

  return <SupportContent tickets={tickets} />;
}
