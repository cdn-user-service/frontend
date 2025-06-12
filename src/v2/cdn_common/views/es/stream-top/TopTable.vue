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
      <ants-table-column prop="port" min-width="150" key="port">
        <template #header>
          <span>端口</span>
        </template>
        <template #default="{ row }">
          <ants-copy :text="row.port" inline />
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
    keyName: '端口',
    sortKey: 'flow',
    termsKey: 'server_port'
  },
  request: {
    keyName: '端口',
    sortKey: 'request',
    termsKey: 'server_port'
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
        ports: []
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
      ports,
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
        ports
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
            port: item.key,
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
      const { sortKey = 'flow', termsKey = 'server_port' } = typeObj[type] || {}

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
                  field: 'bytes_received'
                }
              },
              // 流出
              'flow-out': {
                sum: {
                  field: 'bytes_sent'
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
      const { gte, lte, ports } = this.query

      const queryTime = {
        bool: {
          must: [
            {
              wildcard: {
                'log.file.path': {
                  value: '*stream*'
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
            server_port: ports
          }
        })
      }
      return queryTime
    }
  }
}
</script>
