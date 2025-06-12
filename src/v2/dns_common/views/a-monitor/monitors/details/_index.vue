<template>
  <el-card>
    <div class="flex items-center justify-between" slot="header">
      <div class="flex items-center">
        <div class="pr-lg mr-lg border-r border-ants-border-3">
          <el-button
            icon="el-icon-back"
            plain
            circle
            size="mini"
            @click="$router.push('./ontime')"
          ></el-button>
          <strong class="text-2xl ml-sm"> 实时监控详情 </strong>
        </div>

        <div>
          <TaskPopover @change="toQuery" />

          <span class="text-success">
            <i class="el-icon-success"></i>
            正常
          </span>
        </div>
      </div>

      <ants-button
        type="primary"
        plain
        size="small"
        text="监控设置"
        icon="el-icon-monitor"
      />
    </div>

    <div class="space-x-df">
      <TimeRange v-model="query.time" @change="toQuery" />
      <QueryIsp v-model="query.isp" @change="toQuery" />
      <ants-button
        size="mini"
        type="primary"
        icon="el-icon-search"
        text="查询"
        @click="toQuery"
      />
    </div>

    <div class="pt-lg">
      <el-row :gutter="20">
        <el-col :span="12">
          <div
            class="p-df border border-ants-border-3 rounded-2xl"
            v-loading="loading"
          >
            <TitleBorder title="探测结果" class="pb-sm" />
            <el-row>
              <el-col :span="12">
                <ul class="space-y-6 mt-sm">
                  <li v-for="(item, key) in taskResultList" :key="key">
                    <span class="text-ants-text-4">{{ key }}：</span>
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </el-col>
              <el-col :span="12">
                <div class="flex items-center pt-lg">
                  <div class="flex-1 text-center">
                    <el-progress
                      type="dashboard"
                      :percentage="60"
                      :stroke-width="12"
                      :width="120"
                      color="#177DFF"
                    >
                    </el-progress>
                    <div class="">可用率%</div>
                  </div>
                  <div class="flex-1 text-center">
                    <div
                      style="height: 120px"
                      class="flex items-center justify-center"
                    >
                      <div
                        class="rounded-2xl bg-ants-bg-3 font-semibold text-center py-lg"
                        style="width: 120px"
                      >
                        <span style="font-size: 26px">324</span>
                        <span> ms</span>
                      </div>
                    </div>

                    <div class="text-center mt-2">平均响应时间</div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-col>

        <el-col :span="12">
          <div class="p-df border border-ants-border-3 rounded-2xl">
            <TitleBorder title="报警历史（近6小时）" />
            <el-table
              size="mini"
              style="margin: 0"
              :data="tableData"
              :height="196"
              v-loading="loading"
            >
              <!-- <el-table-column
                  prop="name"
                  label="监控任务"
                  min-width="140"
                >
                  测试项目1
                </el-table-column> -->
              <el-table-column prop="ip" label="故障IP" min-width="140">
                23.23.23.23
              </el-table-column>
              <el-table-column
                prop="startTime"
                label="开始时间"
                min-width="140"
              >
                2022-05-19 14:00:00
              </el-table-column>
              <el-table-column prop="endTime" label="恢复时间" min-width="140">
                2022-05-19 14:00:00
              </el-table-column>
              <el-table-column
                prop="warningTime"
                label="持续时间"
                min-width="100"
              >
                59min
              </el-table-column>
              <el-table-column
                prop="warningCount"
                label="告警次数"
                min-width="100"
              >
                12
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <div class="p-df border border-ants-border-3 rounded-2xl mt-lg">
            <TitleBorder title="可用率(%)" class="pb-sm" />
            <div style="height: 220px">
              <ants-chart-line ref="chartLineRef" :option="LineChartOption" />
            </div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="p-df border border-ants-border-3 rounded-2xl mt-lg">
            <TitleBorder title="响应时间(ms)" class="pb-sm">
              <span class="pl-lg text-ants-text-4">
                （总响应平均时间：256 ms）
              </span>
            </TitleBorder>
            <div style="height: 220px">
              <ants-chart-line
                ref="chartLineRef1"
                :option="TimeLineChartOption"
              />
            </div>
          </div>
        </el-col>
      </el-row>

      <div class="mt-lg p-df border border-ants-border-3 rounded-2xl">
        <TitleBorder title="探测记录" class="pb-sm">
          <ants-radio-group size="small" v-model="query.record" class="ml-lg">
            <ants-radio-button
              v-for="item in ['全部', '正常', '报警', '错误']"
              :key="item"
              :label="item"
              :text="item"
            />
          </ants-radio-group>
        </TitleBorder>

        <el-table
          size="mini"
          style="margin: 0"
          :data="tableData"
          max-height="300"
          v-loading="loading"
        >
          <el-table-column prop="name" label="时间" min-width="140">
            2023-5-20 02:07:19
          </el-table-column>
          <el-table-column prop="ips" label="探测点" min-width="140">
            上海市-上海联通
          </el-table-column>
          <el-table-column prop="ip" label="探测点" min-width="140">
            140.23.23.23
          </el-table-column>
          <el-table-column prop="jip" label="解析IP" min-width="140">
            23.23.18.87
          </el-table-column>
          <el-table-column prop="endTime" label="响应时间" min-width="140">
            1556 ms
          </el-table-column>
          <el-table-column prop="warningTime" label="错误信息" min-width="100">
            assertion failed
          </el-table-column>
          <el-table-column label="操作" width="100">
            <span class="text-primary cursor-pointer">详情</span>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </el-card>
