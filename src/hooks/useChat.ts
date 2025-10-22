import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export const useChat = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["chatMessages"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Save user message
      const { error: saveError } = await supabase
        .from("chat_messages")
        .insert({
          user_id: user.id,
          role: "user",
          content,
        });

      if (saveError) throw saveError;

      // Call edge function for AI response
      setIsStreaming(true);
      const { data, error } = await supabase.functions.invoke("chat-assistant", {
        body: { messages: [...messages, { role: "user", content }] },
      });

      setIsStreaming(false);

      if (error) throw error;

      // Save assistant response
      const { error: assistantError } = await supabase
        .from("chat_messages")
        .insert({
          user_id: user.id,
          role: "assistant",
          content: data.content,
        });

      if (assistantError) throw assistantError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatMessages"] });
    },
    onError: (error: Error) => {
      toast.error(`Chat error: ${error.message}`);
    },
  });

  const clearHistory = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("chat_messages")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatMessages"] });
      toast.success("Chat history cleared");
    },
  });

  return {
    messages,
    isLoading,
    isStreaming,
    sendMessage: sendMessage.mutate,
    isSending: sendMessage.isPending,
    clearHistory: clearHistory.mutate,
  };
};
