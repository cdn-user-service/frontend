// 导入动态计算流量，带宽
import { flowUnit, bpsUnit } from '@/utils/public'
import { STEP } from '@/utils/unit'

/** 构造请求数据
 * @description: 
 * @param {*} form
 * @param {*} query
 * @return {*}
 */
function buildQueryString(form = {}, query = '') {
    const { host, start, end, step } = form
    return {
        host: host,
        param: `query=${query}&start=${start}&end=${end}&step=${step}`,
        path: '/api/v1/query_range'
    }
}

/**
 * @description: 流量转为 MB 、 KB 、 GB 
 * @param {*} value
 */
function computedFlow(value) {
    return Math.ceil(value / STEP / STEP * 100) / 100
}

/**
 * @description: 百分比保留两位小数
 * @param {*} value
 */
function computedPercent(value) {
    return Math.ceil(value * 100) / 100
}

// 请求方法名称
const QUERY_METHODS = {
    // 流量监控
    in: '流入',
    out: '流出'
    // 负载情况
}

export default {
    flow: {
        title: '流量',
        unit: 'MB',
        queryObj: (form) => {
            const QUERY = encodeURIComponent(`label_replace({__name__=~"dpdk_server_bytes_total",host="${form.host}"}, "metrics_name", "$1", "direction", "(.+)")`)
            return buildQueryString(form, QUERY)
        },

        // 计算数据
        computedValue: (value) => +value,
        // 重新构造数据，动态设置单位
        resetData: (arr = [], max = 0, form = {}) => {
            // 获取单位，获取几次幂
            const { pow, unit } = flowUnit(+max)
            const dataArr = arr.map(item => {
                // 如果数据为空
                // if (item[1] === null) {
                //     return [item[0], null] 
                // }
                return [item[0], Math.ceil((item[1] / Math.pow(STEP, pow)) * 100) / 100]
            })

            return { dataArr, unit }
        },
        requestTypeItem: (metric) => {
            return metric.direction === 'in' ? '流入' : '流出'
        },

        // 构造空数据时的
        requestType: ['流入', '流出']
    },
    nodeload: {
        title: '负载情况',
        unit: '',
        queryObj: (form) => {
            const QUERY = encodeURIComponent(`label_replace({__name__=~"node_load.+",instance="${form.host}:9100"}, "metrics_name", "$1", "__name__", "(.+)")`)
            return buildQueryString(form, QUERY)
        },

        // 计算数据
        computedValue: (value) => +value,

        requestTypeItem: (metric) => {
            return metric.metrics_name.replace('node_load', '') + '分钟'
        },

        requestType: ['1分钟', '5分钟', '15分钟']
    },
    cpu: {
        title: 'CPU使用率',
        unit: '%',
        queryObj: (form) => {
            const QUERY = encodeURIComponent(`(1 - (sum(node_filesystem_free_bytes{instance="${form.host}:9100"}) by (instance))/
            (sum(node_filesystem_size_bytes{instance="${form.host}:9100"}) by (instance)))*100`)
            return buildQueryString(form, QUERY)
        },

        // 计算数据
        computedValue: computedPercent,
        requestTypeItem: (metric) => 'CPU使用率',
        requestType: ['CPU使用率'],
        yAxisMax: 100
    },
    disk: {
        title: '磁盘使用率',
        unit: '%',
        queryObj: (form) => {
            const QUERY = encodeURIComponent(`(1 - (sum(node_filesystem_free_bytes{instance="${form.host}:9100"}) by (instance))/
            (sum(node_filesystem_size_bytes{instance="${form.host}:9100"}) by (instance)))*100`)
            return buildQueryString(form, QUERY)
        },

        // 计算数据
        computedValue: computedPercent,
        requestTypeItem: (metric) => '磁盘使用率',
        requestType: ['磁盘使用率'],
        yAxisMax: 100
    },
    memory: {
        title: '内存使用率',
        unit: '%',
        queryObj: (form) => {
            const QUERY = encodeURIComponent(`(1 - (sum(node_memory_MemAvailable_bytes{instance="${form.host}:9100"}) by (instance))/
            (sum(node_memory_MemTotal_bytes{instance="${form.host}:9100"}) by (instance)))*100`)
            return buildQueryString(form, QUERY)
        },

        // 计算数据
        computedValue: computedPercent,
        requestTypeItem: (metric) => '内存使用率',
        requestType: ['内存使用率'],
        yAxisMax: 100
    },
    diskio: {
        title: '磁盘IO',
        unit: 'KB/s',
        queryObj: (form) => {
            const QUERY = encodeURIComponent(`rate(label_replace({__name__=~"node_disk_written_bytes_total|node_disk_read_bytes_total",
            instance="${form.host}:9100"}, "metrics_name", "$1", "__name__", "(.+)")[1m:15s])`)
            return buildQueryString(form, QUERY)
        },

        // 计算数据
        computedValue: (value) => +value,
        // 重新构造数据，动态设置单位
        resetData: (arr = [], max = 0, form = {}) => {
            // 获取单位，获取几次幂
            const { pow, unit } = flowUnit(+max)
            const dataArr = arr.map(item => {
                return [item[0], Math.ceil((item[1] / Math.pow(STEP, pow)) * 100) / 100]
            })
            return { dataArr, unit: unit + '/s' }
        },
        requestTypeItem: (metric) => {
            return metric.metrics_name === 'node_disk_read_bytes_total' ? '读取字节数' : '写入字节数'
        },
        requestType: ['写入字节数', '读取字节数']
    },
    networkio: {
        title: '网络IO',
        unit: 'KB/s',
        queryObj: (form) => {
            // 缺少设备列表接口
            const device = '.*'
            const QUERY = encodeURIComponent(`sum(rate(label_replace({__name__=~"node_network_receive_bytes_total|node_network_transmit_bytes_total",instance="${form.host}:9100"
            ,device=~"${device}"}, "metrics_name", "$1", "__name__", "(.+)")[1m:15s])) by (metrics_name)`)
            return buildQueryString(form, QUERY)
        },

        // 计算数据
        computedValue: (value) => +value,
        // 重新构造数据，动态设置单位
        resetData: (arr = [], max = 0, form = {}) => {
            // 获取单位，获取几次幂
            // const { pow, unit } = bpsUnit(+max, 1)
            const { pow, unit } = bpsUnit(+max, form.step)
            const dataArr = arr.map(item => {
                // return [item[0], Math.ceil((item[1] / Math.pow(STEP, pow)) * 100) / 100]
                return [item[0], Math.ceil((item[1] / Math.pow(STEP, pow)) * 8 / form.step * 100) / 100]
            })
            return { dataArr, unit }
        },
        requestTypeItem: (metric) => {
            return metric.metrics_name === 'node_network_receive_bytes_total' ? '流入' : '流出'
        },
        requestType: ['流入', '流出']
    }
}
