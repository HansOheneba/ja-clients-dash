import type { SessionParty, SessionRequest, WmSession } from "@/lib/wealth/wm-types";

import { formatSessionDateTime } from "./datetime";

export function isActiveProposal(request: SessionRequest) {
  return request.status === "pending" || request.status === "rescheduled";
}

export function proposalDateTime(request: SessionRequest) {
  return request.proposed_at ?? request.preferred_times;
}

export function proposalDateTimeLabel(request: SessionRequest) {
  const value = request.proposed_at;
  if (value) return formatSessionDateTime(value);
  return request.preferred_times;
}

export function isFullyAgreed(request: SessionRequest) {
  return Boolean(request.client_agreed_at && request.advisor_agreed_at);
}

export function awaitingParty(request: SessionRequest): SessionParty | null {
  if (!isActiveProposal(request) || isFullyAgreed(request)) return null;
  if (!request.client_agreed_at) return "client";
  if (!request.advisor_agreed_at) return "advisor";
  return null;
}

export function needsRecap(session: WmSession) {
  return Boolean(
    session.scheduled_at &&
      new Date(session.scheduled_at) < new Date() &&
      !session.recap_logged_at &&
      session.status !== "cancelled",
  );
}
