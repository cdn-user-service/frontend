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
        // host: host,
        host: '*',
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

/**
 * @description: 判断 host 是返回 domain 还是 id
 * @param {*} host
 * @param {*} flag
 * @param {*} tag 转为字符串中间的分隔线
 */
function getHost(host = [], flag = 'domain', tag = '|') {
    return host.map(item => JSON.parse(item)[flag]).join(tag)
}

function getUpstreamHost(host = []) {
    const hostArr = host.map(item => `site_${JSON.parse(item).id}.*`)
    return hostArr.join('|')
}

export const flow = {
    title: '流量趋势',
    unit: 'KB',
    queryObj: (form = {}) => {
        const QUERY = encodeURIComponent(`sum(increase(nginx_vts_server_bytes_total{host=~"${getHost(form.host)}"}[1m])) by (direction)`)
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
        return { dataArr, unit }
    },
    // 构造 图表 legend
    requestTypeItem: (metric) => {
        return metric.direction === 'in' ? '流入' : '流出'
    },
    // 构造空数据时的
    requestType: ['流入', '流出']
}

export const bandwidth = {
    title: '带宽趋势',
    unit: 'Kbps',
    queryObj: (form = {}) => {
        const QUERY = encodeURIComponent(`sum(increase(nginx_vts_server_bytes_total{host=~"${getHost(form.host)}"}[1m])) by (direction)`)
        return buildQueryString(form, QUERY)
    },
    // 计算数据
    computedValue: (value) => +value,
    resetData: (arr = [], max = 0, form = {}) => {
        // 带宽 = 流量（MB）* 8 / 粒度
        // 获取单位，获取几次幂
        const { pow, unit } = bpsUnit(+max, form.step)
        const dataArr = arr.map(item => {
            return [item[0], Math.ceil((item[1] / Math.pow(STEP, pow)) * 8 / form.step * 100) / 100]
        })
        return { dataArr, unit }
    },
    requestTypeItem: (metric) => {
        return metric.direction === 'in' ? '平均流入' : '平均流出'
    },
    // 构造空数据时的
    requestType: ['平均流入', '平均流出']
}

export const request = {
    title: '请求数',
    unit: '次',
    queryObj: (form = {}) => {
        const QUERY = encodeURIComponent(`ceil(sum(increase(nginx_vts_server_requests_total{host=~"${getHost(form.host)}"}[1m])))`)
        return buildQueryString(form, QUERY)
    },

    // 计算数据
    computedValue: (value) => +value,
    requestTypeItem: (metric) => '请求数',
    // 构造空数据时的
    requestType: ['请求数']
}

export const qps = {
    title: 'QPS',
    unit: '次',
    queryObj: (form = {}) => {
        const QUERY = encodeURIComponent(`ceil(sum(increase(nginx_vts_server_requests_total{host=~"${getHost(form.host)}"}[1m])))`)
        return buildQueryString(form, QUERY)
    },

    // 计算数据
    computedValue: (value) => Math.ceil(value / 30),
    requestTypeItem: (metric) => 'QPS',
    // 构造空数据时的
    requestType: ['QPS']
}

export const code = {
    title: '状态码趋势',
    unit: '次',
    queryObj: (form = {}) => {
        const QUERY = encodeURIComponent(`ceil(sum(increase(nginx_vts_server_requests_total{host=~"${getHost(form.host)}"}[1m])) by (code))`)
        return buildQueryString(form, QUERY)
    },

    // 计算数据
    computedValue: (value) => +value,
    requestTypeItem: (metric) => {
        return metric.code
    },
    // 构造空数据时的
    requestType: ['1xx', '2xx', '3xx', '4xx', '5xx']
}

