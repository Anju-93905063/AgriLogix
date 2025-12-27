import { Link, useLocation } from "wouter";
import { LayoutDashboard, Sprout, Truck, Users, Leaf } from "lucide-react";
import { clsx } from "clsx";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Produce Inventory", href: "/produce", icon: Sprout },
  { name: "Shipments", href: "/shipments", icon: Truck },
  { name: "User Management", href: "/users", icon: Users },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-primary-foreground border-r border-border">
      <div className="flex items-center h-16 px-6 border-b border-border bg-white/50 backdrop-blur-sm">
        <Leaf className="w-8 h-8 text-primary mr-3" />
        <span className="text-xl font-display font-bold text-foreground tracking-tight">
          AgriLogix
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
        <div className="px-2 py-2 mb-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Platform
          </h3>
        </div>
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={clsx(
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon
                  className={clsx(
                    "mr-3 h-5 w-5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {item.name}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border bg-muted/20">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
            AL
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">Demo Admin</span>
            <span className="text-xs text-muted-foreground">System Manager</span>
          </div>
        </div>
      </div>
    </div>
  );
}
