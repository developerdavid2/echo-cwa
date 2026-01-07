"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Button } from "@workspace/ui/components/button";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <div>Hello apps/web</div>
        <UserButton />
        <OrganizationSwitcher hidePersonal={true} />
      </div>
    </div>
  );
}
