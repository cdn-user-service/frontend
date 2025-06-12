<template>
  <el-card style="min-height:400px;">
    <div
      slot="header"
      class="space-x-df"
    >
      <TimeRange v-model="query.time" />

      <QueryIsp v-model="query.isp" />

      <el-input
        class="ants-search_input"
        clearable
        placeholder="检索任务名称"
        size="small"
        v-model="query.name"
      >
        <i
          slot="prefix"
          class="el-input__icon aicon icon-sousuo"
        ></i>
      </el-input>

      <ants-button
        size="mini"
        type="primary"
        icon="el-icon-search"
        text="查询"
      />
    </div>
    <el-row :gutter="20">
      <el-col :span="8">
        <div class="flex items-center py-sm px-df mb-df border border-ants-border-3 rounded-2xl">
          <div class="flex-1">
            <div class="font-semibold">任务总数</div>
            <div
              class="pt-sm"
              style="font-size: 20px;"
            >{{ taskData.total }}</div>
          </div>
          <div style="width:250px;height:70px;">
            <ants-chart-rose
              ref="RoseChartTotal"
              :option="{
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    top: 'center'
                },
            series: [
            {
                label: {
                    show: false
                },
                radius: ['70%', '92%'],
            }]
          }"
            />
          </div>
        </div>
        <div class="flex items-center px-df py-sm mb-df border border-ants-border-3 rounded-2xl">
          <div class="flex-1">
            <div class="font-semibold">近6小时告警</div>
            <div
              class="pt-sm text-warning"
              style="font-size: 20px;"
            >8</div>
          </div>
          <div
            style="width:300px;height:70px;"
            class="flex items-center"
          >
            <div class="w-full">
              <div class="text-sm text-ants-text-4 flex items-center justify-between">
                <span>09:00</span>
                <span>15:00</span>
              </div>
              <div
                style="height:15px;"
                class="bg-ants-border-3 mt-2 relative"
              >
                <span
                  v-for="item in 5"
                  :key="item"
                  :style="{left: item * item + '%'}"
                  style="width:2px;"
                  class="absolute h-full top-0 bg-warning"
                ></span>
              </div>
            </div>

          </div>
        </div>
        <div class="flex items-center px-df py-sm border border-ants-border-3 rounded-2xl">
          <div class="flex-1">
            <div class="font-semibold">昨日探测数</div>
            <div
              class="text-success pt-sm"
              style="font-size: 20px;"
            >18</div>
          </div>
          <div style="width:300px;height:70px;">
            <ants-chart-line
              ref="chartLineRef"
              :option="LineChartOption"
            />
          </div>
        </div>
      </el-col>
      <el-col :span="16">
        <div class="p-df border border-ants-border-3 rounded-2xl">
          <div class="font-semibold mb-sm">
            报警历史（近6小时）
          </div>
          <el-table
            size="mini"
            style="margin:0;"
            :data="tableData"
            :height="250"
            v-loading="loading"
          >
            <el-table-column
              prop="name"
              label="监控任务"
              min-width="140"
            >
              测试项目1
            </el-table-column>
            <el-table-column
              prop="ip"
              label="故障IP"
              min-width="140"
            >
              23.23.23.23
            </el-table-column>
            <el-table-column
              prop="startTime"
              label="开始时间"
              min-width="140"
            >
              2022-05-19 14:00:00
            </el-table-column>
            <el-table-column
              prop="endTime"
              label="恢复时间"
              min-width="140"
            >
              2022-05-19 14:00:00
            </el-table-column>
            <el-table-column
              prop="warningTime"
              label="持续时间"
              min-width="120"
            >
              {{ formatSeconds(59) }}
            </el-table-column>
            <el-table-column
              prop="warningCount"
              label="告警次数"
              min-width="120"
            >
              12
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>

    <div class="flex items-center mt-df">
      <ants-radio-group
        size="small"
        v-model="query.type"
      >
        <ants-radio-button
          v-for="item in ['全部', '告警（0）', '异常（2）', '正常（18）', '暂无数据（0）']"
          :key="item"
          :label="item"
          :text="item"
        />
      </ants-radio-group>
    </div>

    <div class="">
      <el-row :gutter="15">
        <el-col
          :span="6"
          v-for="item in 7"
          :key="item"
        >
          <div
            style="height:300px;"
            @click="goDetail(item)"
            class="real-time-chart-item relative w-full mt-df border border-ants-border-3 rounded-2xl cursor-pointer hover:border-primary"
          >
            <ants-chart-line
              :ref="`antsChartLine${item}`"
              :option="LineOption"
            />
          </div>
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>

<script>
import LineChartOption from './line-chart-option.js'
import LineOption from './line-option.js'

// 组件
import TimeRange from './TimeRange.vue'
import QueryIsp from './QueryIsp.vue'

