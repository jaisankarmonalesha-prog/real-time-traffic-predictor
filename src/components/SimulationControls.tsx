import React from 'react';
import type { SimulationState } from '../types/traffic';
import { Sun, CloudRain, CloudSnow, Clock, Calendar, Sparkles, Shield, RefreshCw } from 'lucide-react';
import './SimulationControls.css';

interface SimulationControlsProps {
  state: SimulationState;
  onChangeState: (updater: (prev: SimulationState) => SimulationState) => void;
  onTriggerPrediction: () => void;
  isPredicting: boolean;
  globalCongestionIndex: number;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  state,
  onChangeState,
  onTriggerPrediction,
  isPredicting,
  globalCongestionIndex,
}) => {
  const setWeather = (weather: 'sunny' | 'rain' | 'snow') => {
    onChangeState((prev) => ({ ...prev, weather }));
  };

  const setTimeOfDay = (timeOfDay: 'morning' | 'midday' | 'evening' | 'night') => {
    onChangeState((prev) => ({ ...prev, timeOfDay }));
  };

  const setEventDensity = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const eventDensity = e.target.value as 'none' | 'sports' | 'concert' | 'holiday';
    onChangeState((prev) => ({ ...prev, eventDensity }));
  };

  const toggleMitigation = (key: 'signalOpt' | 'rerouting' | 'rampMetering') => {
    onChangeState((prev) => ({
      ...prev,
      mitigations: {
        ...prev.mitigations,
        [key]: !prev.mitigations[key],
      },
    }));
  };

  const setForecastHorizon = (forecastHorizon: 'live' | '15m' | '1h' | '4h') => {
    onChangeState((prev) => ({ ...prev, forecastHorizon }));
  };

  const getCongestionColor = (val: number) => {
    if (val < 30) return 'var(--traffic-clear)';
    if (val < 55) return 'var(--traffic-moderate)';
    if (val < 75) return 'var(--traffic-congested)';
    return 'var(--traffic-gridlock)';
  };

  return (
    <aside className="controls-sidebar">
      {/* City Status Card */}
      <div className="status-card card-panel">
        <div className="status-header">
          <div className="status-dot animate-pulse-glow"></div>
          <h2>METROFLOW LIVE INDEX</h2>
        </div>
        <div className="congestion-gauge-container">
          <div 
            className="congestion-fill"
            style={{ 
              width: `${globalCongestionIndex}%`,
              background: getCongestionColor(globalCongestionIndex)
            }}
          />
          <div className="congestion-value font-mono" style={{ color: getCongestionColor(globalCongestionIndex) }}>
            {globalCongestionIndex}%
          </div>
        </div>
        <div className="status-grid">
          <div className="status-item">
            <span className="label">SYSTEM STATUS:</span>
            <span className="val text-cyan font-mono">NOMINAL</span>
          </div>
          <div className="status-item">
            <span className="label">ACTIVE POLICIES:</span>
            <span className="val text-purple font-mono">
              {Object.values(state.mitigations).filter(Boolean).length} / 3
            </span>
          </div>
        </div>
      </div>

      {/* Forecast Horizon Section */}
      <div className="control-section card-panel">
        <h3>FORECAST HORIZON</h3>
        <div className="forecast-selector">
          {(['live', '15m', '1h', '4h'] as const).map((h) => (
            <button
              key={h}
              className={`forecast-btn font-mono ${state.forecastHorizon === h ? 'active' : ''}`}
              onClick={() => setForecastHorizon(h)}
            >
              {h.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Environmental Parameters */}
      <div className="control-section card-panel">
        <h3>ENVIRONMENT VARIABLES</h3>
        
        {/* Weather Selector */}
        <div className="env-sub-group">
          <span className="group-label">WEATHER</span>
          <div className="env-options">
            <button
              className={`env-btn ${state.weather === 'sunny' ? 'active' : ''}`}
              onClick={() => setWeather('sunny')}
              title="Sunny"
            >
              <Sun size={18} />
              <span>SUNNY</span>
            </button>
            <button
              className={`env-btn ${state.weather === 'rain' ? 'active' : ''}`}
              onClick={() => setWeather('rain')}
              title="Rainy"
            >
              <CloudRain size={18} />
              <span>RAIN</span>
            </button>
            <button
              className={`env-btn ${state.weather === 'snow' ? 'active' : ''}`}
              onClick={() => setWeather('snow')}
              title="Snowy"
            >
              <CloudSnow size={18} />
              <span>SNOW</span>
            </button>
          </div>
        </div>

        {/* Time of Day Selector */}
        <div className="env-sub-group">
          <span className="group-label">TIME OF DAY</span>
          <div className="env-options grid-2x2">
            {(['morning', 'midday', 'evening', 'night'] as const).map((t) => (
              <button
                key={t}
                className={`env-btn font-mono ${state.timeOfDay === t ? 'active' : ''}`}
                onClick={() => setTimeOfDay(t)}
              >
                <Clock size={14} style={{ marginRight: '6px' }} />
                <span>{t.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Special Event Selector */}
        <div className="env-sub-group select-group">
          <span className="group-label">CITY EVENT IMPACT</span>
          <div className="select-wrapper">
            <Calendar size={16} className="select-icon" />
            <select value={state.eventDensity} onChange={setEventDensity}>
              <option value="none">STANDARD WORK DAY</option>
              <option value="concert">LOCAL ARENA CONCERT</option>
              <option value="sports">CHAMPIONSHIP SPORTS EVENT</option>
              <option value="holiday">HOLIDAY WEEKEND DEPARTURE</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI Policies Selector */}
      <div className="control-section card-panel">
        <h3>AI MITIGATION POLICIES</h3>
        <p className="section-desc">Activate automation policies to balance traffic flows and reduce delay spikes.</p>
        
        <div className="policy-toggles">
          {/* Signal Optimization */}
          <div 
            className={`policy-card ${state.mitigations.signalOpt ? 'active' : ''}`}
            onClick={() => toggleMitigation('signalOpt')}
          >
            <div className="policy-icon">
              <Sparkles size={18} />
            </div>
            <div className="policy-info">
              <h4>DYNAMIC SIGNAL TIMING</h4>
              <p>Optimizes traffic light phases at major intersections.</p>
            </div>
            <div className="policy-checkbox" />
          </div>

          {/* Rerouting Algorithms */}
          <div 
            className={`policy-card ${state.mitigations.rerouting ? 'active' : ''}`}
            onClick={() => toggleMitigation('rerouting')}
          >
            <div className="policy-icon">
              <RefreshCw size={16} />
            </div>
            <div className="policy-info">
              <h4>PREDICTIVE REROUTING</h4>
              <p>Diverts vehicles to alternate roads before bottlenecks occur.</p>
            </div>
            <div className="policy-checkbox" />
          </div>

          {/* Ramp Metering */}
          <div 
            className={`policy-card ${state.mitigations.rampMetering ? 'active' : ''}`}
            onClick={() => toggleMitigation('rampMetering')}
          >
            <div className="policy-icon">
              <Shield size={16} />
            </div>
            <div className="policy-info">
              <h4>EXPRESSWAY RAMP METERING</h4>
              <p>Regulates highway access rates via smart ramp signaling.</p>
            </div>
            <div className="policy-checkbox" />
          </div>
        </div>
      </div>

      {/* ML Predictor Trigger */}
      <div className="trigger-container">
        <button 
          className={`predict-trigger-btn font-mono ${isPredicting ? 'running' : ''}`}
          onClick={onTriggerPrediction}
          disabled={isPredicting}
        >
          {isPredicting ? (
            <>
              <RefreshCw className="animate-spin spinner" size={18} />
              <span>RUNNING NEURAL MODEL...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>RECALCULATE PREDICTIONS</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
