"use client";

import { getCountryFlagUrl, getCountryFromTImezone } from "@/lib/country-utils";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";

import Bowser from "bowser";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Button } from "@workspace/ui/components/button";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { useQuery } from "convex/react";
import { ClockIcon, GlobeIcon, MailIcon, MonitorIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type InfoItem = {
  label: string;
  value: string | React.ReactNode;
  className?: string;
};

type InfoSection = {
  id: string;
  icon: React.FC<{ className?: string }>;
  title: string;
  items: InfoItem[];
};

export const ContactPanel = () => {
  const params = useParams();
  const conversationId = params.conversationId as Id<"conversations"> | null;

  const [localTime, setLocalTime] = useState<string>("");
  const [localDate, setLocalDate] = useState<string>("");

  const contactSession = useQuery(
    api.private.contactSessions.getOneByConversationId,
    conversationId
      ? {
          conversationId,
        }
      : "skip",
  );

  useEffect(() => {
    const timezone = contactSession?.metadata?.timezone;
    if (!timezone) return;

    const tick = () => {
      const now = new Date();

      setLocalTime(
        now.toLocaleTimeString("en-US", {
          timeZone: timezone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      );

      setLocalDate(
        now.toLocaleDateString("en-US", {
          timeZone: timezone,
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      );
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [contactSession?.metadata?.timezone]);

  const parseUserAgent = useMemo(() => {
    return (userAgent?: string) => {
      if (!userAgent) {
        return { browser: "Unknown", os: "Unknown", device: "Unknown" };
      }

      const browser = Bowser.getParser(userAgent);
      const result = browser.getResult();

      return {
        browser: result.browser.name || "Unknown",
        browserVersion: result.browser.version || "",
        os: result.os.name || "Unknown",
        osVersion: result.os.version || "",
        device: result.platform.type || "desktop",
        deviceVendor: result.platform.vendor || "",
        deviceModel: result.platform.model || "",
      };
    };
  }, []);

  const userAgentInfo = useMemo(
    () => parseUserAgent(contactSession?.metadata?.userAgent),
    [contactSession?.metadata?.userAgent, parseUserAgent],
  );
  const countryInfo = useMemo(() => {
    return getCountryFromTImezone(contactSession?.metadata?.timezone);
  }, [contactSession?.metadata?.timezone]);

  const accordionSections = useMemo<InfoSection[]>(() => {
    if (!contactSession?.metadata) {
      return [];
    }

    return [
      {
        id: "device-info",
        icon: MonitorIcon,
        title: "Device Information",
        items: [
          {
            label: "Browser",
            value:
              userAgentInfo.browser +
              (userAgentInfo.browserVersion
                ? ` ${userAgentInfo.browserVersion} `
                : ""),
          },
          {
            label: "OS",
            value:
              userAgentInfo.os +
              (userAgentInfo.osVersion ? ` ${userAgentInfo.osVersion}` : ""),
          },
          {
            label: "Device",
            value:
              userAgentInfo.device +
              (userAgentInfo.deviceModel
                ? ` ${userAgentInfo.deviceModel}`
                : ""),
            className: "capitalize",
          },
          {
            label: "Screen",
            value: contactSession.metadata.screenResolution,
          },
          {
            label: "Viewport",
            value: contactSession.metadata.viewportSize,
          },
          {
            label: "Cookies",
            value: contactSession.metadata.cookieEnabled
              ? "Enabled"
              : "Disabled",
          },
        ],
      },
      {
        id: "location-info",
        icon: GlobeIcon,
        title: "Location & Language",
        items: [
          ...(countryInfo?.code && countryInfo?.name
            ? [
                {
                  label: "Country",
                  value: (
                    <span className="flex items-center gap-1.5">
                      <Image
                        src={getCountryFlagUrl(countryInfo.code)}
                        alt={countryInfo.name}
                        width={20}
                        height={14}
                        className="rounded-sm object-cover h-4 w-6"
                      />
                      {countryInfo.name}
                    </span>
                  ),
                },
              ]
            : []),
          {
            label: "Language",
            value: contactSession.metadata.language,
          },
          {
            label: "Timezone",
            value: contactSession.metadata.timezone,
          },
          {
            label: "UTC Offset",
            value: (() => {
              const timezone = contactSession.metadata.timezone;
              if (!timezone) return "Unknown";

              //  Derive offset from IANA timezone string, not stored timezoneOffset
              const formatter = new Intl.DateTimeFormat("en-US", {
                timeZone: timezone,
                timeZoneName: "shortOffset",
              });
              const parts = formatter.formatToParts(new Date());
              const offsetPart = parts.find(
                (p) => p.type === "timeZoneName",
              )?.value;
              // offsetPart is already formatted as "GMT-5" — just replace GMT with UTC
              return offsetPart?.replace("GMT", "UTC") ?? "Unknown";
            })(),
          },
        ],
      },
      {
        id: "session-details",
        icon: ClockIcon,
        title: "Session details",
        items: [
          {
            label: "Session Started",
            value: new Date(contactSession._creationTime).toLocaleString(
              "en-US",
              {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
                month: "short",
                day: "numeric",
                year: "numeric",
              },
            ),
          },
        ],
      },
    ];
  }, [contactSession?.metadata, userAgentInfo]);

  if (contactSession === undefined || contactSession === null) {
    return null;
  }
  return (
    <div className="flex h-full w-full flex-col bg-background text-foreground">
      <div className="flex flex-col gap-y-4 p-4">
        <div className="flex items-center gap-x-2">
          <DicebearAvatar
            badgeImageUrl={
              countryInfo?.code
                ? getCountryFlagUrl(countryInfo.code)
                : undefined
            }
            seed={contactSession?._id}
            size={42}
          />
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-x-2">
              <h4 className="line-clamp-1">{contactSession.name}</h4>
            </div>
            <p className="line-clamp-1 text-muted-foreground text-sm">
              {contactSession.email}
            </p>
          </div>
        </div>

        <Button asChild className="w-full" size="lg">
          <Link href={`mailto: ${contactSession.email}`}>
            <MailIcon />
            <span>Send Email</span>
          </Link>
        </Button>
      </div>

      <div>
        {" "}
        {contactSession.metadata && (
          <Accordion
            className="w-ful rounded-none border"
            collapsible
            type="single"
          >
            {accordionSections.map((section) => (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="rounded-none outline-none has-focus-visible:z-10 has-focus-visible::border-ring has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50"
              >
                <AccordionTrigger className="w-full flex-1 items-start justify-between gap-4 rounded-none bg-accent px-5 py-4 text-left font-medium  text-sm outline-none transition-all hover:no-underline disabled:pointer-events-none disabled:opacity-50">
                  <div className="flex items-center gap-4">
                    <section.icon className="size-4 shrink-0" />
                    <span>{section.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 py-4">
                  <div className="space-y-2 text-sm">
                    {section.items.map((item) => (
                      <div
                        className="flex justify-between"
                        key={`${section.id}-${item.label}`}
                      >
                        <span className="text-muted-foreground">
                          {item.label}
                        </span>
                        <span className={item.className}>{item.value}</span>
                      </div>
                    ))}

                    {section.id === "location-info" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Local Date
                          </span>
                          <span>{localDate || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Local Time
                          </span>
                          <span className="font-mono tabular-nums">
                            {localTime || "—"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
};
