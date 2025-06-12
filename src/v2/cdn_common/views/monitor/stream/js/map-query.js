/** 构造请求数据
 * @description: 
 * @param {*} form
 * @param {*} query
 * @return {*}
 */
function buildQueryString(form, query) {
    return {
        // port: form.port,
        param: `query=${query}`,
        path: '/api/v1/query'
    }
}

/**
 * @description: 百分比保留两位小数
 * @param {*} value
 */
function computedPercent(value) {
    return +value
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

export const origin = {
    title: '访问用户区域分布',
    unit: '次',
    queryObj: (form) => {
        const time = Math.round(form.end - form.start)
        const port = getPort(form.port, 'port', `|${form.area}::`)
        const QUERY = encodeURIComponent(`sum(ceil(increase(nginx_sts_filter_connects_total{direction!="total",filter=~"${form.area}::${port}"}[${time}s]))) by (filter,filter_name)`)
        return buildQueryString(form, QUERY)
    },

    // 计算数据
    computedValue: computedPercent,
    requestTypeItem: (metric) => '访问次数',
    requestType: ['访问次数']

}
