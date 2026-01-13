import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDataExport } from "@/hooks/useDataExport";
import { Download, FileText, FileSpreadsheet, Shield, Clock, Info, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DataExportCard = () => {
  const { exportToCSV, exportToPDF } = useDataExport();
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handleExportCSV = async () => {
    setIsExportingCSV(true);
    try {
      await exportToCSV();
    } finally {
      setIsExportingCSV(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      await exportToPDF();
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Data Export & Retention</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            <Shield className="w-3 h-3 mr-1" />
            HMRC Compliant
          </Badge>
        </div>
        <CardDescription className="text-sm">
          Export your complete tax records for HMRC compliance and backup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Compliance Info */}
        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border border-border">
          <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-foreground mb-1">5+ Year Retention Requirement</p>
            <p className="text-muted-foreground text-xs">
              HMRC requires you to keep digital records for at least 5 years after the 31 January submission deadline. 
              Export your data regularly for safekeeping.
            </p>
          </div>
        </div>

        {/* Export Options */}
        <div className="grid gap-3">
          {/* CSV Export */}
          <div className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Complete Data (CSV)</p>
                <p className="text-xs text-muted-foreground">
                  All transactions, mileage, home office, submissions & amendments
                </p>
              </div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleExportCSV} 
                    disabled={isExportingCSV}
                    size="sm"
                  >
                    {isExportingCSV ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download all your tax data in spreadsheet format</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* PDF Export */}
          <div className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Summary Report (PDF)</p>
                <p className="text-xs text-muted-foreground">
                  Financial overview with totals, periods & audit trail
                </p>
              </div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleExportPDF} 
                    disabled={isExportingPDF}
                    size="sm"
                    variant="outline"
                  >
                    {isExportingPDF ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download a formatted summary for your records</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* What's Included */}
        <div className="pt-2">
          <div className="flex items-center gap-1 mb-2">
            <Info className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">What's included in your export:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              'Income',
              'Expenses',
              'Mileage',
              'Home Office',
              'Tax Periods',
              'VAT Returns',
              'Amendments',
              'HMRC Categories',
            ].map((item) => (
              <Badge key={item} variant="secondary" className="text-xs font-normal">
                {item}
              </Badge>
            ))}
          </div>
        </div>

        {/* Digital Link Note */}
        <p className="text-xs text-muted-foreground border-t border-border pt-3">
          <strong>Digital Links:</strong> Your export preserves the complete audit trail of all submissions and corrections, 
          meeting HMRC's "Functional Compatible Software" requirements for Making Tax Digital.
        </p>
      </CardContent>
    </Card>
  );
};

export default DataExportCard;
