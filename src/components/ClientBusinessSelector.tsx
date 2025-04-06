
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

interface ClientBusinessSelectorProps {
  clientBusinesses: DbClientBusiness[];
  selectedBusinessId: string | null;
  onBusinessSelect: (businessId: string) => void;
}

const ClientBusinessSelector: React.FC<ClientBusinessSelectorProps> = ({
  clientBusinesses,
  selectedBusinessId,
  onBusinessSelect,
}) => {
  return (
    <div className="w-full md:w-auto max-w-xs">
      <Select
        value={selectedBusinessId || undefined}
        onValueChange={onBusinessSelect}
      >
        <SelectTrigger className="w-full bg-white border-slate-200 text-slate-700">
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
