<template>
  <el-card class="animated fadeIn content-box">
    <div class="border border-ants-border-2 rounded-2xl">
      <div>
        <ants-button
          size="small"
          type="success"
          :loading="loading"
          @click="getChart()"
          text="刷新"
          icon="el-icon-refresh"
        />
      </div>

      <el-table
        :data="topData"
        v-loading="loading"
        size="mini"
        :height="600"
        style="margin-top:10px;"
      >
        <div slot="empty">
          <el-empty :description="antsT('暂无数据')"> </el-empty>
        </div>
        <ants-table-column type="index" label="#" width="50">
        </ants-table-column>

        <ants-table-column prop="domain" label="域名" min-width="150">
        </ants-table-column>

        <ants-table-column prop="hostname" label="节点" min-width="150">
        </ants-table-column>

        <ants-table-column prop="request" label="1分钟请求数" min-width="120">
        </ants-table-column>

        <ants-table-column prop="flowIn" label="流入" min-width="150">
        </ants-table-column>

        <ants-table-column prop="flowOut" label="流出" min-width="150">
        </ants-table-column>

        <ants-table-column prop="timestamp" label="时间" min-width="150">
          <template #default="{ row }">
            {{ row.timestamp | dateFormat }}
          </template>
        </ants-table-column>
      </el-table>
    </div>
  </el-card>
</template>

<script>
import { bpsUnit, diskUnit, numUnit } from '@/utils/unit'
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getElastic } = require(`@/v2/${PROCESS_NAME}/api/cdn/monitor`)

export default {
  data() {
    return {
      isAdmin: PROCESS_NAME === 'cdn_admin',
      loading: false,
      topData: [],
      time: '',
      query: {
        gte: '1h',
        lte: null,
        step: '1m',
        // 域名，只有用户端才有，需要过滤过来
        domains: []
      }
    }
  },
  created() {
    this.getChart()
  },
  methods: {
    // 查询数据
    async getChart() {
      this.loading = true
      const { type, timeValue, step } = this.query

      try {
        const { data: res } = await getElastic({
          uri: 'filebeat-*/_search',
          postData: JSON.stringify(this.buildQueryData())
        })
        if (res.code !== 1) return
        const obj = JSON.parse(res.data || '{}')
        console.log(obj)
        const buckets = ((obj.aggregations || {})[0] || {}).buckets || []

        const topArr = buckets.map(item => {
          const keyObj = item.key || {}
          // 域名
          const domain = keyObj.domain
          // 节点IP
          const hostname = keyObj.ip

          const hits = item.top_document.hits.hits || []
          const source = (hits[0] || {})._source || {}

          return {
            // 域名
            domain,
            // 节点IP
            hostname,
            // 1分钟请求数
            request: source.k_server_1_sum,
            // 时间
            timestamp: source['@timestamp'],
            // 流入
            flowIn: source.l_server_in_byte,
            // 流出
            flowOut: source.l_server_out_byte
          }
        })
        this.topData = topArr
      } finally {
        this.loading = false
      }
    },

    // 构造查询条件，带宽|流量|请求数
    buildQueryData() {
      const { type } = this.query

      const queryData = {
        aggs: {
          0: {
            composite: {
              size: 200,
              sources: [
                { domain: { terms: { field: 'k_host' } } },
                { ip: { terms: { field: 'host.name' } } }
              ]
            },
            aggs: {
              request: {
                max: {
                  field: 'k_server_1_sum'
                }
              },
              // 排序
              sort_max_k_server_1_sum: {
                bucket_sort: {
                  sort: { request: { order: 'desc' } },
                  size: 100
                }
              },
              top_document: {
                top_hits: {
                  size: 1,
                  sort: [
                    {
                      k_server_1_sum: {
                        order: 'desc'
                      }
                    }
                  ],
                  _source: [
                    '@timestamp',
                    'k_server_1_sum',
                    'l_server_in_byte',
                    'l_server_out_byte'
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
                wildcard: {
                  'log.file.path': {
                    value: '*access*'
                  }
                }
              },
              {
                range: {
                  '@timestamp': {
                    // format: 'strict_date_optional_time',
                    gte: 'now-1m',
                    lte: 'now'
                  }
                }
              }
            ]
          }
        }
      }

      return queryData
    }
  }
}
</script>
