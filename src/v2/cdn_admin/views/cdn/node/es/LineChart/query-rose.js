import { diskUnit } from '@/utils/unit'

export default {
  cpu: {
    title: 'CPU使用情况',
    aggs: {
      cpu: {
        terms: {
          // field: 'host.name.keyword'
          field: 'agent.name'
        },
        aggs: {
          cpuUser: {
            avg: {
              field: 'system.cpu.user.pct'
            }
          },
          cpuSys: {
            avg: {
              field: 'system.cpu.system.pct'
            }
          },
          cpuTotal: {
            max: {
              field: 'system.cpu.cores'
            }
          }
        }
      }
    },
    // 计算值
    computed: ({ cpu = {} }) => {
      const cpuBucket = cpu.buckets || []
      const cpuObj = cpuBucket[0] || {}
      // 用户使用率
      const cpuUserVal = (cpuObj.cpuUser || {}).value || 0
      // 系统使用率
      const cpuSysVal = (cpuObj.cpuSys || {}).value || 0
      const cpuTotalVal = (cpuObj.cpuTotal || {}).value || 1

      return [
        {
          name: '已使用',
          value: (cpuUserVal + cpuSysVal).toFixed(2)
        },
        {
          name: '未使用',
          value: (cpuTotalVal - (cpuUserVal + cpuSysVal)).toFixed(2)
        }
      ]
    }
  },
  // 内存监控
  memory: {
    title: '内存使用情况',
    aggs: {
      memory: {
        terms: {
          // field: 'host.name.keyword'
          field: 'agent.name'
        },
        aggs: {
          total: {
            avg: {
              field: 'system.memory.total'
            }
          },
          pct: {
            avg: {
              field: 'system.memory.actual.used.pct'
            }
          }
        }
      }
    },
    customFormatter: true,
    // 计算值
    computed: ({ memory = {} }) => {
      const momeryBucket = memory.buckets || []
      const memeryObj = momeryBucket[0] || {}
      // 总内存 B
      const totalVal = (memeryObj.total || {}).value || 0
      // 已使用内存 B
      const pctVal = (memeryObj.pct || {}).value || 0
      const usedVal = (totalVal * pctVal).toFixed(0)
      // 未使用内存 B
      const unusedVal = totalVal - usedVal

      const { label: totalLabel } = diskUnit(totalVal)
      const { label: usedLabel } = diskUnit(usedVal)
      const { label: unusedLabel } = diskUnit(unusedVal)

      return [
        {
          name: '已使用',
          tag: '内存',
          label: usedLabel,
          total: totalLabel,
          value: usedVal
        },
        {
          name: '未使用',
          tag: '内存',
          label: unusedLabel,
          total: totalLabel,
          value: unusedVal
        }
      ]
    }
  },
  disk: {
    title: '磁盘使用情况',
    aggs: {
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
      // pct: {
      //   terms: {
      //     field: 'system.filesystem.device_name'
      //   },
      //   aggs: {
      //     disk: {
      //       avg: {
      //         field: 'system.filesystem.used.pct'
      //       }
      //     }
      //   }
      // },
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
    customFormatter: true,
    // 计算值
    computed: ({ total = {}, pct = {}, bytes = {} }) => {
      // 磁盘总量 B
      const totalBuckets = total.buckets || []
      // 百分比
      // const pctBuckets = pct.buckets || []
      // 已使用字节
      const bytesBuckets = bytes.buckets || []

      let totalVal = 0
      totalBuckets.forEach(it => {
        totalVal += (it.disk || {}).value || 0
      })

      let usedVal = 0
      bytesBuckets.forEach(it => {
        usedVal += (it.disk || {}).value || 0
      })

      // 磁盘未使用
      const unusedVal = totalVal - usedVal

      const { label: totalLabel } = diskUnit(totalVal)
      const { label: usedLabel } = diskUnit(usedVal)
      const { label: unusedLabel } = diskUnit(unusedVal)

      return [
        {
          name: '已使用',
          tag: '磁盘',
          label: usedLabel,
          total: totalLabel,
          value: usedVal
        },
        {
          name: '未使用',
          tag: '磁盘',
          label: unusedLabel,
          total: totalLabel,
          value: unusedVal
        }
      ]
    }
  }
}
