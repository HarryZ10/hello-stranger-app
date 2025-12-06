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
  createdByUser?: boolean;
  createdBy?: string;
  categoryId?: number;
  categoryName?: string;
  categoryColor?: string;
  categoryIcon?: string;
}

export interface ActivityForm {
  activity: string;
  description: string;
  people: string;
}
