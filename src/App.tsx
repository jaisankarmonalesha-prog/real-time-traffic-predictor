import { useState, useEffect, useRef } from 'react';
import type { Junction, RoadSegment, TrafficIncident, SimulationState } from './types/traffic';
import { TrafficMap } from './components/TrafficMap';
import { SimulationControls } from './components/SimulationControls';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { LiveAlerts } from './components/LiveAlerts';
import type { AlertLog } from './components/LiveAlerts';
import { Cpu } from 'lucide-react';
import './App.css';

// Initial Junction Configuration (Tamil Nadu Major District Hubs)
const INITIAL_JUNCTIONS: Junction[] = [
  { id: 'CHN', name: 'Chennai (Capital Metro Hub)', x: 450, y: 40, lightStatus: 'green', queueLength: 4, predictedDelay: 12 },
  { id: 'VEL', name: 'Vellore (Northern Highway Gate)', x: 330, y: 50, lightStatus: 'red', queueLength: 12, predictedDelay: 45 },
  { id: 'SLM', name: 'Salem (Steel City Transit Junction)', x: 230, y: 180, lightStatus: 'green', queueLength: 2, predictedDelay: 8 },
  { id: 'CBE', name: 'Coimbatore (Kongu Industrial Hub)', x: 90, y: 280, lightStatus: 'red', queueLength: 18, predictedDelay: 60 },
  { id: 'TRY', name: 'Trichy (Geographic Center)', x: 320, y: 250, lightStatus: 'green', queueLength: 3, predictedDelay: 10 },
  { id: 'MDU', name: 'Madurai (Pandya Cultural Gateway)', x: 260, y: 380, lightStatus: 'red', queueLength: 8, predictedDelay: 25 },
  { id: 'TNV', name: 'Tirunelveli (Nellai Southern Hub)', x: 200, y: 480, lightStatus: 'yellow', queueLength: 5, predictedDelay: 15 },
];

