
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, FileText, Plus } from "lucide-react";

const Financial = () => {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Financial Documents</h1>
          <p className="text-muted-foreground mt-1">Manage your loan proposals and financial documents</p>
        </div>
        <Button className="gap-2">
          <Plus size={16} />
          New Loan Proposal
        </Button>
      </div>
      
      <Tabs defaultValue="proposals">
        <TabsList className="mb-4">
          <TabsTrigger value="proposals">Loan Proposals</TabsTrigger>
          <TabsTrigger value="documents">Financial Documents</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="proposals">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FinancialDocumentCard 
              title="Equipment Expansion Loan" 
              date="Jun 12, 2023" 
              status="Approved" 
              amount="$250,000" 
            />
            
            <FinancialDocumentCard 
              title="Factory Renovation Proposal" 
              date="Aug 24, 2023" 
              status="Pending" 
              amount="$120,000" 
            />
            
            <FinancialDocumentCard 
              title="Operating Capital Loan" 
              date="Oct 5, 2023" 
              status="Approved" 
              amount="$75,000" 
            />
            
            <FinancialDocumentCard 
              title="Energy Efficiency Upgrade" 
              date="Dec 18, 2023" 
              status="Declined" 
              amount="$35,000" 
            />
          </div>
        </TabsContent>
        
        <TabsContent value="documents">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FinancialDocumentCard 
              title="Annual Financial Report" 
              date="Jan 15, 2023" 
              type="document" 
            />
            
            <FinancialDocumentCard 
              title="Tax Documentation" 
              date="Apr 10, 2023" 
              type="document" 
            />
            
            <FinancialDocumentCard 
              title="Asset Inventory" 
              date="Jul 22, 2023" 
              type="document" 
            />
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">Equipment Purchase: Conveyor System</p>
                    <p className="text-sm text-muted-foreground">May 3, 2023</p>
                  </div>
                  <div className="text-red-500 font-medium">-$42,500</div>
                </div>
                
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">Loan Deposit: Operating Capital</p>
                    <p className="text-sm text-muted-foreground">Oct 7, 2023</p>
                  </div>
                  <div className="text-green-500 font-medium">+$75,000</div>
                </div>
                
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">Equipment Purchase: Robotic Arm</p>
                    <p className="text-sm text-muted-foreground">Nov 12, 2023</p>
                  </div>
                  <div className="text-red-500 font-medium">-$68,200</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Maintenance Contract Payment</p>
                    <p className="text-sm text-muted-foreground">Dec 1, 2023</p>
                  </div>
                  <div className="text-red-500 font-medium">-$12,350</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface FinancialDocumentCardProps {
  title: string;
  date: string;
  status?: "Approved" | "Pending" | "Declined";
  amount?: string;
  type?: "proposal" | "document";
}

const FinancialDocumentCard: React.FC<FinancialDocumentCardProps> = ({
  title,
  date,
  status,
  amount,
  type = "proposal"
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>{date}</CardDescription>
      </CardHeader>
      <CardContent>
        {type === "proposal" && (
          <>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Status:</span>
              <span className={`text-sm font-medium ${
                status === "Approved" ? "text-green-500" : 
                status === "Pending" ? "text-amber-500" : 
                "text-red-500"
              }`}>
                {status}
              </span>
            </div>
            {amount && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Amount:</span>
                <span className="text-sm font-medium">{amount}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full gap-2">
          <Download size={14} />
          Download PDF
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Financial;
