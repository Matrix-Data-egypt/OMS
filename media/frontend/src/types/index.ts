export interface MediaClient {
  id: string;
  name: string;
  taxNumber?: string;
  createdAt: string;
  _count?: {
    records: number;
  };
}

export interface MediaSupplier {
  id: string;
  name: string;
  taxNumber?: string;
  createdAt: string;
  _count?: {
    records: number;
  };
}

export interface MediaChannel {
  id: string;
  name: string;
  createdAt: string;
  _count?: {
    records: number;
  };
}

export interface MediaContentType {
  id: string;
  name: string;
  createdAt: string;
  _count?: {
    contents: number;
  };
}

export interface MediaContent {
  id: string;
  name: string;
  contentTypeId: string;
  contentType?: MediaContentType;
  createdAt: string;
  _count?: {
    records: number;
  };
}

export interface MediaRecord {
  id: string;
  title?: string;
  clientId: string;
  client?: MediaClient;
  supplierId: string;
  supplier?: MediaSupplier;
  channelId: string;
  channel?: MediaChannel;
  contentId: string;
  content?: MediaContent;
  month: string;
  cost: number;
  netToChannel: number;
  netToClient: number;
  notes?: string;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'INVOICED';
  invoiceId?: string;
  createdAt: string;
}

export interface FilterFacets {
  clients: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
  channels: { id: string; name: string }[];
  contents: { id: string; name: string; contentType?: { name: string } }[];
  months: string[];
}
