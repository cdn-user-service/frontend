<template>
  <div>
    <el-empty v-if="!ips.length" description="暂无监控数据" />

    <el-row :gutter="20" v-else>
      <el-col
        :xs="{ span: 24 }"
        :sm="{ span: 12 }"
        :md="{ span: 12 }"
        :lg="{ span: 12 }"
        :xl="{ span: 12 }"
        v-for="ip in ips"
        :key="ip"
      >
        <div class="mt-lg pl-df border border-ants-border-3 rounded-2xl">
          <TitleBorder :title="ip" class="pt-df">
            <!-- <span class="text-ants-text-4"> （平均响应时间：256 ms） </span> -->
          </TitleBorder>
          <div style="height: 220px">
            <LineChart :ref="`LineChart${ip}`" />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import LineChart from './LineChart'
import { dateFormatFun } from '@/utils/public'

export default {
  components: {
    LineChart
  },
  data() {
    return {
      loading: false,
      ips: [],
      ipsObj: {}
    }
  },
  created() {},
  mounted() {},
  methods: {
    // 渲染图表
    async getChart(lineData = []) {
      this.ips = lineData.map((it) => it.ip)
      await this.$nextTick()

      // 记录最后一个点的响应时间
      const lastMonitors = {}

      lineData.forEach((item) => {
        lastMonitors[item.ip] = {
          publish: 0,
          slaveQueryTime: '0ms'
        }

        this.$refs[`LineChart${item.ip}`][0].initChart({
          // 是否需要清除图表
          title: '响应时间(ms)',
          // y轴标签
          yAxisLabel: (value) => `${value}ms`,
          // series数据
          series: item.lines.map((item2) => {
            // 用于收集已经宕机的时间点
            const dangPieces = []
            let dangTime = 0

            const seriesData = item2.data.map((item3, idx3) => {
              let { slaveQueryTime, publish } = item3
              // 如果为宕机
              const isDang = slaveQueryTime === '5000ms'

              if (isDang) {
                slaveQueryTime = '0ms'

                if (dangTime === 0) {
                  // 如果捕获到宕机时间
                  dangTime = publish
                } else {
                  // 如果一致宕机到最后
                  if (idx3 === item2.data.length - 1) {
                    dangPieces.push([dangTime, publish])
                  }
                }
              } else {
                // 如果未宕机，并且前面一个点是宕机时间点
                if (dangTime != 0) {
                  // 该点作为宕机结束点，并记录下一组宕机时间段
                  dangPieces.push([dangTime, publish])
                  dangTime = 0
                }
              }

              // 如果为最后一个点
              if (idx3 === item2.data.length - 1) {
                lastMonitors[item.ip].publish = publish * 1000
                lastMonitors[item.ip].slaveQueryTime = isDang
                  ? '-'
                  : slaveQueryTime
              }

              return [
                publish * 1000,
                isDang ? null : parseInt(slaveQueryTime || 0),
                isDang ? '宕机' : slaveQueryTime || '0ms'
              ]
            })

            return {
              id: item.node,
              name: item2.node,
              data: seriesData,

              markArea: this.buildMarkArea(
                dangPieces,
                seriesData[seriesData.length - 1][0]
              )
            }
          })
        })
      })

      // 更新父组件中的数据
      this.$emit('updatePublish', lastMonitors)
    },

    // 构造 series 数据
    buildMarkArea(dangTime = [], lastTime) {
      return {
        itemStyle: {
          color: 'rgba(245,36,67, 1)',
          borderColor: '#F52443',
          // borderWidth: 0.1,
          borderType: 'dashed'
          // opacity: 0.5
        },
        label: {
          color: '#F52443',
          fontSize: 10
        },
        data: dangTime.map(([start, end]) => {
          return [
            {
              name: '宕机',
              xAxis: dateFormatFun(start * 1000)
            },
            {
              name: '宕机',
              xAxis: dateFormatFun(end * 1000 || lastTime)
            }
          ]
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
