export interface AuthorizedUser {
  id: string;
  name: string;
}

export interface CustomParameter {
  id: string;
  name: string;
  unit: string;
  min: number;
  max: number;
}

export interface WaterTestEntry {
  id: string;
  date: string;
  time: string;
  sulphite: number;
  alkalinity: number;
  hardness: number;
  testedByUserId?: string;
  customFields: {
    [parameterId: string]: number;
  };
}

export interface DailyBlowdownLog {
  id: string;
  formStartedAt: string; // ISO string
  formFinishedAt: string; // ISO string
  testDate: string; // YYYY-MM-DD
  testTime: string; // HH:mm
  lowWaterAlarmWorked: boolean;
  lowLowWaterAlarmWorked: boolean;
  testCompleted: boolean;
  operatorUserId?: string;
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
  custom: CustomParameter[];
  authorizedUsers: AuthorizedUser[];
}
