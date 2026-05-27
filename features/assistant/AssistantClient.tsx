"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Bot, MessageSquare, Send, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  clearAssistantContext,
  loadAssistantContext,
} from "@/lib/assistant-context";
import type { AssistantContext, AssistantMessage } from "@/types/integrations";
import { cn } from "@/lib/utils";

const STARTER_PROMPTS = [
  "When should I see a doctor?",
  "What self-care steps should I try first?",
  "Can you explain the urgency level?",
  "How do I set medicine reminders?",
];

export function AssistantClient() {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [context, setContext] = useState<AssistantContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setContext(loadAssistantContext());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: AssistantMessage = { role: "user", content: trimmed };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: nextMessages, context }),
        });

        const data = (await res.json()) as {
          message?: string;
          disclaimer?: string;
          demoMode?: boolean;
          error?: string;
        };

        if (!res.ok || !data.message) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: data.error ?? "Sorry, I couldn't respond. Please try again.",
            },
          ]);
          return;
        }

        setDemoMode(Boolean(data.demoMode));
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message! },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Network error — check your connection and try again.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [context, loading, messages]
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  function dismissContext() {
    clearAssistantContext();
    setContext(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
      <Card className="flex min-h-[480px] flex-col p-0">
        <section className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bot className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">Health Assistant</h2>
              <p className="text-xs text-muted">Follow-up chat after symptom checks</p>
            </div>
          </div>
          <Badge variant={demoMode ? "warning" : "success"} className="gap-1">
            <Sparkles className="h-3 w-3" />
            {demoMode ? "Demo" : "Live AI"}
          </Badge>
        </section>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
          {messages.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="Ask a follow-up question"
              description="Chat about your symptom check results, when to seek care, reminders, or appointments. Run a symptom check first for the best context."
            />
          ) : (
            messages.map((msg, i) => (
              <div
                key={`${msg.role}-${i}`}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </span>
                )}
                <p
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-muted/10 text-foreground"
                  )}
                >
                  {msg.content}
                </p>
                {msg.role === "user" && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                    <User className="h-4 w-4" />
                  </span>
                )}
              </div>
            ))
          )}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <LoadingSpinner size="sm" />
              Assistant is thinking...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex gap-2 border-t border-border p-4"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about symptoms, care timing, reminders..."
            disabled={loading}
            className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Message to health assistant"
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
            Send
          </Button>
        </form>
      </Card>

      <aside className="space-y-4">
        {context?.symptoms && (
          <Card className="p-4">
            <h3 className="text-sm font-semibold">Symptom context</h3>
            <p className="mt-2 text-sm text-muted">{context.symptoms}</p>
            {context.possibleConditions && (
              <p className="mt-2 text-xs text-muted">
                Possible: {context.possibleConditions.join(", ")}
              </p>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={dismissContext}
            >
              Clear context
            </Button>
          </Card>
        )}

        <Card className="p-4">
          <h3 className="text-sm font-semibold">Quick prompts</h3>
          <ul className="mt-3 space-y-2">
            {STARTER_PROMPTS.map((prompt) => (
              <li key={prompt}>
                <button
                  type="button"
                  onClick={() => void sendMessage(prompt)}
                  disabled={loading}
                  className="w-full rounded-lg border border-border px-3 py-2 text-left text-xs text-muted transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-foreground disabled:opacity-50"
                >
                  {prompt}
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <p className="text-xs leading-relaxed text-muted">
            Educational demo only — not medical diagnosis. For emergencies, use{" "}
            <Link href="/emergency" className="text-primary underline">
              Emergency SOS
            </Link>
            .
          </p>
        </Card>
      </aside>
    </div>
  );
}
