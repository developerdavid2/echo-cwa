"use client";

import { SignInButton, UserButton } from "@clerk/nextjs";
import { api } from "@workspace/backend/_generated/api";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";

export default function Page() {
  const users = useQuery(api.users.getMany);

  return (
    <>
      <Authenticated>
        <div className="flex items-center justify-center min-h-svh">
          <div className="flex flex-col items-center justify-center gap-4">
            <div>Hello apps/web</div>
            <UserButton />
            <div>{JSON.stringify(users, null, 2)}</div>
          </div>
        </div>
      </Authenticated>
      <Unauthenticated>
        <p>You must sign in to access page</p>
        <SignInButton />
      </Unauthenticated>
    </>
  );
}