// API
const PROCESS_NAME = process.env.VUE_APP_NAME
const { getTaskList } = require(`@/v2/${PROCESS_NAME}/api/dns/a-monitor`)

export default {
  components: {
    TimeRange,
    QueryIsp
  },
  data() {
    return {
      LineChartOption,
      LineOption,

      loading: false,
      query: {
        time: '6h',
        isp: 'all',
        name: '',
        type: '全部'
      },

      tableData: [
        {
          id: 1
        },
        {
          id: 2
        },
        {
          id: 3
        },
        {
          id: 4
        },
        {
          id: 5
        },
        {
          id: 6
        }
      ],

      // 任务数量
      taskData: {
        total: 999,
        error: 456
      }
    }
  },
  created() {},
  mounted() {
    this.getRoseChart()
  },
  methods: {
    // 获取所有任务数据
    async getTaskChartData() {
      this.loading = true
      try {
        const { data: res } = await getTaskList(this.query)
        this.loading = false
        if (res.code !== 1) return
        console.log(res)
      } catch (error) {
        this.loading = false
        throw error
      }
    },

    // 获取表格报警数据
    async getTableData() {
      this.loading = true
      try {
        const { data: res } = await getTaskList(this.query)
        this.loading = false
        if (res.code !== 1) return
        console.log(res)
      } catch (error) {
        this.loading = false
        throw error
      }
    },

    // 获取每个任务的监控任务数据
    async getTaskItemById(id) {
      this.loading = true
      try {
        const { data: res } = await getTaskList({
          taskId: id
        })
        this.loading = false
        if (res.code !== 1) return
        console.log(res)

        const lineData = [
          {
            id: 1,
            data: [7, 11, 13, 20, 12, 9, 8]
          }
        ]
        this.$refs.chartLineRef.getChart({}, lineData)

        for (let index = 1; index < 8; index++) {
          const timeSeries = []
          // 构造 9:00 - 15:00 时间序列，间隔 5 分钟
          for (let i = 0; i < 72; i++) {
            timeSeries.push([
              // 时间戳
              new Date().setHours(9, 0, 0, 0) + i * 5 * 60 * 1000,
              // 平滑的随机数 100 ~ 150
              Math.floor(Math.random() * 10 + 100)
            ])
          }

          this.$refs[`antsChartLine${index}`][0].getChart({}, [
            {
              id: index,
              data: timeSeries
            }
          ])
        }
      } catch (error) {
        this.loading = false
        throw error
      }
    },

    // 十分秒换算
    formatSeconds(value) {
      let theTime = parseInt(value) // 秒
      let theTime1 = 0 // 分
      let theTime2 = 0 // 小时
      if (theTime > 60) {
        theTime1 = parseInt(theTime / 60)
        theTime = parseInt(theTime % 60)
        if (theTime1 > 60) {
          theTime2 = parseInt(theTime1 / 60)
          theTime1 = parseInt(theTime1 % 60)
        }
      }
      let result = '' + parseInt(theTime) + '秒'
      if (theTime1 > 0) {
        result = '' + parseInt(theTime1) + '分' + result
      }
      if (theTime2 > 0) {
        result = '' + parseInt(theTime2) + '小时' + result
      }
      return result
    },

    // 饼图渲染
    async getRoseChart() {
      const searisData = [
        {
          name: '运行中',
          value: 52
        },
        {
          name: '已停止',
          value: 23
        }
      ]
      this.$refs.RoseChartTotal.getChart({}, searisData)

      const lineData = [
        {
          id: 1,
          data: [7, 11, 13, 20, 12, 9, 8]
        }
      ]
      this.$refs.chartLineRef.getChart({}, lineData)

      for (let index = 1; index < 8; index++) {
        const timeSeries = []
        // 构造 9:00 - 15:00 时间序列，间隔 5 分钟
        for (let i = 0; i < 72; i++) {
          timeSeries.push([
            // 时间戳
            new Date().setHours(9, 0, 0, 0) + i * 5 * 60 * 1000,
            // 平滑的随机数 100 ~ 150
            Math.floor(Math.random() * 10 + 100)
          ])
        }

        this.$refs[`antsChartLine${index}`][0].getChart({}, [
          {
            id: index,
            data: timeSeries
          }
        ])
      }
    },

    // 前往详情页
    goDetail(item) {
      this.$router.push({
        name: 'RealTimeDetail',
        params: {
          id: item
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-card {
  padding: 4px;
  border-radius: 10px;
}

.real-time-chart-item {
  // transition: all 0.3s;
  &::before {
    content: '查看详情';
    display: none;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    text-align: center;
    z-index: 9999;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 10px;
    color: theme('colors.primary');
  }
  &:hover {
    border-width: 2px;
    &::before {
      display: flex;
    }
  }
}
</style>
