
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
