<template>
  <el-card class="mb-lg">
    <!-- <div class="flex items-center justify-between"> -->
    <div class="query-time-box"> 
      <el-radio-group
        v-model="query.gte"
        size="small"
        @change="changeTime"
        :disabled="loading"
      >
        <ants-radio-button
          v-for="(item, key) in timeRange"
          :key="key"
          :label="key"
          :text="item.name"
        />
      </el-radio-group>

      <el-date-picker
        v-model="timeValue"
        :disabled="$root.loading"
        type="daterange"
        value-format="timestamp"
        unlink-panels
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        size="small"
        prefix-icon="el-icon-date"
        range-separator=" ~ "
        :clearable="false"
        popper-class="query-picker"
        class="hidden-xs-only"
        @change="changeTimePicker"
        :picker-options="pickerMyOptions"
        :default-time="['00:00:00', '23:59:59']"
        >
        </el-date-picker>
      <span
        class="refresh-span cursor-color inline-block rounded-xl p-xs bg-ants-bg-3 el-icon-refresh text-2xl text-ants-text-4"
        @click="getChart"
      >
      </span>
    </div>

    <div class="mt-lg">
      <el-row :gutter="20">
        <el-col
          :xs="{ span: 24 }"
          :sm="{ span: 8 }"
          :md="{ span: 8 }"
          :lg="{ span: 8 }"
          :xl="{ span: 8 }"
          v-for="(item, key) in totalData"
          :key="key"
        >
          <div class="rounded-2xl bg-ants-bg-4 pl-lg py-df mb-sm">
            <ul class="space-y-6">
              <li class="font-bold">{{ antsT(item.title) }}</li>
              <li>
                <div
                  class="inline-block total-flow-box"
                  v-loading="loading"
                  element-loading-spinner="el-icon-loading"
                  element-loading-background="rgba(0, 0, 0, 0)"
                >
                  <span class="text-3xl">{{ item.value }} </span>
                  <span> {{ antsT(item.unit) }}</span>
                </div>
              </li>

              <li class="text-sm text-ants-text-4 hidden-xs-only">
                {{ item.time }}
              </li>
            </ul>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="flex items-center justify-between mt-df mb-lg">
      <ants-radio-group
        v-model="query.type"
        size="small"
        @change="changeType"
        :disabled="loading"
      >
        <ants-radio-button
          v-for="(item, key) in titleObj"
          :key="key"
          :label="key"
          :text="item"
        />
      </ants-radio-group>
      <span
        class="text-primary cursor-pointer text-sm"
        @click="$router.push('/cdn/es/site')"
        >{{ antsT('查看详情') }}</span
      >
    </div>

    <el-row :gutter="20">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 24 }"
        :md="{ span: 16 }"
        :lg="{ span: 16 }"
        :xl="{ span: 16 }"
      >
        <div
          class="line-chart-box"
          v-loading="loading"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(0, 0, 0, 0)"
        >
          <LineChart ref="LineChartRef" />
        </div>
      </el-col>

      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 24 }"
        :md="{ span: 8 }"
        :lg="{ span: 8 }"
        :xl="{ span: 8 }"
      >
        <TopTable ref="TopTableRef" />
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
// 服务概览页面
// 组件
import LineChart from '@/v2/cdn_common/views/es/components/LineChart'
import TopTable from './TopTable.vue'
import queryObj from './query'
import { bpsUnit, diskUnit } from '@/utils/unit'

// API
import { getAllDomain } from '@/v2/cdn_users/api/cdn/site'
import { getElastic } from '@/v2/cdn_users/api/cdn/monitor'

const timeRange = {
  '1h': {
    name: '近1小时',
    value: 3600,
    step: '1m'
  },
  // '6h': {
  //   name: '近6小时',
  //   value: 3600 * 6,
  //   step: '5m'
  // },
  '24h': {
    name: '近24小时',
    value: 3600 * 24,
    step: '5m'
  },
  '7d': {
    name: '近7天',
    value: 3600 * 24 * 7,
    step: '1h'
  },
  '30d': {
    name: '近30天',
    value: 3600 * 24 * 30,
    step: '1d'
  }
}

const titleObj = {
  flow: '流量',
  bandwidth: '带宽',
  request: '请求数'
}

