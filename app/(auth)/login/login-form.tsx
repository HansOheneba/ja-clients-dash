"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";

import { sendLoginOtp } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { H2 } from "@/components/ui/typography";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="mt-2 w-full bg-brand-accent text-white hover:bg-brand-accent/90"
    >
      {pending ? "Sending code..." : "Send code"}
    </Button>
  );
}

export default function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const email = searchParams.get("email") ?? "";
  const next = searchParams.get("next") ?? "";
  const isRateLimited = error?.toLowerCase().includes("too many") ?? false;

  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <div className="flex flex-col gap-1">
        <p className="text-body-sm text-white/60">Welcome</p>
        <H2 className="text-white">Sign in to your account</H2>
        <p className="mt-1 text-body-sm text-white/50">
          Enter your email and we&apos;ll send you a one-time code.
        </p>
        {error && (
          <div className="mt-2 space-y-2 text-body-sm text-red-300">
            <p>{error}</p>
            {isRateLimited && (
              <p className="text-white/50">
                Please wait before requesting another code, or enter a code from a
                recent email.
              </p>
            )}
          </div>
        )}
      </div>

      <form className="flex flex-col gap-4" action={sendLoginOtp}>
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-white/80">
            Email address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={email}
            placeholder="you@example.com"
            autoComplete="email"
            required
            className="border-white/20 bg-white/10 text-white placeholder:text-white/40 focus-visible:border-white/50 focus-visible:ring-white/20"
          />
        </div>

        <SubmitButton />
      </form>

      {email && (
        <p className="text-body-sm text-white/50">
          Already have a code?{" "}
          <Link
            href={`/login/verify?email=${encodeURIComponent(email)}${next ? `&next=${encodeURIComponent(next)}` : ""}`}
            className="font-medium text-white underline-offset-4 hover:underline"
          >
            Enter it here
          </Link>
        </p>
      )}
    </div>
  );
}
