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
    const { port, start, end, step } = form
    return {
        port: '*',
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
 * @description: 判断 端口 是返回 port 还是 id, 或者 IP
 * @param {*} port
 * @param {*} flag
 * @param {*} tag 转为字符串中间的分隔线
 */
function getPort(port = [], flag = 'port', tag = '|') {
    return port.map(item => JSON.parse(item)[flag]).join(tag)
}

export const flow = {
    title: '流量趋势',
    unit: 'KB',
    queryObj: (form = {}) => {
        const QUERY = encodeURIComponent(`sum(increase(nginx_sts_server_bytes_total{port=~"${getPort(form.port)}"}[1m])) by (direction)`)
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
        const QUERY = encodeURIComponent(`sum(increase(nginx_sts_server_bytes_total{port=~"${getPort(form.port)}"}[1m])) by (direction)`)
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
        const QUERY = encodeURIComponent(`ceil(sum(increase(nginx_sts_server_connects_total{port=~"${getPort(form.port)}"}[1m])) without (code,instance,listen,protocol))`)
        return buildQueryString(form, QUERY)
    },

    // 计算数据
    computedValue: (value) => +value,
    requestTypeItem: (metric) => '请求数',
    // 构造空数据时的
    requestType: ['请求数']
}

export const code = {
    title: '状态码趋势',
    unit: '次',
    queryObj: (form = {}) => {
        const QUERY = encodeURIComponent(`ceil(sum(increase(nginx_sts_server_connects_total{code!="total",port=~"${getPort(form.port)}"}[1m])) by (code))`)
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
