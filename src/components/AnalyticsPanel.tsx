import React from 'react';
import type { Junction, RoadSegment } from '../types/traffic';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, BarChart3, PieChart, ShieldAlert } from 'lucide-react';
import './AnalyticsPanel.css';

interface AnalyticsPanelProps {
  junctions: Junction[];
  roads: RoadSegment[];
  congestionHistory: Array<{ time: string; actual: number; predicted: number }>;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  junctions,
  roads,
  congestionHistory,
}) => {
  // Calculate road speed status distribution
  const statusCounts = roads.reduce(
    (acc, road) => {
      acc[road.congestionLevel] = (acc[road.congestionLevel] || 0) + 1;
      return acc;
    },
    { clear: 0, moderate: 0, congested: 0, gridlock: 0 } as Record<string, number>
  );

  const totalRoads = roads.length || 1;
  const distributionData = [
    { name: 'Clear', value: statusCounts.clear, pct: Math.round((statusCounts.clear / totalRoads) * 100), color: 'var(--traffic-clear)' },
    { name: 'Moderate', value: statusCounts.moderate, pct: Math.round((statusCounts.moderate / totalRoads) * 100), color: 'var(--traffic-moderate)' },
    { name: 'Congested', value: statusCounts.congested, pct: Math.round((statusCounts.congested / totalRoads) * 100), color: 'var(--traffic-congested)' },
    { name: 'Gridlock', value: statusCounts.gridlock, pct: Math.round((statusCounts.gridlock / totalRoads) * 100), color: 'var(--traffic-gridlock)' },
  ];

  // Junction Queue Data
  const queueData = junctions.map((j) => ({
    name: j.id,
    Queue: j.queueLength,
    Delay: j.predictedDelay,
  }));

  // Custom Chart Tooltip styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label font-mono">{label}</p>
          {payload.map((p: any, idx: number) => (
            <p key={idx} className="tooltip-value font-mono" style={{ color: p.color }}>
              {p.name.toUpperCase()}: {p.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomQueueTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label font-mono">NODE {label}</p>
          <p className="tooltip-value font-mono" style={{ color: 'var(--cyan)' }}>
            QUEUE: {payload[0]?.value} vehicles
          </p>
          <p className="tooltip-value font-mono" style={{ color: 'var(--purple)' }}>
            DELAY: {payload[1]?.value}s
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <aside className="analytics-sidebar">
      {/* 1. Global Congestion Trend */}
      <div className="analytics-section card-panel">
        <div className="section-title">
          <TrendingUp size={16} className="title-icon text-cyan" />
          <h3>CONGESTION TREND FORECAST</h3>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={congestionHistory} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={24} iconSize={8} wrapperStyle={{ fontSize: '10px', fontFamily: 'var(--font-mono)' }} />
              <Line
                name="AI Optimized"
                type="monotone"
                dataKey="actual"
                stroke="var(--cyan)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                name="Predictive Baseline"
                type="monotone"
                dataKey="predicted"
                stroke="var(--purple)"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Junction delays */}
      <div className="analytics-section card-panel">
        <div className="section-title">
          <BarChart3 size={16} className="title-icon text-purple" />
          <h3>INTERSECTION BACKLOGS</h3>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={queueData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomQueueTooltip />} />
              <Legend verticalAlign="top" height={24} iconSize={8} wrapperStyle={{ fontSize: '10px', fontFamily: 'var(--font-mono)' }} />
              <Bar name="Queue Size" dataKey="Queue" fill="var(--cyan)" opacity={0.8} radius={[2, 2, 0, 0]} />
              <Bar name="Est. Delay" dataKey="Delay" fill="var(--purple)" opacity={0.8} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Traffic Distribution Panel */}
      <div className="analytics-section card-panel">
        <div className="section-title">
          <PieChart size={16} className="title-icon text-cyan" />
          <h3>ROAD STATE DISTRIBUTION</h3>
        </div>
        <div className="distribution-list">
          {distributionData.map((d) => (
            <div key={d.name} className="dist-item">
              <div className="dist-meta">
                <span className="dist-color-dot" style={{ backgroundColor: d.color }} />
                <span className="dist-name">{d.name.toUpperCase()}</span>
              </div>
              <div className="dist-stats font-mono">
                <span className="dist-value">{d.value} segments</span>
                <span className="dist-pct" style={{ color: d.color }}>{d.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Infrastructure Health Stats */}
      <div className="analytics-section card-panel system-health-section">
        <div className="section-title">
          <ShieldAlert size={16} className="title-icon text-purple" />
          <h3>CARBON & GREEN WAVE METRICS</h3>
        </div>
        <div className="metrics-grid font-mono">
          <div className="metric-box">
            <span className="metric-label">SIGNAL SYNC RATE</span>
            <span className="metric-value text-cyan">92.4%</span>
            <span className="metric-sub text-clear">▲ +8.2% AI SYNC</span>
          </div>
          <div className="metric-box">
            <span className="metric-label">IDLE EMISSIONS</span>
            <span className="metric-value text-purple">-18.5%</span>
            <span className="metric-sub text-clear">▼ REDUCED DELAY</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
