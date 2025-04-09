
export interface XeroConnection {
  id: string;
  authEventId: string;
  tenantId: string;
  tenantType: string;
  tenantName: string;
  createdDateUtc: string;
  updatedDateUtc: string;
}

export interface XeroToken {
  id: string;
  id_token?: string;
  access_token: string;
  expires_in: number;
  token_type: string;
  refresh_token: string;
  scope?: string;
  created_at: string;
  updated_at: string;
  client_id?: string;
  xero_userid?: string;
  authentication_event_id: string;
  token_expiry: string;
}
