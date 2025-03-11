
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Building, MapPin, Users, Mail, Phone, Globe, Check } from "lucide-react";

const Business = () => {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Business</h1>
          <p className="text-muted-foreground mt-1">Manage your business profile and settings</p>
        </div>
        <Button>
          Save Changes
        </Button>
      </div>
      
      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Business Profile</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Business Information
                  </CardTitle>
                  <CardDescription>
                    Update your company's information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input id="company-name" defaultValue="TechManufacture Inc." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input id="industry" defaultValue="Technology Manufacturing" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="about">About Company</Label>
                    <Textarea 
                      id="about" 
                      rows={4} 
                      defaultValue="TechManufacture Inc. specializes in producing high-quality electronic components for the technology industry. Our state-of-the-art factory facilities ensure efficient and reliable production."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="founded">Founded Year</Label>
                    <Input id="founded" defaultValue="2015" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Contact & Location
                  </CardTitle>
                  <CardDescription>
                    Update your company's contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" defaultValue="contact@techmanufacture.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" defaultValue="+1 (555) 123-4567" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input id="address" defaultValue="123 Manufacturing Blvd" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" defaultValue="Tech City" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input id="state" defaultValue="California" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal">Postal/ZIP Code</Label>
                      <Input id="postal" defaultValue="94023" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" defaultValue="https://techmanufacture.com" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Business Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-2">
                    <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">TechManufacture Inc.</p>
                      <p className="text-sm text-muted-foreground">Technology Manufacturing</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm">contact@techmanufacture.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm">123 Manufacturing Blvd</p>
                      <p className="text-sm">Tech City, CA 94023</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm">techmanufacture.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Subscription Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-primary" />
                        <p className="font-medium">Premium Plan</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Active until December 2024</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Simulation Templates</span>
                        <span className="text-sm">Unlimited</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Team Members</span>
                        <span className="text-sm">Up to 15</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Advanced Analytics</span>
                        <span className="text-sm">Included</span>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      Manage Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Members
                </CardTitle>
                <Button size="sm">Add Team Member</Button>
              </div>
              <CardDescription>
                Manage people who have access to your business account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <TeamMember 
                  name="Mark Bannert" 
                  email="mark@techmanufacture.com" 
                  role="Admin" 
                />
                
                <TeamMember 
                  name="Sarah Johnson" 
                  email="sarah@techmanufacture.com" 
                  role="Factory Manager" 
                />
                
                <TeamMember 
                  name="David Chen" 
                  email="david@techmanufacture.com" 
                  role="Financial Analyst" 
                />
                
                <TeamMember 
                  name="Emily Rodriguez" 
                  email="emily@techmanufacture.com" 
                  role="Engineer" 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Account Preferences</CardTitle>
              <CardDescription>
                Configure your account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input id="language" defaultValue="English (US)" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" defaultValue="(UTC-08:00) Pacific Time (US & Canada)" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Input id="date-format" defaultValue="MM/DD/YYYY" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" defaultValue="USD ($)" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface TeamMemberProps {
  name: string;
  email: string;
  role: string;
}

const TeamMember: React.FC<TeamMemberProps> = ({ name, email, role }) => {
  return (
    <div className="flex items-center justify-between border-b pb-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="font-medium text-sm">{name.split(' ').map(n => n[0]).join('')}</span>
        </div>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm">{role}</span>
        <Button variant="ghost" size="sm">Edit</Button>
      </div>
    </div>
  );
};

export default Business;