export const cachehits = {
    title: '请求命中率',
    unit: '%',
    queryObj: (form = {}) => {
        const QUERY = encodeURIComponent(`sum(nginx_vts_server_cache_total{status="hit",host=~"${getHost(form.host)}"}) / sum(nginx_vts_server_cache_total{host=~"${getHost(form.host)}"})`)
        return buildQueryString(form, QUERY)
    },
    // 计算数据
    computedValue: (value) => {
        let nowValue = value
        // 当总数也为 0 的时候 就会出现 NaN，这时将当前值设为上一个时间点的值
        if (nowValue == 'NaN') {
            nowValue = 0
        }

        return Math.ceil(nowValue * 100 * 100) / 100
    },
    // 重新构造数据，当数据为 0时(点位丢了或者为NaN)，重置为上一个点
    resetData: (arr = [], max = 0, form = {}) => {
        console.log(arr)
        // 上一个时间点的值
        let prevValue = 0
        const dataArr = arr.map(item => {
            let nowValue = item[1]
            // 如果值为 0，则设置为上一点的值
            if (nowValue == 0) {
                nowValue = prevValue
            }
            // 重置上一个点的值
            prevValue = nowValue
            return [item[0], nowValue]
        })
        return { dataArr, unit: '%' }
    },
    requestTypeItem: (metric) => '请求命中率',
    // 构造空数据时的
    requestType: ['请求命中率'],
    // 最大值
    yAxisMax: 100
}

/** ================================
 *  回源监控  host = 需要域名 ID
 *  ================================
 */
export const upstreamcode = {
    title: '回源状态码趋势',
    unit: '次',
    queryObj: (form = {}) => {
        const hostStr = getUpstreamHost(form.host)
        const QUERY = encodeURIComponent(`ceil(sum(increase(nginx_vts_upstream_requests_total{upstream=~"${hostStr}"}[1m])) by (code))`)
        return buildQueryString(form, QUERY)
    },

    // 计算数据
    computedValue: (value) => +value,
    requestTypeItem: (metric) => {
        return '回源' + metric.code
    },
    // 构造空数据时的
    requestType: ['回源1xx', '回源2xx', '回源3xx', '回源4xx', '回源5xx']
}

export const upstreamBandwidth = {
    title: '回源带宽',
    unit: 'Kbps',
    queryObj: (form = {}) => {
        const hostStr = getUpstreamHost(form.host)
        const QUERY = encodeURIComponent(`sum(increase(nginx_vts_upstream_bytes_total{upstream=~"${hostStr}"}[1m])) by (direction)`)
        return buildQueryString(form, QUERY)
    },
    // 计算数据
    computedValue: (value) => +value,
    resetData: (arr = [], max = 0, form = {}) => {
        // 带宽 = 流量（MB）* 8 / 粒度
        // 获取单位，获取几次幂
        const { pow, unit } = bpsUnit(+max, form.step)
        const dataArr = arr.map(item => {
            return [item[0], Math.ceil((item[1] / Math.pow(STEP, pow)) * 8 / form.step * 100) / 100]
        })
        return { dataArr, unit }
    },
    requestTypeItem: (metric) => {
        return metric.direction === 'in' ? '平均流入' : '平均流出'
    },
    // 构造空数据时的
    requestType: ['平均流入', '平均流出']
}

export const upstreamFlow = {
    title: '回源流量',
    unit: 'KB',
    queryObj: (form = {}) => {
        const hostStr = getUpstreamHost(form.host)
        const QUERY = encodeURIComponent(`sum(increase(nginx_vts_upstream_bytes_total{upstream=~"${hostStr}"}[1m])) by (direction)`)
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
        return { dataArr, unit }
    },
    requestTypeItem: (metric) => {
        return metric.direction === 'in' ? '流入' : '流出'
    },

    // 构造空数据时的
    requestType: ['流入', '流出']
}

export const upstreamTime = {
    title: '回源耗时',
    unit: '毫秒',
    queryObj: (form = {}) => {
        const hostStr = getUpstreamHost(form.host)
        const QUERY = encodeURIComponent(`sum(increase(nginx_vts_upstream_request_seconds_total{upstream=~"${hostStr}"}[1m]) * 2)`)
        return buildQueryString(form, QUERY)
    },

    // 计算数据
    computedValue: (value) => Math.ceil(value),
    requestTypeItem: (metric) => '回源耗时',

    // 构造空数据时的
    requestType: ['回源耗时']
}
