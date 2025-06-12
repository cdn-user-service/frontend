<template>
  <div class="content-box">
    <el-row :gutter="20">
      <el-col :span="18">
        <el-card>
          <div class="pb-lg">
            <ants-radio-group
              v-model="query.time"
              size="mini"
              @change="toQuery"
            >
              <ants-radio-button
                :label="1"
                text="上个月"
              />
              <ants-radio-button
                :label="2"
                text="本月"
              />
            </ants-radio-group>
          </div>
          <el-row :gutter="20">
            <el-col
              :span="6"
              v-for="(item, idx) in totalList"
              :key="idx"
            >
              <div
                class="pl-lg"
                :class="{'border-l border-ants-border-2' : idx > 0 }"
              >
                <div class="font-semibold pb-lg text-sm">
                  {{ item.name}}
                </div>
                <div>
                  <span class="text-4xl">{{ item.value }} </span>
                  <span>次</span>
                </div>
              </div>
            </el-col>
          </el-row>

          <div class="mt-lg pt-lg">
            <TitleBorder
              title="解析量详情（次）"
              class="pb-sm"
            >
              <span class="pl-lg text-ants-text-4">
                （总解析次数：60 次）
              </span>
            </TitleBorder>
            <div style="height:400px;">
              <ants-chart-line
                ref="chartLineRef"
                :option="lineOption"
              />
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card>
          <TitleBorder title="解析概览" />
          <ul class="mt-df">
            <li class="flex items-center justify-between py-lg border-b border-ants-border-3">
              <span class="overview-info-span">
                解析状态
              </span>
              <span class="text-success">
                <i class="el-icon-success"></i>
                已开通
              </span>
            </li>
            <li class="flex items-center justify-between py-lg border-b border-ants-border-3">
              <span class="overview-info-span">
                授权ID</span>
              <span class="font-semibold">
                78877
              </span>
            </li>
            <li class="flex items-center justify-between py-lg border-b border-ants-border-3">
              <span
                class="overview-info-span"
                style="width:200px;"
              >
                HTTPDNS主域名数</span>
              <span class="font-semibold">
                5个
              </span>
            </li>
            <li class="flex justify-between py-lg ">
              <span class="overview-info-span">
                流量包</span>
              <div class="flex-1">
                <el-progress
                  :percentage="20"
                  :show-text="false"
                  :stroke-width="10"
                ></el-progress>
                <div class="mt-2 flex items-center justify-between text-sm text-ants-text-4">
                  <span>113次</span>
                  <span>600万次</span>
                </div>
              </div>
            </li>
          </ul>
        </el-card>
        <el-card class="mt-lg">
          <TitleBorder title="热门问题" />
          <ul class="mt-lg space-y-df text-sm">
            <li class="">
              HTTPDNS产品介绍
            </li>
            <li class="">
              HTTPDNS使用场景
            </li>
            <li class="">
              HTTPDNS接入方式
            </li>
            <li class="">
              HTTPDNS如何收费
            </li>
          </ul>
        </el-card>
      </el-col>

    </el-row>
  </div>
</template>

<script>
import lineOption from './line-option.js'

const totalList = [
  {
    name: '本月解析总量',
    value: 122
  },
  {
    name: '本月 HTTP-DES 解析量',
    value: 29
  },
  {
    name: '本月 HTTP-AES 解析量',
    value: 31
  },
  {
    name: '本月 HTTPS 解析量',
    value: 0
  }
]
export default {
  data() {
    return {
      totalList,
      query: {
        time: 2
      },
      lineOption
    }
  },
  created() {},
  mounted() {
    this.getChart()
  },
  methods: {
    toQuery() {
      this.getChart()
    },

    // 获取图表数据
    getChart() {
      const timeSeries = []
      const timeSeries2 = []
      const timeSeries3 = []
      // 构造 9:00 - 15:00 时间序列，间隔 5 分钟
      for (let i = 0; i < 72; i++) {
        const time = new Date().setHours(9, 0, 0, 0) + i * 5 * 60 * 1000
        timeSeries.push([
          // 时间戳
          time,
          // 平滑的随机数 300 ~ 330
          Math.floor(Math.random() * 20 + 30)
        ])

        timeSeries2.push([
          // 时间戳
          time,
          // 平滑的随机数 200 ~ 220
          Math.floor(Math.random() * 20 + 20)
        ])

        timeSeries3.push([
          // 时间戳
          time,
          Math.floor(Math.random() * 20 + 10)
        ])
      }

      this.$refs.chartLineRef.getChart({}, [
        {
          id: 1,
          name: 'HTTP-DES',
          data: timeSeries
        },
        {
          id: 2,
          name: 'HTTP-AES',
          data: timeSeries2
        },
        {
          id: 3,
          name: 'HTTPS',
          data: timeSeries3
        }
      ])
    }
  }
}
</script>

<style lang="scss" scoped>
.overview-info-span {
  display: inline-block;
  width: 100px;
  color: theme('colors.ants-text-4');
}
</style>
