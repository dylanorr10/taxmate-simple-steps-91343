import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const openOAuthUrl = (url: string) => {
  try {
    const inIframe = window.self !== window.top;
    if (inIframe) {
      // Open in new tab since TrueLayer blocks iframe embedding
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (!win) {
        // Fallback if popups are blocked
        window.location.assign(url);
      }
    } else {
      window.location.assign(url);
    }
  } catch {
    // Ultimate fallback
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

export const useTrueLayerConnection = () => {
  const queryClient = useQueryClient();

  const { data: connections = [], isLoading } = useQuery({
    queryKey: ["truelayer-connections"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("truelayer_connections")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
  });

  const initiateConnection = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("truelayer-oauth-init");
      
      if (error) throw error;
      return data as { authUrl: string };
    },
    onSuccess: (data) => {
      toast.info("Opening bank login in a new tab...");
      openOAuthUrl(data.authUrl);
    },
    onError: (error: Error) => {
      toast.error(`Failed to initiate connection: ${error.message}`);
    },
  });

  const syncTransactions = useMutation({
    mutationFn: async (connectionId: string) => {
      const { data, error } = await supabase.functions.invoke("truelayer-sync-transactions", {
        body: { connectionId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bank-transactions"] });
      toast.success(`Synced ${data.newTransactions} new transactions`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to sync transactions: ${error.message}`);
    },
  });

  const disconnectBank = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from("truelayer_connections")
        .delete()
        .eq("id", connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["truelayer-connections"] });
      toast.success("Bank disconnected successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to disconnect: ${error.message}`);
    },
  });

  return {
    connections,
    isLoading,
    isConnected: connections.length > 0,
    initiateConnection: initiateConnection.mutate,
    isInitiating: initiateConnection.isPending,
    syncTransactions: syncTransactions.mutate,
    isSyncing: syncTransactions.isPending,
    disconnectBank: disconnectBank.mutate,
    isDisconnecting: disconnectBank.isPending,
  };
};