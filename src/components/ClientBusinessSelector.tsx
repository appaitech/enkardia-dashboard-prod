import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DbClientBusiness } from "@/types/client";
import { Building } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientBusinessSelectorProps {
  clientBusinesses: any[]; // Keep this as clientBusinesses to match existing code
  selectedBusinessId: string | null;
  onBusinessSelect: (businessId: string) => void;
  className?: string;
}

const ClientBusinessSelector: React.FC<ClientBusinessSelectorProps> = ({
  clientBusinesses,
  selectedBusinessId,
  onBusinessSelect,
  className
}) => {
  // Add null check before mapping
  if (!clientBusinesses) {
    return null;
  }

  return (
    <div className="w-full md:w-auto max-w-xs">
      <Select
        value={selectedBusinessId || undefined}
        onValueChange={onBusinessSelect}
      >
        <SelectTrigger className={cn("w-full bg-white border-slate-200 text-slate-700", className)}>
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-slate-500" />
            <SelectValue placeholder="Select a business" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {clientBusinesses.map((business) => (
            <SelectItem key={business.id} value={business.id}>
              <div className="flex flex-col">
                <span>{business.name}</span>
                {business.industry && (
                  <span className="text-xs text-slate-500">
                    {business.industry}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ClientBusinessSelector;
