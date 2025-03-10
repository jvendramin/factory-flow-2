import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight, Clock, Activity, Zap, Thermometer } from "lucide-react";

interface LiveStatsPanelProps {
  isSimulating: boolean;
  simulationTime: number;
  throughput: number;
  efficiency: number;
  bottlenecks: { name: string; value: number }[];
  energyUsage: number;
  temperature: number;
  historicalData: {
    time: string;
    throughput: number;
    efficiency: number;
    energy: number;
  }[];
}

const LiveStatsPanel: React.FC<LiveStatsPanelProps> = ({
  isSimulating,
  simulationTime,
  throughput,
  efficiency,
  bottlenecks,
  energyUsage,
  temperature,
  historicalData,
}) => {
  // Format simulation time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Live Statistics</h3>
        <div className="flex items-center gap-1 text-xs">
          <Clock size={14} className="text-muted-foreground" />
          <span className="text-muted-foreground">{formatTime(simulationTime)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Card>
          <CardContent className="p-3">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Activity size={12} /> Throughput
              </span>
              <div className="flex items-end justify-between">
                <span className="text-xl font-semibold">{throughput}</span>
                <span className="text-xs text-green-500 flex items-center">
                  <ArrowUpRight size={12} /> 12%
                </span>
              </div>
              <Progress value={throughput} className="h-1 mt-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap size={12} /> Efficiency
              </span>
              <div className="flex items-end justify-between">
                <span className="text-xl font-semibold">{efficiency}%</span>
                <span className="text-xs text-red-500 flex items-center">
                  <ArrowDownRight size={12} /> 3%
                </span>
              </div>
              <Progress value={efficiency} className="h-1 mt-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap size={12} /> Energy
              </span>
              <div className="flex items-end justify-between">
                <span className="text-xl font-semibold">{energyUsage} kW</span>
                <span className="text-xs text-green-500 flex items-center">
                  <ArrowUpRight size={12} /> 5%
                </span>
              </div>
              <Progress value={energyUsage / 10} className="h-1 mt-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Thermometer size={12} /> Temp
              </span>
              <div className="flex items-end justify-between">
                <span className="text-xl font-semibold">{temperature}°C</span>
                <span className="text-xs text-red-500 flex items-center">
                  <ArrowUpRight size={12} /> 2%
                </span>
              </div>
              <Progress value={temperature / 1.5} className="h-1 mt-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-3 pb-0">
          <CardTitle className="text-sm font-medium">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <Tabs defaultValue="throughput">
            <TabsList className="grid w-full grid-cols-3 h-7">
              <TabsTrigger value="throughput" className="text-xs">Throughput</TabsTrigger>
              <TabsTrigger value="efficiency" className="text-xs">Efficiency</TabsTrigger>
              <TabsTrigger value="energy" className="text-xs">Energy</TabsTrigger>
            </TabsList>
            <TabsContent value="throughput" className="pt-2">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="rgba(255,255,255,0.3)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="rgba(255,255,255,0.3)" />
                  <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none" }} />
                  <Line type="monotone" dataKey="throughput" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="efficiency" className="pt-2">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="rgba(255,255,255,0.3)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="rgba(255,255,255,0.3)" />
                  <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none" }} />
                  <Line type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="energy" className="pt-2">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="rgba(255,255,255,0.3)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="rgba(255,255,255,0.3)" />
                  <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none" }} />
                  <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-3 pb-0">
          <CardTitle className="text-sm font-medium">Bottlenecks</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-2">
            {bottlenecks.map((bottleneck, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{bottleneck.name}</span>
                  <span>{bottleneck.value}%</span>
                </div>
                <Progress value={bottleneck.value} className="h-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveStatsPanel;
