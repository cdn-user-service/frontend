<template>
  <el-card class="animated fadeIn content-box">
    <div class="flex items-center">
      <ants-button
        size="mini"
        type="success"
        icon="el-icon-refresh"
        class="refresh-btn"
        @click="toQuery"
        :loading="loading"
        text="刷新"
      />

      <ants-input
        class="ants-search_input ml-sm"
        placeholder="检索节点IP"
        clearable
        v-model="query.name"
        size="small"
        @change="getNodes()"
      >
        <i
          slot="prefix"
          class="el-input__icon aicon icon-sousuo"
          @click="getNodes()"
        ></i>
      </ants-input>
    </div>

    <el-table
      v-loading="loading"
      :data="tableData"
      size="small"
      max-height="580"
    >
      <ants-table-column width="40">
        <span
          class="el-icon-s-operation cursor-color"
          style="font-size:16px;"
        ></span>
      </ants-table-column>

      <ants-table-column min-width="150" label="节点IP" prop="name">
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
  </el-card>
</template>

<script>
// api
import { getElastic } from '@/v2/cdn_admin/api/cdn/monitor'
import { networkUnit, diskUnit } from '@/utils/unit'

import { getNodeList } from '@/v2/cdn_admin/api/cdn/node'

// 组件
export default {
  components: {},
  data() {
    return {
      loading: false,
      tableObj: {},
      query: {
        name: '',
        nodes: []
      }
    }
  },
  computed: {
    tableData() {
      return Object.keys(this.tableObj).map(key => this.tableObj[key])
    }
  },
  created() {
    this.getNodes()
  },
  methods: {
    // 获取节点列表，用于查询监控数据
    async getNodes() {
      this.loading = true
      try {
        const { data: res } = await getNodeList({
          ip: this.query.name.trim(),
          page: 1, // 当前的页数
          limit: 500 // 当前每页显示多少条数据
        })
        if (res.code !== 1) return
        const obj = res.data || {}
        const nodes = obj.list || []
        // 全部节点，并查询数据
        if (!nodes.length) {
          this.tableObj = {}
          return
        }
        this.query.nodes = nodes.map(item => item.clientIp)

        Object.keys(this.tableObj).forEach(key => {
          // 移除不存在的节点
          if (!this.query.nodes.includes(key)) {
            delete this.tableObj[key]
          }
        })

        this.query.nodes.forEach(item => {
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

        // 查询监控数据
        this.toQuery()
      } finally {
        this.loading = false
      }
    },

    // 获取表格数据
    async toQuery() {
      this.loading = true
      try {
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
      } catch (err) {
        console.log(err)
      } finally {
        setTimeout(() => {
          this.loading = false
        }, 1000)
      }
    },

    // 构造查询数据
    buildQueryData(exists) {
      const { name, nodes } = this.query

      const defaultAggs = {
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

      const queryData = {
        aggs: {
          0: {
            terms: {
              field: 'agent.name',
              size: nodes.length || 100,
              order: {
                _key: 'desc'
              }
            },
            aggs:
              exists === 'system.filesystem'
                ? this.buildQueryDiskAggs()
                : defaultAggs
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

      // 查询指定节点 name
      if (name !== '') {
        queryData.query.bool.must.push({
          wildcard: {
            'agent.name': {
              value: `*${name.trim()}*`
            }
          }
          // 正则匹配
          // regexp: {
          //   'agent.name': `.*${name.trim()}.*`
          // }
          // 完整查询
          // term: {
          //   'host.name': `*${name.trim()}*`
          // }
        })
      }

      return queryData
    },

    // 磁盘的设备有多个，查询语句不一样
    buildQueryDiskAggs() {
      return {
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
  }
}
</script>

<style lang="scss" scoped></style>
