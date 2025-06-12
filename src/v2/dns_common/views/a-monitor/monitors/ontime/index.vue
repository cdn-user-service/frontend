<template>
  <el-card class="animated fadeIn content-box">
    <div slot="header" class="space-x-df">
      <TimeRange v-model="query.time" />

      <QueryIsp v-model="query.isp" />

      <ants-input
        class="ants-search_input"
        placeholder="检索域名"
        clearable
        v-model="query.domain"
        size="small"
        @change="changeInput"
      >
        <i
          slot="prefix"
          class="el-input__icon aicon icon-sousuo"
          @click="changeInput"
        ></i>
      </ants-input>

      <ants-button
        size="mini"
        type="primary"
        icon="el-icon-search"
        text="查询"
      />
    </div>

    <el-row :gutter="20">
      <el-col :span="8">
        <div
          class="flex items-center py-sm px-df mb-lg border border-ants-border-3 rounded-2xl"
        >
          <div class="flex-1 pr-lg">
            <div class="font-semibold">任务总数</div>
            <div class="pt-sm" style="font-size: 20px">
              {{ taskData.total }}
            </div>
          </div>
          <div style="width: 250px; height: 70px">
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
                    radius: ['70%', '92%']
                  }
                ]
              }"
            />
          </div>
        </div>
      </el-col>

      <el-col :span="8">
        <div
          class="flex items-center px-df py-sm mb-df border border-ants-border-3 rounded-2xl"
        >
          <div class="flex-1 pr-lg">
            <div class="font-semibold truncate">近6小时告警</div>
            <div class="pt-sm text-warning" style="font-size: 20px">8</div>
          </div>
          <div style="width: 300px; height: 70px" class="flex items-center">
            <div class="w-full">
              <div
                class="text-sm text-ants-text-4 flex items-center justify-between"
              >
                <span>09:00</span>
                <span>15:00</span>
              </div>
              <div style="height: 15px" class="bg-ants-border-3 mt-2 relative">
                <span
                  v-for="item in 5"
                  :key="item"
                  :style="{ left: item * item + '%' }"
                  style="width: 2px"
                  class="absolute h-full top-0 bg-warning"
                ></span>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span="8">
        <div
          class="flex items-center px-df py-sm border border-ants-border-3 rounded-2xl"
        >
          <div class="flex-1 pr-lg">
            <div class="font-semibold truncate">昨日探测数</div>
            <div class="text-success pt-sm" style="font-size: 20px">18</div>
          </div>
          <div style="width: 300px; height: 70px">
            <ants-chart-line ref="chartLineRef" :option="LineChartOption" />
          </div>
        </div>
      </el-col>
    </el-row>

    <el-radio-group v-model="query.type" size="small">
      <el-radio-button v-for="(item, key) in tabs" :key="key" :label="key">{{
        item
      }}</el-radio-button>
    </el-radio-group>

    <el-row :gutter="20">
      <el-col :span="6" v-for="item in tableData" :key="item.id">
        <div
          @click="goDetail(item)"
          class="ontime-chart-item relative w-full mt-lg border border-ants-border-3 rounded-2xl cursor-pointer hover:border-primary"
        >
          <div class="absolute text-sm p-df pt-sm">
            <div class="font-semibold">{{ `${item.top}.${item.domain}` }}</div>
            <div class="pt-xs flex items-center">
              <span
                style="padding: 3px"
                class="inline-block bg-success rounded-full mr-xs"
              ></span>
              <span class="mr-sm">上海电信</span>
              <span class="text-success">21ms</span>
            </div>
          </div>
          <ants-chart-line
            style="height: 200px"
            :ref="`antsChartLine${item.id}`"
            :option="LineOption"
          />
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
// 组件
import TimeRange from './TimeRange.vue'
import QueryIsp from './QueryIsp.vue'

import LineChartOption from './line-chart-option.js'
import LineOption from './line-option.js'

const PROCESS_NAME = process.env.VUE_APP_NAME

const { getRuleList } = require(`@/v2/${PROCESS_NAME}/api/dns/a-monitor`)

const tabs = {
  0: '全部（6）',
  1: '告警（0）',
  2: '异常（1）',
  3: '正常（5）',
  4: '暂无数据（5）'
}
export default {
  components: {
    TimeRange,
    QueryIsp
  },
  data() {
    return {
      LineChartOption,
      LineOption,
      tabs,
      query: {
        time: '6h',
        isp: 'all',
        name: '',
        type: 0,
        domain: ''
      },

      // 任务数量
      taskData: {
        total: 999,
        error: 456
      },

      tableData: [],
      total: 0
    }
  },
  created() {
    this.getTableData()
  },
  mounted() {},
  methods: {
    refresh() {
      this.getTableData()
    },

    async getTableData() {
      this.$root.loading = true
      try {
        const { data: res } = await getRuleList({
          domain: '',
          status: null,
          userId: 0,
          username: '',
          page: 1, // 当前的页数
          limit: 20
        })
        if (res.code !== 1) return
        const { list = [], totalCount = 0 } = res.data || {}
        this.tableData = list
        this.total = totalCount
        this.getRoseChart()
      } finally {
        this.$root.loading = false
      }
    },

    changeInput() {},
    // 饼图渲染
    async getRoseChart() {
      await this.$nextTick()
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

      this.tableData.forEach((item) => {
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

        this.$refs[`antsChartLine${item.id}`][0].getChart({}, [
          {
            id: item.id,
            data: timeSeries
          }
        ])
      })
    },

    // 获取每个任务的监控任务数据
    async getTaskItemById(id) {
      this.loading = true
      try {
        // const { data: res } = await getTaskList({
        //   taskId: id
        // })
        // if (res.code !== 1) return

        const lineData = [
          {
            id: 1,
            data: [7, 11, 13, 20, 12, 9, 8]
          }
        ]
        await this.$nextTick()

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
      } finally {
        this.loading = false
      }
    },

    // 前往详情页
    goDetail(item) {
      this.$router.push({
        path: './details',
        query: {
          id: item.id
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.ontime-chart-item {
  transition: all 0.3s;
  position: relative;
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
    &::before {
      display: flex;
    }
  }
}
</style>
