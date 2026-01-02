"use client";

import { useState } from "react";
import { WidgetFooter } from "../components/widget-footer";
import { WidgetHeader } from "../components/widget-header";

type WidgetScreen = "selection" | "inbox";

interface Props {
  organizationId: string;
}

export const WidgetView = ({ organizationId }: Props) => {
  const [screen, setScreen] = useState<WidgetScreen>("selection");

  return (
    <main className="min-h-screen min-w-screen flex h-full w-full flex-col overflow-hidden rounded-xl border bg-muted">
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className=" text-3xl">Hi there! 👋</p>
          <p className="text-lg">How can we help you today?</p>
        </div>
      </WidgetHeader>
      <div className="flex-1 p-4">
        Widget View: {organizationId}
        <br />
        Current screen: <strong>{screen}</strong>
      </div>

      <WidgetFooter screen={screen} onScreenChange={setScreen} />
    </main>
  );
};
