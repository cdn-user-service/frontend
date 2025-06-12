<template>
  <div class="animated fadeIn">
    <el-row :gutter="10" class="mt-lg">
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 12 }"
        :md="{ span: 12 }"
        :lg="{ span: 12 }"
        :xl="{ span: 12 }"
        v-for="item in topArr"
        :key="item.title"
      >
        <div class="chart-warp rose-chart rounded-2xl p-2 bg-ants-bg-3">
          <div
            class="rounded-2xl bg-ants-bg-1 chart-item cursor-pointer h-full p-sm sm:p-lg"
          >
            <div class="flex items-center justify-between">
              <TitleBorder>
                <strong class="text-sm">{{
                  `${antsT('TOP10 热门')}${item.title}`
                }}</strong>
              </TitleBorder>
              <ants-radio-group
                v-model="item.typeAcitve"
                size="mini"
                @change="renderItem(item)"
              >
                <ants-radio-button
                  v-for="(typeVal, typeKey) in item.typeObj"
                  :key="typeKey"
                  :label="typeKey"
                  :text="typeVal.title"
                />
              </ants-radio-group>
            </div>

            <el-table :data="item.list" v-loading="item.loading">
              <div slot="empty">
                <el-empty :description="antsT('暂无数据')"> </el-empty>
              </div>
              <ants-table-column type="index" label="#" width="50">
              </ants-table-column>
              <ants-table-column
                prop="name"
                :label="item.title"
                min-width="200"
              >
                <!-- <template #default="{ row }">
                  {{ row.metric && row.metric.filter_name }}
                </template> -->
              </ants-table-column>
              <ants-table-column
                :label="item.typeObj[item.typeAcitve].title"
                min-width="100"
              >
                <template #default="{ row }">
                  {{ computedValue(row.value, item.typeAcitve) }}
                </template>
              </ants-table-column>
            </el-table>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
// 导入动态计算流量
import { flowUnit } from '@/utils/public'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getPrometheus } = require(`@/v2/${PROCESS_NAME}/api/cdn/monitor`)

export default {
  data() {
    return {
      topArr: [
        {
          title: 'URL',
          query: '',
          list: [],
          typeAcitve: 'flow',
          typeObj: {
            flow: {
              title: '流量',
              query: 'nginx_vts_filter_bytes_total',
              filter: 'uris'
            },
            request: {
              title: '请求数',
              query: 'nginx_vts_filter_requests_total',
              filter: 'uris'
            }
          },
          loading: false
        },
        {
          title: 'Referer',
          query: '',
          list: [],
          typeAcitve: 'request',
          typeObj: {
            // flow: {
            //   title: '流量',
            //   query: 'nginx_vts_filter_bytes_total'
            // },
            request: {
              title: '请求数',
              query: 'nginx_vts_filter_requests_total',
              filter: 'refer'
            }
          },
          loading: false
        }
      ]
    }
  },
  created() {
    this.renderChart()
  },
  methods: {
    /**
     * @description: 渲染表格
     */

    renderChart() {
      this.topArr.forEach(async item => {
        this.renderItem(item)
      })
    },

    async renderItem(item) {
      item.loading = true
      item.list = []
      const { query, filter } = item.typeObj[item.typeAcitve]
      const data = await this.getTableData(query, filter)
      item.loading = false
      item.list = data
    },

    /**
     * @description: 查询数据
     * @param undefined
     */

    async getTableData(query = '', filter = '') {
      const form = this.$listeners.getFormData()
      if (!form.host.length) return

      const time = Math.round(form.end - form.start)
      const host = form.host
        .map(item => JSON.parse(item).domain)
        .join(`|${filter}::`)
      const { start, end, step } = form

      // const QUERY = encodeURIComponent(
      //   `ceil(topk(10,sum(increase(${query}{filter=~"uris::${host}"}[${time}s])) without (direction,project_name,job,instance)))`
      // )
      const byStr = filter === 'refer' ? 'filter_name' : 'url'
      const QUERY = encodeURIComponent(
        `ceil(topk(10,sum(${query}{filter=~"${filter}::${host}"}) by (${byStr})))`
      )

      const { data: res } = await getPrometheus({
        param: `query=${QUERY}&start=${start}&end=${end}&step=30`,
        path: '/api/v1/query_range'
      })

      let arr = []
      if (!res.data) {
        this.$msg.error('未查询到数据！')
        return arr
      }
      const chartData = JSON.parse(res.data || [])
      if (
        chartData.data &&
        chartData.data.result &&
        chartData.data.result.length
      ) {
        arr = chartData.data.result
      }

      const newArr = arr.map(item => {
        let valTotal = 0
        item.values.forEach(item2 => {
          valTotal += +item2[1]
        })
        return {
          name: item.metric && item.metric[byStr],
          value: valTotal
        }
      })

      const aa = newArr.sort((a, b) => {
        return b.value - a.value
      })

      return aa.slice(0, 10)
    },

    /**
     * @description: 计算值
     * @param undefined
     */

    computedValue(val = [], type = 'flow') {
      let str = val + '次'
      if (type === 'flow') {
        const { value, unit } = flowUnit(val)
        str = value + unit
      }
      return str
    },

    /**
     * @description: 切换请求数、流量
     * @param undefined
     */

    changeType(val, item) {}
  }
}
</script>
