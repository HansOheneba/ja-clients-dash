"use client";

import { MessageThread } from "@/components/messages/message-thread";

export function ClientMessagesTab({
  clientId,
  ownRole = "advisor",
}: {
  clientId: string;
  ownRole?: "advisor" | "client";
}) {
  return <MessageThread clientId={clientId} ownRole={ownRole} />;
}
