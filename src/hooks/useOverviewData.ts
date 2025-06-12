import { useState, useEffect, useRef } from 'react';
import { EsQueryParams, buildFilebeatAccessQuery, EsFilebeatURI } from '@/utils/esQuery';
import esMetricsParser, { MetricDataItem } from '@/utils/esMetricsParser';
import { queryElastic } from '@/services/api';
import { metricOptions, QueryParams, MetricGroup, TimeRangeOptions } from '@/types/overview';



const timeOptions: TimeRangeOptions = {
    '1h': { label: '近1小时', key: '1h', seconds: 3600, step: '1m' },
    '24h': { label: '近24小时', key: '24h', seconds: 3600 * 24, step: '5m' },
    '7d': { label: '近7天', key: '7d', seconds: 3600 * 24 * 7, step: '1h' },
    // '30d': { label: '近30天', key: '30d', seconds: 3600 * 24 * 30, step: '1d' }
};

export const useOverviewData = () => {
    const [loading, setLoading] = useState(false);
    const [domains, setDomains] = useState<string[]>([]);
    const [query, setQuery] = useState<QueryParams>({
        timeValue: 3600,
        gte: '1h',
        step: '1m',
        domains: [],
        area: 'china',
        type: 'flow'
    });
    const [metricGroup, setMetricGroup] = useState<MetricGroup>({
        bandwidth: { label: '计费带宽', num: '0.00', unit: 'bps', time: '~' },
        flow: { label: '总流量', num: '0.00', unit: 'B', time: '~' },
        request: { label: '总请求数', num: '0', unit: '次', time: '~' }
    });
    const [currentMetricData, setCurrentMetricData] = useState<MetricDataItem[]>([]);
    const lineChartRef = useRef<any>(null);
    const topTableRef = useRef<any>(null);

    // 获取用户所有域名
    const getUserAllDomains = async () => {
        setLoading(true);
        try {
            // const domainsObj = await esService.getAllDomains();
            const domainsArray: string[] = []; //Object.values(domainsObj);
            setDomains(domainsArray);
            setQuery(prev => ({ ...prev, domains: domainsArray }));
        } catch (error) {
            console.error('获取域名失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 切换时间范围
    const changtTimeOption = (gte: string) => {
        const { step, seconds } = timeOptions[gte];
        setQuery(prev => ({
            ...prev,
            gte,
            step,
            timeValue: seconds
        }));
    };

    // 切换图表类型
    const changeChartType = (type: 'flow' | 'bandwidth' | 'request') => {
        setQuery(prev => ({ ...prev, type }));
    };

    const queryRealtimeMetrics = async () => {
        if (!domains.length) {
            // 渲染空数据
            const { computed } = esMetricsParser[query.type];
            const metricData = computed([], query.step);
            setCurrentMetricData(metricData);
            return;
        }
        setLoading(true);
        try {
            const queryBody = buildFilebeatAccessQuery({
                gte: query.gte,
                lte: query.lte,
                step: query.step,
                domains: query.domains || []
            });
            const response = await queryElastic({
                uri: EsFilebeatURI,
                postData: JSON.stringify(queryBody),
            });
            const buckets = response.buckets || [];

            // 计算所有类型的数据
            const newMetricGroup = { ...metricGroup };
            let currentTypeMetricData: MetricDataItem[] = [];

            Object.keys(metricOptions).forEach(key => {
                const { computed } = esMetricsParser[key as keyof typeof esMetricsParser];
                const metricData = computed(buckets, query.step);

                // 更新总计数据
                if (metricData[0]?.total) {
                    const { val, unit } = metricData[0].total;
                    newMetricGroup[key as keyof MetricGroup].num = val;
                    newMetricGroup[key as keyof MetricGroup].unit = unit;
                }

                // 如果是当前选中的类型，保存图表数据
                if (key === query.type) {
                    currentTypeMetricData = metricData;
                }
            });

            setMetricGroup(newMetricGroup);
            setCurrentMetricData(currentTypeMetricData);

        } catch (error) {
            console.error('查询数据失败:', error);
        } finally {
            setLoading(false);
        }
    }

    // 获取图表数据
    const getChart = () => {
        queryRealtimeMetrics();
        // 同时更新TopTable
        if (topTableRef.current?.getTableData) {
            topTableRef.current.getTableData(query);
        }
    };

    // 初始化
    useEffect(() => {
        getUserAllDomains();
    }, []);

    // 查询参数变化时重新查询
    useEffect(() => {
        if (domains.length > 0) {
            getChart();
        }
    }, [query.gte, query.type, domains]);

    return {
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
    };
};