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

export const code = {
    title: '状态码占比详情',
    unit: '%',
    queryObj: (form = {}) => {
        console.log(form)
        const time = Math.round(form.end - form.start)
        const QUERY = encodeURIComponent(`ceil(sum(increase(nginx_sts_server_connects_total{code!="total",port=~"${getPort(form.port)}"}[${time}s])) by (code))`)
        return buildQueryString(form, QUERY)
    },
    // 初始数据
    initData: () => {
        return [
            { value: 0, name: '1xx' },
            { value: 0, name: '2xx' },
            { value: 0, name: '3xx' },
            { value: 0, name: '4xx' },
            { value: 0, name: '5xx' }
          ]
    },
    // 构造数据
    buildData: (result = []) => {
        let total = 0
        const arr = result.map((item, idx) => {
            total += +item.value[1]
            return {
                name: item.metric.code,
                value: item.value[1]
            }
        })

        // 对数据进行排序
        arr.sort((a, b) => {
            return b.value - a.value
        })
        return { arr, total }
    },
    formatter: '{a} <br/>{b} : {c}次 ({d}%)'
}
