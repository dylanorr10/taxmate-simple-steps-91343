import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProfile } from "./useProfile";

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

// Mock connection for demo mode
const DEMO_CONNECTION = {
  id: 'demo-bank-connection',
  user_id: '',
  account_id: 'demo-account',
  account_name: 'Demo Business Account',
  provider: 'Demo Bank',
  access_token: 'demo-token',
  refresh_token: 'demo-refresh',
  expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
  last_sync_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const useTrueLayerConnection = () => {
  const queryClient = useQueryClient();
  const { profile } = useProfile();
  const isDemoMode = profile?.demo_mode || false;

  const { data: connections = [], isLoading } = useQuery({
    queryKey: ["truelayer-connections"],
    queryFn: async () => {
      // Return mock connection in demo mode
      if (isDemoMode) {
        return [{ ...DEMO_CONNECTION, user_id: profile?.id || '' }];
      }

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
      if (isDemoMode) {
        toast.info("Demo mode: Bank connection simulated");
        return { authUrl: '' };
      }

      const { data, error } = await supabase.functions.invoke("truelayer-oauth-init");
      
      if (error) throw error;
      return data as { authUrl: string };
    },
    onSuccess: (data) => {
      if (!isDemoMode && data.authUrl) {
        toast.info("Opening bank login in a new tab...");
        openOAuthUrl(data.authUrl);
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to initiate connection: ${error.message}`);
    },
  });

  const syncTransactions = useMutation({
    mutationFn: async (connectionId: string) => {
      if (isDemoMode) {
        toast.success("Demo mode: Transactions synced");
        return { newTransactions: 5 };
      }

      const { data, error } = await supabase.functions.invoke("truelayer-sync-transactions", {
        body: { connectionId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (!isDemoMode) {
        queryClient.invalidateQueries({ queryKey: ["bank-transactions"] });
        toast.success(`Synced ${data.newTransactions} new transactions`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to sync transactions: ${error.message}`);
    },
  });

  const disconnectBank = useMutation({
    mutationFn: async (connectionId: string) => {
      if (isDemoMode) {
        toast.info("Demo mode: Bank disconnection simulated");
        return;
      }

      const { error } = await supabase
        .from("truelayer_connections")
        .delete()
        .eq("id", connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      if (!isDemoMode) {
        queryClient.invalidateQueries({ queryKey: ["truelayer-connections"] });
        toast.success("Bank disconnected successfully");
      }
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