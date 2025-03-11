
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Battery, Cpu, LineChart } from "lucide-react";

const Home = () => {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Factory Flow Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Mark Bannert</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Production Efficiency</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.4%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Simulations</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 optimized this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Energy Usage</CardTitle>
            <Battery className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.4 kWh</div>
            <p className="text-xs text-muted-foreground">-8% from baseline</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">System Load</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28%</div>
            <p className="text-xs text-muted-foreground">12 units in operation</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Simulations</CardTitle>
            <CardDescription>Your recently created factory simulations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Electronics Assembly Line</p>
                  <p className="text-sm text-muted-foreground">Modified 2 days ago</p>
                </div>
                <div className="text-sm text-muted-foreground">85% efficiency</div>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Food Processing Pipeline</p>
                  <p className="text-sm text-muted-foreground">Modified 1 week ago</p>
                </div>
                <div className="text-sm text-muted-foreground">78% efficiency</div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Automotive Parts Production</p>
                  <p className="text-sm text-muted-foreground">Modified 2 weeks ago</p>
                </div>
                <div className="text-sm text-muted-foreground">92% efficiency</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
            <CardDescription>Cost efficiency analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">Operating Costs</p>
                <p>$12,420 / month</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-medium">Maintenance Expenses</p>
                <p>$2,340 / month</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-medium">Energy Costs</p>
                <p>$4,150 / month</p>
              </div>
              <div className="h-[1px] bg-border" />
              <div className="flex items-center justify-between font-bold">
                <p>Total Monthly Costs</p>
                <p>$18,910</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;

function Factory(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M17 18h1" />
      <path d="M12 18h1" />
      <path d="M7 18h1" />
    </svg>
  );
}
