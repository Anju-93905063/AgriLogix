import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useProduceList, useCreateProduce } from "@/hooks/use-produce";
import { useRole } from "@/components/RoleSelector";
import { 
  Plus, Search, Filter, AlertTriangle, 
  MapPin, Calendar, Package 
} from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProduceSchema } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Produce() {
  const { data: produce, isLoading } = useProduceList();
  const { role } = useRole();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const createMutation = useCreateProduce();

  const form = useForm<z.infer<typeof insertProduceSchema>>({
    resolver: zodResolver(insertProduceSchema),
    defaultValues: {
      name: "",
      quantity: 0,
      sourceLocation: "",
      harvestDate: new Date().toISOString().split('T')[0], // Default to today
      status: "Available",
    },
  });

  const onSubmit = async (data: z.infer<typeof insertProduceSchema>) => {
    try {
      await createMutation.mutateAsync({
        ...data,
        quantity: Number(data.quantity), // Ensure number
      });
      setIsCreateOpen(false);
      form.reset();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredProduce = produce?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || item.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-primary">Produce Inventory</h1>
            <p className="text-muted-foreground">Manage harvest logs and stock levels.</p>
          </div>
          
          {role === "farmer" && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/25 transition-all">
                  <Plus className="w-4 h-4 mr-2" />
                  Log Harvest
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Log New Harvest</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Crop Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Organic Corn" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity (kg)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="harvestDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Harvest Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="sourceLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Source Field / Farm</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. North Field, Zone A" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Logging..." : "Save Record"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-border/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search crops..." 
              className="pl-9 bg-muted/30 border-muted"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 ml-auto w-full sm:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="In Transit">In Transit</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
             {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : filteredProduce?.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
            <Sprout className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No produce found</h3>
            <p className="text-muted-foreground">Adjust filters or log a new harvest.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProduce?.map((item) => (
              <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 border-border/60 hover:border-primary/20 overflow-hidden">
                {/* Image placeholder - can be dynamic later */}
                <div className="h-32 w-full bg-gradient-to-br from-primary/5 to-accent/5 relative">
                   <div className="absolute top-3 right-3">
                      <Badge variant={item.status === 'Available' ? 'default' : 'secondary'} 
                             className={item.status === 'Available' ? 'bg-green-600 hover:bg-green-700' : ''}>
                        {item.status}
                      </Badge>
                   </div>
                </div>
                
                <CardContent className="p-5 pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                    {item.quantity < 50 && (
                      <div className="flex items-center text-amber-600 text-xs font-medium bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Low Stock
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Package className="w-4 h-4 mr-2 text-primary/60" />
                      <span className="font-mono text-foreground">{item.quantity} kg</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-primary/60" />
                      <span>{item.sourceLocation}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-primary/60" />
                      <span>Harvested: {format(new Date(item.harvestDate), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
