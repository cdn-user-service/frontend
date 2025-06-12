import { numUnit, diskUnit, bpsUnit, STEP_MAP } from '@/utils/unit';

// 类型定义
export interface BucketItem {
  key: number | string;
  request_count?: { value: number };
  bucket_in_byte?: { value: number };
  bucket_out_byte?: { value: number };
}

export type DataPoint = [number, number, string];

export interface MetricDataItem {
  name: string;
  data: Array<[number, number]>;
  total?: {
    val: string;
    unit: string;
  };
}

export interface MetricDefinition {
  title: string;
  aggs: Record<string, any>;
  yAxisMax?: number | null;
  computed: (data: BucketItem[], step?: string) => MetricDataItem[];
  yAxisLabel: (value: number) => string;
}

const emptyData: DataPoint[] = [[Date.now(), 0, '0']];


export const flow: MetricDefinition = {
  title: '流量趋势',
  aggs: {},
  yAxisMax: null,
  computed: (buckets: BucketItem[] = [], step: string = '30s'): MetricDataItem[] => {
    let totalIn = 0;
    let totalOut = 0;
    const dataIn: Array<[number, number]> = [];
    const dataOut: Array<[number, number]> = [];

    buckets.forEach(bucket => {
      const key = typeof bucket.key === 'string' ? new Date(bucket.key).getTime() : bucket.key;
      const flowIn = bucket.bucket_in_byte?.value ?? 0;
      const flowOut = bucket.bucket_out_byte?.value ?? 0;

      totalIn += flowIn;
      totalOut += flowOut;

      dataIn.push([key, flowIn]);
      dataOut.push([key, flowOut]);
    });
    const totalFlow = totalIn + totalOut;
    const { val, unit } = diskUnit(totalFlow);

    return [
      {
        name: '流入',
        data: dataIn,
        total: { val, unit },
      },
      {
        name: '流出',
        data: dataOut
      },
    ];
  },
  yAxisLabel: value => {
    const { val, unit } = diskUnit(value);
    return `${val}${unit}`;
  },
};

export const bandwidth: MetricDefinition = {
  title: '带宽趋势',
  aggs: {},
  computed: (buckets: BucketItem[] = [], step: string = '30s'): MetricDataItem[] => {
    const stepSeconds = STEP_MAP[step] ?? 30;
    let peakBandwidth = 0;
    const dataIn: Array<[number, number]> = [];
    const dataOut: Array<[number, number]> = [];

    buckets.forEach(bucket => {
      const key = typeof bucket.key === 'string' ? new Date(bucket.key).getTime() : bucket.key;
      // 带宽 = 流量 * 8 / 时间间隔
      const bandwidthIn = ((bucket.bucket_in_byte?.value ?? 0) * 8) / stepSeconds;
      const bandwidthOut = ((bucket.bucket_out_byte?.value ?? 0) * 8) / stepSeconds;

      peakBandwidth = Math.max(peakBandwidth, bandwidthOut);

      dataIn.push([key, bandwidthIn]);
      dataOut.push([key, bandwidthOut]);
    });

    const { val, unit } = bpsUnit(peakBandwidth);

    return [
      {
        name: '平均流入',
        data: dataIn,
        total: { val, unit },
      },
      {
        name: '平均流出',
        data: dataOut
      },
    ];
  },
  yAxisLabel: value => {
    const { val, unit } = bpsUnit(value);
    return `${val}${unit}`;
  },
};

export const request: MetricDefinition = {
  title: '请求数',
  aggs: {},
  yAxisMax: null,
  computed: (buckets: BucketItem[] = [], step: string = '30s'): MetricDataItem[] => {
    let totalRequests = 0;
    const data: Array<[number, number]> = [];
    buckets.forEach(bucket => {
      const key = typeof bucket.key === 'string' ? new Date(bucket.key).getTime() : bucket.key;
      const requestCount = bucket.request_count?.value ?? 0;
      totalRequests += requestCount;
      data.push([key, requestCount]);
    });

    return [
      {
        name: '请求数',
        data,
        total: {
          val: `${totalRequests}`,
          unit: '次',
        },
      },
    ];
  },
  yAxisLabel: value => numUnit(value).label,
};


const esMetricsParser = { flow, bandwidth, request };
export default esMetricsParser;
