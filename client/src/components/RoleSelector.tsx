import React, { createContext, useContext, useState } from "react";
import { UserCircle, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type Role = "farmer" | "distributor" | "vendor";

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("farmer");

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used within a RoleProvider");
  return context;
}

export function RoleSelector() {
  const { role, setRole } = useRole();

  const roles: { value: Role; label: string }[] = [
    { value: "farmer", label: "Farmer View" },
    { value: "distributor", label: "Distributor View" },
    { value: "vendor", label: "Vendor View" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary">
          <UserCircle className="h-4 w-4" />
          <span className="font-semibold">{roles.find(r => r.value === role)?.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {roles.map((r) => (
          <DropdownMenuItem
            key={r.value}
            onClick={() => setRole(r.value)}
            className="flex items-center justify-between cursor-pointer"
          >
            {r.label}
            {role === r.value && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
