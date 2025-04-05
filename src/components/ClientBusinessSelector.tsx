
import React from "react";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
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
  onBusinessSelect
}) => {
  if (!clientBusinesses || clientBusinesses.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Building className="h-4 w-4 text-slate-500" />
      <Select 
        value={selectedBusinessId || undefined}
        onValueChange={onBusinessSelect}
      >
        <SelectTrigger className="w-[250px] bg-white border-slate-200">
          <SelectValue placeholder="Select a business" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {clientBusinesses.map((business) => (
              <SelectItem key={business.id} value={business.id}>
                {business.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ClientBusinessSelector;
