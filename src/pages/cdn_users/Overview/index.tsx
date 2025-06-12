// src/pages/cdn_users/Overview/index.tsx

import React from 'react';
import { useOverviewData } from '@/hooks/useOverviewData';
import MonitorStats from './MonitorStats';
import { OptionSelector, TimeOptionSelector } from '@/components/common/OptionSelector';
import { metricOptions } from '@/types/overview';
import { RefreshCcw } from 'lucide-react';

const OverviewPage: React.FC = () => {
    const {
        loading,
        query,
        metricGroup,
        currentMetricData,
        timeOptions,
        lineChartRef,
        topTableRef,
        changtTimeOption,
        changeChartType,
        getChart
    } = useOverviewData();


    return (
        <div className="overview-container">
            <div className="display-card vertical">
                <div className="choice-bar flex justify-between">
                    <TimeOptionSelector
                        selectedTime={query.gte}
                        options={timeOptions}
                        loading={loading}
                        onTimeChange={(range) => {
                            console.log('首页时间选择：', range)
                        }}
                    />
                    <span
                        className="refresh-span"
                        onClick={getChart}
                        style={{
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.5 : 1
                        }}
                    >
                        <RefreshCcw size={18}/>
                    </span>
                </div>
                <MonitorStats metricGroup={metricGroup} loading={loading} />
                <div className="choice-bar">
                    <OptionSelector
                        options={metricOptions}
                        value={query.type}
                        loading={loading}
                        onChange={(changeChartType) => {
                            console.log('显示图表选择：', changeChartType);

                        }}
                    />
                </div>
                <div className="metric-grid">
                    <div className="metric-chart display-box">chart</div>
                    <div className="metric-list display-box">Top10总流量</div>
                </div>
            </div>
            <div className="display-card gap-4 ">
                <div className="display-box flex-1">
                    <div className="display-title">使用统计</div>
                    <div className="">
                        <div>接入域名数</div>
                        <div>转发端口数</div>
                        <div>证书总数</div>
                    </div>
                </div>
                <div className="display-box flex-1">
                    <div className="display-title">套餐流量情况</div>
                </div>
            </div>

            <div className="display-card">
                <div className="display-title">最新公告</div>
            </div>
        </div>
    );
};

export default OverviewPage;