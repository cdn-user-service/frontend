<template>
  <div>
    <!-- 时间范围 1小时 6小时 1天 近七天 近30天 -->
    <div class="flex justify-between monitor-time-box">
      <div>
        <el-radio-group
          v-model="query.gte"
          size="small"
          @change="changeTimeRange"
          :disabled="$root.loading"
        >
          <ants-radio-button
            v-for="(item, key) in timeRange"
            :key="key"
            :label="key"
            :text="item.name"
          />
        </el-radio-group>

        <el-date-picker
          :disabled="$root.loading"
          v-model="timePicker"
          type="daterange"
          value-format="timestamp"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerMyOptions"
          align="center"
          size="small"
          prefix-icon="el-icon-date"
          unlink-panels
          :clearable="false"
          popper-class="query-time-picker"
          @change="changeTimePicker"
          class="hidden-xs-only"
        />
      </div>

      <ants-button
        size="mini"
        type="success"
        icon="el-icon-refresh"
        class="refresh-btn"
        @click="doRefresh"
        :loading="$root.loading || loading"
        text="刷新"
      />
    </div>

    <div class="content-box flex items-center">
      <el-radio-group
        v-model="query.step"
        size="small"
        @change="changeTimeStep"
        style="margin-right:10px;"
        :disabled="$root.loading"
      >
        <ants-radio-button
          v-for="(item, key) in timeStep"
          :key="key"
          :label="key"
          :text="item"
          :disabled="stepDisabled(key)"
        />
      </el-radio-group>
      <slot />
      <!-- <SelectNode @submit="selectNode" /> -->
    </div>
  </div>
</template>

<script>
// import SelectNode from './SelectNode'

// 查询时间范围
const timeRange = {
  '5m': {
    name: '近5分钟',
    value: 300 * 1000,
    // step: ['30s', '1m']
    step: ['5s']
  },
  '1h': {
    name: '近1小时',
    value: 3600 * 1000,
    // step: ['30s', '1m']
    step: ['1m']
  },
  '6h': {
    name: '近6小时',
    value: 3600 * 1000 * 6,
    step: ['1m', '5m']
  },
  '24h': {
    name: '近24小时',
    value: 3600 * 1000 * 24,
    step: ['5m', '1h']
  },
  '7d': {
    name: '近7天',
    value: 3600 * 1000 * 24 * 7,
    step: ['1h', '1d']
  // },
  // '30d': {
  //   label: '近30天',
  //   step: '24h',
  //   stepVal: 60 * 60 * 24,
  //   unit: '天'
  }
}

// 查询粒度
const timeStep = {
  // '30s': '30秒钟',
  '5s': '5秒',
  '1m': '1分钟',
  '5m': '5分钟',
  '1h': '1小时'
}

export default {
  components: {
    // SelectNode
  },
  data() {
    return {
      pickerMyOptions: {
        disabledDate: (nowtime) => {
          // 禁用当前时间之后的时间选项
          return nowtime.getTime() > Date.now()
        }
      },
      // 自定义时间范围绑定值
      timePicker: [
        // 初始时间范围 为 近1小时
        new Date().setTime(new Date().getTime() - 3600 * 1000 * 1),
        new Date().getTime()
      ],
      loading: false,

      timeRange,
      timeStep,
      // 查询
      query: {
        // 开始时间
        gte: '5m',
        // 结束时间
        lte: null,
        // 粒度
        step: '5s',
        // 节点列表
        nodes: []
      }
    }
  },
  computed: {
    // 粒度是否可选
    stepDisabled() {
      return (step) => {
        if (!timeRange[this.query.gte]) return true
        const stepArr = timeRange[this.query.gte].step
        return stepArr.indexOf(step) === -1
      }
    }
  },
  created() {},
  mounted() {},
  methods: {
    // 选择节点, 并查询数据
    selectNode(nodes = []) {
      this.query.nodes = nodes
      // 查询监控数据
      this.queryChart()
    },

    // 点击刷新
    doRefresh() {
      this.loading = true
      // 查询监控数据
      this.queryChart()
      setTimeout(() => {
        this.loading = false
      }, 500)
    },

    // 查询监控数据
    queryChart() {
      // if (!this.query.nodes.length) return this.$msg.error('未选择节点')
      // 查询监控数据
      this.$emit('queryChart', this.query)
    },

    // 切换时间范围
    changeTimeRange(val) {
      // 选择时间范围时，重置时间粒度
      const { step, value } = timeRange[val]
      this.query.step = step[0]
      this.query.lte = null

      // 设置 timePicker
      this.timePicker = [
        new Date().setTime(new Date().getTime() - value),
        new Date().getTime()
      ]

      // 查询监控数据
      this.queryChart()
    },

    // 切换粒度
    changeTimeStep() {
      // 查询监控数据
      this.queryChart()
    },

    // 自定义时间范围，根据时间范围，自动计算时间粒度，保持 60 个点
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
        step = '1d'
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
    }
  }
}
</script>

<style lang="scss">
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
    &.el-range-editor {
    //   width: 270px;
    }
  }

  .query-time-picker {
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
