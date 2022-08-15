export interface BaseTable {
  id: string;
  created_at?: Date;
}

export interface Listings extends BaseTable {
  initializer: string;
  mint: string;
  image?: string;
  name?: string;
  description?: string;
  accepted_offer?: string;
  attributes?: { trait_type: string; value: string }[];
  collection_name?: string;
  collection_address?: string;
  offers?: Offer[];
}

export interface Offer extends BaseTable {
  bidder: string;
  listing_id: string;
  mint: string;
  image?: string;
  name?: string;
  description?: string;
  attributes?: any;
  accepted?: boolean;
  collection_name?: string;
  collection_address?: string;
}
