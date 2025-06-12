import { networkUnit, diskUnit, numUnit } from '@/utils/unit'

const nginxQuery = {
  active: '活跃数',
  waiting: '等待数',
  reading: '读取数',
  writing: '写入数'
}
const nginxQueryDiff = {
  requests: '请求数',
  handled: '处理数',
  accepts: '接受数'
}

const nginxBaseQuery = (key, title) => ({
  title,
  aggs: {
    2: {
      sum: {
        field: `nginx.stubstatus.${key}`
      }
    }
  },
  // 计算值
  computed: (data = []) => {
    const arr = data.map(item => {
      const value = item[2].value || 0
      // 计算单位
      // const { label } = numUnit(value)
      return [item.key, value, value]
    })
    const emptyData = [[new Date().getTime(), 0, '0']]
    return [
      {
        name: title,
        data: arr.length ? arr : emptyData
      }
    ]
  },
  // Y轴自定义label
  yAxisLabel: value => {
    const { val, unit } = numUnit(value)
    return `${val}${unit || ''}`
  }
})
const nginxQueryObj = {}
for (const key in nginxQuery) {
  nginxQueryObj[key] = nginxBaseQuery(key, nginxQuery[key])
}

const nginxQueryDiffQuery = (key, title) => ({
  title: title,
  aggs: {
    2: {
      min: {
        field: `nginx.stubstatus.${key}`
      }
    },
    3: {
      max: {
        field: `nginx.stubstatus.${key}`
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
    const arr = data.map(item => {
      const value = (item[4] || {}).value || 0
      // 计算单位
      // const { label } = numUnit(value)
      return [item.key, value, value]
    })
    const emptyData = [[new Date().getTime(), 0, '0']]
    return [
      {
        name: title,
        data: arr.length ? arr : emptyData
      }
    ]
  },
  // Y轴自定义label
  yAxisLabel: value => {
    const { val, unit } = numUnit(value)
    return `${val}${unit || ''}`
  }
})
const nginxQueryDiffObj = {}
for (const key in nginxQueryDiff) {
  nginxQueryDiffObj[key] = nginxQueryDiffQuery(key, nginxQueryDiff[key])
}

export default {
  // 负载情况
  nodeload: {
    title: '负载情况',
    yAxisMax: 100,
    yAxisLabel: '{value}%',
    aggs: {
      2: {
        avg: {
          field: 'system.load.1'
        }
      },
      3: {
        max: {
          field: 'system.load.cores'
        }
      }
    },
    // 计算值
    computed: (data = []) => {
      const arr = data.map(item => {
        const avg = item[2].value || 0
        const max = item[3].value || 1
        const value = (avg / max) * 100
        return [item.key, value.toFixed(2), `${value.toFixed(2)}%`]
      })
      const emptyData = [[new Date().getTime(), 0, '0%']]
      return [
        {
          name: '负载情况',
          data: arr.length ? arr : emptyData
        }
      ]
    }
  },
  // CPU监控
  cpu: {
    title: 'CPU使用率',
    yAxisMax: 100,
    yAxisLabel: '{value}%',
    aggs: {
      2: {
        avg: {
          field: 'system.cpu.user.pct'
        }
      },
      3: {
        avg: {
          field: 'system.cpu.system.pct'
        }
      },
      4: {
        max: {
          field: 'system.cpu.cores'
        }
      }
    },
    // 计算值
    computed: (data = []) => {
      const arr = data.map(item => {
        const userAvg = item[2].value || 0
        const sysAvg = item[3].value || 0
        const max = item[4].value || 1
        const value = ((userAvg + sysAvg) / max) * 100
        return [item.key, value.toFixed(2), `${value.toFixed(2)}%`]
      })

      const emptyData = [[new Date().getTime(), 0, '0%']]
      return [
        {
          name: 'CPU使用率',
          data: arr.length ? arr : emptyData
        }
      ]
    }
  },
  // 内存监控
  memory: {
    title: '内存使用率',
    yAxisMax: 100,
    yAxisLabel: '{value}%',
    aggs: {
      2: {
        avg: {
          field: 'system.memory.actual.used.pct'
        }
      }
    },
    // 计算值
    computed: (data = []) => {
      const arr = data.map(item => {
        const avg = item[2].value || 0
        const value = avg * 100
        return [item.key, value.toFixed(2), `${value.toFixed(2)}%`]
      })
      const emptyData = [[new Date().getTime(), 0, '0%']]
      return [
        {
          name: '内存使用率',
          data: arr.length ? arr : emptyData
        }
      ]
    }
  },
  // 磁盘监控
  disk: {
    title: '磁盘使用率',
    yAxisMax: 100,
    yAxisLabel: '{value}%',
    aggs: {
      // 磁盘使用率
      // 2: {
      //   avg: {
      //     field: 'system.filesystem.used.pct'
      //   }
      // }
      total: {
        terms: {
          field: 'system.filesystem.device_name'
        },
        aggs: {
          disk: {
            avg: {
              field: 'system.filesystem.total'
            }
          }
        }
      },
      bytes: {
        terms: {
          field: 'system.filesystem.device_name'
        },
        aggs: {
          disk: {
            avg: {
              field: 'system.filesystem.used.bytes'
            }
          }
        }
      }
    },
    // 计算值
    computed: (data = []) => {
      // 获取到第一个值
      let firstVal = 0
      const arr = data.map(item => {
        // 磁盘总量 B
        const totalBuckets = (item.total || {}).buckets || []
        // 已使用字节
        const bytesBuckets = (item.bytes || {}).buckets || []

        let totalVal = 0
        totalBuckets.forEach(it => {
          totalVal += (it.disk || {}).value || 0
        })
        let usedVal = 0
        bytesBuckets.forEach(it => {
          usedVal += (it.disk || {}).value || 0
        })

        const pct = (totalVal ? usedVal / totalVal : 0) * 100

        if (pct > 0 && firstVal === 0) {
          firstVal = pct
        }
        return {
          key: item.key,
          value: pct
        }
      })

      const newArr = arr.map(item => {
        let value = item.value
        // 如果值为 0 则取上一个时间点的值
        if (value == 0) {
          value = firstVal
        }
        // 重置 firstVal
        firstVal = value
        return [item.key, value.toFixed(2), `${value.toFixed(2)}%`]
      })

      const emptyData = [[new Date().getTime(), 0, '0%']]
      return [
        {
          name: '磁盘使用率',
          data: newArr.length ? newArr : emptyData
        }
      ]
    }
  },
  // 磁盘IO
  diskio: {
    title: '磁盘IO',
    yAxisMax: null,
    aggs: {
      '2-write': {
        avg: {
          field: 'system.diskio.write.bytes'
        }
      },
      '3-write-bucket': {
        filter: {
          bool: {
            filter: [
              {
                bool: {
                  should: [
                    {
                      exists: {
                        field: 'system.diskio.write.bytes'
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
      '2-read': {
        avg: {
          field: 'system.diskio.read.bytes'
        }
      },
      '3-read-bucket': {
        filter: {
          bool: {
            filter: [
              {
                bool: {
                  should: [
                    {
                      exists: {
                        field: 'system.diskio.read.bytes'
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
      // 读取
      const readArr = []
      // 写入
      const writeArr = []
      data.forEach(item => {
        const write = item['2-write'].value || 0
        const writePeriod = item['3-write-bucket']['3-metric'].value || 1
        const writeValue = write / writePeriod

        const read = item['2-read'].value || 0
        const readPeriod = item['3-read-bucket']['3-metric'].value || 1
        const readValue = read / readPeriod

        // 计算单位
        const { label: readValueLabel } = diskUnit(readValue)
        const { label: writeValueLabel } = diskUnit(writeValue)

        readArr.push([item.key, readValue.toFixed(2), readValueLabel + '/s'])
        writeArr.push([item.key, writeValue.toFixed(2), writeValueLabel + '/s'])
      })
      const emptyData = [[new Date().getTime(), 0, 'B/s']]
      return [
        {
          name: '读取',
          data: readArr.length ? readArr : emptyData
        },
        {
          name: '写入',
          data: writeArr.length ? writeArr : emptyData
        }
      ]
    },
    // Y轴自定义label，value默认的单位为 B
    yAxisLabel: value => {
      const { val, unit } = diskUnit(value)
      return `${+val}${unit}/s`
    }
  },
  // 网络IO
  networkio: {
    title: '网络IO',
    unit: 'kbit',
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
      // 网络入站
      const ingressArr = []
      // 网络出站
      const egressArr = []

      data.forEach(item => {
        // 默认的数据为 B，需要转换为 bit
        const ingress = item['2-ingress'].value || 0
        const ingressPeriod =
          item['3-ingress-bucket']['3-metric'].value || 10000
        // 除以 8，转换为 bit: value * 8 / (ingressPeriod / 1000)
        const ingressValue = (ingress * 8) / (ingressPeriod / 1000)

        const egress = item['2-egress'].value || 0
        const egressPeriod = item['3-egress-bucket']['3-metric'].value || 10000
        const egressValue = (egress * 8) / (egressPeriod / 1000)

        // 计算单位流入
        const { label: ingressValueLable } = networkUnit(ingressValue)

        // 计算单位流出
        const { label: egressValueLable } = networkUnit(egressValue)

        // 数组索引 0 = 时间戳， 1 = 实际的值， 2 = tooltip显示的值(带单位)
        ingressArr.push([item.key, ingressValue.toFixed(2), ingressValueLable])
        egressArr.push([item.key, egressValue.toFixed(2), egressValueLable])
      })

      const emptyData = [[new Date().getTime(), 0, 'kbit']]
      return [
        {
          name: '流入',
          data: ingressArr.length ? ingressArr : emptyData
        },
        {
          name: '流出',
          data: egressArr.length ? egressArr : emptyData
        }
      ]
    },
    // Y轴自定义label，value默认的单位为 kbit
    yAxisLabel: value => {
      const { val, unit } = networkUnit(value)
      return `${+val}${unit}`
    }
  },

  /** ======================================================
   *        下面的为nginx 的统计，查询方式不一样
   *  ======================================================
   */
  ...nginxQueryDiffObj,
  ...nginxQueryObj
}
