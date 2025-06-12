// src/pages/cdn_users/Overview/realtimeMetrics.tsx

import React from 'react';
import { MetricGroup } from '@/types/overview';



interface MonitorStatsProps {
    metricGroup: MetricGroup;
    loading: boolean;
}

const MonitorStats: React.FC<MonitorStatsProps> = ({ metricGroup, loading }) => {
    return (
        <div className="metric-grid justify-between">
            {Object.entries(metricGroup).map(([key, item]) => (
                <div className="metric-item display-box" key={key}>
                    <div className="metric-title">{item.label}</div>
                    <div className="metric-value">
                        <div className="metric-num">{item.num}</div>
                        <div className="metric-unit">{item.unit}</div>
                    </div>
                    <div className="metric-time">
                        {item.time}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default MonitorStats;