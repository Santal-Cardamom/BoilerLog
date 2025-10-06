export interface AuthorizedUser {
  id: string;
  name: string;
}

export interface WaterTestEntry {
  id: string;
  // General Information
  date: string;
  time: string;
  boilerName: 'Beel' | 'Cradley';
  testedByUserId?: string;
  boilerStartTime: string;
  mainGasReading?: number;
  
  // Water Tests
  sulphite?: number; // Kept from old structure
  alkalinity?: number; // Kept from old structure
  boilerPh?: number;
  tdsProbeReadout?: number;
  tdsLevelCheck?: number;
  
  // Feed Water
  feedWaterHardness?: number;
  feedWaterPh?: number;
  
  // Boiler Softeners
  boilerSoftenerHardness?: number;
  boilerSoftenerUnitInService?: 1 | 2;
  boilerSoftenerLitresUntilRegen?: number;
  boilerSoftenerSaltBagsAdded?: number;
  
  // Brewhouse Condensate
  condensateHardness?: number;
  condensateTds?: number;
  condensatePh?: number;
  
  // Brewery Softeners
  brewerySoftenerHardness?: 'Soft' | 'Hard';
  brewerySoftenerUnitInService?: 1 | 2;
  
  // Chemical Added
  nalco77211?: number;
  nexGuard22310?: number;
  waterAdded?: number;
  
  // Ancillaries
  waterFeedPump?: 'Working' | 'Not Working';
  chemicalDosingPump?: 'Working' | 'Not Working';
  flameDetector?: 'Working' | 'Not Working';
  tdsProbeCheck?: 'Checked' | 'Not Checked';
  
  // Blowdown
  leftSightGlass?: 'Completed' | 'Not Completed';
  rightSightGlass?: 'Completed' | 'Not Completed';
  bottomBlowdown?: 'Completed' | 'Not Completed';
  
  // Effluent
  tocMonitorChecked?: boolean;
  spotSampleTaken?: boolean;
  compositeSampleTaken?: boolean;
  
  // Comment
  commentText?: string;

  // Legacy field for compatibility, can be phased out.
  hardness?: number; 
}

export interface CommentLog {
  id: string;
  timestamp: string; // ISO string
  userId?: string;
  source: 'Water Test' | 'Manual';
  text: string;
}


export interface WeeklyEvaporationLog {
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

export type EntryView = 'selection' | 'waterTest' | 'dailyBlowdown' | 'weeklyEvaporation' | 'boilerStartUp' | 'boilerShutdown' | 'addComment';

export interface ParameterRange {
  min: number;
  max: number;
}

export interface TestParameters {
  // Water Tests
  sulphite: ParameterRange;
  alkalinity: ParameterRange;
  boilerPh: ParameterRange;
  tdsProbeReadout: ParameterRange;
  tdsLevelCheck: ParameterRange;
  // Feed Water
  feedWaterHardness: ParameterRange;
  feedWaterPh: ParameterRange;
  // Boiler Softeners
  boilerSoftenerHardness: ParameterRange;
  // Condensate
  condensateHardness: ParameterRange;
  condensateTds: ParameterRange;
  condensatePh: ParameterRange;
  
  authorizedUsers: AuthorizedUser[];
  // Legacy, can be removed if feedWaterHardness is used everywhere
  hardness: { max: number };
}