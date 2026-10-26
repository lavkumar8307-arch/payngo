export type LocationType =
  | 'state'
  | 'ut'
  | 'city'
  | 'town'
  | 'district'
  | 'attraction'
  | 'airport'
  | 'railway_station'
  | 'gps';

export interface LocationItem {
  id: string;
  name: string;
  normalizedName: string;
  aliases: string[];
  type: LocationType;
  state: string;
  stateCode?: string;
  countryCode: string; // 'IN'
  latitude: number;
  longitude: number;
  description?: string;
  popularity: number; // 1-100 score for sorting
  isRemote?: boolean;
}

export interface SearchLocationsResponse {
  success: boolean;
  query: string;
  results: LocationItem[];
  total: number;
  source: 'local' | 'remote' | 'hybrid';
  error?: string;
}
