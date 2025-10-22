import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export const FloatingChatButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/chat") return null;

  return (
    <Button
      size="icon"
      className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg z-50"
      onClick={() => navigate("/chat")}
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
};
