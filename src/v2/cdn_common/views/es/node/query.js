import { bpsUnit, diskUnit, numUnit } from '@/utils/unit'

export default {
  // 请求数
  requests: {
    title: '请求数',
    yAxisMax: null,
    aggs: {
      2: {
        min: {
          field: 'nginx.stubstatus.requests'
        }
      },
      3: {
        max: {
          field: 'nginx.stubstatus.requests'
        }
      },
      4: {
        bucket_script: {
          buckets_path: {
            minValue: '2',
            maxValue: '3'
          },
          script: 'params.maxValue - params.minValue'
        }
      }
    },
    // 计算值
    computed: (data = []) => {
      // 总请求数
      let totalRequests = 0
      const arr = data.map(item => {
        const value = (item[4] || {}).value || 0
        totalRequests += value
        // 计算单位
        // const { label } = numUnit(value)
        return [item.key, value, value]
      })
      const emptyData = [[new Date().getTime(), 0, '0']]

      return [
        {
          name: '请求数',
          data: arr.length ? arr : emptyData,
          total: {
            val: totalRequests
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

  // 流量，
  flow: {
    title: '流量趋势',
    yAxisMax: null,
    aggs: {
      '2-ingress': {
        avg: {
          field: 'host.network.ingress.bytes'
        }
      },
      '3-ingress-bucket': {
        filter: {
          bool: {
            filter: [
              {
                bool: {
                  should: [
                    {
                      exists: {
                        field: 'host.network.ingress.bytes'
                      }
                    }
                  ],
                  minimum_should_match: 1
                }
              }
            ]
          }
        },
        aggs: {
          '3-metric': {
            max: {
              field: 'metricset.period'
            }
          }
        }
      },
      '2-egress': {
        avg: {
          field: 'host.network.egress.bytes'
        }
      },
      '3-egress-bucket': {
        filter: {
          bool: {
            filter: [
              {
                bool: {
                  should: [
                    {
                      exists: {
                        field: 'host.network.egress.bytes'
                      }
                    }
                  ],
                  minimum_should_match: 1
                }
              }
            ]
          }
        },
        aggs: {
          '3-metric': {
            max: {
              field: 'metricset.period'
            }
          }
        }
      }
    },
    // 计算值
    computed: (data = []) => {
      // 总流量
      let totalFlow = 0
      // 网络入站
      const ingressArr = []
      // 网络出站
      const egressArr = []

      data.forEach(item => {
        // 默认的数据为 B，需要转换为 bit
        const ingress = (item['2-ingress'] || {}).value || 0

        const egress = (item['2-egress'] || {}).value || 0

        totalFlow += ingress + egress

        // 计算单位流入
        const { label: ingressValueLable } = diskUnit(ingress)
        // 计算单位流出
        const { label: egressValueLable } = diskUnit(egress)

        // 数组索引 0 = 时间戳， 1 = 实际的值， 2 = tooltip显示的值(带单位)
        ingressArr.push([item.key, ingress.toFixed(2), ingressValueLable])
        egressArr.push([item.key, egress.toFixed(2), egressValueLable])
      })

      const { val, unit } = diskUnit(totalFlow)
      const emptyData = [[new Date().getTime(), 0, '0B']]

      return [
        {
          name: '流入',
          data: ingressArr.length ? ingressArr : emptyData
        },
        {
          name: '流出',
          data: egressArr.length ? egressArr : emptyData,
          // 总流量
          total: {
            val,
            unit
          }
        }
      ]
    },
    // Y轴自定义label，value默认的单位为 B
    yAxisLabel: (value, idx) => {
      const { val, unit } = diskUnit(value)
      console.log(`${(+val).toFixed(0)}${unit}`, idx, value)
      return `${+val}${unit}`
    }
  },

  // 峰值带宽
  bandwidth: {
    title: '带宽趋势',
    aggs: {
      '2-ingress': {
        avg: {
          field: 'host.network.ingress.bytes'
        }
      },
      '3-ingress-bucket': {
        filter: {
          bool: {
            filter: [
              {
                bool: {
                  should: [
                    {
                      exists: {
                        field: 'host.network.ingress.bytes'
                      }
                    }
                  ],
                  minimum_should_match: 1
                }
              }
            ]
          }
        },
        aggs: {
          '3-metric': {
            max: {
              field: 'metricset.period'
            }
          }
        }
      },
      '2-egress': {
        avg: {
          field: 'host.network.egress.bytes'
        }
      },
      '3-egress-bucket': {
        filter: {
          bool: {
            filter: [
              {
                bool: {
                  should: [
                    {
                      exists: {
                        field: 'host.network.egress.bytes'
                      }
                    }
                  ],
                  minimum_should_match: 1
                }
              }
            ]
          }
        },
        aggs: {
          '3-metric': {
            max: {
              field: 'metricset.period'
            }
          }
        }
      }
    },
    // 计算值 : 带宽 = 流量 * 8 / 粒度，
    computed: (data = []) => {
      // 峰值带宽
      let peadBandwidth = 0
      // 网络入站
      const ingressArr = []
      // 网络出站
      const egressArr = []

      data.forEach(item => {
        // 默认的数据为 B，需要转换为 bit
        const ingress = (item['2-ingress'] || {}).value || 0
        const ingressPeriod =
          (item['3-ingress-bucket']['3-metric'] || {}).value || 10000
        // 除以 8，转换为 bit: value * 8 / (ingressPeriod / 1000)
        const ingressValue = (ingress * 8) / (ingressPeriod / 1000)

        const egress = (item['2-egress'] || {}).value || 0
        const egressPeriod =
          (item['3-egress-bucket']['3-metric'] || {}).value || 10000
        const egressValue = (egress * 8) / (egressPeriod / 1000)

        if (egressValue > peadBandwidth) {
          peadBandwidth = egressValue
        }

        // 计算单位流入
        const { label: ingressValueLable } = bpsUnit(ingressValue)
        // 计算单位流出
        const { label: egressValueLable } = bpsUnit(egressValue)

        // 数组索引 0 = 时间戳， 1 = 实际的值， 2 = tooltip显示的值(带单位)
        ingressArr.push([item.key, ingressValue.toFixed(2), ingressValueLable])
        egressArr.push([item.key, egressValue.toFixed(2), egressValueLable])
      })

      const { val, unit } = bpsUnit(peadBandwidth)

      const emptyData = [[new Date().getTime(), 0, '0Bbps']]
      return [
        {
          name: '平均流入',
          data: ingressArr.length ? ingressArr : emptyData
        },
        {
          name: '平均流出',
          data: egressArr.length ? egressArr : emptyData,
          // 峰值带宽
          total: {
            val,
            unit
          }
        }
      ]
    },
    // Y轴自定义label，value默认的单位为 B
    yAxisLabel: value => {
      const { val, unit } = bpsUnit(value)
      return `${(+val).toFixed(0)}${unit}`
    }
  }
}
