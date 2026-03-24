"use client";

import {
  GlobeIcon,
  PhoneCallIcon,
  PhoneIcon,
  WorkflowIcon,
} from "lucide-react";
import { useOrganization } from "@clerk/nextjs";
import { Feature, PluginCard } from "../components/plugin-card";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useEffect, useState } from "react";
import { VapiPluginForm } from "../components/vapi-form";
import { VapiConnectView } from "../components/vapi-connected-view";
import { VapiPluginRemoveForm } from "../components/vapi-remove-form";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { resetVapiDataCache } from "../../hooks/use-vapi-data";
const vapiFeatures: Feature[] = [
  {
    icon: GlobeIcon,
    label: "Web voice calls",
    description: "Voice chat directly in your app",
  },
  {
    icon: PhoneIcon,
    label: "Phone numbers",
    description: "Get dedicated business lines",
  },
  {
    icon: PhoneCallIcon,
    label: "Outbound calls",
    description: "Automated customer outreach",
  },
  {
    icon: WorkflowIcon,
    label: "Workflows",
    description: "Custom conversation flows",
  },
];

export const VapiView = () => {
  const { organization } = useOrganization();
  const vapiPlugin = useQuery(api.private.plugins.getOne, { service: "vapi" });

  const [connectOpen, setConnectOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  useEffect(() => {
    resetVapiDataCache();
  }, [organization?.id]);

  const toggleConnection = () => {
    if (vapiPlugin) {
      setRemoveOpen(true);
    } else {
      setConnectOpen(true);
    }
  };
  return (
    <>
      <VapiPluginForm open={connectOpen} setOpen={setConnectOpen} />
      <VapiPluginRemoveForm open={removeOpen} setOpen={setRemoveOpen} />
      <div className="flex min-h-screen flex-col bg-muted p-8">
        <div className="mx-auto w-full max-w-3xl">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl">Vapi Plugin</h1>
            <p className="text-muted-foreground">
              Connect Vapi to enable AI voice calls and phone support
            </p>

            <div className="mt-8">
              {vapiPlugin === undefined ? (
                <div className="h-fit w-full rounded-lg border bg-background p-8">
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ) : vapiPlugin ? (
                <VapiConnectView onDisconnect={toggleConnection} />
              ) : (
                <PluginCard
                  serviceImage="/vapi.jpg"
                  serviceName="Vapi"
                  features={vapiFeatures}
                  isDisabled={false}
                  onSubmit={toggleConnection}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
