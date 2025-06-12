<template>
  <div>
    <el-table
      :data="hostsList"
      size="mini"
      max-height="250"
      style="margin: 0;"
    >
      <ants-table-column width="40">
        <span
          class="el-icon-s-operation cursor-color"
          style="font-size:16px;"
        ></span>
      </ants-table-column>
      <ants-table-column
        min-width="150"
        label="节点IP"
        prop="name"
      >
        <template #default="{ row }">
          <span
            class="text-primary cursor-pointer"
            @click="showDetailDrawer(row)"
          >{{ row.name }}</span>
        </template>
      </ants-table-column>
      <ants-table-column
        min-width="150"
        label="操作系统"
        prop="system"
      >
      </ants-table-column>
      <ants-table-column
        min-width="120"
        label="CPU使用率"
        prop="cpu"
      >
      </ants-table-column>
      <ants-table-column
        min-width="120"
        label="磁盘使用率"
        prop="diskPct"
      >
      </ants-table-column>

      <ants-table-column
        min-width="120"
        label="内存使用率"
        prop="memoryUsage"
      >
      </ants-table-column>
      <ants-table-column
        min-width="120"
        label="总内存"
        prop="memoryTotal"
      >
      </ants-table-column>
      <ants-table-column
        min-width="120"
        label="网络流入(平均)"
        prop="rx"
      >
      </ants-table-column>
      <ants-table-column
        min-width="120"
        label="网络流出(平均)"
        prop="tx"
      >
      </ants-table-column>

    </el-table>

    <DetailDrawer ref="DetailDrawerRef" />
  </div>
</template>

<script>
// api
import { getElastic } from '@/v2/cdn_admin/api/cdn/monitor'

import DetailDrawer from './DetailDrawer.vue'

import { networkUnit, diskUnit } from '@/utils/unit'

export default {
  components: {
    DetailDrawer
  },
  data() {
    return {
      loading: false,
      qpsLoading: false,
      hostsList: [],
      query: {},
      nodeQpsObj: {}
    }
  },
  created() {},
  methods: {
    // 获取表格数据
    async getInfraData({ gte, lte, step, nodes }) {
      this.query = {
        gte,
        lte,
        step,
        nodes
      }
      this.loading = true
      try {
        const { data: res } = await getElastic({
          uri: 'metricbeat-*/_search',
          // postData: ''
          postData: JSON.stringify(this.buildQueryData())
        })

        let arr = []
        // 如果有数据
        if (res.data) {
          const obj = JSON.parse(res.data || '{}')
          console.log('overviewTable', obj)
          const bucketsArr =
            ((obj.aggregations || {}).nodes || {}).buckets || []

          arr = bucketsArr.map((item) => {
            const {
              key,
              osName,
              cpuUser,
              cpuSys,
              cpuTotal,
              memory,
              memoryTotal,
              diskPct,
              rx,
              tx,
              rxPeriod,
              txPeriod
            } = item

            // 计算网络流入流出单位
            // 采样周期
            const rxPeriodVal = (rxPeriod.period || {}).value || 10000
            const txPeriodVal = (txPeriod.period || {}).value || 10000
            // 默认的数据为 B，需要转换为 bit: value * 8 / (Period / 1000)
            const { label: rxLabel } = networkUnit(
              ((rx.value || 0) * 8) / (rxPeriodVal / 1000)
            )
            const { label: txLabel } = networkUnit(
              ((tx.value || 0) * 8) / (txPeriodVal / 1000)
            )

            return {
              name: key,
              system: (osName.buckets[0] || {}).key,
              // CPU使用率，四舍五入保留两位小数
              cpu:
                (
                  ((cpuUser.value + cpuSys.value) / (cpuTotal.value || 1)) *
                  100
                ).toFixed(2) + ' %',
              rx: rxLabel + '/s',
              tx: txLabel + '/s',
              memoryTotal: diskUnit(memoryTotal.value).label,
              memoryUsage: (memory.value * 100).toFixed(2) + ' %',
              diskPct: (diskPct.value * 100).toFixed(2) + ' %'
            }
          })
          this.hostsList = arr
        }
      } finally {
        this.loading = false
      }
    },

    // 构造查询数据
    buildQueryData() {
      const { gte, lte, step, nodes } = this.query
      console.log('nodes', nodes)
      return {
        aggs: {
          nodes: {
            terms: {
              // 要加上 keyword 不然会报错
              // field: 'host.name.keyword',
              field: 'agent.name',
              size: 500,
              order: {
                '@timestamp': 'desc'
              }
            },
            aggs: {
              osName: {
                terms: {
                  // 要加上 keyword 不然会报错。加了 keyword 之后，会将值汇聚不了数据！！
                  // field: 'host.os.name.keyword'
                  field: 'host.os.name'
                }
              },
              memory: {
                avg: {
                  field: 'system.memory.actual.used.pct'
                }
              },
              memoryTotal: {
                avg: {
                  field: 'system.memory.total'
                }
              },
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
              },
              diskPct: {
                avg: {
                  field: 'system.filesystem.used.pct'
                }
              },
              rx: {
                avg: {
                  field: 'host.network.ingress.bytes'
                }
              },
              tx: {
                avg: {
                  field: 'host.network.egress.bytes'
                }
              },
              // rx采样周期
              rxPeriod: {
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
                  period: {
                    max: {
                      field: 'metricset.period'
                    }
                  }
                }
              },
              // tx采样周期
              txPeriod: {
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
                  period: {
                    max: {
                      field: 'metricset.period'
                    }
                  }
                }
              }
            }
          }
        },
        size: 0,
        query: {
          bool: {
            must: [
              {
                range: {
                  '@timestamp': {
                    gte: 'now-' + gte,
                    lte: 'now'
                  }
                }
              },
              // 查询指点节点
              {
                terms: {
                  'agent.name': nodes
                }
              }
            ]
          }
        }
      }
    },

    // 显示详情抽屉
    showDetailDrawer(row = {}) {
      this.$refs.DetailDrawerRef.show(row, this.query)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
