export const metricOptions = {
    flow: '流量',
    bandwidth: '带宽',
    request: '请求数'
}

export type OptionItem = {
    label: string;
    key: string;
};


export type TimeOptionItem = {
    label: string;
    key: string;
    seconds: number;
    step: string;
};

export interface TimeRangeOptions {
    [key: string]: TimeOptionItem;
}

export type TimePickerItem = {
    start: number;
    end: number;
};


export type QueryParams = {
    timeValue: number;
    gte: string;
    lte?: string | null;
    step: string;
    domains?: string[] | null;
    uids?: string[] | null;
    oids?: string[] | null;
    area: string;
    type: 'flow' | 'bandwidth' | 'request';
}

export type MetricGroupItem = {
    label: string;
    num: string;
    unit: string;
    time: string;
}

export interface MetricGroup {
    bandwidth: MetricGroupItem;
    flow: MetricGroupItem;
    request: MetricGroupItem;
}



export type MetricOptionItem = {
    value: string;
    label: string;
    title: string;
    num: number;
    unit: string;
    time: string;
};