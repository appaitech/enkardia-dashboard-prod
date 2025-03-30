
import { ClientBusiness } from "@/types/client";

// Mock data for client businesses
const mockClients: ClientBusiness[] = [
  {
    id: "1",
    name: "Acme Corporation",
    contactName: "John Doe",
    email: "john@acme.com",
    phone: "555-123-4567",
    industry: "Technology",
    xeroConnected: true,
    createdAt: "2023-03-15T10:00:00Z",
    updatedAt: "2023-09-20T14:30:00Z"
  },
  {
    id: "2",
    name: "Globex Industries",
    contactName: "Jane Smith",
    email: "jane@globex.com",
    phone: "555-987-6543",
    industry: "Manufacturing",
    xeroConnected: false,
    createdAt: "2023-04-22T09:15:00Z",
    updatedAt: "2023-10-05T11:20:00Z"
  },
  {
    id: "3",
    name: "Oceanic Airlines",
    contactName: "Robert Johnson",
    email: "robert@oceanic.com",
    phone: "555-555-5555",
    industry: "Transportation",
    xeroConnected: true,
    createdAt: "2023-01-10T08:45:00Z",
    updatedAt: "2023-08-15T16:10:00Z"
  },
  {
    id: "4",
    name: "Stark Industries",
    contactName: "Tony Stark",
    email: "tony@stark.com",
    phone: "555-123-9876",
    industry: "Defense",
    xeroConnected: true,
    createdAt: "2023-02-05T13:20:00Z",
    updatedAt: "2023-11-01T09:30:00Z"
  },
  {
    id: "5",
    name: "Umbrella Corporation",
    contactName: "Alice Wonder",
    email: "alice@umbrella.com",
    phone: "555-777-8888",
    industry: "Pharmaceuticals",
    xeroConnected: false,
    createdAt: "2023-05-17T11:40:00Z",
    updatedAt: "2023-09-30T15:15:00Z"
  },
  {
    id: "6",
    name: "Wayne Enterprises",
    contactName: "Bruce Wayne",
    email: "bruce@wayne.com",
    phone: "555-888-9999",
    industry: "Conglomerate",
    xeroConnected: true,
    createdAt: "2023-03-28T14:15:00Z",
    updatedAt: "2023-10-12T10:45:00Z"
  },
  {
    id: "7",
    name: "LexCorp",
    contactName: "Alexander Luthor",
    email: "lex@lexcorp.com",
    phone: "555-222-3333",
    industry: "Research",
    xeroConnected: false,
    createdAt: "2023-06-05T09:30:00Z",
    updatedAt: "2023-11-10T13:20:00Z"
  },
  {
    id: "8",
    name: "Cyberdyne Systems",
    contactName: "Miles Dyson",
    email: "miles@cyberdyne.com",
    phone: "555-444-7777",
    industry: "Artificial Intelligence",
    xeroConnected: false,
    createdAt: "2023-04-10T10:50:00Z",
    updatedAt: "2023-08-22T09:10:00Z"
  }
];

// Service functions
export const getClientBusinesses = async (): Promise<ClientBusiness[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockClients;
};

export const getClientBusinessById = async (id: string): Promise<ClientBusiness | undefined> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockClients.find(client => client.id === id);
};

export const searchClientBusinesses = async (query: string): Promise<ClientBusiness[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const lowercaseQuery = query.toLowerCase();
  
  return mockClients.filter(client => 
    client.name.toLowerCase().includes(lowercaseQuery) ||
    client.contactName.toLowerCase().includes(lowercaseQuery) ||
    client.email.toLowerCase().includes(lowercaseQuery) ||
    client.industry?.toLowerCase().includes(lowercaseQuery)
  );
};
