
export interface ClientActivity {
  id: string;
  clientBusinessId: string;
  content: string;
  activityDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  createdByName: string;
  updatedByName: string;
}

export interface ClientActivityFormData {
  clientBusinessId: string;
  content: string;
  activityDate: Date;
}
