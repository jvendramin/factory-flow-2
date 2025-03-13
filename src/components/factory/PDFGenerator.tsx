
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { BuildingIcon, FileTextIcon, ArrowRightIcon, DownloadIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PDFGenerator = () => {
  const [selectedBank, setSelectedBank] = useState("rbc");
  const [companyDetails, setCompanyDetails] = useState({
    name: "Your Company Name",
    contact: "Your Contact Info",
    amount: "100000",
    purpose: "Purchase new manufacturing equipment"
  });
  const [generating, setGenerating] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setCompanyDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGeneratePDF = () => {
    setGenerating(true);
    
    // Simulate PDF generation
    setTimeout(() => {
      setGenerating(false);
      toast({
        title: "PDF Generated Successfully",
        description: `Loan proposal for ${getBankName(selectedBank)} has been generated.`,
      });
      
      // Dispatch an event to trigger the dialog in the parent component
      const event = new CustomEvent('pdf:generated', { detail: { bank: selectedBank } });
      document.dispatchEvent(event);
    }, 1500);
  };

  const getBankName = (code: string) => {
    const banks: Record<string, string> = {
      "rbc": "RBC Royal Bank",
      "td": "TD Bank",
      "scotia": "Scotiabank",
      "bdc": "Business Development Bank of Canada",
      "cibc": "CIBC"
    };
    return banks[code] || code;
  };

  const getBankTemplate = (code: string) => {
    const templates: Record<string, string> = {
      "rbc": "Business loan proposal",
      "td": "Equipment financing",
      "scotia": "Manufacturing loan",
      "bdc": "Business development loan",
      "cibc": "Industrial equipment loan"
    };
    return templates[code] || "Loan template";
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Generate Loan Proposal</h3>
        <p className="text-sm text-muted-foreground">
          Create a prefilled PDF template for your factory equipment loan application.
        </p>
      </div>
      
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bank-select">Select Bank</Label>
            <Select value={selectedBank} onValueChange={setSelectedBank}>
              <SelectTrigger>
                <SelectValue placeholder="Select a bank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rbc">RBC Royal Bank</SelectItem>
                <SelectItem value="td">TD Bank</SelectItem>
                <SelectItem value="scotia">Scotiabank</SelectItem>
                <SelectItem value="bdc">BDC</SelectItem>
                <SelectItem value="cibc">CIBC</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input 
              id="company-name" 
              value={companyDetails.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact-info">Contact Information</Label>
            <Input 
              id="contact-info" 
              value={companyDetails.contact}
              onChange={(e) => handleInputChange("contact", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="loan-amount">Loan Amount ($)</Label>
            <Input 
              id="loan-amount" 
              type="number" 
              value={companyDetails.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="loan-purpose">Loan Purpose</Label>
            <Textarea 
              id="loan-purpose" 
              rows={3}
              value={companyDetails.purpose}
              onChange={(e) => handleInputChange("purpose", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
        <div className="flex items-center gap-3">
          <BuildingIcon className="h-8 w-8 text-primary" />
          <div>
            <div className="font-medium">{getBankName(selectedBank)}</div>
            <div className="text-sm text-muted-foreground">{getBankTemplate(selectedBank)}</div>
          </div>
        </div>
        <ArrowRightIcon className="h-5 w-5 text-muted-foreground" />
        <div className="flex items-center gap-3">
          <FileTextIcon className="h-8 w-8 text-primary" />
          <div>
            <div className="font-medium">Prefilled Template</div>
            <div className="text-sm text-muted-foreground">Factory simulation data included</div>
          </div>
        </div>
      </div>
      
      <Button className="w-full" onClick={handleGeneratePDF} disabled={generating}>
        {generating ? (
          "Generating..."
        ) : (
          <>
            <DownloadIcon className="mr-2 h-4 w-4" />
            Generate PDF Template
          </>
        )}
      </Button>
    </div>
  );
};

export default PDFGenerator;
