"use client";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { useMutation, useQuery } from "convex/react";

export default function Page() {
  const users = useQuery(api.users.getMany);
  const createUser = useMutation(api.users.createUser);
  return (
    <div className="flex flex-col items-center justify-center min-h-svh">
      <p>Hello apps/widget</p>
      <Button onClick={() => createUser({ name: "Babalola" })}>Add</Button>
      <div>{JSON.stringify(users, null, 2)}</div>
    </div>
  );
}
