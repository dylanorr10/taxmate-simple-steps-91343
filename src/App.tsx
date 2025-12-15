import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Landing from "./pages/Landing";
import Waitlist from "./pages/Waitlist";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

// Launch mode: only show landing, waitlist, and legal pages
// Set to false when ready to open the full app
const LAUNCH_MODE = false;

const queryClient = new QueryClient();

// Lazy load app pages only when not in launch mode
const Welcome = LAUNCH_MODE ? () => null : require("./pages/Welcome").default;
const Onboarding = LAUNCH_MODE ? () => null : require("./pages/Onboarding").default;
const Dashboard = LAUNCH_MODE ? () => null : require("./pages/Dashboard").default;
const Tax = LAUNCH_MODE ? () => null : require("./pages/Tax").default;
const SettingsPage = LAUNCH_MODE ? () => null : require("./pages/SettingsPage").default;
const LearningHub = LAUNCH_MODE ? () => null : require("./pages/LearningHub").default;
const Glossary = LAUNCH_MODE ? () => null : require("./pages/Glossary").default;
const Log = LAUNCH_MODE ? () => null : require("./pages/Log").default;
const Mileage = LAUNCH_MODE ? () => null : require("./pages/Mileage").default;
const NotFound = LAUNCH_MODE ? () => null : require("./pages/NotFound").default;
const Auth = LAUNCH_MODE ? () => null : require("./pages/Auth").default;
const Chat = LAUNCH_MODE ? () => null : require("./pages/Chat").default;
const Install = LAUNCH_MODE ? () => null : require("./pages/Install").default;
const Pricing = LAUNCH_MODE ? () => null : require("./pages/Pricing").default;
const ProtectedRoute = LAUNCH_MODE ? ({ children }: { children: React.ReactNode }) => <>{children}</> : require("@/components/ProtectedRoute").default;
const FloatingChatButton = LAUNCH_MODE ? () => null : require("@/components/FloatingChatButton").FloatingChatButton;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {!LAUNCH_MODE && <FloatingChatButton />}
          <Routes>
            {LAUNCH_MODE ? (
              // Launch mode routes - only landing, waitlist, and legal pages
              <>
                <Route path="/" element={<Landing />} />
                <Route path="/waitlist" element={<Waitlist />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : (
              // Full app routes
              <>
                <Route path="/" element={<Navigate to="/auth" replace />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/install" element={<Install />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/log" element={<ProtectedRoute><Log /></ProtectedRoute>} />
                <Route path="/learn" element={<ProtectedRoute><LearningHub /></ProtectedRoute>} />
                <Route path="/mileage" element={<ProtectedRoute><Mileage /></ProtectedRoute>} />
                <Route path="/tax" element={<ProtectedRoute><Tax /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/glossary" element={<ProtectedRoute><Glossary /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </>
            )}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
