import TicketDetailContent from "@/components/features/support/TicketDetailContent";
import { getTicketMessages } from "@/lib/actions/affiliate";
import { createClientServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketDetailPage({ params }: PageProps) {
  const { id } = await params;
  const ticketId = parseInt(id, 10);

  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const [ticketRes, messagesRes] = await Promise.all([
    supabase
      .from("support_tickets")
      .select("*")
      .eq("id", ticketId)
      .eq("created_by", user.id)
      .maybeSingle(),
    getTicketMessages(ticketId),
  ]);

  if (!ticketRes.data) {
    notFound();
  }

  return (
    <TicketDetailContent
      ticket={ticketRes.data}
      messages={messagesRes.data}
      currentUserId={user.id}
    />
  );
}
