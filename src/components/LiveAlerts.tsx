import React from 'react';
import type { TrafficIncident } from '../types/traffic';
import { ShieldAlert, Info, Hammer, Car, Play, Settings2 } from 'lucide-react';
import './LiveAlerts.css';

export interface AlertLog {
  id: string;
  text: string;
  time: string;
  type: 'info' | 'warning' | 'policy' | 'actionable';
  actionLabel?: string;
  actionType?: 'reroute' | 'dispatch' | 'signal';
  actionTargetId?: string;
}

interface LiveAlertsProps {
  incidents: TrafficIncident[];
  alerts: AlertLog[];
  onExecuteAlertAction: (alertId: string, actionType: string, targetId?: string) => void;
  onClearIncident: (incidentId: string) => void;
}

export const LiveAlerts: React.FC<LiveAlertsProps> = ({
  incidents,
  alerts,
  onExecuteAlertAction,
  onClearIncident,
}) => {
  const getLogIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <ShieldAlert size={14} className="alert-type-icon text-gridlock" />;
      case 'policy':
        return <Settings2 size={14} className="alert-type-icon text-purple" />;
      case 'actionable':
        return <Settings2 size={14} className="alert-type-icon text-cyan" />;
      default:
        return <Info size={14} className="alert-type-icon text-muted" />;
    }
  };

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'accident':
        return <Car size={14} />;
      case 'construction':
        return <Hammer size={14} />;
      default:
        return <ShieldAlert size={14} />;
    }
  };

  return (
    <div className="live-alerts-container">
      {/* AI Recommendations & Logs (Left Pane) */}
      <div className="alerts-ticker-pane">
        <div className="pane-header">
          <span className="ticker-label glow-cyan">AI RECOMMENDATIONS & SYSTEMLOGS</span>
          <span className="pulse-dot text-cyan">● LIVE</span>
        </div>
        <div className="logs-scroller">
          {alerts.length === 0 ? (
            <div className="no-logs">System telemetry nominal. Scanning road grid...</div>
          ) : (
            alerts.map((log) => (
              <div key={log.id} className={`log-line type-${log.type}`}>
                <span className="log-time font-mono">{log.time}</span>
                {getLogIcon(log.type)}
                <span className="log-text">{log.text}</span>
                {log.type === 'actionable' && log.actionLabel && (
                  <button
                    className="log-action-btn font-mono"
                    onClick={() => onExecuteAlertAction(log.id, log.actionType || '', log.actionTargetId)}
                  >
                    <Play size={10} style={{ marginRight: '3px' }} />
                    {log.actionLabel.toUpperCase()}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Active Incidents (Right Pane) */}
      <div className="incidents-control-pane">
        <div className="pane-header">
          <span className="ticker-label text-gridlock glow-red">ACTIVE INCIDENTS CONTROL</span>
          <span className="incident-count font-mono">{incidents.length} IN PROGRESS</span>
        </div>
        <div className="incidents-list">
          {incidents.length === 0 ? (
            <div className="no-incidents font-mono">NO INCIDENTS REPORTED</div>
          ) : (
            incidents.map((inc) => (
              <div key={inc.id} className={`incident-card-mini severity-${inc.severity}`}>
                <div className="incident-meta">
                  <span className={`incident-badge-icon type-${inc.type}`}>
                    {getIncidentIcon(inc.type)}
                  </span>
                  <div className="incident-info-text">
                    <div className="inc-title font-mono">{inc.roadName}</div>
                    <div className="inc-desc">{inc.description}</div>
                  </div>
                </div>
                <button 
                  className="clear-incident-btn font-mono"
                  onClick={() => onClearIncident(inc.id)}
                >
                  RESOLVE
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
