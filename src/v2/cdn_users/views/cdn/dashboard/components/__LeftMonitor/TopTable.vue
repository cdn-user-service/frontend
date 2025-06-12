<template>
  <div class="border border-ants-border-2 rounded-2xl p-df">
    <TitleBorder>
      <strong class="text-sm">{{
        `TOP10${(typeObj[query.type] || {}).keyName}`
      }}</strong>
    </TitleBorder>
    <el-table
      :data="topData"
      v-loading="loading"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0)"
      size="mini"
      :height="275"
      style="margin-top:0;"
    >
      <div slot="empty">
        <el-empty :description="antsT('暂无数据')"> </el-empty>
      </div>
      <ants-table-column type="index" label="#" width="40" />
      <ants-table-column
        prop="domain"
        min-width="150"
        label="域名"
        show-overflow-tooltip
      />
      <ants-table-column prop="value" min-width="100">
        <template #header>
          <span>{{ (typeObj[query.type] || {}).keyName }}</span>
        </template>
        <template #default="{ row }">
          {{ row[`${query.type}Total`] }}
        </template>
      </ants-table-column>
    </el-table>
  </div>
</template>

<script>
import { getElastic } from '@/v2/cdn_users/api/cdn/monitor'
import { bpsUnit, diskUnit } from '@/utils/unit'

const typeObj = {
  flow: {
    keyName: '总流量',
    sortKey: 'flow'
  },
  bandwidth: {
    keyName: '带宽',
    sortKey: 'flow'
  },
  request: {
    keyName: '请求数',
    sortKey: 'request'
  }
}

export default {
  data() {
    return {
      typeObj,
      loading: false,
      topData: [],
      query: {
        type: 'flow',
        domains: []
      }
    }
  },
  created() {},
  methods: {
    getTableData(query = {}) {
      this.query = query

      if (!query.domains) {
        this.topData = []
        return
      }

      this.toQuery()
    },

    changeType() {},

    // 查询数据
    async toQuery() {
      this.loading = true
      const { type, timeValue, step } = this.query
      //   const stepObj = {
      //     '30s': 30,
      //     '1m': 60,
      //     '5m': 300,
      //     '1h': 3600,
      //     '6h': 21600,
      //     '12h': 43200,
      //     '1d': 86400
      //   }
      //   const stepValue = stepObj[step]
      // 这里计算平均带宽，要除以总的时间间隔，即计算出 每秒的流量

      try {
        const { data: res } = await getElastic({
          uri: 'filebeat-*/_search',
          postData: JSON.stringify(this.buildQueryData())
        })

        const obj = JSON.parse(res.data || '{}')
        if (!obj) return
        // 如果有数据
        const buckets = ((obj.aggregations || {})[0] || {}).buckets || []
        console.log('buckets', buckets)
        const topArr = buckets.map(item => {
          const flowIn = (item['flow-in'] || {}).value || 0
          const flowOut = (item['flow-out'] || {}).value || 0
          const flowTotal = (item['flow-total'] || {}).value || 0
          // const requestTotal = (item['request-total'] || {}).value || 0

          return {
            domain: item.key,
            value: item.doc_count || 0,
            flowIn: diskUnit(flowIn).label,
            flowOut: diskUnit(flowOut).label,
            flowTotal: diskUnit(flowTotal).label,

            bandwidthIn: bpsUnit((flowIn * 8) / timeValue).label,
            bandwidthOut: bpsUnit((flowOut * 8) / timeValue).label,
            bandwidthTotal: bpsUnit((flowTotal * 8) / timeValue).label,

            // requestTotal: numUnit(requestTotal).label
            requestTotal: item.doc_count || 0
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
      const { sortKey = 'flow' } = typeObj[type] || {}
      let sortAggs = {}
      // 如果为流量带宽排行，要追加排序
      if (type === 'flow') {
        sortAggs = {
          sorted_diff: {
            bucket_sort: {
              sort: {
                'flow-total': {
                  order: 'desc'
                }
              }
            }
          }
        }
      }

      const queryData = {
        aggs: {
          0: {
            terms: {
              field: 'k_host',
              order: {
                _count: 'desc'
              },
              size: 10
            },
            aggs: {
              // 流入
              'flow-in': {
                sum: {
                  field: 'k_request_length'
                }
              },
              // 流出
              'flow-out': {
                sum: {
                  field: 'l_out_size'
                }
              },
              // 流量总和
              'flow-total': {
                bucket_script: {
                  buckets_path: {
                    flowInValue: 'flow-in',
                    flowOutValue: 'flow-out'
                  },
                  script: 'params.flowInValue + params.flowOutValue'
                }
              },
              ...sortAggs
            }
          }
        },
        size: 0,
        query: this.queryTime()
      }
      return queryData
    },

    // 查询时间范围和条件
    queryTime() {
      const { gte, lte, domains } = this.query

      const queryTime = {
        bool: {
          must: [
            {
              terms: {
                k_host: domains
              }
            },
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
                  gte: 'now-' + gte,
                  lte: 'now'
                }
              }
            }
          ]
        }
      }
      return queryTime
    }
  }
}
</script>
