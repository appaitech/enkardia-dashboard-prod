
export interface CallToAction {
  id: string;
  clientBusinessId: string;
  title: string;
  description: string | null;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string;
  urls: CallToActionUrl[];
  viewCount?: number;
  viewed?: boolean;
}

export interface CallToActionUrl {
  id: string;
  callToActionId: string;
  url: string;
  label: string | null;
}

export interface CallToActionView {
  id: string;
  callToActionId: string;
  userId: string;
  viewedAt: string;
}