</template>

<script>
import LineChartOption from './yong-line-option.js'
import TimeLineChartOption from './time-line-option.js'

// 组件
import TaskPopover from './TaskPopover.vue'
import TimeRange from '../ontime/TimeRange.vue'
import QueryIsp from '../ontime/QueryIsp.vue'

const PROCESS_NAME = process.env.VUE_APP_NAME
const { getTaskMonitor } = require(`@/v2/${PROCESS_NAME}/api/dns/a-monitor`)

const taskResultList = {
  任务ID: 'task_id',
  探测地址: 'https://www.test.com',
  探测类型: 'HTTPS',
  探测端口: '443',
  探测频率: '15秒',
  切换规则: '定时轮询'
}
export default {
  components: {
    TaskPopover,
    TimeRange,
    QueryIsp
  },
  data() {
    return {
      taskId: this.$route.query.id,
      taskResultList,
      LineChartOption,
      TimeLineChartOption,
      tableData: [],
      loading: false,
      query: {
        time: '6h',
        name: '',
        isp: 'all',
        type: '全部',
        record: '错误'
      }
    }
  },
  created() {
    this.getDetail()
  },
  mounted() {
    this.getChart()
  },
  methods: {
    // 查询数据
    toQuery() {
      this.getChart()
    },

    // 获取详情数据
    async getDetail() {
      this.loading = true
      try {
        const { data: res } = await getTaskMonitor({
          taskId: this.taskId
        })
        if (res.code !== 1) return
        console.log(res)
      } finally {
        this.loading = false
      }
    },

    // 渲染图表
    getChart() {
      this.getTableData()

      const lineData = [
        {
          id: 1,
          data: [7, 11, 2, 14, 6, 9, 8]
        }
      ]
      this.$refs.chartLineRef.getChart({}, lineData)

      const timeSeries = []
      const timeSeries2 = []
      const timeSeries3 = []
      const timeSeries4 = []
      const timeSeries5 = []
      // 构造 9:00 - 15:00 时间序列，间隔 5 分钟
      for (let i = 0; i < 72; i++) {
        const time = new Date().setHours(9, 0, 0, 0) + i * 5 * 60 * 1000
        timeSeries.push([
          // 时间戳
          time,
          // 平滑的随机数 300 ~ 330
          Math.floor(Math.random() * 20 + 300)
        ])

        timeSeries2.push([
          // 时间戳
          time,
          // 平滑的随机数 200 ~ 220
          Math.floor(Math.random() * 20 + 200)
        ])

        timeSeries3.push([
          // 时间戳
          time,
          Math.floor(Math.random() * 20 + 150)
        ])

        timeSeries4.push([time, Math.floor(Math.random() * 20 + 100)])

        timeSeries5.push([time, Math.floor(Math.random() * 20 + 50)])
      }

      this.$refs.chartLineRef1.getChart({}, [
        {
          id: 1,
          data: timeSeries
        },
        {
          id: 2,
          data: timeSeries2
        },
        {
          id: 3,
          data: timeSeries3
        },
        {
          id: 4,
          data: timeSeries4
        },
        {
          id: 5,
          data: timeSeries5
        }
      ])
    },

    // 获取表格数据
    getTableData() {
      this.loading = true
      const mokeData = []
      for (let index = 0; index < 10; index++) {
        mokeData.push({
          id: index
        })
      }
      setTimeout(() => {
        this.loading = false
        this.tableData = mokeData
      }, 500)
    }
  }
}
</script>

<style lang="scss" scoped></style>
