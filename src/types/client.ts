
export interface ClientBusiness {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone?: string;
  industry?: string;
  xeroConnected: boolean;
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
  xeroConnected: boolean;
}

export interface DbClientBusiness {
  id: string;
  name: string;
  contact_name: string;
  email: string;
  phone?: string;
  industry?: string;
  xero_connected: boolean;
  created_at: string;
  updated_at?: string;
}
