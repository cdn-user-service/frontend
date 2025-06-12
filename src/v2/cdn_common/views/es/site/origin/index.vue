<template>
  <div>
    <el-row :gutter="20">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 12 }"
        :md="{ span: 12 }"
        :lg="{ span: 12 }"
        :xl="{ span: 12 }"
      >
        <div
          class="border border-ants-border-2 rounded-2xl"
          style="height: 450px"
          v-loading="loading"
        >
          <MapChart ref="MapChartRef" />
        </div>
      </el-col>
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 12 }"
        :md="{ span: 12 }"
        :lg="{ span: 12 }"
        :xl="{ span: 12 }"
      >
        <div class="p-lg border border-ants-border-2 rounded-2xl">
          <TitleBorder>
            <strong class="text-sm">{{ antsT('区域来源占比排行') }}</strong>
          </TitleBorder>
          <el-table
            :data="topData"
            v-loading="loading"
            size="small"
            style="margin-top: 10px"
            height="382"
          >
            <ants-table-column label="区域名称" prop="name">
            </ants-table-column>
            <ants-table-column label="请求数" prop="label"> </ants-table-column>
            <ants-table-column label="占比">
              <template #default="{ row }">
                {{ ((row.value / total) * 100 * 100) | priceFormat('%') }}
              </template>
            </ants-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import MapChart from '../../components/MapChart'
import region from './region.js'
// 将region的key转换为小写
const lowerRegion = {}
console.log('region', region)
Object.keys(region).forEach((item) => {
  lowerRegion[item.toLowerCase()] = region[item]
})
// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getElastic } = require(`@/v2/${PROCESS_NAME}/api/cdn/monitor`)

export default {
  components: {
    MapChart
  },
  data() {
    return {
      loading: false,
      total: 0,
      topData: [],
      query: {
        // china | world
        area: 'china'
      }
    }
  },
  methods: {
    getChart(query = {}) {
      console.log('query', query)
      this.query = query
      this.toQuery()
    },

    // 查询数据
    async toQuery() {
      this.loading = true
      try {
        const { data: res } = await getElastic({
          uri: 'filebeat-*/_search',
          postData: JSON.stringify(this.buildQueryData())
        })
        const obj = JSON.parse(res.data || '{}')
        if (!obj) return
        console.log(obj)
        const buckets = ((obj.aggregations || {})[0] || {}).buckets || []
        console.log('buckets', buckets)
        let seriesData = []
        let total = 0
        if (buckets.length) {
          seriesData = buckets.map((item) => {
            const value = item.doc_count || 0
            total += value
            let name = item.key || ''
            if (this.query.area === 'china') {
              // 对应的区域中午名称，转换为小写
              name = name.toLowerCase()
              // regionKeys里面有name开头的，就是有对应的区域名称
              name = lowerRegion[name] || item.key
            }

            return {
              name,
              value,
              label: `${value} 次`
            }
          })
        }
        this.topData = seriesData
        this.total = total
        console.log('seriesData', total, seriesData)
        this.renderMapChart(seriesData)
      } finally {
        this.loading = false
      }
    },

    // 渲染map图表
    renderMapChart(seriesData = []) {
      console.log('seriesData', seriesData)
      this.$nextTick(() => {
        this.$refs.MapChartRef.initChart({
          map: this.query.area,
          title: '区域来源数据',
          series: [
            {
              name: '区域来源数据',
              data: seriesData
            }
          ]
          // series: [
          //   {
          //     name: '区域来源数据',
          //     data: [
          //       {
          //         name: 'BeiJing',
          //         value: 100,
          //         label: '100 次'
          //       },
          //       {
          //         name: 'SiChuan',
          //         value: 1000,
          //         label: '1000 次'
          //       }
          //     ]
          //   }
          // ]
        })
      })
    },

    // 构造查询数据
    buildQueryData() {
      const { area } = this.query

      const queryData = {
        aggs: {
          0: {
            terms: {
              field: `geoip.${
                area === 'china' ? 'region_name' : 'country_name'
              }`,
              size: 1000
            }
          }
          // world: {
          //   terms: {
          //     field: 'geoip.country_name',
          //     size: 1000
          //   }
          // },
          // china: {
          //   terms: {
          //     field: 'geoip.region_name',
          //     size: 1000
          //   }
          // },
          // city: {
          //   terms: {
          //     field: 'geoip.city_name',
          //     size: 1000
          //   }
          // }
        },
        size: 0,
        query: this.queryTime()
      }

      return queryData
    },

    // 查询时间范围和条件
    queryTime() {
      const { gte, lte, area, domains = [] } = this.query

      const query = {
        bool: {
          must: [
            // 查询指定域名
            {
              terms: {
                // k_host: ['www.vedns.com']
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
                  lte: lte ? `now-${lte}` : 'now'
                }
              }
            }
          ]
        }
      }
      // 如果为china，则查询国内数据
      if (area === 'china') {
        query.bool.must.push({
          match: {
            'geoip.country_name': 'China'
          }
        })
      }

      return query
    }
  }
}
</script>
