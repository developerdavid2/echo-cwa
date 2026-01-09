"use client";

import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";

import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@workspace/ui/components/ai/conversation";
import {
  AIInput,
  AIInputButton,
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
import { useAction, useMutation, useQuery } from "convex/react";
import { MoreHorizontalIcon, Wand2Icon } from "lucide-react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toUIMessages, useThreadMessages } from "@convex-dev/agent/react";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { Form } from "@workspace/ui/components/form";
import { FormField } from "@workspace/ui/components/form";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

type FormSchema = z.infer<typeof formSchema>;
export const ConversationIdView = ({
  conversationId,
}: {
  conversationId: Id<"conversations">;
}) => {
  const conversation = useQuery(
    api.private.conversations.getOne,
    conversationId
      ? {
          conversationId,
        }
      : "skip"
  );

  const messages = useThreadMessages(
    api.private.messages.getMany,
    conversation?.threadId
      ? {
          threadId: conversation.threadId,
        }
      : "skip",
    { initialNumItems: 10 }
  );

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const createMessage = useMutation(api.private.messages.create);
  const onSubmit = async (values: FormSchema) => {
    if (!conversation) return;

    try {
      await createMessage({
        conversationId,
        prompt: values.message,
      });

      form.reset({ message: "" });
    } catch (error) {
      console.error(error);
    }
  };

  console.log(messages);

  return (
    <div className="flex h-full flex-col bg-muted">
      <header className="flex items-center justify-between border-b bg-background p-2.5">
        <Button size="sm" variant="ghost">
          <MoreHorizontalIcon />
        </Button>
      </header>
      <AIConversation className="max-h-[calc(100vh-180px)]">
        <AIConversationContent>
          {toUIMessages(messages.results ?? [])?.map((message) => (
            <AIMessage
              // In reverse, because we are watching from "assitant" perspective
              from={message.role === "user" ? "assistant" : "user"}
              key={message.id}
            >
              <AIMessageContent>
                <AIResponse>{message.content}</AIResponse>
              </AIMessageContent>
              {message.role === "user" && (
                <DicebearAvatar
                  seed={conversation?.contactSessionId ?? ""}
                  size={32}
                />
              )}
            </AIMessage>
          ))}
        </AIConversationContent>
        <AIConversationScrollButton />
      </AIConversation>

      <div className="p-2">
        <Form {...form}>
          <AIInput
            // className="rounded-none border-x-0 border-b-0 fixed w-full bottom-0"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              disabled={conversation?.status === "resolved"}
              name="message"
              render={({ field }) => (
                <AIInputTextarea
                  {...field}
                  value={field.value}
                  disabled={
                    conversation?.status === "resolved" ||
                    form.formState.isSubmitting
                    // TODO: or if enhancing prompt
                  }
                  placeholder={
                    conversation?.status === "resolved"
                      ? "This conversation has been resolved."
                      : "Type your response as an operator..."
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
              <AIInputTools>
                <AIInputButton>
                  <Wand2Icon /> Enhance
                </AIInputButton>
              </AIInputTools>
              <AIInputSubmit
                disabled={
                  conversation?.status === "resolved" ||
                  !form.formState.isValid ||
                  form.formState.isSubmitting

                  // OR if is enhancing prompt
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
