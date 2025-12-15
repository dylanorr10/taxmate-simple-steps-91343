import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";
import { generateDemoData } from "@/utils/demoDataSeeder";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Demo accounts that get auto-seeded data
const DEMO_EMAILS = ["kal@reelin.uk"];

const setupDemoAccount = async (userId: string, email: string) => {
  // Check if user already has transactions
  const { data: existingIncome } = await supabase
    .from('income_transactions')
    .select('id')
    .eq('user_id', userId)
    .limit(1);
  
  // If no transactions exist, seed demo data
  if (!existingIncome || existingIncome.length === 0) {
    console.log('Seeding demo data for demo account:', email);
    await generateDemoData(userId, 'professional');
  }
  
  // Ensure profile is complete so they skip onboarding
  await supabase
    .from('profiles')
    .update({ 
      profile_complete: true,
      business_name: 'Demo Business',
      business_type: 'professional',
      experience_level: 'intermediate'
    })
    .eq('id', userId);
};

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuthSuccess = async (session: any) => {
    const userEmail = session.user.email?.toLowerCase();
    const isDemoAccount = DEMO_EMAILS.includes(userEmail);
    
    if (isDemoAccount) {
      // Setup demo account with seeded data
      await setupDemoAccount(session.user.id, userEmail);
      navigate("/dashboard");
    } else {
      // Check if profile is complete for regular users
      const { data } = await supabase
        .from('profiles')
        .select('profile_complete')
        .eq('id', session.user.id)
        .single();
      
      if (data?.profile_complete) {
        navigate("/dashboard");
      } else {
        navigate("/welcome");
      }
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleAuthSuccess(session);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === 'SIGNED_IN') {
        handleAuthSuccess(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password");
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success("Welcome back!");
      } else {
        const redirectUrl = `${window.location.origin}/welcome`;
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (error) {
          if (error.message.includes("User already registered")) {
            toast.error("This email is already registered. Please sign in instead.");
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success("Account created! Redirecting to onboarding...");
        // Auto-login and redirect to welcome
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (!signInError) {
          navigate("/welcome");
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
          <CardDescription>
            {isLogin
              ? "Sign in to access your financial dashboard"
              : "Sign up to start reeling in your finances"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
