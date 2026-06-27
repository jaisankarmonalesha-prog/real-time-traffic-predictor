export interface Junction {
  id: string;
  name: string;
  x: number;
  y: number;
  lightStatus: 'green' | 'yellow' | 'red';
  queueLength: number;
  predictedDelay: number; // in seconds
}

export interface RoadSegment {
  id: string;
  name: string;
  from: string; // Junction ID
  to: string; // Junction ID
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  speedLimit: number; // mph
  currentSpeed: number; // mph
  volume: number; // vehicles per hour
  congestionLevel: 'clear' | 'moderate' | 'congested' | 'gridlock';
  incidentActive: boolean;
}

export interface TrafficIncident {
  id: string;
  type: 'accident' | 'construction' | 'breakdown' | 'hazard';
  roadId: string;
  roadName: string;
  severity: 'minor' | 'moderate' | 'severe';
  description: string;
  timestamp: string;
}

export interface SimulationState {
  timeOfDay: 'morning' | 'midday' | 'evening' | 'night';
  weather: 'sunny' | 'rain' | 'snow';
  eventDensity: 'none' | 'sports' | 'concert' | 'holiday';
  forecastHorizon: 'live' | '15m' | '1h' | '4h';
  mitigations: {
    signalOpt: boolean;
    rerouting: boolean;
    rampMetering: boolean;
  };
}
