import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button asChild variant="ghost" className="mb-8">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <div className="bg-card border border-border rounded-2xl p-8 md:p-12 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: January 2025</p>
          </div>

          <div className="space-y-6 text-foreground">
            <section className="space-y-3">
              <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By joining the Reelin waitlist, you agree to these Terms of Service. If you do not agree, please do not sign up.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold">2. Waitlist Registration</h2>
              <p className="text-muted-foreground leading-relaxed">
                Joining the waitlist does not guarantee access to Reelin or any specific features. We will notify waitlist members when the service becomes available, but timing is subject to change.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold">3. Communications</h2>
              <p className="text-muted-foreground leading-relaxed">
                By providing your email address, you consent to receive:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Launch notifications when Reelin becomes available</li>
                <li>Important updates about the product</li>
                <li>Occasional news about features and improvements</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                You can unsubscribe from these communications at any time.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold">4. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content, features, and functionality of Reelin, including but not limited to text, graphics, logos, and software, are the exclusive property of Reelin and are protected by copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold">5. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                Reelin is provided on an "as is" and "as available" basis. We make no warranties or representations about the accuracy or completeness of the service or the content.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold">6. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of any material changes via email.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold">7. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of England and Wales.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold">8. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms, please contact us at{" "}
                <a href="mailto:legal@reelin.co.uk" className="text-primary hover:underline">
                  legal@reelin.co.uk
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
