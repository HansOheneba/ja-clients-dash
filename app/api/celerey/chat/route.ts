import { buildCelereyContext, isClientId } from "@/lib/celerey/context";
import { CelereyModelError, streamCelereyChat } from "@/lib/celerey/deepseek";
import { buildCelereySystemPrompt } from "@/lib/celerey/prompts";
import { canAccessClient, getApiSession, jsonError } from "@/lib/wealth/session";
import { getClientById } from "@/lib/wealth/queries";

export const maxDuration = 60;

const MAX_MESSAGES = 20;
const MAX_CONTENT = 4000;

type IncomingTurn = { role?: unknown; content?: unknown };

export async function POST(request: Request) {
  const session = await getApiSession();
  if (!session.ok) return session.response;

  const body = await request.json().catch(() => null);
  const incoming = Array.isArray(body?.messages) ? (body.messages as IncomingTurn[]) : [];
  const messages = incoming
    .filter(
      (m): m is { role: "user" | "assistant"; content: string } =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-MAX_MESSAGES)
    .map((m) => ({
      role: m.role,
      content: m.content.trim().slice(0, MAX_CONTENT),
    }));

  if (messages.length === 0 || messages[messages.length - 1]?.role !== "user") {
    return jsonError("Send a question for Celerey to answer.", 400);
  }

  let focusClientId: string | null =
    typeof body?.clientId === "string" && isClientId(body.clientId) ? body.clientId : null;

  if (session.profile.role === "client") {
    focusClientId = session.profile.client_id;
  } else if (focusClientId) {
    const client = await getClientById(focusClientId);
    if (!client || !canAccessClient(session.profile, client.id, client.advisor_id)) {
      return jsonError("You cannot ask Celerey about that client.", 403);
    }
  }

  try {
    const { context, audience } = await buildCelereyContext({
      profile: session.profile,
      focusClientId,
    });

    const stream = await streamCelereyChat(
      [
        { role: "system", content: buildCelereySystemPrompt(audience) },
        {
          role: "system",
          content: `Client data you may use:\n\n${context}`,
        },
        ...messages,
      ],
      request.signal,
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    if (error instanceof CelereyModelError) {
      return jsonError(error.message, error.status);
    }
    const message = error instanceof Error ? error.message : "Celerey could not reply.";
    return jsonError(message, 500);
  }
}
