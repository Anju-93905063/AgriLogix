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

import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="agrilogix-theme">
      <QueryClientProvider client={queryClient}>
        <RoleProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
              <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center justify-between px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tight text-primary">AgriLogix</span>
                  </div>
                  <ThemeToggle />
                </div>
              </header>
              <main className="container mx-auto px-4 py-6">
                <Router />
              </main>
            </div>
            <Toaster />
          </TooltipProvider>
        </RoleProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
