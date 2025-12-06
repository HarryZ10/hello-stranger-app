export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface Pin {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  activity?: string;
  description?: string;
}

export interface ActivityForm {
  activity: string;
  description: string;
  people: string;
}
