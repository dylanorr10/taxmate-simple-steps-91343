import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                By accessing and using Reelin ("the Service"), you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use the Service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Description of Service</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                Reelin is a bookkeeping and financial management tool designed for UK-based self-employed 
                individuals and freelancers. The Service includes features for tracking income and expenses, 
                VAT calculations, and optional integrations with banking providers and HMRC.
              </p>
              <p>
                <strong>Important:</strong> Reelin is not a substitute for professional accounting advice. 
                Users are responsible for ensuring the accuracy of their financial records and tax submissions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                You must provide accurate information when creating an account. You are responsible for 
                maintaining the security of your account credentials and for all activities under your account.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Subscription and Payments</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                Paid subscriptions are billed monthly. All plans include a 14-day free trial. 
                You may cancel your subscription at any time through your account settings or the Stripe customer portal.
              </p>
              <p>
                Refunds are handled on a case-by-case basis. Contact support for assistance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Data and Privacy</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                Your use of the Service is also governed by our Privacy Policy. We take data security seriously 
                and implement appropriate measures to protect your financial information.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                The Service is provided "as is" without warranties of any kind. We are not liable for any 
                indirect, incidental, or consequential damages arising from your use of the Service.
              </p>
              <p>
                In particular, we are not responsible for any errors in tax calculations or submissions. 
                Users should verify all figures before submitting to HMRC.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                We reserve the right to modify these terms at any time. Continued use of the Service 
                after changes constitutes acceptance of the new terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Contact</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                For questions about these Terms, please contact us at support@reelin.app
              </p>
            </CardContent>
          </Card>
        </div>

        <p className="text-sm text-muted-foreground mt-8">
          Last updated: December 2024
        </p>
      </div>
    </div>
  );
};

export default Terms;