// Initial Road Segment Configuration (Tamil Nadu Major National Highways)
const INITIAL_ROADS: RoadSegment[] = [
  { id: 'nh48_chn_vel', name: 'NH 48 (Chennai ➔ Vellore)', from: 'CHN', to: 'VEL', x1: 450, y1: 40, x2: 330, y2: 50, speedLimit: 60, currentSpeed: 52, volume: 880, congestionLevel: 'clear', incidentActive: false },
  { id: 'nh48_vel_chn', name: 'NH 48 (Vellore ➔ Chennai)', from: 'VEL', to: 'CHN', x1: 330, y1: 50, x2: 450, y2: 40, speedLimit: 60, currentSpeed: 41, volume: 920, congestionLevel: 'moderate', incidentActive: false },
  { id: 'nh45_chn_try', name: 'NH 45 GST Road (Chennai ➔ Trichy)', from: 'CHN', to: 'TRY', x1: 450, y1: 40, x2: 320, y2: 250, speedLimit: 60, currentSpeed: 55, volume: 1100, congestionLevel: 'clear', incidentActive: false },
  { id: 'nh45_try_chn', name: 'NH 45 GST Road (Trichy ➔ Chennai)', from: 'TRY', to: 'CHN', x1: 320, y1: 250, x2: 450, y2: 40, speedLimit: 60, currentSpeed: 38, volume: 1450, congestionLevel: 'moderate', incidentActive: false },
  { id: 'nh48_vel_slm', name: 'NH 48 / 844 (Vellore ➔ Salem)', from: 'VEL', to: 'SLM', x1: 330, y1: 50, x2: 230, y2: 180, speedLimit: 55, currentSpeed: 44, volume: 680, congestionLevel: 'clear', incidentActive: false },
  { id: 'nh48_slm_vel', name: 'NH 48 / 844 (Salem ➔ Vellore)', from: 'SLM', to: 'VEL', x1: 230, y1: 180, x2: 330, y2: 50, speedLimit: 55, currentSpeed: 21, volume: 950, congestionLevel: 'congested', incidentActive: false },
  { id: 'nh544_slm_cbe', name: 'NH 544 (Salem ➔ Coimbatore)', from: 'SLM', to: 'CBE', x1: 230, y1: 180, x2: 90, y2: 280, speedLimit: 65, currentSpeed: 58, volume: 720, congestionLevel: 'clear', incidentActive: false },
  { id: 'nh544_cbe_slm', name: 'NH 544 (Coimbatore ➔ Salem)', from: 'CBE', to: 'SLM', x1: 90, y1: 280, x2: 230, y2: 180, speedLimit: 65, currentSpeed: 51, volume: 810, congestionLevel: 'clear', incidentActive: false },
  { id: 'nh79_slm_try', name: 'NH 79 (Salem ➔ Trichy)', from: 'SLM', to: 'TRY', x1: 230, y1: 180, x2: 320, y2: 250, speedLimit: 50, currentSpeed: 42, volume: 490, congestionLevel: 'clear', incidentActive: false },
  { id: 'nh79_try_slm', name: 'NH 79 (Trichy ➔ Salem)', from: 'TRY', to: 'SLM', x1: 320, y1: 250, x2: 230, y2: 180, speedLimit: 50, currentSpeed: 38, volume: 550, congestionLevel: 'clear', incidentActive: false },
  { id: 'nh81_try_cbe', name: 'NH 81 (Trichy ➔ Coimbatore)', from: 'TRY', to: 'CBE', x1: 320, y1: 250, x2: 90, y2: 280, speedLimit: 55, currentSpeed: 48, volume: 410, congestionLevel: 'clear', incidentActive: false },
  { id: 'nh81_cbe_try', name: 'NH 81 (Coimbatore ➔ Trichy)', from: 'CBE', to: 'TRY', x1: 90, y1: 280, x2: 320, y2: 250, speedLimit: 55, currentSpeed: 32, volume: 780, congestionLevel: 'moderate', incidentActive: false },
  { id: 'nh38_try_mdu', name: 'NH 38 (Trichy ➔ Madurai)', from: 'TRY', to: 'MDU', x1: 320, y1: 250, x2: 260, y2: 380, speedLimit: 60, currentSpeed: 49, volume: 910, congestionLevel: 'clear', incidentActive: false },
  { id: 'nh38_mdu_try', name: 'NH 38 (Madurai ➔ Trichy)', from: 'MDU', to: 'TRY', x1: 260, y1: 380, x2: 320, y2: 250, speedLimit: 60, currentSpeed: 18, volume: 1600, congestionLevel: 'congested', incidentActive: false },
  { id: 'nh83_cbe_mdu', name: 'NH 83 (Coimbatore ➔ Madurai)', from: 'CBE', to: 'MDU', x1: 90, y1: 280, x2: 260, y2: 380, speedLimit: 50, currentSpeed: 41, volume: 520, congestionLevel: 'clear', incidentActive: false },
  { id: 'nh83_mdu_cbe', name: 'NH 83 (Madurai ➔ Coimbatore)', from: 'MDU', to: 'CBE', x1: 260, y1: 380, x2: 90, y2: 280, speedLimit: 50, currentSpeed: 38, volume: 590, congestionLevel: 'clear', incidentActive: false },
  { id: 'nh7_mdu_tnv', name: 'NH 7 (Madurai ➔ Tirunelveli)', from: 'MDU', to: 'TNV', x1: 260, y1: 380, x2: 200, y2: 480, speedLimit: 65, currentSpeed: 59, volume: 830, congestionLevel: 'clear', incidentActive: false },
  { id: 'nh7_tnv_mdu', name: 'NH 7 (Tirunelveli ➔ Madurai)', from: 'TNV', to: 'MDU', x1: 200, y1: 480, x2: 260, y2: 380, speedLimit: 65, currentSpeed: 12, volume: 1750, congestionLevel: 'gridlock', incidentActive: false },
];

