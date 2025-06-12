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

export const code = {
    title: '状态码占比详情',
    unit: '%',
    queryObj: (form = {}) => {
        const time = Math.round(form.end - form.start)
        const QUERY = encodeURIComponent(`ceil(sum(increase(nginx_vts_server_requests_total{host=~"${getHost(form.host)}"}[${time}s])) by (code))`)
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

export const upstreamcode = {
    title: '回源状态码占比详情',
    unit: '%',
    queryObj: (form = {}) => {
        const time = Math.round(form.end - form.start)
        const hostStr = getUpstreamHost(form.host)
        const QUERY = encodeURIComponent(`ceil(sum(increase(nginx_vts_upstream_requests_total{upstream=~"${hostStr}"}[${time}s])) by (code))`)
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

export const ispCode = {
    title: '运营商分布',
    unit: '次',
    queryObj: (form = {}) => {
        const time = Math.round(form.end - form.start)
        const host = getHost(form.host, 'domain', '|isp::')
        const QUERY = encodeURIComponent(`ceil(sum(increase(nginx_vts_filter_${form.type}_total{filter=~"isp::${host}"}[${time}s])) by (filter_name))`)
        return buildQueryString(form, QUERY)
    },
    // 初始数据
    initData: () => {
        /**
         * 中国移动 = Mobile -> China Mobile
         * 中国联通 = Unicom -> China Unicom
         * 中国电信 = Telecom -> China Telecom
         * 中国铁通 = TieTong -> China TieTong
         * 其他 = Other -> Other
         */
        return [
            { value: 0, name: '中国移动' },
            { value: 0, name: '中国联通' },
            { value: 0, name: '中国电信' },
            { value: 0, name: '中国铁通' },
            { value: 0, name: '其他' }
          ]
    },
    // 构造数据
    buildData: (result = []) => {
        const arr = [
            { value: 0, name: '中国移动', key: 'Mobile' },
            { value: 0, name: '中国联通', key: 'Unicom' },
            { value: 0, name: '中国电信', key: 'Telecom' },
            { value: 0, name: '中国铁通', key: 'TieTong' }
        ]
        // 总数
        let total = 0
        // 中国运营商总数
        let totalChina = 0

        result.forEach(item => {
            total += +item.value[1]
            arr.forEach(item2 => {
                if (item.metric.filter_name.indexOf(`China ${item2.key}`) != -1) {
                    item2.value += +item.value[1]
                    totalChina += +item.value[1]
                }
            })
        })
        // 追加其他isp
        arr.push({
            name: '其他',
            key: 'Other',
            value: total - totalChina
        })

        // 对数据进行排序
        arr.sort((a, b) => {
            return b.value - a.value
        })

        return { arr, total }
    },
    formatter: '{a} <br/>{b} : {d}%'
}
