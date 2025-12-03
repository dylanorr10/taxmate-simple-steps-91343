import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Privacy = () => {
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
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p><strong>Account Information:</strong> Email address, business name, and profile details you provide.</p>
              <p><strong>Financial Data:</strong> Income and expense transactions, VAT information, and invoice details you enter.</p>
              <p><strong>Bank Data:</strong> If you connect your bank account via TrueLayer, we receive transaction data from your linked accounts.</p>
              <p><strong>Usage Data:</strong> How you interact with the Service, features used, and session information.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Data</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and improve the Service</li>
                <li>Calculate VAT and generate financial reports</li>
                <li>Process payments via Stripe</li>
                <li>Submit VAT returns to HMRC on your behalf (if authorized)</li>
                <li>Send service-related communications</li>
                <li>Comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Data Sharing</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>We share data with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Stripe:</strong> For payment processing</li>
                <li><strong>TrueLayer:</strong> For bank account connections (only if you connect your bank)</li>
                <li><strong>HMRC:</strong> For MTD VAT submissions (only with your explicit authorization)</li>
                <li><strong>Supabase:</strong> Our database and authentication provider</li>
              </ul>
              <p className="mt-4">We do not sell your personal data to third parties.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                We implement industry-standard security measures including encryption in transit and at rest, 
                secure authentication, and regular security audits. Your bank credentials are never stored by us - 
                TrueLayer handles all banking authentication securely.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Your Rights (GDPR)</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>Under GDPR, you have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate data</li>
                <li><strong>Erasure:</strong> Request deletion of your data</li>
                <li><strong>Portability:</strong> Receive your data in a structured format</li>
                <li><strong>Object:</strong> Object to certain processing activities</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent at any time</li>
              </ul>
              <p className="mt-4">To exercise these rights, contact us at privacy@reelin.app</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                We retain your financial data for 7 years to comply with UK tax record-keeping requirements. 
                You may request deletion of your account, but certain data may be retained for legal compliance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Cookies</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                We use essential cookies for authentication and session management. We do not use 
                advertising or tracking cookies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Contact</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                For privacy-related inquiries, contact our Data Protection Officer at privacy@reelin.app
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

export default Privacy;
