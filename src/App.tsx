import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Welcome from "./pages/Welcome";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Records from "./pages/Records";
import SettingsPage from "./pages/SettingsPage";
import LearningHub from "./pages/LearningHub";
import Glossary from "./pages/Glossary";
import Log from "./pages/Log";
import Learn from "./pages/Learn";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/welcome" replace />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/log" element={<Log />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/records" element={<Records />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/learning" element={<LearningHub />} />
            <Route path="/glossary" element={<Glossary />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
