import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";

import { H1, Lead, Muted } from "@/components/ui/typography";

const steps = [
  { label: "Verify your identity", done: false },
  { label: "Tell us about your financial goals", done: false },
  { label: "Connect with an advisor", done: false },
];

export default function OnboardingPage() {
  return (
    <div
      className="flex min-h-svh items-center justify-center px-6 py-16"
      style={{
        background:
          "linear-gradient(165deg, #f8f8f7 0%, #f4f5f7 45%, #f0f2f6 100%)",
      }}
    >
      <div className="flex w-full max-w-md flex-col gap-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <Image
              src="/logos/ja-symbol-white.png"
              alt="JA Wealth"
              width={36}
              height={36}
              className="size-9 object-contain"
              priority
            />
          </div>
          <div className="flex flex-col gap-2">
            <H1>Welcome to JA Wealth</H1>
            <Lead>
              Before we take you to your dashboard, let&apos;s get a few things
              set up so your experience is personalised from day one.
            </Lead>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          {steps.map((step, index) => (
            <div
              key={step.label}
              className="flex items-center gap-4 rounded-lg px-1 py-2"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
                {step.done ? (
                  <CheckCircle2 className="size-4 text-brand-accent" />
                ) : (
                  <span className="font-subheading text-sm font-semibold text-muted-foreground">
                    {index + 1}
                  </span>
                )}
              </div>
              <Muted className="flex-1 text-foreground">{step.label}</Muted>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            Get started
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Skip for now
          </Link>
        </div>
      </div>
    </div>
  );
}
