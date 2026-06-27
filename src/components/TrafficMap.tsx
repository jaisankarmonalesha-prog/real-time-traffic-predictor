import React from 'react';
import type { Junction, RoadSegment, TrafficIncident } from '../types/traffic';
import { AlertTriangle, Hammer, Car, ShieldAlert } from 'lucide-react';
import './TrafficMap.css';

interface TrafficMapProps {
  junctions: Junction[];
  roads: RoadSegment[];
  incidents: TrafficIncident[];
  selectedJunctionId: string | null;
  selectedRoadId: string | null;
  onSelectJunction: (id: string | null) => void;
  onSelectRoad: (id: string | null) => void;
}

export const TrafficMap: React.FC<TrafficMapProps> = ({
  junctions,
  roads,
  incidents,
  selectedJunctionId,
  selectedRoadId,
  onSelectJunction,
  onSelectRoad,
}) => {
  const selectedRoad = roads.find((r) => r.id === selectedRoadId);
  const selectedJunction = junctions.find((j) => j.id === selectedJunctionId);

  const getCongestionColor = (level: string) => {
    switch (level) {
      case 'clear':
        return 'var(--traffic-clear)';
      case 'moderate':
        return 'var(--traffic-moderate)';
      case 'congested':
        return 'var(--traffic-congested)';
      case 'gridlock':
        return 'var(--traffic-gridlock)';
      default:
        return 'var(--text-muted)';
    }
  };

  const getAnimationDuration = (speed: number) => {
    if (speed <= 0) return '0s';
    // Faster speed = shorter animation duration (dots move faster)
    const duration = 120 / speed;
    return `${Math.max(0.5, Math.min(15, duration))}s`;
  };

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'accident':
        return <Car className="incident-icon-svg accident" size={16} />;
      case 'construction':
        return <Hammer className="incident-icon-svg construction" size={16} />;
      case 'breakdown':
        return <AlertTriangle className="incident-icon-svg breakdown" size={16} />;
      default:
        return <ShieldAlert className="incident-icon-svg hazard" size={16} />;
    }
  };

  return (
    <div className="traffic-map-container">
      <div className="map-header">
        <span className="map-title">TAMIL NADU STATE SENSOR GRID</span>
        <span className="map-coordinates">11.1271° N, 78.6569° E</span>
      </div>

      <div className="svg-wrapper">
        <svg viewBox="0 0 600 550" className="city-svg-grid">
          {/* Background Grid Lines */}
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(6, 182, 212, 0.05)" strokeWidth="1" />
            </pattern>
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          <text x="50" y="300" className="district-label">KONGU NADU WEST (COIMBATORE)</text>
          <text x="240" y="30" className="district-label">TONDAIMANDALAM NORTH (VELLORE)</text>
          <text x="340" y="230" className="district-label">CHOLA CENTRAL REGION (TRICHY)</text>
          <text x="300" y="400" className="district-label">PANDYA SOUTH REGION (MADURAI)</text>

          {/* Road Segment Roads underlays (dark track) */}
          {roads.map((road) => (
            <line
              key={`underlay-${road.id}`}
              x1={road.x1}
              y1={road.y1}
              x2={road.x2}
              y2={road.y2}
              className="road-underlay"
              strokeWidth="12"
              strokeLinecap="round"
              onClick={() => {
                onSelectRoad(road.id);
                onSelectJunction(null);
              }}
            />
          ))}

          {/* Road Segment Traffic Overlays (colored lines) */}
          {roads.map((road) => (
            <line
              key={`overlay-${road.id}`}
              x1={road.x1}
              y1={road.y1}
              x2={road.x2}
              y2={road.y2}
              className={`road-overlay ${selectedRoadId === road.id ? 'selected' : ''}`}
              stroke={getCongestionColor(road.congestionLevel)}
              strokeWidth="6"
              strokeLinecap="round"
              onClick={() => {
                onSelectRoad(road.id);
                onSelectJunction(null);
              }}
            />
          ))}

          {/* Road Vehicular Dash Animation */}
          {roads.map((road) => {
            const isSelected = selectedRoadId === road.id;
            return (
              <line
                key={`flow-${road.id}`}
                x1={road.x1}
                y1={road.y1}
                x2={road.x2}
                y2={road.y2}
                className="road-flow-dashes"
                stroke={isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.45)'}
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{
                  animationDuration: getAnimationDuration(road.currentSpeed),
                  animationPlayState: road.currentSpeed === 0 ? 'paused' : 'running',
                }}
                onClick={() => {
                  onSelectRoad(road.id);
                  onSelectJunction(null);
                }}
              />
            );
          })}

          {/* Render Active Incident Markers on Road Midpoints */}
          {roads.map((road) => {
            if (!road.incidentActive) return null;
            const incident = incidents.find((inc) => inc.roadId === road.id);
            if (!incident) return null;
            
            // Midpoint coordinates
            const midX = (road.x1 + road.x2) / 2;
            const midY = (road.y1 + road.y2) / 2;

            return (
              <g key={`incident-marker-${road.id}`} transform={`translate(${midX - 10}, ${midY - 10})`} className="map-incident-marker">
                <circle cx="10" cy="10" r="11" className={`incident-glow-ring ${incident.severity}`} />
                <foreignObject x="2" y="2" width="16" height="16">
                  <div className="incident-icon-wrapper">
                    {getIncidentIcon(incident.type)}
                  </div>
                </foreignObject>
              </g>
            );
          })}

          {/* Junction Nodes */}
          {junctions.map((junction) => {
            const isSelected = selectedJunctionId === junction.id;
            const lightColor = 
              junction.lightStatus === 'green' ? 'var(--traffic-clear)' :
              junction.lightStatus === 'yellow' ? 'var(--traffic-moderate)' : 
              'var(--traffic-gridlock)';

            return (
              <g
                key={`junction-${junction.id}`}
                className={`junction-node ${isSelected ? 'selected' : ''}`}
                transform={`translate(${junction.x}, ${junction.y})`}
                onClick={() => {
                  onSelectJunction(junction.id);
                  onSelectRoad(null);
                }}
              >
                {/* Selected Halo */}
                {isSelected && (
                  <circle cx="0" cy="0" r="16" className="selection-ring" />
                )}
                {/* Node Outer Circle */}
                <circle cx="0" cy="0" r="10" className="node-outer" />
                {/* Node Inner traffic light indicator */}
                <circle cx="0" cy="0" r="5" fill={lightColor} className="node-light" />
                {/* Label above node */}
                <text y="-14" className="node-label" textAnchor="middle">
                  {junction.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating HUD Panels */}
      {selectedRoad && (
        <div className="hud-panel card-panel">
          <div className="hud-header">
            <h3>ROAD SENSOR DATA</h3>
            <button className="close-btn" onClick={() => onSelectRoad(null)}>×</button>
          </div>
          <div className="hud-content">
            <div className="hud-field">
              <span className="label">SEGMENT ID:</span>
              <span className="value font-mono text-cyan">{selectedRoad.id.toUpperCase()}</span>
            </div>
            <div className="hud-field">
              <span className="label">NAME:</span>
              <span className="value">{selectedRoad.name}</span>
            </div>
            <div className="hud-field">
              <span className="label">AVG SPEED:</span>
              <span className={`value font-mono speed-${selectedRoad.congestionLevel}`}>
                {selectedRoad.currentSpeed} MPH / {selectedRoad.speedLimit} MPH
              </span>
            </div>
            <div className="hud-field">
              <span className="label">VOL/CAPACITY:</span>
              <span className="value font-mono">{selectedRoad.volume} veh/hr</span>
            </div>
            <div className="hud-field">
              <span className="label">CONGESTION:</span>
              <span className={`badge ${selectedRoad.congestionLevel}`}>
                {selectedRoad.congestionLevel.toUpperCase()}
              </span>
            </div>
            {selectedRoad.incidentActive && (
              <div className="hud-incident-details">
                <span className="warning-text">
                  ⚠️ {incidents.find((inc) => inc.roadId === selectedRoad.id)?.description || 'Active Incident'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedJunction && (
        <div className="hud-panel card-panel">
          <div className="hud-header">
            <h3>JUNCTION INFRASTRUCTURE</h3>
            <button className="close-btn" onClick={() => onSelectJunction(null)}>×</button>
          </div>
          <div className="hud-content">
            <div className="hud-field">
              <span className="label">JUNCTION NODE:</span>
              <span className="value font-mono text-cyan">{selectedJunction.id}</span>
            </div>
            <div className="hud-field">
              <span className="label">LOCATION:</span>
              <span className="value">{selectedJunction.name}</span>
            </div>
            <div className="hud-field">
              <span className="label">SIGNAL CONTROL:</span>
              <span className={`value font-mono signal-${selectedJunction.lightStatus}`}>
                {selectedJunction.lightStatus.toUpperCase()} PHASE
              </span>
            </div>
            <div className="hud-field">
              <span className="label">QUEUE LENGTH:</span>
              <span className="value font-mono">{selectedJunction.queueLength} vehicles</span>
            </div>
            <div className="hud-field">
              <span className="label">EST. SIM DELAY:</span>
              <span className="value font-mono">{selectedJunction.predictedDelay} sec</span>
            </div>
            <div className="hud-infra-status">
              <span className="label">AI SIGNAL ADAPTATION:</span>
              <span className="value text-purple font-mono pulse-purple">ACTIVE</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
