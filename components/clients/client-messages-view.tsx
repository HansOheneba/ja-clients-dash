"use client";

import { MessageThread } from "@/components/messages/message-thread";

export function ClientMessagesView({
  clientId,
}: {
  clientId: string;
}) {
  return (
    <MessageThread
      clientId={clientId}
      ownRole="client"
      showAdvisorNames={false}
    />
  );
}
