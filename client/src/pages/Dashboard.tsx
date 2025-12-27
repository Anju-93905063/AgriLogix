import { useAnalytics } from "@/hooks/use-analytics";
import { Layout } from "@/components/Layout";
import { Sprout, Truck, CheckCircle2, AlertTriangle, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </Layout>
    );
  }

  const stats = [
    {
      name: "Total Produce",
      value: data?.totalProduce || 0,
      icon: Sprout,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      name: "In Transit",
      value: data?.inTransitDeliveries || 0,
      icon: Truck,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      name: "Delivered",
      value: data?.deliveredItems || 0,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      name: "Low Stock Alert",
      value: data?.lowStockItems || 0,
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
  ];

  const chartData = [
    { name: "Available", value: data?.totalProduce },
    { name: "In Transit", value: data?.inTransitDeliveries },
    { name: "Delivered", value: data?.deliveredItems },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary mb-2">
            Operations Overview
          </h1>
          <p className="text-muted-foreground">
            Real-time insights into your supply chain performance.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.name}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-display">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-green-600 font-medium">+2.5%</span>
                  <span className="ml-1">from last month</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-7">
          <Card className="col-span-4 border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Inventory Distribution</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `${value}`} 
                    />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]} 
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3 border-border/50 shadow-sm relative overflow-hidden">
             {/* Simple decorative background image */}
             <div className="absolute inset-0 bg-primary/5 z-0"></div>
             {/* farm scenic background */}
             <img 
               src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80"
               alt="Farm field"
               className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay"
             />
             <CardHeader className="relative z-10">
               <CardTitle>Recent Activity</CardTitle>
             </CardHeader>
             <CardContent className="relative z-10">
               <div className="space-y-4">
                 <div className="flex items-center gap-4">
                   <div className="w-2 h-2 rounded-full bg-blue-500" />
                   <div className="flex-1">
                     <p className="text-sm font-medium">New shipment dispatched</p>
                     <p className="text-xs text-muted-foreground">2 hours ago</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4">
                   <div className="w-2 h-2 rounded-full bg-green-500" />
                   <div className="flex-1">
                     <p className="text-sm font-medium">Harvest logged: Wheat</p>
                     <p className="text-xs text-muted-foreground">5 hours ago</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4">
                   <div className="w-2 h-2 rounded-full bg-amber-500" />
                   <div className="flex-1">
                     <p className="text-sm font-medium">Low stock alert: Corn</p>
                     <p className="text-xs text-muted-foreground">Yesterday</p>
                   </div>
                 </div>
               </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
