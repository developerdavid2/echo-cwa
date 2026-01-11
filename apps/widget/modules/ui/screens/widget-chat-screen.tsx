"use client";

import {
  contactSessionIdAtomFamily,
  conversationIdAtom,
  organizationIdAtom,
  screenAtom,
} from "@/modules/widget/atoms/widget-atoms";
import { toUIMessages, useThreadMessages } from "@convex-dev/agent/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import {
  AIInput,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from "@workspace/ui/components/ai/input";
import {
  AIMessage,
  AIMessageContent,
} from "@workspace/ui/components/ai/message";
import { AIResponse } from "@workspace/ui/components/ai/response";
import { Button } from "@workspace/ui/components/button";
import { Form, FormField } from "@workspace/ui/components/form";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { useAction, useQuery } from "convex/react";
import { useAtomValue, useSetAtom } from "jotai";
import { ArrowDownIcon, ArrowLeftIcon, MenuIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import ScrollToBottom, {
  useScrollToBottom,
  useSticky,
} from "react-scroll-to-bottom";
import { z } from "zod";
import { WidgetHeader } from "../components/widget-header";
import { AIMessageSkeleton } from "@workspace/ui/components/ai/chat-message-skeleton";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

type FormSchema = z.infer<typeof formSchema>;

// Separate component for chat content to access ScrollToBottom hooks
const ChatContent = ({
  messages,
  canLoadMore,
  isLoadingMore,
  handleLoadMore,
  topElementRef,
  conversation,
}: {
  messages: ReturnType<typeof useThreadMessages>;
  conversation: ReturnType<typeof useQuery>;
  canLoadMore: boolean;
  isLoadingMore: boolean;
  handleLoadMore: () => void;
  topElementRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const scrollToBottom = useScrollToBottom();
  const [sticky] = useSticky();

  return (
    <>
      <div className="p-4">
        {/* Sentry at top for loading older messages */}
        <InfiniteScrollTrigger
          canLoadMore={canLoadMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={handleLoadMore}
          ref={topElementRef}
          noMoreText=""
        />

        {/* Initial loading */}
        {messages.status === "LoadingFirstPage" && (
          <>
            {Array.from({ length: 7 }).map((_, i) => (
              <AIMessageSkeleton
                key={`skeleton-${i}`}
                from={i % 2 === 0 ? "assistant" : "user"}
              />
            ))}
          </>
        )}

        {/* Messages */}
        {messages.status !== "LoadingFirstPage" && (
          <>
            {toUIMessages(messages.results ?? [])?.map((message) => {
              // Find the original message to get _creationTime
              const originalMessage = messages.results?.find(
                (m) => m._id === message.id
              );
              const messageFrom =
                message.role === "user" ? "user" : "assistant";

              return (
                <AIMessage
                  from={messageFrom}
                  key={message.id}
                  timestamp={originalMessage?._creationTime}
                >
                  <AIMessageContent
                    timestamp={originalMessage?._creationTime}
                    from={messageFrom}
                  >
                    <AIResponse>{message.content}</AIResponse>
                  </AIMessageContent>

                  {message?.role === "assistant" && (
                    <DicebearAvatar
                      imageUrl={
                        conversation?.status === "escalated" ||
                        conversation?.status === "resolved"
                          ? ""
                          : "/logo.svg"
                      }
                      seed={
                        conversation?.status === "escalated" ||
                        conversation?.status === "resolved"
                          ? "user"
                          : "assistant"
                      }
                      size={32}
                      badgeImageUrl={
                        conversation?.status === "escalated" ||
                        conversation?.status === "resolved"
                          ? "/logo.svg"
                          : ""
                      }
                    />
                  )}
                </AIMessage>
              );
            })}
          </>
        )}
      </div>

      {/* Custom scroll to bottom button - only show when not sticky */}
      {!sticky && (
        <Button
          size="icon"
          variant="secondary"
          onClick={() => scrollToBottom()}
          className="fixed bottom-24 right-4 z-50 h-12 w-12 rounded-full shadow-2xl bg-background border border-border hover:scale-110 transition-all duration-200"
        >
          <ArrowDownIcon className="h-6 w-6" />
          <span className="sr-only">Scroll to latest message</span>
        </Button>
      )}
    </>
  );
};

export const WidgetChatScreen = () => {
  const organizationId = useAtomValue(organizationIdAtom);
  const conversationId = useAtomValue(conversationIdAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );

  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);

  const onBack = () => {
    setConversationId(null);
    setScreen("inbox");
  };

  const conversation = useQuery(
    api.public.conversations.getOne,
    conversationId && contactSessionId
      ? { conversationId, contactSessionId }
      : "skip"
  );

  const messages = useThreadMessages(
    api.public.messages.getMany,
    conversation?.threadId && contactSessionId
      ? { threadId: conversation.threadId, contactSessionId }
      : "skip",
    { initialNumItems: 10 }
  );

  const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } =
    useInfiniteScroll({
      status: messages.status,
      loadMore: messages.loadMore,
      loadSize: 10,
    });

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { message: "" },
  });

  const createMessage = useAction(api.public.messages.create);

  const onSubmit = async (values: FormSchema) => {
    if (!conversation) return;

    await createMessage({
      threadId: conversation.threadId,
      prompt: values.message,
      contactSessionId: contactSessionId as Id<"contactSessions">,
    });

    form.reset({ message: "" });
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Fixed Header */}
      <WidgetHeader className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-x-3">
          <Button size="icon" variant="transparent" onClick={onBack}>
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <p className="font-medium">Chat</p>
        </div>
        <Button size="icon" variant="transparent">
          <MenuIcon className="h-5 w-5" />
        </Button>
      </WidgetHeader>

      {/* Scrollable Chat Area - Let ScrollToBottom handle the scroll */}
      <div className="flex-1 overflow-hidden">
        <ScrollToBottom
          className="h-full"
          initialScrollBehavior="auto"
          followButtonClassName="hidden"
        >
          <ChatContent
            messages={messages}
            canLoadMore={canLoadMore}
            isLoadingMore={isLoadingMore}
            topElementRef={topElementRef}
            handleLoadMore={handleLoadMore}
            conversation={conversation}
          />
        </ScrollToBottom>
      </div>

      {/* Fixed Footer Input */}
      <div className="shrink-0">
        <Form {...form}>
          <AIInput
            className="rounded-none border-x-0 border-t border-border bg-background"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <AIInputTextarea
                  {...field}
                  value={field.value}
                  disabled={conversation?.status === "resolved"}
                  placeholder={
                    conversation?.status === "resolved"
                      ? "This conversation has been resolved."
                      : "Type your message..."
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      form.handleSubmit(onSubmit)();
                    }
                  }}
                />
              )}
            />
            <AIInputToolbar>
              <AIInputTools />
              <AIInputSubmit
                disabled={
                  conversation?.status === "resolved" || !form.formState.isValid
                }
                status="ready"
                type="submit"
              />
            </AIInputToolbar>
          </AIInput>
        </Form>
      </div>
    </div>
  );
};
