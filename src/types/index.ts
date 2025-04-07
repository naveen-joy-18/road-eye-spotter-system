
export type Severity = 'low' | 'medium' | 'high';
export type Status = 'reported' | 'confirmed' | 'in_progress' | 'resolved';

export interface Pothole {
  id: string;
  latitude: number;
  longitude: number;
  address: string;
  severity: Severity;
  status: Status;
  reportedAt: string;
  updatedAt: string | null;
  description: string;
  imageUrl: string;
  reporter: string;
  upvotes: number;
}

export interface PotholeFormData {
  latitude: number;
  longitude: number;
  address: string;
  severity: Severity;
  description: string;
  image?: File | null;
}

export interface MapPosition {
  latitude: number;
  longitude: number;
  zoom: number;
}
