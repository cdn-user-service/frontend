<template>
  <div>
    <el-table :data="tableData" size="mini" max-height="250" style="margin: 0;">
      <ants-table-column width="40">
        <template #default="{ row }">
          <span
            class="el-icon-s-operation cursor-color"
            style="font-size:16px;"
            @click="showDetailDrawer(row)"
          ></span>
        </template>
      </ants-table-column>
      <ants-table-column min-width="150" label="节点IP" prop="name">
        <template #default="{ row }">
          <span
            class="text-primary cursor-pointer"
            @click="showDetailDrawer(row)"
            >{{ row.name }}</span
          >
        </template>
      </ants-table-column>
      <ants-table-column min-width="150" label="操作系统" prop="osName">
        <template #default="{ row }">
          {{ row.osName || '-' }}
        </template>
      </ants-table-column>
      <ants-table-column min-width="120" label="CPU使用率" prop="cpu">
        <template #default="{ row }"> {{ row.cpu }}% </template>
      </ants-table-column>
      <ants-table-column min-width="120" label="磁盘使用率" prop="diskPct">
        <template #default="{ row }"> {{ row.diskPct }}% </template>
      </ants-table-column>

      <ants-table-column min-width="120" label="内存使用率" prop="memoryUsage">
        <template #default="{ row }"> {{ row.memoryUsage }}% </template>
      </ants-table-column>
      <ants-table-column min-width="120" label="总内存" prop="memoryTotal">
      </ants-table-column>
      <ants-table-column min-width="120" label="网络流入" prop="networkIn">
      </ants-table-column>
      <ants-table-column min-width="120" label="网络流出" prop="networkOut">
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
      tableObj: {},
      query: {},
      nodeQpsObj: {}
    }
  },
  computed: {
    tableData() {
      return Object.keys(this.tableObj).map(key => this.tableObj[key])
    }
  },
  created() {},
  methods: {
    // 获取表格数据
    async getInfraData({ gte, lte, step, nodes = [], append = 0 }) {
      if (!nodes.length) {
        this.tableObj = {}
        return
      }
      this.query = {
        gte,
        lte,
        step,
        nodes,
        append
      }

      Object.keys(this.tableObj).forEach(key => {
        // 移除不存在的节点
        if (!nodes.includes(key)) {
          delete this.tableObj[key]
        }
      })

      nodes.forEach(item => {
        const oldItem = this.tableObj[item] || {}
        this.$set(this.tableObj, item, {
          name: item,
          osName: oldItem.osName || '',
          cpu: oldItem.cpu || 0,
          diskPct: oldItem.diskPct || 0,
          memoryUsage: oldItem.memoryUsage || 0,
          memoryTotal: oldItem.memoryTotal || '0B',
          networkIn: oldItem.networkIn || '0kbit',
          networkOut: oldItem.networkOut || '0kbit'
        })
      })

      this.toQuery()
    },

    async toQuery() {
      const queryExists = [
        'system.cpu',
        'system.memory',
        'system.filesystem',
        'host.network'
      ]

      queryExists.forEach(async exists => {
        const { data: res } = await getElastic({
          uri: 'metricbeat-*/_search',
          // postData: ''
          postData: JSON.stringify(this.buildQueryData(exists))
        })

        const obj = JSON.parse(res.data || '{}')
        const bucketsArr = ((obj.aggregations || {})[0] || {}).buckets || []

        bucketsArr.forEach(item => {
          const name = item.key
          const hits = (((item[1] || {}).hits || {}).hits || [])[0] || {}
          const hitsSource = hits._source || {}
          const system = hitsSource.system || {}
          const host = hitsSource.host || {}
          console.log(name, exists, hitsSource, hitsSource.metricset)

          // 磁盘
          if (exists === 'system.filesystem') {
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
            this.$set(
              this.tableObj[name],
              'diskPct',
              ((usedVal / totalVal) * 100).toFixed(2)
            )
            return
          }

          // CPU
          if (exists === 'system.cpu') {
            const cpuUser = system.cpu.user.pct || 0
            const cpuSys = system.cpu.system.pct || 0
            const cpuTotal = system.cpu.cores || 1
            const cpuValue = (cpuUser + cpuSys) / cpuTotal
            this.$set(this.tableObj[name], 'cpu', (cpuValue * 100).toFixed(2))
            return
          }

          // 内存
          if (exists === 'system.memory') {
            const memoryUsage = system.memory.actual.used.pct || 0
            const memoryTotal = system.memory.total || 0
            this.$set(
              this.tableObj[name],
              'memoryUsage',
              (memoryUsage * 100).toFixed(2)
            )
            this.$set(
              this.tableObj[name],
              'memoryTotal',
              diskUnit(memoryTotal).label
            )
            return
          }

          // 网络流入流出
          if (exists === 'host.network') {
            // 采集周期
            const period = (hitsSource.metricset || {}).period || 10000
            const networkIn = host.network.ingress.bytes || 0
            const networkOut = host.network.egress.bytes || 0
            // 默认的数据为 B，需要转换为 bit: value * 8 / (Period / 1000)
            const { label: inLabel } = networkUnit(
              (networkIn * 8) / (period / 1000)
            )
            const { label: outLabel } = networkUnit(
              (networkOut * 8) / (period / 1000)
            )
            this.$set(this.tableObj[name], 'networkIn', inLabel)
            this.$set(this.tableObj[name], 'networkOut', outLabel)
            this.$set(this.tableObj[name], 'osName', host.os.name)
          }
        })
      })
    },

    // 构造查询数据
    buildQueryData(exists) {
      // 查询磁盘使用情况
      if (exists === 'system.filesystem') {
        return this.buildQueryDiskData()
      }

      const { gte, lte, step, nodes = [] } = this.query
      const queryData = {
        aggs: {
          0: {
            terms: {
              // 说明，1、在ES中，agent.name 的类型 type = text，所以需要使用keyword进行查询。
              //      2、若类型 type = keyword，则不需要使用 keyword 进行查询
              // 参考：https://www.elastic.co/guide/en/elasticsearch/reference/7.10/text.html
              // field: 'agent.name.keyword',
              field: 'agent.name',

              size: nodes.length || 100,
              order: {
                _key: 'desc'
              }
            },
            aggs: {
              1: {
                top_hits: {
                  size: 1,
                  sort: [
                    {
                      '@timestamp': {
                        order: 'desc'
                      }
                    }
                  ],
                  _source: [
                    'system.cpu',
                    'system.memory',
                    'system.filesystem',
                    'host.os',
                    'host.network',
                    'metricset'
                  ]
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
              },
              {
                exists: {
                  field: exists
                }
              }
            ]
          }
        }
      }

      return queryData
    },

    // 磁盘的设备有多个，查询语句不一样
    buildQueryDiskData() {
      const { nodes = [] } = this.query
      return {
        aggs: {
          0: {
            terms: {
              field: 'agent.name',
              size: nodes.length || 100,
              order: {
                _key: 'desc'
              }
            },
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
                    gte: 'now-5m',
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

<style lang="scss" scoped></style>
