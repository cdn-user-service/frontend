<template>
  <div class="my-lg border border-ants-border-2 rounded-2xl p-lg">
    <TitleBorder>
      <strong class="text-sm">{{
        `${antsT('TOP100 ')}${
          query.type === 'request' ? antsT('请求数') : antsT('流量带宽')
        }`
      }}</strong>
    </TitleBorder>
    <el-table
      :data="topData"
      v-loading="loading"
      size="mini"
      :height="500"
      style="margin-top:10px;"
    >
      <div slot="empty">
        <el-empty :description="antsT('暂无数据')"> </el-empty>
      </div>
      <ants-table-column type="index" label="#" width="50"> </ants-table-column>
      <ants-table-column prop="domain" min-width="150" key="domain">
        <template #header>
          <span>{{ curTypeObj.keyName }}</span>
        </template>
        <template #default="{ row }">
          <ants-copy :text="row.domain" inline />
        </template>
      </ants-table-column>
      <ants-table-column
        prop="requestTotal"
        label="请求数"
        min-width="100"
        key="requestTotal"
      >
      </ants-table-column>
      <ants-table-column
        prop="flowIn"
        label="流入"
        min-width="100"
        key="flowIn"
      >
      </ants-table-column>
      <ants-table-column
        prop="flowOut"
        label="流出"
        min-width="100"
        key="flowOut"
      >
      </ants-table-column>
      <ants-table-column
        prop="flowTotal"
        label="总流量"
        min-width="100"
        key="flowTotal"
      >
      </ants-table-column>

      <ants-table-column
        prop="bandwidthIn"
        label="平均流入"
        min-width="100"
        key="bandwidthIn"
      >
      </ants-table-column>
      <ants-table-column
        prop="bandwidthOut"
        label="平均流出"
        min-width="100"
        key="bandwidthOut"
      >
      </ants-table-column>
      <ants-table-column
        prop="bandwidthTotal"
        label="带宽"
        min-width="100"
        key="bandwidthTotal"
      >
      </ants-table-column>
    </el-table>
  </div>
</template>

<script>
import { bpsUnit, diskUnit, numUnit } from '@/utils/unit'
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getElastic } = require(`@/v2/${PROCESS_NAME}/api/cdn/monitor`)

const typeObj = {
  flow: {
    keyName: '域名',
    sortKey: 'flow',
    termsKey: 'k_host'
  },
  request: {
    keyName: '域名',
    sortKey: 'request',
    termsKey: 'k_host'
  },
  uri: {
    keyName: 'URL',
    sortKey: 'request',
    termsKey: 'k_url'
  },
  referer: {
    keyName: 'Referer',
    sortKey: 'request',
    termsKey: 'k_referer'
  }
}
export default {
  data() {
    return {
      isAdmin: PROCESS_NAME === 'cdn_admin',
      loading: false,
      topData: [],
      time: '',
      query: {
        // 域名，只有用户端才有，需要过滤过来
        domains: []
      }
    }
  },
  computed: {
    curTypeObj() {
      return typeObj[this.query.type] || {}
    }
  },
  created() {},
  methods: {
    getChart({
      domains,
      gte,
      lte,
      step,
      timeValue,
      type = 'flow',
      area = 'china'
    }) {
      this.query = {
        timeValue,
        gte,
        lte,
        step,
        type,
        area,
        domains
      }
      // 根据 timeValue 计算具体时间 2023-08-09 10:00:00，timeValue 为当前时间以前的秒数
      const time = new Date().getTime() - timeValue * 1000
      this.time = this.$dayjs(time).format('YYYY-MM-DD HH:mm:ss')
      console.log('query', this.query)

      this.toQuery()
    },

    // 查询数据
    async toQuery() {
      this.loading = true
      const { type, timeValue, step } = this.query
      // const stepObj = {
      //   '30s': 30,
      //   '1m': 60,
      //   '5m': 300,
      //   '1h': 3600,
      //   '6h': 21600,
      //   '12h': 43200,
      //   '1d': 86400
      // }
      // const stepValue = stepObj[step]
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
      const { sortKey = 'flow', termsKey = 'k_host' } = typeObj[type] || {}

      // URL聚合加上域名，使用脚本查询，性能不好，不用
      // if (type === 'uri') {
      //   const aa = {
      //     // URL 聚合要加上域名
      //     script: {
      //       source: "doc['k_host'].value + doc['k_uri'].value",
      //       lang: 'painless'
      //     },
      //     size: 100
      //   }
      // }
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
              field: termsKey,
              order: {
                _count: 'desc'
              },
              size: 100
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

              // 排序
              // sorted_diff: {
              //   bucket_sort: {
              //     sort: {
              //       [`${sortKey}-total`]: {
              //         order: 'desc'
              //       }
              //     }
              //   }
              // }
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
                  lte: lte ? `now-${lte}` : 'now'
                }
              }
            }
          ]
        }
      }

      // 只查询用户已有的域名
      if (!this.isAdmin) {
        queryTime.bool.must.push({
          terms: {
            k_host: domains
          }
        })
      }
      return queryTime
    }
  }
}
</script>
