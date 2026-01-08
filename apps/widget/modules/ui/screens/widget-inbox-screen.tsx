"use client";

import {
  contactSessionIdAtomFamily,
  conversationIdAtom,
  organizationIdAtom,
  screenAtom,
} from "@/modules/widget/atoms/widget-atoms";
import { Button } from "@workspace/ui/components/button";
import { useAtomValue, useSetAtom } from "jotai";
import { ArrowLeftIcon } from "lucide-react";
import { WidgetFooter } from "../components/widget-footer";
import { WidgetHeader } from "../components/widget-header";
import { usePaginatedQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { formatDistanceToNow } from "date-fns";
import { ConversationStatusIcon } from "./../../../../../packages/ui/src/components/conversation-status-icon";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { ConversationSkeleton } from "./../../../../../packages/ui/src/components/conversation-skeleton";
import Image from "next/image";
export const WidgetInboxScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);
  const organizationId = useAtomValue(organizationIdAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );
  const conversations = usePaginatedQuery(
    api.public.conversations.getMany,
    contactSessionId ? { contactSessionId } : "skip",
    { initialNumItems: 10 }
  );

  const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } =
    useInfiniteScroll({
      status: conversations.status,
      loadMore: conversations.loadMore,
      loadSize: 10,
    });

  const isInitialLoading = conversations.status === "LoadingFirstPage";
  const isLoadingMoreConversation = conversations.status === "LoadingMore";

  // Show 6-8 skeleton items during initial load
  const skeletonCount = 6;

  return (
    <>
      <WidgetHeader>
        <div className="flex items-center gap-x-2">
          <Button
            size="icon"
            variant="transparent"
            onClick={() => setScreen("selection")}
          >
            <ArrowLeftIcon />
          </Button>
          <p>Inbox</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col gap-y-2 p-4 overflow-y-auto mt-20">
        {isInitialLoading && (
          <>
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <ConversationSkeleton key={`skeleton-${i}`} />
            ))}
          </>
        )}
        {!isInitialLoading && conversations?.results.length > 0 && (
          <>
            {conversations?.results.length > 0 &&
              conversations.results.map((conversation) => (
                <Button
                  className="h-20 w-full justify-between group"
                  key={conversation._id}
                  onClick={() => {
                    setConversationId(conversation._id);
                    setScreen("chat");
                  }}
                  variant="outline"
                >
                  <div className="flex w-full flex-col gap-4 overflow-hidden text-start">
                    <div className="flex w-full items-center justify-between gap-x-2">
                      <p className="text-muted-foreground text-xs">Chat</p>
                      <p className="text-muted-foreground text-xs">
                        {formatDistanceToNow(
                          new Date(conversation._creationTime)
                        )}
                      </p>
                    </div>
                    <div className="flex w-full items-center justify-between gap-x-2">
                      <p className="truncate text-sm group-hover:font-semibold">
                        {conversation.lastMessage?.text}
                      </p>
                      <ConversationStatusIcon
                        status={conversation.status}
                        className="shrink-0"
                      />
                    </div>
                  </div>
                </Button>
              ))}
            {/* Loading more indicator at bottom */}
            {isLoadingMore && (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <ConversationSkeleton key={`loading-more-${i}`} />
                ))}
              </>
            )}
          </>
        )}

        {/* Empty state (optional) */}
        {!isInitialLoading && conversations?.results.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center pt-10">
            <Image
              src="/empty-inbox.png"
              alt="Empty inbox"
              width={300}
              height={300}
              priority
              className="mb-8"
            />

            <h2 className="text-2xl font-semibold text-foreground mb-4 pt-20">
              Your inbox is empty
            </h2>

            <p className="text-muted-foreground mb-8 max-w-sm">
              Start a conversation with a customer support agent
            </p>

            <Button
              size="lg"
              onClick={() => {
                setScreen("chat");
              }}
            >
              Start new chat
            </Button>
          </div>
        )}

        <InfiniteScrollTrigger
          canLoadMore={canLoadMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={handleLoadMore}
          ref={topElementRef}
          noMoreText={
            conversations?.results.length === 0 ? "" : "No more items"
          }
        />
      </div>
      <WidgetFooter />
    </>
  );
};
