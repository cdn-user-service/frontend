<template>
  <div class="border border-ants-border-2 rounded-2xl p-df">
    <TitleBorder>
      <strong class="text-sm">{{
        `TOP10${(typeObj[query.type] || {}).name}`
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
      <ants-table-column prop="val" min-width="100">
        <template #header>
          <span>{{ (typeObj[query.type] || {}).name }}</span>
        </template>
        <template #default="{ row }">
          {{ row.val }}
        </template>
      </ants-table-column>
    </el-table>
  </div>
</template>

<script>
import { getElastic } from '@/v2/cdn_users/api/cdn/monitor'
import { bpsUnit, diskUnit } from '@/utils/unit'

const stepObj = {
  '5s': 5,
  '30s': 30,
  '1m': 60,
  '5m': 300,
  '1h': 3600,
  '6h': 21600,
  '12h': 43200,
  '1d': 86400
}

const typeObj = {
  flow: {
    name: '总流量',
    aggs: {
      'flow-out': {
        sum: {
          field: 'http.server_io_p.v.o'
        }
      },
      'flow-in': {
        sum: {
          field: 'http.server_io_p.v.i'
        }
      },
      output: {
        bucket_script: {
          buckets_path: {
            in: 'flow-in',
            out: 'flow-out'
          },
          script: 'params.in + params.out'
        }
      }
    },
    computed: (val = 0) => {
      const { label } = diskUnit(val)
      return label
    }
  },
  bandwidth: {
    name: '峰值带宽',
    aggs: {
      // 峰值带宽取流出最大值
      output: {
        max: {
          field: 'http.server_io_p.v.o'
        }
      }
    },
    computed: (val = 0, step) => {
      const stepValue = stepObj[step]
      const { label } = bpsUnit((val * 8) / stepValue)
      return label
    }
  },
  request: {
    name: '请求数',
    aggs: {
      output: {
        sum: {
          field: 'http.server_io_p.v.r'
        }
      }
    },
    computed: (val = 0) => `${val}次`
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
      this.query = {
        ...query
      }

      if (!query.domains.length) {
        this.topData = []
        return
      }

      this.toQuery()
    },

    async toQuery() {
      this.loading = true
      try {
        const { data: res } = await getElastic({
          uri: 'metricbeat-8.9.1/_search',
          postData: JSON.stringify(this.buildQueryData())
        })
        if (!res.data) return
        const obj = JSON.parse(res.data || '{}')

        const buckets =
          (((obj.aggregations || {})[0] || {})[1] || {}).buckets || []

        const { type, step } = this.query

        const { computed } = typeObj[type] || {}

        this.topData = buckets.map(item => {
          return {
            domain: item.key,
            val: computed ? computed((item.output || {}).value, step) : 0
          }
        })
      } finally {
        this.loading = false
      }
    },

    // 构造查询条件，带宽|流量|请求数
    buildQueryData() {
      const { type, gte, lte, step, domains = [] } = this.query
      const [domain] = domains
      const { aggs } = typeObj[type] || {}

      const queryData = {
        size: 0,
        query: {
          bool: {
            must: [
              {
                range: {
                  '@timestamp': {
                    gte: 'now-' + gte,
                    lte: lte ? `now-${lte}` : 'now'
                  }
                }
              },
              {
                match: {
                  'event.dataset': 'http.server_io_p'
                }
              },
              // nested嵌套查询必须要加上，不然查询速度会很慢
              {
                nested: {
                  path: 'http.server_io_p.v',
                  query: {
                    // 由于es数据源内过滤掉了数值为0的数据，会导致数值为0的域名没有，不再使用match进行单个匹配
                    // match: {
                    //   'v.s': domain
                    // }
                    terms: {
                      'http.server_io_p.v.s': domains
                    }
                  },
                  inner_hits: {} // 在Nested查询中添加inner_hits，以便返回匹配的nested成员
                }
              }
            ]
          }
        },
        aggs: {
          0: {
            nested: {
              path: 'http.server_io_p.v'
            },
            aggs: {
              1: {
                terms: {
                  field: 'http.server_io_p.v.s',
                  include: domains.join('|'),
                  size: 10
                },
                aggs: {
                  ...aggs,
                  sorted_diff: {
                    bucket_sort: {
                      sort: {
                        output: {
                          order: 'desc'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      return queryData
    }
  }
}
</script>
