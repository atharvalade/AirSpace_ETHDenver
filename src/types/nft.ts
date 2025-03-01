export interface NFT {
  id: string;
  name: string;
  title: string;
  description: string;
  thumbnail: string;
  propertyAddress: string;
  currentHeight: number;
  maximumHeight: number;
  availableFloors: number;
  price: number;
  token_id?: number;
  contract_address?: string;
  owner?: string;
  metadata?: Record<string, any>;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  original_format?: boolean;
} 