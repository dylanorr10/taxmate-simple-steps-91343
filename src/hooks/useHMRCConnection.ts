import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useHMRCConnection = () => {
  const { data: isConnected, isLoading, refetch } = useQuery({
    queryKey: ["hmrc-connection"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from("hmrc_tokens")
        .select("id, expires_at")
        .eq("user_id", user.id)
        .single();

      if (error) {
        // No token found is not an error, just means not connected
        if (error.code === "PGRST116") return false;
        console.error("Error checking HMRC connection:", error);
        return false;
      }

      // Check if token is still valid
      const expiresAt = new Date(data.expires_at);
      const now = new Date();
      return expiresAt > now;
    },
  });

  const initiateConnection = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("hmrc-oauth-init", {
        body: {},
      });

      if (error) throw error;

      if (data?.authUrl) {
        // Redirect to HMRC OAuth page in top-level window to avoid iframe restrictions
        // HMRC blocks embedding via X-Frame-Options, so use _top
        window.open(data.authUrl, "_top");
      } else {
        toast.error("Failed to initiate HMRC connection");
      }
    } catch (error) {
      console.error("Error initiating HMRC connection:", error);
      toast.error("Failed to connect to HMRC");
    }
  };

  return {
    isConnected: isConnected ?? false,
    isLoading,
    initiateConnection,
    refetch,
  };
};
