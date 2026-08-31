"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Bell, LogOut, User } from "lucide-react";

import { signOut } from "@/app/auth/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

interface DashboardTopBarActionsProps {
  accountLabel?: string;
  userName?: string;
  userInitials?: string;
  profileHref?: string;
}

function DashboardTopBarActions({
  accountLabel = "Account",
  userName = "User",
  userInitials = "U",
  profileHref,
}: DashboardTopBarActionsProps) {
  const [pending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(() => {
      void signOut();
    });
  }

  return (
    <div className="flex shrink-0 items-center gap-3">
      <Button
        variant="outline"
        size="icon"
        className="size-9 rounded-full"
        aria-label="Notifications"
      >
        <Bell className="size-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-lg px-2 py-1 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar size="sm">
            <AvatarFallback className="bg-brand-primary text-xs font-semibold text-white">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground">
            {userName.split(" ")[0]}
          </span>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="font-normal">
            <p className="text-sm font-semibold">{userName}</p>
            <p className="text-xs text-muted-foreground">{accountLabel}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {profileHref && (
              <DropdownMenuItem render={<Link href={profileHref} />}>
                <User className="size-4" />
                Settings
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              variant="destructive"
              disabled={pending}
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              {pending ? "Signing out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export { DashboardTopBarActions };
