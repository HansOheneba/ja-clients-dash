const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const DEFAULT_MODEL = "deepseek-v4-flash";

export type ChatTurn = {
  role: "user" | "assistant" | "system";
  content: string;
};

function getApiKey() {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) {
    throw new CelereyModelError(
      "Celerey is not configured. Add DEEPSEEK_API_KEY on the server.",
      503,
    );
  }
  return apiKey;
}

function requestBody(messages: ChatTurn[], stream: boolean) {
  return {
    model: process.env.DEEPSEEK_MODEL?.trim() || DEFAULT_MODEL,
    messages,
    temperature: 0.3,
    max_tokens: 2048,
    thinking: { type: "disabled" },
    stream,
  };
}

export async function streamCelereyChat(
  messages: ChatTurn[],
  signal?: AbortSignal,
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody(messages, true)),
    signal,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null;
    const detail = (payload?.error?.message ?? `HTTP ${response.status}`).slice(0, 180);
    throw new CelereyModelError(`Celerey could not reach the model. ${detail}`, 502);
  }

  if (!response.body) {
    throw new CelereyModelError("Celerey returned an empty stream.", 502);
  }

  return relayDeepSeekStream(response.body);
}

function relayDeepSeekStream(upstream: ReadableStream<Uint8Array>) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.getReader();
      let buffer = "";

      const send = (payload: Record<string, string>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (!data || data === "[DONE]") continue;

            let parsed: {
              choices?: Array<{ delta?: { content?: string | null } }>;
            };
            try {
              parsed = JSON.parse(data) as typeof parsed;
            } catch {
              continue;
            }

            const delta = parsed.choices?.[0]?.delta?.content;
            if (typeof delta === "string" && delta.length > 0) {
              send({ delta });
            }
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          controller.close();
          return;
        }
        const message =
          error instanceof Error ? error.message : "Celerey could not complete that request.";
        send({ error: message });
        controller.close();
      } finally {
        reader.releaseLock();
      }
    },
    cancel() {
      upstream.cancel().catch(() => undefined);
    },
  });
}

export class CelereyModelError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "CelereyModelError";
    this.status = status;
  }
}
