
export interface XeroConnection {
  id: string;
  authEventId: string;
  tenantId: string;
  tenantType: string;
  tenantName: string;
  createdDateUtc: string;
  updatedDateUtc: string;
  xeroTokenId?: string; // Added to link connections to tokens
  clientBusinessId?: string; // Added to track which client business is using this connection
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
  user_name?: string;  // Added to identify different Xero users
  authentication_event_id: string;
  token_expiry: string;
  connections?: XeroConnection[]; // Added to track connections associated with this token
}