// Seed Historical Data (10 data points)
const SEED_HISTORY = [
  { time: '10:50 AM', actual: 44, predicted: 42 },
  { time: '10:52 AM', actual: 45, predicted: 43 },
  { time: '10:54 AM', actual: 48, predicted: 44 },
  { time: '10:56 AM', actual: 49, predicted: 46 },
  { time: '10:58 AM', actual: 52, predicted: 48 },
  { time: '11:00 AM', actual: 50, predicted: 49 },
  { time: '11:02 AM', actual: 47, predicted: 50 },
  { time: '11:04 AM', actual: 46, predicted: 49 },
  { time: '11:06 AM', actual: 43, predicted: 47 },
  { time: '11:08 AM', actual: 42, predicted: 45 },
];

function App() {
  const [junctions, setJunctions] = useState<Junction[]>(INITIAL_JUNCTIONS);
  const [roads, setRoads] = useState<RoadSegment[]>(INITIAL_ROADS);
  const [incidents, setIncidents] = useState<TrafficIncident[]>([]);
  const [alerts, setAlerts] = useState<AlertLog[]>([
    { id: 'a1', text: 'Telemetry streams operational. Tamil Nadu Highway Twin is active.', time: '11:00:00 AM', type: 'info' },
    { id: 'a2', text: 'High density bottleneck detected at Node CHN (Chennai Capital Hub).', time: '11:02:15 AM', type: 'warning' },
    { id: 'a3', text: 'AI Suggestion: Activate Dynamic Signal Timing to flush Chennai transit queues.', time: '11:05:30 AM', type: 'actionable', actionLabel: 'Sync Signals', actionType: 'signal', actionTargetId: 'CHN' }
  ]);
  
  const [simState, setSimState] = useState<SimulationState>({
    timeOfDay: 'midday',
    weather: 'sunny',
    eventDensity: 'none',
    forecastHorizon: 'live',
    mitigations: {
      signalOpt: false,
      rerouting: false,
      rampMetering: false
    }
  });

  const [isPredicting, setIsPredicting] = useState(false);
  const [globalCongestion, setGlobalCongestion] = useState(42);
  const [congestionHistory, setCongestionHistory] = useState(SEED_HISTORY);
  
  // Selection HUD states
  const [selectedJunctionId, setSelectedJunctionId] = useState<string | null>(null);
  const [selectedRoadId, setSelectedRoadId] = useState<string | null>(null);
  
  // Live clock
  const [currentTimeStr, setCurrentTimeStr] = useState('11:08:00 AM');

  // Ref to hold current state to prevent stale closures in interval
  const stateRef = useRef({ simState, roads, junctions, incidents, globalCongestion, congestionHistory });
  useEffect(() => {
    stateRef.current = { simState, roads, junctions, incidents, globalCongestion, congestionHistory };
  }, [simState, roads, junctions, incidents, globalCongestion, congestionHistory]);

  // 1. Clock timer
  useEffect(() => {
    const clockTimer = setInterval(() => {
      const d = new Date();
      setCurrentTimeStr(d.toLocaleTimeString());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Helper to calculate congestion level
  const calculateCongestionLevel = (current: number, limit: number): 'clear' | 'moderate' | 'congested' | 'gridlock' => {
    const ratio = current / limit;
    if (ratio >= 0.85) return 'clear';
    if (ratio >= 0.60) return 'moderate';
    if (ratio >= 0.35) return 'congested';
    return 'gridlock';
  };

  // 2. Active Simulation Cycle
  useEffect(() => {
    const simInterval = setInterval(() => {
      const { simState: currentSim, roads: currentRoads, junctions: currentJunctions, incidents: currentIncidents } = stateRef.current;
      
      // A. Cycle Traffic Lights
      const updatedJunctions = currentJunctions.map((j) => {
        let newLight = j.lightStatus;
        if (j.lightStatus === 'green') newLight = 'yellow';
        else if (j.lightStatus === 'yellow') newLight = 'red';
        else newLight = 'green';

        // Adjust queue lengths dynamically based on light status and policies
        let queueMod = 0;
        if (newLight === 'red') {
          queueMod = Math.floor(Math.random() * 3) + 1; // increase queue
        } else if (newLight === 'green') {
          const drainRate = currentSim.mitigations.signalOpt ? 4 : 2;
          queueMod = -Math.min(j.queueLength, Math.floor(Math.random() * drainRate) + 1); // decrease queue
        }

        const newQueue = Math.max(0, j.queueLength + queueMod);
        // Delay is proportional to queue
        const delayFactor = currentSim.mitigations.signalOpt ? 2.5 : 4;
        const newDelay = Math.round(newQueue * delayFactor);

        return {
          ...j,
          lightStatus: newLight as 'green' | 'yellow' | 'red',
          queueLength: newQueue,
          predictedDelay: newDelay
        };
      });

      // B. Recalculate Road Volumes & Speeds
      const updatedRoads = currentRoads.map((road) => {
        let speed = road.currentSpeed;
        let volume = road.volume;

        // Base fluctuations
        volume = Math.round(volume + (Math.random() * 40 - 20));
        volume = Math.max(100, Math.min(2000, volume));

        // Time of Day modifiers
        let timeMultiplier = 1.0;
        if (currentSim.timeOfDay === 'morning') {
          // Inbound peaks
          if (road.to === 'CHN' || road.to === 'SLM') timeMultiplier = 1.35;
        } else if (currentSim.timeOfDay === 'evening') {
          // Outbound peaks
          if (road.from === 'CHN') timeMultiplier = 1.4;
        } else if (currentSim.timeOfDay === 'night') {
          timeMultiplier = 0.45;
        }

        // Weather modifiers
        let weatherSpeedMultiplier = 1.0;
        if (currentSim.weather === 'rain') weatherSpeedMultiplier = 0.8;
        else if (currentSim.weather === 'snow') weatherSpeedMultiplier = 0.55;

        // Event modifiers
        let eventVolumeMultiplier = 1.0;
        if (currentSim.eventDensity === 'concert' && (road.to === 'TRY' || road.from === 'TRY')) {
          eventVolumeMultiplier = 1.35;
        } else if (currentSim.eventDensity === 'sports' && (road.to === 'CBE' || road.from === 'CBE')) {
          eventVolumeMultiplier = 1.45;
        } else if (currentSim.eventDensity === 'holiday') {
          eventVolumeMultiplier = 0.85; // Less local traffic
          if (road.to === 'TNV' || road.id.includes('nh7')) eventVolumeMultiplier = 1.3; // Highway exits busy
        }

        // Apply Mitigations
        let policySpeedMultiplier = 1.0;
        let policyVolumeMultiplier = 1.0;
        if (currentSim.mitigations.rerouting) {
          // Rerouting balances highly volume segments by 15%
          if (road.congestionLevel === 'congested' || road.congestionLevel === 'gridlock') {
            policyVolumeMultiplier = 0.82;
            policySpeedMultiplier = 1.2;
          }
        }
        if (currentSim.mitigations.rampMetering && road.id.includes('nh7')) {
          // Metering reduces volume inflow on main expressways
          policyVolumeMultiplier = 0.85;
          policySpeedMultiplier = 1.15;
        }

        // Calculate Target Speed based on Volume/Capacity Ratio
        const vRatio = (volume * eventVolumeMultiplier * policyVolumeMultiplier * timeMultiplier) / 1500;
        let calculatedSpeed = road.speedLimit * (1 - Math.min(0.85, vRatio * 0.7));

        // Apply weather & incident overrides
        calculatedSpeed *= weatherSpeedMultiplier * policySpeedMultiplier;

        if (road.incidentActive) {
          calculatedSpeed = Math.floor(Math.random() * 6) + 4; // Crawl at 4-10 mph
        }

        // Cap speed
        speed = Math.round(Math.max(3, Math.min(road.speedLimit, calculatedSpeed)));

        // If road target junction has a red light, reduce speed further at the end of segment
        const targetJunction = updatedJunctions.find((j) => j.id === road.to);
        if (targetJunction && targetJunction.lightStatus === 'red' && !road.incidentActive) {
          speed = Math.round(speed * 0.7);
        }

        return {
          ...road,
          volume,
          currentSpeed: speed,
          congestionLevel: calculateCongestionLevel(speed, road.speedLimit)
        };
      });

      // C. Calculate Global Congestion Index
      let totalSpeed = 0;
      let totalLimit = 0;
      updatedRoads.forEach((r) => {
        totalSpeed += r.currentSpeed;
        totalLimit += r.speedLimit;
      });
      const avgSpeed = totalSpeed / updatedRoads.length;
      const avgLimit = totalLimit / updatedRoads.length;
      const congestionIndex = Math.round((1 - avgSpeed / avgLimit) * 100);

      // D. Periodic Random Incidents Spawner (5% chance per cycle, max 3)
      let finalIncidents = [...currentIncidents];
      let finalRoads = [...updatedRoads];


      if (Math.random() < 0.06 && currentIncidents.length < 3) {
        // Find clear/moderate road to crash
        const targetRoads = updatedRoads.filter((r) => !r.incidentActive);
        if (targetRoads.length > 0) {
          const target = targetRoads[Math.floor(Math.random() * targetRoads.length)];
          const types = ['accident', 'construction', 'breakdown'] as const;
          const selectedType = types[Math.floor(Math.random() * types.length)];
          const severities = ['minor', 'moderate', 'severe'] as const;
          const selectedSeverity = severities[Math.floor(Math.random() * severities.length)];

          let desc = `Lane blocked due to ${selectedType}`;
          if (selectedType === 'accident') desc = `${selectedSeverity.toUpperCase()} accident: Multi-vehicle collision`;
          else if (selectedType === 'construction') desc = `Roadwork maintenance: Right lane closed`;

          const newIncident: TrafficIncident = {
            id: `inc_${Date.now()}`,
            type: selectedType,
            roadId: target.id,
            roadName: target.name,
            severity: selectedSeverity,
            description: desc,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          finalIncidents.push(newIncident);
          // Update this road immediately in final list
          finalRoads = finalRoads.map((r) => {
            if (r.id === target.id) {
              return { ...r, incidentActive: true, currentSpeed: 5, congestionLevel: 'gridlock' };
            }
            return r;
          });

          // Log Alert
          const timestamp = new Date().toLocaleTimeString();
          const newAlert: AlertLog = {
            id: `alert_${Date.now()}`,
            text: `CRITICAL ALERT: ${newIncident.description} on ${newIncident.roadName}! Traffic impacted.`,
            time: timestamp,
            type: 'warning'
          };
          setAlerts((prev) => [newAlert, ...prev.slice(0, 19)]);
        }
      }

      setJunctions(updatedJunctions);
      setRoads(finalRoads);
      setIncidents(finalIncidents);
      setGlobalCongestion(congestionIndex);

      // E. Update Trend history
      const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Predicted line baseline
      let predictedBaseline = congestionIndex + (Math.random() * 8 - 4);
      if (currentSim.mitigations.signalOpt || currentSim.mitigations.rerouting) {
        predictedBaseline += 8; // Without policies, congestion would be higher
      }
      predictedBaseline = Math.max(10, Math.min(95, predictedBaseline));

      setCongestionHistory((prev) => {
        const next = [...prev, { time: timeLabel, actual: congestionIndex, predicted: Math.round(predictedBaseline) }];
        if (next.length > 10) next.shift();
        return next;
      });

    }, 4000);

    return () => clearInterval(simInterval);
  }, []);

  // 3. Trigger manual ML prediction recalculation (displays neural network simulation)
  const handleTriggerPrediction = () => {
    setIsPredicting(true);
    
    // Log start
    const timestampStr = new Date().toLocaleTimeString();
    const startLog: AlertLog = {
      id: `l_${Date.now()}`,
      text: 'Neural Predictor: Querying deep convolution weights for traffic flows...',
      time: timestampStr,
      type: 'info'
    };
    setAlerts((prev) => [startLog, ...prev]);

    setTimeout(() => {
      setIsPredicting(false);
      
      // Calculate optimized indexes
      const activeMitigations = Object.values(simState.mitigations).filter(Boolean).length;
      let reduction = 0;
      if (activeMitigations === 1) reduction = 8;
      else if (activeMitigations === 2) reduction = 15;
      else if (activeMitigations === 3) reduction = 22;

      // Adjust road speeds and congestion slightly to reflect calculations
      if (reduction > 0) {
        setRoads((prev) =>
          prev.map((r) => {
            if (r.congestionLevel === 'gridlock' || r.congestionLevel === 'congested') {
              const speedIncrease = Math.round(r.currentSpeed * (1 + (reduction / 100)));
              const newSpeed = Math.min(r.speedLimit, speedIncrease);
              return {
                ...r,
                currentSpeed: newSpeed,
                congestionLevel: calculateCongestionLevel(newSpeed, r.speedLimit)
              };
            }
            return r;
          })
        );
        setGlobalCongestion((prev) => Math.max(15, prev - reduction));
      }

      const endTimestamp = new Date().toLocaleTimeString();
      const endLog: AlertLog = {
        id: `l_${Date.now() + 1}`,
        text: `Neural Predictor Finished. Global grid efficiency improved by ${activeMitigations * 7}%.`,
        time: endTimestamp,
        type: 'policy'
      };
      setAlerts((prev) => [endLog, ...prev]);
    }, 1800);
  };

  // 4. Incident Clearing Action
  const handleClearIncident = (incidentId: string) => {
    const incident = incidents.find((inc) => inc.id === incidentId);
    if (!incident) return;

    // Reset incident state on target road
    setRoads((prev) =>
      prev.map((r) => {
        if (r.id === incident.roadId) {
          // Recover speed limit 70% immediately
          const recoveredSpeed = Math.round(r.speedLimit * 0.75);
          return {
            ...r,
            incidentActive: false,
            currentSpeed: recoveredSpeed,
            congestionLevel: calculateCongestionLevel(recoveredSpeed, r.speedLimit)
          };
        }
        return r;
      })
    );

    // Clear incident
    setIncidents((prev) => prev.filter((inc) => inc.id !== incidentId));

    // Log resolution
    const timestampStr = new Date().toLocaleTimeString();
    const resolveLog: AlertLog = {
      id: `l_${Date.now()}`,
      text: `ASSISTANCE DISPATCHED: Incident resolved on ${incident.roadName}. Traffic lanes cleared.`,
      time: timestampStr,
      type: 'info'
    };
    setAlerts((prev) => [resolveLog, ...prev]);
  };

  // 5. Execute Actionable Alerts from AI Recommend panel
  const handleExecuteAlertAction = (alertId: string, actionType: string, targetId?: string) => {
    // Clear alert row from lists
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));

    const timestampStr = new Date().toLocaleTimeString();
    let textLog = '';

    if (actionType === 'signal' && targetId) {
      // Turn on Dynamic Signal timing in state
      setSimState((prev) => ({
        ...prev,
        mitigations: { ...prev.mitigations, signalOpt: true }
      }));
      textLog = `POLICY DEPLOYED: AI Signal Coordination synced at Node ${targetId}. Queue flushing active.`;
    } else if (actionType === 'reroute' && targetId) {
      setSimState((prev) => ({
        ...prev,
        mitigations: { ...prev.mitigations, rerouting: true }
      }));
      textLog = `POLICY DEPLOYED: Dynamic vehicle diversion enabled around segment ${targetId}.`;
    }

    const logItem: AlertLog = {
      id: `l_${Date.now()}`,
      text: textLog,
      time: timestampStr,
      type: 'policy'
    };
    setAlerts((prev) => [logItem, ...prev]);
  };

  // Helper shortcut to trigger a random incident for testing
  const triggerIncidentShortcut = () => {
    const targetRoads = roads.filter((r) => !r.incidentActive);
    if (targetRoads.length === 0) return;
    const target = targetRoads[Math.floor(Math.random() * targetRoads.length)];
    const newInc: TrafficIncident = {
      id: `inc_${Date.now()}`,
      type: 'accident',
      roadId: target.id,
      roadName: target.name,
      severity: 'severe',
      description: 'Severe accident: Heavy truck breakdown blocking 2 lanes',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setIncidents((prev) => [...prev, newInc]);
    setRoads((prev) =>
      prev.map((r) => {
        if (r.id === target.id) return { ...r, incidentActive: true, currentSpeed: 4, congestionLevel: 'gridlock' };
        return r;
      })
    );
    setAlerts((prev) => [
      {
        id: `alert_${Date.now()}`,
        text: `CRITICAL ALERT: ${newInc.description} on ${newInc.roadName}! Traffic gridlocked.`,
        time: new Date().toLocaleTimeString(),
        type: 'warning'
      },
      ...prev
    ]);
  };

  return (
    <div className="app-container">
      {/* 1. Header Area */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon-container">
            <Cpu size={22} className="animate-pulse" />
          </div>
          <div className="logo-text">
            <h1>METROFLOW AI</h1>
            <span>Predictive Traffic Control Console</span>
          </div>
        </div>

        <div className="header-system-stats">
          <button 
            className="incident-trigger-shortcut-btn font-mono"
            onClick={triggerIncidentShortcut}
            title="Force a simulated crash to test emergency dispatch controls"
          >
            ⚠️ SIMULATE COLLISION
          </button>
          
          <div className="header-stat">
            <span className="stat-label">LOCAL CLOCK:</span>
            <span className="stat-value font-mono text-cyan glow-cyan">{currentTimeStr}</span>
          </div>
          
          <div className="header-stat">
            <span className="stat-label">TAMIL NADU STATE GRID:</span>
            <span className="stat-value online font-mono">ONLINE</span>
          </div>
          
          <div className="header-stat">
            <span className="stat-label">PREDICTION HORIZON:</span>
            <span className="stat-value simulating font-mono">
              {simState.forecastHorizon === 'live' ? 'REAL-TIME' : `${simState.forecastHorizon.toUpperCase()} FORECAST`}
            </span>
          </div>
        </div>
      </header>

      {/* 2. Main Content Grid */}
      <main className="app-content">
        {/* Left Side Controls */}
        <SimulationControls
          state={simState}
          onChangeState={setSimState}
          onTriggerPrediction={handleTriggerPrediction}
          isPredicting={isPredicting}
          globalCongestionIndex={globalCongestion}
        />

        {/* Center Map & Alert Pane */}
        <div className="center-map-area">
          <TrafficMap
            junctions={junctions}
            roads={roads}
            incidents={incidents}
            selectedJunctionId={selectedJunctionId}
            selectedRoadId={selectedRoadId}
            onSelectJunction={setSelectedJunctionId}
            onSelectRoad={setSelectedRoadId}
          />
          <LiveAlerts
            incidents={incidents}
            alerts={alerts}
            onExecuteAlertAction={handleExecuteAlertAction}
            onClearIncident={handleClearIncident}
          />
        </div>

        {/* Right Side Analytics */}
        <AnalyticsPanel
          junctions={junctions}
          roads={roads}
          congestionHistory={congestionHistory}
        />
      </main>
    </div>
  );
}

export default App;
