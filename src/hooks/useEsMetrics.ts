import { useState, useEffect } from 'react';
import { EsQueryParams, buildFilebeatAccessQuery, EsFilebeatURI } from '@/utils/esQuery';
import esMetricsParser, { MetricDataItem } from '@/utils/esMetricsParser';
import { queryElastic } from '@/services/api'

export const useRealtimeMetrics = (val: EsQueryParams) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Record<string, MetricDataItem[]>>({});

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const queryBody = buildFilebeatAccessQuery({
                    gte: val.gte,
                    lte: val.lte,
                    step: val.step,
                    domains: val.domains || []
                });

                const res = await queryElastic({
                    uri: EsFilebeatURI,
                    postData: JSON.stringify(queryBody),
                });
                const buckets = res?.aggregations?.[0]?.buckets || [];

                const result: Record<string, MetricDataItem[]> = {};
                const metricKeys = ['request', 'flow', 'bandwidth'] as const;
                for (const key of metricKeys) {
                    const parser = esMetricsParser[key];
                    result[key] = parser.computed(buckets, val.step);
                }

                setData(result);
            } catch (error) {
                console.error('ES 查询失败:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [val.gte, val.lte, val.step,
    (val.domains || []).join(','),
    (val.uids || []).join(','),
    (val.oids || []).join(',')
    ]);

    return { loading, data };
};