
export interface ClientBusiness {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone?: string;
  industry?: string;
  tenantId?: string; // Changed from xeroConnected to tenantId
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
  tenantId?: string; // Changed from xeroConnected to tenantId
}

export interface DbClientBusiness {
  id: string;
  name: string;
  contact_name: string;
  email: string;
  phone?: string;
  industry?: string;
  tenant_id?: string; // Changed from xero_connected to tenant_id
  created_at: string;
  updated_at?: string;
}
