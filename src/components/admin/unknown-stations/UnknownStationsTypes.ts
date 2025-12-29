export interface UnknownStation {
  serialNumber: string;
  ip: string | null;
  connectedSince: number | null;
  connectedSinceIso: string | null;
  stationStatus: string;
  errorInfo: string;
  firmware: string | null;
  dbMatchSerial: string | null;
}

export interface UnknownStationsResponse {
  count: number;
  stations: UnknownStation[];
  error?: string;
}

export interface StationFormData {
  name: string;
  serialNumber: string;
  lat: string;
  lon: string;
  region: string;
  address: string;
  ipAddress: string;
  owner: string;
  app: string;
}
