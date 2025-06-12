/** 构造请求数据
 * @description: 
 * @param {*} form
 * @param {*} query
 * @return {*}
 */
function buildQueryString(form, query) {
    return {
        // host: form.host,
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
 * @description: 判断 host 是返回 domain 还是 id
 * @param {*} host
 * @param {*} flag
 * @param {*} tag 转为字符串中间的分隔线
 */
 function getHost(host = [], flag = 'domain', tag = '|') {
    return host.map(item => JSON.parse(item)[flag]).join(tag)
}

export const origin = {
    title: '访问用户区域分布',
    unit: '次',
    queryObj: (form) => {
        const time = Math.round(form.end - form.start)
        const host = getHost(form.host, 'domain', `|${form.area}::`)
        const QUERY = encodeURIComponent(`sum(ceil(increase(nginx_vts_filter_bytes_total{direction="in",filter=~"${form.area}::${host}"}[${time}s]))) by (filter,filter_name)`)
        return buildQueryString(form, QUERY)
    },

    // 计算数据
    computedValue: computedPercent,
    requestTypeItem: (metric) => '访问次数',
    requestType: ['访问次数']

}
