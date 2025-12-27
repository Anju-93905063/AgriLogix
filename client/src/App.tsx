import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider } from "@/components/RoleSelector";
import NotFound from "@/pages/not-found";

// Pages
import Dashboard from "@/pages/Dashboard";
import Produce from "@/pages/Produce";
import Shipments from "@/pages/Shipments";
import Users from "@/pages/Users";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/produce" component={Produce} />
      <Route path="/shipments" component={Shipments} />
      <Route path="/users" component={Users} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RoleProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </RoleProvider>
    </QueryClientProvider>
  );
}

export default App;
