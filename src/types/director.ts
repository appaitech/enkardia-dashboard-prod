
export interface Director {
  id: string;
  full_name: string;
  date_of_birth?: string;
  nationality?: string;
  identification_number?: string;
  residential_address?: string;
  email?: string;
  phone?: string;
  position?: string;
  date_of_appointment?: string;
  date_of_resignation?: string;
  director_type?: string;
  tax_number?: string;
  tax_identification_number?: string;
  residency_status?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientDirector {
  id: string;
  client_business_id: string;
  director_id: string;
  created_at: string;
}

export interface DirectorFormData {
  full_name: string;
  date_of_birth?: string;
  nationality?: string;
  identification_number?: string;
  residential_address?: string;
  email?: string;
  phone?: string;
  position?: string;
  date_of_appointment?: string;
  date_of_resignation?: string;
  director_type?: string;
  tax_number?: string;
  tax_identification_number?: string;
  residency_status?: string;
}
