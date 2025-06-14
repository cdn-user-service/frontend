import { bpsUnit, diskUnit, numUnit } from '@/utils/unit'

export default {
  // 请求数，通过 server_io 查询
  request: {
    title: '请求数',
    yAxisMax: null,
    aggs: {},
    // 计算值
    computed: (data = []) => {
      let total = 0
      const arr = data.map(item => {
        const requestCount = (item[1][2]['request-count'] || {}).value || 0
        total += requestCount
        return [item.key, requestCount, `${requestCount}次`]
      })

      const emptyData = [[new Date().getTime(), 0, '0次']]

      return [
        {
          name: '请求数',
          data: arr.length ? arr : emptyData,
          // 总请求数
          total: {
            val: total,
            unit: '次'
          }
        }
      ]
    },
    // Y轴自定义label，value默认的单位为 B
    yAxisLabel: value => {
      const { label } = numUnit(value)
      return label
    }
  },

  // 流量，通过 server_io 查询
  flow: {
    title: '流量趋势',
    yAxisMax: null,
    aggs: {},
    // 计算值
    computed: (data = []) => {
      // 流出
      const outArr = []
      // 流入
      const inArr = []
      // 总流量
      let total = 0

      data.forEach(item => {
        const inValue = (item[1][2]['flow-in'] || {}).value || 0
        const outValue = (item[1][2]['flow-out'] || {}).value || 0

        // 计算单位
        const { label: outLabel } = diskUnit(outValue)
        const { label: inLabel } = diskUnit(inValue)

        outArr.push([item.key, outValue, outLabel])
        inArr.push([item.key, inValue, inLabel])

        // 累加总流量
        total += inValue + outValue
      })

      // 总流量计算单位
      const { val, unit } = diskUnit(total)

      const emptyData = [[new Date().getTime(), 0, '0B']]

      return [
        {
          name: '流入',
          data: inArr.length ? inArr : emptyData,
          // 总流量
          total: {
            val,
            unit
          }
        },
        {
          name: '流出',
          data: outArr.length ? outArr : emptyData
        }
      ]
    },
    // Y轴自定义label，value默认的单位为 B
    yAxisLabel: value => {
      const { val, unit } = diskUnit(value)
      return `${+val}${unit}`
    }
  },

  // 峰值带宽，通过 server_io 查询
  bandwidth: {
    title: '带宽趋势',
    aggs: {},
    // 计算值 : 带宽 = 流量 * 8 / 粒度，
    computed: (data = [], step = '30s') => {
      const stepObj = {
        '5s': 5,
        '30s': 30,
        '1m': 60,
        '5m': 300,
        '1h': 3600,
        '6h': 21600,
        '12h': 43200,
        '1d': 86400
      }
      const stepValue = stepObj[step]
      console.log('stepValue', stepValue)
      // 流出
      const outArr = []
      // 流入
      const inArr = []
      // 峰值带宽
      let peadBandwidth = 0
      data.forEach(item => {
        const inValue = (8 * (item[1][2]['flow-in'].value || 0)) / stepValue
        const outValue = (8 * (item[1][2]['flow-out'].value || 0)) / stepValue

        if (outValue > peadBandwidth) {
          peadBandwidth = outValue
        }

        // 计算单位
        const { label: outLabel } = bpsUnit(outValue)
        const { label: inLabel } = bpsUnit(inValue)

        inArr.push([item.key, inValue, inLabel])
        outArr.push([item.key, outValue, outLabel])
      })

      // 带宽计算单位
      const { val, unit } = bpsUnit(peadBandwidth)

      const emptyData = [[new Date().getTime(), 0, '0Bps']]

      return [
        {
          name: '平均流入',
          data: inArr.length ? inArr : emptyData,
          // 峰值带宽
          total: {
            val,
            unit
          }
        },
        {
          name: '平均流出',
          data: outArr.length ? outArr : emptyData
        }
      ]
    },
    // Y轴自定义label，value默认的单位为 B
    yAxisLabel: value => {
      const { val, unit } = bpsUnit(value)
      return `${+val}${unit}`
    }
  }
}