export default {
  components: {
    LineChart,
    TopTable
  },
  data() {
    return {
      loading: false,
      titleObj,
      timeRange,
      // 总请求数、总流量、峰值带宽
      totalData: {
        bandwidth: {
          title: '计费带宽',
          value: '0.00',
          unit: 'Bbps',
          time: '~'
        },
        flow: {
          title: '总流量',
          value: '0.00',
          unit: 'B',
          time: '~'
        },
        request: {
          title: '总请求数',
          value: '0',
          unit: '次',
          time: '~'
        }
      },
      timeValue: [
        // 初始时间范围 为 近 1 天
        new Date().getTime() - 1000 * 3600 * 24,
        new Date().getTime()
      ],
      pickerMyOptions: {
        // 禁用当前时间之后的时间选项
        disabledDate: nowtime => {
          const today = new Date(new Date().toLocaleDateString()).getTime()
          return nowtime.getTime() > today + 24 * 60 * 60 * 1000 - 1 // 禁用明天及以后
        },

        // 自定义快捷键
        shortcuts: [
          {
            text: '上一周',
            onClick(picker) {
              const todayStart = new Date(
                new Date(picker.value[0].toLocaleDateString()).getTime()
              )
              const todayEnd = new Date(
                new Date(picker.value[0].toLocaleDateString()).getTime() + 24 * 3600 * 1000 - 1
              )

              const start = new Date()
              const end = new Date()
              start.setTime(todayStart - 7 * 24 * 3600 * 1000)
              end.setTime(todayEnd - 24 * 3600 * 1000)

              // 设置选中值
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '下一周',
            onClick: picker => {
              const todayEnd = new Date(
                new Date(picker.value[1].toLocaleDateString()).getTime() +
                  24 * 3600 * 1000 -
                  1
              ).getTime()
              let start = new Date()
              let end = new Date()
              start.setTime(todayEnd + 1)
              end.setTime(todayEnd + 7 * 24 * 3600 * 1000)
              // 如果为最后一周
              if (end >= Date.now()) {
                end = Date.now()
                start = end - 6 * 24 * 3600 * 1000
                // this.$msg.warning('已经是最后一周')
              }

              // 设置选中值
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '本周',
            onClick: picker => {
              const end = Date.now()
              const start = end - 6 * 24 * 60 * 60 * 1000
              // 设置选中值
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },

      // 查询数据
      query: {
        timeValue: 3600,
        // 开启时间
        gte: '1h',
        // 结束时间
        // lte: null,
        // 粒度
        step: '1m',
        // 域名
        domains: [],
        // 区域
        area: 'china',
        type: 'flow'
      }
    }
  },
  created() {
    this.getUserAllDomains()
  },
  mounted() {},
  destroyed() {},
  methods: {
    // 获取用户所有的域名
    async getUserAllDomains() {
      this.loading = true
      try {
        const { data: res } = await getAllDomain({
          igg: 1
        })
        const testData = {
          11: 'www.cdxyspa.com',
          22: 'y.sdffthgfb.com',
          12: 'm.qwerhao.com',
          23: 'mcs.qwerhao3.com',
          13: 'y.qwerhao.com',
          24: 'pingtui.cc',
          14: 'm.qwerhao2.com',
          25: 'wosha.top'
        }
        res.data = testData
        // console.log('getUserAllDomains有反应吗?', res.code, res.data);
        if (res.code !== 1 || !res.data) {
          this.loading = false
          this.renderChart()
          return
        }
        // 获取到的数据为一个对象，key为ID，value为域名，需要转换成数组
        const obj = res.data || {}
        const arr = []
        for (const key in obj) {
          arr.push(obj[key])
        }

        this.query.domains = arr
        this.getChart()
      } catch (error) {
        this.loading = false
        console.log(error)
      }
    },

    // 切换类型
    changeType(type) {
      this.getChart()
      this.$refs.TopTableRef.getTableData(this.query)
    },

    // 切换时间范围
    changeTime(gte) {
      const { step, value } = timeRange[gte]
      this.query.step = step
      this.query.timeValue = value
      this.getChart()
    },

    /**
     * @description: 自定义时间范围改变
     */
    changeTimePicker(val) {
      let start = val[0] / 1000
      const end = val[1] / 1000
      const range = end - start

      // 一天的时间秒数
      const oneDay = 24 * 60 * 60
      // 选择了多少天
      const days = range / oneDay
      // 最多允许查询90天数据
      if (days > 90) {
        this.$msg.info('最多查询 90 天内的数据')
        // 设置开始时间为结束时间的前 90 天
        this.timePicker[0] = start = (end - oneDay * 90) * 1000
      }

      // 今日的时间戳
      const nowTime = Math.floor(new Date().getTime() / 1000)

      // 设置开始时间
      const startTime = Math.ceil(nowTime - start)
      this.query.gte = startTime + 's'

      // 设置结束时间
      const endTime = end + oneDay - 1
      if (endTime > nowTime) {
        this.query.lte = null
      } else {
        this.query.lte = Math.ceil(nowTime - endTime) + 's'
      }

      // 设置粒度，保持 60 个点
      let step = '1m'
      if (days >= 1 && days < 7) {
        step = '1h'
      }
      if (days >= 7 && days < 15) {
        step = '6h'
      }
      if (days >= 15 && days < 30) {
        step = '12h'
      }
      if (days >= 30) {
        step = '12h'
      }
      if (days < 1) {
        if (startTime < 3600) {
          step = '1m'
        }
        if (startTime > 3600 * 6) {
          step = '5m'
        }
      }
      this.query.step = step

      // 查询监控数据
      this.queryChart()
    },

    // 查询数据
    getChart() {
      this.$nextTick(() => {
        this.$refs.TopTableRef.getTableData(this.query)
      })
      const { domains, step, type } = this.query
      if (!domains.length) {
        const { computed } = queryObj[type]
        const seriesData = computed([], step)
        // 渲染空数据
        this.renderChart(type, seriesData)
        return
      }
      this.toQuery()
    },

    // 查询数据
    async toQuery() {
      this.loading = true
      try {
        const { data: res } = await getElastic({
          uri: 'metricbeat-8.9.1/_search',
          postData: JSON.stringify(this.buildQueryData())
        })
        console.log('query data', this.buildQueryData())
        if (!res.data) return

        const obj = JSON.parse(res.data || '{}')
        console.log('toQuery', obj)

        const buckets = ((obj.aggregations || {})[0] || {}).buckets || []
        console.log('buckets::', buckets)

        for (const key in titleObj) {
          const { computed } = queryObj[key]
          const seriesData = computed(buckets, this.query.step)

          // 总流量、峰值带宽、总请求数
          const { val, unit } = seriesData[0].total || {}
          this.totalData[key].value = val
          this.totalData[key].unit = unit
          console.log('总流量、峰值带宽、总请求数', this.totalData[key].value, this.totalData[key].unit)

          // 渲染图表
          if (key === this.query.type) {
            this.renderChart(key, seriesData)
          }
        }
      } finally {
        this.loading = false
      }
    },

    // 渲染图表
    renderChart(type = 'flow', series = []) {
      const { title, yAxisLabel } = queryObj[type]
      this.$nextTick(() => {
        this.$refs.LineChartRef.initChart({
          // 标题
          title,
          // 最大值
          yAxisMax: null,
          // y轴标签
          yAxisLabel,
          // series数据
          series
        })
      })
    },

    // 构造查询数据
    buildQueryData() {
      const { gte, lte, step, domains = [] } = this.query
      const [domain] = domains

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
            // composite: {
            //   size: 10000,
            //   sources: [
            //     {
            //       '@timestamp': {
            //         date_histogram: {
            //           field: '@timestamp',
            //           fixed_interval: step,
            //           time_zone: 'Asia/Shanghai'
            //         }
            //       }
            //     }
            //   ]
            // },
            date_histogram: {
              field: '@timestamp',
              fixed_interval: step,
              time_zone: 'Asia/Shanghai',
              min_doc_count: 0 // 可自动补0
            },
            aggs: {
              1: {
                nested: {
                  path: 'http.server_io_p.v'
                },
                aggs: {
                  2: {
                    filter: {
                      terms: {
                        'http.server_io_p.v.s': domains
                      }
                    },
                    aggs: {
                      // 流入
                      'flow-in': {
                        sum: {
                          field: 'http.server_io_p.v.i'
                        }
                      },
                      // 流出
                      'flow-out': {
                        sum: {
                          field: 'http.server_io_p.v.o'
                        }
                      },
                      // 请求数
                      'request-count': {
                        sum: {
                          field: 'http.server_io_p.v.r'
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

<style lang="scss" scoped>

// .line-chart-box {
//   height: 320px;
//   display: flex;
//   border: 1px solid theme('colors.ants-border-2');
//   border-radius: theme('borderRadius.2xl');

//   @media screen and (max-width: 991px) {
//     height: 250px;
//   }

//   @media screen and (max-width: 767px) {
//     height: 220px;
//   }
// }
.query-time-box {
  .el-date-editor--daterange.el-input__inner {
    width: 260px;
  }
  .el-radio-group .ants-radio-button:last-of-type .el-radio-button__inner {
  border-radius: 0 !important;

  }
  .el-radio-button--small .el-radio-button__inner {
    padding: 9px 20px;
  }
  .el-input__inner {
    border-radius: 0 4px 4px 0;
    vertical-align: middle;
    margin-right: 20px;
  }
}
</style>
