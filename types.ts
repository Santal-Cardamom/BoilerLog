
export interface WaterTestEntry {
  id: string;
  date: string;
  time: string;
  sulphite: number;
  alkalinity: number;
  hardness: number;
}

export interface BlowdownEntry {
  id: string;
  date: string;
  time: string;
  duration: number; // in minutes
  reason: string;
}

export enum Page {
  Summary = 'Summary',
  NewEntry = 'New Entry',
  Settings = 'Settings',
}

export interface TestParameters {
  sulphite: { min: number; max: number };
  alkalinity: { min: number; max: number };
  hardness: { max: number };
}
