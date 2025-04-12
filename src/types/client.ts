
export interface ClientBusiness {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone?: string;
  industry?: string;
  tenantId?: string | null; 
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface NewClientBusiness {
  name: string;
  contactName: string;
  email: string;
  phone?: string;
  industry?: string;
  tenantId?: string | null; 
}

export interface DbClientBusiness {
  id: string;
  name: string;
  contact_name: string;
  email: string;
  phone?: string;
  industry?: string;
  tenant_id?: string | null;
  created_at: string;
  updated_at?: string;
}
