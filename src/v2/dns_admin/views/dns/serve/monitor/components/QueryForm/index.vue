<template>
  <div>
    <!-- 时间范围 1小时 6小时 1天 近七天 近30十天 -->
    <div class="content-box flex justify-between monitor-time-box">
      <div>
        <el-radio-group v-model="timeRadio" size="small" @change="changeTime">
          <el-radio-button :label="1">近1小时</el-radio-button>
          <el-radio-button :label="6">近6小时</el-radio-button>
          <el-radio-button :label="24">今日</el-radio-button>
          <el-radio-button :label="168">近7天</el-radio-button>
          <el-radio-button :label="720">近30天</el-radio-button>
        </el-radio-group>

        <el-date-picker
          v-model="screenForm.timeValue"
          type="daterange"
          value-format="timestamp"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerMyOptions"
          align="right"
          size="small"
          prefix-icon="el-icon-date"
          unlink-panels
          :clearable="false"
          popper-class="my_picker"
          @change="changeTimePicker"
          class="hidden-xs-only"
        >
        </el-date-picker>
      </div>

      <el-button
        size="mini"
        type="success"
        icon="el-icon-refresh"
        class="refresh-btn"
        @click="queryChartData"
        :loading="$root.loading"
        >刷新</el-button
      >
    </div>

    <div class="content-box">
      <el-radio-group
        v-model="screenForm.step"
        size="small"
        @change="queryChartData"
        style="margin-right:20px;"
      >
        <el-radio-button :label="5" :disabled="stepDisabled.fiveSecend"
          >5秒</el-radio-button
        >
        <el-radio-button :label="60" :disabled="stepDisabled.oneMin"
          >1分钟</el-radio-button
        >
        <el-radio-button :label="5 * 60" :disabled="stepDisabled.fiveMin"
          >5分钟</el-radio-button
        >
        <el-radio-button :label="60 * 60" :disabled="stepDisabled.oneHour"
          >1小时</el-radio-button
        >
        <el-radio-button :label="720 * 60" :disabled="stepDisabled.oneDay"
          >1天</el-radio-button
        >
      </el-radio-group>

      <!-- 检索 -->
      <slot name="queryElement"></slot>
    </div>
  </div>
</template>

<script>
// API
import { getHostList } from '@/v2/dns_admin/api/dns/monitor'

export default {
  data() {
    return {
      timeRadio: 1,
      pickerMyOptions: {
        disabledDate: nowtime => {
          // 禁用当前时间之后的时间选项
          return nowtime.getTime() > Date.now()
        }
      },

      screenForm: {
        timeValue: [
          // 初始时间范围 为 近1小时
          new Date().setTime(new Date().getTime() - 3600 * 1000 * 1),
          new Date().getTime()
        ],
        step: 5, // 粒度
        domain: (this.$route.params && this.$route.params.domain) || '', // 域名
        host: '', // 主机
        requestType: 'udp' // 主机
      },

      stepDisabled: {
        fiveSecend: false,
        oneMin: false,
        fiveMin: true,
        oneHour: true,
        oneDay: true
      },

      hostList: []
    }
  },
  created() {
    // 如果为流量监控数据
    // if (this.$route.meta.isGetHostList) {
    // this.getHostListData()
    // }
  },
  methods: {
    /**
     * @description: 获取 host 列表
     */

    async getHostListData() {
      const { data: res } = await getHostList()
      if (res.code !== 1) return
      this.hostList = (res.data && res.data.dns_client) || []
      if (res.data && res.data.dns_client && res.data.dns_client.length) {
        this.$set(this.screenForm, 'host', res.data.dns_client[0])

        // this.$parent.getRoseChart(this.screenForm)
      } else {
        this.$msg.error('还没有任何 HOST ！')
      }
    },

    /**
     * @description: 切换时间范围
     * @param {*} val
     */

    changeTime(val) {
      const start = new Date()
      if (val == 1 || val == 6) {
        this.screenForm.timeValue = [
          start.setTime(start.getTime() - 3600 * 1000 * val),
          new Date().getTime()
        ]
      } else {
        this.screenForm.timeValue = [
          new Date(
            start.setTime(start.getTime() - 3600 * 1000 * (val - 24))
          ).setHours(0, 0, 0, 0),
          new Date().getTime()
        ]
      }

      // 根据时间范围控制粒度
      // 1、近6小时 -- 统计粒度： 1分钟 5分钟 1小时
      // 2、今日 -- 统计粒度： 5分钟 1小时
      // 3、近7天 -- 统计粒度： 1小时 1天
      // 4、近30天 -- 统计粒度： 1小时 1天
      // 4、超过30天 -- 统计粒度： 1天
      const nowStep = this.screenForm.step
      switch (+val) {
        case 1:
          this.stepDisabled = {
            fiveSecend: false,
            oneMin: false,
            fiveMin: true,
            oneHour: true,
            oneDay: true
          }
          this.screenForm.step = 5
          break
        case 6:
          this.stepDisabled = {
            fiveSecend: false,
            oneMin: false,
            fiveMin: false,
            oneHour: true,
            oneDay: true
          }
          this.screenForm.step = 60
          break
        case 24:
          this.stepDisabled = {
            fiveSecend: true,
            oneMin: true,
            fiveMin: false,
            oneHour: false,
            oneDay: true
          }
          this.screenForm.step = 5 * 60

          break
        case 168:
          this.stepDisabled = {
            fiveSecend: true,
            oneMin: true,
            fiveMin: true,
            oneHour: false,
            oneDay: false
          }
          this.screenForm.step = 60 * 60
          break
        case 720:
          this.stepDisabled = {
            fiveSecend: true,
            oneMin: true,
            fiveMin: true,
            oneHour: false,
            oneDay: false
          }
          this.screenForm.step = 60 * 60
          break
      }

      this.queryChartData()
    },

    /**
     * @description: 切换粒度
     */
    queryChartData() {
      this.$parent.getTimeLineChart()
    },

    changeTimePicker() {}
  }
}
</script>

<style lang="scss">
.el-date-editor--datetimerange.el-input__inner {
  width: 350px;
}

.monitor-time-box {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  .el-radio-button:last-child .el-radio-button__inner {
    border-radius: 0;
    border-right: 0;
  }
  .el-radio-button--small .el-radio-button__inner {
    padding: 9px 20px;
  }
  .el-input__inner {
    border-radius: 0 4px 4px 0;
    vertical-align: middle;
  }

  .screen_btn {
    margin-left: 20px;
  }
  @media screen and (max-width: 767px) {
    .el-radio-button:last-child .el-radio-button__inner {
      border-radius: 0 4px 4px 0;
      border-right: 1px solid theme('colors.ants-border-1');
    }
  }
  @media screen and (max-width: 400px) {
    .refresh-btn {
      display: none;
    }
  }
}
</style>
