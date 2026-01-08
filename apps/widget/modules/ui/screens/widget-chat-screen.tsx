"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  contactSessionIdAtomFamily,
  conversationIdAtom,
  organizationIdAtom,
  screenAtom,
} from "@/modules/widget/atoms/widget-atoms";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { useAction, useQuery } from "convex/react";
import { useAtomValue, useSetAtom } from "jotai";
import { ArrowLeftIcon, MenuIcon } from "lucide-react";
import { WidgetHeader } from "../components/widget-header";

import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@workspace/ui/components/ai/conversation";
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
import { AISuggestion } from "@workspace/ui/components/ai/suggestion";
import { useThreadMessages, toUIMessages } from "@convex-dev/agent/react";

import { Id } from "@workspace/backend/_generated/dataModel";
import { Form, FormField } from "@workspace/ui/components/form";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { DicebearAvatar } from "./../../../../../packages/ui/src/components/dicebear-avatar";
import { AIMessageSkeleton } from "./../../../../../packages/ui/src/components/ai/chat-message-skeleton";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

type FormSchema = z.infer<typeof formSchema>;

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
      ? {
          conversationId,
          contactSessionId,
        }
      : "skip"
  );

  const messages = useThreadMessages(
    api.public.messages.getMany,
    conversation?.threadId && contactSessionId
      ? {
          threadId: conversation.threadId,
          contactSessionId,
        }
      : "skip",
    { initialNumItems: 10 }
  );

  const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } =
    useInfiniteScroll({
      status: messages.status,
      loadMore: messages.loadMore,
      loadSize: 10,
    });

  // FORM SUBMISSION
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
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
    <>
      <WidgetHeader className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <Button size="icon" variant="transparent" onClick={onBack}>
            <ArrowLeftIcon />
          </Button>
          <p>Chat</p>
        </div>

        <Button size="icon" variant="transparent">
          <MenuIcon />
        </Button>
      </WidgetHeader>
      <AIConversation className="mt-20 pb-30">
        <AIConversationContent>
          <InfiniteScrollTrigger
            canLoadMore={canLoadMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
            ref={topElementRef}
          />

          {/* Initial loading: show 6-8 skeleton messages */}
          {messages.status === "LoadingFirstPage" && (
            <>
              {Array.from({ length: 7 }).map((_, i) => (
                <AIMessageSkeleton
                  key={`skeleton-${i}`}
                  from={i % 2 === 0 ? "assistant" : "user"} // alternate sides for realism
                />
              ))}
            </>
          )}

          {/* Loaded messages */}
          {messages.status !== "LoadingFirstPage" &&
            toUIMessages(messages.results ?? [])?.map((message) => (
              <AIMessage
                from={message.role === "user" ? "user" : "assistant"}
                key={message.id}
              >
                <AIMessageContent>
                  <AIResponse>{message.content}</AIResponse>
                </AIMessageContent>

                {message?.role === "assistant" && (
                  <DicebearAvatar
                    imageUrl="/logo.svg"
                    seed="assistant"
                    size={32}
                  />
                )}
                {message?.role === "user" && (
                  <DicebearAvatar seed="user" size={32} />
                )}
              </AIMessage>
            ))}

          {/* Loading more older messages */}
          {isLoadingMore && (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <AIMessageSkeleton key={`loading-more-${i}`} from="assistant" />
              ))}
            </>
          )}
        </AIConversationContent>
      </AIConversation>
      {/* TODO: Add Ssuggestion */}
      <Form {...form}>
        <AIInput
          className="rounded-none border-x-0 border-b-0 fixed w-full bottom-0"
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
    </>
  );
};
