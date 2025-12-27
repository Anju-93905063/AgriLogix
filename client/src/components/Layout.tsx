import { Sidebar } from "./Sidebar";
import { RoleSelector } from "./RoleSelector";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Sprout, Truck, Users } from "lucide-react";
import { clsx } from "clsx";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Produce Inventory", href: "/produce", icon: Sprout },
    { name: "Shipments", href: "/shipments", icon: Truck },
    { name: "User Management", href: "/users", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      <Sidebar />
      
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b bg-background sticky top-0 z-40">
        <span className="text-xl font-display font-bold text-foreground">AgriLogix</span>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="p-2 text-muted-foreground hover:text-foreground">
              <Menu className="w-6 h-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
             <div className="flex flex-col h-full">
              <div className="p-6 border-b">
                <span className="text-xl font-display font-bold text-foreground">AgriLogix</span>
              </div>
              <div className="flex-1 p-4 flex flex-col gap-1">
                {navigation.map((item) => (
                  <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
                    <div className={clsx(
                      "flex items-center px-3 py-3 text-sm font-medium rounded-lg",
                      location === item.href 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-muted"
                    )}>
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </div>
                  </Link>
                ))}
              </div>
             </div>
          </SheetContent>
        </Sheet>
      </div>

      <main className="lg:pl-72 min-h-screen">
        <div className="sticky top-0 z-30 flex items-center justify-end px-4 sm:px-6 lg:px-8 py-4 bg-background/80 backdrop-blur-md border-b border-border/40">
           <RoleSelector />
        </div>
        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
