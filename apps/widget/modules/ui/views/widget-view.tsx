"use client";

import { useState } from "react";
import { WidgetAuthScreen } from "../screens/widget-auth-screen";

type WidgetScreen = "selection" | "inbox";

interface Props {
  organizationId: string;
}

export const WidgetView = ({ organizationId }: Props) => {
  const [screen, setScreen] = useState<WidgetScreen>("selection");

  return (
    <main className="min-h-screen min-w-screen flex h-full w-full flex-col overflow-hidden rounded-xl border bg-muted">
      <WidgetAuthScreen />

      {/* <WidgetFooter screen={screen} onScreenChange={setScreen} /> */}
    </main>
  );
};
