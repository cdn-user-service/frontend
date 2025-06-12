
// 导入动态计算流量，可用动态计算内存和磁盘
import { flowUnit } from '@/utils/public'
import { STEP } from '@/utils/unit'

/** 构造请求数据
 * @description: 
 * @param {*} form
 * @param {*} query
 * @return {*}
 */
function buildQueryString(form, query) {
    return {
        host: form.host,
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

const formatter = params => {
    const { value, name, total, unit, tag } = params.data
    const { marker, color, percent } = params
    const res = '<li><div class="format_name">' +
        `${marker}总${tag}` +
        '</div>' +
        `<strong style="color:${color}">` +
        `${total} ${unit}` +
        '</strong></li>' +
        '<li><div class="format_name">' +
        `${marker}${name}` +
        `（${percent}%）</div>` +
        `<strong style="color:${color}">` +
        `${value} ${unit}` +
        '</strong></li>'

    return '<ul class="ants-format_box">' +
        `<li>${params.seriesName}</li>` +
        res +
        '</ul>'
}

export default {
    disk: {
        title: '磁盘使用情况',
        unit: '%',
        queryObj: (form) => {
            const QUERY = encodeURIComponent(`sum(label_replace({__name__=~"node_filesystem_size_bytes|node_filesystem_free_bytes",
            instance="${form.host}:9100"}, "metrics_name", "$1", "__name__", "(.+)")) by (metrics_name)`)
            return buildQueryString(form, QUERY)
        },
        // 初始数据
        initData: () => {
            return [
                { value: 0, name: '已使用', total: 1, unit: 'GB', tag: '磁盘' },
                { value: 1, name: '未使用', total: 1, unit: 'GB', tag: '磁盘' }
            ]
        },
        // 构造数据
        buildData: (result = []) => {
            let total = 0
            let free = 0
            result.forEach((item, idx) => {
                if (item.metric.metrics_name.match(/Total|size/)) {
                    total = item.value[1]
                } else {
                    free = item.value[1]
                }
            })
            // 获取单位，获取几次幂
            const { value, pow, unit } = flowUnit(+total)
            const arr = [
                { value: 0, name: '已使用', total: value, unit, tag: '磁盘' },
                { value: 1, name: '未使用', total: value, unit, tag: '磁盘' }
            ]
            // 未使用动态计算单位
            const free1 = Math.ceil((free / Math.pow(STEP, pow)) * 100) / 100
            arr[0].value = (value - free1).toFixed(2)
            arr[1].value = free1

            return { arr, total }
        },
        formatter
    },
    memory: {
        title: '内存使用情况',
        unit: '%',
        queryObj: (form) => {
            const QUERY = encodeURIComponent(`label_replace({__name__=~"node_memory_MemTotal_bytes|node_memory_MemAvailable_bytes",
            instance="${form.host}:9100"}, "metrics_name", "$1", "__name__", "(.+)")`)
            return buildQueryString(form, QUERY)
        },
        // 初始数据
        initData: () => {
            return [
                { value: 0, name: '已使用', total: 1, unit: 'GB', tag: '内存' },
                { value: 1, name: '未使用', total: 1, unit: 'GB', tag: '内存' }
            ]
        },
        // 构造数据
        buildData: (result = []) => {
            let total = 0
            let free = 0
            result.forEach((item, idx) => {
                if (item.metric.metrics_name.match(/Total|size/)) {
                    total = item.value[1]
                } else {
                    free = item.value[1]
                }
            })
            // 获取单位，获取几次幂
            const { value, pow, unit } = flowUnit(+total)
            const arr = [
                { value: 0, name: '已使用', total: value, unit, tag: '内存' },
                { value: 1, name: '未使用', total: value, unit, tag: '内存' }
            ]
            // 未使用动态计算单位
            const free1 = Math.ceil((free / Math.pow(STEP, pow)) * 100) / 100
            arr[0].value = (value - free1).toFixed(2)
            arr[1].value = free1

            return { arr, total }
        },
        formatter
    }
}
