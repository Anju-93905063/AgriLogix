import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useShipmentsList, useCreateShipment, useUpdateShipmentStatus } from "@/hooks/use-shipments";
import { useProduceList } from "@/hooks/use-produce";
import { useRole } from "@/components/RoleSelector";
import { format } from "date-fns";
import {
  Truck, Plus, MapPin, CalendarClock, PackageCheck,
  ArrowRight, CheckCircle2, Clock, Map as MapIcon, Eye
} from "lucide-react";
import { MapVisualization } from "@/components/MapVisualization";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertShipmentSchema } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Shipments() {
  const { data: shipments, isLoading } = useShipmentsList();
  const { data: produceList } = useProduceList();
  const { role } = useRole();
  const createMutation = useCreateShipment();
  const updateStatusMutation = useUpdateShipmentStatus();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const form = useForm<z.infer<typeof insertShipmentSchema>>({
    resolver: zodResolver(insertShipmentSchema),
    defaultValues: {
      produceId: "",
      destination: "",
      deliveryDate: new Date().toISOString().split('T')[0],
      status: "Scheduled",
    },
  });

  const onSubmit = async (data: z.infer<typeof insertShipmentSchema>) => {
    try {
      await createMutation.mutateAsync(data);
      setIsCreateOpen(false);
      form.reset();
    } catch (error) {
      console.error(error);
    }
  };

  const getProduceName = (id: string) => produceList?.find(p => p.id === id)?.name || "Unknown Item";

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-primary">Logistics & Shipments</h1>
            <p className="text-muted-foreground">Track delivery status and schedule dispatches.</p>
          </div>

          {role === "distributor" && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/25">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Shipment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Shipment</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="produceId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Produce</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose produce..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {produceList?.filter(p => p.status === 'Available').map(p => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.name} ({p.quantity}kg)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="destination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Destination Address</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Whole Foods Market, Seattle" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deliveryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Delivery</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Scheduling..." : "Create Schedule"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
          </div>
        ) : shipments?.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
            <Truck className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No active shipments</h3>
            <p className="text-muted-foreground">Schedule a new delivery to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {shipments?.map((shipment) => (
              <Card key={shipment.id} className="border-border/50 hover:border-primary/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                    {/* Info Section */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className={`
                          ${shipment.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                            shipment.status === 'In Transit' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'}
                        `}>
                          {shipment.status === 'Delivered' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {shipment.status === 'In Transit' && <Truck className="w-3 h-3 mr-1" />}
                          {shipment.status === 'Scheduled' && <Clock className="w-3 h-3 mr-1" />}
                          {shipment.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">ID: {shipment.id.slice(0, 8)}</span>
                      </div>

                      <h3 className="text-lg font-bold font-display text-foreground">
                        {getProduceName(shipment.produceId)}
                      </h3>

                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1.5 text-primary/60" />
                          {shipment.destination}
                        </div>
                        <div className="flex items-center">
                          <CalendarClock className="w-4 h-4 mr-1.5 text-primary/60" />
                          Due: {format(new Date(shipment.deliveryDate), 'MMM d, yyyy')}
                        </div>
                      </div>

                      {(shipment as any).routeData && (
                        <div className="mt-4 p-3 bg-muted/30 rounded-lg flex flex-wrap gap-4 text-xs font-medium border border-border/50">
                          <div className="flex items-center text-primary">
                            <Truck className="w-3.5 h-3.5 mr-1.5" />
                            <span>Distance: {(shipment as any).routeData.distance}</span>
                          </div>
                          <div className="flex items-center text-primary">
                            <Clock className="w-3.5 h-3.5 mr-1.5" />
                            <span>Est. Duration: {(shipment as any).routeData.duration}</span>
                          </div>
                          <div className="w-full text-muted-foreground italic flex items-center gap-1 mt-1 border-t border-border/50 pt-2 text-[10px] justify-between">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" />
                              <span>{(shipment as any).routeData.source} <ArrowRight className="inline w-2.5 h-2.5 mx-0.5" /> {(shipment as any).routeData.destination}</span>
                            </div>

                            {(shipment as any).routeData.coordinates && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 text-[10px] text-primary hover:text-primary/80 px-2">
                                    <Eye className="w-3 h-3 mr-1" />
                                    Visual Map
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[700px] h-[500px] p-0 overflow-hidden">
                                  <div className="p-4 border-b bg-muted/5">
                                    <h2 className="font-bold flex items-center gap-2">
                                      <MapIcon className="w-4 h-4 text-primary" />
                                      Route Visualization
                                    </h2>
                                    <p className="text-xs text-muted-foreground">Mapping route from {(shipment as any).routeData.source} to {(shipment as any).routeData.destination}</p>
                                  </div>
                                  <div className="flex-1 min-h-0">
                                    <MapVisualization
                                      start={(shipment as any).routeData.coordinates.start}
                                      end={(shipment as any).routeData.coordinates.end}
                                      source={(shipment as any).routeData.source}
                                      destination={(shipment as any).routeData.destination}
                                    />
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Timeline / Progress Visualization (Simple) */}
                    <div className="hidden md:flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <div className={`px-3 py-1 rounded-full ${shipment.status !== 'Scheduled' ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>Scheduled</div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/30" />
                      <div className={`px-3 py-1 rounded-full ${['In Transit', 'Delivered'].includes(shipment.status) ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>In Transit</div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/30" />
                      <div className={`px-3 py-1 rounded-full ${shipment.status === 'Delivered' ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>Delivered</div>
                    </div>

                    {/* Action Buttons */}
                    {(role === "distributor" || role === "vendor") && (
                      <div className="flex gap-2 w-full lg:w-auto mt-4 lg:mt-0">
                        {shipment.status === "Scheduled" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full lg:w-auto border-blue-200 hover:bg-blue-50 text-blue-700"
                            onClick={() => updateStatusMutation.mutate({ id: shipment.id, status: "In Transit" })}
                            disabled={updateStatusMutation.isPending}
                          >
                            <Truck className="w-4 h-4 mr-2" />
                            Mark In Transit
                          </Button>
                        )}
                        {shipment.status === "In Transit" && (
                          <Button
                            size="sm"
                            className="w-full lg:w-auto bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => updateStatusMutation.mutate({ id: shipment.id, status: "Delivered" })}
                            disabled={updateStatusMutation.isPending}
                          >
                            <PackageCheck className="w-4 h-4 mr-2" />
                            Mark Delivered
                          </Button>
                        )}
                      </div>
                    )}
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
