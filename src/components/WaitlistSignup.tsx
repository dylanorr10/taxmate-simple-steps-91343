import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWaitlistSignup } from "@/hooks/useWaitlistSignup";
import { useToast } from "@/hooks/use-toast";

const waitlistSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email")
    .max(255, "Email must be less than 255 characters"),
  profession_interest: z.string().optional(),
  honeypot: z.string().max(0, "Bot detected"),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

interface WaitlistSignupProps {
  variant?: "default" | "hero" | "cta";
  onSuccess?: () => void;
}

export const WaitlistSignup = ({ variant = "default", onSuccess }: WaitlistSignupProps) => {
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const mutation = useWaitlistSignup();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      honeypot: "",
    },
  });

  const professionValue = watch("profession_interest");

  const onSubmit = async (data: WaitlistFormData) => {
    try {
      await mutation.mutateAsync({
        email: data.email,
        profession_interest: data.profession_interest,
      });

      setSuccess(true);
      reset();
      
      toast({
        title: "You're on the list! 🎣",
        description: "We'll email you when Reelin launches.",
      });

      if (onSuccess) {
        onSuccess();
      }

      // Reset success state after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (error: any) {
      toast({
        title: "Oops!",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isHero = variant === "hero";
  const isCTA = variant === "cta";

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 animate-scale-in">
        <div className="relative">
          <CheckCircle2 className="h-16 w-16 text-success animate-pulse-subtle" />
          <div className="absolute inset-0 bg-success/20 rounded-full blur-xl animate-pulse-subtle" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-foreground">You're on the list! 🎣</h3>
          <p className="text-muted-foreground">
            We'll email you as soon as Reelin launches.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="space-y-4">
        {/* Honeypot field - hidden from users */}
        <input
          type="text"
          {...register("honeypot")}
          style={{ display: "none" }}
          tabIndex={-1}
          autoComplete="off"
        />

        <div className="space-y-2">
          {!isHero && !isCTA && (
            <Label htmlFor="email" className="text-foreground">
              Email Address
            </Label>
          )}
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            {...register("email")}
            className={`${isHero || isCTA ? "h-12 text-lg" : ""} ${
              errors.email ? "border-destructive" : ""
            }`}
            disabled={mutation.isPending}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {!isHero && !isCTA && (
          <div className="space-y-2">
            <Label htmlFor="profession" className="text-foreground">
              What best describes you? (Optional)
            </Label>
            <Select
              value={professionValue}
              onValueChange={(value) => setValue("profession_interest", value)}
              disabled={mutation.isPending}
            >
              <SelectTrigger id="profession" className="bg-background">
                <SelectValue placeholder="Select your profession" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                <SelectItem value="trades">🔨 Trades & Construction</SelectItem>
                <SelectItem value="delivery">🚗 Delivery & Transport</SelectItem>
                <SelectItem value="services">✂️ Professional Services</SelectItem>
                <SelectItem value="retail">🏪 Retail & E-commerce</SelectItem>
                <SelectItem value="freelancer">💼 Freelancer & Consultant</SelectItem>
                <SelectItem value="creative">🎨 Creative & Design</SelectItem>
                <SelectItem value="other">👤 Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          type="submit"
          disabled={mutation.isPending}
          className={`w-full ${
            isHero || isCTA
              ? "h-12 text-lg font-semibold bg-primary hover:bg-primary-hover shadow-primary hover-lift"
              : ""
          }`}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Joining...
            </>
          ) : (
            <>Join the Waitlist 🎣</>
          )}
        </Button>

        {(isHero || isCTA) && (
          <p className="text-xs text-center text-muted-foreground">
            🔒 We respect your privacy • 📧 No spam, ever
          </p>
        )}
      </div>
    </form>
  );
};
