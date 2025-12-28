"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { api } from "@workspace/backend/_generated/api";
import { useQuery } from "convex/react";

export default function Page() {
  const users = useQuery(api.users.getMany);

  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <div>Hello apps/web</div>
        <UserButton />
        <OrganizationSwitcher hidePersonal={true} />
        <div>{JSON.stringify(users, null, 2)}</div>
      </div>
    </div>
  );
}
